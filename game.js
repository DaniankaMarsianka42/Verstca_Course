const STATE = {
    username: localStorage.getItem('playerName') || 'Игрок',
    level: 1,
    score: 0,
    timeRemaining: 0,
    timerInterval: null,
    jugs: [],
    targetAmount: 0,
    selectedJugIndex: null,
    isGameActive: false
};

const DB_KEY = 'water_pouring_leaderboard';

// BFS-решатель (без изменений)
function solveWaterJug(capacities, target) {
    const queue = [];
    const visited = new Set();
    const startState = capacities.map((cap, i) => i === 0 ? cap : 0);
    queue.push({ state: startState });
    visited.add(startState.join(','));

    while (queue.length > 0) {
        const { state } = queue.shift();
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
                    queue.push({ state: newState });
                }
            }
        }
    }
    return false;
}

// Генератор уровней (без изменений)
function generateLevel(levelNum) {
    const minCap = 3 + Math.floor(levelNum / 2);
    const maxCap = 7 + levelNum;
    const jugCount = Math.min(2 + Math.floor(levelNum / 2), 4);
    
    let attempts = 0;
    let jugsConfig, target;
    
    while (attempts < 100) {
        attempts++;
        const capacities = Array(jugCount).fill(0).map(() => 
            Math.floor(Math.random() * (maxCap - minCap + 1)) + minCap
        );
        target = Math.floor(Math.random() * Math.max(...capacities)) + 1;
        
        if (solveWaterJug(capacities, target)) {
            jugsConfig = capacities.map((cap, i) => ({
                capacity: cap,
                current: i === 0 ? cap : 0,
                id: i
            }));
            console.log(`✅ Уровень ${levelNum}:`, jugsConfig.map(j=>`${j.current}/${j.capacity}`).join(', '), `→ ${target}л`);
            break;
        }
    }
    
    if (!jugsConfig) {
        jugsConfig = [{capacity: 5, current: 5, id: 0}, {capacity: 3, current: 0, id: 1}];
        target = 4;
    }
    
    return {
        jugs: jugsConfig,
        target,
        timeLimit: Math.max(30, 120 - (levelNum * 8))
    };
}

// UI функции (без изменений)
function updateHUD() {
    document.getElementById('player-name').textContent = STATE.username;
    document.getElementById('level-display').textContent = STATE.level;
    document.getElementById('score-display').textContent = STATE.score;
    document.getElementById('time-display').textContent = STATE.timeRemaining;
    document.getElementById('target-display').textContent = STATE.targetAmount;
}

function renderJugs() {
    const container = document.getElementById('game-area');
    container.innerHTML = '';
    
    STATE.jugs.forEach((jug, index) => {
        const jugContainer = document.createElement('div');
        jugContainer.className = 'jug-container';
        
        const heightPx = Math.min(180 + (jug.capacity * 12), 240);
        const waterPercent = (jug.current / jug.capacity) * 100;
        
        jugContainer.innerHTML = `
            <div class="jug" id="jug-${index}" 
                 style="height: ${heightPx}px;"
                 draggable="${STATE.level > 1}">
                <div class="water" style="height: ${waterPercent}%"></div>
            </div>
            <div class="jug-info">${jug.current}/${jug.capacity}</div>
        `;
        
        bindJugEvents(jugContainer.querySelector('.jug'), index);
        container.appendChild(jugContainer);
    });
}

// ✅ ИСПРАВЛЕННЫЕ ИНСТРУКЦИИ
function startLevel() {
    const levelData = generateLevel(STATE.level);
    STATE.jugs = levelData.jugs;
    STATE.targetAmount = levelData.target;
    STATE.timeRemaining = levelData.timeLimit;
    STATE.selectedJugIndex = null;
    STATE.isGameActive = true;

    // ✅ НОВЫЕ ИНСТРУКЦИИ
    const instructions = [
        "🎯 Уровень 1: Только клики (сосуд → сосуд)",
        "🖱️ Уровень 2: Только Drag & Drop", 
        "✨ Уровень 3+: ВСЕ способы! Клик/Drag/ПКМ/1-4"
    ];
    
    document.getElementById('level-instruction').textContent = 
        instructions[Math.min(STATE.level - 1, 2)];
    
    renderJugs();
    updateHUD();
    startTimer();
}

// Остальные функции без изменений (startTimer, pourWater, emptyJug, checkWinCondition, endGame)
function startTimer() {
    clearInterval(STATE.timerInterval);
    const interval = STATE.level > 3 ? 800 : 1000;
    STATE.timerInterval = setInterval(() => {
        if (!STATE.isGameActive) return;
        STATE.timeRemaining--;
        updateHUD();
        if (STATE.timeRemaining <= 0) {
            endGame(false, "⏰ Время вышло!");
        }
    }, interval);
}

