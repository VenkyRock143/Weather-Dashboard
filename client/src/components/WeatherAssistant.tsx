"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function WeatherAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    const res = await api.post("/agent/query", { question });
    setAnswer(res.data.answer);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mt-6">
      <h2 className="text-xl font-bold mb-3">AI Weather Assistant</h2>

      <input
        className="border w-full p-2 rounded mb-2"
        placeholder="Ask something..."
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={ask}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {answer && (
        <div className="mt-4 p-4 bg-slate-50 rounded">
          {answer}
        </div>
      )}
    </div>
  );
}
