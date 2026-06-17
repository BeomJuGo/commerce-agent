"use client";
import { useEffect, useRef, useState } from "react";

export default function WidgetPage() {
  const [sessionId, setSessionId] = useState("");
  const [shop, setShop] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! 무엇을 도와드릴까요? 상품 추천·가격·비교 무엇이든 물어보세요. 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    setSessionId(
      (crypto.randomUUID && crypto.randomUUID()) || `s_${Date.now()}_${Math.random().toString(36).slice(2)}`
    );
    const params = new URLSearchParams(window.location.search);
    if (params.get("shop")) setShop(params.get("shop"));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text, shopContext: shop || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = res.ok ? data.reply : data.error || "죄송합니다. 잠시 후 다시 시도해주세요.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "네트워크 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center gap-2 border-b border-gray-200 bg-indigo-600 px-4 py-3 text-white">
        <span className="text-lg">🛍️</span>
        <div>
          <p className="text-sm font-semibold leading-tight">AI 상담원</p>
          <p className="text-xs text-indigo-100">{shop || "온라인 쇼핑몰"}</p>
        </div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "bg-indigo-600 text-white" : "border border-gray-200 bg-white text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-400">입력 중…</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-gray-200 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요…"
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}
