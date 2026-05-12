import { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import "./index.css";

const API = "https://ladogpt-backend.onrender.com";

export default function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "New Chat",
            messages: [],
          },
        ];
  });

  const [activeChat, setActiveChat] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const currentChat = chats.find((c) => c.id === activeChat);
  const messages = useMemo(() => {
  return currentChat?.messages || [];
}, [currentChat]);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // NEW CHAT
  const newChat = () => {
    const id = Date.now();

    setChats((prev) => [
      {
        id,
        title: "New Chat",
        messages: [],
      },
      ...prev,
    ]);

    setActiveChat(id);
  };

  // DELETE CHAT
  const deleteChat = (id) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);

    if (activeChat === id && updated.length > 0) {
      setActiveChat(updated[0].id);
    }
  };

  // SEND MESSAGE
const sendMessage = async () => {
  if (!input.trim()) return;

  const userText = input;
  setInput("");

  // add user + empty AI message
  setChats((prev) =>
    prev.map((chat) =>
      chat.id === activeChat
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              { role: "user", text: userText },
              { role: "ai", text: "" },
            ],
          }
        : chat
    )
  );

  setLoading(true);

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
const text = data.reply;

setChats((prev) =>
  prev.map((chat) =>
    chat.id === activeChat
      ? {
          ...chat,
          messages: [
            ...chat.messages.slice(0, -1),
            { role: "ai", text },
          ],
        }
      : chat
  )
);

  } catch (err) {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "ai", text: "Server error" },
              ],
            }
          : chat
      )
    );
  }

  setLoading(false);
};

  // IMAGE GENERATION
  const generateImage = async () => {
    if (!input.trim()) return;

    const prompt = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "ai", image: data.image },
                ],
              }
            : chat
        )
      );
    } catch (err) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { role: "ai", text: "Image generation failed" },
                ],
              }
            : chat
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900 text-white">

      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-black p-3 hidden md:flex flex-col border-r border-gray-800">
        <h1 className="text-2xl font-bold mb-4">LadoGPT</h1>

        <button
          onClick={newChat}
          className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-xl mb-4"
        >
          + New Chat
        </button>

        <div className="space-y-2 overflow-y-auto flex-1">
          {chats.map((chat) => (
            <div key={chat.id} className="flex gap-2 items-center">
              <div
                onClick={() => setActiveChat(chat.id)}
                className={`flex-1 p-3 rounded-xl cursor-pointer ${
                  chat.id === activeChat
                    ? "bg-gray-700"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {chat.title}
              </div>

              <button
                onClick={() => deleteChat(chat.id)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col h-full">

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-3 md:p-4 rounded-2xl max-w-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gray-800 border border-gray-700"
                }`}
              >
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="generated"
                    className="rounded-xl"
                  />
                ) : (
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400">
              AI is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-2 md:p-4 bg-black flex items-center gap-2 border-t border-gray-800 w-full">

          <button
            onClick={generateImage}
            className="bg-green-600 px-2 md:px-4 py-2 rounded-xl text-sm md:text-base whitespace-nowrap"
          >
            Image
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 min-w-0 p-3 rounded-xl bg-gray-900 border border-gray-700 outline-none text-sm md:text-base"
            placeholder="Ask anything..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-3 md:px-5 py-2 rounded-xl text-sm md:text-base whitespace-nowrap"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}