const STORAGE_KEY = "myTasks_v2";

const input = document.getElementById("todoInput");
const addToggle = document.getElementById("addToggle");
const activeList = document.getElementById("activeList");
const completedSection = document.getElementById("completedSection");
const completedList = document.getElementById("completedList");
const completedToggle = document.getElementById("completedToggle");
const completedLabel = document.getElementById("completedLabel");
const countLine = document.getElementById("countLine");
const emptyState = document.getElementById("emptyState");
const dateLine = document.getElementById("dateLine");

let tasks = loadTasks();

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map(t => ({
      id: t.id ?? crypto.randomUUID(),
      text: t.text ?? "",
      done: !!t.done
    }));
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function setDate() {
  const today = new Date();
  dateLine.textContent = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function makeTaskRow(task) {
  const li = document.createElement("li");
  li.className = "task" + (task.done ? " done" : "");
  li.dataset.id = task.id;

  const check = document.createElement("button");
  check.className = "task-check";
  check.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
  check.addEventListener("click", () => toggleDone(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.contentEditable = "true";
  text.textContent = task.text;
  text.addEventListener("blur", () => updateText(task.id, text.textContent));
  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      text.blur();
    }
  });

  const del = document.createElement("button");
  del.className = "task-delete";
  del.setAttribute("aria-label", "Delete task");
  del.addEventListener("click", () => deleteTask(task.id, li));

  li.append(check, text, del);
  return li;
}

function render() {
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  activeList.innerHTML = "";
  active.forEach(t => activeList.appendChild(makeTaskRow(t)));

  completedList.innerHTML = "";
  done.forEach(t => completedList.appendChild(makeTaskRow(t)));

  completedSection.hidden = done.length === 0;
  completedLabel.textContent = `Completed (${done.length})`;

  emptyState.hidden = tasks.length !== 0;

  if (tasks.length === 0) {
    countLine.textContent = "";
  } else if (active.length === 0) {
    countLine.textContent = "All done";
  } else {
    countLine.textContent = `${active.length} left`;
  }

  saveTasks();
}

function addTask(value) {
  const text = value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, done: false });
  render();
}

function updateText(id, newText) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const clean = newText.trim();
  if (!clean) {
    deleteTask(id);
    return;
  }
  task.text = clean;
  saveTasks();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  render();
}

function deleteTask(id, liEl) {
  if (liEl) {
    liEl.classList.add("leaving");
    liEl.addEventListener("animationend", () => {
      tasks = tasks.filter(t => t.id !== id);
      render();
    }, { once: true });
  } else {
    tasks = tasks.filter(t => t.id !== id);
    render();
  }
}

// Add row interactions
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask(input.value);
    input.value = "";
  }
});

addToggle.addEventListener("click", () => {
  input.focus();
  if (input.value.trim()) {
    addTask(input.value);
    input.value = "";
  }
});

completedToggle.addEventListener("click", () => {
  completedSection.classList.toggle("open");
});

setDate();
render();