import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Accueil" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="carte"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" label="Carte" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="prospects"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📡" label="Prospects" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabItem: { alignItems: "center", gap: 2 },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: "#9CA3AF", fontWeight: "500" },
  labelActive: { color: "#1D4ED8" },
});
