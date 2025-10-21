class Task {
    constructor(title, completed = false, userId = 1, id = Date.now(), reminderTime = null) {
        this.title = title;
        this.completed = completed;
        this._userId = userId;
        this._id = id;
        this._reminderTime = reminderTime;
    }

    get userId() {
        return this._userId;
    }

    get id() {
        return this._id;
    }

    set reminderTime(value) {
        return this._reminderTime = value;
    }

    get reminderTime() {
        return this._reminderTime;
    }

    toggleComplete() {
        return this.completed = !this.completed;
    }

    setReminder(time) {
        const chosenTime = new Date(time);
        if (chosenTime <= new Date()) {
            alert("Пока что нет возможности поставить напоминание в прошлом :(");
            return;
        }

        this.reminderTime = chosenTime.toISOString();

        this._fetchPatch(`https://jsonplaceholder.typicode.com/todos/${this.id}`, { reminderTime: this.reminderTime });  // Имитация запроса к серверу
    }

    clearReminder() {
        return this.reminderTime = null;
    }

    async _fetchPatch(url, data) {
        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        } catch (err) {
            console.error("Ошибка при отправке напоминания:", err);
        }
    }
}

class TaskList {
    constructor() {
        this.tasks = [];
    }

    async load() {
        const saved = JSON.parse(localStorage.getItem("todoList"));

        if (saved && saved.length) {
            this.tasks = saved.map(obj => new Task(obj.title, obj.completed, obj._userId, obj._id, obj._reminderTime))
        } else {
            await this._fetchGet("https://jsonplaceholder.typicode.com/todos?_limit=7");
        }
    }

    save() {
        localStorage.setItem("todoList", JSON.stringify(this.tasks));
    }

    add(title) {
        const task = new Task(title);
        if (!title) return;

        this.tasks.push(task);
        this.save();

        this._fetchPost("https://jsonplaceholder.typicode.com/todos", task);     //имитируем отправку данных на сервер(поэтому не ждем ответа сервера а сразу сохраняем)
        return task;
    }

    delete(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.save();

        this._fetchDelete(`https://jsonplaceholder.typicode.com/todos/${id}`);  // имитируем удаление данных на сервере

        return this.tasks;
    }

    getFiltered(filterType) {
        switch (filterType) {
            case "fulfilled":
                return this.tasks.filter(task => task.completed === true);
            case "unfulfilled":
                return this.tasks.filter(task => task.completed === false);
            case "all":
                return this.tasks;
        }
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        task.toggleComplete();
        this.save();
    }

    setTaskReminder(id, time) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        task.setReminder(time);
        this.save();
    }

    clearTaskReminder(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        task.clearReminder();
        this.save();
    }

    async _fetchGet(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const tasks = await response.json();

            this.tasks = tasks;
            this.save();
        } catch (err) {
            console.log("Ошибка:", err);
            return null;
        }
    }

    async _fetchPost(url, data) {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
            })
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async _fetchDelete(url) {
        try {
            const response = await fetch(url, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (err) {
            console.error(err);
            alert("Не удалось удалить задачу :(");
        }
    }
}

class UI {
    constructor() {
        this.todoForm = document.querySelector(".todos-input-form");
        this.todoInput = document.querySelector(".todos-input");
        this.addTaskButton = document.getElementById("add-button");

        this.tasksList = document.querySelector(".tasks-list");

        this.filterButtons = document.querySelectorAll(".filter");
        this.filterAllButton = document.getElementById("all-tasks");
        this.filterFulfilledButton = document.getElementById("fulfilled-tasks");
        this.filterUnfulfilledButton = document.getElementById("unfulfilled-tasks");

        this._handlers = {};   // сюда App положит свои обработчики
    }

    renderTasks(tasks) {
        this.tasksList.innerHTML = "";

        tasks.forEach((task) => {
            const taskWrapper = this.createHTMLTaskWrapper(task);
            this.tasksList.append(taskWrapper);
        });
    }

    createHTMLTaskWrapper(task) {
        let taskWrapperDiv = document.createElement("div");
        taskWrapperDiv.setAttribute("class", "task-wrapper");
        taskWrapperDiv.setAttribute("data-id", task.id);

        let taskContentDiv = document.createElement("div");
        taskContentDiv.setAttribute("class", "task-content");

        let taskCheckbox = document.createElement("input");
        taskCheckbox.setAttribute("type", "checkbox");
        taskCheckbox.setAttribute("name", "task-checkbox");
        taskCheckbox.setAttribute("class", "task-checkbox");
        taskCheckbox.checked = task.completed;

        taskCheckbox.addEventListener("change", () => {
            this._handlers.toggleTask?.(task.id);
        });

        taskContentDiv.append(taskCheckbox);

        let taskText = document.createElement("span");
        taskText.setAttribute("class", "task-text");
        taskText.textContent = task.title;
        taskContentDiv.append(taskText);
        taskWrapperDiv.append(taskContentDiv);

        let taskActionsDiv = document.createElement("div");
        taskActionsDiv.setAttribute("class", "task-actions");

        let reminderButton = document.createElement("button");
        reminderButton.setAttribute("id", "reminder-button");
        let bellImage = document.createElement("img");
        bellImage.setAttribute("src", "./images/bell2.svg");
        bellImage.setAttribute("alt", "Колокольчик");
        reminderButton.append(bellImage);

        reminderButton.addEventListener("click", () => {
            this.createReminderInput(taskActionsDiv, task);
        });

        if (!task.completed) {
            taskActionsDiv.append(reminderButton);

            if (!task.reminderTime) {
                reminderButton.disabled = false;
                reminderButton.classList.remove("non-active");
            } else {
                reminderButton.disabled = true;
                reminderButton.classList.add("non-active");
            }
        }

        let deleteButton = document.createElement("button");
        deleteButton.setAttribute("class", "action-button");
        deleteButton.textContent = "Удалить";

        deleteButton.addEventListener("click", () => {
            this._handlers.deleteTask?.(task.id);
        });

        taskActionsDiv.append(deleteButton);
        taskWrapperDiv.append(taskActionsDiv);

        return taskWrapperDiv;
    }

    createReminderInput(parentDiv, task) {
        if (parentDiv.querySelector(".reminder-input")) {
            parentDiv.removeChild(parentDiv.querySelector(".reminder-input"));
            return;
        }

        let reminderInput = document.createElement("input");
        reminderInput.setAttribute("type", "datetime-local");
        reminderInput.setAttribute("name", "reminder-input");
        reminderInput.setAttribute("class", "reminder-input");

        parentDiv.prepend(reminderInput);

        reminderInput.addEventListener("change", (event) => {
            event.preventDefault();

            const chosen = reminderInput.value;

            this._handlers.setReminder?.(task.id, chosen);

            parentDiv.removeChild(reminderInput);
            reminderButton.classList.add("non-active");
            reminderButton.disabled = true;
            alert("Напоминание установлено!");
        });
    }

    bindToggleTask(handler) {
        this._handlers.toggleTask = handler;
    }

    bindDeleteTask(handler) {
        this._handlers.deleteTask = handler;
    }

    bindSetReminder(handler) {
        this._handlers.setReminder = handler;
    }

    bindAddTask(handler) {
        this.todoForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const value = this.todoInput.value.trim();
            if (!value) return;

            handler(value);

            this.todoForm.reset();
        });
    }

    bindFilterChange(handler) {
        this.filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                this.setActiveFilter(button);

                const filter = button.dataset.filter;
                handler(filter);
            });
        });
    }

    setActiveFilter(button) {
        this.filterButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
    }
}

