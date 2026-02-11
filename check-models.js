// check-models.js
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        console.log("Checking available models...");
        // We use the 'listModels' method to see what your API key is allowed to use
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // access internal client

        // Note: The SDK doesn't always expose listModels directly on the client instance easily in older versions,
        // so we will try a standard fetch if you don't have the latest SDK, 
        // BUT for the installed SDK version, try this standard flow:

        // valid fetch using the raw API if SDK fails (Fail-safe)
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("---------------- AVAILABLE MODELS ----------------");
        const models = data.models || [];
        const generateModels = models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace("models/", "")); // Clean up the name

        console.log(generateModels.join("\n"));
        console.log("--------------------------------------------------");

        if (generateModels.length === 0) {
            console.log("⚠️ No models found. Check if 'Generative Language API' is enabled in Google Cloud Console.");
        }

    } catch (error) {
        console.error("Connection failed:", error.message);
    }
}

listModels();