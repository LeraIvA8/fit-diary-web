// Общие элементы экранов: страница, карточка, заголовки, кнопки, поля — по стилям сайта
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, shadow } from "../lib/theme";

// Страница с прокруткой. Отступ сверху — под вырез и строку состояния телефона
export function Screen({ children }) {
  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// Маленькая золотая надпись над заголовком: «КОНСТРУКТОР»
export function Eyebrow({ children, style }) {
  return <Text style={[s.eyebrow, style]}>{String(children).toUpperCase()}</Text>;
}

export function Title({ children, small, style }) {
  return <Text style={[s.title, small && s.titleSmall, style]}>{children}</Text>;
}

// Подпись поля: «НАЗВАНИЕ ТРЕНИРОВКИ»
export function Label({ children }) {
  return <Text style={s.label}>{String(children).toUpperCase()}</Text>;
}

export function Muted({ children, style }) {
  return <Text style={[s.muted, style]}>{children}</Text>;
}

// Красный текст ошибки под полем. Пустая ошибка — ничего не показываем
export function ErrorText({ children }) {
  return children ? <Text style={s.error}>{children}</Text> : null;
}

// Кнопка. kind: "primary" (зелёная), "outline", "gold", "danger" (красный текст); small — маленькая
export function Button({ title, onPress, kind = "primary", small, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, s[kind], small && s.btnSmall, (pressed || disabled) && { opacity: 0.6 }, style]}
    >
      <Text style={[s.btnText, s[`${kind}Text`], small && s.btnTextSmall]}>{title}</Text>
    </Pressable>
  );
}

// Золотая ссылка заглавными буквами: «+ СОЗДАТЬ»
export function LinkText({ title, onPress, style }) {
  return (
    <Pressable onPress={onPress} hitSlop={10}>
      <Text style={[s.link, style]}>{title.toUpperCase()}</Text>
    </Pressable>
  );
}

// Поле ввода. soft — светлое поле внутри карточки
export function Field({ soft, style, ...props }) {
  return <TextInput placeholderTextColor={colors.textMuted} style={[s.input, soft && s.inputSoft, style]} {...props} />;
}

// Строка «заголовок раздела — ссылка справа»
export function Section({ title, right }) {
  return (
    <View style={s.section}>
      <Title small>{title}</Title>
      {right}
    </View>
  );
}

// Тёмно-зелёная плашка с датой: «23 ОКТ»
export function DateBadge({ day, month }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeDay}>{day}</Text>
      <Text style={s.badgeMonth}>{month.toUpperCase()}</Text>
    </View>
  );
}

// «‹ НАЗАД»
export function Back({ onPress }) {
  return <LinkText title="‹ Назад" onPress={onPress} style={{ marginBottom: 18 }} />;
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 28, padding: 22, ...shadow },
  eyebrow: { marginBottom: 6, fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 2.3, color: colors.accent },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.text },
  titleSmall: { fontSize: 26 },
  label: { marginBottom: 8, marginLeft: 2, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.9, color: colors.textMuted },
  muted: { fontFamily: fonts.regular, fontSize: 15, color: colors.textMuted },
  error: { marginTop: 6, marginLeft: 4, fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
  link: { fontFamily: fonts.bold, fontSize: 13, letterSpacing: 2, color: colors.accent },
  section: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 32, marginBottom: 16 },

  btn: { height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  btnSmall: { height: 40, borderRadius: 12 },
  btnText: { fontFamily: fonts.bold, fontSize: 17 },
  btnTextSmall: { fontSize: 14 },
  primary: { backgroundColor: colors.primary },
  primaryText: { color: "#fff" },
  outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  outlineText: { color: colors.text },
  gold: { borderWidth: 1.5, borderColor: colors.accent },
  goldText: { color: colors.accent },
  danger: { height: 48 },
  dangerText: { color: colors.danger, fontSize: 15 },

  input: {
    height: 60, paddingHorizontal: 22, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, fontFamily: fonts.regular, fontSize: 17, color: colors.text,
  },
  inputSoft: { height: 54, backgroundColor: colors.input, fontSize: 16 },

  row: {
    flexDirection: "row", alignItems: "center", gap: 16, padding: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24,
  },
  rowTitle: { marginBottom: 4, fontFamily: fonts.semibold, fontSize: 18, color: colors.text },

  badge: { width: 68, height: 68, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  badgeDay: { fontFamily: fonts.serif, fontSize: 25, color: "#fff" },
  badgeMonth: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.6, color: colors.accent },

  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.serif, fontSize: 26, color: colors.accent },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  stack: { gap: 14 },
});
