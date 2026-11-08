// Экран «Вход / Регистрация» — как login.html на сайте. Бэкенд: backend/routes/login.py
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Icon from "../components/Icon";
import { Button, ErrorText, Eyebrow, Field, Label, Screen, Title } from "../components/ui";
import { api, getServer, setServer, setToken } from "../lib/api";
import { colors, fonts } from "../lib/theme";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" или "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [server, setServerField] = useState(""); // адрес бэкенда, например http://192.168.0.14:3000
  const isLogin = mode === "login";

  // Показать в поле текущий адрес сервера
  useEffect(() => {
    getServer().then(setServerField);
  }, []);

  // Переключение «Вход» ↔ «Регистрация»
  function switchTo(newMode) {
    setMode(newMode);
    setErrors({});
  }

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  // Отправка формы: сервер возвращает токен — сохраняем его и идём на главную
  async function submit() {
    setSending(true);
    try {
      await setServer(server); // запомнить адрес сервера: дальше все запросы идут на него
      const { token } = isLogin
        ? await api("POST", "/api/login", { email: form.email, password: form.password })
        : await api("POST", "/api/register", form);
      await setToken(token);
      router.replace("/");
    } catch (error) {
      setErrors({ ...error.fields, form: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen>
      <View style={st.logo}>
        <Icon name="star" size={34} color={colors.accent} />
      </View>
      <Eyebrow>Добро пожаловать</Eyebrow>
      <Title style={{ fontSize: 44, lineHeight: 48, marginBottom: 32 }}>{isLogin ? "Войдите в систему" : "Создайте аккаунт"}</Title>

      <View style={st.switch}>
        {[["login", "Вход"], ["register", "Регистрация"]].map(([id, title]) => (
          <Pressable key={id} onPress={() => switchTo(id)} style={[st.switchButton, mode === id && st.switchActive]}>
            <Text style={[st.switchText, mode === id && { color: "#fff" }]}>{title.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 20 }}>
        {!isLogin && (
          <View>
            <Label>Имя</Label>
            <Field value={form.name} onChangeText={set("name")} autoComplete="name" />
            <ErrorText>{errors.name}</ErrorText>
          </View>
        )}
        <View>
          <Label>Логин</Label>
          <Field
            value={form.email}
            onChangeText={set("email")}
            placeholder="ivanova@mail.ru"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <ErrorText>{errors.email}</ErrorText>
        </View>
        <View>
          <Label>Пароль</Label>
          <Field value={form.password} onChangeText={set("password")} placeholder="••••••••" secureTextEntry onSubmitEditing={submit} />
          <ErrorText>{errors.password}</ErrorText>
        </View>
        <ErrorText>{errors.form}</ErrorText>
        <Button title={isLogin ? "Войти" : "Зарегистрироваться"} onPress={submit} disabled={sending} />
        {isLogin && <Button kind="gold" title="Создать аккаунт" onPress={() => switchTo("register")} />}

        {/* Адрес компьютера с бэкендом: в другой Wi-Fi сети он меняется (узнать — команда ipconfig) */}
        <View style={{ marginTop: 12 }}>
          <Label>Адрес сервера</Label>
          <Field value={server} onChangeText={setServerField} autoCapitalize="none" keyboardType="url" />
        </View>
      </View>
    </Screen>
  );
}

const st = StyleSheet.create({
  logo: {
    width: 88, height: 88, marginTop: 24, marginBottom: 40, borderRadius: 44,
    borderWidth: 1.5, borderColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
  switch: { flexDirection: "row", padding: 7, marginBottom: 32, borderRadius: 999, backgroundColor: colors.muted },
  switchButton: { flex: 1, height: 48, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  switchActive: { backgroundColor: colors.primary },
  switchText: { fontFamily: fonts.bold, fontSize: 14, letterSpacing: 2.2, color: colors.accent },
});
