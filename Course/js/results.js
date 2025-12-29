// Логика для страницы результатов

document.addEventListener('DOMContentLoaded', () => {
    // Загружаем результаты
    loadResults();
    
    // Настройка обработчиков событий
    setupResultsEventHandlers();
});

function loadResults() {
    // Загружаем данные текущей игры
    const username = localStorage.getItem('game_username') || 'Игрок';
    const score = parseInt(localStorage.getItem('game_score') || '0');
    const level = parseInt(localStorage.getItem('game_level') || '1');
    
    // Отображаем результат
    document.getElementById('result-name').textContent = username;
    document.getElementById('result-score').textContent = score.toLocaleString();
    document.getElementById('result-level').textContent = level - 1;
    
    // Загружаем таблицу рекордов
    showLeaderboard();
    
    // Загружаем статистику
    const totalGames = localStorage.getItem('total_games') || '0';
    document.getElementById('total-games').textContent = totalGames;
}

function setupResultsEventHandlers() {
    // Кнопка очистки рекордов
    document.getElementById('clear-leaderboard-btn').onclick = () => {
        if(confirm('🗑️ Очистить все рекорды?\nЭто действие нельзя отменить!')) {
            localStorage.removeItem('water_pouring_leaderboard');
            showLeaderboard();
            showModal('Рекорды очищены', 'Все рекорды были удалены. Таблица пуста.');
        }
    };
    
    // Кнопка "Играть снова" - сбрасываем уровень и счет
    document.getElementById('play-again-btn').onclick = (e) => {
        localStorage.setItem('game_level', '1');
        localStorage.setItem('game_score', '0');
    };
    
    // Модальное окно
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.onclick = () => {
            document.getElementById('modal').style.display = 'none';
        };
    }
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').style.display = 'flex';
}