// Окно «Вход / Регистрация» (login.html). Бэкенд: backend/routes/login.py
import { api, showErrors } from "./common.js";

let mode = "login"; // "login" или "register"

// Переключение «Вход» ↔ «Регистрация»
function setMode(newMode) {
  mode = newMode;
  const isLogin = mode === "login";
  document.querySelector("#tab-login").classList.toggle("active", isLogin);
  document.querySelector("#tab-register").classList.toggle("active", !isLogin);
  document.querySelector("#name-field").classList.toggle("hidden", isLogin);
  document.querySelector("#to-register").classList.toggle("hidden", !isLogin);
  document.querySelector("#heading").textContent = isLogin ? "Войдите в систему" : "Создайте аккаунт";
  document.querySelector("#submit").textContent = isLogin ? "Войти" : "Зарегистрироваться";
  showErrors({});
}

document.querySelector("#tab-login").onclick = () => setMode("login");
document.querySelector("#tab-register").onclick = () => setMode("register");
document.querySelector("#to-register").onclick = () => setMode("register");

// Отправка формы
document.querySelector("#form").onsubmit = async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target)); // { name, email, password }

  try {
    if (mode === "login") {
      await api("POST", "/api/login", { email: form.email, password: form.password });
    } else {
      await api("POST", "/api/register", form);
    }
    location.href = "/"; // успешно — на главную
  } catch (error) {
    showErrors({ ...error.fields, form: error.message });
  }
};
