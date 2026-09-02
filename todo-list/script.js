let USER = "Tony";

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
const centerTask = document.querySelector(".center-task");
const centerSectionDisplay = document.querySelector("#center-section-display");
const taskContent = document.querySelector(".center-task-content");
const savedTaskContent = document.querySelector(".saved-task-list");
const themeStorageKey = "todo-list-theme";
let draftingAnimationId = null;
let draftingDotCount = 1;
let activeSort = "recent";
const visiblePriorities = new Set(
    Array.from(filterOptions)
        .filter((filterOption) => filterOption.checked)
        .map((filterOption) => filterOption.value)
);

welcomeText.textContent = `Welcome, ${USER}`;
header.appendChild(welcomeText);

function getPreferredTheme() {
    try {
        const savedTheme = window.localStorage.getItem(themeStorageKey);

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
        window.localStorage.setItem(themeStorageKey, theme);
    } catch {
        // The selected theme remains active for the current session.
    }
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
});

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

function resizeTaskTextArea(textArea) {
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
}

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
    const savedTaskCards = Array.from(savedTaskContent.querySelectorAll(".task-card"));

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

    savedTaskContent.append(...savedTaskCards);
}

function applyPriorityFilters() {
    const savedTaskCards = savedTaskContent.querySelectorAll(".task-card");

    savedTaskCards.forEach((taskCard) => {
        const priority = taskCard.dataset.priority;
        const shouldShow = priority === undefined || visiblePriorities.has(priority);

        taskCard.classList.toggle("is-filtered-out", !shouldShow);
    });
}

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
    const firstControl = menu.querySelector("button, input");

    firstControl?.focus();
}

function getOpenDropdownMenus() {
    return Array.from(
        document.querySelectorAll(".priority-menu.is-open, .sort-menu.is-open, .filter-menu.is-open")
    );
}

function createTask() {
    const taskCard = document.createElement("article");
    const task = {
        title: "",
        description: "",
        priority: null,
        savedAt: null
    };
    const deleteButton = document.createElement("button");
    const taskNameInput = document.createElement("textarea");
    const taskDescriptionInput = document.createElement("textarea");
    const taskCardFooter = document.createElement("footer");
    const priorityControl = document.createElement("div");
    const priorityButton = document.createElement("button");
    const priorityMenu = document.createElement("div");
    const reminderButton = document.createElement("button");
    const saveButton = document.createElement("button");
    const completedButton = document.createElement("button");

    taskCard.className = "task-card";
    taskCard.taskData = task;

    deleteButton.className = "task-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");
    deleteButton.addEventListener("click", () => {
        taskCard.remove();
        updateTaskState();
    });

    taskNameInput.className = "task-name-input";
    taskNameInput.rows = 1;
    taskNameInput.wrap = "soft";
    taskNameInput.placeholder = "Task name";
    taskNameInput.required = true;
    taskNameInput.setAttribute("aria-label", "Task name");
    taskNameInput.addEventListener("input", () => {
        task.title = taskNameInput.value;
        resizeTaskTextArea(taskNameInput);
    });

    taskDescriptionInput.className = "task-description-input";
    taskDescriptionInput.rows = 3;
    taskDescriptionInput.wrap = "soft";
    taskDescriptionInput.placeholder = "Task description";
    taskDescriptionInput.required = true;
    taskDescriptionInput.setAttribute("aria-label", "Task description");
    taskDescriptionInput.addEventListener("input", () => {
        task.description = taskDescriptionInput.value;
        resizeTaskTextArea(taskDescriptionInput);
    });

    taskCardFooter.className = "task-card-footer";

    priorityControl.className = "priority-control";

    priorityButton.className = "task-footer-button task-priority-button";
    priorityButton.type = "button";
    priorityButton.textContent = "⚑ Priority";
    priorityButton.setAttribute("aria-expanded", "false");
    priorityButton.setAttribute("aria-haspopup", "true");
    priorityButton.addEventListener("click", () => {
        const menuIsOpen = !priorityMenu.classList.contains("is-open");

        closeAllDropdownMenus(priorityMenu);
        priorityMenu.classList.toggle("is-open", menuIsOpen);

        priorityButton.setAttribute("aria-expanded", menuIsOpen);

        if (menuIsOpen) {
            focusFirstDropdownControl(priorityMenu);
        }
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
                sortSavedTasks(activeSort);
                applyPriorityFilters();
            }
        });

        priorityMenu.appendChild(priorityOption);
    }

    priorityControl.append(priorityButton, priorityMenu);

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
        task.savedAt = Date.now();
        deleteButton.remove();
        saveButton.replaceWith(completedButton);
        savedTaskContent.appendChild(taskCard);
        sortSavedTasks(activeSort);
        applyPriorityFilters();
        updateTaskState();
    });

    taskCardFooter.append(priorityControl, reminderButton, saveButton);
    taskCard.append(deleteButton, taskNameInput, taskDescriptionInput, taskCardFooter);
    taskContent.appendChild(taskCard);
    updateTaskState();
    taskNameInput.focus();
}

addTaskButton.addEventListener("click", createTask);

sortButton.addEventListener("click", () => {
    const menuIsOpen = !sortMenu.classList.contains("is-open");

    closeAllDropdownMenus(sortMenu);
    sortMenu.classList.toggle("is-open", menuIsOpen);
    sortButton.setAttribute("aria-expanded", menuIsOpen);

    if (menuIsOpen) {
        focusFirstDropdownControl(sortMenu);
    }
});

sortOptions.forEach((sortOption) => {
    sortOption.addEventListener("click", () => {
        activeSort = sortOption.dataset.sort;
        sortSavedTasks(activeSort);
        sortButton.textContent = `↕ ${sortOption.textContent.trim()}`;
        sortButton.setAttribute("aria-label", `Sort saved tasks: ${sortOption.textContent.trim()}`);
        closeDropdownMenu(sortMenu, sortButton);
    });
});

filterButton.addEventListener("click", () => {
    const menuIsOpen = !filterMenu.classList.contains("is-open");

    closeAllDropdownMenus(filterMenu);
    filterMenu.classList.toggle("is-open", menuIsOpen);
    filterButton.setAttribute("aria-expanded", menuIsOpen);

    if (menuIsOpen) {
        focusFirstDropdownControl(filterMenu);
    }
});

filterOptions.forEach((filterOption) => {
    filterOption.addEventListener("change", () => {
        if (filterOption.checked) {
            visiblePriorities.add(filterOption.value);
        } else {
            visiblePriorities.delete(filterOption.value);
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
