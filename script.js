const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    todoList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="check-dot" onclick="deleteMe(${index})"></div>
            <span 
                contenteditable="true" 
                onblur="updateTask(${index}, this.innerText)"
                onkeydown="checkEnter(event, this)"
            >${task.text}</span>
        `;
        todoList.appendChild(li);
    });
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Saves the new text when you click away from the task
function updateTask(index, newText) {
    tasks[index].text = newText;
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Allows you to press "Enter" to finish editing
function checkEnter(event, element) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents a new line from being created
        element.blur(); // Triggers the 'onblur' saving function above
    }
}

function deleteMe(index) {
    const listItems = document.querySelectorAll('#todoList li');
    const itemToHide = listItems[index];
    itemToHide.classList.add('hidden');

    setTimeout(() => {
        tasks.splice(index, 1);
        renderTasks();
    }, 400);
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
