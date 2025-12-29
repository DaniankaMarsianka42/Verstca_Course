/* 
 * Управление таблицей рекордов и localStorage
 */

const DB_KEY = 'water_pouring_leaderboard';

// Сохранить результат
function saveResult(name, score, level) {
    let data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    const existingIndex = data.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
    
    if (existingIndex !== -1) {
        if (score > data[existingIndex].score) {
            data[existingIndex] = { name, score, level, date: new Date().toLocaleDateString() };
            console.log(`✅ ${name}: ${data[existingIndex].score} → ${score}`);
        }
    } else {
        data.push({ name, score, level, date: new Date().toLocaleDateString() });
    }
    
    data.sort((a, b) => b.score - a.score);
    data = data.slice(0, 10);
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Показать таблицу рекордов
function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    
    // Отображение текущего результата
    document.getElementById('result-name').textContent = STATE.username;
    document.getElementById('result-score').textContent = STATE.score.toLocaleString();
    document.getElementById('result-level').textContent = STATE.level - 1;

    if (data.length === 0) {
        list.innerHTML = '<li style="justify-content: center;">📭 Пока нет рекордов</li>';
        return;
    }

    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>#${index + 1}</strong> ${item.name} (ур. ${item.level})</span> 
            <span>${item.score.toLocaleString()} <small>${item.date}</small></span>
        `;
        
        // Выделение текущего игрока
        if (item.name.toLowerCase() === STATE.username.toLowerCase()) {
            li.style.background = 'linear-gradient(to right, rgba(26, 41, 128, 0.1), rgba(38, 208, 206, 0.1))';
            li.style.borderLeft = '4px solid #26d0ce';
        }
        
        list.appendChild(li);
    });
}

// Очистить таблицу рекордов
function clearLeaderboard() {
    if(confirm('🗑️ Очистить все рекорды?\nЭто действие нельзя отменить!')) {
        localStorage.removeItem(DB_KEY);
        showLeaderboard();
        showModal('Рекорды очищены', 'Все рекорды были удалены. Таблица пуста.');
    }
}

// Инициализация рейтинга
function initLeaderboard() {
    // Кнопка очистки рекордов
    document.getElementById('clear-leaderboard-btn').onclick = clearLeaderboard;
    console.log('Таблица рекордов инициализирована');
}