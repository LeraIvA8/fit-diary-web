// Запросы к бэкенду — тому же серверу Flask, что и у сайта (папка backend).
// Вход — по токену: сервер выдаёт его после входа, приложение хранит его и отправляет в заголовке Authorization.
import Constants from "expo-constants";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert, Platform } from "react-native";

// ───────── Хранилище на телефоне ─────────

// На телефоне — защищённое хранилище (SecureStore), в браузере — localStorage
async function readValue(key) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function writeValue(key, value) {
  if (Platform.OS === "web") {
    value ? localStorage.setItem(key, value) : localStorage.removeItem(key);
  } else if (value) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// ───────── Адрес сервера ─────────

// Адрес по умолчанию:
// - собранное приложение (APK) — адрес, заданный при сборке (EXPO_PUBLIC_API_URL в eas.json);
// - Expo Go — компьютер, с которого открыто приложение (бэкенд на нём же, порт 3000);
// - браузер — тот же компьютер.
function defaultServer() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === "web") return `http://${window.location.hostname}:3000`;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${host ?? "localhost"}:3000`;
}

// В другой Wi-Fi сети у компьютера другой адрес — его можно ввести на экране входа (поле «Адрес сервера»)
const SERVER_KEY = "server-url";
let server = null;

export async function getServer() {
  if (server === null) server = (await readValue(SERVER_KEY)) || defaultServer();
  return server;
}

export async function setServer(url) {
  server = url.trim().replace(/\/+$/, "") || defaultServer(); // без «/» в конце
  await writeValue(SERVER_KEY, server === defaultServer() ? null : server);
}

// ───────── Токен входа ─────────

const TOKEN_KEY = "session-token";

export const getToken = () => readValue(TOKEN_KEY);
export const setToken = (token) => writeValue(TOKEN_KEY, token);

// ───────── Запросы ─────────

const PUBLIC = ["/api/login", "/api/register"]; // адреса, для которых вход не нужен

// Не вошёл — на экран входа. Промис не завершается: дальше код экрана не выполняется (как на сайте)
function toLogin() {
  router.replace("/login");
  return new Promise(() => {});
}

// api("POST", "/api/login", { email, password }) → ответ сервера (объект)
// При ошибке выбрасывает объект { status, message, fields }
export async function api(method, path, body) {
  const token = await getToken();
  if (!token && !PUBLIC.includes(path)) return toLogin();

  const server = await getServer();
  let response;
  try {
    response = await fetch(server + path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw { status: 0, message: `Нет связи с сервером ${server}. Запущен ли бэкенд и верный ли адрес сервера?`, fields: {} };
  }
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !PUBLIC.includes(path)) {
    await setToken(null);
    return toLogin();
  }
  if (!response.ok) {
    throw { status: response.status, message: data.error ?? "Ошибка сервера", fields: data.fields ?? {} };
  }
  return data;
}

// Вопрос «Удалить?»: на телефоне — системное окно, в браузере — confirm
export function confirmAction(title, onYes) {
  if (Platform.OS === "web") {
    if (window.confirm(title)) onYes();
    return;
  }
  Alert.alert(title, "", [
    { text: "Отмена", style: "cancel" },
    { text: "Удалить", style: "destructive", onPress: onYes },
  ]);
}
