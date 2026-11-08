// Окно «Главная» (index.html): календарь, тренировки выбранного дня и «Ближайшие». Бэкенд: backend/routes/home.py
import { api, currentUser, escapeHtml, formatDayMonth, monthCalendar, renderTabs, shortMonth, todayIso, workoutMeta } from "./common.js";

const user = await currentUser();
document.querySelector("#name").textContent = user.name.split(" ")[0];
document.querySelector("#avatar").textContent = user.name[0];
renderTabs("home");

// ───────── Календарь: нажатие на день показывает его тренировки справа ─────────

monthCalendar({
  month: document.querySelector("#month"),
  grid: document.querySelector("#calendar"),
  prev: document.querySelector("#prev"),
  next: document.querySelector("#next"),
  selected: todayIso(),
  onSelect: drawDay,
});

// ───────── Тренировки выбранного дня ─────────

async function drawDay(date) {
  document.querySelector("#day-title").textContent = date === todayIso() ? `Сегодня, ${formatDayMonth(date)}` : formatDayMonth(date);
  const workouts = await api("GET", `/api/home/day?date=${date}`);
  const list = document.querySelector("#day");
  if (workouts.length === 0) {
    list.innerHTML = `
      <p class="muted" style="margin: 0">В этот день тренировок нет</p>
      <a class="link" href="/create.html?date=${date}">+ Запланировать</a>`;
    return;
  }
  list.innerHTML = workouts
    .map(
      (w) => `
      <div class="row day-workout">
        <div style="flex: 1; min-width: 160px">
          <p class="row-title">${escapeHtml(w.title)}</p>
          <span class="muted">${workoutMeta(w.exercises, w.minutes)}${w.completed ? " · выполнена" : ""}</span>
        </div>
        <div class="actions">
          <a class="btn small" href="/workout.html?id=${w.id}">Открыть</a>
          <a class="btn outline small" href="/create.html?id=${w.id}">Изменить</a>
        </div>
      </div>`,
    )
    .join("");
}

// ───────── Ближайшие ─────────

async function drawUpcoming() {
  const workouts = await api("GET", `/api/home/upcoming?from=${todayIso()}`);
  const list = document.querySelector("#upcoming");
  if (workouts.length === 0) {
    list.innerHTML = `<p class="muted">Запланированных тренировок нет.</p>`;
    return;
  }
  list.innerHTML = workouts
    .map(
      (w) => `
      <a class="row" href="/workout.html?id=${w.id}">
        <div class="date-badge"><b>${Number(w.date.slice(8, 10))}</b><small>${shortMonth(w.date)}</small></div>
        <div style="flex: 1">
          <p class="row-title">${escapeHtml(w.title)}</p>
          <span class="muted">${workoutMeta(w.exercises, w.minutes)}</span>
        </div>
      </a>`,
    )
    .join("");
}

drawDay(todayIso());
drawUpcoming();
