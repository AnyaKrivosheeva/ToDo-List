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
        this._reminderTime = value;
    }

    get reminderTime() {
        return this._reminderTime;
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
            this.tasks = saved;
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

}

class App {

}