import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Connexion échouée", "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>IE</Text>
          </View>
          <Text style={styles.appName}>Cap Entreprendre France</Text>
          <Text style={styles.tagline}>La plateforme des experts immobiliers</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Connexion</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 48 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: "#1a3a6b", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  logoText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  appName: { fontSize: 26, fontWeight: "800", color: "#111827" },
  tagline: { fontSize: 13, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
  form: { backgroundColor: "#fff", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#F3F4F6", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#F9FAFB" },
  loginBtn: { backgroundColor: "#1D4ED8", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  loginBtnDisabled: { backgroundColor: "#93C5FD" },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});