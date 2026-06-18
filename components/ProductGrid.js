import ProductTile from "@/components/ProductTile";

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return <p className="text-sm text-[#9a9aa2]">상품을 찾지 못했습니다.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductTile key={p.pkey} product={p} />
      ))}
    </div>
  );
}
