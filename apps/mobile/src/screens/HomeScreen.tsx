import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";

const QUICK_ACTIONS = [
  { label: "Carte des prix", icon: "🗺️", route: "/(tabs)/carte", color: "#EFF6FF", border: "#BFDBFE" },
  { label: "Scanner une zone", icon: "📡", route: "/(tabs)/prospects", color: "#FFF7ED", border: "#FED7AA" },
  { label: "Mes rapports", icon: "📊", route: "/rapports", color: "#F0FDF4", border: "#BBF7D0" },
  { label: "Formation", icon: "🎓", route: "/formation", color: "#FAF5FF", border: "#E9D5FF" },
];

const STATS = [
  { label: "Prospects ce mois", value: "23", trend: "+8" },
  { label: "Zones analysées", value: "47", trend: "+12" },
  { label: "Rapports générés", value: "6", trend: "+2" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "IE";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.subGreeting}>
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Conseiller ImmoExpert"}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statTrend}>↑ {s.trend} ce mois</Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionCard, { backgroundColor: a.color, borderColor: a.border }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan badge */}
        <View style={styles.planBanner}>
          <View>
            <Text style={styles.planTitle}>Plan {user?.plan ?? "Expert"}</Text>
            <Text style={styles.planSub}>Toutes les fonctionnalités actives</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>✓ Actif</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subGreeting: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#1D4ED8" },
  statsScroll: { marginBottom: 24, marginHorizontal: -20, paddingHorizontal: 20 },
  statCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginRight: 12, minWidth: 150, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  statTrend: { fontSize: 12, color: "#16A34A", fontWeight: "600", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  actionCard: { width: "47%", borderRadius: 16, padding: 16, borderWidth: 1, alignItems: "center" },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: "#374151", textAlign: "center" },
  planBanner: { backgroundColor: "#1a3a6b", borderRadius: 20, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  planSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  planBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  planBadgeText: { color: "#4ADE80", fontSize: 13, fontWeight: "600" },
});
