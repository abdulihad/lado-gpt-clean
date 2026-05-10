import { useState } from "react";

const API = "https://lado-gpt-clean.onrender.com";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        role: "ai",
        text: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log(error);
    }

    setInput("");
  };

  const generateImage = async () => {
    if (!input) return;

    try {
      const response = await fetch(`${API}/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const data = await response.json();

      setImage(data.image);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-10">
      <h1>Lado GPT</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <button onClick={generateImage}>
        Image
      </button>

      <div>
        {messages.map((msg, i) => (
          <p key={i}>
            <b>{msg.role}:</b> {msg.text}
          </p>
        ))}
      </div>

      {image && (
        <img
          src={image}
          alt="Generated"
          width="300"
        />
      )}
    </div>
  );
}

export default App;