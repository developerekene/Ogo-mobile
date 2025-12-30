import { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

const BACKEND_URL = "http://10.242.227.243:8000/search";

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
      });

      const data = await res.json(); // read once
      console.log("Server response:", data);
      setResponse(data.result);
      speak(data.result);
    } catch (err) {
      console.log(err);
      setStatus("Error sending audio");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ogo 🤖</Text>

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

      {response ? (
        <Text style={styles.response}>{response}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 38,
    color: "#fff",
    marginBottom: 20,
  },
  status: {
    color: "#cbd5f5",
    marginBottom: 30,
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
  response: {
    marginTop: 30,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});