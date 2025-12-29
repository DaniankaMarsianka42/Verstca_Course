/* 
 * Обработчики пользовательского интерфейса
 * Рендеринг сосудов, обработка событий
 */

// Показать экран
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`page-${screenName}`).classList.add('active');
}

// Отрисовать сосуды
function renderJugs() {
    const container = document.getElementById('game-area');
    container.innerHTML = '';
    STATE.jugs.forEach((jug, index) => {
        const el = document.createElement('div');
        el.className = 'jug-container';
        const heightPx = 120 + (jug.capacity * 12);
        const waterPercent = (jug.current / jug.capacity) * 100;

        el.innerHTML = `
            <div class="jug" id="jug-${index}" style="height: ${heightPx}px;" 
                 draggable="${STATE.level > 1 ? 'true' : 'false'}" 
                 data-index="${index}">
                <div class="water" style="height: ${waterPercent}%;"></div>
            </div>
            <div class="jug-info">${jug.current}/${jug.capacity}</div>
        `;
        bindJugEvents(el.querySelector('.jug'), index);
        container.appendChild(el);
    });
}

// Обновить HUD
function updateHUD() {
    document.getElementById('level-display').textContent = STATE.level;
    document.getElementById('score-display').textContent = STATE.score;
    document.getElementById('time-display').textContent = STATE.timeRemaining;
    document.getElementById('target-display').textContent = STATE.targetAmount;
}

// Привязать события к сосуду
function bindJugEvents(element, index) {
    // Клик
    element.onclick = (e) => {
        if (STATE.level === 2) return;
        if (STATE.selectedJugIndex === null) {
            STATE.selectedJugIndex = index;
            element.classList.add('selected');
            playSound('click');
        } else {
            pourWater(STATE.selectedJugIndex, index);
            document.getElementById(`jug-${STATE.selectedJugIndex}`)?.classList.remove('selected');
            STATE.selectedJugIndex = null;
        }
    };

    // Двойной клик (новое событие)
    element.ondblclick = (e) => {
        if (STATE.level >= 3) {
            emptyJug(index);
        }
    };

    // Наведение (новое событие)
    element.onmouseenter = (e) => {
        if (STATE.level >= 2) {
            element.style.transform = 'translateY(-10px) scale(1.05)';
        }
    };
    
    element.onmouseleave = (e) => {
        if (STATE.level >= 2 && !element.classList.contains('dragging')) {
            element.style.transform = 'translateY(0) scale(1)';
        }
    };

    // Drag & Drop (уровень 2)
    if (STATE.level === 2) {
        element.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", index);
            element.classList.add('dragging');
            playSound('click');
        };
        element.ondragover = (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        };
        element.ondragleave = (e) => element.classList.remove('drag-over');
        element.ondrop = (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            const fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
            document.getElementById(`jug-${fromIdx}`)?.classList.remove('dragging');
            pourWater(fromIdx, index);
        };
    }

    // Контекстное меню (уровень 3+)
    if (STATE.level >= 3) {
        element.oncontextmenu = (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, index);
            playSound('click');
        };
    }
}

// Контекстное меню
const ctxMenu = document.getElementById('context-menu');
let ctxTargetIndex = null;

function showContextMenu(x, y, index) {
    ctxMenu.style.display = 'block';
    ctxMenu.style.left = `${x}px`;
    ctxMenu.style.top = `${y}px`;
    ctxTargetIndex = index;
}

document.addEventListener('click', () => {
    if (ctxMenu.style.display === 'block') {
        ctxMenu.style.display = 'none';
    }
});

// Обработка клавиатуры
document.addEventListener('keydown', (e) => {
    if(!STATE.isGameActive || STATE.level < 3) return;
    const key = parseInt(e.key);
    if (key > 0 && key <= STATE.jugs.length) {
        const idx = key - 1;
        const jugElement = document.getElementById(`jug-${idx}`);
        if (jugElement) {
            // Анимация нажатия клавиши
            jugElement.style.transform = 'translateY(-5px) scale(0.95)';
            setTimeout(() => {
                jugElement.style.transform = '';
            }, 200);
            
            jugElement.click();
        }
    }
    
    // Клавиша пробела для перезапуска уровня
    if (e.code === 'Space' && STATE.isGameActive) {
        e.preventDefault();
        document.getElementById('restart-level-btn').click();
    }
    
    // Клавиша Escape для выхода
    if (e.code === 'Escape' && STATE.isGameActive) {
        document.getElementById('abort-game-btn').click();
    }
});

// Инициализация игровой логики
function initGameLogic() {
    console.log('Игровая логика инициализирована');
}