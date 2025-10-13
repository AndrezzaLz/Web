// js/jogoYASH.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const gameBoard = document.querySelector('.game-board');
    const boardConfigDisplay = document.querySelector('.board-config');
    const movesDisplay = document.querySelector('.moves');
    const timerDisplay = document.querySelector('.timer'); // Elemento do timer

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let pairsFound = 0;
    let totalPairs = 0;

    // --- VARIÁVEIS DO CRONÔMETRO ---
    let timerInterval = null; // Guardará a referência do setInterval
    let totalTimeInSeconds = 0;
    let gameMode = 'classico'; // Padrão

    const frutas = [
        '🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥',
        '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
        '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥨',
        '🧀', '🥚', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖'
    ];

    // --- FUNÇÕES DE CONFIGURAÇÃO E INICIALIZAÇÃO ---

    function getGameSettings() {
        const params = new URLSearchParams(window.location.search);
        const sizeParam = params.get('tamanho_tabuleiro') || '4x4';
        gameMode = params.get('modo_jogo') || 'classico';

        boardConfigDisplay.textContent = sizeParam;

        const size = parseInt(sizeParam.split('x')[0]);
        totalPairs = (size * size) / 2;

        // Define o tempo inicial para o modo 'contra_tempo'
        if (gameMode === 'contra_tempo') {
            switch (sizeParam) {
                case '2x2': totalTimeInSeconds = 60; break;  // 1 minuto
                case '4x4': totalTimeInSeconds = 120; break; // 2 minutos
                case '6x6': totalTimeInSeconds = 180; break; // 3 minutos
                case '8x8': totalTimeInSeconds = 240; break; // 4 minutos
                default: totalTimeInSeconds = 120; // Padrão
            }
        }
    }

    function createBoard() {
        const size = Math.sqrt(totalPairs * 2);
        const emojiPairs = frutas.slice(0, totalPairs).concat(frutas.slice(0, totalPairs));
        emojiPairs.sort(() => Math.random() - 0.5);

        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${size}, auto)`;
        gameBoard.style.gridTemplateRows = `repeat(${size}, auto)`;

        emojiPairs.forEach(emoji => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji;
            card.innerHTML = `
                <div class="face front"></div>
                <div class="face back">${emoji}</div>
            `;
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    // --- FUNÇÕES DO CRONÔMETRO ---

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval); // Limpa qualquer timer anterior

        if (gameMode === 'classico') {
            totalTimeInSeconds = 0;
            timerInterval = setInterval(tickUp, 1000);
        } else if (gameMode === 'contra_tempo') {
            timerInterval = setInterval(tickDown, 1000);
        }
        updateTimerDisplay();
    }

    function tickUp() {
        totalTimeInSeconds++;
        updateTimerDisplay();
    }

    function tickDown() {
        totalTimeInSeconds--;
        updateTimerDisplay();
        if (totalTimeInSeconds <= 0) {
            endGame(false); // O jogador perdeu
        }
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(totalTimeInSeconds / 60);
        const seconds = totalTimeInSeconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- FUNÇÕES DE LÓGICA DO JOGO ---

    function flipCard() {
        if (lockBoard || this === firstCard) return;
        this.classList.add('flip');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        incrementMoves();
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        pairsFound++;
        // Verifica se o jogo acabou
        if (pairsFound === totalPairs) {
            endGame(true); // O jogador venceu
        }

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetBoard();
        }, 1200);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    function incrementMoves() {
        moves++;
        movesDisplay.textContent = moves;
    }

    function endGame(didWin) {
        stopTimer();
        lockBoard = true; // Bloqueia o tabuleiro para não haver mais jogadas

        // Adiciona um delay para que o jogador veja a última carta virar
        setTimeout(() => {
            if (didWin) {
                alert('Parabéns, você venceu!');
            } else {
                alert('Fim de jogo! O tempo acabou.');
            }
        }, 500);
    }

    // --- INICIALIZAÇÃO DO JOGO ---
    function init() {
        getGameSettings();
        createBoard();
        startTimer();
    }

    init();
});