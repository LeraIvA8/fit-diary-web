// Тренировка
// Бэкенд: backend/routes/workout.py
import { api, escapeHtml, formatDayMonth, renderTabs, workoutMeta } from "./common.js";

renderTabs("home");
const id = new URLSearchParams(location.search).get("id"); // номер тренировки из адреса
document.querySelector("#edit").href = `/create.html?id=${encodeURIComponent(id)}`; // изменение — в конструкторе

async function draw() {
  let workout;
  try {
    workout = await api("GET", `/api/workout/${id}`);
  } catch (error) {
    document.querySelector("main").innerHTML = `<p>${escapeHtml(error.message)}</p><a class="link" href="/">На главную</a>`;
    return;
  }

  document.querySelector("#date").textContent = formatDayMonth(workout.date);
  document.querySelector("#title").textContent = workout.title;
  document.querySelector("#meta").textContent =
    workoutMeta(workout.exercises.length, workout.minutes) + (workout.completed ? " · выполнена" : "");

  document.querySelector("#exercises").innerHTML = workout.exercises
    .map(
      (e, i) => `
      <div class="card">
        <p class="eyebrow">Упражнение ${String(i + 1).padStart(2, "0")}</p>
        <p class="row-title">${escapeHtml(e.name)}</p>
        <span class="muted">${e.sets} × ${e.reps}${e.note ? " · " + escapeHtml(e.note) : ""}</span>
      </div>`,
    )
    .join("");

  const button = document.querySelector("#complete");
  button.textContent = workout.completed ? "Снять отметку" : "Выполнено";
  button.className = workout.completed ? "btn outline" : "btn";
  button.onclick = async () => {
    await api("PATCH", `/api/workout/${id}`, { completed: !workout.completed });
    draw();
  };
}

document.querySelector("#delete").onclick = async () => {
  if (!confirm("Удалить тренировку?")) return;
  await api("DELETE", `/api/workout/${id}`);
  location.href = "/";
};

draw();
