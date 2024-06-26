const RANDOM_QUOTE_API_URL = 'https://api.quotable.io/random';
const quoteDisplayElement = document.getElementById('quoteDisplay');
const quoteInputElement = document.getElementById('quoteInput');
const wpmElement = document.getElementById('wpm');
const quoteTimerElement = document.getElementById('quoteTimer');
const countdownTimerElement = document.getElementById('countdownTimer');

let isCountdownRunning = false;

quoteInputElement.addEventListener('input', () => {
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');

    let correct = true;
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index];
        if (character == null) {
            characterSpan.classList.remove('correct');
            characterSpan.classList.remove('incorrect');
            correct = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct');
            characterSpan.classList.remove('incorrect');
        } else {
            characterSpan.classList.add('incorrect');
            characterSpan.classList.remove('correct');
            correct = false;
        }
    });

    if (correct) handleWin();
});

document.querySelector('.keyboard').addEventListener('click', (event) => {
    if (event.target.matches('.keyboard li')) {
        const button = event.target;
        console.log(`Button clicked: ${button.innerText}`);
        const key = button.innerText;
        const event = new KeyboardEvent('keydown', {
            key: key
        });
        document.dispatchEvent(event);
    }
});

document.addEventListener('keydown', (event) => {
    if (isCountdownRunning) {
        event.preventDefault();
        return;
    }

    console.log('Keydown event:', event.key);
    const keyPressed = event.key;
    const keyElement = document.getElementById(keyPressed);
    if (keyElement) {
        keyElement.classList.add('pressed');
        setTimeout(() => {
            keyElement.classList.remove('pressed');
        }, 100);
    }
});

quoteInputElement.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
    }
});

function getRandomQuote() {
    return fetch(RANDOM_QUOTE_API_URL)
        .then(response => response.json())
        .then(data => data.content);
}

async function renderNewQuote() {
    const quote = await getRandomQuote();
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    quoteInputElement.value = '';
}

let startTime;

function getTimerTime() {
    return (new Date() - startTime) / 1000;
}

function startCountdown() {
    isCountdownRunning = true;
    let count = 3;
    countdownTimerElement.innerText = count;
    countdownTimerElement.style.visibility = 'visible';
    renderNewQuote();
    const countdownInterval = setInterval(() => {
        count--;
        countdownTimerElement.innerText = count;
        if (count === 0) {
            isCountdownRunning = false;
            wpmElement.style.visibility = 'visible';
            quoteTimerElement.style.visibility = 'visible';
            clearInterval(countdownInterval);
            countdownTimerElement.innerText = '';
            startNewQuote();
        }
    }, 1000);
}

function startNewQuote() {
    document.getElementById('nextQuoteBtn').classList.add('hidden');
    startTime = new Date();
    quoteTimerElement.innerText = 0;
    setInterval(() => {
        quoteTimerElement.innerText = getTimerTime();
        updateWPM();
    }, 10);
}

function openPopup(statistics) {
    const popup = document.getElementById('popup');
    const statisticsElement = document.getElementById('statistics');
    statisticsElement.innerText = statistics;
    popup.style.display = 'block';
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

let highScore = localStorage.getItem('highScore') || 0;
function handleWin() {
    
    const elapsedTime = getTimerTime();
    const wordCount = quoteInputElement.value.trim().split(/\s+/).length;
    const wpm = Math.round((wordCount / elapsedTime) * 60);
    if (wpm > highScore) {
        highScore = wpm;
        localStorage.setItem('highScore', highScore);
    }
    const statistics = `Time: ${elapsedTime.toFixed(2)} seconds\nWords: ${wordCount}\nWPM: ${wpm}\nHigh Score: ${highScore} wpm`;
    openPopup(statistics);
    document.getElementById('nextQuoteBtn').classList.remove('hidden');
    hideQuoteTimer();
}

document.getElementById('nextQuoteBtn').addEventListener('click', () => {
    startCountdown();
});

function updateQuoteTimer() {
    const elapsedTime = getTimerTime();
    quoteTimerElement.innerText = elapsedTime.toFixed(2);
}

function hideQuoteTimer() {
    quoteTimerElement.style.visibility = 'hidden';
    wpmElement.style.visibility = 'hidden';
}

function updateWPM() {
    const elapsedTimeInMinutes = getTimerTime() / 60;
    const wordCount = quoteInputElement.value.trim().split(/\s+/).length;
    const wordsPerMinute = Math.round(wordCount / elapsedTimeInMinutes);
    wpmElement.innerText = wordsPerMinute;
}

function startGame() {
    window.location.href = "game.html";
    startCountdown();
}