import Link from "next/link";

export default async function OrderCompletePage({ searchParams }) {
  const sp = await searchParams;
  const orderNo = sp.no ? String(sp.no) : "";

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="ca-mono inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff5c1a] text-2xl font-bold text-[#0a0a0a]">
        ✓
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-[#fafafa]">주문이 완료되었습니다</h1>
      <p className="mt-2 text-[#9a9a9d]">모의 결제로 주문이 접수되었습니다. 실제 결제는 발생하지 않았습니다.</p>
      {orderNo && (
        <div className="mt-6 inline-block rounded-xl border border-white/10 bg-[#141414] px-5 py-3">
          <span className="ca-mono text-xs text-[#6f6f72]">주문번호</span>
          <p className="ca-mono mt-1 text-lg font-bold tracking-wider text-[#ff7a3d]">{orderNo}</p>
        </div>
      )}
      <div className="mt-8">
        <Link href="/" className="ca-btn-primary inline-block rounded-full bg-[#ff5c1a] px-6 py-3 font-semibold text-[#0a0a0a]">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
