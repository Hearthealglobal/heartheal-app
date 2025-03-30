import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const moodPrompts = {
  sad: "It’s okay to feel low. What’s something you're holding in today that you wish someone understood?",
  meh: "Is there something you’ve been avoiding thinking about? Let it out here — no judgment.",
  okay: "What’s one thing you’ve done recently that you’re proud of, even a little?",
  good: "That’s beautiful to hear. What helped you feel this way today?",
  empowered: "Amazing. What message would you give your past self who was struggling?"
};

const systemPrompt = \`You are HeartHeal — a compassionate, emotionally intelligent AI companion that supports users through heartbreak and breakup recovery. Always respond with warmth, encouragement, and emotional insight. Do not offer clinical advice or diagnosis. Use soft, conversational tone. Use emojis sparingly (💜, 🌱, 💪 are okay). Keep responses under 100 words unless the user writes a long journal entry.\`;

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [mood, setMood] = useState(null);
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const handleEmailSubmit = () => {
    if (!email.includes("@")) return;
    localStorage.setItem("heartheal_email", email);
    setSignedUp(true);
  };

  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
    const prompt = moodPrompts[selectedMood];
    const aiMessage = { role: "ai", content: prompt };
    setChatLog([...chatLog, aiMessage]);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const userMessage = { role: "user", content: userInput };
    setChatLog([...chatLog, userMessage]);
    setUserInput("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${process.env.REACT_APP_OPENAI_API_KEY}\`
        },
        body: JSON.stringify({
          model: "gpt-4-1106-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatLog,
            userMessage
          ],
          temperature: 0.8
        })
      });

      const data = await response.json();
      const aiReply = data.choices[0].message.content;
      setChatLog((prev) => [...prev, { role: "ai", content: aiReply }]);
    } catch (error) {
      console.error("Error calling GPT API:", error);
      setChatLog((prev) => [...prev, { role: "ai", content: "Sorry, I’m having trouble responding right now. Please try again soon." }]);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("heartheal_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setSignedUp(true);
    }
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#fff0f5", padding: "2rem", fontFamily: "Arial", textAlign: "center" }}>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        HeartHeal 💔 AI Companion
      </motion.h1>

      {!signedUp ? (
        <div>
          <p>Sign up for early access 💌</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ padding: "0.5rem", marginRight: "0.5rem" }}
          />
          <button onClick={handleEmailSubmit} style={{ padding: "0.5rem 1rem" }}>Join Waitlist</button>
        </div>
      ) : !mood ? (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
          <button onClick={() => handleMoodSelect("sad")}>😔</button>
          <button onClick={() => handleMoodSelect("meh")}>😕</button>
          <button onClick={() => handleMoodSelect("okay")}>🙂</button>
          <button onClick={() => handleMoodSelect("good")}>😊</button>
          <button onClick={() => handleMoodSelect("empowered")}>💪</button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
          <div style={{ maxHeight: "400px", overflowY: "auto", padding: "1rem", background: "#fff", borderRadius: "1rem", marginBottom: "1rem" }}>
            {chatLog.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "0.5rem" }}>
                <span style={{ background: msg.role === "user" ? "#ffd6e8" : "#e8e6ff", padding: "0.5rem 1rem", borderRadius: "1rem", display: "inline-block" }}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Write your thoughts..."
              style={{ flex: 1, padding: "0.5rem" }}
            />
            <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>Send</button>
          </div>
        </div>
      )}
    </main>
  );
}