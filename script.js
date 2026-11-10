// 检查登录状态로그인 상태 확인

const currentUser =
    JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
    window.location.href = "login.html";
} else {
    document.getElementById("welcomeMessage").textContent =
        `Hi, ${currentUser.name}! 👋`;
}
// 导入当前用户的日程현재 사용자의 일정 가져오기
function getUserSchedules() {
    const allSchedules =
        JSON.parse(localStorage.getItem("schedules")) || {};
    return allSchedules[currentUser.id] || [];
}
// 保存日程 일정 저장
function saveUserSchedules(schedules) {
    const allSchedules =
        JSON.parse(localStorage.getItem("schedules")) || {};
    allSchedules[currentUser.id] = schedules;
    localStorage.setItem(
        "schedules",
        JSON.stringify(allSchedules)
    );
}
// 之前日程 지난 일정 확인
function isPastDate(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate =
        new Date(dateString + "T00:00:00");
    return scheduleDate < today;
}
// 顯示日程 일정 표시
function displaySchedules() {
    const list =
        document.getElementById("scheduleList");
    list.innerHTML = "";
    const schedules =
        getUserSchedules();
    const upcomingSchedules = [];
    const pastSchedules = [];
    schedules.forEach(function(schedule) {
        if (isPastDate(schedule.date)) {
            pastSchedules.push(schedule);
        } else {
            upcomingSchedules.push(schedule);
        }
    });
    // 预定日程按日期顺序 예정된 일정 날짜순
    upcomingSchedules.sort(function(a, b) {
        return a.date.localeCompare(b.date);
    });
    // 往期日程最新排序지난 일정 최신순
    pastSchedules.sort(function(a, b) {
        return b.date.localeCompare(a.date);
    });
    // 预定日程 예정된 일정
    if (upcomingSchedules.length > 0) {
        const title =
            document.createElement("h3");
        title.textContent = "예정된 일정";
        title.className =
            "schedule-section-title";
        list.appendChild(title);
        upcomingSchedules.forEach(function(schedule) {
            createScheduleElement(
                schedule,
                false
            );
        });
    }
    // 往期日程지난 일정
    if (pastSchedules.length > 0) {
        const title =
            document.createElement("h3");
        title.textContent = "지난 일정";
        title.className =
            "schedule-section-title past-title";
        list.appendChild(title);
        pastSchedules.forEach(function(schedule) {
            createScheduleElement(
                schedule,
                true
            );
        });
    }
}
// 创建一个日程 일정 하나 만들기
function createScheduleElement(schedule, isPast) {
    const list =
        document.getElementById("scheduleList");
    const li =
        document.createElement("li");
    if (isPast) {
        li.classList.add("past-schedule");
    }
    li.innerHTML = `
        <span>
            ${schedule.date} - ${schedule.title}
        </span>
        <div class="schedule-buttons">
            <button
                class="edit-button"
                onclick="editSchedule(${schedule.id})">
                수정
            </button>
            <button
                class="delete-button"
                onclick="deleteSchedule(${schedule.id})">
                삭제
            </button>
        </div>
    `;
    list.appendChild(li);
}
// 添加日程 일정 추가
function addSchedule() {
    const date =
        document.getElementById("date").value;
    const title =
        document.getElementById("schedule").value.trim();
    if (date === "" || title === "") {
        alert("날짜와 일정을 입력해주세요.");
        return;
    }
    const schedules =
        getUserSchedules();
    const newSchedule = {
        id: Date.now(),
        date: date,
        title: title
    };
    schedules.push(newSchedule);
    saveUserSchedules(schedules);
    displaySchedules();
    renderCalendar();
    updateDashboard();
    document.getElementById("schedule").value = "";
    document.getElementById("date").value = "";
}
// 修改日程 일정 수정
function editSchedule(id) {
    const schedules =
        getUserSchedules();
    const schedule =
        schedules.find(function(item) {
            return item.id === id;
        });
    if (!schedule) {
        return;
    }
    //  现有内容输入到输入框 기존 내용을 입력창에 넣기
    document.getElementById("date").value =
        schedule.date;
    document.getElementById("schedule").value =
        schedule.title;
    // 移动到输入框 입력창으로 이동
    document.getElementById("date").focus();
    // 保存当前修改的日程ID 현재 수정 중인 일정 ID 저장
    window.editingScheduleId = id;
    // 更改添加按钮 추가 버튼 변경
    const addButton =
        document.querySelector(".schedule-input button");
    addButton.textContent = "수정 완료";
    addButton.onclick = finishEditSchedule;
}
// 修改完成  수정 완료
function finishEditSchedule() {
    const date =
        document.getElementById("date").value;
    const title =
        document.getElementById("schedule").value.trim();
    if (date === "" || title === "") {
        alert("날짜와 일정을 입력해주세요.");
        return;
    }
    const schedules =
        getUserSchedules();
    const schedule =
        schedules.find(function(item) {
            return item.id === window.editingScheduleId;
        });
    if (!schedule) {
        return;
    }
    // 更改内容 내용 변경
    schedule.date = date;
    schedule.title = title;
    // 保存 저장
    // 刷新屏幕 화면 갱신
    saveUserSchedules(schedules);
    displaySchedules();
    renderCalendar();
    updateDashboard();
    // 初始化输入框입력창 초기화
    document.getElementById("date").value = "";
    document.getElementById("schedule").value = "";
    // 按原样按钮 버튼 원래대로
    const addButton =
        document.querySelector(".schedule-input button");
    addButton.textContent = "추가";
    addButton.onclick = addSchedule;
    // 修正状态结束 수정 상태 종료
    window.editingScheduleId = null;
}
// 删除日程 일정 삭제
function deleteSchedule(id) {
    const schedules =
        getUserSchedules();
    const newSchedules =
        schedules.filter(function(schedule) {
            return schedule.id !== id;
        });
    saveUserSchedules(newSchedules);
    displaySchedules();
    renderCalendar();
    updateDashboard();
}
// 退出 로그아웃
const logoutButton =
    document.getElementById("logoutButton");
