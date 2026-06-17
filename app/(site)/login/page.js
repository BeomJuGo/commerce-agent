"use client";
import { useState } from "react";
import { PageHeader, Card, Button, ErrorBox, Field, inputClass, postJSON } from "@/components/ui";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await postJSON("/api/auth/login", { password });
      const from = new URLSearchParams(window.location.search).get("from") || "/dashboard";
      window.location.href = from;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader emoji="🔐" title="관리자 로그인" description="대시보드 등 관리자 기능은 로그인 후 이용할 수 있습니다." />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="비밀번호">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              autoFocus
              required
            />
          </Field>
          <ErrorBox message={error} />
          <Button type="submit" loading={loading} className="w-full">
            로그인
          </Button>
        </form>
      </Card>
    </div>
  );
}
