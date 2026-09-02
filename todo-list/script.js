const USER_NAME = "Tony";
const THEME_STORAGE_KEY = "todo-list-theme";

const welcomeText = document.createElement("h1");
const header = document.querySelector(".header");
const themeToggle = document.querySelector(".theme-toggle");
const addTaskButton = document.querySelector(".add-task-button");
const sortButton = document.querySelector(".sort-button");
const sortMenu = document.querySelector(".sort-menu");
const sortOptions = document.querySelectorAll(".sort-option");
const filterButton = document.querySelector(".filter-button");
const filterMenu = document.querySelector(".filter-menu");
const filterOptions = document.querySelectorAll(".filter-option input");
const taskPanel = document.querySelector(".center-task");
const viewHeading = document.querySelector("#center-section-display");
const draftTaskList = document.querySelector(".center-task-content");
const savedTaskList = document.querySelector(".saved-task-list");

const appState = {
    draftingAnimationId: null,
    draftingDotCount: 1,
    activeSort: "recent",
    visiblePriorities: new Set(
        Array.from(filterOptions)
            .filter((filterOption) => filterOption.checked)
            .map((filterOption) => filterOption.value)
    )
};

// Theme

function getPreferredTheme() {
    try {
        const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
    } catch {
        // Theme switching still works if local storage is unavailable.
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    const isDarkMode = theme === "dark";
    const toggleLabel = isDarkMode
        ? "Switch to light mode"
        : "Switch to dark mode";

    document.body.classList.toggle("dark-mode", isDarkMode);
    themeToggle.setAttribute("aria-pressed", String(isDarkMode));
    themeToggle.setAttribute("aria-label", toggleLabel);
    themeToggle.title = toggleLabel;
}

function saveTheme(theme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // The selected theme remains active for the current session.
    }
}

// Task view state

function enterDraftingState() {
    if (appState.draftingAnimationId !== null) {
        return;
    }

    viewHeading.textContent = "Drafting.";
    appState.draftingAnimationId = setInterval(() => {
        appState.draftingDotCount = appState.draftingDotCount === 3
            ? 1
            : appState.draftingDotCount + 1;
        viewHeading.textContent = `Drafting${".".repeat(appState.draftingDotCount)}`;
    }, 500);
}

function returnToOverviewState() {
    if (appState.draftingAnimationId !== null) {
        clearInterval(appState.draftingAnimationId);
        appState.draftingAnimationId = null;
    }

    appState.draftingDotCount = 1;
    viewHeading.textContent = "Overview";
}

