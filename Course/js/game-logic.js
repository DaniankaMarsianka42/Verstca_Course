/* 
 * Логика игры "Переливания"
 * Генерация уровней, решение головоломки, игровая механика
 */

// BFS-решатель для проверки возможности решения
function solveWaterJug(capacities, target) {
    const queue = [];
    const visited = new Set();
    const startState = capacities.map((cap, i) => i === 0 ? cap : 0);
    queue.push({ state: startState, steps: 0 });
    visited.add(startState.join(','));

    while (queue.length > 0) {
        const { state, steps } = queue.shift();
        if (state.some(amount => amount === target)) return true;

        for (let from = 0; from < capacities.length; from++) {
            for (let to = 0; to < capacities.length; to++) {
                if (from === to || state[from] === 0 || state[to] === capacities[to]) continue;
                const newState = [...state];
                const pour = Math.min(newState[from], capacities[to] - newState[to]);
                newState[from] -= pour;
                newState[to] += pour;
                const stateKey = newState.join(',');
                if (!visited.has(stateKey)) {
                    visited.add(stateKey);
                    queue.push({ state: newState, steps: steps + 1 });
                }
            }
        }
    }
    return false;
}

// Генератор решаемых уровней
function generateLevel(levelNum, difficulty = 1) {
    const difficultyMultiplier = difficulty;
    const minCap = 3 + Math.floor(levelNum / 2) * difficultyMultiplier;
    const maxCap = 7 + levelNum * difficultyMultiplier;
    const jugCount = Math.min(2 + Math.floor(levelNum / 2), 4);
    
    let attempts = 0;
    let jugsConfig, target;
    
    while (attempts < 100) {
        attempts++;
        const capacities = [];
        for(let i = 0; i < jugCount; i++) {
            capacities.push(Math.floor(Math.random() * (maxCap - minCap + 1)) + minCap);
        }
        target = Math.floor(Math.random() * Math.max(...capacities)) + 1;
        
        if (solveWaterJug(capacities, target)) {
            jugsConfig = capacities.map((cap, i) => ({ 
                capacity: cap, 
                current: i === 0 ? cap : 0,
                id: i 
            }));
            console.log(`✅ Уровень ${levelNum} (попытка ${attempts}):`, 
                       jugsConfig.map(j=>`${j.current}/${j.capacity}`).join(', '), 
                       `→ ${target}л`);
            break;
        }
    }
    
    if (attempts >= 100) {
        console.error('❌ Fallback на классику 5-3→4');
        jugsConfig = [{capacity: 5, current: 5, id: 0}, {capacity: 3, current: 0, id: 1}];
        target = 4;
    }
    
    const timeLimit = Math.max(20, 120 - (levelNum * 8 * difficultyMultiplier));
    return { jugs: jugsConfig, target, timeLimit };
}

// Начать игру
function startGame(name) {
    STATE.username = name;
    STATE.score = 0;
    STATE.level = 1;
    document.getElementById('player-name-display').textContent = name;
    startLevel();
    showScreen('game');
    playSound('click');
}

// Начать уровень
function startLevel() {
    const levelData = generateLevel(STATE.level, STATE.difficulty);
    STATE.jugs = levelData.jugs;
    STATE.targetAmount = levelData.target;
    STATE.timeRemaining = levelData.timeLimit;
    STATE.selectedJugIndex = null;
    STATE.isGameActive = true;

    let instruction = "🎯 Уровень 1: Кликните сосуд → кликните другой (перелить)";
    if(STATE.level === 2) instruction = "🖱️ Уровень 2: Перетаскивайте сосуды (Drag & Drop)";
    if(STATE.level >= 3) instruction = "⌨️ Уровень 3+: 1-4 клавиши, ПКМ=меню";
    
    document.getElementById('level-instruction').textContent = instruction;
    renderJugs();
    updateHUD();
    startTimer();
    
    // Анимация появления сосудов
    document.querySelectorAll('.jug').forEach((jug, i) => {
        jug.style.transform = 'translateY(100px)';
        jug.style.opacity = '0';
        setTimeout(() => {
            jug.style.transition = 'all 0.5s ease-out';
            jug.style.transform = 'translateY(0)';
            jug.style.opacity = '1';
        }, i * 100);
    });
    
    // Обновление визуальной цели
    document.getElementById('target-visual').textContent = STATE.targetAmount;
    
    // Сброс прогресса
    document.getElementById('level-progress').style.width = '0%';
}