function pourWater(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    const fromJug = STATE.jugs[fromIndex];
    const toJug = STATE.jugs[toIndex];
    if (fromJug.current === 0 || toJug.current === toJug.capacity) return;
    const space = toJug.capacity - toJug.current;
    const pourAmount = Math.min(fromJug.current, space);
    fromJug.current -= pourAmount;
    toJug.current += pourAmount;
    renderJugs();
    checkWinCondition();
}

function emptyJug(index) {
    if (STATE.jugs[index].current > 0) {
        STATE.jugs[index].current = 0;
        STATE.score = Math.max(0, STATE.score - 50);
        renderJugs();
        updateHUD();
    }
}

function checkWinCondition() {
    if (STATE.jugs.some(jug => jug.current === STATE.targetAmount)) {
        clearInterval(STATE.timerInterval);
        const bonus = STATE.timeRemaining * 10;
        STATE.score += 100 + bonus;
        setTimeout(() => {
            alert(`🎉 Уровень ${STATE.level} пройден!\n💰 Бонус: +${bonus}\n⭐ Всего: ${STATE.score}`);
            STATE.level++;
            startLevel();
        }, 500);
    }
}

function endGame(saved, reason) {
    STATE.isGameActive = false;
    clearInterval(STATE.timerInterval);
    if (!saved) alert(reason || "Игра окончена");
    saveResult(STATE.username, STATE.score);
    window.location.href = 'leaderboard.html';
}

// ✅ ИСПРАВЛЕННЫЕ СОБЫТИЯ (все способы на 3+)
function bindJugEvents(jugElement, index) {
    // 1. КЛИК (уровни 1, 3+)
    jugElement.onclick = () => {
        if (STATE.level === 2) return; // Только уровень 2 = чистый Drag&Drop
        
        if (STATE.selectedJugIndex === null) {
            STATE.selectedJugIndex = index;
            jugElement.classList.add('selected');
        } else {
            pourWater(STATE.selectedJugIndex, index);
            document.getElementById(`jug-${STATE.selectedJugIndex}`)?.classList.remove('selected');
            STATE.selectedJugIndex = null;
        }
    };

    // 2. DRAG & DROP (уровень 2 И 3+)
    if (STATE.level >= 2) {  // ✅ ИСПРАВЛЕНО: >=2
        jugElement.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            jugElement.classList.add('dragging');
        };
        
        jugElement.ondragover = (e) => {
            e.preventDefault();
            jugElement.classList.add('drag-over');
        };
        
        jugElement.ondragleave = () => jugElement.classList.remove('drag-over');
        
        jugElement.ondrop = (e) => {
            e.preventDefault();
            jugElement.classList.remove('drag-over');
            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
            document.getElementById(`jug-${fromIdx}`)?.classList.remove('dragging');
            pourWater(fromIdx, index);
        };
    }

    // 3. КОНТЕКСТНОЕ МЕНЮ (уровень 3+)
    if (STATE.level >= 3) {
        jugElement.oncontextmenu = (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, index);
        };
    }
}

let ctxTargetIndex = null;

function showContextMenu(x, y, index) {
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    ctxTargetIndex = index;
}

document.addEventListener('click', () => {
    document.getElementById('context-menu').style.display = 'none';
});

document.getElementById('ctx-empty').onclick = () => {
    if (ctxTargetIndex !== null) emptyJug(ctxTargetIndex);
    document.getElementById('context-menu').style.display = 'none';
};

// Клавиатура (уровень 3+)
document.addEventListener('keydown', (e) => {
    if (!STATE.isGameActive || STATE.level < 3) return;
    const key = parseInt(e.key);
    if (key > 0 && key <= STATE.jugs.length) {
        const jug = document.getElementById(`jug-${key - 1}`);
        if (jug) jug.click();
    }
});

// LocalStorage (без изменений)
function saveResult(name, score) {
    let data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIndex = data.findIndex(item => 
        item.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingIndex !== -1) {
        if (score > data[existingIndex].score) {
            data[existingIndex] = { name, score };
        }
    } else {
        data.push({ name, score });
    }
    
    data.sort((a, b) => b.score - a.score);
    data = data.slice(0, 10);
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('player-name').textContent = STATE.username;
    
    document.getElementById('restart-level-btn').onclick = () => {
        STATE.score = Math.max(0, STATE.score - 20);
        startLevel();
    };
    
    document.getElementById('abort-game-btn').onclick = () => {
        if (confirm('Завершить игру и сохранить результат?')) {
            endGame(true);
        }
    };
    
    startLevel();
});