function updateTaskState() {
    const hasDrafts = draftTaskList.querySelector(".task-card") !== null;
    const hasSavedTasks = savedTaskList.querySelector(".task-card") !== null;

    taskPanel.classList.toggle("is-drafting", hasDrafts);
    taskPanel.classList.toggle("has-saved-tasks", hasSavedTasks);

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

function resizeTaskTextArea(textArea) {
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

// Saved-task sorting and filtering

function comparePriorities(firstCard, secondCard, lowToHigh) {
    const firstPriority = firstCard.taskData.priority;
    const secondPriority = secondCard.taskData.priority;

    if (firstPriority === null && secondPriority === null) {
        return 0;
    }

    if (firstPriority === null) {
        return 1;
    }

    if (secondPriority === null) {
        return -1;
    }

    return lowToHigh
        ? secondPriority - firstPriority
        : firstPriority - secondPriority;
}

function sortSavedTasks(sortType) {
    const savedTaskCards = Array.from(savedTaskList.querySelectorAll(".task-card"));

    savedTaskCards.sort((firstCard, secondCard) => {
        if (sortType === "recent") {
            return secondCard.taskData.savedAt - firstCard.taskData.savedAt;
        }

        return comparePriorities(
            firstCard,
            secondCard,
            sortType === "priority-low-high"
        );
    });

    savedTaskList.append(...savedTaskCards);
}

function applyPriorityFilters() {
    const savedTaskCards = savedTaskList.querySelectorAll(".task-card");

    savedTaskCards.forEach((taskCard) => {
        const priority = taskCard.dataset.priority;
        const shouldShow = priority === undefined
            || appState.visiblePriorities.has(priority);

        taskCard.classList.toggle("is-filtered-out", !shouldShow);
    });
}

// Dropdown menus

function closeDropdownMenu(menu, button) {
    menu.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
}

function closeAllDropdownMenus(exceptMenu = null) {
    if (sortMenu !== exceptMenu) {
        closeDropdownMenu(sortMenu, sortButton);
    }

    if (filterMenu !== exceptMenu) {
        closeDropdownMenu(filterMenu, filterButton);
    }

    document.querySelectorAll(".priority-menu").forEach((priorityMenu) => {
        if (priorityMenu !== exceptMenu) {
            const priorityButton = priorityMenu
                .closest(".priority-control")
                .querySelector(".task-priority-button");

            closeDropdownMenu(priorityMenu, priorityButton);
        }
    });
}

function focusFirstDropdownControl(menu) {
    menu.querySelector("button, input")?.focus();
}

function getOpenDropdownMenus() {
    return Array.from(
        document.querySelectorAll(
            ".priority-menu.is-open, .sort-menu.is-open, .filter-menu.is-open"
        )
    );
}

function toggleDropdownMenu(menu, button) {
    const menuIsOpen = !menu.classList.contains("is-open");

    closeAllDropdownMenus(menu);
    menu.classList.toggle("is-open", menuIsOpen);
    button.setAttribute("aria-expanded", String(menuIsOpen));

    if (menuIsOpen) {
        focusFirstDropdownControl(menu);
    }
}

// Task-card creation

function createTaskData() {
    return {
        title: "",
        description: "",
        priority: null,
        savedAt: null
    };
}

function createTaskTextArea({ className, rows, placeholder, label, onInput }) {
    const textArea = document.createElement("textarea");

    textArea.className = className;
    textArea.rows = rows;
    textArea.wrap = "soft";
    textArea.placeholder = placeholder;
    textArea.required = true;
    textArea.setAttribute("aria-label", label);
    textArea.addEventListener("input", () => {
        onInput(textArea.value);
        resizeTaskTextArea(textArea);
    });

    return textArea;
}

function createDeleteButton(taskCard) {
    const deleteButton = document.createElement("button");

    deleteButton.className = "task-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => {
        taskCard.remove();
        updateTaskState();
    });

    return deleteButton;
}

function createPriorityControl(taskCard, task) {
    const priorityControl = document.createElement("div");
    const priorityButton = document.createElement("button");
    const priorityMenu = document.createElement("div");

    priorityControl.className = "priority-control";
    priorityButton.className = "task-footer-button task-priority-button";
    priorityButton.type = "button";
    priorityButton.textContent = "⚑ Priority";
    priorityButton.setAttribute("aria-expanded", "false");
    priorityButton.setAttribute("aria-haspopup", "true");
    priorityButton.addEventListener("click", () => {
        toggleDropdownMenu(priorityMenu, priorityButton);
    });

    priorityMenu.className = "priority-menu";
    priorityMenu.setAttribute("aria-label", "Choose task priority");

    for (let priority = 1; priority <= 4; priority += 1) {
        const priorityOption = document.createElement("button");

        priorityOption.className = `priority-option priority-option-${priority}`;
        priorityOption.type = "button";
        priorityOption.textContent = priority;
        priorityOption.setAttribute("aria-label", `Set priority to ${priority}`);
        priorityOption.addEventListener("click", () => {
            task.priority = priority;
            taskCard.dataset.priority = priority;
            priorityButton.textContent = `⚑ Priority ${priority}`;
            closeDropdownMenu(priorityMenu, priorityButton);

            if (taskCard.classList.contains("is-saved")) {
                sortSavedTasks(appState.activeSort);
                applyPriorityFilters();
            }
        });

        priorityMenu.appendChild(priorityOption);
    }

    priorityControl.append(priorityButton, priorityMenu);
    return priorityControl;
}

function createReminderButton() {
    const reminderButton = document.createElement("button");

    reminderButton.className = "task-footer-button task-reminder-button";
    reminderButton.type = "button";
    reminderButton.textContent = "◷ Reminder";

    return reminderButton;
}

function completeTask(taskCard) {
    if (taskCard.classList.contains("is-completing")) {
        return;
    }

    taskCard.classList.add("is-completing");
    taskCard.addEventListener("animationend", () => {
        taskCard.remove();
        updateTaskState();
    }, { once: true });
}

function createCompletedButton(taskCard) {
    const completedButton = document.createElement("button");

    completedButton.className = "task-footer-button task-completed-button";
    completedButton.type = "button";
    completedButton.textContent = "✓ Completed";
    completedButton.addEventListener("click", () => completeTask(taskCard));

    return completedButton;
}