// Запустить таймер
function startTimer() {
    clearInterval(STATE.timerInterval);
    const interval = STATE.level > 3 ? 800 : 1000;
    STATE.timerInterval = setInterval(() => {
        if(!STATE.isGameActive) return;
        STATE.timeRemaining--;
        updateHUD();
        
        // Обновление прогресса
        const initialTime = Math.max(20, 120 - (STATE.level * 8 * STATE.difficulty));
        const progress = ((initialTime - STATE.timeRemaining) / initialTime) * 100;
        document.getElementById('level-progress').style.width = `${Math.min(100, progress)}%`;
        
        // Мигание таймера при малом времени
        if (STATE.timeRemaining <= 10) {
            document.querySelector('.timer').style.animation = STATE.timeRemaining % 2 === 0 ? 
                'pulse 0.5s infinite' : 'none';
        }
        
        if(STATE.timeRemaining <= 0) endGame(false, "⏰ Время вышло!");
    }, interval);
}

// Перелить воду
function pourWater(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const fromJug = STATE.jugs[fromIndex];
    const toJug = STATE.jugs[toIndex];
    if (fromJug.current === 0 || toJug.current === toJug.capacity) return;

    const availableSpace = toJug.capacity - toJug.current;
    const amountToPour = Math.min(fromJug.current, availableSpace);
    fromJug.current -= amountToPour;
    toJug.current += amountToPour;
    
    // Анимация переливания
    animateWaterPour(fromIndex, toIndex, amountToPour);
    playSound('pour');
    
    // Вибрация (если поддерживается)
    if (navigator.vibrate) navigator.vibrate(50);
    
    renderJugs();
    checkWinCondition();
}

// Опустошить сосуд
function emptyJug(index) {
    if(STATE.jugs[index].current > 0) {
        STATE.jugs[index].current = 0;
        STATE.score = Math.max(0, STATE.score - 50);
        renderJugs();
        updateHUD();
        playSound('click');
    }
}

// Проверка условия победы
function checkWinCondition() {
    if (STATE.jugs.some(j => j.current === STATE.targetAmount)) {
        clearInterval(STATE.timerInterval);
        const bonus = STATE.timeRemaining * 10;
        STATE.score += 100 + bonus;
        
        // Анимация победы
        const winningJugIndex = STATE.jugs.findIndex(j => j.current === STATE.targetAmount);
        const winningJug = document.getElementById(`jug-${winningJugIndex}`);
        if (winningJug) {
            winningJug.style.boxShadow = '0 0 20px #ffd700';
            winningJug.style.animation = 'float 2s ease-in-out';
        }
        
        playSound('win');
        
        setTimeout(() => {
            showModal(
                `🎉 Уровень ${STATE.level} пройден!`,
                `Бонус за время: +${bonus} очков<br>Всего очков: ${STATE.score}<br><br>Переход к уровню ${STATE.level + 1}`
            );
            setTimeout(() => {
                STATE.level++;
                startLevel();
            }, 2000);
        }, 500);
    }
}

// Завершить игру
function endGame(saved, reason) {
    STATE.isGameActive = false;
    clearInterval(STATE.timerInterval);
    
    // Увеличить счетчик игр
    const totalGames = parseInt(localStorage.getItem('total_games') || 0);
    localStorage.setItem('total_games', totalGames + 1);
    
    if(!saved) showModal('Игра завершена', reason);
    saveResult(STATE.username, STATE.score, STATE.level);
    showLeaderboard();
    showScreen('results');
}