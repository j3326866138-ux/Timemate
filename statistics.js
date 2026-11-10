
const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);
if (!currentUser) {
    window.location.href = "login.html";
} else {
    document.getElementById("userName").textContent =
        currentUser.name || "사용자";
    updateStatistics();
}
function getTodayString() {
    const today = new Date();
    return (
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0")
    );
}
function getUserSchedules() {
    const allSchedules =
        JSON.parse(localStorage.getItem("schedules")) || {};
    return allSchedules[currentUser.id] || [];
}
function getUserTodos() {
    const key = `timemate_todos_${currentUser.id}`;
    return JSON.parse(localStorage.getItem(key)) || [];
}
function getFocusHistory() {
    const key = `timemate_focus_history_${currentUser.id}`;
    return JSON.parse(localStorage.getItem(key)) || {};
}
function formatDuration(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
}
function updateStatistics() {
    const schedules = getUserSchedules();
    const todos = getUserTodos();
    const history = getFocusHistory();
    const completed = todos.filter(todo => todo.completed);
    const unfinished = todos.filter(todo => !todo.completed);
    const today = getTodayString();
    // 1. 전체 일정과 To-Do
    document.getElementById("totalSchedules").textContent =
        schedules.length;
    document.getElementById("totalTodos").textContent =
        todos.length;
    document.getElementById("completedTodos").textContent =
        completed.length;
    document.getElementById("completedLegend").textContent =
        completed.length;
    document.getElementById("unfinishedTodos").textContent =
        unfinished.length;
    // 2. 전체 집중 시간
    // 일별 기록이 있으면 기록을 기준으로 계산합니다.
    const historySeconds = Object.values(history).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0
    );
    const todoSeconds = todos.reduce(
        (sum, todo) => sum + (Number(todo.focusTime) || 0),
        0
    );
    const totalFocusSeconds =
        historySeconds > 0 ? historySeconds : todoSeconds;
    document.getElementById("totalFocusTime").textContent =
        formatDuration(totalFocusSeconds);
    // 3. To-Do 완료率
    const rate = todos.length === 0
        ? 0
        : Math.round(completed.length / todos.length * 100);
    document.getElementById("completionRate").textContent =
        `${rate}%`;
    document.getElementById("progressRing").style.setProperty(
        "--progress",
        `${rate}%`
    );
    // 4. 日程统计
    const todaySchedules = schedules.filter(
        schedule => schedule.date === today
    );
    const upcomingSchedules = schedules.filter(
        schedule => schedule.date > today
    );
    const pastSchedules = schedules.filter(
        schedule => schedule.date < today
    );
    document.getElementById("todaySchedules").textContent =
        `${todaySchedules.length}개`;
    document.getElementById("upcomingSchedules").textContent =
        `${upcomingSchedules.length}개`;
    document.getElementById("pastSchedules").textContent =
        `${pastSchedules.length}개`;
    // 5. 最近7天集中时间图表
    renderWeeklyChart(history);
}
function renderWeeklyChart(history) {
    const chart = document.getElementById("weeklyChart");
    const message = document.getElementById("chartMessage");
    chart.innerHTML = "";
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateKey =
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");
        days.push({
            key: dateKey,
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            seconds: Number(history[dateKey]) || 0,
            isToday: i === 0
        });
    }
    const maxSeconds = Math.max(
        ...days.map(day => day.seconds),
        60
    );
    days.forEach(day => {
        const column = document.createElement("div");
        column.className = "chart-column";
        const value = document.createElement("span");
        value.className = "bar-value";
        value.textContent =
            day.seconds > 0
                ? formatDuration(day.seconds)
                : "0분";
        const track = document.createElement("div");
        track.className = "bar-track";
        const bar = document.createElement("div");
        bar.className = day.isToday ? "bar today" : "bar";
        const height = day.seconds === 0
            ? 0
            : Math.max(4, day.seconds / maxSeconds * 100);
        bar.style.height = `${height}%`;
        bar.title = `${day.key}: ${formatDuration(day.seconds)}`;
        const label = document.createElement("span");
        label.className = "bar-day";
        label.textContent = day.label;
        track.appendChild(bar);
        column.append(value, track, label);
        chart.appendChild(column);
    });
    const hasHistory = days.some(day => day.seconds > 0);
    message.textContent = hasHistory
        ? "최근 7일간의 저장된 집중 기록입니다."
        : "아직 최근 7일의 집중 기록이 없습니다.";
}
// 로그아웃
document.getElementById("logoutButton").addEventListener(
    "click",
    () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    }
);