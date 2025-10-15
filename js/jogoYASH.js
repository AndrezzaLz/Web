// js/jogoYASH.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const gameBoard = document.querySelector('.game-board');
    const boardConfigDisplay = document.querySelector('.board-config');
    const movesDisplay = document.querySelector('.moves');
    const timerDisplay = document.querySelector('.timer');
    const classicModeBtn = document.querySelector('.mode-toggle .mode-btn:nth-child(1)');
    const timeTrialBtn = document.querySelector('.mode-toggle .mode-btn:nth-child(2)');
    
    // --- NOVO: Botões de Trapaça ---
    const activateCheatBtn = document.querySelector('.cheat-button.on');
    const deactivateCheatBtn = document.querySelector('.cheat-button.off');

    const endGameModal = document.querySelector('#endGameModal');
    const modalTitle = document.querySelector('#modalTitle');
    const modalMessage = document.querySelector('#modalMessage');
    const playAgainBtn = document.querySelector('#playAgainBtn');

    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let pairsFound = 0;
    let totalPairs = 0;

    // --- VARIÁVEIS DO CONFIGURACOES ---
    let timerInterval = null;
    let totalTimeInSeconds = 0;
    let gameMode = 'classico';
    let cardTheme = 'frutas';

    const frutas = [
        '🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥',
        '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️',
        '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥨',
        '🧀', '🥚', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖'
    ];

    const taylorSwiftImages = [
        'img/jogotay/1989.png', 'img/jogotay/1989tv.png', 'img/jogotay/apeak(2).png', 'img/jogotay/apeak.png',
        'img/jogotay/eras.png', 'img/jogotay/evermore.png', 'img/jogotay/fearless.png', 'img/jogotay/folklore.png',
        'img/jogotay/louro.png', 'img/jogotay/loverset.png', 'img/jogotay/midnights.png', 'img/jogotay/movie.png',
        'img/jogotay/palco.png', 'img/jogotay/paula.png', 'img/jogotay/piano.png', 'img/jogotay/red.png',
        'img/jogotay/redtv.png', 'img/jogotay/reputacion.png', 'img/jogotay/Showgirl.png', 'img/jogotay/speaknow.png',
        'img/jogotay/speaknowtv.png', 'img/jogotay/taybrina.png', 'img/jogotay/tayed.png', 'img/jogotay/tayflorence.png',
        'img/jogotay/TTPD.png', 'img/jogotay/TTPD2.png', 'img/jogotay/debut.png', 'img/jogotay/fearlesstv.png', 
        'img/jogotay/friendship.png', 'img/jogotay/hands.png', 'img/jogotay/lover-album.png', 'img/jogotay/mirrorball.png', 
    ]

    let contentSource = [];

    // --- FUNÇÕES DE CONFIGURAÇÃO E INICIALIZAÇÃO ---

    function getGameSettings() {
        const params = new URLSearchParams(window.location.search);
        const sizeParam = params.get('tamanho_tabuleiro') || '4x4';
        gameMode = params.get('modo_jogo') || 'classico';
        cardTheme = params.get('card_theme') || 'frutas';

        if (cardTheme === 'taylor_swift') {
            contentSource = taylorSwiftImages;
        } else {
            contentSource = frutas;
        }

        boardConfigDisplay.textContent = sizeParam;
        const size = parseInt(sizeParam.split('x')[0]);
        totalPairs = (size * size) / 2;
        
        if (gameMode === 'contra_tempo') {
            classicModeBtn.classList.remove('active');
            timeTrialBtn.classList.add('active');

            switch (sizeParam) {
                case '2x2': totalTimeInSeconds = 60; break;
                case '4x4': totalTimeInSeconds = 120; break;
                case '6x6': totalTimeInSeconds = 180; break;
                case '8x8': totalTimeInSeconds = 240; break;
                default: totalTimeInSeconds = 120;
            }
        } else {
            classicModeBtn.classList.add('active');
            timeTrialBtn.classList.remove('active');
        }
    }

    function createBoard() {
        const size = Math.sqrt(totalPairs * 2);

        const contentPairs = contentSource.slice(0, totalPairs).concat(contentSource.slice(0, totalPairs));
        contentPairs.sort(() => Math.random() - 0.5);
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${size}, auto)`;
        gameBoard.style.gridTemplateRows = `repeat(${size}, auto)`;

        contentPairs.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = item;

            const backContent = cardTheme === 'taylor_swift'
                ? `<img src="${item}" alt="Imagem do Jogo">`
                : item;

            card.innerHTML = `
                <div class="face front"></div>
                <div class="face back">${backContent}</div>
            `;

            if (cardTheme === 'taylor_swift') {
                const frontFace = card.querySelector('.front');
                frontFace.style.backgroundImage = "url('img/jogotay/carta.png')"
                frontFace.style.backgroundSize = "cover";
                frontFace.style.backgroundPosition = "center";
            }

            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    // --- FUNÇÕES DO CRONÔMETRO ---

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);

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
            endGame(false);
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
        const isMatch = firstCard.dataset.value === secondCard.dataset.value;
        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        // --- MODIFICADO: Adiciona a classe .matched ---
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        pairsFound++;
        if (pairsFound === totalPairs) {
            endGame(true);
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
        lockBoard = true;

        // Adiciona um delay para o jogador ver a última carta virar
        setTimeout(() => {
            if (didWin) {
                modalTitle.textContent = 'Parabéns, Você Venceu!';
                modalMessage.textContent = `Você encontrou todos os pares em ${moves} jogadas.`;
            } else {
                modalTitle.textContent = 'Fim de Jogo!';
                modalMessage.textContent = 'O tempo acabou. Tente novamente!';
            }
            endGameModal.classList.add('show'); // Mostra o pop-up
        }, 700); //Aumentei um pouco o tempo para dar tempo da animação da carta
    }

    // --- NOVO: Funções de Trapaça ---

    function activateCheat() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.classList.add('flip');
        });
    }

    function deactivateCheat() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            // Só vira de volta as cartas que ainda não foram combinadas
            if (!card.classList.contains('matched')) {
                card.classList.remove('flip');
            }
        });
    }


    // --- INICIALIZAÇÃO DO JOGO ---
    function init() {
        getGameSettings();
        createBoard();
        startTimer();

        // --- NOVO: Event Listeners para os botões de trapaça ---
        activateCheatBtn.addEventListener('click', activateCheat);
        deactivateCheatBtn.addEventListener('click', deactivateCheat);

        playAgainBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Impede que o link '#' recarregue a página de forma padrão
            window.location.reload(); // Recarrega a página com os mesmos parâmetros
        });
    }

    init();
});