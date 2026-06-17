"use client";
import { useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/ui";

export default function WidgetDemoPage() {
  const [origin, setOrigin] = useState("https://your-domain.vercel.app");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const snippet = `<script src="${origin}/widget.js" data-shop="내 쇼핑몰 이름"></script>`;

  return (
    <div>
      <PageHeader
        emoji="💬"
        title="고객 응대 AI 위젯"
        description="아래 한 줄을 쇼핑몰 HTML에 붙이면 우하단에 AI 상담 챗봇이 떠서 상품 문의에 응대합니다."
      />
      <Card className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">설치 스니펫</p>
        <pre className="overflow-x-auto rounded-xl bg-gray-900 px-4 py-3 text-sm text-gray-100">
          <code>{snippet}</code>
        </pre>
        <p className="mt-2 text-xs text-gray-500">
          <code>data-shop</code> 속성으로 쇼핑몰 이름을 전달하면 응대 맥락에 반영됩니다.
        </p>
      </Card>
      <Card>
        <p className="mb-3 text-sm font-medium text-gray-700">미리보기 (실제 위젯)</p>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <iframe src="/widget?shop=데모 쇼핑몰" title="widget preview" className="h-[520px] w-full" />
        </div>
      </Card>
    </div>
  );
}
