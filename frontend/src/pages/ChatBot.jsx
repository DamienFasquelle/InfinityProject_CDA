import React, { useState, useRef, useEffect, useCallback } from "react";
import manette from "../assets/images/manette.svg";

const ChatBot = ({ onGameRecommendations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatbot = () => setIsOpen((prev) => !prev);

  const extractGameTitles = (responseText) => {
  const lines = responseText.split("\n");

  const startIndex = lines.findIndex(line =>
    line.includes("📋 Liste des jeux recommandés :")
  );

  if (startIndex === -1) return [];

  const gameLines = lines.slice(startIndex + 1).filter(line => line.startsWith("- "));

  return gameLines.map(line => ({
    title: line.replace("- ", "").trim()
  }));
};


  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    // Formater le bon historique pour l’API OpenAI
    const formattedHistory = updatedMessages.map(msg => ({
      role: msg.role === "bot" ? "assistant" : msg.role,
      content: msg.content
    }));

    try {
      const response = await fetch(`${API_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input,
          history: formattedHistory
        })
      });

      const data = await response.json();
      const botResponse = data.message || "Pas de réponse";

      const botMessage = { role: "bot", content: botResponse };
      setMessages(prev => [...prev, botMessage]);
      console.log("Réponse du bot:", botResponse);

      if (botResponse.includes("Jeux recommandés")) {
        const gameTitles = extractGameTitles(botResponse);
        onGameRecommendations(gameTitles);
        console.log("Jeux recommandés:", gameTitles);
      }

    } catch (error) {
      console.error("Erreur avec le chatbot:", error);
      setMessages(prev => [...prev, {
        role: "bot",
        content: "❌ Une erreur est survenue. Réessayez plus tard."
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, API_URL, token, onGameRecommendations]);

  const TypingIndicator = () => {
    const [dots, setDots] = useState("");
    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prev => (prev.length < 3 ? prev + "." : ""));
      }, 500);
      return () => clearInterval(interval);
    }, []);
    return <span className="typing-indicator">Le bot écrit{dots}</span>;
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      <img
        src={manette}
        alt="Ouvrir le chatbot"
        className="chatbot-toggle"
        onClick={toggleChatbot}
      />

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <strong>ChatBot</strong>
            <button onClick={toggleChatbot} aria-label="Fermer">✖</button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message bot">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Écrivez un message..."
            />
            <button onClick={sendMessage} disabled={!input.trim()}>
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
