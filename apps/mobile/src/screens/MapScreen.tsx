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
import { getMarketPrediction, type MarketPrediction, type MarketFactor } from "@/lib/api";

MapLibreGL.setAccessToken(null);

const STYLE_URL = "https://demotiles.maplibre.org/style.json";

function scoreColor(score: number): string {
  return score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
}

export default function MapScreen() {
  const { location, loading: locLoading } = useLocation();
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const { data: prediction, isLoading: statsLoading } = useQuery<MarketPrediction>({
    queryKey: ["market-prediction", selectedCoords?.[0], selectedCoords?.[1]],
    queryFn: () => getMarketPrediction(selectedCoords![1], selectedCoords![0]),
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
        mapStyle={STYLE_URL}
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
            <Text style={styles.infoPanelTitle}>
              {prediction?.zone.city
                ? `${prediction.zone.city} (${prediction.zone.postal_code ?? ""})`
                : "Prédiction de marché"}
            </Text>

            {statsLoading ? (
              <ActivityIndicator color="#1D4ED8" style={{ marginTop: 16 }} />
            ) : prediction ? (
              <>
                {/* Score + niveau */}
                <View style={styles.scoreRow}>
                  <View style={[styles.scoreCircle, { backgroundColor: scoreColor(prediction.score) + "20" }]}>
                    <Text style={[styles.scoreValue, { color: scoreColor(prediction.score) }]}>
                      {prediction.score}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scoreLevel}>Potentiel de vente : {prediction.level}</Text>
                    <Text style={styles.scoreSub}>
                      {prediction.market.median_price_sqm
                        ? `${Math.round(prediction.market.median_price_sqm).toLocaleString("fr-FR")} €/m² médian · ${prediction.market.transactions} transactions`
                        : `${prediction.market.transactions} transactions`}
                    </Text>
                  </View>
                </View>

                {/* Facteurs (indicateurs agrégés) */}
                <Text style={styles.factorsTitle}>Indicateurs de la zone</Text>
                {prediction.factors.slice(0, 5).map((f: MarketFactor) => (
                  <View key={f.label} style={styles.factorRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.factorLabel}>{f.label}</Text>
                      <Text style={styles.factorDetail}>{f.detail}</Text>
                    </View>
                    <Text
                      style={[
                        styles.factorContribution,
                        { color: f.contribution >= 0 ? "#059669" : "#DC2626" },
                      ]}
                    >
                      {f.contribution >= 0 ? "+" : ""}
                      {f.contribution}
                    </Text>
                  </View>
                ))}
              </>
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
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center" },
  scoreValue: { fontSize: 24, fontWeight: "800" },
  scoreLevel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  scoreSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  factorsTitle: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 },
  factorRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  factorLabel: { fontSize: 13, fontWeight: "600", color: "#111827" },
  factorDetail: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  factorContribution: { fontSize: 15, fontWeight: "800", marginLeft: 12 },
  noData: { color: "#9CA3AF", textAlign: "center", marginVertical: 16 },
  closeBtn: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 14, alignItems: "center" },
  closeBtnText: { color: "#374151", fontWeight: "600" },
});
