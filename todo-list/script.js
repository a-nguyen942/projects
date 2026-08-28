let USER = "Tony";

const welcomeText = document.createElement("h1");
const header = document.querySelector(".header");
const addTaskButton = document.querySelector(".add-task-button");
const taskContent = document.querySelector(".center-task-content");

welcomeText.textContent = `Welcome, ${USER}`;
header.appendChild(welcomeText);

function createTask() {
    const taskCard = document.createElement("article");
    const deleteButton = document.createElement("button");
    const taskNameInput = document.createElement("input");
    const taskDescriptionInput = document.createElement("textarea");
    const taskCardFooter = document.createElement("footer");

    taskCard.className = "task-card";

    deleteButton.className = "task-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => taskCard.remove());

    taskNameInput.className = "task-name-input";
    taskNameInput.type = "text";
    taskNameInput.placeholder = "Task name";
    taskNameInput.setAttribute("aria-label", "Task name");

    taskDescriptionInput.className = "task-description-input";
    taskDescriptionInput.placeholder = "Task description";
    taskDescriptionInput.setAttribute("aria-label", "Task description");

    taskCardFooter.className = "task-card-footer";

    taskCard.append(deleteButton, taskNameInput, taskDescriptionInput, taskCardFooter);
    taskContent.appendChild(taskCard);
    taskNameInput.focus();
}

addTaskButton.addEventListener("click", createTask);
