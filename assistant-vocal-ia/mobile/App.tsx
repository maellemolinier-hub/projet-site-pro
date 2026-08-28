import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  getServerConfig,
  saveServerConfig,
  sendCommand,
  getMailConfig,
  saveMailConfig,
  sendCommandByMail,
} from "./src/assistantClient";

interface Exchange {
  command: string;
  response: string;
  isError: boolean;
}

export default function App() {
  // Connexion Wi-Fi (reseau local, reponse immediate)
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [wifiConfigSaved, setWifiConfigSaved] = useState(false);

  // Connexion par mail (fonctionne de partout, reponse asynchrone)
  const [mailRecipient, setMailRecipient] = useState("");
  const [mailPassphrase, setMailPassphrase] = useState("");
  const [mailConfigSaved, setMailConfigSaved] = useState(false);

  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getServerConfig().then(({ serverUrl: savedUrl, token: savedToken }) => {
      if (savedUrl) setServerUrl(savedUrl);
      if (savedToken) setToken(savedToken);
      setWifiConfigSaved(Boolean(savedUrl && savedToken));
    });
    getMailConfig().then(({ recipient, passphrase }) => {
      if (recipient) setMailRecipient(recipient);
      if (passphrase) setMailPassphrase(passphrase);
      setMailConfigSaved(Boolean(recipient && passphrase));
    });
  }, []);

  async function handleSaveWifiConfig() {
    await saveServerConfig(serverUrl, token);
    setWifiConfigSaved(true);
  }

  async function handleSaveMailConfig() {
    await saveMailConfig(mailRecipient, mailPassphrase);
    setMailConfigSaved(true);
  }

  function addToHistory(currentCommand: string, response: string, isError: boolean) {
    setHistory((prev) => [{ command: currentCommand, response, isError }, ...prev]);
  }

  async function handleSendWifi() {
    if (!command.trim() || !serverUrl || !token) return;
    const currentCommand = command.trim();
    setSending(true);
    setCommand("");

    try {
      const response = await sendCommand(serverUrl, token, currentCommand);
      addToHistory(currentCommand, response, false);
    } catch (error) {
      addToHistory(
        currentCommand,
        error instanceof Error ? error.message : "Erreur inconnue.",
        true,
      );
    } finally {
      setSending(false);
    }
  }

  async function handleSendMail() {
    if (!command.trim() || !mailRecipient || !mailPassphrase) return;
    const currentCommand = command.trim();
    setSending(true);

    try {
      await sendCommandByMail(mailRecipient, mailPassphrase, currentCommand);
      setCommand("");
      addToHistory(
        currentCommand,
        "Mail envoye - la reponse arrivera dans ta boite mail une fois le PC connecte a traite la commande.",
        false,
      );
    } catch (error) {
      addToHistory(
        currentCommand,
        error instanceof Error ? error.message : "Erreur inconnue.",
        true,
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Serv'IA</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connexion Wi-Fi (reseau local)</Text>
          <Text style={styles.hint}>
            Lance `npm run server` sur ton PC, puis renseigne son adresse locale
            (ex: http://192.168.1.23:4174) et le token defini dans .env. Reponse
            immediate, mais telephone et PC doivent etre sur le meme Wi-Fi.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="http://192.168.1.23:4174"
            autoCapitalize="none"
            autoCorrect={false}
            value={serverUrl}
            onChangeText={setServerUrl}
          />
          <TextInput
            style={styles.input}
            placeholder="Token (ASSISTANT_TOKEN)"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={token}
            onChangeText={setToken}
          />
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleSaveWifiConfig}>
            <Text style={styles.buttonSecondaryText}>Enregistrer</Text>
          </TouchableOpacity>
          {wifiConfigSaved ? <Text style={styles.ok}>Configuration Wi-Fi enregistree.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connexion par mail (partout)</Text>
          <Text style={styles.hint}>
            Lance `npm run mail-bridge` sur ton PC. Fonctionne meme hors Wi-Fi
            local, mais la reponse arrive par mail (pas immediate).
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Adresse mail surveillee par le PC"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={mailRecipient}
            onChangeText={setMailRecipient}
          />
          <TextInput
            style={styles.input}
            placeholder="Phrase secrete (COMMAND_PASSPHRASE)"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={mailPassphrase}
            onChangeText={setMailPassphrase}
          />
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleSaveMailConfig}>
            <Text style={styles.buttonSecondaryText}>Enregistrer</Text>
          </TouchableOpacity>
          {mailConfigSaved ? <Text style={styles.ok}>Configuration mail enregistree.</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commande</Text>
          <TextInput
            style={styles.input}
            placeholder='ex: "range mes photos dans /Users/moi/Photos"'
            value={command}
            onChangeText={setCommand}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.button, sending && styles.buttonDisabled]}
            onPress={handleSendWifi}
            disabled={sending || !command.trim() || !serverUrl || !token}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Envoyer en Wi-Fi</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonSecondary, sending && styles.buttonDisabled]}
            onPress={handleSendMail}
            disabled={sending || !command.trim() || !mailRecipient || !mailPassphrase}
          >
            <Text style={styles.buttonSecondaryText}>Envoyer par mail</Text>
          </TouchableOpacity>
        </View>

        {history.map((exchange, index) => (
          <View key={index} style={styles.exchange}>
            <Text style={styles.exchangeCommand}>{exchange.command}</Text>
            <Text style={exchange.isError ? styles.exchangeError : styles.exchangeResponse}>
              {exchange.response}
            </Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, paddingTop: 60, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  section: { gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 12, color: "#666" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonSecondaryText: { color: "#111", fontWeight: "600" },
  ok: { color: "#2a7", fontSize: 12 },
  exchange: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    gap: 4,
  },
  exchangeCommand: { fontWeight: "600" },
  exchangeResponse: { color: "#333" },
  exchangeError: { color: "#c33" },
});
