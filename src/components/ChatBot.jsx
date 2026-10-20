import { useState, useRef, useEffect } from "react";
import { botAnswer } from "../utils/botAnswer";
import "./ChatBot.css";

const SUGGESTIONS = ["Who expired?", "Who is ending soon?", "Who owes money?"];

function ChatBot({ members }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about your members and lockers." },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function ask(question) {
    const q = question.trim();
    if (q === "") return;
    setMessages((prev) => [
      ...prev,
      { from: "me", text: q },
      { from: "bot", text: botAnswer(q, members) },
    ]);
    setText("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(text);
  }

  if (!open) {
    return (
      <button className="chat-fab" onClick={() => setOpen(true)}>
        Assistant
      </button>
    );
  }

  return (
    <section className="chat" aria-label="Assistant">
      <header className="chat-head">
        <strong>Assistant</strong>
        <button onClick={() => setOpen(false)} aria-label="Close assistant">
          ×
        </button>
      </header>

      <div className="chat-body">
        {messages.map((m, i) => (
          <p key={i} className={`msg ${m.from}`}>
            {m.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-tips">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask something..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default ChatBot;
