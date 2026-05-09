const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("AI Backend Running...");
});

/* ================= CHAT ================= */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "No response";

    res.json({ reply });
  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: "Chat failed",
    });
  }
});

/* ================= IMAGE ================= */
app.post("/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;

    res.json({
      image: imageUrl,
    });
  } catch (err) {
    console.log(err.message);

    res.status(500).json({
      error: "Image generation failed",
    });
  }
});

/* ================= SERVER ================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});