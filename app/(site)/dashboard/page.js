"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader, Card, Button, ErrorBox } from "@/components/ui";

const COLORS = ["#ff5c1a", "#5fbf8a", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];
const TOOLTIP_STYLE = {
  background: "#141414",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  color: "#eaeaea",
};

export default function DashboardPage() {
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function load(d = days) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/dashboard?days=${d}`);
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/login?from=/dashboard";
        return;
      }
      if (!res.ok) throw new Error(json.message || json.error || "조회 실패");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow="DASHBOARD"
          title="고객 니즈 분석 대시보드"
          description="고객 응대 위젯의 대화 로그를 분석해 인텐트 분포와 핵심 니즈를 시각화합니다."
        />
        <button onClick={logout} className="ca-mono mt-1 whitespace-nowrap text-xs text-[#6f6f72] hover:text-red-400">
          LOGOUT
        </button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#c8c8cc]">기간(일)</span>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-[#f4f4f3] outline-none focus:border-[#ff5c1a]"
            >
              {["1", "7", "14", "30", "90"].map((d) => (
                <option key={d} value={d}>
                  최근 {d}일
                </option>
              ))}
            </select>
          </label>
          <Button onClick={() => load(days)} loading={loading}>
            새로고침
          </Button>
        </div>
      </Card>

      <ErrorBox message={error} />

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["총 메시지", data.totalMessages],
              ["세션 수", data.sessionCount],
              ["분석 샘플", data.sampleSize],
            ].map(([label, val]) => (
              <Card key={label}>
                <p className="ca-mono text-xs tracking-wider text-[#6f6f72]">{label}</p>
                <p className="mt-1 text-2xl font-bold text-[#fafafa]">{val}</p>
              </Card>
            ))}
          </div>

          {data.intents?.length > 0 && (
            <Card>
              <p className="mb-3 font-semibold text-[#fafafa]">인텐트 분포</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.intents} dataKey="count" nameKey="intent" outerRadius={90}>
                      {data.intents.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ color: "#9a9a9d", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {data.topNeeds?.length > 0 && (
            <Card>
              <p className="mb-3 font-semibold text-[#fafafa]">핵심 고객 니즈</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topNeeds} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" tick={{ fill: "#909093", fontSize: 12 }} stroke="#3a3a3a" />
                    <YAxis type="category" dataKey="need" width={120} tick={{ fill: "#909093", fontSize: 12 }} stroke="#3a3a3a" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="count" fill="#ff5c1a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2">
                {data.topNeeds.map((n, i) => (
                  <li key={i} className="text-sm text-[#b8b8bc]">
                    <span className="font-medium text-[#eaeaea]">{n.need}</span>
                    {n.examples?.length > 0 && <span className="text-[#6f6f72]"> — {n.examples.join(" / ")}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(data.trends || data.gaps) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.trends && (
                <Card>
                  <p className="font-semibold text-[#fafafa]">최근 경향</p>
                  <p className="mt-1 text-sm text-[#b8b8bc]">{data.trends}</p>
                </Card>
              )}
              {data.gaps && (
                <Card>
                  <p className="font-semibold text-[#fafafa]">충족되지 않은 니즈</p>
                  <p className="mt-1 text-sm text-[#b8b8bc]">{data.gaps}</p>
                </Card>
              )}
            </div>
          )}

          {data.totalMessages === 0 && (
            <p className="text-sm text-[#86868a]">아직 분석할 대화 로그가 없습니다. 위젯에서 대화가 쌓이면 표시됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
