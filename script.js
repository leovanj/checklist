const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <div class="check-dot" onclick="completeAndRemove(${index})"></div>
            <span>${task.text}</span>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// This function now removes the task instead of just crossing it out
function completeAndRemove(index) {
    // Optional: Add a small delay so the user sees the "click" before it vanishes
    tasks.splice(index, 1);
    renderTasks();
}

function addTask() {
    if (input.value.trim() !== '') {
        tasks.push({ text: input.value, completed: false });
        input.value = '';
        renderTasks();
    }
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();
function completeAndRemove(index) {
    const element = todoList.children[index];
    element.classList.add('fade-out'); // Trigger the CSS animation
    
    setTimeout(() => {
        tasks.splice(index, 1);
        renderTasks();
    }, 300); // Matches the 0.3s transition in CSS
}