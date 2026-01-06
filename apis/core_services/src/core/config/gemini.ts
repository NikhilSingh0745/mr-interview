import axios from "axios";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

let model: any;


export const INTERVIEW_CONTEXT = `
You are Mirats AI, a senior technical interviewer.

Rules:
- Automatically detect the user's language.
- Reply in the SAME language as the user.
- Keep responses short and natural.
- Ask only ONE question at a time.
- Interview for Node.js backend role.
- End interview with: "Thank you! Interview complete."
`;

export async function initGemini() {
    if (model) return model;
    if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const res = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const selected = res.data.models.find(
        (m: any) =>
            m.supportedGenerationMethods?.includes("generateContent") &&
            m.name.includes("flash")
    );

    if (!selected) throw new Error("No Gemini model available");

    model = genAI.getGenerativeModel({
        model: selected.name.split("/").pop(),
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    });

    console.log("✅ Gemini ready:", selected.name);
    return model;
}

export const getGemini = () => model;
