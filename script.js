const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        // When you click the dot, it triggers deleteMe
        li.innerHTML = `
            <div class="check-dot" onclick="deleteMe(${index})"></div>
            <span>${task.text}</span>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// This is the function that makes them disappear
function deleteMe(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function addTask() {
    if (input.value.trim() !== '') {
        tasks.push({ text: input.value });
        input.value = '';
        renderTasks();
    }
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();
