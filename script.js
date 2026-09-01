const STORAGE_KEY = "myTasks_v3";
const LISTS = ["school", "personal", "other"];
const LIST_TITLES = { school: "School", personal: "Personal", other: "Other" };

const LABEL_PALETTE = [
  "#e7ded0", // sand
  "#dde6db", // sage
  "#e3dcea", // lilac
  "#f0ddd6", // clay
  "#d9e3e8", // slate
  "#eee0c8"  // gold
];

const dateLine = document.getElementById("dateLine");
const listTabs = document.getElementById("listTabs");
const countLine = document.getElementById("countLine");
const input = document.getElementById("todoInput");
const addToggle = document.getElementById("addToggle");
const labelToggle = document.getElementById("labelToggle");
const labelPicker = document.getElementById("labelPicker");
const labelInput = document.getElementById("labelInput");
const labelOptions = document.getElementById("labelOptions");
const activeListEl = document.getElementById("activeList");
const completedSection = document.getElementById("completedSection");
const completedList = document.getElementById("completedList");
const completedToggle = document.getElementById("completedToggle");
const completedLabelEl = document.getElementById("completedLabel");
const emptyState = document.getElementById("emptyState");

let state = loadState();
let pendingLabel = null;
let openSubtaskAdders = new Set();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed.lists) return freshState();
    LISTS.forEach(l => { if (!Array.isArray(parsed.lists[l])) parsed.lists[l] = []; });
    if (!LISTS.includes(parsed.activeList)) parsed.activeList = "school";
    return parsed;
  } catch {
    return freshState();
  }
}

function freshState() {
  return { lists: { school: [], personal: [], other: [] }, activeList: "school" };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentTasks() {
  return state.lists[state.activeList];
}

function uid() {
  return crypto.randomUUID();
}

function setDate() {
  const today = new Date();
  dateLine.textContent = today.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });
}

function labelColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return LABEL_PALETTE[hash % LABEL_PALETTE.length];
}

function allKnownLabels() {
  const set = new Set();
  LISTS.forEach(l => state.lists[l].forEach(t => { if (t.label) set.add(t.label); }));
  return [...set];
}

function refreshLabelOptions() {
  labelOptions.innerHTML = "";
  allKnownLabels().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    labelOptions.appendChild(opt);
  });
}

/* ---------- Tabs ---------- */
function renderTabs() {
  [...listTabs.children].forEach(btn => {
    btn.classList.toggle("active", btn.dataset.list === state.activeList);
  });
}

listTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".list-tab");
  if (!btn) return;
  state.activeList = btn.dataset.list;
  openSubtaskAdders.clear();
  saveState();
  renderTabs();
  render();
});

/* ---------- Task rows ---------- */
function makeTaskBlock(task) {
  const block = document.createElement("li");
  block.className = "task-block" + (task.subtasksOpen ? " subs-open" : "");
  block.dataset.id = task.id;

  const row = document.createElement("div");
  row.className = "task" + (task.done ? " done" : "");

  const check = document.createElement("button");
  check.className = "task-check";
  check.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
  check.addEventListener("click", () => toggleDone(task.id));

  const main = document.createElement("div");
  main.className = "task-main";

  const text = document.createElement("div");
  text.className = "task-text";
  text.contentEditable = "true";
  text.textContent = task.text;
  text.addEventListener("blur", () => updateText(task.id, text.textContent));
  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); text.blur(); }
  });

  const meta = document.createElement("div");
  meta.className = "task-meta";

  if (task.label) {
    const chip = document.createElement("span");
    chip.className = "label-chip";
    chip.style.background = labelColor(task.label);
    chip.textContent = task.label;
    meta.appendChild(chip);
  }

  const subtasks = task.subtasks || [];
  if (subtasks.length > 0) {
    const doneCount = subtasks.filter(s => s.done).length;
    const summary = document.createElement("button");
    summary.className = "subtask-summary";
    summary.innerHTML = `<span class="chevron-tiny"></span><span>${doneCount}/${subtasks.length}</span>`;
    summary.addEventListener("click", () => toggleSubtasksOpen(task.id));
    meta.appendChild(summary);
  }

  const addSub = document.createElement("button");
  addSub.className = "add-subtask-btn";
  addSub.textContent = "+ subtask";
  addSub.addEventListener("click", () => {
    openSubtaskAdders.add(task.id);
    task.subtasksOpen = true;
    saveState();
    render();
    const newInput = block.querySelector(".add-subtask-row input");
    if (newInput) newInput.focus();
  });
  meta.appendChild(addSub);

  main.append(text, meta);

  const side = document.createElement("div");
  side.className = "task-side";

  const del = document.createElement("button");
  del.className = "task-delete";
  del.setAttribute("aria-label", "Delete task");
  del.addEventListener("click", () => deleteTask(task.id, block));
  side.appendChild(del);

  row.append(check, main, side);
  block.appendChild(row);

  const subList = document.createElement("ul");
  subList.className = "subtasks";
  subtasks.forEach(s => subList.appendChild(makeSubtaskRow(task.id, s)));

  if (openSubtaskAdders.has(task.id)) {
    subList.appendChild(makeAddSubtaskRow(task.id));
  }

  block.appendChild(subList);

  return block;
}

