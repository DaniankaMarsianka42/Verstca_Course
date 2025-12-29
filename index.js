document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    
    // Загружаем предыдущее имя (если есть)
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        usernameInput.value = savedName;
    }
    
    form.onsubmit = (e) => {
        e.preventDefault();
        const name = usernameInput.value.trim();
        if (name) {
            localStorage.setItem('playerName', name);
            window.location.href = 'game.html';
        }
    };
});
