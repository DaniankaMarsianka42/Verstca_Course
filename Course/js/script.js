/* 
 * Основной файл игры "Переливания"
 * Общие функции, используемые на всех страницах
 */

// Общие функции для всех страниц
function showModal(title, message) {
    // Создаем модальное окно, если его нет
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3 id="modal-title">${title}</h3>
                <p id="modal-message">${message}</p>
                <button id="modal-close" class="btn-primary">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('#modal-close').onclick = () => {
            modal.style.display = 'none';
        };
    } else {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
    }
    
    modal.style.display = 'flex';
}

// Инициализация на всех страницах
document.addEventListener('DOMContentLoaded', () => {
    console.log('Игра "Переливания" загружена!');
});