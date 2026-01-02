"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Globe, Volume2 } from "lucide-react";

const SOCKET_URL = "http://localhost:3001";
const ELEVENLABS_API_KEY = "sk_388a69249f2b39e718f5935c505c1a06df1ad7ac6e69d1b5"; // ✅ Paste your key!

export default function Page() {
  const socketRef = useRef<Socket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioUnlocked = useRef(false);

  const [text, setText] = useState("Connecting...");
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Auto-detect language & voice (29+ languages)
  const detectLanguageAndVoice = (text: string) => {
    if (/[ऀ-ॿ]/.test(text)) return "EXAVITQu4vr4xnSDxMaL"; // Hindi
    if (/[一-龯]/.test(text)) return "TXnu9aQGb4I3p0A5S5T9"; // Chinese  
    if (/[א-ת]/.test(text)) return "CYw3kZ02DaRb7YH6SI2B"; // Hebrew
    if (/[가-힣]/.test(text)) return "pNInz6obpgDQGcFmaJgB"; // Korean
    if (/[А-Яа-я]/.test(text)) return "bVMeCyIFuYUB8hpD6Gq9"; // Russian
    if (/[أ-ي]/.test(text)) return "fVtXg6gDo0h5NjPq8sFw"; // Arabic
    return "21m00Tcm4TlvDq8ikWAM"; // English (works all langs)
  };

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setText("✅ Connected! Click mic to start 🌐");
    });

    socket.on("ai_response", async (data) => {
      if (!data?.text) return;
      setText(data.text);
      await speak(data.text);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setText("❌ Reconnecting...");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------------- UNLOCK AUDIO + ELEVENLABS SPEAK ----------------
  const speak = async (text: string) => {
    if (speaking || !audioUnlocked.current) {
      console.log('🔒 Audio locked - click Mic first');
      return;
    }

    setSpeaking(true);
    const voiceId = detectLanguageAndVoice(text);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.slice(0, 400),
          model_id: "eleven_multilingual_v2", // 29+ languages!
          voice_settings: { stability: 0.5, similarity_boost: 0.8 }
        }),
      });

      if (!response.ok) {
        console.error('API Error:', response.status, await response.text());
        setSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(e => console.error('Play error:', e));
      }

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error('TTS failed:', err);
      setSpeaking(false);
    }
  };

  // ---------------- MIC RECORDING + AUDIO UNLOCK ----------------
  const startRecording = async () => {
    // 🔓 UNLOCK AUTOPLAY POLICY ON FIRST CLICK
    if (!audioUnlocked.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (context.state === 'suspended') await context.resume();
        audioUnlocked.current = true;
        console.log('✅ Audio unlocked!');
      } catch (err) {
        console.error('Unlock failed:', err);
        return;
      }
    }

    // RECORD AUDIO
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = e => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      const reader = new FileReader();
      reader.onloadend = () => socketRef.current?.emit("user_audio", { audio: reader.result });
      reader.readAsDataURL(blob);
    };

    recorder.start(1000);
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setRecording(false);
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
          🌍 AI Interview Bot
        </h1>
        <Globe className="w-10 h-10 animate-pulse" />
        <Volume2 className={`w-8 h-8 transition-all ${speaking ? 'animate-bounce text-green-400' : 'text-gray-500'}`} />
      </div>

      <div className="flex gap-6 w-full max-w-6xl">
        <div className="flex-1 bg-black/50 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <Webcam className="w-full h-[450px] object-cover" />
        </div>

        <div className="flex-1 bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center justify-center border border-white/20">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500 shadow-2xl ${speaking
            ? 'bg-gradient-to-r from-green-500 to-blue-500 animate-ping shadow-green-500/50'
            : 'bg-gray-700 hover:bg-gray-600'
            }`}>
            {speaking ? '🔊' : '🤖'}
          </div>

          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-white min-h-[100px] leading-relaxed">
              {text}
            </p>
            <div className={`text-sm px-3 py-1 rounded-full transition-all ${connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
              {connected ? '🟢 Connected' : '🔴 Connecting...'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-4">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={!connected}
            className="px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-xl font-bold rounded-2xl flex items-center gap-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Mic className="w-6 h-6" />
            🎤 Start Speaking
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-12 py-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-xl font-bold rounded-2xl flex items-center gap-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <MicOff className="w-6 h-6" />
            ⏹️ Stop & Send
          </button>
        )}

        {!audioUnlocked.current && connected && (
          <p className="text-yellow-400 text-lg font-medium text-center animate-pulse">
            👆 Click Mic first to enable AI voice responses (unlocks audio)
          </p>
        )}
      </div>
    </div>
  );
}
