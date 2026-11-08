// Общие функции для всех страниц сайта:
// запросы к бэкенду, проверка входа, нижнее меню, даты, календарь.

// ───────── Запросы к бэкенду ─────────

// Бэкенд — отдельный сервер (папка backend) на порту 3000 того же компьютера
const API_URL = `http://${location.hostname}:3000`;

// api("POST", "/api/login", { email, password }) → ответ сервера (объект)
// При ошибке выбрасывает объект { status, message, fields }
export async function api(method, path, body) {
  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // отправлять cookie с токеном: сайт и API на разных портах
    });
  } catch {
    throw { status: 0, message: `Нет связи с сервером ${API_URL}. Запущен ли бэкенд?`, fields: {} };
  }
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !location.pathname.endsWith("login.html")) {
    location.href = "/login.html"; // не вошёл — на страницу входа
    return new Promise(() => {}); // дальше код страницы не выполняем
  }
  if (!response.ok) {
    throw { status: response.status, message: data.error ?? "Ошибка сервера", fields: data.fields ?? {} };
  }
  return data;
}

// Текущий пользователь. Если не вошёл — переход на страницу входа.
export function currentUser() {
  return api("GET", "/api/me");
}

// Показать ошибки под полями: <span data-error="email"></span>
export function showErrors(fields) {
  document.querySelectorAll("[data-error]").forEach((el) => {
    el.textContent = fields[el.dataset.error] ?? "";
  });
}

// Защита от вставки HTML-кода в страницу: всё, что ввёл пользователь, выводим через эту функцию
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

// ───────── Нижнее меню ─────────

// renderTabs("home") — добавляет меню внизу страницы и подсвечивает текущий раздел
export function renderTabs(active) {
  const tabs = [
    ["home", "/", "Главная"],
    ["create", "/create.html", "Создать"],
    ["profile", "/profile.html", "Профиль"],
  ];
  const nav = document.createElement("nav");
  nav.className = "tabbar";
  nav.innerHTML = tabs
    .map(([id, href, title]) => `<a href="${href}" class="tab ${id === active ? "active" : ""}">${title}</a>`)
    .join("");
  document.body.append(nav);
}

// ───────── Даты и подписи ─────────

export const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MONTHS_OF = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

// Date → "2026-11-16"
export function toIso(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayIso = () => toIso(new Date());

// "2026-11-16" → «16 ноября»
export function formatDayMonth(iso) {
  return `${Number(iso.slice(8, 10))} ${MONTHS_OF[Number(iso.slice(5, 7)) - 1]}`;
}

// "2026-11-16" → «ноя»
export function shortMonth(iso) {
  return MONTHS_OF[Number(iso.slice(5, 7)) - 1].slice(0, 3);
}

// plural(5, ["упражнение", "упражнения", "упражнений"]) → «упражнений»
export function plural(n, [one, few, many]) {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return few;
  return many;
}

// 70 → «1 ч 10 мин»
export function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} мин`;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

// «5 упражнений · 1 ч 10 мин»
export function workoutMeta(exercises, minutes) {
  return `${exercises} ${plural(exercises, ["упражнение", "упражнения", "упражнений"])} · ${formatMinutes(minutes)}`;
}

// ───────── Календарь месяца (окна «Главная» и «Конструктор») ─────────

// monthCalendar({ month, grid, prev, next, selected, onSelect }) — рисует месяц в grid.
// Дни с тренировками подсвечены, выбранный день обведён. Нажатие на день → onSelect("2026-11-16").
// Возвращает { select(iso), refresh() }.
export function monthCalendar({ month: monthEl, grid, prev, next, selected, onSelect }) {
  const shown = new Date(`${selected}T00:00:00`); // какой месяц сейчас показан
  shown.setDate(1);

  async function draw() {
    const year = shown.getFullYear();
    const month = shown.getMonth();
    monthEl.innerHTML = `${MONTHS[month]} <span class="muted">${year}</span>`;

    // Неделя начинается с понедельника: сколько дней прошлого месяца показать в первой строке
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
    const lastDay = new Date(year, month + 1, 0);

    // Спрашиваем у бэкенда, в какие дни есть тренировки
    const workouts = await api("GET", `/api/home/calendar?from=${toIso(start)}&to=${toIso(lastDay)}`);
    const daysWithWorkout = new Set(workouts.map((w) => w.date));

    let html = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"].map((d) => `<div class="weekday">${d}</div>`).join("");
    for (let day = new Date(start); day <= lastDay; day.setDate(day.getDate() + 1)) {
      const iso = toIso(day);
      const classes = ["day"];
      if (day.getMonth() !== month) classes.push("other");
      if (iso === todayIso()) classes.push("today");
      if (daysWithWorkout.has(iso)) classes.push("has");
      if (iso === selected) classes.push("selected");
      html += `<button type="button" class="${classes.join(" ")}" data-date="${iso}">${day.getDate()}</button>`;
    }
    grid.innerHTML = html;
    grid.querySelectorAll(".day").forEach((el) => {
      el.onclick = () => {
        select(el.dataset.date);
        onSelect(el.dataset.date);
      };
    });
  }

  function select(iso) {
    selected = iso;
    grid.querySelectorAll(".day").forEach((el) => el.classList.toggle("selected", el.dataset.date === iso));
  }

  prev.onclick = () => {
    shown.setMonth(shown.getMonth() - 1);
    draw();
  };
  next.onclick = () => {
    shown.setMonth(shown.getMonth() + 1);
    draw();
  };

  draw();
  return { select, refresh: draw };
}
