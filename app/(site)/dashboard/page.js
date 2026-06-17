"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader, Card, Button, ErrorBox } from "@/components/ui";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

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
    <div>
      <div className="flex items-start justify-between">
        <PageHeader
          emoji="📊"
          title="고객 니즈 분석 대시보드"
          description="고객 응대 위젯의 대화 로그를 분석해 인텐트 분포와 핵심 니즈를 시각화합니다."
        />
        <button onClick={logout} className="mt-1 whitespace-nowrap text-sm text-gray-400 hover:text-red-600">
          로그아웃
        </button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">기간(일)</span>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-indigo-500"
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
            <Card>
              <p className="text-sm text-gray-500">총 메시지</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalMessages}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">세션 수</p>
              <p className="text-2xl font-bold text-gray-900">{data.sessionCount}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">분석 샘플</p>
              <p className="text-2xl font-bold text-gray-900">{data.sampleSize}</p>
            </Card>
          </div>

          {data.intents?.length > 0 && (
            <Card>
              <p className="mb-3 font-semibold text-gray-900">인텐트 분포</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.intents} dataKey="count" nameKey="intent" outerRadius={90} label>
                      {data.intents.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {data.topNeeds?.length > 0 && (
            <Card>
              <p className="mb-3 font-semibold text-gray-900">핵심 고객 니즈</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topNeeds} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="need" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2">
                {data.topNeeds.map((n, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{n.need}</span>
                    {n.examples?.length > 0 && <span className="text-gray-400"> — {n.examples.join(" / ")}</span>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {(data.trends || data.gaps) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.trends && (
                <Card>
                  <p className="font-semibold text-gray-900">📈 최근 경향</p>
                  <p className="mt-1 text-sm text-gray-700">{data.trends}</p>
                </Card>
              )}
              {data.gaps && (
                <Card>
                  <p className="font-semibold text-gray-900">🕳️ 충족되지 않은 니즈</p>
                  <p className="mt-1 text-sm text-gray-700">{data.gaps}</p>
                </Card>
              )}
            </div>
          )}

          {data.totalMessages === 0 && (
            <p className="text-sm text-gray-500">아직 분석할 대화 로그가 없습니다. 위젯에서 대화가 쌓이면 표시됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
