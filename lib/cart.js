"use client";
// lib/cart.js — 익명 장바구니 (localStorage). 변경 시 'ca-cart-change' 이벤트 발행.
const KEY = "ca_cart";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("ca-cart-change"));
}

export function cartCount(cart = getCart()) {
  return cart.reduce((n, i) => n + (i.qty || 0), 0);
}

export function cartTotal(cart = getCart()) {
  return cart.reduce((n, i) => n + (Number(i.lprice) || 0) * (i.qty || 0), 0);
}

export function addToCart(item) {
  const cart = getCart();
  const i = cart.findIndex((x) => x.pkey === item.pkey);
  if (i >= 0) {
    cart[i].qty += 1;
  } else {
    cart.push({
      pkey: item.pkey,
      title: item.title,
      image: item.image || null,
      lprice: Number(item.lprice) || 0,
      link: item.link || null,
      mallName: item.mallName || null,
      qty: 1,
    });
  }
  save(cart);
}

export function setQty(pkey, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter((x) => x.pkey !== pkey);
  } else {
    const i = cart.findIndex((x) => x.pkey === pkey);
    if (i >= 0) cart[i].qty = qty;
  }
  save(cart);
}

export function removeFromCart(pkey) {
  save(getCart().filter((x) => x.pkey !== pkey));
}

export function clearCart() {
  save([]);
}
