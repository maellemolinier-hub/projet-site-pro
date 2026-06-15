import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useLocation } from "@/hooks/useLocation";
import { useProspects, useScanZone, type Prospect } from "@/hooks/useProspects";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "#DBEAFE", text: "#1D4ED8" },
  contacted: { bg: "#FEF3C7", text: "#D97706" },
  qualified: { bg: "#D1FAE5", text: "#059669" },
  lost: { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  lost: "Perdu",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#059669" : score >= 60 ? "#D97706" : "#DC2626";
  return (
    <View style={[styles.scoreBadge, { backgroundColor: color + "20" }]}>
      <Text style={[styles.scoreText, { color }]}>{score}%</Text>
    </View>
  );
}

function ProspectCard({ item, onPress }: { item: Prospect; onPress: () => void }) {
  const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.new;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
        <ScoreBadge score={item.score} />
      </View>
      {item.signals.length > 0 && (
        <View style={styles.signals}>
          {item.signals.slice(0, 3).map((s) => (
            <View key={s} style={styles.signalChip}>
              <Text style={styles.signalText}>{s}</Text>
            </View>
          ))}
        </View>
      )}
      {item.estimatedValue && (
        <Text style={styles.estimatedValue}>
          Valeur estimée : {Math.round(item.estimatedValue / 1000)}k€
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function ProspectsScreen() {
  const { location, loading: locLoading } = useLocation();
  const { data: prospects, isLoading, refetch } = useProspects(
    location?.lat ?? 0,
    location?.lng ?? 0
  );
  const { mutate: scanZone, isPending: isScanning } = useScanZone();
  const [filter, setFilter] = useState<string>("all");

  const filtered = (prospects as Prospect[] ?? []).filter(
    (p) => filter === "all" || p.status === filter
  );

  const handleScan = () => {
    if (!location) return;
    scanZone({ lat: location.lat, lng: location.lng });
  };

  if (locLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Localisation…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Prospection IA</Text>
          <Text style={styles.subtitle}>
            {location
              ? `${filtered.length} prospect${filtered.length > 1 ? "s" : ""} dans votre zone`
              : "Position non disponible"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
          onPress={handleScan}
          disabled={isScanning || !location}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.scanBtnText}>📡 Scanner</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {["all", "new", "contacted", "qualified", "lost"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "Tous" : STATUS_LABELS[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProspectCard item={item} onPress={() => {}} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#1D4ED8" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyTitle}>Aucun prospect</Text>
              <Text style={styles.emptyText}>
                Appuyez sur Scanner pour analyser votre zone
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#6B7280" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  scanBtn: { backgroundColor: "#1D4ED8", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  scanBtnDisabled: { backgroundColor: "#93C5FD" },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingBottom: 16, flexWrap: "wrap" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "transparent" },
  filterChipActive: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#1D4ED8" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardLeft: { flex: 1, marginRight: 12 },
  cardAddress: { fontSize: 14, fontWeight: "600", color: "#111827", marginBottom: 6 },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "600" },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  scoreText: { fontSize: 14, fontWeight: "800" },
  signals: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  signalChip: { backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  signalText: { fontSize: 11, color: "#374151" },
  estimatedValue: { fontSize: 12, color: "#1D4ED8", fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#9CA3AF", textAlign: "center" },
});
