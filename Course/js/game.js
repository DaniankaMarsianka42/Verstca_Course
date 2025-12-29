// Логика для страницы игры

// Глобальное состояние для этой страницы
const GAME_STATE = {
    username: '',
    level: 1,
    score: 0,
    difficulty: 1,
    timeRemaining: 0,
    timerInterval: null,
    jugs: [],
    targetAmount: 0,
    selectedJugIndex: null,
    isGameActive: false,
    soundEnabled: true
};

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные из localStorage
    loadGameData();
    
    // Настройка звука
    setupSoundControls();
    
    // Запускаем уровень
    startLevel();
    
    // Настройка обработчиков событий
    setupGameEventHandlers();
});

function loadGameData() {
    GAME_STATE.username = localStorage.getItem('game_username') || 'Игрок';
    GAME_STATE.level = parseInt(localStorage.getItem('game_level') || '1');
    GAME_STATE.score = parseInt(localStorage.getItem('game_score') || '0');
    GAME_STATE.difficulty = parseInt(localStorage.getItem('game_difficulty') || '1');
    
    // Отображаем имя игрока
    document.getElementById('player-name-display').textContent = GAME_STATE.username;
}

function setupGameEventHandlers() {
    // Кнопка отмены игры
    document.getElementById('abort-game-btn').onclick = () => {
        if(confirm('Завершить игру и сохранить результат?')) {
            endGame(true, null);
        }
    };
    
    // Кнопка перезапуска уровня
    document.getElementById('restart-level-btn').onclick = () => {
        GAME_STATE.score = Math.max(0, GAME_STATE.score - 20);
        playSound('click');
        startLevel();
    };
    
    // Модальное окно
    document.getElementById('modal-close').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };
    
    // Контекстное меню
    document.getElementById('ctx-empty').onclick = () => {
        if(window.ctxTargetIndex !== null) emptyJug(window.ctxTargetIndex);
        document.getElementById('context-menu').style.display = 'none';
        playSound('click');
    };
    
    document.getElementById('ctx-shake').onclick = () => {
        if(window.ctxTargetIndex !== null) shakeJug(window.ctxTargetIndex);
        document.getElementById('context-menu').style.display = 'none';
        playSound('click');
    };
    
    document.getElementById('ctx-info').onclick = () => {
        if(window.ctxTargetIndex !== null) showJugInfo(window.ctxTargetIndex);
        document.getElementById('context-menu').style.display = 'none';
        playSound('click');
    };
    
    // Скрытие контекстного меню при клике вне его
    document.addEventListener('click', () => {
        if (document.getElementById('context-menu').style.display === 'block') {
            document.getElementById('context-menu').style.display = 'none';
        }
    });
}

// Остальные функции (startLevel, playSound, etc.) будут в game-logic.js
// и будут использовать GAME_STATE вместо STATE