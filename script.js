// DOM элементы
const todoForm = document.querySelector(".todos-input-form");
const todoInput = document.querySelector(".todos-input");
const addTaskButton = document.getElementById("add-button");

const tasksList = document.querySelector(".tasks-list");

const filterButtons = document.querySelectorAll(".filter");
const filterAllButton = document.getElementById("all-tasks");
const filterFulfilledButton = document.getElementById("fulfilled-tasks");
const filterUnfulfilledButton = document.getElementById("unfulfilled-tasks");

// глобальные переменные
let tasksArray = [];

// классы
class Task {
    constructor(title, completed = false, userId = 1, id = Date.now()) {
        this.title = title;
        this.completed = completed;
        this._userId = userId;
        this._id = id;
    }

    get userId() {
        return this._userId;
    }

    get id() {
        return this._id;
    }
}

// ==Функции==

// функция обновления состояния localStorage
function updateLocalStorage() {
    localStorage.setItem("todoList", JSON.stringify(tasksArray));
};

//функция создания карточки задачи
function createHTMLTaskWrapper(taskObj) {
    let taskWrapperDiv = document.createElement("div");
    taskWrapperDiv.setAttribute("class", "task-wrapper");
    taskWrapperDiv.setAttribute("data-id", taskObj.id);

    let taskContentDiv = document.createElement("div");
    taskContentDiv.setAttribute("class", "task-content");
    let taskCheckbox = document.createElement("input");
    taskCheckbox.setAttribute("type", "checkbox");
    taskCheckbox.setAttribute("name", "task-checkbox");
    taskCheckbox.setAttribute("class", "task-checkbox");
    taskCheckbox.checked = taskObj.completed;
    taskCheckbox.addEventListener("change", () => {
        taskObj.completed = taskCheckbox.checked;
        updateLocalStorage();

        setTimeout(applyCurrentFilter, 500);
    });
    taskContentDiv.append(taskCheckbox);
    let taskText = document.createElement("span");
    taskText.setAttribute("class", "task-text");
    taskText.textContent = taskObj.title;
    taskContentDiv.append(taskText);
    taskWrapperDiv.append(taskContentDiv);

    let taskActionsDiv = document.createElement("div");
    taskActionsDiv.setAttribute("class", "task-actions");
    let reminderButton = document.createElement("button");
    reminderButton.setAttribute("id", "reminder-button");
    let bellImage = document.createElement("img");
    bellImage.setAttribute("src", "./images/bell2.svg");
    bellImage.setAttribute("alt", "Колокольчик");
    bellImage.setAttribute("style", "width: 24px; height: 24px;");
    reminderButton.append(bellImage);
    taskActionsDiv.append(reminderButton);
    let deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "action-button");
    deleteButton.textContent = "Удалить";
    deleteButton.addEventListener("click", () => {
        deleteTask(taskObj.id);
    });
    taskActionsDiv.append(deleteButton);
    taskWrapperDiv.append(taskActionsDiv);

    return taskWrapperDiv;
};

// функция рендера списка задач
function renderTodoList(listArray) {
    tasksList.innerHTML = "";

    listArray.forEach((task) => {
        tasksList.append(createHTMLTaskWrapper(task));
    });
};

// функция применения фильтра
function applyCurrentFilter() {
    switch (getActiveFilter()) {
        case "all":
            renderTodoList(tasksArray);
            break;
        case "fulfilled":
            const fulfilledArray = tasksArray.filter(task => task.completed === true);
            renderTodoList(fulfilledArray);
            break;
        case "unfulfilled":
            const unfulfilledArray = tasksArray.filter(task => task.completed === false);
            renderTodoList(unfulfilledArray);
            break;
    }
};

// функция возвращающая активный фильтр 
function getActiveFilter() {
    if (filterFulfilledButton.classList.contains("active")) return "fulfilled";
    if (filterUnfulfilledButton.classList.contains("active")) return "unfulfilled";
    return "all";
};

// функция удаления задачи
async function deleteTask(id) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        const taskToDelete = document.querySelector(`[data-id="${id}"]`);
        if (taskToDelete) taskToDelete.remove();
        tasksArray = tasksArray.filter(task => task.id !== id);
        updateLocalStorage();
    } catch (err) {
        console.error(err);
        alert("Не удалось удалить задачу :(");
    }
};



//  ==Обработчики событий==

// обработчик формы
todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newTaskObject = new Task(todoInput.value.trim());
    if (!todoInput.value.trim()) return;

    tasksArray.push(newTaskObject);
    updateLocalStorage();

    tasksList.append(createHTMLTaskWrapper(newTaskObject));
    todoForm.reset();

    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos", {  //имитируем отправку данных на сервер(поэтому не ждем ответа сервера а сразу рендерим задачу)
            method: "POST",
            body: JSON.stringify(newTaskObject),
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
});

// кнопка фильтра всех задач
filterAllButton.addEventListener("click", () => {
    filterButtons.forEach(button => button.classList.remove("active"));
    filterAllButton.classList.add("active");

    renderTodoList(tasksArray);
});

// кнопка фильтра выполненных задач
filterFulfilledButton.addEventListener("click", () => {
    filterButtons.forEach(button => button.classList.remove("active"));
    filterFulfilledButton.classList.add("active");

    const filteredArray = tasksArray.filter(task => task.completed === true);

    renderTodoList(filteredArray);
});

//кнопка фильра невыполненных задач
filterUnfulfilledButton.addEventListener("click", () => {
    filterButtons.forEach(button => button.classList.remove("active"));
    filterUnfulfilledButton.classList.add("active");

    const filteredArray = tasksArray.filter(task => task.completed === false);

    renderTodoList(filteredArray);
});



// == загрузка стартового состояния приложения или подгрузка сохраненных задач ==
document.addEventListener("DOMContentLoaded", async (event) => {
    event.preventDefault();

    if (localStorage.getItem("todoList")) {
        tasksArray = JSON.parse(localStorage.getItem("todoList"));
        renderTodoList(tasksArray);
    } else {
        try {
            const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=7");
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            const tasks = await response.json();

            tasksArray = tasks;
            updateLocalStorage();
            renderTodoList(tasksArray);
            filterAllButton.classList.add("active");
        } catch (err) {
            console.log("Ошибка:", err);
            return null;
        }
    }
});




