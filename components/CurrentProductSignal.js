"use client";
import { useEffect } from "react";

// 상세 페이지에서 '지금 보는 상품'을 전역에 노출 → SupportChat이 읽어 챗 컨텍스트로 전달
export default function CurrentProductSignal({ product }) {
  useEffect(() => {
    window.__caCurrentProduct = product;
    return () => {
      if (window.__caCurrentProduct === product) window.__caCurrentProduct = null;
    };
  }, [product]);
  return null;
}
