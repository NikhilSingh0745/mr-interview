import { Server } from "socket.io";
import { Part } from "@google/generative-ai";
import { getGemini, INTERVIEW_CONTEXT } from "./gemini";

const sessions = new Map<string, any[]>();

export function initSocket(io: Server) {
    io.on("connection", (socket) => {
        console.log("✅ Client connected:", socket.id);

        sessions.set(socket.id, [
            { role: "user", parts: [{ text: INTERVIEW_CONTEXT }] },
            { role: "model", parts: [{ text: "Hello! Please tell me about yourself." }] },
        ]);

        socket.emit("ai_response", {
            text: "Hello! Please tell me about yourself.",
            isQuestion: true,
        });

        socket.on("user_audio", async ({ audio }) => {
            try {
                const model = getGemini();
                if (!model || !audio) return;

                const part: Part = {
                    inlineData: {
                        data: audio.split(",")[1],
                        mimeType: "audio/webm; codecs=opus",
                    },
                };

                const chat = model.startChat({
                    history: sessions.get(socket.id),
                });

                const res = await chat.sendMessage([part]);
                const text = await res.response.text();

                sessions.get(socket.id)?.push(
                    { role: "user", parts: [part] },
                    { role: "model", parts: [{ text }] }
                );

                socket.emit("ai_response", {
                    text,
                    isQuestion: text.includes("?"),
                });
            } catch (err) {
                socket.emit("ai_response", {
                    text: "Something went wrong. Please try again.",
                });
            }
        });

        socket.on("disconnect", () => {
            sessions.delete(socket.id);
            console.log("❌ Disconnected:", socket.id);
        });
    });

    io.engine.on("connection_error", (err) => {
        console.error("ENGINE ERROR:", err.code, err.message);
    });
}
