// Экран «Профиль» — как profile.html: имя, почта, статистика, выход. Бэкенд: backend/routes/profile.py
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card, Eyebrow, Muted, Screen, Title, s } from "../../components/ui";
import { api, setToken } from "../../lib/api";
import { MONTHS_OF } from "../../lib/dates";
import { colors, fonts } from "../../lib/theme";

export default function Profile() {
  const [data, setData] = useState(null);

  // Обновляем при каждом открытии: статистика могла измениться
  useFocusEffect(
    useCallback(() => {
      api("GET", "/api/profile").then(setData);
    }, []),
  );

  async function logout() {
    await api("POST", "/api/logout");
    await setToken(null);
    router.replace("/login");
  }

  if (!data) return <Screen />;
  const { user, stats } = data;
  const since = new Date(user.createdAt);

  return (
    <Screen>
      <Eyebrow>Аккаунт</Eyebrow>
      <Title style={{ marginBottom: 24 }}>Профиль</Title>

      <Card style={{ alignItems: "center", paddingVertical: 32 }}>
        <View style={[s.avatar, st.bigAvatar]}>
          <Text style={[s.avatarText, { fontSize: 44 }]}>{user.name[0]}</Text>
        </View>
        <Title small style={{ marginTop: 18 }}>{user.name}</Title>
        <Muted style={{ marginTop: 6, textAlign: "center" }}>
          {user.email} · с {MONTHS_OF[since.getMonth()]} {since.getFullYear()}
        </Muted>
      </Card>

      {/* Статистика: только выполненные тренировки */}
      <View style={st.stats}>
        {[[stats.workouts, "Тренировки"], [stats.hours, "Часов"], [stats.weeks, "Недель"]].map(([value, title]) => (
          <View key={title} style={st.stat}>
            <Text style={st.statValue}>{value}</Text>
            <Text style={st.statTitle}>{title.toUpperCase()}</Text>
          </View>
        ))}
      </View>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <Pressable style={st.menuRow} onPress={logout}>
          <Text style={[s.rowTitle, { color: colors.danger, marginBottom: 0 }]}>Выйти</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const st = StyleSheet.create({
  bigAvatar: { width: 96, height: 96, borderRadius: 48 },
  stats: { flexDirection: "row", gap: 12, marginVertical: 24 },
  stat: {
    flex: 1, paddingTop: 20, paddingBottom: 16, alignItems: "center",
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24,
  },
  statValue: { marginBottom: 6, fontFamily: fonts.serif, fontSize: 32, color: colors.text },
  statTitle: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.3, color: colors.textMuted },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 18 },
});
