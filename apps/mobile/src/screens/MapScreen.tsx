import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useLocation } from "@/hooks/useLocation";
import { useQuery } from "@tanstack/react-query";
import { getZoneStats } from "@/lib/api";

MapLibreGL.setAccessToken(null);

const STYLE_URL = "https://demotiles.maplibre.org/style.json";

interface ZoneStats {
  median_price: number;
  avg_price: number;
  transaction_count: number;
  price_per_sqm: number;
}

export default function MapScreen() {
  const { location, loading: locLoading } = useLocation();
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const { data: zoneStats, isLoading: statsLoading } = useQuery<ZoneStats>({
    queryKey: ["zone-stats", selectedCoords?.[0], selectedCoords?.[1]],
    queryFn: () => getZoneStats(selectedCoords![1], selectedCoords![0]),
    enabled: !!selectedCoords,
  });

  const handleMapPress = useCallback((e: any) => {
    const coords = e.geometry.coordinates as [number, number];
    setSelectedCoords(coords);
    setInfoVisible(true);
  }, []);

  const center = location
    ? [location.lng, location.lat] as [number, number]
    : [2.3522, 48.8566] as [number, number];

  if (locLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Localisation en cours…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL={STYLE_URL}
        onPress={handleMapPress}
        compassEnabled
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          defaultSettings={{ centerCoordinate: center, zoomLevel: 14 }}
          centerCoordinate={center}
          zoomLevel={14}
          animationDuration={1000}
        />

        {location && (
          <MapLibreGL.PointAnnotation
            id="user-location"
            coordinate={[location.lng, location.lat]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {selectedCoords && (
          <MapLibreGL.PointAnnotation id="selected" coordinate={selectedCoords}>
            <View style={styles.selectedMarker}>
              <Text style={styles.selectedMarkerText}>📍</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        )}
      </MapLibreGL.MapView>

      {/* Floating controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setSelectedCoords(location ? [location.lng, location.lat] : null)}
        >
          <Text style={styles.controlBtnText}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Info Panel */}
      <Modal
        visible={infoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setInfoVisible(false)}
        >
          <View style={styles.infoPanel}>
            <View style={styles.infoPanelHandle} />
            <Text style={styles.infoPanelTitle}>Prix dans cette zone</Text>

            {statsLoading ? (
              <ActivityIndicator color="#1D4ED8" style={{ marginTop: 16 }} />
            ) : zoneStats ? (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>
                    {Math.round(zoneStats.median_price / 1000)}k€
                  </Text>
                  <Text style={styles.statItemLabel}>Prix médian</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>
                    {Math.round(zoneStats.price_per_sqm).toLocaleString("fr-FR")} €/m²
                  </Text>
                  <Text style={styles.statItemLabel}>Prix au m²</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{zoneStats.transaction_count}</Text>
                  <Text style={styles.statItemLabel}>Transactions</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noData}>Aucune donnée pour cette zone</Text>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  userMarker: { width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(29,78,216,0.2)", justifyContent: "center", alignItems: "center" },
  userMarkerInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#1D4ED8" },
  selectedMarker: { alignItems: "center" },
  selectedMarkerText: { fontSize: 24 },
  controls: { position: "absolute", right: 16, bottom: 100, gap: 8 },
  controlBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  controlBtnText: { fontSize: 20 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  infoPanel: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingTop: 12, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  infoPanelHandle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  infoPanelTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  statItem: { alignItems: "center" },
  statItemValue: { fontSize: 20, fontWeight: "700", color: "#1D4ED8" },
  statItemLabel: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  noData: { color: "#9CA3AF", textAlign: "center", marginVertical: 16 },
  closeBtn: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 14, alignItems: "center" },
  closeBtnText: { color: "#374151", fontWeight: "600" },
});