function createSaveButton(
    taskCard,
    task,
    taskNameInput,
    taskDescriptionInput,
    deleteButton,
    completedButton
) {
    const saveButton = document.createElement("button");

    saveButton.className = "task-footer-button task-save-button";
    saveButton.type = "button";
    saveButton.textContent = "➤ Save";
    saveButton.addEventListener("click", () => {
        const hasTaskName = validateTaskInput(
            taskNameInput,
            "Enter a task name before saving."
        );
        const hasTaskDescription = validateTaskInput(
            taskDescriptionInput,
            "Enter a task description before saving."
        );

        if (!hasTaskName || !hasTaskDescription) {
            const invalidInput = hasTaskName
                ? taskDescriptionInput
                : taskNameInput;

            invalidInput.reportValidity();
            return;
        }

        taskCard.classList.add("is-saved");
        task.savedAt = Date.now();
        deleteButton.remove();
        saveButton.replaceWith(completedButton);
        savedTaskList.appendChild(taskCard);
        sortSavedTasks(appState.activeSort);
        applyPriorityFilters();
        updateTaskState();
    });

    return saveButton;
}

function createTask() {
    const task = createTaskData();
    const taskCard = document.createElement("article");
    const deleteButton = createDeleteButton(taskCard);
    const taskNameInput = createTaskTextArea({
        className: "task-name-input",
        rows: 1,
        placeholder: "Task name",
        label: "Task name",
        onInput: (value) => {
            task.title = value;
        }
    });
    const taskDescriptionInput = createTaskTextArea({
        className: "task-description-input",
        rows: 3,
        placeholder: "Task description",
        label: "Task description",
        onInput: (value) => {
            task.description = value;
        }
    });
    const priorityControl = createPriorityControl(taskCard, task);
    const reminderButton = createReminderButton();
    const completedButton = createCompletedButton(taskCard);
    const saveButton = createSaveButton(
        taskCard,
        task,
        taskNameInput,
        taskDescriptionInput,
        deleteButton,
        completedButton
    );
    const taskCardFooter = document.createElement("footer");

    taskCard.className = "task-card";
    taskCard.taskData = task;
    taskCardFooter.className = "task-card-footer";
    taskCardFooter.append(priorityControl, reminderButton, saveButton);
    taskCard.append(
        deleteButton,
        taskNameInput,
        taskDescriptionInput,
        taskCardFooter
    );
    draftTaskList.appendChild(taskCard);
    updateTaskState();
    taskNameInput.focus();
}

// App setup

function initializeApp() {
    welcomeText.textContent = `Welcome, ${USER_NAME}`;
    header.appendChild(welcomeText);
    applyTheme(getPreferredTheme());

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("dark-mode")
            ? "light"
            : "dark";

        applyTheme(nextTheme);
        saveTheme(nextTheme);
    });

    addTaskButton.addEventListener("click", createTask);

    sortButton.addEventListener("click", () => {
        toggleDropdownMenu(sortMenu, sortButton);
    });

    sortOptions.forEach((sortOption) => {
        sortOption.addEventListener("click", () => {
            appState.activeSort = sortOption.dataset.sort;
            sortSavedTasks(appState.activeSort);
            sortButton.textContent = `↕ ${sortOption.textContent.trim()}`;
            sortButton.setAttribute(
                "aria-label",
                `Sort saved tasks: ${sortOption.textContent.trim()}`
            );
            closeDropdownMenu(sortMenu, sortButton);
        });
    });

    filterButton.addEventListener("click", () => {
        toggleDropdownMenu(filterMenu, filterButton);
    });

    filterOptions.forEach((filterOption) => {
        filterOption.addEventListener("change", () => {
            if (filterOption.checked) {
                appState.visiblePriorities.add(filterOption.value);
            } else {
                appState.visiblePriorities.delete(filterOption.value);
            }

            applyPriorityFilters();
        });
    });

    document.addEventListener("click", (event) => {
        const openMenus = getOpenDropdownMenus();
        const clickedOpenMenu = openMenus.some((menu) => menu.contains(event.target));

        if (openMenus.length > 0 && !clickedOpenMenu) {
            closeAllDropdownMenus();
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllDropdownMenus();
        }
    });
}

initializeApp();
