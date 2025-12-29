const DB_KEY = 'water_pouring_leaderboard';

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('leaderboard-list');
    const data = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    
    // Показываем текущий результат (если есть)
    const playerName = localStorage.getItem('playerName');
    const currentResult = document.getElementById('current-result');
    if (playerName) {
        const playerScore = data.find(item => 
            item.name.toLowerCase() === playerName.toLowerCase()
        );
        if (playerScore) {
            document.getElementById('result-name').textContent = playerScore.name;
            document.getElementById('result-score').textContent = playerScore.score.toLocaleString();
            currentResult.style.display = 'block';
        }
    }
    
    if (data.length === 0) {
        list.innerHTML = '<li style="justify-content: center; font-size: 1.3em;">📭 Пока нет рекордов</li>';
        return;
    }
    
    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>🥇 ${index + 1} ${item.name}</span>
            <span>${item.score.toLocaleString()}</span>
        `;
        list.appendChild(li);
    });
    
    // Кнопка очистки
    document.getElementById('clear-btn').onclick = () => {
        if (confirm('🗑️ Очистить все рекорды?\nЭто действие нельзя отменить!')) {
            localStorage.removeItem(DB_KEY);
            location.reload();
        }
    };
});
