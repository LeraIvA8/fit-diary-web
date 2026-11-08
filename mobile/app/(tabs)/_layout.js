// Нижнее меню приложения — как на сайте в телефоне: Главная, Создать, Профиль
import { Tabs } from "expo-router/js-tabs";

import Icon from "../../components/Icon";
import { colors, fonts } from "../../lib/theme";

const tabs = [
  ["index", "Главная", "calendar"],
  ["create", "Создать", "plus"],
  ["profile", "Профиль", "user"],
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: "rgba(255,255,255,0.96)", borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase" },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color }) => <Icon name={icon} size={26} color={color} /> }}
        />
      ))}
    </Tabs>
  );
}
