const addNewTodoBtn = document.getElementById('add-todo');
const newTodoContainer = document.getElementById('new-todo-container');
const todoList = document.getElementById('todo-list');
const completedTodoList = document.getElementById('completed-todo-list');
const newTodoDescription = document.getElementById('new-todo-description');
const newTodoAmount = document.getElementById('new-todo-amount');
const newTodoDate = document.getElementById('new-todo-due-date');
const newTodoPriority = document.getElementById('new-todo-priority');
const saveTodoBtn = document.getElementById('save-todo');
const cancelTodoBtn = document.getElementById('cancel-todo');
const deleteBtns = document.getElementsByClassName('delete-btn');
const deleteConfirmation = document.getElementById('delete-confirmation');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const dontAskAgainBtn = document.getElementById('dont-ask-again');
const overlay = document.getElementById('overlay');
const sortDescriptionBtn = document.getElementById('sort-description');
const sortAmountBtn = document.getElementById('sort-amount');
const sortDueDateBtn = document.getElementById('sort-due-date');
const sortPriorityBtn = document.getElementById('sort-priority');
const sortCreatedBtn = document.getElementById('sort-created');
const filterPriority = document.getElementById('filter-priority');

let skipDeleteConfirmation = false;
let editingTodoId = null;

const settings = {
    filter: 'All',
    sortBy: '',
    sortDir: ''
};

const todos = [];

const todo = {
    id: '', 
    description: '',
    amount: 0,
    dueDate: '',
    priority: 'Low',
    completed: false,
    createdAt: ''
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos.push(...JSON.parse(savedTodos));
        renderTodoList();
    }
});

addNewTodoBtn.addEventListener('click', () => {
    newTodoContainer.classList.remove('hidden');
});

cancelTodoBtn.addEventListener('click', () => {
    newTodoContainer.classList.add('hidden');
    clearNewTodoFields();
});

function clearNewTodoFields() {
    newTodoDescription.value = '';
    newTodoAmount.value = '';
    newTodoDate.value = '';
    newTodoPriority.value = 'Low';
}

saveTodoBtn.addEventListener('click', () => {
    const description = newTodoDescription.value.trim();
    const amountValue = newTodoAmount.value.trim();
    const amount = amountValue ? parseFloat(amountValue) : '';
    const dueDate = newTodoDate.value.trim();
    const priority = newTodoPriority.value;
    const createdAt = editingTodoId ? todos.find(t => t.id === editingTodoId)?.createdAt || new Date().toISOString() : new Date().toISOString();

    if (description) {
        let todoId = null;
        
        if (editingTodoId) {
            // Edit mode: update existing todo
            const idx = todos.findIndex(t => t.id === editingTodoId);
            if (idx !== -1) {
                todos[idx] = { ...todos[idx], description, amount, dueDate, priority };
                todoId = editingTodoId;
            }
            editingTodoId = null;
        } else {
            // Add mode: create new todo
            const uniqueId = self.crypto.randomUUID();
            const newTodo = { ...todo, id: uniqueId, description, amount, dueDate, priority, createdAt };
            todos.push(newTodo);
            todoId = uniqueId;
        }
        newTodoContainer.classList.add('hidden');
        
        // Re-apply current sorting if any
        if (settings.sortBy) {
            const currentField = settings.sortBy;
            const currentDirection = settings.sortDir;
            settings.sortDir = currentDirection === 'asc' ? 'desc' : 'asc';
            sortTodos(currentField);
        } else {
            renderTodoList();
        }
        
        // Add fade-in animation
        if (todoId) {
            const newTodoItem = document.querySelector(`[data-todo-id="${todoId}"]`);
            if (newTodoItem) {
                newTodoItem.classList.add('fade-in');
                setTimeout(() => {
                    newTodoItem.classList.remove('fade-in');
                }, 500);
            }
        }
        
        clearNewTodoFields();
        saveToLocalStorage();
    } else {
        alert('Description is required.');
    }
});

filterPriority.addEventListener('change', () => {
    settings.filter = filterPriority.value;
    renderTodoList();
});

