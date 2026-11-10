/* 当前用户  */

const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if (!currentUser) {
    window.location.href = "login.html";
}


/* Timer 基础设置  */

let timerMode = "countdown";
let selectedMinutes = 25;
let remainingSeconds = selectedMinutes * 60;
let elapsedSeconds = 0;

let timerInterval = null;
let isRunning = false;
let sessionActive = false;
let sessionDistractions = 0;

let currentTaskId = null;


/* 获取元素  */

const timerDisplay = document.getElementById("timerDisplay");
const timerStatus = document.getElementById("timerStatus");
const currentTask = document.getElementById("currentTask");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");
const finishButton = document.getElementById("finishButton");

const distractionButton = document.getElementById("distractionButton");
const sessionDistractionCount = document.getElementById("sessionDistractionCount");

const focusReport = document.getElementById("focusReport");


/* 日期工具  */

function getDateKey(date = new Date()) {

    return (
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0")
    );
}

function getYesterdayKey() {

    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    return getDateKey(yesterday);
}


/* 数据存储  */

function getFocusHistory() {

    const key = `timemate_focus_history_${currentUser.id}`;

    return JSON.parse(localStorage.getItem(key)) || {};
}

function saveFocusHistory(seconds) {

    if (seconds <= 0) return;

    const key = `timemate_focus_history_${currentUser.id}`;

    const history = getFocusHistory();

    const today = getDateKey();

    history[today] =
        (Number(history[today]) || 0) + seconds;

    localStorage.setItem(key, JSON.stringify(history));
}


function getDistractionHistory() {

    const key = `timemate_distraction_history_${currentUser.id}`;

    return JSON.parse(localStorage.getItem(key)) || {};
}

function saveDistractionHistory(count) {

    if (count <= 0) return;

    const key = `timemate_distraction_history_${currentUser.id}`;

    const history = getDistractionHistory();

    const today = getDateKey();

    history[today] =
        (Number(history[today]) || 0) + count;

    localStorage.setItem(key, JSON.stringify(history));
}


/* 时间显示  */

function formatTime(totalSeconds) {

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


function updateTimerDisplay() {

    if (timerMode === "countdown") {

        timerDisplay.textContent =
            formatTime(remainingSeconds);

    } else {

        timerDisplay.textContent =
            formatTime(elapsedSeconds);

    }
}


/* 当前专注时间  */

function getCurrentFocusSeconds() {

    if (timerMode === "countdown") {

        return selectedMinutes * 60 - remainingSeconds;

    }

    return elapsedSeconds;
}


/* 当前专注时间保存  */

function saveFocusTime() {

    const currentSeconds = getCurrentFocusSeconds();

    localStorage.setItem(
        `timemate_focus_${currentUser.id}`,
        currentSeconds
    );
}


/* 分心次数记录  */

function updateDistractionDisplay() {

    sessionDistractionCount.textContent =
        sessionDistractions;
}


function recordDistraction() {

    if (!sessionActive) {

        alert("먼저 집중을 시작하세요.");

        return;
    }

    sessionDistractions++;

    updateDistractionDisplay();
}


distractionButton.addEventListener(
    "click",
    recordDistraction
);


/* Timer 开始  */

function startTimer() {

    if (isRunning) return;

    if (!sessionActive) {

        sessionActive = true;

        sessionDistractions = 0;

        updateDistractionDisplay();

        focusReport.classList.remove("show");

        distractionButton.disabled = false;
    }

    isRunning = true;

    timerStatus.textContent = "집중 중";

    timerInterval = setInterval(() => {

        if (timerMode === "countdown") {

            if (remainingSeconds > 0) {

                remainingSeconds--;

            } else {

                finishTimer();

                return;
            }

        } else {

            elapsedSeconds++;

        }

        updateTimerDisplay();

        saveFocusTime();

    }, 1000);
}


/* Timer 暂停  */

function pauseTimer() {

    if (!isRunning) return;

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    timerStatus.textContent = "일시정지";
}


/* Timer 初始化  */

function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    sessionActive = false;

    sessionDistractions = 0;

    remainingSeconds = selectedMinutes * 60;

    elapsedSeconds = 0;

    timerStatus.textContent = "대기 중";

    updateTimerDisplay();

    updateDistractionDisplay();

    distractionButton.disabled = true;

    focusReport.classList.remove("show");
}