logoutButton.addEventListener("click", function() {
    // 只删除登录信息로그인 정보만 삭제
    // 日程数据不删除 일정 데이터는 삭제하지 않음
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

// 更新 Dashboard 数据
function updateDashboard() {
    // 1. 오늘 날짜
    const today = new Date();
    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");
    // 2. 오늘의 일정
    const schedules = getUserSchedules();
    const todaySchedules =
        schedules.filter(function(schedule) {
            return schedule.date === todayString;
        });
    document.getElementById("todayScheduleCount").textContent =
        todaySchedules.length;
    // 3. 오늘의 할 일
    const todoKey =
        `timemate_todos_${currentUser.id}`;
    const todos =
        JSON.parse(localStorage.getItem(todoKey)) || [];
    const unfinishedTodos =
        todos.filter(function(todo) {
            return !todo.completed;
        });
    document.getElementById("todayTodoCount").textContent =
        unfinishedTodos.length;
        // 4. 집중 시간
const focusKey =
    `timemate_focus_${currentUser.id}`;
const focusSeconds =
    Number(localStorage.getItem(focusKey)) || 0;
const focusMinutes =
    Math.floor(focusSeconds / 60);
const focusSecondsOnly =
    focusSeconds % 60;
document.getElementById("todayFocusTime").textContent =
    String(focusMinutes).padStart(2, "0") +
    ":" +
    String(focusSecondsOnly).padStart(2, "0");
}


/* 월간 캘린더 */

let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let selectedCalendarDate = formatCalendarDate(new Date());

function formatCalendarDate(date) {
    return (
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0")
    );
}

function renderCalendar() {
    const calendarDays = document.getElementById("calendarDays");
    const calendarMonthLabel = document.getElementById("calendarMonth");

    if (!calendarDays || !calendarMonthLabel) return;

    calendarDays.innerHTML = "";

    calendarMonthLabel.textContent =
        `${calendarYear}년 ${calendarMonth + 1}월`;

    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const lastDate = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const todayString = formatCalendarDate(new Date());
    const schedules = getUserSchedules();

    // 按日期统计日程数量
    const scheduleCounts = {};

    schedules.forEach(function(schedule) {
        if (!scheduleCounts[schedule.date]) {
            scheduleCounts[schedule.date] = 0;
        }
        scheduleCounts[schedule.date]++;
    });

    // 月初之前的空白格
    for (let i = 0; i < startWeekday; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        emptyCell.setAttribute("aria-hidden", "true");
        calendarDays.appendChild(emptyCell);
    }

    // 当月日期
    for (let day = 1; day <= lastDate; day++) {
        const dateString =
            `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "calendar-day";

        if (dateString === todayString) {
            button.classList.add("today");
        }

        if (dateString === selectedCalendarDate) {
            button.classList.add("selected");
        }

        const dayNumber = document.createElement("span");
        dayNumber.className = "day-number";
        dayNumber.textContent = day;
        button.appendChild(dayNumber);

        const count = scheduleCounts[dateString] || 0;

        if (count > 0) {
            const dot = document.createElement("span");
            dot.className = "day-event-dot";
            button.appendChild(dot);

            const countLabel = document.createElement("span");
            countLabel.className = "day-event-count";
            countLabel.textContent = `${count}개`;
            button.appendChild(countLabel);
        }

        button.setAttribute(
            "aria-label",
            count > 0 ? `${dateString}, 일정 ${count}개` : dateString
        );

        button.addEventListener("click", function() {
            selectedCalendarDate = dateString;

            // 选择日期后，同步到原来的日程输入框
            document.getElementById("date").value = dateString;

            renderCalendar();
            renderCalendarAgenda();
        });

        calendarDays.appendChild(button);
    }

    renderCalendarAgenda();
}

function renderCalendarAgenda() {
    const title = document.getElementById("selectedDateTitle");
    const list = document.getElementById("calendarAgendaList");

    if (!title || !list) return;

    title.textContent = `${selectedCalendarDate} 일정`;
    list.innerHTML = "";

    const schedules = getUserSchedules()
        .filter(function(schedule) {
            return schedule.date === selectedCalendarDate;
        })
        .sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });

    if (schedules.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "calendar-empty-message";
        emptyMessage.textContent = "이 날짜에 등록된 일정이 없습니다.";
        list.appendChild(emptyMessage);
        return;
    }

    schedules.forEach(function(schedule) {
        const item = document.createElement("li");
        item.textContent = schedule.title;
        list.appendChild(item);
    });
}

// 上个月
document.getElementById("prevMonth").addEventListener("click", function() {
    calendarMonth--;

    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }

    renderCalendar();
});

// 下个月
document.getElementById("nextMonth").addEventListener("click", function() {
    calendarMonth++;

    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }

    renderCalendar();
});

// 页面初始化
displaySchedules();
updateDashboard();
renderCalendar();