function renderTodoList() {
    todoList.innerHTML = '';
    completedTodoList.innerHTML = '';
    
    // Apply filtering
    const filteredTodos = todos.filter(todo => {
        if (settings.filter && settings.filter !== 'All' && settings.filter !== '') {
            return todo.priority === settings.filter;
        }
        return true;
    });
    
    filteredTodos.forEach((todo) => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-card');
        todoItem.setAttribute('data-todo-id', todo.id);
        const textContainer = document.createElement('div');
        textContainer.classList.add('todo-text-container');

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('todo-buttons-container');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.classList.add('complete-checkbox');

        // Main info
        const mainInfo = document.createElement('div');
        mainInfo.classList.add('todo-main');
        const desc = document.createElement('span');
        desc.classList.add('todo-desc');
        desc.textContent = todo.description;
        mainInfo.appendChild(desc);
        textContainer.appendChild(mainInfo);

        // Details
        const details = document.createElement('div');
        details.classList.add('todo-details');
        if (todo.amount !== '' && !isNaN(todo.amount)) {
            const amountSpan = document.createElement('span');
            amountSpan.classList.add('todo-amount');
            amountSpan.textContent = `Amount: ${todo.amount}`;
            details.appendChild(amountSpan);
        }
        if (todo.dueDate) {
            const dueSpan = document.createElement('span');
            dueSpan.classList.add('todo-due');
            const dueDate = new Date(todo.dueDate);
            dueSpan.textContent = `Due: ${dueDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}`;
            details.appendChild(dueSpan);
        }
        // Priority
        const prioritySpan = document.createElement('span');
        const priorityLabel = document.createElement('span');
        priorityLabel.textContent = 'Priority: ';
        priorityLabel.classList.add('todo-priority');
        prioritySpan.classList.add('todo-priority', `priority-${todo.priority.toLowerCase()}`);
        prioritySpan.textContent = `${todo.priority}`;
        details.appendChild(priorityLabel);
        details.appendChild(prioritySpan);
        textContainer.appendChild(details);

        // Created date
        const createdSpan = document.createElement('span');
        createdSpan.classList.add('todo-created');
        const createdDate = new Date(todo.createdAt);
        createdSpan.textContent = `Created: ${createdDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
        textContainer.appendChild(createdSpan);

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => {
            editingTodoId = todo.id;
            newTodoContainer.classList.remove('hidden');
            newTodoDescription.value = todo.description;
            newTodoAmount.value = todo.amount !== '' ? todo.amount : '';
            newTodoDate.value = todo.dueDate;
            newTodoPriority.value = todo.priority;
        });
        buttonsContainer.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        buttonsContainer.appendChild(deleteBtn);

        // Layout
        todoItem.appendChild(checkbox);
        todoItem.appendChild(textContainer);
        todoItem.appendChild(buttonsContainer);

        if (todo.completed) {
            completedTodoList.appendChild(todoItem);
        } else {
            todoList.appendChild(todoItem);
        }

        checkbox.addEventListener('change', () => {
            todo.completed = checkbox.checked;
            const todoId = todo.id;
            todoItem.classList.add('fade-out');
            setTimeout(() => {
                renderTodoList();
                saveToLocalStorage();

                const newTodoItem = document.querySelector(`[data-todo-id="${todoId}"]`);
                if (newTodoItem) {
                    newTodoItem.classList.add('fade-in');
                    setTimeout(() => {
                        newTodoItem.classList.remove('fade-in');
                    }, 500);
                }
            }, 500);
        });

        deleteBtn.addEventListener('click', () => {
            if (skipDeleteConfirmation === false) {
                deleteConfirmation.classList.remove('hidden');
                overlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                confirmDeleteBtn.onclick = () => {
                    deleteTodo(todo);
                };
                cancelDeleteBtn.onclick = () => {
                    deleteConfirmation.classList.add('hidden');
                    overlay.classList.add('hidden');
                    document.body.style.overflow = 'visible';
                };
                dontAskAgainBtn.onclick = () => {
                    skipDeleteConfirmation = true;
                    deleteTodo(todo);
                };
            } else if (skipDeleteConfirmation === true) {
                deleteTodo(todo);
            }
        });
    });
};

function deleteTodo (todo) {
    const idx = todos.findIndex(t => t.id === todo.id);
    const todoItem = document.querySelector(`[data-todo-id="${todo.id}"]`);
    if (todoItem) {
        todoItem.classList.add('fade-out');
    }
    setTimeout(() => {
    if (idx !== -1) {
        todos.splice(idx, 1);
        renderTodoList();
        saveToLocalStorage();
    }
    }, 500);
    deleteConfirmation.classList.add('hidden');
    overlay.classList.add('hidden');
    document.body.style.overflow = 'visible';
}

function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

sortDescriptionBtn.addEventListener('click', () => sortTodos('description'));
sortAmountBtn.addEventListener('click', () => sortTodos('amount'));
sortDueDateBtn.addEventListener('click', () => sortTodos('dueDate'));
sortPriorityBtn.addEventListener('click', () => sortTodos('priority'));
sortCreatedBtn.addEventListener('click', () => sortTodos('createdAt'));

function sortTodos(field) {
    const currentDirection = settings.sortDir === 'asc' ? 'desc' : 'asc';
    settings.sortBy = field;
    settings.sortDir = currentDirection;
    
    // Update button text to show direction
    document.querySelectorAll('.sorting').forEach(btn => {
        btn.textContent = btn.textContent.replace(' 🠉', '').replace(' 🠋', '');
    });
    
    const activeBtn = document.querySelector(`[data-sort="${field}"]`);
    if (activeBtn) {
        activeBtn.textContent += currentDirection === 'asc' ? ' 🠉' : ' 🠋';
    }
    
    todos.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        if (field === 'amount') {
            const aHasAmount = aValue !== '' && !isNaN(parseFloat(aValue));
            const bHasAmount = bValue !== '' && !isNaN(parseFloat(bValue));
            
            // Prioritize the one with amount
            if (aHasAmount && !bHasAmount) return -1;
            if (!aHasAmount && bHasAmount) return 1;
            if (!aHasAmount && !bHasAmount) return 0;
            
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        } else if (field === 'dueDate') {
            const aHasDate = aValue && aValue.trim() !== '';
            const bHasDate = bValue && bValue.trim() !== '';
            
            // Prioritize the one with date
            if (aHasDate && !bHasDate) return -1;
            if (!aHasDate && bHasDate) return 1;
            if (!aHasDate && !bHasDate) return 0;
            
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (field === 'priority') {
            const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
            aValue = priorityOrder[aValue];
            bValue = priorityOrder[bValue];
        } else if (field === 'createdAt') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }
        
        if (currentDirection === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
    });
    
    renderTodoList();
}