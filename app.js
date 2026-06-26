let activeDeck = [];
let incorrectDeck = [];
let currentIndex = 0;
let redactMode = true;
let shuffleMode = false;
let currentPhase = 1;

function toggleRedact() {
    redactMode = !redactMode;
    document.getElementById('redactBtn').innerText = redactMode ? "Redact: ON" : "Redact: OFF";
    if (document.getElementById("flashcard-screen").style.display === "block") {
        loadQuestion(currentIndex);
    }
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    document.getElementById('shuffleBtn').innerText = shuffleMode ? "Shuffle: ON" : "Shuffle: OFF";
}

// Fisher-Yates shuffle engine
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startDeck(deckName) {
    activeDeck = JSON.parse(JSON.stringify(decks[deckName]));
    if (shuffleMode) {
        activeDeck = shuffleArray(activeDeck);
    }
    setupInitialRun();
}

function startCombinedDeck() {
    activeDeck = [...JSON.parse(JSON.stringify(decks.set1)), ...JSON.parse(JSON.stringify(decks.set2))];
    if (shuffleMode) {
        activeDeck = shuffleArray(activeDeck);
    }
    setupInitialRun();
}

function setupInitialRun() {
    currentPhase = 1;
    incorrectDeck = [];
    activeDeck.forEach(card => card.userEvaluation = null);
    document.getElementById("completion-screen").style.display = "none";
    setupDeckDisplay();
}

function setupDeckDisplay() {
    currentIndex = 0;
    document.getElementById("menu-screen").style.display = "none";
    document.getElementById("flashcard-screen").style.display = "block";
    document.getElementById("backBtn").style.visibility = "visible";
    loadQuestion(currentIndex);
}

function showMenu() {
    document.getElementById("flashcard-screen").style.display = "none";
    document.getElementById("completion-screen").style.display = "none";
    document.getElementById("menu-screen").style.display = "block";
    document.getElementById("backBtn").style.visibility = "hidden";
}

function loadQuestion(index) {
    let labelText = redactMode ? `Phase ${currentPhase} • Card ${index + 1} of ${activeDeck.length}` : `Card ${index + 1} of ${activeDeck.length}`;
    document.getElementById("progress-tracker").innerText = labelText;
    document.getElementById("question-text").innerText = activeDeck[index].question;
    document.getElementById("answer-text").innerText = activeDeck[index].answer;
    
    const currentCard = activeDeck[index];

    if (redactMode) {
        if (currentCard.revealed) {
            document.getElementById("reveal-btn").style.display = "none";
            document.getElementById("evaluation-block").style.display = "flex";
            document.getElementById("incorrect-btn").style.display = "flex"; 
            document.getElementById("next-btn").disabled = false;
        } else {
            document.getElementById("reveal-btn").style.display = "block";
            document.getElementById("evaluation-block").style.display = "none";
            document.getElementById("incorrect-btn").style.display = "none"; 
            
            if (currentCard.userEvaluation === null) {
                document.getElementById("next-btn").disabled = true;
            } else {
                document.getElementById("next-btn").disabled = false;
            }
        }
    } else {
        document.getElementById("reveal-btn").style.display = "none";
        document.getElementById("evaluation-block").style.display = "flex";
        document.getElementById("incorrect-btn").style.display = "none"; 
        document.getElementById("next-btn").disabled = (index === activeDeck.length - 1);
    }
    
    document.getElementById("prev-btn").disabled = (index === 0);
}

function revealAnswer() {
    activeDeck[currentIndex].revealed = true;
    loadQuestion(currentIndex);
}

function handleNextClick() {
    if (redactMode && activeDeck[currentIndex].revealed && activeDeck[currentIndex].userEvaluation === null) {
        markValidation(true);
    } else {
        changeQuestion(1);
    }
}

function markValidation(isCorrect) {
    const currentCard = activeDeck[currentIndex];
    currentCard.userEvaluation = isCorrect;
    
    if (currentIndex === activeDeck.length - 1) {
        evaluatePhaseCompletion();
    } else {
        changeQuestion(1);
    }
}

function evaluatePhaseCompletion() {
    incorrectDeck = activeDeck.filter(card => card.userEvaluation === false);
    
    if (incorrectDeck.length > 0) {
        activeDeck = incorrectDeck.map(card => {
            return { question: card.question, answer: card.answer, revealed: false, userEvaluation: null };
        });
        if (shuffleMode) {
            activeDeck = shuffleArray(activeDeck);
        }
        currentPhase++;
        setupDeckDisplay();
    } else {
        document.getElementById("flashcard-screen").style.display = "none";
        document.getElementById("completion-screen").style.display = "block";
    }
}

function changeQuestion(dir) { 
    currentIndex += dir; 
    loadQuestion(currentIndex); 
}

