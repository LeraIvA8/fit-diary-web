// Окно «Профиль» (profile.html): имя, почта, статистика, выход. Бэкенд: backend/routes/profile.py
import { api, renderTabs } from "./common.js";

renderTabs("profile");

const MONTHS_OF = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

const { user, stats } = await api("GET", "/api/profile");
const since = new Date(user.createdAt);

document.querySelector("#avatar").textContent = user.name[0];
document.querySelector("#name").textContent = user.name;
document.querySelector("#email").textContent = `${user.email} · с ${MONTHS_OF[since.getMonth()]} ${since.getFullYear()}`;
document.querySelector("#workouts").textContent = stats.workouts;
document.querySelector("#hours").textContent = stats.hours;
document.querySelector("#weeks").textContent = stats.weeks;

document.querySelector("#logout").onclick = async () => {
  await api("POST", "/api/logout");
  location.href = "/login.html";
};
