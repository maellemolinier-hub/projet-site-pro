import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/store";
import { logout } from "@/lib/api";

const MENU_ITEMS = [
  { label: "Mon profil expert", icon: "👤", route: "/profile/edit" },
  { label: "Mon abonnement", icon: "💳", route: "/profile/subscription" },
  { label: "Mes rapports", icon: "📊", route: "/rapports" },
  { label: "Formations", icon: "🎓", route: "/formation" },
  { label: "Notifications", icon: "🔔", route: "/profile/notifications" },
  { label: "Intégrations CRM", icon: "🔌", route: "/profile/integrations" },
  { label: "Support", icon: "💬", route: "/profile/support" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "IE";

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          clearAuth();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Conseiller"}
          </Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>Plan {user?.plan ?? "Expert"}</Text>
          </View>
        </View>

        {/* Certification progress */}
        <View style={styles.certCard}>
          <View style={styles.certHeader}>
            <Text style={styles.certTitle}>⭐ Certification Expert Valeur Vénale</Text>
            <Text style={styles.certPercent}>38%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "38%" }]} />
          </View>
          <Text style={styles.certSubtitle}>3 modules sur 8 · Examen dans ~4 semaines</Text>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ImmoExpert v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { padding: 20, paddingBottom: 40 },
  profileCard: { backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  avatarLarge: { width: 80, height: 80, borderRadius: 20, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#1D4ED8" },
  name: { fontSize: 20, fontWeight: "700", color: "#111827" },
  email: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },
  planBadge: { backgroundColor: "#EFF6FF", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 12 },
  planBadgeText: { color: "#1D4ED8", fontWeight: "700", fontSize: 13 },
  certCard: { backgroundColor: "#1a3a6b", borderRadius: 20, padding: 20, marginBottom: 16 },
  certHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  certTitle: { color: "#fff", fontWeight: "600", fontSize: 13, flex: 1 },
  certPercent: { color: "#60A5FA", fontWeight: "800", fontSize: 20 },
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: "#FBBF24", borderRadius: 3 },
  certSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  menu: { backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#F3F4F6", overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  menuIcon: { width: 36, height: 36, backgroundColor: "#F3F4F6", borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: "#374151" },
  menuArrow: { fontSize: 20, color: "#D1D5DB" },
  logoutBtn: { backgroundColor: "#FEE2E2", borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 16 },
  logoutText: { color: "#DC2626", fontWeight: "700", fontSize: 14 },
  version: { textAlign: "center", color: "#D1D5DB", fontSize: 12 },
});
