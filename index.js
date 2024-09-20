// Version 3.0
let todos = [];
let filteredTodos = [];
let mediaRecorder;
let audioChunks = [];
let currentEditIndex = null;
let currentTodo = null;

document.getElementById('add-button').addEventListener('click', addTodo);
document.getElementById('filter-all').addEventListener('click', showAllTodos);
document.getElementById('filter-completed').addEventListener('click', showCompletedTodos);
document.getElementById('filter-remaining').addEventListener('click', showRemainingTodos);
document.getElementById('save-button').addEventListener('click', saveEdit);
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('start-recording').addEventListener('click', startRecording);
document.getElementById('stop-recording').addEventListener('click', stopRecording);
document.getElementById('image-upload').addEventListener('change', uploadImage);

// Load tasks from local storage on page load
window.onload = loadTodos;

function addTodo() {
    const input = document.getElementById('todo-input');
    if (input.value.trim()) {
        todos.push({
            text: input.value.trim(),
            completed: false,
            note: '',
            deadline: '',
            audioUrl: null,
            imageUrl: null
        });
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function renderTodos() {
    const todosList = document.getElementById('all-todos');
    todosList.innerHTML = '';

    const todosToShow = todos.sort((a, b) => a.completed - b.completed);

    todosToShow.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} class="todo-checkbox" onchange="toggleTodoCompletion(${index})" />
            <p>${todo.text}</p>
            <div class="button-group">
                <button class="btn btn-ghost" onclick="openEditModal(${index})">Edit</button>
                <button class="btn btn-ghost" onclick="deleteTodo(${index})">❌</button>
            </div>
        `;
        todosList.appendChild(li);
    });
    updateRemainingTasks();
}



function toggleTodoCompletion(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
}

function updateRemainingTasks() {
    const remainingTasks = todos.filter(todo => !todo.completed).length;
    document.getElementById('remaining-tasks').innerText = `Remaining tasks: ${remainingTasks}`;
}

function showAllTodos() {
    filteredTodos = [];
    renderTodos();
}

function showCompletedTodos() {
    filteredTodos = todos.filter(todo => todo.completed);
    renderTodos();
}

function showRemainingTodos() {
    filteredTodos = todos.filter(todo => !todo.completed);
    renderTodos();
}

function openEditModal(index) {
    currentEditIndex = index;
    currentTodo = todos[index];
    document.getElementById('edit-todo-input').value = currentTodo.text;
    document.getElementById('edit-note-input').value = currentTodo.note || '';
    document.getElementById('edit-deadline-input').value = currentTodo.deadline || '';
    document.getElementById('recorded-audio').innerHTML = currentTodo.audioUrl ? `<audio controls src="${currentTodo.audioUrl}"></audio>` : ''; // Show recorded audio
    document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

function saveEdit() {
    const editedText = document.getElementById('edit-todo-input').value;
    const editedNote = document.getElementById('edit-note-input').value;
    const editedDeadline = document.getElementById('edit-deadline-input').value;
    currentTodo.text = editedText;
    currentTodo.note = editedNote;
    currentTodo.deadline = editedDeadline;
    saveTodos();
    renderTodos();
    closeModal();
}

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    document.getElementById('start-recording').classList.add('hidden');
    document.getElementById('stop-recording').classList.remove('hidden');
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        currentTodo.audioUrl = audioUrl; // Save audio URL to the current todo
        audioChunks = [];
        saveTodos();
        document.getElementById('recorded-audio').innerHTML = `<audio controls src="${audioUrl}"></audio>`; // Update audio display in modal
    };
}

function stopRecording() {
    mediaRecorder.stop();
    document.getElementById('start-recording').classList.remove('hidden');
    document.getElementById('stop-recording').classList.add('hidden');
}

function uploadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        currentTodo.imageUrl = e.target.result;
        saveTodos();
    };
    reader.readAsDataURL(file);
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
    renderTodos();
}
