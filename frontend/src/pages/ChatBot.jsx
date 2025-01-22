import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import manette from "../assets/images/manette.svg";

const ChatBot = ({ onGameRecommendations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); 
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { role: "user", content: input }];
      setMessages(newMessages);
  
      setIsTyping(true);
  
      try {
        const response = await axios.post(
          "http://localhost:8000/api/chatbot",
          { message: input },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        const botResponse = response.data;
  
        if (botResponse.startsWith("Je vous recommande les jeux suivants :")) {
          const gameTitles = extractGameTitles(botResponse);
          onGameRecommendations(gameTitles);
          setMessages([
            ...newMessages,
            { role: "bot", content: botResponse },
          ]);
        } else {
          setMessages([
            ...newMessages,
            { role: "bot", content: botResponse },
          ]);
        }
      } catch (error) {
        console.error("Erreur avec le chatbot:", error);
        setMessages([
          ...newMessages,
          {
            role: "bot",
            content: "Une erreur est survenue. Réessayez plus tard.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
  
      setInput("");
    }
  };
  
  const extractGameTitles = (responseText) => {
    const stopPhrase = "je vous invite à vous diriger sur la page Jeux recommandés, vous y trouverez toutes les recommandations de jeux";
    const textBeforeStopPhrase = responseText.split(stopPhrase)[0].trim();
    const gameList = textBeforeStopPhrase.replace("Je vous recommande les jeux suivants :", "").trim();
    const titles = gameList.split(",").map(title => title.trim());
    const gameObjects = titles.map(title => ({ title }));
    return gameObjects;
  };

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
      <img src={manette} alt="" className="chatbot-toggle" onClick={toggleChatbot} />

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <strong>ChatBot</strong>
            <button onClick={toggleChatbot}>✖</button>
          </div>
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <strong className={msg.role === "user" ? "text-primary" : "text-success"}>
                  {msg.role === "user" ? "Vous" : "Bot"}:
                </strong>{" "}
                {msg.content}
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
            <button onClick={sendMessage}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
