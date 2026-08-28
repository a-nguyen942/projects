let USER = "Tony";

const welcomeText = document.createElement("h1");
const header = document.querySelector(".header");
const addTaskButton = document.querySelector(".add-task-button");
const centerTask = document.querySelector(".center-task");
const taskContent = document.querySelector(".center-task-content");
const savedTaskContent = document.querySelector(".center-task-saved");

welcomeText.textContent = `Welcome, ${USER}`;
header.appendChild(welcomeText);

function updateTaskState() {
    const hasDrafts = taskContent.querySelector(".task-card") !== null;
    const hasSavedTasks = savedTaskContent.querySelector(".task-card") !== null;

    centerTask.classList.toggle("is-drafting", hasDrafts);
    centerTask.classList.toggle("has-saved-tasks", hasSavedTasks);
}

function createTask() {
    const taskCard = document.createElement("article");
    const deleteButton = document.createElement("button");
    const taskNameInput = document.createElement("input");
    const taskDescriptionInput = document.createElement("textarea");
    const taskCardFooter = document.createElement("footer");
    const priorityButton = document.createElement("button");
    const reminderButton = document.createElement("button");
    const saveButton = document.createElement("button");

    taskCard.className = "task-card";

    deleteButton.className = "task-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => {
        taskCard.remove();
        updateTaskState();
    });

    taskNameInput.className = "task-name-input";
    taskNameInput.type = "text";
    taskNameInput.placeholder = "Task name";
    taskNameInput.setAttribute("aria-label", "Task name");

    taskDescriptionInput.className = "task-description-input";
    taskDescriptionInput.placeholder = "Task description";
    taskDescriptionInput.setAttribute("aria-label", "Task description");

    taskCardFooter.className = "task-card-footer";

    priorityButton.className = "task-footer-button task-priority-button";
    priorityButton.type = "button";
    priorityButton.textContent = "⚑ Priority";

    reminderButton.className = "task-footer-button task-reminder-button";
    reminderButton.type = "button";
    reminderButton.textContent = "◷ Reminder";

    saveButton.className = "task-footer-button task-save-button";
    saveButton.type = "button";
    saveButton.textContent = "➤ Save";
    saveButton.addEventListener("click", () => {
        savedTaskContent.appendChild(taskCard);
        updateTaskState();
    });

    taskCardFooter.append(priorityButton, reminderButton, saveButton);
    taskCard.append(deleteButton, taskNameInput, taskDescriptionInput, taskCardFooter);
    taskContent.appendChild(taskCard);
    updateTaskState();
    taskNameInput.focus();
}

addTaskButton.addEventListener("click", createTask);
