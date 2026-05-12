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

    const completion =
      await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        model: "llama3-70b-8192",
      });

    const aiReply =
      completion.choices[0].message.content;

    res.send(aiReply);

  } catch (err) {
    console.log(err);

    res.status(500).send("Server Error");
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