class App {
    constructor(taskList = new TaskList(), ui = new UI()) {
        this.taskList = taskList;
        this.ui = ui;
        this.currentFilter = "all";
        this.reminderTimers = new Map();  // для таймеров
    }

    async init() {
        await this.taskList.load();

        this.ui.bindToggleTask(this.handleToggleTask.bind(this));
        this.ui.bindDeleteTask(this.handleDeleteTask.bind(this));
        this.ui.bindSetReminder(this.handleSetReminder.bind(this));
        this.ui.bindAddTask(this.handleAddTask.bind(this));
        this.ui.bindFilterChange(this.handleFilterChange.bind(this));

        this.taskList.tasks.forEach(task => {
            if (task.reminderTime) this._startReminderTimer(task);
        });

        if (this.ui.filterAllButton) this.ui.filterAllButton.classList.add("active");

        this._render();
    }

    _render() {
        const tasks = this.taskList.getFiltered(this.currentFilter);
        this.ui.renderTasks(tasks);
    }

    handleToggleTask(id) {
        this.taskList.toggleTaskComplete(id);

        const task = this.taskList.tasks.find(task => task.id === id);
        if (task && task.completed) {
            this._clearReminderTimer(id);
        }

        this._render;
    }

    handleDeleteTask(id) {
        this._clearReminderTimer(id);
        this.taskList.delete(id);
        this._render();
    }

    handleSetReminder(id, time) {
        this.taskList.setTaskReminder(id, time);

        const task = this.taskList.tasks.find(task => task.id === id);
        if (task && task.reminderTime) {
            this._startReminderTimer(task);
        }

        this._render();
    }

    handleAddTask(title) {
        this.taskList.add(title);
        this._render();
    }

    handleFilterChange(filter) {
        if (!filter) return;

        this.currentFilter = filter;
        this._render();
    }

    _startReminderTimer(task) {
        if (!task || !task.reminderTime) return;
        if (this.reminderTimers.has(task.id)) return;  //если таймер уже есть

        const id = task.id;

        const timerId = setInterval(() => {
            try {
                if (!task.reminderTime) {
                    this._clearReminderTimer(id);
                    return;
                }
                if (Date.now() >= new Date(task.reminderTime).getTime()) {
                    setTimeout(() => {
                        alert(`Пора заняться делишками: ${task.title}`);
                    }, 1000);
                    this.taskList.clearTaskReminder(id);
                    this._render();

                    this._clearReminderTimer(id);
                }
            } catch (err) {
                console.error("Ошибка в таймере:", err);
            }
        }, 10000);

        this.reminderTimers.set(id, timerId);
    }

    _clearReminderTimer(id) {
        const timer = this.reminderTimers.get(id);
        if (timer) {
            clearInterval(timer);
            this.reminderTimers.delete(id);
        }
    }
}

document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault();

    const app = new App();
    app.init();
});

