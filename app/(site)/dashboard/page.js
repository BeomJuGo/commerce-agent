"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass } from "@/components/ui";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7"];

export default function DashboardPage() {
  const [key, setKey] = useState("");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function load(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/dashboard?days=${days}`, { headers: { Authorization: `Bearer ${key}` } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || json.error || "조회 실패");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        emoji="📊"
        title="고객 니즈 분석 대시보드"
        description="고객 응대 위젯의 대화 로그를 분석해 인텐트 분포와 핵심 니즈를 시각화합니다. (관리자 키 필요)"
      />
      <Card className="mb-6">
        <form onSubmit={load} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="관리자 API 키 (ADMIN_API_KEY)">
              <input className={inputClass} type="password" value={key} onChange={(e) => setKey(e.target.value)} required />
            </Field>
          </div>
          <Field label="기간(일)">
            <input className={inputClass} type="number" value={days} onChange={(e) => setDays(e.target.value)} min={1} max={90} />
          </Field>
          <Button type="submit" loading={loading}>
            불러오기
          </Button>
        </form>
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
        </div>
      )}
    </div>
  );
}
