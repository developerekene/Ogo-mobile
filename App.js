import { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const BACKEND_URL =
  "https://buffer-acrylic-franchise-scsi.trycloudflare.com/search";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [status, setStatus] = useState("Tap the mic to speak");
  const [response, setResponse] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  function pulse() {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function speak(text) {
    if (!text) return;
    Speech.stop();
    setStatus("Ogo is speaking...");
    Speech.speak(text, {
      language: "en",
      rate: 0.9,
      onDone: () => setStatus("Tap the mic to speak"),
    });
  }

  async function startRecording() {
    try {
      pulse();
      setStatus("Requesting microphone permission...");
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setStatus("Microphone permission denied");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setStatus("Listening...");
    } catch (err) {
      console.log(err);
      setStatus("Error starting recording");
    }
  }

  async function stopRecording() {
    try {
      pulse();
      setStatus("Processing...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "voice.wav",
        type: "audio/wav",
      });

      setStatus("Sending to Ogo...");
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.log("Error parsing JSON:", err);
        console.log("Raw response:", text);
        setStatus("Error: invalid JSON from server");
        return;
      }

      console.log("Server response:", data);
      setResponse(data.result);
      speak(data.result);
      setStatus("Tap the mic to speak");
    } catch (err) {
      console.log("Fetch error:", err);
      setStatus(
        "Error sending audio. If using Cloudflare Quick Tunnel, try using your local IP instead."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ogoo</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Centered response */}
      <View style={styles.centerContent}>
        <Text style={styles.response}>{response || "Say something to Ogoo..."}</Text>
      </View>

      {/* Mic & status at bottom */}
      <View style={styles.bottomContainer}>
        <Text style={styles.status}>{status}</Text>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.micButton,
              recording && styles.micButtonActive,
            ]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Ionicons
              name={recording ? "stop" : "mic"}
              size={40}
              color="#000"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#1e293b",
    marginTop: 60
  },
  headerTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  response: {
    color: "#fff",
    fontSize: 18,
  },
  bottomContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  status: {
    color: "#cbd5f5",
    marginBottom: 10,
  },
  micButton: {
    backgroundColor: "#22c55e",
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: "#ef4444",
  },
});
