import { useEffect, useRef } from "react";
import "./MessageBubble.css";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [message.text]);

  return (
    <div className={`bubble-wrapper ${isUser ? "user" : "nebula"}`}>
      {!isUser && (
        <div className="avatar nebula-avatar">
          <span className="avatar-icon">✦</span>
        </div>
      )}
      <div className={`bubble ${isUser ? "bubble-user" : "bubble-nebula"}`}>
        {message.isLoading ? (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        ) : (
          <p ref={textRef} className="bubble-text">
            {message.text}
          </p>
        )}
      </div>
      {isUser && (
        <div className="avatar user-avatar">
          <span className="avatar-icon">◉</span>
        </div>
      )}
    </div>
  );
}
