// 1. Load the .env file (must be at the top)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai"); // 2. Import OpenAI

const app = express();
app.use(cors());
app.use(express.json());

// 3. Initialize the OpenAI client with your key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 4. We delete the old 'generateBotReply' function.
// This is our new "system prompt" for the AI.
const ecoBuddyPrompt = `
  You are "EcoBuddy," a cheerful, encouraging, and helpful AI assistant 
  for an app called "EcoTrack." Your goal is to help users track and 
  reduce their carbon footprint.
  
  - Your name is EcoBuddy.
  - Keep your responses short and friendly (like a chat message).
  - Use emojis to make it engaging! 🌱🌍💚
  - If the user asks for a challenge, give them a simple, actionable one
    (e.g., "Try taking a shorter shower 🚿" or "Eat one plant-based meal today! 🥦").
  - If the user asks for their progress, you can give a generic positive response, 
    as you don't have access to their real data.
  - If the user asks a question you can't answer, just be honest and friendly.
`;

// 5. This is our updated /chat endpoint
app.post("/chat", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "No message text provided" });
  }

  console.log("Received message from app:", text);

  try {
    // 6. This is the main API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Cost-effective and fast model
      messages: [
        { role: "system", content: ecoBuddyPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 100, // Keeps responses short and saves money
    });

    // 7. Extract the reply text
    const botReply = completion.choices[0].message.content;
    console.log("Sending reply from AI:", botReply);

    // 8. Send the reply back to the app
    res.json({ reply: botReply.trim() });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ reply: "Sorry, I'm having a little trouble thinking right now. 😅 Please try again." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`EcoBuddy AI server running on http://localhost:${PORT}`);
});