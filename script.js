const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// Load tasks from LocalStorage on startup
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        
        li.innerHTML = `
            <div class="check-dot" onclick="toggleTask(${index})"></div>
            <span>${task.text}</span>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function addTask() {
    if (input.value.trim() !== '') {
        tasks.push({ text: input.value, completed: false });
        input.value = '';
        renderTasks();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();