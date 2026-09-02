let USER = "Tony";

const welcomeText = document.createElement("h1");
const header = document.querySelector(".header");
const addTaskButton = document.querySelector(".add-task-button");
const centerTask = document.querySelector(".center-task");
const centerSectionDisplay = document.querySelector("#center-section-display");
const taskContent = document.querySelector(".center-task-content");
const savedTaskContent = document.querySelector(".saved-task-list");
let draftingAnimationId = null;
let draftingDotCount = 1;

welcomeText.textContent = `Welcome, ${USER}`;
header.appendChild(welcomeText);

function enterDraftingState() {
    if (draftingAnimationId !== null) {
        return;
    }

    centerSectionDisplay.textContent = "Drafting.";
    draftingAnimationId = setInterval(() => {
        draftingDotCount = draftingDotCount === 3 ? 1 : draftingDotCount + 1;
        centerSectionDisplay.textContent = `Drafting${".".repeat(draftingDotCount)}`;
    }, 500);
}

function returnToOverviewState() {
    if (draftingAnimationId !== null) {
        clearInterval(draftingAnimationId);
        draftingAnimationId = null;
    }

    draftingDotCount = 1;
    centerSectionDisplay.textContent = "Overview";
}

function updateTaskState() {
    const hasDrafts = taskContent.querySelector(".task-card") !== null;
    const hasSavedTasks = savedTaskContent.querySelector(".task-card") !== null;

    centerTask.classList.toggle("is-drafting", hasDrafts);
    centerTask.classList.toggle("has-saved-tasks", hasSavedTasks);

    if (hasDrafts) {
        enterDraftingState();
    } else {
        returnToOverviewState();
    }
}

function validateTaskInput(input, message) {
    const hasText = input.value.trim().length > 0;

    input.setCustomValidity(hasText ? "" : message);
    return hasText;
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
    const completedButton = document.createElement("button");

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
    taskNameInput.required = true;
    taskNameInput.setAttribute("aria-label", "Task name");

    taskDescriptionInput.className = "task-description-input";
    taskDescriptionInput.placeholder = "Task description";
    taskDescriptionInput.required = true;
    taskDescriptionInput.setAttribute("aria-label", "Task description");

    taskCardFooter.className = "task-card-footer";

    priorityButton.className = "task-footer-button task-priority-button";
    priorityButton.type = "button";
    priorityButton.textContent = "⚑ Priority";

    reminderButton.className = "task-footer-button task-reminder-button";
    reminderButton.type = "button";
    reminderButton.textContent = "◷ Reminder";

    completedButton.className = "task-footer-button task-completed-button";
    completedButton.type = "button";
    completedButton.textContent = "✓ Completed";
    completedButton.addEventListener("click", () => {
        taskCard.remove();
        updateTaskState();
    });

    saveButton.className = "task-footer-button task-save-button";
    saveButton.type = "button";
    saveButton.textContent = "➤ Save";
    saveButton.addEventListener("click", () => {
        const hasTaskName = validateTaskInput(taskNameInput, "Enter a task name before saving.");
        const hasTaskDescription = validateTaskInput(
            taskDescriptionInput,
            "Enter a task description before saving."
        );

        if (!hasTaskName || !hasTaskDescription) {
            const invalidInput = hasTaskName ? taskDescriptionInput : taskNameInput;

            invalidInput.reportValidity();
            return;
        }

        taskCard.classList.add("is-saved");
        deleteButton.remove();
        saveButton.replaceWith(completedButton);
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
