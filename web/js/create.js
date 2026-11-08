// Окно «Конструктор» (create.html): новая тренировка или изменение существующей. Бэкенд: backend/routes/create.py
//   create.html                — новая тренировка на сегодня
//   create.html?date=2026-11-16 — новая тренировка на этот день
//   create.html?id=15          — изменить тренировку 15
import { api, currentUser, escapeHtml, formatDayMonth, monthCalendar, renderTabs, showErrors, todayIso } from "./common.js";

await currentUser(); // не вошёл — уйдёт на страницу входа
renderTabs("create");

const query = new URLSearchParams(location.search);
const editId = query.get("id"); // есть — значит, изменяем тренировку

const list = document.querySelector("#exercises");
const template = document.querySelector("#exercise-template");

// Добавить карточку упражнения (пустую или с данными)
function addExercise(exercise) {
  const card = template.content.cloneNode(true).querySelector(".exercise");
  card.querySelector(".remove").onclick = () => {
    card.remove();
    renumber();
  };
  if (exercise) {
    card.querySelector(".name").value = exercise.name;
    card.querySelector(".sets").value = exercise.sets;
    card.querySelector(".reps").value = exercise.reps;
    card.querySelector(".note").value = exercise.note ?? "";
  }
  list.append(card);
  renumber();
}

// Подписи «УПРАЖНЕНИЕ 01», «02» … по порядку
function renumber() {
  list.querySelectorAll(".exercise").forEach((card, i) => {
    card.querySelector(".number").textContent = `Упражнение ${String(i + 1).padStart(2, "0")}`;
  });
}

// ───────── Выбор дня ─────────

let date = /^\d{4}-\d{2}-\d{2}$/.test(query.get("date") ?? "") ? query.get("date") : todayIso();
//показывает дату рядом с календарем
function showPicked() { 
  document.querySelector("#picked").textContent = formatDayMonth(date) + " " + date.slice(0, 4);
}

// ───────── Изменение: заполняем форму данными тренировки ─────────

if (editId) {
  let workout;
  try {
    workout = await api("GET", `/api/workout/${editId}`);
  } catch (error) {
    document.querySelector("main").innerHTML = `<p>${escapeHtml(error.message)}</p><a class="link" href="/">На главную</a>`;
    throw error;
  }
  document.title = "Изменить тренировку — Дневник тренировок";
  document.querySelector("#heading").textContent = "Изменить тренировку";
  document.querySelector("#save").textContent = "Сохранить изменения";
  document.querySelector("#title").value = workout.title;
  date = workout.date;
  workout.exercises.forEach(addExercise);
} else {
  // Сначала две пустые карточки, как в макете
  addExercise();
  addExercise();
}
// подключение календаря из common 
monthCalendar({
  month: document.querySelector("#month"),
  grid: document.querySelector("#calendar"),
  prev: document.querySelector("#prev"),
  next: document.querySelector("#next"),
  selected: date,
  onSelect: (iso) => { // передем выбранную дату в iso
    date = iso;
    showPicked();
  },
});
showPicked();

// Собрать данные формы в объект для бэкенда
function readForm() {
  return {
    title: document.querySelector("#title").value,
    date,
    exercises: [...list.querySelectorAll(".exercise")].map((card) => ({
      name: card.querySelector(".name").value,
      sets: Number(card.querySelector(".sets").value),
      reps: Number(card.querySelector(".reps").value),
      note: card.querySelector(".note").value,
    })),
  };
}

// Показать ошибки бэкенда: "title", "exercises.0.name" …
function showFormErrors(fields) {
  showErrors(fields);
  list.querySelectorAll(".exercise").forEach((card, i) => {
    for (const key of ["name", "sets", "reps"]) {
      card.querySelector(`.error-${key}`).textContent = fields[`exercises.${i}.${key}`] ?? "";
    }
  });
}

document.querySelector("#add").onclick = () => addExercise();
document.querySelector("#clear").onclick = () => {
  list.innerHTML = "";
  addExercise();
};

document.querySelector("#save").onclick = async () => {
  try {
    const { id } = editId
      ? await api("PUT", `/api/create/${editId}`, readForm())
      : await api("POST", "/api/create", readForm());
    location.href = `/workout.html?id=${id}`; // открыть сохранённую тренировку
  } catch (error) {
    showFormErrors({ ...error.fields, form: error.status === 400 ? "" : error.message });
  }
};

