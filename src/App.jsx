import { useState, useRef, useEffect } from "react";
import StarField from "./StarField";
import MessageBubble from "./MessageBubble";
import { sendMessage } from "./gemini";
import './App.css'

const WELCOME_SUGGESTIONS = [
  "What is the meaning of existence?",
  "Explain quantum entanglement simply",
  "Write me a haiku about the cosmos",
  "What makes a great programmer?",
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "model",
      text: "Greetings, traveler. I am NEBULA — forged in starlight and silicon. Ask me anything that burns within you. The cosmos awaits your curiosity. ✦",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(!import.meta.env.VITE_OPENAI_API_KEY);
  const [tempApiKey, setTempApiKey] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getHistory = () =>
    messages
      .filter((m) => m.id !== "welcome" && !m.isLoading)
      .map((m) => ({ role: m.role, text: m.text }));

  const handleSend = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isStreaming) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", text: userText };
    const loadingMsg = { id: "loading", role: "model", text: "", isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsStreaming(true);

    try {
      const stream = await sendMessage(getHistory(), userText);
      let fullText = "";
      const streamingId = Date.now() + 1;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? { id: streamingId, role: "model", text: "", isStreaming: true }
            : m
        )
      );

      for await (const chunk of stream) {
        const chunkText = chunk.choices?.[0]?.delta?.content ?? "";
        fullText += chunkText;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId ? { ...m, text: fullText } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      const errText =
        err?.message?.includes("API key")
          ? "⚠ Invalid API key. Please check your VITE_OPENAI_API_KEY in .env"
          : `⚠ A cosmic disturbance occurred: ${err.message}`;
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({ id: Date.now() + 2, role: "model", text: errText })
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyKey = () => {
    const key = tempApiKey.trim();
    if (key) {
      window.__NEBULA_API_KEY__ = key;
      setApiKeyMissing(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "key-set",
          role: "model",
          text: "API key received. The cosmic channel is now open. Ask me anything! ✦",
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "model",
        text: "The void is reset. A new conversation blooms from silence. What do you seek? ✦",
      },
    ]);
  };

  return (
    <div className="app">
      <StarField />

      <header className="header">
        <div className="logo">
          <div className="logo-orb" />
          <div>
            <h1 className="logo-title">NEBULA</h1>
            <p className="logo-sub">Cosmic AI Chat</p>
          </div>
        </div>
        <button className="clear-btn" onClick={clearChat} title="Clear conversation">
          ⟳ New Conversation
        </button>
      </header>

      {apiKeyMissing && (
        <div className="api-banner">
          <span>⚡ Enter your Azure OpenAI API key to activate NEBULA</span>
          <input
            className="api-key-input"
            type="password"
            placeholder="Azure API key..."
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyKey()}
          />
          <button className="api-key-btn" onClick={handleApplyKey}>
            Activate
          </button>
          <a
            href="https://portal.azure.com"
            target="_blank"
            rel="noreferrer"
            className="api-link"
          >
            Azure Portal →
          </a>
        </div>
      )}

      <main className="chat-area">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </main>

      {messages.length <= 2 && (
        <div className="suggestions">
          {WELCOME_SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="suggestion-chip"
              onClick={() => handleSend(s)}
              disabled={isStreaming}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <footer className="input-bar">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="input-field"
            placeholder="Ask the cosmos anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
          />
          <button
            className={`send-btn ${isStreaming ? "streaming" : ""}`}
            onClick={() => handleSend()}
            disabled={isStreaming || !input.trim()}
            title="Send (Enter)"
          >
            {isStreaming ? <span className="send-pulse" /> : "➤"}
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </footer>
    </div>
  );
}
