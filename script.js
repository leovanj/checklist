const input = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const progressBar = document.getElementById('progressBar');

// Load tasks from LocalStorage
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
// Track total tasks for the progress bar calculation
let totalTasks = tasks.length || 0;

function renderTasks() {
    todoList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        // check-dot triggers deletion
        // span is contenteditable for editing
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
    updateProgressBar();
}

// Progress Bar Logic
function updateProgressBar() {
    if (totalTasks === 0) {
        progressBar.style.width = "0%";
        return;
    }
    
    const finishedTasks = totalTasks - tasks.length;
    const percentage = (finishedTasks / totalTasks) * 100;
    progressBar.style.width = percentage + "%";
    
    // Optional: Turn green when finished
    if (percentage === 100 && totalTasks > 0) {
        progressBar.style.backgroundColor = "#48bb78";
    } else {
        progressBar.style.backgroundColor = "#5d9cec";
    }
}

// Function to handle task editing
function updateTask(index, newText) {
    tasks[index].text = newText;
    localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Press Enter to save edit
function checkEnter(event, element) {
    if (event.key === "Enter") {
        event.preventDefault();
        element.blur();
    }
}

// Add a new task
function addTask() {
    const text = input.value.trim();
    if (text !== '') {
        tasks.push({ text: text });
        totalTasks++; // Increase the session total
        input.value = '';
        renderTasks();
    }
}

// Delete task with fade animation
function deleteMe(index) {
    const listItems = document.querySelectorAll('#todoList li');
    const itemToHide = listItems[index];
    
    if (itemToHide) {
        itemToHide.classList.add('hidden'); // Trigger CSS fade

        setTimeout(() => {
            tasks.splice(index, 1);
            renderTasks();
        }, 400); // Wait for animation to finish
    }
}

// Event Listeners
addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') addTask(); 
});

// Initial Load
renderTasks();