function makeSubtaskRow(taskId, sub) {
  const li = document.createElement("li");
  li.className = "subtask" + (sub.done ? " done" : "");

  const check = document.createElement("button");
  check.className = "subtask-check";
  check.setAttribute("aria-label", sub.done ? "Mark as not done" : "Mark as done");
  check.addEventListener("click", () => toggleSubtaskDone(taskId, sub.id));

  const text = document.createElement("div");
  text.className = "subtask-text";
  text.contentEditable = "true";
  text.textContent = sub.text;
  text.addEventListener("blur", () => updateSubtaskText(taskId, sub.id, text.textContent));
  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); text.blur(); }
  });

  const del = document.createElement("button");
  del.className = "subtask-delete";
  del.setAttribute("aria-label", "Delete subtask");
  del.addEventListener("click", () => deleteSubtask(taskId, sub.id));

  li.append(check, text, del);
  return li;
}

function makeAddSubtaskRow(taskId) {
  const li = document.createElement("li");
  li.className = "add-subtask-row";
  const inp = document.createElement("input");
  inp.type = "text";
  inp.placeholder = "Add a subtask";
  inp.maxLength = 60;
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask(taskId, inp.value);
      inp.value = "";
    } else if (e.key === "Escape") {
      openSubtaskAdders.delete(taskId);
      render();
    }
  });
  inp.addEventListener("blur", () => {
    if (!inp.value.trim()) {
      openSubtaskAdders.delete(taskId);
      render();
    }
  });
  li.appendChild(inp);
  return li;
}

/* ---------- Render ---------- */
function render() {
  const tasks = currentTasks();
  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);

  activeListEl.innerHTML = "";
  active.forEach(t => activeListEl.appendChild(makeTaskBlock(t)));

  completedList.innerHTML = "";
  done.forEach(t => completedList.appendChild(makeTaskBlock(t)));

  completedSection.hidden = done.length === 0;
  completedLabelEl.textContent = `Completed (${done.length})`;

  emptyState.hidden = tasks.length !== 0;

  if (tasks.length === 0) countLine.textContent = "";
  else if (active.length === 0) countLine.textContent = "All done";
  else countLine.textContent = `${active.length} left`;

  refreshLabelOptions();
  saveState();
}

/* ---------- Mutations: tasks ---------- */
function addTask(value) {
  const text = value.trim();
  if (!text) return;
  currentTasks().unshift({
    id: uid(), text, done: false,
    label: pendingLabel || null,
    subtasks: [], subtasksOpen: false
  });
  pendingLabel = null;
  closeLabelPicker();
  render();
}

function updateText(id, newText) {
  const task = currentTasks().find(t => t.id === id);
  if (!task) return;
  const clean = newText.trim();
  if (!clean) { deleteTask(id); return; }
  task.text = clean;
  saveState();
}

function toggleDone(id) {
  const task = currentTasks().find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  render();
}

function deleteTask(id, blockEl) {
  const finish = () => {
    state.lists[state.activeList] = currentTasks().filter(t => t.id !== id);
    openSubtaskAdders.delete(id);
    render();
  };
  if (blockEl) {
    blockEl.classList.add("leaving");
    blockEl.addEventListener("animationend", finish, { once: true });
  } else {
    finish();
  }
}

function toggleSubtasksOpen(id) {
  const task = currentTasks().find(t => t.id === id);
  if (!task) return;
  task.subtasksOpen = !task.subtasksOpen;
  render();
}

/* ---------- Mutations: subtasks ---------- */
function addSubtask(taskId, value) {
  const text = value.trim();
  if (!text) return;
  const task = currentTasks().find(t => t.id === taskId);
  if (!task) return;
  if (!task.subtasks) task.subtasks = [];
  task.subtasks.push({ id: uid(), text, done: false });
  task.subtasksOpen = true;
  openSubtaskAdders.add(taskId);
  render();
  const focusInput = activeListEl.querySelector(`[data-id="${taskId}"] .add-subtask-row input`) ||
                completedList.querySelector(`[data-id="${taskId}"] .add-subtask-row input`);
  if (focusInput) focusInput.focus();
}

function updateSubtaskText(taskId, subId, newText) {
  const task = currentTasks().find(t => t.id === taskId);
  if (!task) return;
  const sub = task.subtasks.find(s => s.id === subId);
  if (!sub) return;
  const clean = newText.trim();
  if (!clean) { deleteSubtask(taskId, subId); return; }
  sub.text = clean;
  saveState();
}

function toggleSubtaskDone(taskId, subId) {
  const task = currentTasks().find(t => t.id === taskId);
  if (!task) return;
  const sub = task.subtasks.find(s => s.id === subId);
  if (!sub) return;
  sub.done = !sub.done;
  render();
}

function deleteSubtask(taskId, subId) {
  const task = currentTasks().find(t => t.id === taskId);
  if (!task) return;
  task.subtasks = task.subtasks.filter(s => s.id !== subId);
  render();
}

/* ---------- Label picker ---------- */
function openLabelPicker() {
  labelPicker.hidden = false;
  labelToggle.classList.add("active");
  labelInput.value = "";
  refreshLabelOptions();
  labelInput.focus();
}

function closeLabelPicker() {
  labelPicker.hidden = true;
  labelToggle.classList.remove("active");
}

labelToggle.addEventListener("click", () => {
  if (labelPicker.hidden) openLabelPicker();
  else closeLabelPicker();
});

labelInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const val = labelInput.value.trim();
    pendingLabel = val || null;
    closeLabelPicker();
    input.focus();
  } else if (e.key === "Escape") {
    pendingLabel = null;
    closeLabelPicker();
    input.focus();
  }
});

/* ---------- Add row ---------- */
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
renderTabs();
render();