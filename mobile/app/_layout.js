// Корень приложения: шрифты и стек экранов.
// Экраны лежат в папке app: файл = экран (как страницы сайта в frontend):
//   login.js           — вход / регистрация (login.html)
//   (tabs)/index.js    — главная (index.html)
//   (tabs)/create.js   — конструктор (create.html)
//   (tabs)/profile.js  — профиль (profile.html)
//   workout/[id].js    — тренировка (workout.html?id=15)
//   workout-form.js    — изменить тренировку или запланировать на день (create.html?id= / ?date=)
import { CormorantGaramond_500Medium } from "@expo-google-fonts/cormorant-garamond/500Medium";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "../lib/theme";

export default function RootLayout() {
  const [loaded] = useFonts({ CormorantGaramond_500Medium, Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  if (!loaded) return null; // пока шрифты грузятся — заставка

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
      </Stack>
    </>
  );
}