/* 专注报告  */

function formatReportTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    if (hours > 0) {

        return `${hours}시간 ${remainingMinutes}분`;

    }

    return `${remainingMinutes}분`;
}


function showFocusReport(sessionSeconds) {

    const focusHistory = getFocusHistory();

    const distractionHistory = getDistractionHistory();

    const today = getDateKey();

    const yesterday = getYesterdayKey();

    const todayFocus =
        Number(focusHistory[today]) || 0;

    const todayDistractions =
        Number(distractionHistory[today]) || 0;

    const yesterdayDistractions =
        Number(distractionHistory[yesterday]) || 0;


    document.getElementById("reportSessionTime").textContent =
        formatReportTime(sessionSeconds);

    document.getElementById("reportSessionDistractions").textContent =
        `${sessionDistractions}회`;

    document.getElementById("reportTodayFocus").textContent =
        formatReportTime(todayFocus);

    document.getElementById("reportTodayDistractions").textContent =
        `${todayDistractions}회`;

    document.getElementById("reportYesterdayDistractions").textContent =
        `${yesterdayDistractions}회`;


    const analysis =
        document.getElementById("reportAnalysis");


    if (todayDistractions < yesterdayDistractions) {

        analysis.textContent =
            `어제보다 딴짓 횟수가 ${
                yesterdayDistractions - todayDistractions
            }회 감소했어요! 오늘의 집중 습관이 좋아지고 있어요.`;

    } else if (todayDistractions > yesterdayDistractions) {

        analysis.textContent =
            `어제보다 딴짓 횟수가 ${
                todayDistractions - yesterdayDistractions
            }회 증가했어요. 다음 집중 시간에는 조금 더 집중해 보세요!`;

    } else {

        analysis.textContent =
            "어제와 오늘의 딴짓 횟수가 같아요. 꾸준히 집중 습관을 만들어 보세요!";

    }

    focusReport.classList.add("show");

    focusReport.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* Timer 完成  */

function finishTimer() {

    if (!sessionActive) return;

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    sessionActive = false;

    const currentSeconds = getCurrentFocusSeconds();

    // 保存本轮专注时间
    saveFocusTime();

    // 保存每日专注记录
    saveFocusHistory(currentSeconds);

    // 保存每日分心记录
    saveDistractionHistory(sessionDistractions);


    // 保存到当前 To-Do
    if (currentTaskId !== null) {

        const todos = getTodos();

        const task = todos.find(function(item) {

            return item.id === currentTaskId;

        });

        if (task) {

            task.focusTime =
                (task.focusTime || 0) + currentSeconds;

            saveTodos(todos);

            renderTodos();
        }
    }

    timerStatus.textContent = "완료";

    distractionButton.disabled = true;

    // 显示最终报告
    showFocusReport(currentSeconds);

    alert("집중 시간이 종료되었습니다!");
}


/* Timer 按钮  */

startButton.addEventListener(
    "click",
    startTimer
);

pauseButton.addEventListener(
    "click",
    pauseTimer
);

resetButton.addEventListener(
    "click",
    resetTimer
);

finishButton.addEventListener(
    "click",
    finishTimer
);


/* Timer 模式切换  */

const modeButtons =
    document.querySelectorAll(".mode-button");

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (isRunning) {

            pauseTimer();

        }

        modeButtons.forEach(item => {

            item.classList.remove("active");

        });

        button.classList.add("active");

        timerMode = button.dataset.mode;

        resetTimer();

    });

});


/* 预设时间  */

const presetButtons =
    document.querySelectorAll(".preset-button");

presetButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (isRunning) {

            pauseTimer();

        }

        presetButtons.forEach(item => {

            item.classList.remove("selected");

        });

        button.classList.add("selected");

        selectedMinutes =
            Number(button.dataset.minutes);

        resetTimer();

    });

});


/* To-Do 数据  */

function getTodoStorageKey() {

    return `timemate_todos_${currentUser.id}`;

}


function getTodos() {

    const data = localStorage.getItem(
        getTodoStorageKey()
    );

    if (!data) {

        return [];

    }

    return JSON.parse(data);

}


function saveTodos(todos) {

    localStorage.setItem(
        getTodoStorageKey(),
        JSON.stringify(todos)
    );

}


/* To-Do 元素  */

const todoInput =
    document.getElementById("todoInput");

const addTodoButton =
    document.getElementById("addTodoButton");

const todoList =
    document.getElementById("todoList");

const todoCount =
    document.getElementById("todoCount");


/* 添加 To-Do  */

function addTodo() {

    const text = todoInput.value.trim();

    if (!text) {

        alert("할 일을 입력하세요.");

        return;
    }

    const todos = getTodos();

    const newTodo = {

        id: Date.now(),

        text: text,

        completed: false,

        focusTime: 0

    };

    todos.push(newTodo);

    saveTodos(todos);

    todoInput.value = "";

    renderTodos();

}


/* To-Do 渲染  */

function renderTodos() {

    const todos = getTodos();

    todoList.innerHTML = "";

    if (todos.length === 0) {

        todoList.innerHTML = `
            <div class="empty-todo">
                아직 등록된 할 일이 없습니다.
            </div>
        `;

        todoCount.textContent = "0개";

        return;
    }

    todos.forEach(todo => {

        const item = document.createElement("div");

        item.className = "todo-item";

        if (todo.completed) {

            item.classList.add("completed");

        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked = todo.completed;

        checkbox.addEventListener("change", () => {

            toggleTodo(todo.id);

        });


        // To-Do 文字
        const text = document.createElement("span");

        text.className = "todo-text";

        text.textContent = todo.text;


        // 操作区域
        const actions = document.createElement("div");

        actions.className = "todo-actions";


        // 集中开始
        const focusButton = document.createElement("button");

        focusButton.textContent = "집중";

        focusButton.addEventListener("click", () => {

            selectTask(todo);

        });


        // 删除
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "삭제";

        deleteButton.addEventListener("click", () => {

            deleteTodo(todo.id);

        });


        actions.appendChild(focusButton);

        actions.appendChild(deleteButton);

        item.appendChild(checkbox);

        item.appendChild(text);

        item.appendChild(actions);

        todoList.appendChild(item);

    });


    const unfinished = todos.filter(
        todo => !todo.completed
    ).length;

    todoCount.textContent = `${unfinished}개`;

}


/* 选择当前任务  */

function selectTask(todo) {

    currentTaskId = todo.id;

    currentTask.textContent = todo.text;

    timerStatus.textContent = "준비";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* 完成 / 取消完成  */

function toggleTodo(id) {

    const todos = getTodos();

    const todo = todos.find(
        item => item.id === id
    );

    if (!todo) return;

    todo.completed = !todo.completed;

    saveTodos(todos);

    renderTodos();

}


/* 删除 To-Do  */

function deleteTodo(id) {

    const todos = getTodos();

    const filtered = todos.filter(
        todo => todo.id !== id
    );

    saveTodos(filtered);

    if (currentTaskId === id) {

        currentTaskId = null;

        currentTask.textContent =
            "할 일을 선택하세요";

    }

    renderTodos();

}


/* 添加按钮  */

addTodoButton.addEventListener(
    "click",
    addTodo
);


todoInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            addTodo();

        }

    }
);


/* 登出  */

const logoutButton =
    document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    window.location.href = "login.html";

});


/* 页面加载*/

renderTodos();

updateTimerDisplay();

updateDistractionDisplay();

distractionButton.disabled = true;

focusReport.classList.remove("show");