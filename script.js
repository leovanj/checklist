const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const progressBar = document.getElementById('progressBar');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let totalTasks = tasks.length || 0;

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="check-dot" onclick="deleteMe(${index})"></div>
            <span contenteditable="true" onblur="updateTask(${index}, this.innerText)" onkeydown="checkEnter(event, this)">${task.text}</span>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    updateProgressBar();
}

function updateProgressBar() {
    // 1. If no tasks exist, hide the bar and reset the counter
    if (tasks.length === 0) {
        progressBar.style.width = "0%";
        progressBar.parentElement.style.opacity = "0"; // Hides the container
        totalTasks = 0; 
        return;
    }

    // 2. If tasks exist, make sure the bar is visible
    progressBar.parentElement.style.opacity = "1";

    const finishedTasks = totalTasks - tasks.length;
    const percentage = (finishedTasks / totalTasks) * 100;
    progressBar.style.width = percentage + "%";

    if (percentage === 100) {
        progressBar.style.backgroundColor = "#48bb78";
        // Optional: Reset after a short delay once 100% is reached
        setTimeout(() => {
            if (tasks.length === 0) {
                progressBar.style.width = "0%";
                progressBar.parentElement.style.opacity = "0";
            }
        }, 1000);
    } else {
        progressBar.style.backgroundColor = "#5d9cec";
    }
}

function updateTask(index, newText) {
    tasks[index].text = newText;
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

function checkEnter(event, element) {
    if (event.key === "Enter") {
        event.preventDefault();
        element.blur();
    }
}

function addTask() {
    if (input.value.trim() !== '') {
        tasks.push({ text: input.value });
        if (tasks.length === 1) totalTasks = 1; // Start a new session
        else totalTasks++;
        
        input.value = '';
        renderTasks();
    }
}

function deleteMe(index) {
    const listItems = document.querySelectorAll('#todoList li');
    if (listItems[index]) {
        listItems[index].classList.add('hidden');
        setTimeout(() => {
            tasks.splice(index, 1);
            renderTasks();
        }, 400);
    }
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

renderTasks();
