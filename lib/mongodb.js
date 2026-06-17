// lib/mongodb.js — 서버리스용 캐시 연결 (전역 _mongoClientPromise 재사용)
// pc-site-backend의 장수명 connectDB() 대신, 함수 호출마다 재연결을 피하기 위해
// global 객체에 connect Promise를 캐시한다(Vercel 서버리스 콜드스타트/동시요청 안전).
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export function hasMongo() {
  return !!uri;
}

function getClientPromise() {
  if (!uri) return null;
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

function resolveDbName() {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  try {
    const path = new URL(uri).pathname.replace(/^\//, "");
    if (path) return path;
  } catch (_) {}
  return "commerce";
}

// Mongo 미설정 시 null 반환 → 호출부에서 graceful degradation 처리
export async function getDb() {
  const promise = getClientPromise();
  if (!promise) return null;
  const client = await promise;
  return client.db(resolveDbName());
}
