// DOM элементы
const todoForm = document.querySelector(".todos-input-form");
const todoInput = document.querySelector(".todos-input");
const addTaskButton = document.getElementById("add-button");

const tasksList = document.querySelector(".tasks-list");

const filterAllButton = document.getElementById("all-tasks");
const filterFulfilledButton = document.getElementById("fulfilled-tasks");
const filterUnfulfilledButton = document.getElementById("unfulfilled-tasks");

// глобальные переменные
let tasksArray = [];


//     ==Функции==

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
        localStorage.setItem("todoList", JSON.stringify(tasksArray));
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
}

// функция рендера списка задач
function renderTodoList(listArray) {
    tasksList.innerHTML = "";

    listArray.forEach((task) => {
        tasksList.append(createHTMLTaskWrapper(task));
    });
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
        localStorage.setItem("todoList", JSON.stringify(tasksArray));
        // renderTodoList(tasksArray);
    } catch (err) {
        console.error(err);
        alert("Не удалось удалить задачу :(");
    }
};



//      ==Обработчики событий==


// загрузка стартового состояния приложения или подгрузка сохраненных задач
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
            localStorage.setItem("todoList", JSON.stringify(tasksArray));
            renderTodoList(tasksArray);
        } catch (err) {
            console.log("Ошибка:", err);
            return null;
        }
    }
});




