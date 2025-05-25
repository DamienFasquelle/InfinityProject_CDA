import React, { useState, useRef, useEffect, useCallback } from "react";
import manette from "../assets/images/manette.svg";

const ChatBot = ({ onGameRecommendations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recommendedGames, setRecommendedGames] = useState([]);

  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatbot = () => setIsOpen((prev) => !prev);

  const sendMessage = useCallback(async () => {
  if (!input.trim()) return;

  const extractGameTitles = (responseText) => {
  const lines = responseText.split("\n");

  const gameLines = lines.filter((line) =>
    line.match(/^(\d+\.|\-|\*|•)\s+\*\*(.+?)\*\*/)
  );

  const games = gameLines.map((line) => {
    const match = line.match(/\*\*(.+?)\*\*/);
    return match ? { title: match[1].trim() } : null;
  }).filter(Boolean);

  return games;
};



  const updatedMessages = [...messages, { role: "user", content: input }];
  setMessages(updatedMessages);
  setIsTyping(true);
  setInput("");

  try {
    const response = await fetch(`${API_URL}/api/chatbot`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await response.json();
    const botResponse = data.message;

    const isRecommendation = botResponse.includes("Ces jeux sont disponibles dans la section *Jeux recommandés*");
    const newBotMessage = { role: "bot", content: botResponse };

    setMessages((prev) => [...prev, newBotMessage]);

    if (isRecommendation) {
  const gameTitles = extractGameTitles(botResponse);
  setRecommendedGames(gameTitles); 
  onGameRecommendations(gameTitles); 
  console.log("Jeux recommandés:", gameTitles);
}

  } catch (error) {
    console.error("Erreur avec le chatbot:", error);
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        content: "Une erreur est survenue. Réessayez plus tard.",
      },
    ]);
  } finally {
    setIsTyping(false);
  }
}, [input, messages, API_URL, token, onGameRecommendations]);


  const TypingIndicator = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
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
  <div className="message-bubble">
    {msg.content}
  </div>
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
