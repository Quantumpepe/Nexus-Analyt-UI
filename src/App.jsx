function safeSetGridOrdersFromResponse(r, setOrdersFn) {
  const arr =
    r?.orders ??
    r?.data?.orders ??
    r?.grid?.orders ??
    r?.gridMeta?.orders ??
    r?.data?.grid?.orders ??
    r?.data?.gridMeta?.orders;
  if (Array.isArray(arr) && typeof setOrdersFn === "function") {
    setOrdersFn(arr);
  }
}

function getGridOrdersFromResponse(r) {
  return (
    r?.orders ??
    r?.data?.orders ??
    r?.grid?.orders ??
    r?.gridMeta?.orders ??
    r?.data?.grid?.orders ??
    r?.data?.gridMeta?.orders ??
    null
  );
}

function getGridSingleOrderFromResponse(r) {
  return (
    r?.order ??
    r?.data?.order ??
    r?.grid?.order ??
    r?.gridMeta?.order ??
    r?.data?.grid?.order ??
    r?.data?.gridMeta?.order ??
    null
  );
}

function getGridMetaFromResponse(r, fallback = {}) {
  const gm =
    r?.gridMeta ??
    r?.grid_meta ??
    r?.grid ??
    r?.data?.gridMeta ??
    r?.data?.grid_meta ??
    r?.data?.grid ??
    {};

  return {
    tick:
      gm?.current_tick ??
      gm?.tick ??
      r?.data?.gridMeta?.current_tick ??
      r?.data?.grid_meta?.current_tick ??
      r?.data?.grid?.current_tick ??
      r?.data?.gridMeta?.tick ??
      r?.data?.grid_meta?.tick ??
      r?.data?.grid?.tick ??
      r?.data?.tick ??
      r?.tick ??
      fallback?.tick ??
      null,
    price:
      r?.price ??
      r?.data?.price ??
      gm?.price ??
      gm?.current_price ??
      gm?.last_price ??
      fallback?.price ??
      null,
    gridItemId:
      r?.gridItemId ??
      r?.itemId ??
      r?.item ??
      gm?.gridItemId ??
      gm?.itemId ??
      gm?.item ??
      gm?.id ??
      r?.data?.gridItemId ??
      r?.data?.itemId ??
      r?.data?.item ??
      fallback?.gridItemId ??
      fallback?.itemId ??
      fallback?.item ??
      fallback?.id ??
      null,
  };
}

function getGridVaultStatsFromResponse(r, fallback = {}) {
  const data = r?.data ?? {};
  const vaultTotal =
    r?.vault_total ??
    r?.vaultTotal ??
    data?.vault_total ??
    data?.vaultTotal ??
    fallback?.vault_total ??
    fallback?.vault ??
    0;
  const reserved =
    r?.reserved ??
    data?.reserved ??
    fallback?.reserved ??
    0;
  const free =
    r?.free ??
    data?.free ??
    fallback?.free ??
    Math.max(0, Number(vaultTotal || 0) - Number(reserved || 0));

  return {
    vault: Number(vaultTotal) || 0,
    reserved: Number(reserved) || 0,
    free: Number(free) || 0,
  };
}
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

function loadSetLS(key) {
  try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { return new Set(); }
}
function saveSetLS(key, setVal) {
  localStorage.setItem(key, JSON.stringify(Array.from(setVal)));
}

function tB(de, en) {
  // simple bilingual label: shows DE + EN (user requested both)
  if (!de) return en || "";
  if (!en) return de || "";
  return `${de} / ${en}`;
}

function _cleanAiInsightSentence(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .replace(/\b(?:you should|consider buying|buy now|sell now|enter now|exit now)\b/gi, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}


  const aiRiskTone = (level) => {
    const v = String(level || "").toLowerCase();
    if (v.includes("high")) return { border: "rgba(255,82,82,0.45)", bg: "rgba(255,82,82,0.10)", color: "#ff6b6b", label: "HIGH RISK" };
    if (v.includes("medium")) return { border: "rgba(255,193,7,0.45)", bg: "rgba(255,193,7,0.10)", color: "#ffc107", label: "WATCH" };
    return { border: "rgba(0,255,136,0.35)", bg: "rgba(0,255,136,0.08)", color: "#21d07a", label: "CONTROLLED" };
  };

  const aiConfidenceTone = (value) => {
    const n = Number(value || 0);
    if (n >= 8) return { color: "#21d07a", label: "HIGH" };
    if (n >= 6) return { color: "#ffc107", label: "MEDIUM" };
    return { color: "#ff6b6b", label: "LOW" };
  };

  const aiTagLabel = (tag) =>
    String(tag || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());


function buildCompactAiInsight({ backendText = "", trendStructure = "", momentumShift = "", insightSummary = "" }) {
  const raw = String(backendText || "").trim();

  // Important for AI Insight:
  // Do not cut the smart part away. The backend is now instructed to include
  // rating + community + on-chain context. Keeping up to 5 clean sentences
  // makes those signals visible without turning the card into a long report.
  const splitSentences = (value) =>
    String(value || "")
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map(_cleanAiInsightSentence)
      .filter(Boolean);

  const backendSentences = splitSentences(raw)
    .filter((s) => s.length >= 16)
    .slice(0, 7);

  if (backendSentences.length >= 1) {
    return backendSentences.join(" ");
  }

  const parts = [];
  if (trendStructure) parts.push(_cleanAiInsightSentence(trendStructure));
  if (momentumShift) parts.push(_cleanAiInsightSentence(momentumShift));
  if (insightSummary) parts.push(_cleanAiInsightSentence(insightSummary));

  const unique = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (!key || unique.some((x) => x.toLowerCase() === key)) continue;
    unique.push(part);
  }

  return unique.slice(0, 4).join(" ") || "The current structure is mixed and does not show a fully clear edge yet.";
}

const LS_WATCH_REMOVED = "nexus_watch_removed";

function _watchKeyFromItem(it) {
  const mode = String(it?.mode || "market").toLowerCase();
  if (mode === "dex") {
    const addr = String(it?.contract || it?.tokenAddress || "").toLowerCase();
    return `dex|${addr}`;
  }
  const sym = String(it?.symbol || "").toUpperCase();
  const cg = String(it?.coingecko_id || it?.id || "").toLowerCase();
  return `market|${sym}|${cg}`;
}
function _watchKeyFromRow(r) {
  const mode = String(r?.mode || "market").toLowerCase();
  if (mode === "dex") {
    const addr = String(r?.contract || r?.tokenAddress || "").toLowerCase();
    return `dex|${addr}`;
  }
  const sym = String(r?.symbol || "").toUpperCase();
  const cg = String(r?.coingecko_id || r?.id || "").toLowerCase();
  return `market|${sym}|${cg}`;
}
function _loadTombstones() {
  try { return JSON.parse(localStorage.getItem(LS_WATCH_REMOVED) || "{}") || {}; } catch { return {}; }
}
function _saveTombstones(obj) {
  try { localStorage.setItem(LS_WATCH_REMOVED, JSON.stringify(obj || {})); } catch {}
}
function _setTombstone(key) {
  if (!key) return;
  const ts = _loadTombstones();
  ts[key] = Date.now();
  _saveTombstones(ts);
}
function _clearTombstone(key) {
  if (!key) return;
  const ts = _loadTombstones();
  if (ts[key] != null) {
    delete ts[key];
    _saveTombstones(ts);
  }
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import { Alchemy, Network, Utils } from "alchemy-sdk";

import "./App.css";

// Chart palette (20 colors). Kept inline (no external dep) to avoid runtime ReferenceError.
// Used for consistent compare/index chart series coloring.
const PALETTE20 = [
  "#22c55e", // green
  "#60a5fa", // blue
  "#f59e0b", // amber
  "#a78bfa", // violet
  "#f472b6", // pink
  "#34d399", // emerald
  "#fb7185", // rose
  "#38bdf8", // sky
  "#eab308", // yellow
  "#c084fc", // purple
  "#14b8a6", // teal
  "#f97316", // orange
  "#818cf8", // indigo
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#ef4444", // red
  "#10b981", // green-alt
  "#3b82f6", // blue-alt
  "#d946ef", // fuchsia
  "#facc15", // gold
];

// Local cache (stale-while-revalidate) so live refresh/cold-start won't blank the UI
const LS_WATCH_ROWS_CACHE = "na_watch_rows_cache_v1";
const LS_COMPARE_SERIES_CACHE = "na_compare_series_cache_v1";
const LS_APP_VERSION = "na_app_version";
const LS_COMPARE_STORE = "na_compare_store_v2";
const LS_GRID_COIN_PREFIX = "na_grid_coin";
const COMPARE_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes
const COMPARE_CACHE_MAX_ENTRIES = 20;
const APP_VERSION = "2026-01-29-v4";

const API_BASE = ((import.meta.env.VITE_API_BASE ?? "").trim()) || (() => {
  // Default backend for production builds.
  // - In local dev (localhost), keep it empty so Vite proxy can handle /api/*.
  // - In production, route /api/* to the backend (Render) unless explicitly overridden by VITE_API_BASE.
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (["localhost", "127.0.0.1"].includes(host)) return "";
  return "https://nexus-analyt-pro.onrender.com";
})();
const ALCHEMY_KEY = (import.meta.env.VITE_ALCHEMY_KEY ?? "").trim();
const TREASURY_ADDRESS = (import.meta.env.VITE_TREASURY_ADDRESS ?? "").trim();
const API_KEY = (import.meta.env.VITE_NEXUS_API_KEY ?? "").trim();
console.log("API_KEY loaded?", API_KEY ? "YES" : "NO");
window.__API_KEY_OK__ = !!API_KEY;
const TOKEN_WHITELIST = {
  ETH: [
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  ],
  POL: [
    // Polygon native USDC (Circle) and USDT
    { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    { symbol: "USDT", address: "0xC2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
  ],
  BNB: [
    // BNB Chain (BEP-20) pegged versions
    { symbol: "USDC", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
  ],
};
const getAssetNote = (coin) => {
  if (coin === "BTC") return "via WBTC (ETH) / BTCB (BNB)";
  if (coin === "SOL") return "via WSOL";
  return null;
};
// ------------------------
// Alchemy (wallet balances)
// ------------------------
// You can override any URL via env vars:
//   VITE_ALCHEMY_RPC_ETH, VITE_ALCHEMY_RPC_POL, VITE_ALCHEMY_RPC_BNB
// Defaults below follow Alchemy's common network hostnames.
// IMPORTANT: Alchemy RPC auth is done via the /v2/<API_KEY> path.
// If you still get 401 "Must be authenticated", it usually means the key is not
// the *Alchemy API Key* (or it contains hidden whitespace) OR your env isn't loaded.
// In that case, copy the full HTTPS endpoint from Alchemy dashboard and set:
//   VITE_ALCHEMY_RPC_ETH / _POL / _BNB
// (those override everything below).
const ALCHEMY_RPC = {
  ETH:
    import.meta.env.VITE_ALCHEMY_RPC_ETH ||
    (ALCHEMY_KEY ? `https://eth-mainnet.g.alchemy.com/v2/${encodeURIComponent(ALCHEMY_KEY)}` : ""),
  POL:
    import.meta.env.VITE_ALCHEMY_RPC_POL ||
    (ALCHEMY_KEY ? `https://polygon-mainnet.g.alchemy.com/v2/${encodeURIComponent(ALCHEMY_KEY)}` : ""),
  BNB:
    import.meta.env.VITE_ALCHEMY_RPC_BNB ||
    (ALCHEMY_KEY ? `https://bnb-mainnet.g.alchemy.com/v2/${encodeURIComponent(ALCHEMY_KEY)}` : ""),
};

function maskAlchemyUrl(url) {
  if (!url) return "";
  // hide API key segment if present
  return url.replace(/\/v2\/[^/?#]+/i, "/v2/");
}

async function alchemyRpc(chainKey, method, params = []) {
  const url = ALCHEMY_RPC[chainKey];
  if (!url) throw new Error("Alchemy RPC URL missing. Set VITE_ALCHEMY_KEY or VITE_ALCHEMY_RPC_*.");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });

  const text = await res.text().catch(() => "");
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const hint = (json?.error?.message || json?.message || text || "").toString().slice(0, 180);
    throw new Error(`Alchemy HTTP ${res.status}${hint ? ": " + hint : ""}`);
  }

  if (json?.error) throw new Error(json.error?.message || "Alchemy error");
  return json?.result;
}

function hexToBigInt(hex) {
  try {
    return BigInt(hex || "0x0");
  } catch {
    return 0n;
  }
}

function formatNativeFromWei(weiBig, decimals = 18, maxFrac = 6) {
  // Convert BigInt wei to a decimal string without depending on big number libs.
  const base = 10n ** BigInt(decimals);
  const whole = weiBig / base;
  const frac = weiBig % base;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, maxFrac);
  return stripTrailingZeros(`${whole.toString()}.${fracStr}`);
}

// ------------------------
// utils
// ------------------------
function _cmpKey(symbols, tf) {
  const arr = Array.isArray(symbols) ? symbols : [];
  const keySyms = arr.map((s) => String(s || "").toUpperCase()).filter(Boolean).sort().join(",");
  return `${String(tf || "1Y")}:${keySyms}`;
}

function _cmpStoreRead() {
  try {
    const raw = localStorage.getItem(LS_COMPARE_STORE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _cmpStoreWrite(store) {
  try { localStorage.setItem(LS_COMPARE_STORE, JSON.stringify(store || {})); } catch {}
}

function _cmpGetCached(symbols, tf) {
  try {
    const store = _cmpStoreRead();
    const k = _cmpKey(symbols, tf);
    const entry = store?.[k];
    if (!entry || !entry.ts || !entry.data) return null;
    if (Date.now() - Number(entry.ts) > COMPARE_CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function _cmpPutCached(symbols, tf, data) {
  try {
    const k = _cmpKey(symbols, tf);
    const store = _cmpStoreRead();
    store[k] = { ts: Date.now(), data };

    // trim oldest
    const keys = Object.keys(store || {});
    if (keys.length > COMPARE_CACHE_MAX_ENTRIES) {
      keys.sort((a, b) => (Number(store[a]?.ts || 0) - Number(store[b]?.ts || 0)));
      const toDel = keys.slice(0, Math.max(0, keys.length - COMPARE_CACHE_MAX_ENTRIES));
      for (const dk of toDel) delete store[dk];
    }
    _cmpStoreWrite(store);
  } catch {}
}

// CoinGecko search cache (client-side) to keep search snappy even if backend/CG is slow
const LS_CG_SEARCH_CACHE = "na_cg_search_cache_v1";
const CG_SEARCH_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CG_SEARCH_MAX_ENTRIES = 40;

function _cgSearchRead() {
  try {
    const raw = localStorage.getItem(LS_CG_SEARCH_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function _cgSearchWrite(store) {
  try { localStorage.setItem(LS_CG_SEARCH_CACHE, JSON.stringify(store || {})); } catch {}
}

function _cgSearchGet(q) {
  try {
    const store = _cgSearchRead();
    const key = String(q || "").toLowerCase();
    const e = store?.[key];
    if (!e || !e.ts || !Array.isArray(e.data)) return null;
    if (Date.now() - Number(e.ts) > CG_SEARCH_TTL_MS) return null;
    return e.data;
  } catch {
    return null;
  }
}

function _cgSearchPut(q, data) {
  try {
    const key = String(q || "").toLowerCase();
    const store = _cgSearchRead();
    store[key] = { ts: Date.now(), data: Array.isArray(data) ? data : [] };

    // trim oldest entries
    const keys = Object.keys(store || {});
    if (keys.length > CG_SEARCH_MAX_ENTRIES) {
      keys.sort((a, b) => Number(store[a]?.ts || 0) - Number(store[b]?.ts || 0));
      for (const dk of keys.slice(0, keys.length - CG_SEARCH_MAX_ENTRIES)) delete store[dk];
    }
    _cgSearchWrite(store);
  } catch {}
}

const stripTrailingZeros = (s) => s.replace(/0+$/, "").replace(/\.$/, "");

const fmtUsd = (n) => {
  if (n == null || !Number.isFinite(n)) return "—";
  const abs = Math.abs(n);

  // Handle tiny numbers like 0.00000001
  if (abs > 0 && abs < 0.0001) return "$" + stripTrailingZeros(n.toFixed(10));
  if (abs < 0.01) return "$" + stripTrailingZeros(n.toFixed(6));
  if (abs < 1) return "$" + stripTrailingZeros(n.toFixed(4));

  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
};

const fmtCompactUsd = (n) => {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const v = Number(n);
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000_000) return `$${stripTrailingZeros((v / 1_000_000_000_000).toFixed(1))}T`;
  if (abs >= 1_000_000_000) return `$${stripTrailingZeros((v / 1_000_000_000).toFixed(1))}B`;
  if (abs >= 1_000_000) return `$${stripTrailingZeros((v / 1_000_000).toFixed(1))}M`;
  if (abs >= 1_000) return `$${stripTrailingZeros((v / 1_000).toFixed(1))}K`;
  return fmtUsd(v);
};

const fmtQty = (n, maxDp = 6) => {
  if (n == null || !Number.isFinite(n)) return "—";
  // show more decimals for tiny values
  const abs = Math.abs(n);
  const dp = abs > 0 && abs < 0.0001 ? 10 : (abs < 0.01 ? 8 : maxDp);
  return stripTrailingZeros(n.toFixed(dp));
};

// ------------------------
// CoinGecko price helpers (Wallet total value)
// ------------------------
const CG = {
  nativeIds: { ETH: "ethereum", POL: "polygon-ecosystem-token", BNB: "binancecoin" },
  platforms: { ETH: "ethereum", POL: "polygon-pos", BNB: "binance-smart-chain" },
};

// CoinGecko fetch helper (browser) with short-lived caching + gentle backoff.
// This prevents UI lag + 429 rate-limits during rapid refreshes.
const __cgCache = new Map(); // url -> {ts:number, data:any}
let __cgCooldownUntil = 0;

async function cgFetchJson(url, { ttlMs = 120_000 } = {}) {
  const now = Date.now();

  // cooldown after 429
  if (now < __cgCooldownUntil) {
    const hit = __cgCache.get(url);
    if (hit && now - hit.ts < ttlMs) return hit.data;
    throw new Error(`CoinGecko cooldown`);
  }

  // cache hit
  const hit = __cgCache.get(url);
  if (hit && now - hit.ts < ttlMs) return hit.data;

  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 429) {
    __cgCooldownUntil = now + 120_000; // 120s
    // return stale if present
    const stale = __cgCache.get(url);
    if (stale) return stale.data;
    throw new Error(`CoinGecko HTTP 429`);
  }

  if (!res.ok) {
    // return stale if present
    const stale = __cgCache.get(url);
    if (stale) return stale.data;
    throw new Error(`CoinGecko HTTP ${res.status}`);
  }

  const data = await res.json();
  __cgCache.set(url, { ts: now, data });
  return data;
}

async function fetchNativeUsdPrices(chains = []) {
  // IMPORTANT: Do NOT call CoinGecko directly from the browser (CORS + 429).
  // Use backend proxy: GET /api/coingecko/simple_price
  const ids = Array.from(new Set((chains || []).map((c) => CG.nativeIds[c]).filter(Boolean)));
  if (!ids.length) return {};
  const qs = new URLSearchParams({ ids: ids.join(","), vs_currencies: "usd" }).toString();
  const json = await api(`/api/coingecko/simple_price?${qs}`);
  const out = {};
  for (const c of chains || []) {
    const id = CG.nativeIds[c];
    const px = id ? Number(json?.[id]?.usd) : NaN;
    if (Number.isFinite(px)) out[c] = px;
  }
  return out;
}

async function fetchTokenUsdPrices(chainKey, addresses = []) {
  // IMPORTANT: Do NOT call CoinGecko directly from the browser (CORS + 429).
  // Use backend proxy: GET /api/coingecko/token_price/<platform>
  const platform = CG.platforms[chainKey];
  const addrs = Array.from(new Set((addresses || []).map((a) => String(a || "").toLowerCase()).filter(Boolean)));
  if (!platform || !addrs.length) return {};
  // CoinGecko allows many addresses; keep it safe-ish.
  const qs = new URLSearchParams({ contract_addresses: addrs.join(","), vs_currencies: "usd" }).toString();
  const json = await api(`/api/coingecko/token_price/${encodeURIComponent(platform)}?${qs}`);
  const out = {};
  for (const a of addrs) {
    const px = Number(json?.[a]?.usd);
    if (Number.isFinite(px)) out[a] = px;
  }
  return out;
}

const fmtPct = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const x = Number(n);
  const s = (x >= 0 ? "+" : "") + x.toFixed(2) + "%";
  return s;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveWalletAddress(walletLike = "") {
  try {
    const candidates = [
      walletLike?.address,
      walletLike?.wallet?.address,
      walletLike?.ethereum?.address,
      walletLike,
      localStorage.getItem("nexus_wallet"),
      localStorage.getItem("wallet"),
    ];
    for (const c of candidates) {
      const raw = String(c || "").trim();
      const m = raw.match(/0x[a-fA-F0-9]{40}/);
      if (m) return m[0].toLowerCase();
    }
  } catch {}
  return "";
}

function withWalletQuery(path, walletLike = "") {
  const wa = resolveWalletAddress(walletLike);
  if (!wa || !String(path || "").startsWith("/api/")) return path;
  const url = String(path || "");
  if (/[?&](wallet|wallet_address|addr|address)=/i.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`;
}

async function api(
  path,
  { method = "GET", token, body, signal, wallet } = {}
) {
  // Always send the wallet context (backend binds sessions to wallet).
  const wa = resolveWalletAddress(wallet);

  // Auth strategy:
  // - Prefer the user/session token (JWT / itsdangerous) when available.
  // - Fall back to the server API key (VITE_NEXUS_API_KEY) if present.
  // Backend accepts both forms as Bearer tokens.
  const candidates = [];
  const t = (token || "").trim();
  if (t) candidates.push(t);
  if (API_KEY) candidates.push(API_KEY);

  // Deduplicate while preserving order
  const seen = new Set();
  const bearers = candidates.filter((x) => {
    const k = String(x || "").trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const makeHeaders = (bearer) => {
    const headers = { Accept: "application/json" };

    // Only send Content-Type when we actually send a JSON body
    if (body != null && method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    if (bearer) headers["Authorization"] = `Bearer ${bearer}`;

    // Keep for backward compatibility / debugging (backend doesn't rely on it)
    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
      headers["x-api-key"] = API_KEY;
    }

    if (wa) {
      headers["X-Wallet-Address"] = wa;
      headers["x-wallet-address"] = wa;
    }

    return headers;
  };

  const doFetch = async (bearer) => {
    // Hard safety timeout so UI never gets stuck due to Render sleep/hanging connections.
    const ctrl = new AbortController();
    const timeoutMs =
      path?.includes("/api/access/redeem") ? 60000 :
      path?.includes("/api/grid/") ? 60000 :
      method === "GET" ? 15000 : 60000;

    const tm = setTimeout(() => {
      try {
        ctrl.abort();
      } catch {}
    }, timeoutMs);

    // Merge external signal with our timeout.
    const merged = new AbortController();
    const onAbort = () => {
      try {
        merged.abort();
      } catch {}
    };
    try {
      if (signal?.aborted) onAbort();
      if (signal) signal.addEventListener("abort", onAbort, { once: true });
      ctrl.signal.addEventListener("abort", onAbort, { once: true });
    } catch {}

    try {
      const requestPath = withWalletQuery(path, wa);
      return await fetch(`${API_BASE}${requestPath}`, {
        method,
        signal: merged.signal,
        headers: makeHeaders(bearer),
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
    } finally {
      clearTimeout(tm);
      try {
        if (signal) signal.removeEventListener("abort", onAbort);
      } catch {}
    }
  };

  // Try bearer candidates in order. This avoids the old behavior where we dropped Authorization
  // entirely on retry (which caused repeated 401s).
  let lastRes = null;
  let lastText = "";
  let lastData = null;

  const attempts = bearers.length ? bearers : [null];
  for (const b of attempts) {
    const res = await doFetch(b);
    lastRes = res;

    const txt = await res.text();
    lastText = txt;

    let data = null;
    try {
      data = txt ? JSON.parse(txt) : null;
    } catch {
      data = { raw: txt };
    }
    lastData = data;

    if (res.ok) return data;

    // If unauthorized and we have more candidates, try next.
    if (res.status === 401 || res.status === 403) {
      continue;
    }

    // For non-auth errors, break early.
    break;
  }

  const status = lastRes ? lastRes.status : 0;
  const data = lastData;
  const msg = (data && (data.error || data.message)) || `HTTP ${status}`;
  const err = new Error(msg);
  err.status = status;
  err.data = data ?? { raw: lastText };
  throw err;
}

// Search helper: backend endpoint name may differ across deployments.
// Search helper: backend endpoint name may differ across deployments.
// backend endpoint name may differ across deployments.
async function securityPrecheckForDeposit({ chainKey, tokenAddress = "", symbol = "", isNative = false, token }) {
  const body = {
    chain: String(chainKey || "").toUpperCase(),
    token_address: tokenAddress || "",
    address: tokenAddress || "",
    symbol: symbol || "",
    is_native: !!isNative,
  };
  const res = await api(`/api/security/token-check`, { method: "POST", body, token });
  return res || {};
}

async function apiSearchCoins(query, { signal } = {}) {
  const q = String(query || "").trim();
  if (!q) return [];
  const enc = encodeURIComponent(q);

  // IMPORTANT:
  // Our backend canonical search endpoints are:
  //   - /api/search (alias)
  //   - /api/coins/search (real implementation)
  // Try both first to avoid long waits on wrong endpoints.
  const candidates = [
    `/api/search?q=${enc}`,
    `/api/coins/search?q=${enc}`,
    `/api/coingecko/search?q=${enc}`,
    `/api/coingecko_search?q=${enc}`,
    `/search?q=${enc}`,
  ];

  let lastErr = null;
  for (const path of candidates) {
    try {
      return await api(path, { signal });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Search failed");
}

// ---- Payments (ERC20 transfer) helpers (no external deps) ----
function _hexPad64(hexNo0x) {
  const h = (hexNo0x || "").replace(/^0x/i, "").toLowerCase();
  return h.padStart(64, "0");
}
function _toHexAmount(amountUnits) {
  // amountUnits: BigInt
  let h = amountUnits.toString(16);
  if (h.length % 2) h = "0" + h;
  return "0x" + h;
}
function _erc20TransferData(to, amountUnits) {
  // transfer(address,uint256) selector
  const selector = "0xa9059cbb";
  const addr = (to || "").toLowerCase().replace(/^0x/, "");
  if (addr.length !== 40) throw new Error("Invalid recipient address");
  const amtHex = amountUnits.toString(16);
  return selector + _hexPad64(addr) + _hexPad64(amtHex);
}
async function _ensureBnb() {
  if (!window?.ethereum?.request) throw new Error("No injected wallet found (MetaMask).");
  const chainHex = await window.ethereum.request({ method: "eth_chainId" });
  if (String(chainHex).toLowerCase() === "0x38") return; // BNB Chain mainnet
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }],
    });
  } catch (e) {
    throw new Error("Please switch your wallet to BNB Chain (BNB).");
  }

async function _ensureChain(chainKey) {
  if (!window?.ethereum?.request) throw new Error("No injected wallet found (MetaMask).");
  const want = String(chainKey || "").toUpperCase();
  const map = { ETH: "0x1", BNB: "0x38", POL: "0x89" };
  const wantHex = map[want];
  if (!wantHex) throw new Error("Unsupported chain.");
  const chainHex = await window.ethereum.request({ method: "eth_chainId" });
  if (String(chainHex).toLowerCase() === String(wantHex).toLowerCase()) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: wantHex }],
    });
  } catch (e) {
    const name = want === "ETH" ? "Ethereum (ETH)" : want === "BNB" ? "BNB Chain (BNB)" : "Polygon (POL)";
    throw new Error(`Please switch your wallet to ${name}.`);
  }
}

}

function useInterval(fn, ms, enabled = true) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled || !ms) return;
    const id = setInterval(() => fnRef.current?.(), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
}

function useLocalStorageState(key, initialValue) {
  const [v, setV] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }, [key, v]);
  return [v, setV];
}

// ------------------------
// Info button + modal (opaque, bilingual content)
// ------------------------
function Help({ de, en }) {
  return (
    <div className="helpBlock">
      <div className="helpLangTitle">DE</div>
      <div className="helpText">{de}</div>
      <div className="helpLangTitle" style={{ marginTop: 10 }}>
        EN
      </div>
      <div className="helpText">{en}</div>
    </div>
  );
}


function RotationInfoTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      
                      <button
                        type="button"
                        className={`pill ${subToken === "USDC" ? "active" : ""}`}
                        style={{ color: "#fff", background: subToken === "USDC" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "none", cursor: "pointer" }}
                        onClick={() => setSubToken("USDC")}
                      >
                        USDC
                      </button>
                      <button
                        type="button"
                        className={`pill ${subToken === "USDT" ? "active" : ""}`}
                        style={{ color: "#fff", background: subToken === "USDT" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "none", cursor: "pointer" }}
                        onClick={() => setSubToken("USDT")}
                      >
                        USDT
                      </button>
                    </div><div className="hint" style={{ marginBottom: 8, opacity: 0.9 }}>
                      Selected: <b>Nexus Pro ${SUB_PRICE_USD}</b> · <b>{subToken}</b>
                    </div>

                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      <button className="btn" disabled={subBusy} onClick={subscribePay}>
                        {subBusy ? "..." : "Pay & Activate"}
                      </button>
                      <button
                        className="btnGhost"
                        type="button"
                        onClick={() => {
                          setSubMsg("");
                          refreshAccess();
                        }}
                      >
                        Refresh
                      </button>
                    </div>

                    {subMsg ? <div className="hint" style={{ marginTop: 8 }}>{subMsg}</div> : null}

                    <div className="hint" style={{ marginTop: 10, opacity: 0.8 }}>
                      Note: You must have enough funds for the plan amount plus <b>{subChain}</b> gas.
                    </div>
                  </div>
                )}

                <div className="hint" style={{ marginTop: 14 }}>
                  Status: {isPro ? "ACTIVE" : "OFF"}
                  {access?.source ? ` • via ${access.source}` : ""}
                </div>
              </div>
            </>
          )}
            </div>
          )}

{/* Wallet details panel (top-right dropdown) */}
          {walletModalOpen && (
            <>
            <div
              role="dialog"
              aria-label="Wallet details"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                position: "absolute",
                top: 52,
                right: 0,
                width: 340,
                background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                border: "none",
                borderRadius: 14,
                padding: 14,
                zIndex: 2000,
                boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="cardTitle" style={{ margin: 0 }}>Wallet details</div>
                <button
                  className="iconBtn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWalletModalOpen(false);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(202,138,4,0.45)",
                  background: "rgba(133,77,14,0.22)",
                  color: "#facc15",
                  fontSize: 12,
                  lineHeight: 1.45,
                  fontWeight: 700,
                }}
              >
                <div style={{ fontWeight: 900, marginBottom: 3 }}>Wrapped asset notice</div>
                <div>BTC is handled only via WBTC (ETH) / BTCB (BNB).</div>
                <div>SOL is handled only via WSOL.</div>
              </div>

              <div className="muted" style={{ marginTop: 10, wordBreak: "break-all" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div><b>Address</b></div>
                  <button
                    className="btn"
                    style={{ padding: "4px 10px", borderRadius: 10, fontSize: 12 }}
                    onClick={() => wallet && navigator.clipboard?.writeText(wallet)}
                    disabled={!wallet}
                    title={wallet ? "Copy address" : "Wallet not connected"}
                  >
                    Copy
                  </button>
                </div>
                <div style={{ userSelect: "text", fontFamily: "monospace" }}>{wallet || "Not connected"}</div>
              </div>

              <div className="hr" style={{ margin: "12px 0" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="cardTitle" style={{ margin: 0, fontSize: 14 }}>Balances</div>
                  {/* Active chain for wallet + grid */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      key="ALL"
                      type="button"
                      onClick={() => setShowAllWalletChains(true)}
                      title="Show balances for all chains"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: "pointer",
                        background: showAllWalletChains ? "rgba(34,197,94,0.9)" : "transparent",
                        color: showAllWalletChains ? "#0b1411" : "#e5e7eb",
                        border: showAllWalletChains ? "1px solid rgba(34,197,94,0.9)" : "1px solid rgba(229,231,235,0.25)",
                      }}
                    >
                      ALL
                    </button>

                    {walletChainKeys.map((c) => {
                      const active = !showAllWalletChains && (balActiveChain || DEFAULT_CHAIN) === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setShowAllWalletChains(false);
                            setBalActiveChain(c);
                            setWsChainKey(c);
                          }}
                          title={`Show balances on ${c}`}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontWeight: 800,
                            fontSize: 12,
                            cursor: "pointer",
                            background: active ? "rgba(34,197,94,0.9)" : "transparent",
                            color: active ? "#0b1411" : "#e5e7eb",
                            border: active ? "1px solid rgba(34,197,94,0.9)" : "1px solid rgba(229,231,235,0.25)",
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                <button
                  className="btnGhost"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    refreshBalances();
                  }}
                  disabled={balLoading || !wallet}
                >
                  {balLoading ? "Loading…" : "Refresh"}
                </button>
              </div>

              {/* Wallet total value (USD) */}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  Total value (USD)
                  {walletUsd?.unpriced ? (
                    <span className="muted" style={{ marginLeft: 8 }}>
                      · {walletUsd.unpriced} unpriced
                    </span>
                  ) : null}
                </div>
                <div className="mono" style={{ fontWeight: 900 }}>
                  {walletUsdLoading ? "Loading…" : fmtUsd(walletUsd?.total)}
                </div>
              </div>

              {balError && (
                <div style={{ marginTop: 8, color: "#ffb3b3", fontSize: 12 }}>{"Could not load balances."}</div>
              )}

              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {(showAllWalletChains ? walletChainKeys : [balActiveChain || DEFAULT_CHAIN]).map((c) => {
                  const row = balByChain?.[c] || {};
                  const nativeLabel = c; // ETH / POL / BNB

                  // Show FREE balance (total - reserved) directly in the chain header.
                  // Reserved is derived from per-chain locked USD budget, converted to native using USD price.
                  const nativeBalNum = Number(row?.native);
                  const nPxUsd = Number(walletPx?.native?.[c]);
                  const lockedUsd = Number(gridBudgets?.by_chain?.[c]?.locked_usd ?? 0);
                  const reservedNative = (Number.isFinite(nPxUsd) && nPxUsd > 0) ? (lockedUsd / nPxUsd) : 0;
                  const freeNativeNum = Number.isFinite(nativeBalNum) ? Math.max(0, nativeBalNum - reservedNative) : null;
                  const freeUsdVal = (Number.isFinite(freeNativeNum) && Number.isFinite(nPxUsd)) ? (freeNativeNum * nPxUsd) : null;

                  return (
                    <div
                      key={c}
                      style={{
                        border: "none",
                        padding: "10px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontWeight: 800 }}>{c}</div>
                        <div style={{ fontVariantNumeric: "tabular-nums" }}>
                          {nativeLabel}: {freeNativeNum == null ? (row.native ?? "—") : fmtQty(freeNativeNum)}{Number.isFinite(freeUsdVal) ? ` • ${fmtUsd(freeUsdVal)}` : ""}
                        </div>
                      </div>

                      
                      
                      {/* Grid budget info (per-chain, if available) */}
                      {gridBudgets?.by_chain && Object.keys(gridBudgets.by_chain).length ? (
                        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.82, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span>In bots: <b>{fmtUsd(Number(gridBudgets.by_chain?.[c]?.locked_usd || 0))}</b></span>
                          <span style={{ opacity: 0.6 }}>|</span>
                          <span>Free: <b>{fmtUsd(Number(gridBudgets.by_chain?.[c]?.available_usd || 0))}</b></span>
                        </div>
                      ) : null}

                      {/* Stablecoins (whitelist) */}
                      <div
                        style={{
                          marginTop: 8,
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 6,
                          fontSize: 13,
                        }}
                      >
                        {Object.keys(row.stables || { USDC: 0, USDT: 0 }).map((sym) => (
                          <React.Fragment key={sym}>
                            <div>
                              <div className="muted">{sym}</div>
                              <div style={{ fontSize: 12, opacity: 0.75 }}>{fmtUsd(1)}</div>
                            </div>
                            <div style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                              {(row.stables && row.stables[sym]) ?? "0"}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>

                      {/* User-added tokens (unlimited) */}
                      {(row.custom && row.custom.length > 0) && (
                        <div style={{ marginTop: 10 }}>
                          <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Added by you</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 6, fontSize: 13 }}>
                            {row.custom.map((t) => (
                              <React.Fragment key={t.address}>
                                <div title={t.address} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                  <div>{t.symbol}</div>
                                  <div style={{ fontSize: 12, opacity: 0.75 }}>
                                    {(() => {
                                      const addr = String(t?.address || "").toLowerCase();
                                      const px = walletPx?.tokenByChain?.[c]?.[addr];
                                      return Number.isFinite(px) ? fmtUsd(px) : "—";
                                    })()}
                                  </div>
                                </div>
                                <div style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                                  {t.balance || "0"}
                                </div>
                                <button
                                  type="button"
                                  className="iconBtn"
                                  style={{ width: 26, height: 26, lineHeight: "26px" }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeWalletToken(c, t.address);
                                    setTimeout(() => refreshBalances(), 0);
                                  }}
                                  aria-label="Remove token"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          className="btnGhost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openAddToken(c);
                          }}
                          disabled={!wallet}
                        >
                          + Add token
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
              <div className="hr" style={{ margin: "12px 0" }} />

              <div style={{
                  marginTop: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "none",
                  borderRadius: 14,
                  padding: 12
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div className="cardTitle" style={{ margin: 0, fontSize: 14 }}>Withdraw &amp; Send</div>
                    <div className="pill" style={{ fontSize: 12, padding: "4px 10px" }}>
                      {balActiveChain || DEFAULT_CHAIN}
                    </div>
                  </div>

                  <div className="muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.25 }}>
                    Open the transfer panel to withdraw from the Vault or send native coins to another wallet.
                  </div>

                  <button
                    type="button"
                    className="btnPill"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWithdrawSendOpen(true); }}
                    disabled={!wallet}
                    title={!wallet ? "Connect wallet first" : "Open Withdraw & Send"}
                    className="btn" style={{ height: 42, width: "100%", marginTop: 10, fontSize: 14 }}
                  >
                    Open Withdraw &amp; Send
                  </button>

                  {txMsg ? (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        padding: "8px 10px",
                        borderRadius: 12,
                        background: txMsg.toLowerCase().includes("fail")
                          ? "rgba(255,80,80,0.10)"
                          : "rgba(80,255,160,0.10)",
                        border: txMsg.toLowerCase().includes("fail")
                          ? "1px solid rgba(255,80,80,0.20)"
                          : "1px solid rgba(80,255,160,0.18)",
                        color: txMsg.toLowerCase().includes("fail") ? "#ffb3b3" : "#bfffd6",
                        lineHeight: 1.25
                      }}
                    >
                      {txMsg}
                    </div>
                  ) : null}
                </div>

            </div>

                    {/* Withdraw & Send modal */}
          {withdrawSendOpen && (
            <div
              role="dialog"
              aria-label="Withdraw & Send"
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 2400,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <div
                style={{
                  width: "min(520px, 92vw)",
                  background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                  border: "none",
                  borderRadius: 16,
                  padding: 14,
                  boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
                }}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div className="cardTitle" style={{ margin: 0 }}>Withdraw &amp; Send</div>
                  <button
                    className="iconBtn"
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWithdrawSendOpen(false); }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="muted" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.25 }}>
                  Chain:
                <select
                  value={wsChainKey}
                  onChange={(e) => setWsChainKey(e.target.value)}
                  style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 10 }}
                >
                  {walletChainOptions.map((c) => (
                    <option key={c.k} value={c.k}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span ref={wsInfoRef} style={{ position: "relative", display: "inline-block", marginLeft: 10 }}>
                  <span
                    className="infoDot"
                    role="button"
                    tabIndex={0}
                    aria-label="Withdraw & Send info"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWsInfoOpen((v) => !v); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setWsInfoOpen((v) => !v);
                      }
                    }}
                    title=""
                    style={{ cursor: "pointer" }}
                  >
                    i
                  </span>

                  {wsInfoOpen && (
                    <div
                      onClick={() => setWsInfoOpen(false)}
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        zIndex: 10000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 12,
                      }}
                    >
                      <div
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        style={{
                          width: "min(520px, 96vw)",
                          maxHeight: "80vh",
                          overflow: "hidden",
                          background: "rgba(6, 18, 14, 0.98)",
                          border: "1px solid rgba(40, 255, 160, 0.35)",
                          borderRadius: 14,
                          padding: 14,
                          boxShadow: "0 0 26px rgba(40, 255, 160, 0.18)",
                          position: "relative",
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Close"
                          onClick={() => setWsInfoOpen(false)}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 10,
                            background: "transparent",
                            border: "none",
                            color: "rgba(235, 255, 245, 0.95)",
                            fontSize: 18,
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>

                        <div style={{ overflowY: "auto", maxHeight: "calc(80vh - 28px)", paddingRight: 6 }}>
                          {/* ENGLISH */}
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>Withdraw &amp; Send – How it works</div>
                          <div style={{ marginBottom: 8 }}>
                            <b>1) Withdraw:</b> Funds are withdrawn from the Vault back to your connected Privy wallet first.
                            The Vault always pays the connected wallet (<code style={{ fontSize: 11 }}>msg.sender</code>).
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <b>2) Send:</b> After the withdrawal is completed, you can optionally send the funds from your wallet to any other address.
                          </div>
                          <div style={{ opacity: 0.95 }}>
                            <b>Important:</b><br />
                            • Make sure you are on the correct blockchain (BNB or POL)<br />
                            • Withdraw and Send are two separate steps<br />
                            • Gas fees are paid in the native coin (BNB / POL)
                          </div>

                          <hr style={{ margin: "12px 0", borderColor: "rgba(40, 255, 160, 0.35)" }} />

                          {/* DEUTSCH */}
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>Withdraw &amp; Send – So funktioniert es</div>
                          <div style={{ marginBottom: 8 }}>
                            <b>1) Withdraw:</b> Das Guthaben wird zuerst aus dem Vault zurück in dein verbundenes Privy-Wallet ausgezahlt.
                            Der Vault zahlt immer an das verbundene Wallet (<code style={{ fontSize: 11 }}>msg.sender</code>).
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <b>2) Send:</b> Nach dem Withdraw kannst du die Coins optional von deinem Wallet an eine beliebige Adresse weiterleiten.
                          </div>
                          <div style={{ opacity: 0.95 }}>
                            <b>Wichtig:</b><br />
                            • Du musst auf der richtigen Blockchain sein (BNB oder POL)<br />
                            • Withdraw und Send sind zwei getrennte Schritte<br />
                            • Gas-Gebühren werden in der Native Coin bezahlt (BNB / POL)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </span>
                  <div style={{ marginTop: 4 }}>
                    Withdraw returns funds to this Privy wallet first (vault pays msg.sender). Then you can send to any address.
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Deposit to Vault (native • security gate ready)</div>
                      <input
                        className="input"
                        value={depositAmt}
                        onChange={(e) => setDepositAmt(e.target.value)}
                        placeholder="0.25"
                        inputMode="decimal"
                        style={{ width: "100%", height: 44, fontSize: 14, background: "linear-gradient(180deg, rgba(0,255,166,0.18), rgba(0,210,140,0.12))", color: "#ffffff", caretColor: "#ffffff", border: "none", borderRadius: 10, padding: "0 12px" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); depositToVault(); }}
                      disabled={txBusy || !wallet}
                      className="btn" style={{ height: 44, paddingInline: 16, fontSize: 14, whiteSpace: "nowrap" }}
                    >
                      {txBusy ? "…" : "Deposit"}
                    </button>
                  </div>

                  {securityState && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "10px 12px",
                        borderRadius: 12,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        color: "#fff",
                        background:
                          securityState === "loading"
                            ? "rgba(181,159,0,0.22)"
                            : securityState === "ok"
                            ? "rgba(31,139,76,0.24)"
                            : securityState === "cancelled"
                            ? "rgba(181,159,0,0.22)"
                            : "rgba(168,50,50,0.24)",
                        border:
                          securityState === "loading"
                            ? "1px solid rgba(255,221,87,.45)"
                            : securityState === "ok"
                            ? "1px solid rgba(40,255,160,.38)"
                            : securityState === "cancelled"
                            ? "1px solid rgba(255,221,87,.45)"
                            : "1px solid rgba(255,88,88,.42)",
                        boxShadow: "0 10px 26px rgba(0,0,0,.16)",
                      }}
                    >
                      {securityMsg}
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          opacity: 0.9,
                          color: "rgba(232,242,240,.86)",
                        }}
                      >
                        🛡 powered by GoPlus
                      </div>
                    </div>
                  )}

                  {/* Vault status + Operator (one-time enable for autonomous grid) */}
                  <div className="muted tiny" style={{ marginTop: 6 }}>
                    <div>
                      {tB("Vault Balance", "Vault balance")}: <b>{vaultState?.polBalance != null ? String(vaultState.polBalance) : "—"}</b>{" "}
                      | {tB("Cycle", "Cycle")}: <b>{vaultState?.inCycle ? tB("LÄUFT", "RUNNING") : tB("STOP", "STOPPED")}</b>{" "}
                      | {tB("Operator", "Operator")}: <b>{vaultState?.operatorEnabled ? tB("AKTIV", "ENABLED") : tB("INAKTIV", "DISABLED")}</b>
                    </div>

                    {!vaultState?.operatorEnabled && (
                      <div style={{ marginTop: 4 }}>
                        ⚠️ {tB("Schritt 1: Operator aktivieren. Danach kann der Grid autonom handeln.", "Step 1: Enable operator. After that the grid can trade autonomously.")}
                      </div>
                    )}

                    {vaultState?.operatorEnabled && !(Number(vaultState?.polBalance || 0) > 0) && (
                      <div style={{ marginTop: 4 }}>
                        ⚠️ {tB("Schritt 2: Bitte zuerst in den Vault einzahlen (Deposit).", "Step 2: Please deposit funds into the Vault first.")}
                      </div>
                    )}

                    {vaultState?.operatorEnabled && (Number(vaultState?.polBalance || 0) > 0) && !vaultState?.inCycle && (
                      <div style={{ marginTop: 4 }}>
                      </div>
                    )}

                    {vaultState?.inCycle && (
                      <div style={{ marginTop: 4 }}>
                        ✅ {tB("Cycle läuft. Du kannst Orders stoppen/löschen. Für neue Parameter: Cycle beenden und neu starten.", "Cycle is running. You can stop/delete orders. For new parameters: end the cycle and start again.")}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVaultOperator(true); }}
                      disabled={txBusy || !wallet || vaultState?.operatorEnabled}
                      className="btn"
                      style={{ height: 40, paddingInline: 14, fontSize: 13 }}
                      title="Allow the backend Grid Bot to trade from your Vault balance without further signatures."
                    >
                      {vaultState?.operatorEnabled ? "Operator Enabled" : (txBusy ? "…" : "Enable Operator")}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVaultOperator(false); }}
                      disabled={txBusy || !wallet || !vaultState?.operatorEnabled}
                      className="btn secondary"
                      style={{ height: 40, paddingInline: 14, fontSize: 13 }}
                      title="Revoke operator permission (stops autonomous trading)."
                    >
                      {txBusy ? "…" : "Disable Operator"}
                    </button>

                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault(); e.stopPropagation();
                        try {
                          const bal = Number(vaultState?.polBalance || 0);
                          const op = !!vaultState?.operatorEnabled;
                          const inC = !!vaultState?.inCycle;

                          if (inC) {
                            const ok = window.confirm(tB(
                              "Cycle läuft bereits. Möchtest du den Cycle beenden?",
                              "Cycle is already running. Do you want to end the cycle?"
                            ));
                            if (!ok) return;
                            await endVaultCycle();
                            return;
                          }

                          if (!op) {
                            alert(tB(
                              "Operator ist nicht aktiviert. Bitte zuerst 'Enable Operator' klicken.",
                              "Operator is not enabled. Please click 'Enable Operator' first."
                            ));
                            return;
                          }

                          if (!(bal > 0)) {
                            alert(tB(
                              "Vault ist leer. Bitte zuerst einen Betrag in den Vault einzahlen (Deposit).",
                              "Vault is empty. Please deposit funds into the Vault first."
                            ));
                            return;
                          }

                          await startVaultCycle();
                        } catch (err) {
                          // errors are shown via txMsg; keep UI stable
                          console.warn(err);
                        }
                      }}
                      disabled={txBusy || !wallet || (!vaultState?.inCycle && (!vaultState?.operatorEnabled || !(Number(vaultState?.polBalance || 0) > 0)))}
                      className="btn"
                      style={{ height: 40, paddingInline: 14, fontSize: 13 }}
                      title={vaultState?.inCycle
                        ? tB("Beendet den laufenden Cycle (Stop).", "Ends the running cycle (stop).")
                        : tB("Startet einen Trading-Cycle im Vault (einmal pro Session).", "Starts a trading cycle in the Vault (once per session).")
                      }
                    >
                      {vaultState?.inCycle
                        ? tB("Cycle läuft", "Cycle running")
                        : (txBusy ? "…" : tB("Cycle starten", "Start cycle"))
                      }
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); refreshVaultState("", { force: true }); }}
                      disabled={txBusy || !wallet}
                      className="btn ghost"
                      style={{ height: 40, paddingInline: 14, fontSize: 13 }}
                      title="Refresh Vault state"
                    >
                      Refresh
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Withdraw amount</div>
                      <input
                        className="input"
                        value={withdrawAmt}
                        onChange={(e) => setWithdrawAmt(e.target.value)}
                        placeholder="0.25"
                        inputMode="decimal"
                        style={{ width: "100%", height: 44, fontSize: 14, background: "linear-gradient(180deg, rgba(0,255,166,0.18), rgba(0,210,140,0.12))", color: "#ffffff", caretColor: "#ffffff", border: "none", borderRadius: 10, padding: "0 12px" }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btnPill"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); withdrawFromVault(); }}
                      disabled={txBusy || !wallet}
                      className="btn" style={{ height: 44, paddingInline: 16, fontSize: 14, whiteSpace: "nowrap" }}
                    >
                      {txBusy ? "…" : "Withdraw"}
                    </button>
                  </div>

                  <div>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Send to address</div>
                    <input
                      className="input"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      placeholder="0x…"
                      style={{ width: "100%", height: 44, fontSize: 14, fontFamily: "monospace", background: "linear-gradient(180deg, rgba(0,255,166,0.18), rgba(0,210,140,0.12))", color: "#ffffff", caretColor: "#ffffff", border: "none", borderRadius: 10, padding: "0 12px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Amount</div>
                      <input
                        className="input"
                        value={sendAmt}
                        onChange={(e) => setSendAmt(e.target.value)}
                        placeholder="0.10"
                        inputMode="decimal"
                        style={{ width: "100%", height: 44, fontSize: 14, background: "linear-gradient(180deg, rgba(0,255,166,0.18), rgba(0,210,140,0.12))", color: "#ffffff", caretColor: "#ffffff", border: "none", borderRadius: 10, padding: "0 12px" }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btnPill"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); sendNative(); }}
                      disabled={txBusy || !wallet}
                      className="btn" style={{ height: 44, paddingInline: 18, fontSize: 14, whiteSpace: "nowrap" }}
                    >
                      {txBusy ? "…" : "Send"}
                    </button>
                  </div>

                  {txMsg ? (
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        padding: "8px 10px",
                        borderRadius: 12,
                        background: txMsg.toLowerCase().includes("fail")
                          ? "rgba(255,80,80,0.10)"
                          : "rgba(80,255,160,0.10)",
                        border: txMsg.toLowerCase().includes("fail")
                          ? "1px solid rgba(255,80,80,0.20)"
                          : "1px solid rgba(80,255,160,0.18)",
                        color: txMsg.toLowerCase().includes("fail") ? "#ffb3b3" : "#bfffd6",
                        lineHeight: 1.25
                      }}
                    >
                      {txMsg}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    className="btnPill"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWithdrawSendOpen(false); }}
                    className="btn" style={{ height: 42, flex: 1 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}{/* Add token modal (saved per wallet; unlimited). */}
          {addTokenOpen && (
            <div
              role="dialog"
              aria-label="Add token"
              onMouseDown={(e) => { e.stopPropagation(); }}
              onClick={(e) => { e.stopPropagation(); }}
              style={{
                position: "absolute",
                top: 52,
                right: 0,
                width: 340,
                background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                border: "none",
                borderRadius: 14,
                padding: 14,
                zIndex: 2100,
                boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="cardTitle" style={{ margin: 0 }}>Add token</div>
                <button
                  className="iconBtn"
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAddTokenOpen(false); }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Chain</div>
                  <div
                    className="input"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      opacity: 0.9,
                      cursor: "default",
                      userSelect: "none",
                    }}
                  >
                    <span>
                      "Polygon"
                    </span>
                    <span className="muted" style={{ fontSize: 12 }}>{addTokenChain}</span>
                  </div>
                </div>

                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Search (symbol/name)</div>
                  <input
                    className="input"
                    value={addTokenQuery}
                    onChange={(e) => setAddTokenQuery(e.target.value)}
                    placeholder="e.g. PEPE, CAKE, XRP"
                  />
                </div>

                <div className="muted" style={{ textAlign: "center", fontSize: 12 }}>or</div>

                <div>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Contract address</div>
                  <input
                    className="input"
                    value={addTokenContract}
                    onChange={(e) => setAddTokenContract(e.target.value)}
                    placeholder="0x…"
                  />
                </div>

                {addTokenErr && (
                  <div style={{ color: "#ffb3b3", fontSize: 12 }}>{addTokenErr}</div>
                )}

                <button
                  type="button"
                  className="btn"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addWalletToken(); }}
                  disabled={!wallet || addTokenBusy}
                >
                  {addTokenBusy ? "Adding…" : "Add"}
                </button>

                {/* Search results */}
                {String(addTokenQuery || "").trim() && (
                  <div style={{ marginTop: 6 }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Results (click to add)</div>
                    <div style={{ maxHeight: 220, overflow: "auto", border: "none", borderRadius: 12 }}>
                      {(() => {
                        const q = String(addTokenQuery || "").trim().toLowerCase();
                        const pool = tokenListCache?.[addTokenChain] || [];
                        const out = pool
                          .filter((t) => (t.symbol || "").toLowerCase().includes(q) || (t.name || "").toLowerCase().includes(q))
                          .slice(0, 80);
                        if (!out.length) return <div className="muted" style={{ padding: 10, fontSize: 12 }}>No matches. Paste contract address instead.</div>;
                        return out.map((t) => (
                          <button
                            key={t.address}
                            type="button"
                            className="rowBtn"
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 12px",
                              border: "none",
                              background: "transparent",
                              color: "rgba(255,255,255,0.92)",
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAddTokenContract(t.address);
                              setAddTokenQuery(t.symbol);
                              setAddTokenErr("");
                            }}
                            title={t.address}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                              <div style={{ fontWeight: 700 }}>{t.symbol}</div>
                              <div className="muted" style={{ fontSize: 12 }}>{t.address.slice(0, 6)}…{t.address.slice(-4)}</div>
                            </div>
                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{t.name}</div>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </>
          )}

        </div>
      

</header>

      <main className="main mobileStack">
        <div className={`dashboardGrid ${activePanel ? `hasFocus focus-${activePanel}` : ""}`}>
        {/* Compare */}
        <section className={`card section-compare dashboardPanel ${activePanel === "compare" ? "panelActive" : ""}`} onClick={handlePanelActivate("compare")}>
          <div className="cardHead">
            <div className="cardTitle">Compare (max 20)</div>
            <div className="cardActions">
              {TIMEFRAMES.map((tf) => {
                const k = String(tf.key || "").toUpperCase();
                const is2y = k === "2Y";
                const is1d = k === "1D";
                const loading2y = is2y && pendingTf === "2Y";
                const disabled = (compareSymbols.length === 0) || loading2y;
                const title =
                  compareSymbols.length === 0
                    ? "Select coins first (Watchlist → Compare)"
                    : is2y
                      ? (has2YData
                          ? "2Y (self collected)"
                          : "2Y will unlock after enough history is collected. Click to try loading.")
                      : (is1d ? "1D may load intraday data" : "");

                return (
                  <button
                    key={tf.key}
                    className={`chip ${timeframe === tf.key ? "active" : ""}`}
                    onClick={() => {
                      if (disabled) return;
                      if (is2y) {
                        if (has2YData) {
                          setTimeframe("2Y");
                        } else {
                          setErrorMsg("");
                          setPendingTf("2Y");
                          fetchCompare({ force: true, fetchRangeOverride: "2Y" });
                        }
                        return;
                      }
                      setTimeframe(tf.key);
                    }}
                    disabled={disabled}
                    title={title}
                  >
                    {loading2y ? "2Y…" : tf.label}
                  </button>
                );
              })}

              <button className={`chip ${viewMode === "overlay" ? "active" : ""}`} onClick={() => setViewMode("overlay")}>Overlay</button>
              <button className={`chip ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>Grid</button>

              <button className={`chip ${indexMode ? "active" : ""}`} onClick={() => setIndexMode((v) => !v)} title="Toggle Price / Index(100)">
                {indexMode ? "Index 100" : "Price"}
              </button>

              <InfoButton title="Compare">
                <Help showClose dismissable
                  de={
                    <>
                      <p><b>Was ist das?</b> Vergleich von bis zu 20 Coins aus der Watchlist-Compare-Auswahl.</p>
                      <p><b>Price</b> zeigt die echten Preiswerte. <b>Index 100</b> normalisiert alle Coins auf denselben Startwert 100 und ist besser, wenn viele Coins gleichzeitig verglichen werden.</p>
                      <p><b>Overlay</b> zeigt alle gewählten Coins in einem gemeinsamen Chart. <b>Grid</b> zeigt pro Coin eine kleine Kachel.</p>
                      <p><b>First 10 / Next 10 / All</b> steuert, ob du die ersten 10, die zweiten 10 oder alle Compare-Coins sehen willst.</p>
                      <p><b>Grid-Detail</b>: Klick auf eine Kachel öffnet den großen Chart. Dort kannst du direkt zwischen <b>Price</b> und <b>Index 100</b> umschalten.</p>
                      <p><b>Legende</b>: Farbe → Coin. Klick auf einen Eintrag hebt einen Coin hervor.</p>
                      <p><b>Custom Weighting</b>: Wenn OFF aktiv ist, nutzt Compare die System-Gewichtung. Wenn ON aktiv ist, kannst du die Score-Bestandteile mit Prozent-Reglern selbst verteilen. Die Summe kann nie über 100% gehen.</p>
                    </>
                  }
                  en={
  <>
    <p><b>Custom Weighting</b>: OFF uses system weights. ON shows percentage sliders so the user can manually decide how much each score component should count. The total can never exceed 100%.</p>
    <p><b>RSI (Relative Strength Index)</b> shows momentum, not actual buy volume.</p>
    <ul>
      <li><b>Overbought (Red)</b> → strong recent buying, may be overextended</li>
      <li><b>Neutral (Yellow)</b> → balanced market</li>
      <li><b>Oversold (Green)</b> → strong recent selling, possible rebound</li>
    </ul>
    <p className="muted tiny">
      RSI indicates extremes, not direct buy/sell signals.
    </p>
  </>
}
                />
              </InfoButton>
            </div>
          </div>

          <div
            className="panelScroll"
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0
            }}
          >
            <div
              style={{
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 16,
                padding: "8px 12px",
                marginBottom: 8,
                background: customCompareWeightsOn ? "rgba(57,217,138,.06)" : "rgba(255,255,255,.025)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="label">Compare Score Weighting</div>
                  <div className="muted tiny">
                    {customCompareWeightsOn
                      ? `Custom active · Total ${compareWeightsTotal}% · Remaining ${compareWeightsRemaining}%`
                      : "System weighting active"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {customCompareWeightsOn && (
                    <button className="ghostBtn tiny" onClick={resetCompareWeights} title="Reset to system default weights">
                      Reset
                    </button>
                  )}
                  {customCompareWeightsOn && (
                    <button
                      className="ghostBtn tiny"
                      onClick={() => setCompareWeightPanelOpen((v) => !v)}
                      title={compareWeightPanelOpen ? "Hide weighting settings" : "Open weighting settings"}
                    >
                      Settings {compareWeightPanelOpen ? "▲" : "▼"}
                    </button>
                  )}
                  <button
                    className={customCompareWeightsOn ? "btn tiny" : "ghostBtn tiny"}
                    onClick={() => setCustomCompareWeightsOn((v) => !v)}
                    title={customCompareWeightsOn ? "Disable custom weighting and use system values" : "Enable custom weighting sliders"}
                  >
                    Custom Weighting: {customCompareWeightsOn ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              {customCompareWeightsOn && compareWeightPanelOpen && (
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  {COMPARE_WEIGHT_KEYS.map((key) => {
                    const current = Number(safeCompareWeights[key] || 0);
                    const otherTotal = COMPARE_WEIGHT_KEYS.filter((k) => k !== key).reduce((sum, k) => sum + Number(safeCompareWeights[k] || 0), 0);
                    const maxAllowed = Math.max(0, 100 - otherTotal);
                    return (
                      <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }} title={COMPARE_WEIGHT_HELP[key]}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <span className="muted tiny">{COMPARE_WEIGHT_LABELS[key]}</span>
                          <b className="tiny">{current}%</b>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={maxAllowed}
                          step="1"
                          value={current}
                          onChange={(e) => updateCompareWeight(key, e.target.value)}
                        />
                        <div className="muted tiny">Max now: {maxAllowed}%</div>
                      </label>
                    );
                  })}
                  <div className="muted tiny" style={{ gridColumn: "1 / -1" }}>
                    The app does not auto-distribute the rest. You decide the full 100% manually. Scores use system values when Custom Weighting is OFF.
                  </div>
                </div>
              )}
            </div>

			<div className="compareGrid">
            {/* Chart */}

            <div className="compareChart">
              <div className="chartHeader">
                <div className="label">Diagramm (auto scale)</div>
                <div className="rowBtn">
                  <button className={`chip ${comparePage === "first10" ? "active" : ""}`} onClick={() => setComparePage("first10")} disabled={compareSymbols.length === 0}>First 10</button>
                  <button className={`chip ${comparePage === "next10" ? "active" : ""}`} onClick={() => setComparePage("next10")} disabled={compareSymbols.length <= 10}>Next 10</button>
                  <button className={`chip ${comparePage === "all" ? "active" : ""}`} onClick={() => setComparePage("all")} disabled={compareSymbols.length === 0}>All</button>
                </div>
                <div className="muted tiny">{compareLoading ? "Loading…" : `${visibleHighlightedSyms.length || visibleCompareSymbols.length}/${visibleCompareSymbols.length} active`}</div>
              </div>

              {viewMode === "overlay" ? (
              <>
                {visibleCompareSymbols.length === 0 ? (
                  <div className="chartEmpty" style={{ minHeight: 240 }}>
                    <div className="muted">No coins in this compare range.</div>
                  </div>
                ) : (
                  <>
                    <SvgChart chart={chartRaw} height={240} highlightedSyms={visibleHighlightedSyms} onHoverSym={() => {}} indexMode={indexMode} timeframe={timeframe} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
                    <div style={{ marginTop: 10 }}>
                      <Legend symbols={visibleCompareSymbols} highlightedSyms={visibleHighlightedSyms} setHighlightedSyms={setHighlightedSyms} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="sparkGridWrap">
                {visibleCompareSymbols.length === 0 ? (
                  <div className="chartEmpty" style={{ minHeight: 220 }}>
                    <div className="muted">No coins in this compare range.</div>
                  </div>
                ) : (
                <div className="sparkGrid">
                  {visibleCompareSymbols.map((sym, idx) => (
                    <SmallSpark
                      key={sym}
                      sym={sym}
                      idx={idx}
                      chart={chartRaw}
                      indexMode={indexMode}
                      timeframe={timeframe}
                      active={visibleHighlightedSyms.length === 0 || visibleHighlightedSyms.includes(sym)}
                      onClick={() => setGridModalSym(sym)}
                      colorForSym={colorForSym}
                      lineClassForSym={lineClassForSym}
                    />
                  ))}
                </div>
                )}
                <div className="muted tiny" style={{ marginTop: 8 }}>
                  Tip: Use <b>Overlay</b> for correlation. Use <b>Grid</b> for 10 coins (clear view).
                </div>
              </div>
            )}

                            <div
                              className="pairsBox"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0
                              }}
                            >
                <div className="pairsHead">
                  <div className="label">Best pairs (data fit)</div>
                <div className="rsiLegend">
                  <span className="pill rsiOverbought" title="RSI above 70: strong recent buying momentum, may be overextended.">Overbought</span>
                  <span className="pill rsiNeutral" title="RSI between 30 and 70: balanced momentum, no extreme zone.">Neutral</span>
                  <span className="pill rsiOversold" title="RSI below 30: strong recent selling momentum, possible rebound zone.">Oversold</span>
                </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="muted tiny">Based on correlation (index)</div>
                    <InfoButton title="Best pairs">
                      <Help showClose dismissable
                        de={
                            <>
                              <p>Diese Liste zeigt Coin-Paare mit ähnlichem oder unterschiedlichem Verlauf auf Basis der aktuell berechneten Pair-Daten.</p>
                              <ul>
                                <li><b>Hoher Score</b> → sehr ähnliche Bewegung</li>
                                <li><b>Niedriger Score</b> → eher unabhängige Bewegung</li>
                              </ul>
                              <p><b>Klick auf ein Pair</b>, um Details wie Performance, tägliche Moves, Spread und Erklärung zu öffnen.</p>
                              <p>Das hilft dir, starke vs. schwache Kombinationen für Hedge-, Rebalance- oder Diversifikations-Ideen schneller zu erkennen.</p>
							  <p><b>RSI (Relative Strength Index)</b> zeigt Momentum, nicht das tatsächliche Kaufvolumen.</p>
                              <ul>
                                <li><b>Überkauft (Rot)</b> → starker Kaufdruck, evtl. überdehnt</li>
                                <li><b>Neutral (Gelb)</b> → ausgeglichener Markt</li>
                                <li><b>Überverkauft (Grün)</b> → starker Verkaufsdruck, möglicher Rebound</li>
                              </ul>
                              <p className="muted tiny">
                                RSI zeigt Extremzonen, keine direkten Kauf-/Verkaufssignale.
                             </p>
                            </>
                        }

                        en={
                            <>
                              <p>This list shows coin pairs with similar or different behavior based on the currently calculated pair data.</p>
                              <ul>
                                <li><b>High score</b> → very similar movement</li>
                                <li><b>Low score</b> → more independent movement</li>
                              </ul>
                                 <p><b>Click a pair</b> to open details such as performance, daily moves, spread, and explanation.</p>
                                 <p>This helps you spot stronger vs. weaker combinations faster for hedge, rebalance, or diversification ideas.</p>
							     <p><b>RSI (Relative Strength Index)</b> shows momentum, not actual buy volume.</p>
                              <ul>
                                 <li><b>Overbought (Red)</b> → strong recent buying, may be overextended</li>
                                 <li><b>Neutral (Yellow)</b> → balanced market</li>
                                 <li><b>Oversold (Green)</b> → strong recent selling, possible rebound</li>
                             </ul>
                             <p className="muted tiny">
                               RSI indicates extremes, not direct buy/sell signals.
                             </p>
                            </>
                        }

                      />
                    </InfoButton>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div className="muted tiny">Showing {bestPairsToShow.length} / {bestPairsAll.length} pairs</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className={String(bestPairsSortMode || "score") === "spread" ? "btn tiny" : "ghostBtn tiny"}
                      title="Sort by largest 30D spread first. Click again to return to score ranking."
                      onClick={() => toggleBestPairsSort("spread")}
                    >
                      Spread
                    </button>
                    <button className="ghostBtn tiny" onClick={() => setShowTop10Pairs(v => !v)}>
                      {showTop10Pairs ? "Show all pairs" : "Show top 10"}
                    </button>
                  </div>
                </div>

                <div
                  className="pairsScroll"
                  style={{
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.02)",
                    padding: "8px",
                    boxSizing: "border-box",
                    marginTop: 6,

                    minHeight: 0,
                    maxHeight: "clamp(280px, 36vh, 460px)",
                    overflowY: "auto",
                    paddingBottom: 10,
                  }}
                >
                  {bestPairsToShow.length ? (
                    bestPairsToShow.map((p, i) => {
                      const rsiAState = _rsiBadgeState(p.rsiA);
                      const rsiBState = _rsiBadgeState(p.rsiB);
                      const rsiGapTone = Number.isFinite(p.rsiGap)
                        ? p.rsiGap >= 15
                          ? "rgba(57,217,138,0.14)"
                          : p.rsiGap >= 8
                            ? "rgba(255,184,0,0.14)"
                            : "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.06)";
                      const quality = _pairQualityMeta(p.score);

                      return (
                        <div
                          key={p.pair}
                          className="pairRow"
                          style={{
                            gap: 10,
                            cursor: "pointer",
                            marginBottom: i === bestPairsToShow.length - 1 ? 4 : 0,
                            alignItems: "center",
                          }}
                          onClick={(e) => { e.stopPropagation(); openPairExplain(p); }}
                        >
                          <span className="muted" style={{ width: 34, textAlign: "right", flex: "0 0 34px" }}>#{i + 1}</span>

                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "grid",
                              gridTemplateColumns: "minmax(88px, 1.2fr) 120px 120px 56px 72px auto auto",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span className="pairName" style={{ minWidth: 0, whiteSpace: "nowrap" }}>{p.pair}</span>

                            <span
                              className="pill"
                              title={`${p.a || p.pair.split("/")[0]} RSI: ${Number.isFinite(p.rsiA) ? p.rsiA.toFixed(0) : "—"} · ${Number.isFinite(p.rsiA) ? (p.rsiA >= 70 ? "Overbought: strong recent buying momentum, may be overextended." : p.rsiA <= 30 ? "Oversold: strong recent selling momentum, possible rebound zone." : "Neutral: balanced momentum.") : "No RSI data available."}`}
                              style={{
                                width: 120,
                                justifyContent: "center",
                                padding: "4px 8px",
                                fontSize: 12,
                                lineHeight: 1,
                                background: rsiAState.tone,
                                borderColor: rsiAState.border,
                                color: rsiAState.color,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.a || p.pair.split("/")[0]} {Number.isFinite(p.rsiA) ? p.rsiA.toFixed(0) : "—"} RSI
                            </span>

                            <span
                              className="pill"
                              title={`${p.b || p.pair.split("/")[1]} RSI: ${Number.isFinite(p.rsiB) ? p.rsiB.toFixed(0) : "—"} · ${Number.isFinite(p.rsiB) ? (p.rsiB >= 70 ? "Overbought: strong recent buying momentum, may be overextended." : p.rsiB <= 30 ? "Oversold: strong recent selling momentum, possible rebound zone." : "Neutral: balanced momentum.") : "No RSI data available."}`}
                              style={{
                                width: 120,
                                justifyContent: "center",
                                padding: "4px 8px",
                                fontSize: 12,
                                lineHeight: 1,
                                background: rsiBState.tone,
                                borderColor: rsiBState.border,
                                color: rsiBState.color,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.b || p.pair.split("/")[1]} {Number.isFinite(p.rsiB) ? p.rsiB.toFixed(0) : "—"} RSI
                            </span>

                            <span
                              className="pill"
                              title={`RSI gap: ${Number.isFinite(p.rsiGap) ? p.rsiGap.toFixed(0) : "—"} · Difference between both pair RSI values.`}
                              style={{
                                width: 56,
                                justifyContent: "center",
                                padding: "4px 8px",
                                fontSize: 12,
                                lineHeight: 1,
                                background: rsiGapTone,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Δ {Number.isFinite(p.rsiGap) ? p.rsiGap.toFixed(0) : "—"}
                            </span>

                            <span
                              className="pill"
                              title={`30D spread: ${Number.isFinite(p.spreadPct) ? p.spreadPct.toFixed(2) + "%" : "—"} · Larger values rank higher when Spread sorting is active.`}
                              style={{
                                width: 72,
                                justifyContent: "center",
                                padding: "4px 8px",
                                fontSize: 12,
                                lineHeight: 1,
                                background: String(bestPairsSortMode || "score") === "spread" ? "rgba(57,217,138,0.14)" : "rgba(255,255,255,0.06)",
                                borderColor: String(bestPairsSortMode || "score") === "spread" ? "rgba(57,217,138,0.28)" : "rgba(255,255,255,0.10)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              S {Number.isFinite(p.spreadPct) ? p.spreadPct.toFixed(1) + "%" : "—"}
                            </span>

                            <span
                              className="pill"
                              title={`Composite score: ${p.score} · Corr ${p.corrScore ?? "—"} · Momentum ${p.momentumScore ?? "—"} · Spread ${p.opportunityScore ?? "—"} · Stability ${p.stabilityScore ?? "—"}`}
                              style={{
                                justifySelf: "end",
                                whiteSpace: "nowrap",
                                fontSize: 12,
                                padding: "4px 8px",
                                lineHeight: 1,
                                background: quality.bg,
                                borderColor: quality.border,
                                color: quality.color
                              }}
                            >
                              {quality.label} {p.score}
                            </span>
                            <span className="pill" title="Correlation of indexed price lines" style={{ justifySelf: "end", whiteSpace: "nowrap" }}>{(p.corr >= 0 ? "+" : "") + p.corr.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="muted">Not enough chart data yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div></div>
        </section>

        {/* Grid chart modal */}
        {gridModalSym && (
          <div
            className="modalBackdrop"
            onClick={() => setGridModalSym(null)}
            style={{ zIndex: 10010, padding: 16 }}
          >
            <div
              className="card"
              style={{
                width: "min(1100px, 96vw)",
                maxHeight: "88vh",
                overflow: "auto",
                cursor: "default",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cardHead" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div className="cardTitle">{gridModalSym} chart</div>
                  <div className="muted tiny" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                    <span>{timeframe}</span>
                    <span>{indexMode ? "Index 100" : "Price (USD)"}</span>
                    {gridModalRow ? <span>{fmtUsd(Number(gridModalRow?.price))}</span> : null}
                    {gridModalRow?.change24h != null ? (
                      <span style={{ color: Number(gridModalRow?.change24h) >= 0 ? "var(--green)" : "var(--red)" }}>
                        {fmtPct(Number(gridModalRow?.change24h))}
                      </span>
                    ) : null}
                    <span>Hover for date + value</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button
                    className={`chip ${!indexMode ? "active" : ""}`}
                    onClick={() => setIndexMode(false)}
                    type="button"
                    title="Show real price chart"
                  >
                    Price
                  </button>
                  <button
                    className={`chip ${indexMode ? "active" : ""}`}
                    onClick={() => setIndexMode(true)}
                    type="button"
                    title="Show Index 100 chart"
                  >
                    Index 100
                  </button>
                  <button className="btnGhost" onClick={() => setGridModalSym(null)} type="button">
                    Close
                  </button>
                </div>
              </div>

              <div className="cardBody" style={{ display: "grid", gap: 12 }}>
                <SvgChart
                  chart={gridModalChart}
                  height={440}
                  highlightedSyms={[]}
                  onHoverSym={() => {}}
                  indexMode={indexMode}
                  timeframe={timeframe}
                  colorForSym={colorForSym}
                  lineClassForSym={lineClassForSym}
                />
                <div className="muted tiny">
                  Tip: Move the mouse over the chart to see the exact date and value.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pair explain modal */}
        {selectedPair && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
            onClick={() => setSelectedPair(null)}
          >
            <div
              className="card"
              style={{
                maxWidth: 760,
                width: "100%",
                maxHeight: "80vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cardHead" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div className="cardTitle">Why this score?</div>
                  <div className="muted tiny">
                    {selectedPair.pair} · 30D · Score {selectedPair.score} · Corr{" "}
                    {(selectedPair.corr >= 0 ? "+" : "") + selectedPair.corr.toFixed(2)}
                  </div>
                </div>
                <button className="btnGhost" onClick={() => setSelectedPair(null)}>
                  Close
                </button>
              </div>

              <div className="cardBody" style={{ display: "grid", gap: 14 }}>{(() => {
                  const [a, b] = _pairSyms(selectedPair.pair);
                  const ra = _retPctForExplain(a);
                  const rb = _retPctForExplain(b);
                  const spread = Number.isFinite(ra) && Number.isFinite(rb) ? ra - rb : null;
                  const winner = Number.isFinite(spread) ? (spread >= 0 ? a : b) : null;
                  const loser = Number.isFinite(spread) ? (spread >= 0 ? b : a) : null;

                  return (
                    <>
                      <div style={{ display: "grid", gap: 10 }}>
                        <div className="label">Performance (same period)</div>
                        {pairExplainLoading && <div className="muted tiny">Loading pair data…</div>}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <span className="pill silver">{a}: <span style={_pctColorStyle(ra)}>{_fmtPctLocal(ra)}</span></span>
                          <span className="pill silver">{b}: <span style={_pctColorStyle(rb)}>{_fmtPctLocal(rb)}</span></span>
                          <span className="pill">
                            Spread: {_fmtPctLocal(spread)} {winner ? `( ${winner} vs ${loser} )` : ""}
                          </span>
                        </div>


                        {/* Trader quick spread view */}
                        {(() => {
                          const rows = _buildDailyRows(pairExplainSeries, a, b, 30);
                          if (!rows.length) return null;

                          const spreads = rows
                            .map((r) => Number(r?.d))
                            .filter((v) => Number.isFinite(v));
                          if (!spreads.length) return null;

                          const latestSpreadQuick = spreads[spreads.length - 1];
                          const svgWq = 520;
                          const svgHq = 120;
                          const padLq = 38;
                          const padRq = 18;
                          const padTq = 10;
                          const padBq = 22;
                          const innerWq = Math.max(1, svgWq - padLq - padRq);
                          const innerHq = Math.max(1, svgHq - padTq - padBq);
                          const maxAbsQ = Math.max(1, ...spreads.map((v) => Math.abs(v)));
                          const yMinQ = -maxAbsQ;
                          const yMaxQ = maxAbsQ;
                          const sxQ = (i) => padLq + (rows.length <= 1 ? 0 : (i / (rows.length - 1)) * innerWq);
                          const syQ = (v) => padTq + ((yMaxQ - v) / Math.max(0.000001, yMaxQ - yMinQ)) * innerHq;
                          const pathDQ = spreads.map((v, i) => `${i === 0 ? "M" : "L"} ${sxQ(i)} ${syQ(v)}`).join(" ");
                          const latestXQ = sxQ(spreads.length - 1);
                          const latestYQ = syQ(latestSpreadQuick);
                          const zeroYQ = syQ(0);

                          return (
                            <div style={{ display: "grid", gap: 6, marginTop: 10, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px", background: "rgba(255,255,255,0.02)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <div>
                                  <div className="label" style={{ marginBottom: 0 }}>Spread Analysis</div>
                                  <div className="muted tiny" style={{ marginTop: 2 }}>30D Relative Spread ({a} vs {b}) · Positive = {a} stronger · Negative = {b} stronger</div>
                                </div>
                                <span className="pill silver">Latest: {_fmtPctLocal(latestSpreadQuick)}</span>
                              </div>

                              <svg viewBox={`0 0 ${svgWq} ${svgHq}`} preserveAspectRatio="none" style={{ width: "100%", height: 125, display: "block" }}>
                                {[yMinQ, 0, yMaxQ].map((tick, idx) => (
                                  <g key={idx}>
                                    <line x1={padLq} x2={svgWq - padRq} y1={syQ(tick)} y2={syQ(tick)} stroke={tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"} strokeDasharray={tick === 0 ? "4 4" : "3 5"} />
                                    <text x={6} y={syQ(tick) + 4} fill="rgba(232,242,240,0.72)" fontSize="10">{_fmtPctLocal(tick)}</text>
                                  </g>
                                ))}
                                <path d={pathDQ} fill="none" stroke="#35e0a1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                                {Number.isFinite(latestSpreadQuick) ? (
                                  <>
                                    <circle cx={latestXQ} cy={latestYQ} r="4" fill="#35e0a1" />
                                    <text x={Math.max(padLq + 8, latestXQ - 62)} y={Math.max(16, latestYQ - 9)} fill="#35e0a1" fontSize="11" fontWeight="700">{_fmtPctLocal(latestSpreadQuick)}</text>
                                  </>
                                ) : null}
                                <text x={padLq} y={svgHq - 6} fill="rgba(232,242,240,0.72)" fontSize="10">Start</text>
                                <text x={padLq + (innerWq / 2)} y={svgHq - 6} textAnchor="middle" fill="rgba(232,242,240,0.72)" fontSize="10">Mid</text>
                                <text x={svgWq - padRq} y={svgHq - 6} textAnchor="end" fill="rgba(232,242,240,0.72)" fontSize="10">Now</text>
                                <text x={svgWq - padRq} y={Math.max(13, zeroYQ - 5)} textAnchor="end" fill="rgba(232,242,240,0.58)" fontSize="9">Mean reversion line</text>
                              </svg>
                            </div>
                          );
                        })()}

                        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                          <div className="label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Daily moves (last {30} days)</span>
                            <span className="muted tiny">{selectedPair.pair}</span>
                          </div>

                          {(() => {
                            const [a, b] = _pairSyms(selectedPair.pair);
                            const maxDays = 30;
                            const rows = _buildDailyRows(pairExplainSeries, a, b, maxDays);
                            if (!rows.length) return <div className="muted tiny">No daily series yet.</div>;

                            return (
                              <div style={{ border: "none", borderRadius: 12, overflow: "hidden" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.04)" }} className="muted tiny">
                                  <div>Date</div>
                                  <div>{a}</div>
                                  <div>{b}</div>
                                  <div>Diff</div>
                                </div>
                                <div style={{ maxHeight: 180, overflow: "auto" }}>
                                  {rows.slice().reverse().map((r, i) => (
                                    <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 1fr", gap: 8, padding: "7px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }} className="tiny">
                                      <div className="muted">{_fmtDay(r.t)}</div>
                                      <div style={_pctColorStyle(r.a)}>{_fmtPctLocal(r.a)}</div>
                                      <div style={_pctColorStyle(r.b)}>{_fmtPctLocal(r.b)}</div>
                                      <div>{_fmtPctLocal(r.d)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="muted tiny">
                          Score now combines correlation, RSI gap, 30D spread and volatility balance. A higher score means the pair is more useful for grid/rebalance ideas, not just more correlated.
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        <div className="label">Short-Term Momentum</div>
                        {winner ? (() => {
                          const quality = _pairQualityMeta(selectedPair?.score);

                          return (
                            <div style={{
                              display: "grid",
                              gap: 8,
                              padding: "12px",
                              borderRadius: "12px",
                              background: quality.bg,
                              border: `1px solid ${quality.border}`
                            }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                <span style={{ color: quality.color, fontWeight: 900 }}>{quality.label}</span>
                                <span className="pill silver">Score {selectedPair.score}</span>
                              </div>
                              <div className="muted">
                                <b>Now:</b> <b>{winner}</b> &gt; <b>{loser}</b> (short-term momentum / 30D view).
                              </div>
                              <div className="tiny" style={{ display: "flex", flexWrap: "wrap", gap: 10, color: quality.color }}>
                                <span>Corr {(selectedPair.corr >= 0 ? "+" : "") + selectedPair.corr.toFixed(2)}</span>
                                <span>Spread {_fmtPctLocal(spread)}</span>
                                {Number.isFinite(selectedPair?.momentumScore) && <span>Momentum {selectedPair.momentumScore}</span>}
                                {Number.isFinite(selectedPair?.stabilityScore) && <span>Stability {selectedPair.stabilityScore}</span>}
                              </div>
                            </div>
                          );
                        })() : (
                          <div className="muted">Not enough data for a reliable pair summary yet.</div>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div className="label">AI commentary (optional)</div>
                    <button
                      className="btnGhost"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        runAiExplain();
                      }}
                      disabled={aiExplainLoading}
                      title={!isPro ? "Redeem or active access required to use AI" : "Run AI Insight"}
                    >
                      {aiExplainLoading ? "Thinking…" : (isPro ? "AI Insight" : "Access required")}
                    </button>
                  </div>
                  {aiExplainData ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">AI Verdict</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.setup}</div>
                        </div>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">Confidence</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.confidenceLabel} ({aiExplainData.confidence}/10)</div>
                        </div>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">Risk</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.risk}</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>AI Conclusion</div>
                        <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>
                          {aiExplainData.verdictText || "No clear AI conclusion available yet."}
                        </div>
                        <div className="muted tiny" style={{ lineHeight: 1.5 }}>
                          {aiExplainData.winner && aiExplainData.loser
                            ? `Observed relative bias: ${aiExplainData.winner} is currently stronger than ${aiExplainData.loser} in this read.`
                            : "This conclusion is descriptive only and should not be read as an automatic trade command."}
                        </div>
                      </div>

                      {aiExplainData.engineV2 ? (() => {
                        const riskTone = aiRiskTone(aiExplainData.engineV2.exit_risk || aiExplainData.risk);
                        const confTone = aiConfidenceTone(aiExplainData.engineV2.confidence || aiExplainData.confidence);
                        const confValue = Math.max(0, Math.min(10, Number(aiExplainData.engineV2.confidence || aiExplainData.confidence || 0)));
                        const tags = Array.isArray(aiExplainData.engineV2.tags) ? aiExplainData.engineV2.tags.slice(0, 6) : [];
                        return (
                          <div style={{ display: "grid", gap: 10, border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, padding: "12px", background: "rgba(255,255,255,0.025)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                              <div className="label" style={{ marginBottom: 0 }}>AI Engine Level 2{/* UI_UPGRADE_V1_DEPLOY_MARKER */}
                              <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 6,
                                marginBottom: 6
                              }}>
                                <div style={{
                                  fontWeight: 900,
                                  fontSize: 14,
                                  color: riskTone.color
                                }}>
                                  {riskTone.label}
                                </div>
                                <div style={{
                                  fontWeight: 800,
                                  fontSize: 12,
                                  opacity: 0.8
                                }}>
                                  {aiExplainData.engineV2?.setup_bias}
                                </div>
                              </div>
</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                <span style={{ border: `1px solid ${riskTone.border}`, background: riskTone.bg, color: riskTone.color, borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 900 }}>
                                  {riskTone.label}
                                </span>
                                {aiExplainData.engineV2.pre_exit_warning ? (
                                  <span style={{ border: "1px solid rgba(255,152,0,0.45)", background: "rgba(255,152,0,0.10)", color: "#ffb74d", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 900 }}>
                                    PRE-EXIT
                                  </span>
                                ) : null}
                                {Array.isArray(aiExplainData.engineV2.contradictions) && aiExplainData.engineV2.contradictions.length ? (
                                  <span style={{ border: "1px solid rgba(255,82,82,0.45)", background: "rgba(255,82,82,0.10)", color: "#ff6b6b", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 900 }}>
                                    CONTRADICTION
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                              <div style={{ border: "1px solid rgba(0,255,136,0.18)", borderRadius: 12, padding: "10px 12px", background: "rgba(0,255,136,0.045)" }}>
                                <div className="muted tiny">Edge</div>
                                <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.engineV2.edge || "No clean edge yet"}</div>
                              </div>
                              <div style={{ border: `1px solid ${riskTone.border}`, borderRadius: 12, padding: "10px 12px", background: riskTone.bg }}>
                                <div className="muted tiny">Exit Risk</div>
                                <div style={{ fontWeight: 900, marginTop: 4, color: riskTone.color, fontSize: 16 }}>{aiExplainData.engineV2.exit_risk || aiExplainData.risk || "Medium"}</div>
                                {aiExplainData.engineV2.pre_exit_warning ? (
                                  <div className="muted tiny" style={{ marginTop: 4, color: "#ffb74d", fontWeight: 800 }}>⚠ Pre-exit warning active</div>
                                ) : null}
                              </div>
                              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                                <div className="muted tiny">Setup Bias</div>
                                <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.engineV2.setup_bias || "No clean setup"}</div>
                              </div>
                            </div>

                            <div style={{ display: "grid", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <div className="muted tiny">Confidence</div>
                                <div style={{ color: confTone.color, fontWeight: 900, fontSize: 12 }}>{confTone.label} {confValue ? `(${confValue}/10)` : ""}</div>
                              </div>
                              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${Math.round(confValue * 10)}%`, background: confTone.color, borderRadius: 999, transition: "width 0.6s ease" }} />
                              </div>
                            </div>

                            {tags.length ? (
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {tags.map((tag) => (
                                  <span key={tag} style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 800 }}>
                                    {aiTagLabel(tag)}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {Array.isArray(aiExplainData.engineV2.contradictions) && aiExplainData.engineV2.contradictions.length ? (
                              <div className="muted tiny" style={{ lineHeight: 1.5, color: "#ff6b6b", border: "1px solid rgba(255,82,82,0.30)", borderRadius: 10, padding: "8px 10px", background: "rgba(255,82,82,0.07)", fontWeight: 800 }}>
                                ⚠ Contradiction: {aiExplainData.engineV2.contradictions[0]}
                              </div>
                            ) : null}

                            {Array.isArray(aiExplainData.engineV2.drivers) && aiExplainData.engineV2.drivers.length ? (
                              <div className="muted tiny" style={{ lineHeight: 1.5 }}>
                                Drivers: {aiExplainData.engineV2.drivers.join(" · ")}
                              </div>
                            ) : null}
                          </div>
                        );
                      })() : null}

                      {(aiExplainData.trendStructure || aiExplainData.momentumShift || aiExplainData.insightSummary) ? (
                        <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                          <div className="label" style={{ marginBottom: 0 }}>Multi-timeframe AI Insight</div>
                          {aiExplainData.trendStructure ? (
                            <div><span className="muted tiny">Trend Structure</span><div style={{ fontWeight: 800, marginTop: 4 }}>{aiExplainData.trendStructure}</div></div>
                          ) : null}
                          {aiExplainData.momentumShift ? (
                            <div><span className="muted tiny">Momentum Shift</span><div style={{ marginTop: 4 }}>{aiExplainData.momentumShift}</div></div>
                          ) : null}
                          {aiExplainData.insightSummary ? (
                            <div><span className="muted tiny">Insight Summary</span><div style={{ marginTop: 4 }}>{aiExplainData.insightSummary}</div></div>
                          ) : null}
                        </div>
                      ) : null}

                      {(() => {
                        const pairLabel = String(selectedPair?.pair || "");
                        const [a, b] = _pairSyms(pairLabel);
                        const rows = _buildDailyRows(pairExplainSeries || {}, a, b, 30);
                        const latestSpread = rows.length ? Number(rows[rows.length - 1]?.d) : null;
                        const prevSpread = rows.length > 1 ? Number(rows[rows.length - 2]?.d) : null;
                        const spreadDirection = Number.isFinite(latestSpread) && Number.isFinite(prevSpread)
                          ? (latestSpread < prevSpread ? "Falling" : latestSpread > prevSpread ? "Rising" : "Flat")
                          : "n/a";
                        const reading = Number.isFinite(latestSpread)
                          ? (latestSpread > 0 ? `${a} stronger` : latestSpread < 0 ? `${b} stronger` : "Balanced pair")
                          : "n/a";
                        const corrVal = Number(aiExplainData?.corr ?? selectedPair?.corr);
                        const corrText = Number.isFinite(corrVal) ? `${corrVal >= 0 ? "+" : ""}${corrVal.toFixed(2)}` : "—";
                        const windows = aiExplainData?.windows || {};
                        const st30A = windows?.["30D"]?.[a] || _seriesStatsFallback((pairExplainSeries || {})[a]);
                        const st30B = windows?.["30D"]?.[b] || _seriesStatsFallback((pairExplainSeries || {})[b]);
                        const rsiA = _calcSimpleRsi((pairExplainSeries || {})[a], 14);
                        const rsiB = _calcSimpleRsi((pairExplainSeries || {})[b], 14);
                        const rsiAState = _rsiBadgeState(rsiA);
                        const rsiBState = _rsiBadgeState(rsiB);
                        const healthScore = Math.max(0, Math.min(100,
                          Math.round((Number.isFinite(corrVal) ? Math.abs(corrVal) * 55 : 25) + (Number.isFinite(latestSpread) ? Math.min(30, Math.abs(latestSpread) * 3) : 0) + (String(aiExplainData?.setup || "").includes("MEAN") ? 15 : String(aiExplainData?.setup || "").includes("TREND") ? 8 : 0))
                        ));
                        const gridFit = String(aiExplainData?.gridMode || "").toLowerCase() === "wait"
                          ? "Weak"
                          : healthScore >= 75 ? "Strong" : healthScore >= 55 ? "Moderate" : "Weak";
                        const svgW = 760;
                        const svgH = 180;
                        const padL = 46;
                        const padR = 8;
                        const padT = 10;
                        const padB = 24;
                        const innerW = svgW - padL - padR;
                        const innerH = svgH - padT - padB;
                        const dVals = rows.map((r) => Number(r?.d)).filter((v) => Number.isFinite(v));
                        const maxAbs = dVals.length ? Math.max(6, ...dVals.map((v) => Math.abs(v))) : 6;
                        const yMax = Math.ceil(maxAbs / 3) * 3;
                        const yMin = -yMax;
                        const sx = (i) => padL + ((i * innerW) / Math.max(1, rows.length - 1));
                        const sy = (v) => {
                          const t = (Number(v) - yMin) / Math.max(1e-9, (yMax - yMin));
                          return padT + (1 - t) * innerH;
                        };
                        let pathD = "";
                        rows.forEach((r, i) => {
                          const v = Number(r?.d);
                          if (!Number.isFinite(v)) return;
                          const X = sx(i);
                          const Y = sy(v);
                          pathD += pathD ? ` L ${X} ${Y}` : `M ${X} ${Y}`;
                        });
                        const zeroY = sy(0);
                        const latestX = rows.length ? sx(rows.length - 1) : padL;
                        const latestY = Number.isFinite(latestSpread) ? sy(latestSpread) : zeroY;
                        return (
                          <>
                            <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                              <div className="label" style={{ marginBottom: 0 }}>RSI / Pair State</div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: rsiAState.tone }}>
                                  <div className="muted tiny">{a} RSI</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{Number.isFinite(rsiA) ? rsiA.toFixed(1) : "—"}</div>
                                  <div className="pill" style={{ marginTop: 8, width: "fit-content", background: rsiAState.tone, borderColor: rsiAState.border, color: rsiAState.color }}>{rsiAState.label}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: rsiBState.tone }}>
                                  <div className="muted tiny">{b} RSI</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{Number.isFinite(rsiB) ? rsiB.toFixed(1) : "—"}</div>
                                  <div className="pill" style={{ marginTop: 8, width: "fit-content", background: rsiBState.tone, borderColor: rsiBState.border, color: rsiBState.color }}>{rsiBState.label}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                                  <div className="muted tiny">Correlation</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{corrText}</div>
                                  <div className="muted tiny" style={{ marginTop: 8 }}>{Number.isFinite(corrVal) ? (Math.abs(corrVal) >= 0.8 ? "High pair linkage" : Math.abs(corrVal) >= 0.6 ? "Moderate linkage" : "Low linkage") : "Pair linkage unclear"}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                                  <div className="muted tiny">30D Spread</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{_fmtPctLocal(latestSpread)}</div>
                                  <div className="muted tiny" style={{ marginTop: 8 }}>{reading}</div>
                                </div>
                              </div>
                              <div className="muted tiny" style={{ lineHeight: 1.45 }}>RSI helps identify overbought vs oversold conditions. Correlation + spread show whether the pair is more suitable for trend continuation or mean reversion.</div>
                            </div>

                            <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                              <div className="label" style={{ marginBottom: 0 }}>Risk / Grid Fit</div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Health Score</div><div style={{ fontWeight: 900, marginTop: 4 }}>{healthScore}/100</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Grid Fit</div><div style={{ fontWeight: 900, marginTop: 4 }}>{gridFit}</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">{a} Vol / DD</div><div style={{ fontWeight: 900, marginTop: 4 }}>{_fmtPctLocal(st30A?.volPct)} / {_fmtPctLocal(st30A?.maxDDPct)}</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">{b} Vol / DD</div><div style={{ fontWeight: 900, marginTop: 4 }}>{_fmtPctLocal(st30B?.volPct)} / {_fmtPctLocal(st30B?.maxDDPct)}</div></div>
                              </div>
                              <div className="muted tiny" style={{ lineHeight: 1.45 }}>This panel currently reflects local risk metrics based on volatility and drawdown.</div>
                            </div>


                          </>
                        );
                      })()}

                      <div style={{ display: "grid", gap: 10, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>Longer-Term Reversion Idea</div>

                        {aiExplainData.winner && aiExplainData.loser ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <span className="pill" style={{ background: "rgba(255,92,92,0.18)", borderColor: "rgba(255,92,92,0.35)" }}>SELL {aiExplainData.winner} later-view</span>
                            <button
                              className="btn"
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onTouchStart={(e) => { e.stopPropagation(); }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyAiSuggestionToGrid(aiExplainData.winner, "SELL"); }}
                              title="Prefill Grid Trader with this coin, side and suggested price. No order is created."
                              style={{ padding: "6px 10px", fontSize: 12, pointerEvents: "auto", cursor: "pointer" }}
                            >
                              Apply SELL {aiExplainData.winner}
                            </button>

                            <span className="pill" style={{ background: "rgba(57,217,138,0.18)", borderColor: "rgba(57,217,138,0.35)" }}>BUY {aiExplainData.loser} later-view</span>
                            <button
                              className="btn"
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onTouchStart={(e) => { e.stopPropagation(); }}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); applyAiSuggestionToGrid(aiExplainData.loser, "BUY"); }}
                              title="Prefill Grid Trader with this coin, side and suggested price. No order is created."
                              style={{ padding: "6px 10px", fontSize: 12, pointerEvents: "auto", cursor: "pointer" }}
                            >
                              Apply BUY {aiExplainData.loser}
                            </button>
                          </div>
                        ) : null}

                        <div className="muted tiny" style={{ lineHeight: 1.45 }}>
                          Above is the <b>longer-term</b> idea. The box at the top shows <b>current momentum</b>. Both can differ.
                        </div>

                        <div style={{ display: "grid", gap: 6 }} className="muted">
                          {String(aiExplainData.action || "")
                            .split("\n")
                            .filter(Boolean)
                            .map((line, idx) => (
                              <div key={idx} style={{ fontSize: 14 }}>
                                {line}
                              </div>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                            <div className="muted tiny">Suggested Grid</div>
                            <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.gridRange || aiExplainData.range || "—"}</div>
                          </div>
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                            <div className="muted tiny">Mode</div>
                            <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.gridMode || aiExplainData.mode || "—"}</div>
                          </div>
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
                            <div className="muted tiny">Time horizon</div>
                            <div style={{ fontWeight: 900, marginTop: 4 }}>
                              {String(aiExplainData.setup || "").includes("MEAN")
                                ? "Short to medium term"
                                : String(aiExplainData.setup || "").includes("TREND")
                                  ? "Short-term tactical"
                                  : "Wait / monitor"}
                            </div>
                          </div>
                        </div>

                        {aiExplainData.winner && aiExplainData.loser ? (
                          <>
                            <div className="tiny" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              <span className="pill silver">Stronger: <b>{aiExplainData.winner}</b></span>
                              <span className="pill silver">Weaker: <b>{aiExplainData.loser}</b></span>
                            </div>
                            <div className="muted tiny" style={{ marginTop: 2, lineHeight: 1.45 }}>
                              Strategy: Mean Reversion — the stronger coin may cool off while the weaker one catches up.
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div style={{ display: "grid", gap: 6, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>Why this setup</div>
                        <div className="muted tiny" style={{ display: "grid", gap: 4 }}>
                          {(Array.isArray(aiExplainData.why) ? aiExplainData.why : Array.isArray(aiExplainData.bullets) ? aiExplainData.bullets : []).map((line, idx) => (
                            <div key={idx}>• {line}</div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 6, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>Invalidation</div>
                        <div className="muted tiny" style={{ display: "grid", gap: 4 }}>
                          {(() => {
                            const lines = [];
                            if (aiExplainData.winner && aiExplainData.loser) {
                              lines.push(`If ${aiExplainData.winner} keeps outperforming while ${aiExplainData.loser} stays weak, the catch-up idea weakens.`);
                            }
                            if (String(aiExplainData.gridMode || aiExplainData.mode || "").toLowerCase() === "wait") {
                              lines.push("If spread and correlation do not improve, there is still no valid entry.");
                            } else {
                              lines.push("If the spread widens sharply without any stabilization, reduce trust in mean reversion.");
                            }
                            lines.push("If short-term structure deteriorates further across 7D and 30D, the setup should be reassessed.");
                            return lines.map((line, idx) => <div key={idx}>• {line}</div>);
                          })()}
                        </div>
                      </div>

                      <div style={{ display: "grid", gap: 6, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>Best for</div>
                        <div className="muted tiny" style={{ display: "grid", gap: 4 }}>
                          {(() => {
                            const lines = [];
                            const riskTxt = String(aiExplainData.risk || "").toLowerCase();
                            if (riskTxt.includes("high")) lines.push("Best suited for active users who can handle medium to high risk.");
                            else if (riskTxt.includes("medium")) lines.push("Best suited for users comfortable with moderate tactical positioning.");
                            else lines.push("Best suited for cautious users who prefer patience over aggressive entries.");
                            if (String(aiExplainData.gridMode || aiExplainData.mode || "").toLowerCase() === "wait") {
                              lines.push("Less suitable for users who want an immediate trade right now.");
                            } else {
                              lines.push("Better for users who understand pair rotation and short-term reversion setups.");
                            }
                            lines.push("Not ideal as a blind long-term allocation decision without rechecking the structure.");
                            return lines.map((line, idx) => <div key={idx}>• {line}</div>);
                          })()}
                        </div>
                      </div>
                    </div>
                  ) : aiExplainText ? (
                    <pre style={{ whiteSpace: "pre-wrap", margin: 0 }} className="muted tiny">
                      {aiExplainText}
                    </pre>
                  ) : (
                    <div className="muted tiny">Runs locally (no web). Later we can add “AI + News” with sources.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        <section className={`card section-grid dashboardPanel ${activePanel === "vault" ? "panelActive" : ""}`} onClick={handlePanelActivate("vault")}>
          <div className="cardHead">
            <div className="cardTitle">Grid Trader</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
             
              <span className="pill silver">Price: {shownGridPrice ? fmtUsd(shownGridPrice) : "—"}</span>
              <InfoButton title="Grid Trader – Info">
                <Help showClose dismissable
                  de={
                    <>
                      <p><b>Grid Trader</b> verwaltet mehrere BUY- und SELL-Orders für den gewählten Coin.</p>
                      <p>Du definierst ein <b>maximales Budget in der ausgewählten Payout-/Chain-Währung</b> (z. B. POL / BNB / ETH). Dieses Budget ist ein <b>globales Limit</b> für den gesamten Grid.</p>
                      <p>Das Budget gilt <b>nicht pro Order</b>, sondern für alle Grid-Orders zusammen.</p>
                      <p><b>BUY</b>-Orders kaufen Token, <b>SELL</b>-Orders verkaufen bereits vorhandene Token.</p>
                      
                      <p><b>Manual Orders</b> sind einzelne Orders und nicht Teil des eigentlichen Grid-Blocks.</p>
                      <p>BUY kann je nach Eingabe per <b>USD</b> oder per <b>Token-Menge</b> definiert werden.</p>
                    </>
                  }
                  en={
                    <>
                      <p><b>Grid Trader</b> manages multiple BUY and SELL orders for the selected coin.</p>
                      <p>You define a <b>maximum budget in the selected payout/chain asset</b> (for example POL / BNB / ETH). This budget is a <b>global limit</b> for the full grid.</p>
                      <p>The budget is <b>not per order</b>; it is shared across all grid orders.</p>
                      <p><b>BUY</b> orders acquire tokens, <b>SELL</b> orders sell tokens you already hold.</p>
                      
                      <p><b>Manual orders</b> are single orders and are not part of the main grid block.</p>
                      <p>BUY can be defined either by <b>USD</b> or by <b>token quantity</b>, depending on your input mode.</p>
                    </>
                  }
                />
                <RotationInfoTrigger />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="gridLayout">
            <div className="gridLeft">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  marginBottom: 10,
                  padding: 4,
                  borderRadius: 14,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)",
                }}
              >
                {[
                  ["normal", "Nexus Grid"],
                  ["rotation", "Nexus Rotation"],
                ].map(([mode, label]) => {
                  const active = String(gridMode || "normal") === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setGridMode(mode)}
                      style={{
                        height: 36,
                        borderRadius: 11,
                        border: active ? "1px solid rgba(34,197,94,.65)" : "1px solid rgba(255,255,255,.08)",
                        background: active ? "linear-gradient(90deg, #22c55e, #16a34a)" : "rgba(255,255,255,.04)",
                        color: active ? "#071512" : "#d9fff0",
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: active ? "0 0 16px rgba(34,197,94,.22)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {String(gridMode || "normal") === "rotation" ? (
                <div className="gridWrap">
                  <div className="gridControls" style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(0,0,0,.18)",
                        border: "1px solid rgba(34,197,94,.22)",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div className="label" style={{ marginBottom: 0 }}>Vault overview</div>
                      <div
                        className="muted tiny"
                        style={{
                          display: "grid",
                          gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr",
                          gap: 6,
                          lineHeight: 1.45,
                        }}
                      >
                        {(() => {
                          const vaultTotalNative = Number(manualVaultTotalQty || 0);
                          const gridAllocatedNative = Number(manualVaultAllocatedQty || 0);
                          const px = Number(activeGridNativeUsd || 0);
                          const vaultTotalUsd = Number.isFinite(px) && px > 0 ? vaultTotalNative * px : 0;
                          const gridAllocatedUsd = Number.isFinite(px) && px > 0 ? gridAllocatedNative * px : 0;
                          const rotationAllocatedUsd = rotationBudgetReleased ? Math.max(0, Number(String(rotationBudgetRelease || "").replace(",", ".")) || 0) : 0;
                          const availableUsd = Math.max(0, vaultTotalUsd - gridAllocatedUsd - rotationAllocatedUsd);
                          const usagePct = vaultTotalUsd > 0 ? Math.min(100, Math.max(0, ((gridAllocatedUsd + rotationAllocatedUsd) / vaultTotalUsd) * 100)) : 0;
                          return (
                            <>
                              <div><b>Vault total:</b> {vaultTotalUsd ? fmtUsd(vaultTotalUsd) : `${vaultTotalNative.toFixed(6)} ${activeGridChainSymbol}`}</div>
                              <div><b>Grid allocated:</b> {vaultTotalUsd ? fmtUsd(gridAllocatedUsd) : `${gridAllocatedNative.toFixed(6)} ${activeGridChainSymbol}`}</div>
                              <div><b>Rotation allocated:</b> {rotationAllocatedUsd ? fmtUsd(rotationAllocatedUsd) : "$0.00"}</div>
                              <div style={{ color: "#22c55e", fontWeight: 900 }}><b>Available:</b> {vaultTotalUsd ? fmtUsd(availableUsd) : "Price pending"}</div>
                              <div style={{ gridColumn: isCompactMobile ? "auto" : "1 / -1" }}><b>Usage:</b> {vaultTotalUsd ? `${usagePct.toFixed(1)}%` : "waiting for price"}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr",
                        gap: isCompactMobile ? 8 : 10,
                      }}
                    >
                      <div className="formRow">
                        <label>Network scope</label>
                        <select value={rotationNetworkScope} onChange={(e) => { setRotationNetworkScope(e.target.value); setRotationBudgetReleased(false); }}>
                          <option value="ALL">All wallet networks</option>
                          {gridWalletChains.map((ck) => (
                            <option key={`rotation-scope-${ck}`} value={ck}>{ck}</option>
                          ))}
                        </select>
                      </div>
                      <div className="formRow">
                        <label>Mode</label>
                        <select value={rotationMode} onChange={(e) => { setRotationMode(e.target.value); setRotationBudgetReleased(false); }}>
                          <option value="RECOMMENDATION">Recommendation first</option>
                          <option value="MANUAL_CONFIRM">Manual confirm</option>
                          <option value="AUTO_AFTER_RELEASE">Auto after release</option>
                        </select>
                      </div>
                      <div className="formRow">
                        <label>Rotation Budget ($)</label>
                        <input
                          value={rotationBudgetRelease}
                          onChange={(e) => { setRotationBudgetRelease(e.target.value); setRotationBudgetReleased(false); }}
                          disabled={!rotationSelectedPick?.ok}
                          placeholder={rotationSelectedPick?.ok ? "e.g. 500" : "Select a recommendation first"}
                        />
                      </div>
                      <div className="formRow">
                        <label>Risk limit (%)</label>
                        <input
                          value={rotationRiskLimit}
                          onChange={(e) => { setRotationRiskLimit(e.target.value); setRotationBudgetReleased(false); }}
                          disabled={!rotationSelectedPick?.ok}
                          placeholder={rotationSelectedPick?.ok ? "Max loss for this Rotation" : "Select first"}
                        />
                      </div>
                      <div className="formRow">
                        <label>Min net advantage (%)</label>
                        <input
                          value={rotationMinNetAdvantage}
                          onChange={(e) => { setRotationMinNetAdvantage(e.target.value); setRotationBudgetReleased(false); }}
                          disabled={!rotationSelectedPick?.ok}
                          placeholder="e.g. 0.5"
                        />
                      </div>
                      <div className="formRow">
                        <label>Max slippage (%)</label>
                        <input
                          value={rotationMaxSlippage}
                          onChange={(e) => { setRotationMaxSlippage(e.target.value); setRotationBudgetReleased(false); }}
                          disabled={!rotationSelectedPick?.ok}
                          placeholder="e.g. 1"
                        />
                      </div>
                    </div>

                    <div
                      className="muted tiny"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "rgba(0,0,0,.14)",
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      <span>
                        <b>Status:</b>{" "}
                        {rotationBudgetReleased
                          ? "Ready"
                          : rotationSelectedPick?.ok
                            ? "Waiting for budget"
                            : "Idle"}
                      </span>
                      <span style={{ opacity: 0.75 }}>
                        {rotationSelectedPick?.ok
                          ? `${rotationSelectedPick.coin} / ${rotationSelectedPick.chain}`
                          : "No selection"}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,.035)",
                        border: "1px solid rgba(255,255,255,.07)",
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <div className="label" style={{ marginBottom: 0 }}>Watchlist recommendations</div>
                      {(() => {
                        const rows = Array.isArray(watchRows) ? watchRows : [];
                        const picks = rows
                          .map((r) => {
                            const sym = String(r?.symbol || "").toUpperCase();
                            if (!sym) return null;
                            const onchain = onchainBySymbol?.[sym] || null;
                            const marketCondition = normalizeMarketConditionForAi(marketConditionBySymbol?.[sym]);
                            const baseScore = watchSystemScore(r);
                            const onchainDelta = watchOnchainScoreDelta(onchain);
                            const marketDelta = Number(marketCondition?.score_delta || 0);
                            const score = Math.max(0, Math.min(100, Math.round(baseScore + onchainDelta + marketDelta)));
                            const rating = ratingFromScore(score);
                            const ch = Number(r?.change24h ?? r?.chg_24h ?? r?.usd_24h_change ?? r?.change_24h);
                            const vol = Number(r?.volume24h ?? r?.total_volume ?? r?.volume_24h);
                            const whaleText = String(onchain?.summary || onchain?.label || onchain?.state || "Neutral").trim();
                            const riskText = marketCondition?.label || marketCondition?.state || "Normal";
                            return { sym, score, rating, ch, vol, whaleText, riskText };
                          })
                          .filter(Boolean)
                          .sort((a, b) => (b.score - a.score) || ((b.ch || 0) - (a.ch || 0)));

                        const resolveRotationPreview = (sym) => {
                          const rawSym = String(sym || "").toUpperCase().trim();
                          const coinsByChain = gridWalletCoinsByChain || {};
                          const hasCoinOnChain = (chain, coin) => {
                            const list = coinsByChain?.[String(chain || "").toUpperCase()] || [];
                            return list.map((x) => String(x || "").toUpperCase()).includes(String(coin || "").toUpperCase());
                          };
                          const chooseFirstAvailable = (options) => {
                            for (const opt of options) {
                              if (hasCoinOnChain(opt.chain, opt.coin)) return opt;
                            }
                            return null;
                          };
                          if (rawSym === "BTC") return chooseFirstAvailable([{ chain: "ETH", coin: "WBTC" }, { chain: "BNB", coin: "BTCB" }, { chain: "BNB", coin: "WBTC" }, { chain: "POL", coin: "WBTC" }]);
                          if (rawSym === "SOL") return chooseFirstAvailable([{ chain: "ETH", coin: "WSOL" }, { chain: "BNB", coin: "WSOL" }, { chain: "POL", coin: "WSOL" }]);
                          for (const chain of Object.keys(coinsByChain || {}).map((x) => String(x || "").toUpperCase())) {
                            if (hasCoinOnChain(chain, rawSym)) return { chain, coin: rawSym };
                          }
                          return null;
                        };

                        const chainLabel = (chain) => {
                          const key = String(chain || "").toUpperCase();
                          if (key === "POL") return "Polygon";
                          if (key === "BNB") return "BNB Chain";
                          if (key === "ETH") return "Ethereum";
                          if (key === "WATCHLIST") return "Watchlist only";
                          return key;
                        };

                        const inferWatchlistChain = (sym) => {
                          const key = String(sym || "").toUpperCase().trim();
                          if (!key) return "WATCHLIST";
                          if (key === "ETH" || key === "BTC" || key === "WBTC" || key === "LINK" || key === "UNI" || key === "AAVE" || key === "PEPE") return "ETH";
                          if (key === "BNB" || key === "BTCB" || key === "CAKE" || key === "SXA") return "BNB";
                          if (key === "POL" || key === "MATIC" || key === "TBP" || key === "CC" || key === "XPR" || key === "JAM" || key === "ALKIMI") return "POL";
                          const resolved = resolveRotationPreview(key);
                          return resolved?.chain || "WATCHLIST";
                        };

                        const getPickScopeChain = (pick) => {
                          const resolved = resolveRotationPreview(pick?.sym);
                          return resolved?.chain || inferWatchlistChain(pick?.sym);
                        };

                        const renderPickCard = (p, idx, compact = false) => {
                          const isSelected = String(rotationSelectedPick?.source || "").toUpperCase() === String(p?.sym || "").toUpperCase();
                          return (
                            <div
                              key={`${p.sym}-${idx}-${compact ? "all" : "top"}`}
                              title="Nexus Rotation recommendation"
                              style={{
                                width: "100%",
                                boxSizing: "border-box",
                                display: "grid",
                                gridTemplateColumns: isCompactMobile ? "1fr" : compact ? "62px minmax(0,1fr) auto" : "70px minmax(0,1fr) auto",
                                gap: 8,
                                alignItems: "center",
                                padding: compact ? "8px 9px" : "9px 10px",
                                minHeight: compact ? 54 : 58,
                                borderRadius: 12,
                                background: isSelected ? "rgba(245,158,11,.11)" : idx === 0 ? "rgba(34,197,94,.10)" : "rgba(255,255,255,.03)",
                                border: isSelected ? "1px solid rgba(245,158,11,.55)" : idx === 0 ? "1px solid rgba(34,197,94,.30)" : "1px solid rgba(255,255,255,.06)",
                                transform: "none",
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 900 }}>
                                  {idx === 0 ? "#1 " : `#${idx + 1} `}{p.sym}
                                </div>
                                {getAssetNote(p.sym) && (
                                  <div style={{ fontSize: "12px", opacity: 0.7 }}>{getAssetNote(p.sym)}</div>
                                )}
                              </div>
                              <div className="muted tiny" style={{ display: "grid", gap: 3, minWidth: 0 }}>
                                <div>Score {p.score}/100 · 24h {Number.isFinite(p.ch) ? `${p.ch >= 0 ? "+" : ""}${p.ch.toFixed(2)}%` : "—"}</div>
                              </div>
                              <div style={{ display: "flex", gap: 6, justifyContent: isCompactMobile ? "flex-start" : "flex-end", alignItems: "center", flexWrap: "wrap" }}>
                                <span className={`pill ${p.score >= 70 ? "green" : p.score >= 55 ? "silver" : "red"}`}>
                                  {isSelected ? "Selected" : idx === 0 ? "Best" : "Option"}
                                </span>
                                <button
                                  type="button"
                                  className="miniBtn"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRotationPickToGrid(p);
                                  }}
                                  style={{ height: 28, paddingInline: 10 }}
                                  title="Select for Nexus Rotation only"
                                >
                                  Select
                                </button>
                              </div>
                            </div>
                          );
                        };

                        if (!picks.length) {
                          return (
                            <div className="muted tiny">
                              No Watchlist data available yet. Add coins to the Watchlist and refresh, then Nexus Rotation can show recommendations here.
                            </div>
                          );
                        }

                        const scopedPicks = picks
                          .map((pick, idx) => ({
                            ...pick,
                            _rank: idx,
                            _chain: getPickScopeChain(pick),
                          }))
                          .filter((pick) =>
                            rotationNetworkScope === "ALL"
                              ? true
                              : String(pick._chain || "").toUpperCase() === String(rotationNetworkScope || "").toUpperCase()
                          );

                        if (!scopedPicks.length) {
                          return (
                            <div className="muted tiny">
                              No recommendations available for the selected Network scope.
                            </div>
                          );
                        }

                        const chainGroups = scopedPicks.reduce((acc, pick) => {
                          const chain = pick._chain || "WATCHLIST";
                          if (!acc[chain]) acc[chain] = [];
                          acc[chain].push(pick);
                          return acc;
                        }, {});

                        return (
                          <div
                            style={{
                              display: "grid",
                              gap: 10,
                              maxHeight: 260,
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {Object.entries(chainGroups).map(([chain, list]) => (
                              <div key={chain} style={{ display: "grid", gap: 6 }}>
                                {rotationNetworkScope === "ALL" && (
                                  <div className="label" style={{ marginBottom: 0 }}>{chainLabel(chain)}</div>
                                )}
                                {list.map((p) => renderPickCard(p, p._rank, true))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {rotationSelectedPick && (
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: rotationSelectedPick.ok ? "rgba(34,197,94,.10)" : "rgba(245,158,11,.10)",
                          border: rotationSelectedPick.ok ? "1px solid rgba(34,197,94,.30)" : "1px solid rgba(245,158,11,.35)",
                          color: rotationSelectedPick.ok ? "#d9fff0" : "#facc15",
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>Selected recommendation</div>
                        <div className="muted tiny" style={{ lineHeight: 1.55, display: "grid", gap: 3 }}>
                          <div>{rotationSelectedPick.note}</div>
                          {rotationSelectedPick.ok && (
                            <>
                              <div><b>Source:</b> {rotationSelectedPick.source} → <b>Execution:</b> {rotationSelectedPick.coin} on {rotationSelectedPick.chain}</div>
                              <div><b>Score:</b> {Number.isFinite(rotationSelectedPick.score) ? `${rotationSelectedPick.score}/100` : "—"} · <b>Rating:</b> {rotationSelectedPick.rating || "—"} · <b>24h:</b> {Number.isFinite(rotationSelectedPick.change24h) ? `${rotationSelectedPick.change24h >= 0 ? "+" : ""}${rotationSelectedPick.change24h.toFixed(2)}%` : "—"}</div>
                              <div><b>Whale / On-chain:</b> {rotationSelectedPick.whaleText || "Neutral"} · <b>Market:</b> {rotationSelectedPick.riskText || "Normal"}</div>
                              <div><b>Rotation Budget:</b> {rotationBudgetRelease ? `$${rotationBudgetRelease}` : "not entered"} · <b>Risk:</b> {rotationRiskLimit || "not set"} · <b>Min advantage:</b> {rotationMinNetAdvantage || "—"}% · <b>Slippage:</b> {rotationMaxSlippage || "—"}%</div>
                              <div><b>Scope:</b> {rotationNetworkScope === "ALL" ? "All wallet networks" : rotationNetworkScope} · <b>Mode:</b> {rotationMode === "AUTO_AFTER_RELEASE" ? "Auto after release" : rotationMode === "MANUAL_CONFIRM" ? "Manual confirm" : "Recommendation first"}</div>
                              <div><b>Spread check:</b> DEX {rotationAllowDexSpread ? "ON" : "OFF"} · CEX/DEX {rotationAllowCexDexSpread ? "ON" : "OFF"}</div>
                              <div><b>Status:</b> {rotationBudgetReleased ? "Budget released for Nexus Rotation" : "Ready for budget release"}</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="btnRow">
                      <button
                        className="btn"
                        type="button"
                        disabled={(() => {
                          const amount = Number(String(rotationBudgetRelease || "").replace(",", "."));
                          if (!rotationSelectedPick?.ok || !(amount > 0)) return true;
                          const px = Number(activeGridNativeUsd || 0);
                          const vaultTotalUsd = Number.isFinite(px) && px > 0 ? Number(manualVaultTotalQty || 0) * px : 0;
                          const gridAllocatedUsd = Number.isFinite(px) && px > 0 ? Number(manualVaultAllocatedQty || 0) * px : 0;
                          const availableUsd = Math.max(0, vaultTotalUsd - gridAllocatedUsd);
                          return vaultTotalUsd > 0 && amount > availableUsd;
                        })()}
                        onClick={releaseRotationBudget}
                        title={rotationSelectedPick?.ok ? "Release this budget for Nexus Rotation" : "Select a recommendation first"}
                      >
                        {rotationBudgetReleased ? "Budget freigegeben" : "Budget freigeben"}
                      </button>
                      <button
                        className="btnDanger"
                        type="button"
                        disabled={rotationBackendLoading}
                        onClick={startRotationSafeMode}
                        title="Runs backend SAFE MODE check only. No trade, no swap, no Vault transaction."
                      >
                        {rotationBackendLoading ? "Checking…" : "Check Vault"}
                      </button>
                      {rotationBudgetReleased && (
                        <button className="miniBtn" type="button" onClick={resetRotationBudgetRelease}>Reset budget</button>
                      )}
                    </div>
                    {rotationBackendMsg ? (
                      <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                        {rotationBackendMsg}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <>

          <div className="gridWrap">
            <div className="gridControls">              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr 1fr",
                  gap: isCompactMobile ? 8 : 10,
                  alignItems: "end",
                }}
              >
                <div className="formRow">
                  <label>Network</label>
                  <select value={activeGridChainKey} onChange={(e) => setGridChain(String(e.target.value || "").toUpperCase())}>
                    {gridWalletChains.map((ck) => (
                      <option key={ck} value={ck}>
                        {ck}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="formRow">
                  <label>Coin</label>
                  <select value={gridItem} onChange={(e) => setGridItem(e.target.value)}>
                    {gridWalletCoins.map((c) => (
                      <option key={`${activeGridChainKey}:${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="formRow">
                  <label>Budget (Qty)</label>
                  <input value={gridInvestQty} onChange={(e) => setGridInvestQty(e.target.value)} placeholder="250" />
                </div>
              </div>
<div className="hint" style={{ marginTop: 4, marginBottom: 6, opacity: 0.95 }}>
  {tB("Available:")} <b>{manualVaultAvailableQty.toFixed(6)}</b> {activeGridChainSymbol}
  {" · "}
  {tB("Allocated:")} <b>{manualVaultAllocatedQty.toFixed(6)}</b> {activeGridChainSymbol}
  {" · "}
  {tB("Settled:")} <b>{manualVaultSettledQty.toFixed(6)}</b> {String(manualPayoutAsset || "USDC").toUpperCase()}
</div>{isEthChain ? (

              <div className="formRow" style={{ marginTop: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={!!gridAutoPath}
                    onChange={(e) => setGridAutoPath(e.target.checked)}
                    style={{ transform: "scale(1.1)" }}
                  />
                  <span>
                    Auto-path (V2 → V3 fallback)
                    <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                      Helps avoid failed swaps when liquidity is only on V3 (mainly ETH).
                    </span>
                  </span>
                </label>
              </div>

              ) : null}
<div className="btnRow">
                <button
                  className="btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    gridStart();
                  }}
                  disabled={!isGridReady || gridBusy.start || gridBusy.stop}
                  title={!isPro ? "Subscribe to Nexus Pro to start trading" : ""}
                >
                  {gridBusy.start ? "Starting..." : "Start"}
                </button>
                <button className="btnDanger" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); gridStop(); }} disabled={!isGridReady || gridBusy.stop || gridBusy.start}>{gridBusy.stop ? "Stopping..." : "Stop"}</button>
              </div>
              {errorMsg ? (
                <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "8px", background: "rgba(255, 0, 0, 0.10)", border: "1px solid rgba(255, 0, 0, 0.25)", fontSize: "13px", lineHeight: "1.4" }}>
                  {errorMsg}
                </div>
              ) : null}
</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr",
                  gap: isCompactMobile ? 8 : 10,
                  alignItems: "end",
                  marginTop: isCompactMobile ? 0 : -4,
                }}
              >
                <div className="formRow">
                  <label>Side</label>
                  <select value={manualSide} onChange={(e) => setManualSide(e.target.value)}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div className="formRow">
                  <label>Price</label>
                  <input value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} placeholder="e.g. 94442" />
                </div>
              </div>

              <div className="formRow">
                <label>Payout asset</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {visiblePayoutAssets.map((asset) => {
                    const active = String(manualPayoutAsset || "").toUpperCase() === String(asset).toUpperCase();
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setManualPayoutAsset(String(asset).toUpperCase())}
                        style={{
                          ...compactGridChipStyle,
                          minWidth: 66,
                          background: active ? "linear-gradient(90deg, #22c55e, #16a34a)" : "rgba(34,197,94,.16)",
                          color: active ? "#071512" : "#d9fff0",
                          border: active ? "1px solid rgba(34,197,94,.55)" : "1px solid rgba(34,197,94,.32)",
                          boxShadow: active ? "0 0 12px rgba(34,197,94,.28)" : "none",
                          fontWeight: active ? 800 : 700,
                        }}
                        title={`Set payout asset to ${asset}`}
                      >
                        {asset}
                      </button>
                    );
                  })}
                  {extraPayoutAssets.length > 0 && (
                    <div ref={payoutMenuRef} style={{ position: "relative", minWidth: 220 }}>
                      <button
                        type="button"
                        onClick={() => setPayoutMenuOpen((v) => !v)}
                        style={{
                          width: "100%",
                          height: isCompactMobile ? 32 : 36,
                          padding: "0 12px",
                          borderRadius: 10,
                          background: "rgba(34,197,94,.16)",
                          color: "#ffffff",
                          border: "1px solid rgba(34,197,94,.38)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
                          fontWeight: 800,
                          boxShadow: payoutMenuOpen ? "0 0 12px rgba(34,197,94,.22)" : "none",
                        }}
                      >
                        <span>{extraPayoutAssets.includes(String(manualPayoutAsset || "").toUpperCase()) ? String(manualPayoutAsset || "").toUpperCase() : "More payout assets"}</span>
                        <span style={{ fontSize: 12 }}>{payoutMenuOpen ? "▲" : "▼"}</span>
                      </button>
                      {payoutMenuOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            left: 0,
                            right: 0,
                            zIndex: 50,
                            borderRadius: 12,
                            overflow: "hidden",
                            background: "linear-gradient(180deg, rgba(74,222,128,.98), rgba(34,197,94,.98))",
                            border: "1px solid rgba(34,197,94,.55)",
                            boxShadow: "0 16px 34px rgba(0,0,0,.35)",
                          }}
                        >
                          {extraPayoutAssets.map((asset) => {
                            const active = String(manualPayoutAsset || "").toUpperCase() === String(asset).toUpperCase();
                            return (
                              <button
                                key={asset}
                                type="button"
                                onClick={() => {
                                  setManualPayoutAsset(String(asset).toUpperCase());
                                  setPayoutMenuOpen(false);
                                }}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "10px 12px",
                                  background: active ? "linear-gradient(90deg, #86efac, #4ade80)" : "rgba(255,255,255,.10)",
                                  color: "#071512",
                                  border: "none",
                                  borderTop: "1px solid rgba(7,21,18,.10)",
                                  fontWeight: active ? 800 : 700,
                                  cursor: "pointer",
                                }}
                              >
                                {asset}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="muted tiny" style={{ marginTop: 6 }}>
                  Profit result will be swapped immediately into this asset when the target is hit.
                </div>
              </div>

              <div
                style={{
                  marginTop: 4,
                  marginBottom: 8,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Risk & settlement preview</div>
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: manualRiskState.tone,
                      border: manualRiskState.border,
                      color: manualRiskState.color,
                      fontWeight: 800,
                      fontSize: 11,
                      lineHeight: 1.1,
                    }}
                  >
                    {manualRiskState.label}
                  </div>
                </div>
                <div className="tiny muted" style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", lineHeight: 1.25 }}>
                  <span>Chain: <b>{activeGridChainSymbol}</b></span>
                  <span>Liquidity: <b>{manualPoolLiquidityUsd == null ? "Checking..." : (Number(manualPoolLiquidityUsd) <= 0 ? "No liquidity" : fmtUsd(manualPoolLiquidityUsd))}</b></span>
                  <span>Exposure: <b>{fmtUsd(manualOpenExposureUsd)}</b></span>
                  <span>After: <b>{fmtUsd(manualExposureAfterUsd)}</b></span>
                  <span>Impact: <b>{manualPoolLiquidityUsd == null ? "Checking..." : (Number(manualPoolLiquidityUsd) <= 0 ? "No liquidity" : (manualEstimatedImpactPct == null ? "Enter order" : `${manualEstimatedImpactPct.toFixed(2)}%`))}</b></span>
                  <span>Payout: <b>{String(manualPayoutAsset || "USDC").toUpperCase()}</b></span>
                </div>
                <div className="tiny muted" style={{ marginTop: 4, lineHeight: 1.25, whiteSpace: "normal", overflowWrap: "anywhere" }}>
                  Settlement: <b>{manualSettlementPreview}</b>
                </div>
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 11, color: "#bdebd8", lineHeight: 1.2 }}>
                  <span>In chain: <b>{fmtUsd(Number(manualVaultTotalQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Allocated: <b>{fmtUsd(Number(manualVaultAllocatedQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Settled: <b>{fmtUsd(Number(manualVaultSettledQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Cycle out: <b>{fmtUsd((Number(manualVaultAvailableQty || 0) + Number(manualVaultAllocatedQty || 0) + Number(manualVaultSettledQty || 0)) * Number(activeGridNativeUsd || 0))}</b></span>
                </div>
              </div>

              <div className="row" style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: -4, marginBottom: 8 }}>
                <div className="muted" style={{ fontSize: 12 }}>Slippage:</div>
                <input
                  value={manualSlippagePct}
                  onChange={(e) => { setAiGridManualOverride(true); setManualSlippagePct(e.target.value); }}
                  style={{ width: 90 }}
                  placeholder="5"
                />
                <div className="muted" style={{ fontSize: 12 }}>%</div>

                <div style={{ width: 10 }} />

                <div className="muted" style={{ fontSize: 12 }}>Deadline:</div>
                <input
                  value={manualDeadlineMin}
                  onChange={(e) => setManualDeadlineMin(e.target.value)}
                  style={{ width: 90 }}
                  placeholder="20"
                />
                <div className="muted" style={{ fontSize: 12 }}>min</div>

                <div style={{ width: 10 }} />
                <div className="muted tiny">
                  Tip: increase slippage for low-liquidity tokens to avoid failed swaps.
                </div>
              </div>

              <div className="row" style={{ display: "flex", justifyContent: "flex-start", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: -2, marginBottom: 7 }}>
                <div className="muted" style={{ fontSize: 12, minWidth: 90 }}>Price preset:</div>

                <button
                  className="btn"
                  type="button"
                  onClick={() => { setAiGridManualOverride(true); setManualPricePreset("FAST"); }}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "FAST" ? 1 : 0.88 }}
                  title="Fast preset (0.25 / 0.5 / 1)"
                >
                  Fast
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => { setAiGridManualOverride(true); setManualPricePreset("STANDARD"); }}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "STANDARD" ? 1 : 0.88 }}
                  title="Standard preset (0.5 / 1 / 2)"
                >
                  Standard
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => { setAiGridManualOverride(true); setManualPricePreset("WIDE"); }}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "WIDE" ? 1 : 0.88 }}
                  title="Wide preset (1 / 2 / 3)"
                >
                  Wide
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => { setAiGridManualOverride(true); setManualPricePreset("VERY_WIDE"); }}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "VERY_WIDE" ? 1 : 0.88 }}
                  title="Very Wide preset (5 / 10 / 15)"
                >
                  Very Wide
                </button>
              </div>

              <div className="row" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 7 }}>
                <div className="muted" style={{ fontSize: 12, minWidth: 90 }}>Quick price:</div>

                <button className="btn" type="button" onClick={setManualPriceFromMarket} disabled={!shownGridPrice} title="Set price to current market" style={compactGridChipStyle}>
                  Market
                </button>

                {manualSide === "BUY" ? (
                  <>
                    {gridQuickSteps.map((p) => (
                      <button
                        key={p}
                        className="btn"
                        type="button"
                        onClick={() => nudgeManualPricePct(-p)}
                        disabled={!shownGridPrice}
                        title={`Set BUY limit ${p}% below market`}
                        style={compactGridChipStyle}
                      >
                        -{p}%
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {gridQuickSteps.map((p) => (
                      <button
                        key={p}
                        className="btn"
                        type="button"
                        onClick={() => nudgeManualPricePct(p)}
                        disabled={!shownGridPrice}
                        title={`Set SELL limit ${p}% above market`}
                        style={compactGridChipStyle}
                      >
                        +{p}%
                      </button>
                    ))}
                  </>
                )}

                {!shownGridPrice ? <span className="muted tiny">No live price yet.</span> : null}
              </div>
              {manualSide === "BUY" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr",
                    gap: isCompactMobile ? 8 : 10,
                    alignItems: "end",
                  }}
                >
                  <div className="formRow">
                    <label>Buy mode</label>
                    <select value={manualBuyMode} onChange={(e) => setManualBuyMode(e.target.value)}>                      <option value="QTY">Token qty</option>
                    </select>
                  </div>

                  {manualBuyMode === "USD" ? (
                    <div className="formRow">
                      <label>Spend (Qty)</label>
                      <input value={manualUsd} onChange={(e) => setManualUsd(e.target.value)} placeholder="e.g. 300" />
                      {manualUsd && manualPrice ? (
                        <div className="muted tiny" style={{ marginTop: 4 }}>
                          Est. qty ≈ {(Number(manualUsd) > 0 && Number(manualPrice) > 0) ? (Number(manualUsd) / Number(manualPrice)).toFixed(8) : "—"}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="formRow">
                      <label>Qty (token)</label>
                      <input value={manualQty} onChange={(e) => setManualQty(e.target.value)} placeholder="e.g. 0.01" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="formRow">
                  <label>Qty (token)</label>
                  <input value={manualQty} onChange={(e) => setManualQty(e.target.value)} placeholder="e.g. 0.01" />
                </div>
              )}

              <button
                className="btn"
                onClick={addManualOrder}
                disabled={!isGridReady || gridBusy.add}
                title={!isPro ? "Subscribe to Nexus Pro to trade" : ""}
              >
                {gridBusy.add ? "Adding..." : "Add Order"}
              </button>

              {!token && <div className="muted tiny">Wallet connected. First protected action may require one signature.</div>}
</div>

                </>
              )}

            </div>

            <div className="gridRight">
              <div className="gridOrders">
              <div className="ordersHead" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btnGhost"
                  onClick={() => gridOrders.length && setGridOrdersOpen((v) => !v)}
                  style={{ height: 32, paddingInline: 12, fontSize: 13 }}
                  title={gridOrders.length ? (gridOrdersOpen ? "Hide orders" : "Show orders") : "No orders"}
                >
                  Orders {gridOrders.length ? (gridOrdersOpen ? "▲" : "▼") : ""}
                </button>
                <span className="pill silver">{gridOrders.length} orders</span>
              </div>

              {gridOrders.length ? (
                gridOrdersOpen ? (
                  <div className="ordersList" style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4, display: "grid", gap: 10 }}>
                    {gridOrdersGroupedByChain.map(([chainKey, chainOrders]) => {
                      const totalExposure = chainOrders.reduce((sum, o) => sum + orderNotionalUsd(o), 0);
                      const isExpanded = !!gridOrderChainOpen[chainKey];
                      const visibleOrders = isExpanded ? chainOrders : chainOrders.slice(0, 2);
                      const hiddenCount = Math.max(0, chainOrders.length - visibleOrders.length);

                      return (
                        <div
                          key={chainKey}
                          style={{
                            border: "1px solid rgba(255,255,255,.06)",
                            borderRadius: 12,
                            padding: "10px 12px",
                            background: "rgba(255,255,255,.03)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span className="pill silver">{chainKey}</span>
                              <span className="muted tiny">{chainOrders.length} open</span>
                              <span className="muted tiny">Exposure {fmtUsd(totalExposure)}</span>
                            </div>
                            {chainOrders.length > 2 ? (
                              <button
                                type="button"
                                className="btnGhost"
                                onClick={() => setGridOrderChainOpen((prev) => ({ ...prev, [chainKey]: !prev?.[chainKey] }))}
                                style={{ height: 30, paddingInline: 10, fontSize: 12 }}
                              >
                                {isExpanded ? "Show less" : `+${chainOrders.length - 2} more`}
                              </button>
                            ) : null}
                          </div>

                          <div style={{ display: "grid", gap: 8 }}>
                            {visibleOrders.map((o) => {
                              const currentPrice = Number(shownGridPrice || 0);
                              let estProfit = null;
                              if (Number.isFinite(currentPrice) && currentPrice > 0) {
                                if (String(o?.side || "").toUpperCase() === "BUY") estProfit = (currentPrice - Number(o?.price || 0)) * Number(o?.qty || 0);
                                else if (String(o?.side || "").toUpperCase() === "SELL") estProfit = (Number(o?.price || 0) - currentPrice) * Number(o?.qty || 0);
                              }
                              const profitColor = estProfit == null ? "rgba(232,242,240,.7)" : (estProfit >= 0 ? "#39d98a" : "#ff6b6b");
                              const profitText = estProfit == null ? "" : `${estProfit >= 0 ? "+" : ""}${Math.abs(estProfit).toFixed(4)} $`;
                              const payout = inferOrderPayoutAsset(o);
                              const statusTxt = inferOrderStatus(o);

                              const investedUsd = Number(
                                o?.investedUsd ??
                                o?.invested_usd ??
                                o?.invested ??
                                o?.cost_basis ??
                                ((Number(o?.qty || 0) || 0) * (Number(o?.price || 0) || 0))
                              ) || 0;
                              const atTargetUsd = Number(
                                o?.targetValue ??
                                o?.target_value ??
                                o?.expectedOutUsd ??
                                o?.expected_out_usd ??
                                o?.expectedPayoutUsd ??
                                o?.expected_payout_usd ??
                                ((Number(o?.qty || 0) || 0) * (Number(o?.price || 0) || 0))
                              ) || 0;

                              return (
                                <div
                                  key={idOf(o) || `${chainKey}-${o.side}-${o.price}-${o.created_ts}`}
                                  className="orderRow"
                                  style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0, flex: "1 1 460px", fontSize: 11 }}>
                                      <span className={`pill ${o.side === "BUY" ? "good" : "bad"}`} style={{ fontSize: 10, padding: "4px 7px" }}>{o.side}</span>
                                      <span className="orderPx" style={{ whiteSpace: "nowrap", fontSize: 11 }}>{fmtUsd(Number(o?.price || 0))}</span>
                                      <span className="muted" style={{ whiteSpace: "nowrap", fontSize: 11 }}>{o?.qty ? `qty ${fmtQty(Number(o.qty), 4)}` : ""}</span>
                                      <span className="pill silver" style={{ fontSize: 10, padding: "4px 7px" }}>{statusTxt}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>Payout:</b> {payout}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>Inv:</b> {fmtUsd(investedUsd)}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>At target:</b> {fmtUsd(atTargetUsd)}</span>
                                      {profitText ? (
                                        <span style={{ color: profitColor, fontWeight: 800, whiteSpace: "nowrap", fontSize: 11 }}>{profitText}</span>
                                      ) : null}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flex: "0 0 auto" }}>
                                      <button
                                        type="button"
                                        className="btn ghost"
                                        style={{ height: 26, paddingInline: 9, fontSize: 11 }}
                                        disabled={!idOf(o) || !["OPEN","PAUSED"].includes(statusTxt) || gridBusy.stopOrderId === String(idOf(o))}
                                        onClick={() => (statusTxt === "PAUSED" ? resumeGridOrder(idOf(o)) : stopGridOrder(idOf(o)))}
                                        title={statusTxt === "PAUSED" ? "Resume this paused order." : "Pause this order without deleting it."}
                                      >
                                        {gridBusy.stopOrderId === String(idOf(o)) ? (statusTxt === "PAUSED" ? "Resuming..." : "Pausing...") : (statusTxt === "PAUSED" ? "Resume" : "Stop")}
                                      </button>
                                      <button
                                        type="button"
                                        className="btn ghost"
                                        style={{ height: 26, paddingInline: 9, fontSize: 11 }}
                                        disabled={!idOf(o) || gridBusy.deleteOrderId === String(idOf(o))}
                                        onClick={() => deleteGridOrder(idOf(o))}
                                        title="Delete this order from DB (only if backend supports it)."
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {hiddenCount > 0 ? (
                            <div className="muted tiny" style={{ marginTop: 8 }}>+{hiddenCount} more hidden in this chain</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="muted tiny" style={{ marginTop: 8 }}>Orders hidden. Tap Orders to open.</div>
                )
              ) : (
                <div className="muted">No orders yet. Press Start then Add Order.</div>
              )}
            </div>
            </div>
          </div></div>
        </section>

        {/* Watchlist */}
        <section className={`card section-watch dashboardPanel ${activePanel === "watchlist" ? "panelActive" : ""}`} onClick={handlePanelActivate("watchlist")}>
          <div className="cardHead">
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", minWidth: 0 }}>
                    <div className="cardTitle">Watchlist</div>
                    <div
                      className="muted tiny"
                      title={"Market Condition based on Overextension (OE) + Relative Volume (RVOL)\nB = Breakout: volume confirms the move\nW = Weak: move is not volume-confirmed\nE = Early: volume builds before strong price extension\nH = Hot: strongly overextended\nN = Normal: no strong anomaly"}
                      style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10, lineHeight: 1.1, whiteSpace: "nowrap" }}
                    >
                      <span style={{ color: "#16c784", fontWeight: 800 }}>B</span><span>Breakout</span>
                      <span style={{ color: "#ea3943", fontWeight: 800 }}>W</span><span>Weak</span>
                      <span style={{ color: "#f5b300", fontWeight: 800 }}>E</span><span>Early</span>
                      <span style={{ color: "#ff8a3d", fontWeight: 800 }}>H</span><span>Hot</span>
                      <span style={{ color: "var(--muted)", fontWeight: 800 }}>N</span><span>Normal</span>
                    </div>
                  </div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <button className="btn" onClick={() => setAddOpen(true)}>+ Add</button>
              <button
                type="button"
                className={String(watchSortMode || "manual") === "winner" ? "btn" : "btnGhost"}
                onClick={() => toggleWatchSort("winner")}
                title="Sort watchlist by strongest 24h gain. Click again to return to manual order."
              >
                Winner
              </button>
              <button
                type="button"
                className={String(watchSortMode || "manual") === "loser" ? "btn" : "btnGhost"}
                onClick={() => toggleWatchSort("loser")}
                title="Sort watchlist by strongest 24h loss. Click again to return to manual order."
              >
                Loser
              </button>
              <InfoButton title="Watchlist">
                <Help showClose dismissable
                  de={
                    <>
                      <div style={{ marginBottom: 14, padding: 12, border: "1px solid rgba(34,197,94,.35)", borderRadius: 14, background: "rgba(34,197,94,.06)" }}>
                        <p style={{ marginTop: 0 }}><b>Symbol-Legende / Watchlist Signals</b></p>
                        <p><b>B</b> = Breakout · starke Bewegung / Momentum</p>
                        <p><b>W</b> = Weak · schwaches Asset</p>
                        <p><b>E</b> = Early · frühe mögliche Bewegung</p>
                        <p><b>H</b> = Hot · hohe Aktivität / starkes Volumen</p>
                        <p><b>N</b> = Normal · keine besondere Marktsituation</p>
                        <p><b>NEWS</b> = echte Whale-Aktivität.</p>
                        <p style={{ marginLeft: 10 }}>Wenn <b>NEWS</b> erscheint, war ein echter Whale aktiv. Das kann ein <b>Kauf</b> oder <b>Verkauf</b> sein.</p>
                        <p style={{ marginLeft: 10 }}>Du kannst den <b>NEWS-Text anklicken</b>. Dann öffnet sich das Whale-Fenster mit: <b>Buy/Sell</b>, Betrag in USD, DEX, Zeit, Wallet und falls vorhanden Transaktion.</p>
                        <p style={{ marginLeft: 10 }}>Grün = Whale Buy, Rot = Whale Sell. Keine NEWS bedeutet: keine bestätigte Whale-Aktivität.</p>
                        <p><b>🔥</b> = kein klares Whale-Signal / normale Aktivität.</p>
                        <p><b>Farben:</b> Grün = positiv, Rot = negativ, Gelb = neutral/früh.</p>
                      </div>

                      <p><b>Compare</b> Checkbox steuert die Compare-Auswahl (max 20).</p>
                      <p><b>Drag & Drop</b> über den Griff links ändert die Reihenfolge. Diese Reihenfolge wird mit deiner Wallet auf dem Server gespeichert.</p>
                      <p><b>Market</b> ist ein Coin über CoinGecko-ID. <b>Token</b> ist ein DEX-Asset und braucht eine Contract-Address.</p>
                    </>
                  }
                  en={
                    <>
                      <div style={{ marginBottom: 14, padding: 12, border: "1px solid rgba(34,197,94,.35)", borderRadius: 14, background: "rgba(34,197,94,.06)" }}>
                        <p style={{ marginTop: 0 }}><b>Symbol Legend / Watchlist Signals</b></p>
                        <p><b>B</b> = Breakout · strong movement / momentum</p>
                        <p><b>W</b> = Weak · weak asset</p>
                        <p><b>E</b> = Early · early potential move</p>
                        <p><b>H</b> = Hot · high activity / strong volume</p>
                        <p><b>N</b> = Normal · no special market condition</p>
                        <p><b>NEWS</b> = real whale activity.</p>
                        <p style={{ marginLeft: 10 }}>When <b>NEWS</b> appears, a real whale was active. It can be a <b>buy</b> or a <b>sell</b>.</p>
                        <p style={{ marginLeft: 10 }}>You can <b>click the NEWS text</b>. This opens the whale window with: <b>Buy/Sell</b>, USD amount, DEX, time, wallet and transaction if available.</p>
                        <p style={{ marginLeft: 10 }}>Green = whale buy, red = whale sell. No NEWS means: no confirmed whale activity.</p>
                        <p><b>🔥</b> = no clear whale signal / normal activity.</p>
                        <p><b>Colors:</b> Green = positive, Red = negative, Yellow = neutral/early.</p>
                      </div>

                      <p><b>Compare</b> checkbox controls the compare set (max 20).</p>
                      <p><b>Drag & Drop</b> using the handle on the left changes the order. This order is saved on the server for your wallet.</p>
                      <p><b>Market</b> is a coin via CoinGecko ID. <b>Token</b> is a DEX asset and needs a contract address.</p>
                    </>
                  }
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="watchTable">
            {!isWatchSidebarCompact ? (
              <>
                <div
                  className="watchHead watchStickyHead"
                  style={{
                    gridTemplateColumns: "34px minmax(74px,.75fr) 68px minmax(120px,1.15fr) minmax(130px,1.25fr) minmax(150px,1.35fr) minmax(84px,.8fr) 150px 32px",
                    gap: 8,
                  }}
                >
                  <div className="center" style={{ textAlign: "center" }}>#</div>
                  <div style={{ paddingLeft: 2 }}>Coin</div>
                  <div className="right">%</div>
                  <div className="right">Price</div>
                  <div className="right">24h Vol</div>
                  <div className="right">Market Cap</div>
                  <div className="center" style={{ textAlign: "center" }}>7D Chart</div>
                  <div className="center" style={{ textAlign: "center" }}>Signals</div>
                  <div className="right"> </div>
                </div>

                <div className="watchScroll">
                  {sortedWatchRows.map((r, idx) => {
                    const sym = String(r.symbol || "").toUpperCase();
                    const checked = compareSymbols.includes(sym);
                    const marketCap = r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap ?? null;
                    const onchain = onchainBySymbol?.[sym];
                    const marketCondition = marketConditionBySymbol?.[sym];
                    const mcUi = marketConditionUi(marketCondition?.state);
                    const mcTitle = `${mcUi.code} (${mcUi.code})\n${mcUi.help}\nOE: ${marketCondition?.oe_pct ?? "n/a"}% · RVOL: ${marketCondition?.rvol ?? "n/a"}x${marketCondition?.ai_context?.interpretation ? `\n\n${marketCondition.ai_context.interpretation}` : ""}`;
                    const sysRating = watchFinalRating(r, ratingSummaryBySymbol?.[sym], onchain);
                                        const onchainIcon = String(onchain?.icon || "");
                    const onchainTitle = String(onchain?.summary || onchain?.label || "On-chain signal");
                    const whaleSignal = getWhaleNewsSignal(onchain);
                    return (
                      <div
                        key={`${sym}-${idx}`}
                        className="watchRow"
                        draggable={String(watchSortMode || "manual") === "manual"}
						onMouseEnter={(e) => {
                          if (watchDropKey !== _watchKeyFromRow(r)) {
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }
                        }}

                        onMouseLeave={(e) => {
                          if (watchDropKey !== _watchKeyFromRow(r)) {
                            e.currentTarget.style.background =
                              idx % 2 === 1 ? "rgba(255,255,255,0.055)" : "transparent";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "none";
                         }
                       }}  
                        onDragStart={() => { if (String(watchSortMode || "manual") === "manual") handleWatchDragStart(r); }}
                        onDragOver={(e) => { if (String(watchSortMode || "manual") === "manual") handleWatchDragOver(e, r); }}
                        onDrop={(e) => { if (String(watchSortMode || "manual") === "manual") handleWatchDrop(e, r); }}
                        onDragEnd={handleWatchDragEnd}
                        style={{
                          cursor: String(watchSortMode || "manual") === "manual" ? "grab" : "default",
                          border: watchDropKey === _watchKeyFromRow(r) ? "1px dashed var(--line)" : undefined,
                          background: watchDropKey === _watchKeyFromRow(r) ? "rgba(255,255,255,0.04)": (idx % 2 === 1 ? "rgba(255,255,255,0.055)" : "transparent"),
						  transition: "all 0.15s ease",
						  gridTemplateColumns: "34px minmax(74px,.75fr) 68px minmax(120px,1.15fr) minmax(130px,1.25fr) minmax(150px,1.35fr) minmax(84px,.8fr) 150px 32px",
                          gap: 8,
                          alignItems: "center",
                          minHeight: 54,
                        }}
                      >
                        <div
                          className="mono"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            opacity: 0.62,
                            fontSize: 11,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="watchCoin" style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", minWidth: 0, whiteSpace: "nowrap" }}>
                            <div className="watchSym" style={{ fontSize: 13, lineHeight: 1.1, fontWeight: 800 }}>{sym}</div>
                          </div>
                        </div>
                        <div className={`right mono ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 13, lineHeight: 1.1, color: Number(r.change24h) >= 0 ? "var(--green)" : "var(--red)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtPct(r.change24h)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 13, lineHeight: 1.1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtUsd(r.price)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 12, lineHeight: 1.1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{isCompactWatchNumbers ? fmtCompactUsd(r.volume24h) : fmtUsd(r.volume24h)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 12, lineHeight: 1.1, paddingRight: 2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{marketCap != null ? (isCompactWatchNumbers ? fmtCompactUsd(marketCap) : fmtUsd(marketCap)) : "—"}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <InlineWatchSpark
                            sym={sym}
                            row={r}
                            idx={idx}
                            seriesMap={compareSeries}
                            colorForSym={colorForSym}
                            lineClassForSym={lineClassForSym}
                          />
                        </div>
                        <div
                          className="watchSignals"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 5,
                            minWidth: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCompare(sym)}
                            disabled={!checked && compareSymbols.length >= 20}
                            title="Compare"
                            style={{ transform: "scale(0.9)", marginRight: 2 }}
                          />
                          <button
                            type="button"
                            className="pill silver"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRatingModal(r); }}
                            title={`System Rating ${sysRating} · click to rate ${sym}`}
                            style={{ width: 34, minWidth: 34, maxWidth: 34, padding: "2px 0", fontSize: 10, lineHeight: 1.1, cursor: "pointer", textAlign: "center", justifyContent: "center" }}
                          >
                            {sysRating}
                          </button>
                          <button
                            type="button"
                            className="pill silver"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRatingModal(r); }}
                            title={userRatingBySymbol?.[sym] ? `User Rating: ${userRatingBySymbol?.[sym]}` : `Add your rating for ${sym}`}
                            style={{ width: 26, minWidth: 26, maxWidth: 26, padding: "2px 0", fontSize: 9, lineHeight: 1.1, cursor: "pointer", textAlign: "center", justifyContent: "center" }}
                          >
                            {userRatingBySymbol?.[sym] || "-"}
                          </button>
                          {whaleSignal.type !== "neutral" ? (
                            <button
                              type="button"
                              className="pill silver"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const realWhale = onchain?.whale && typeof onchain.whale === "object" ? onchain.whale : onchain;
                                setActiveWhaleNews({
                                  symbol: sym,
                                  type: whaleSignal.type,
                                  title: whaleSignal.title,
                                  summary: realWhale?.summary || onchainTitle,
                                  amountUsd: realWhale?.amountUsd ?? realWhale?.latest?.amountUsd ?? null,
                                  buyUsd: realWhale?.buyUsd ?? null,
                                  sellUsd: realWhale?.sellUsd ?? null,
                                  dex: realWhale?.latest?.dex ?? realWhale?.dex ?? null,
                                  time: realWhale?.latest?.time ?? realWhale?.time ?? null,
                                });
                              }}
                              title={`${whaleSignal.title} · click for details`}
                              style={{
                                width: 36,
                                minWidth: 36,
                                maxWidth: 36,
                                padding: "2px 0",
                                fontSize: 8.5,
                                lineHeight: 1.1,
                                cursor: "pointer",
                                justifyContent: "center",
                                textAlign: "center",
                                fontWeight: 900,
                                color: whaleSignal.color,
                                borderColor: "rgba(255,255,255,.16)",
                                background: "rgba(255,255,255,.035)",
                              }}
                            >
                              NEWS
                            </button>
                          ) : onchainIcon ? (
                            <span
                              className="pill silver"
                              title={onchainTitle}
                              style={{
                                width: 18,
                                minWidth: 18,
                                maxWidth: 18,
                                padding: "2px 0",
                                fontSize: 10,
                                lineHeight: 1.1,
                                justifyContent: "center",
                                textAlign: "center",
                              }}
                            >
                              {onchainIcon || "🔥"}
                            </span>
                          ) : (
                            <span className="pill silver" title="No fresh whale activity" style={{ width: 18, minWidth: 18, maxWidth: 18, padding: "2px 0", fontSize: 10, lineHeight: 1.1, justifyContent: "center", textAlign: "center" }}>
                              🔥
                            </span>
                          )}
                          <span className="pill silver" title={mcTitle} style={{ width: 20, minWidth: 20, maxWidth: 20, padding: "2px 0", justifyContent: "center", textAlign: "center", fontSize: 9, lineHeight: 1.1, fontWeight: 900, color: mcUi.color, borderColor: mcUi.border }}>
                            {mcUi.code}
                          </span>
                        </div>
                        <div className="right" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minWidth: 0 }}>
                          <button
                            className="iconBtn"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 28,
                              minWidth: 28,
                              flex: "0 0 28px",
                              fontSize: 12,
                              lineHeight: 1,
                              margin: 0,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const mm = (r.mode || "market");
                              removeWatchItemByKey({
                                symbol: sym,
                                mode: mm,
                                tokenAddress: (mm === "dex" ? (r.contract || "") : ""),
                                contract: (mm === "dex" ? (r.contract || "") : ""),
                              });
                            }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {!sortedWatchRows.length ? <div className="muted" style={{ padding: 10 }}>No watchlist data yet.</div> : null}
                </div>
              </>
            ) : (
              <div className="watchCompact">
                {sortedWatchRows.map((r, idx) => {
                  const sym = String(r.symbol || "").toUpperCase();
                  const checked = compareSymbols.includes(sym);
                  const mm = (r.mode || "market");
                  const marketCondition = marketConditionBySymbol?.[sym];
                  const mcUi = marketConditionUi(marketCondition?.state);
                  const mcTitle = `${mcUi.code} (${mcUi.code})\n${mcUi.help}\nOE: ${marketCondition?.oe_pct ?? "n/a"}% · RVOL: ${marketCondition?.rvol ?? "n/a"}x${marketCondition?.ai_context?.interpretation ? `\n\n${marketCondition.ai_context.interpretation}` : ""}`;
                  const sysRating = watchFinalRating(r, ratingSummaryBySymbol?.[sym]);
                  return (
                    <div
                      key={`${sym}-${idx}`}
                      className="watchCompactCard"
                      draggable={String(watchSortMode || "manual") === "manual"}
                      onDragStart={() => { if (String(watchSortMode || "manual") === "manual") handleWatchDragStart(r); }}
                      onDragOver={(e) => { if (String(watchSortMode || "manual") === "manual") handleWatchDragOver(e, r); }}
                      onDrop={(e) => { if (String(watchSortMode || "manual") === "manual") handleWatchDrop(e, r); }}
                      onDragEnd={handleWatchDragEnd}
                      style={{
                        cursor: String(watchSortMode || "manual") === "manual" ? "grab" : "default",
                        border: watchDropKey === _watchKeyFromRow(r) ? "1px dashed var(--line)" : undefined,
                        background: watchDropKey === _watchKeyFromRow(r) ? "rgba(255,255,255,0.04)" : undefined,
                        gridTemplateColumns: "26px minmax(0,1fr) 132px 34px",
                        paddingRight: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCompare(sym)} disabled={!checked && compareSymbols.length >= 20} style={{ transform: "scale(0.9)" }} />
                      </div>
                      <div className="watchCompactMain">
                        <div className="watchCompactTop" style={{ gap: 6 }}>
                          <div className="watchCompactMeta" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                            <div className="watchSym" style={{ fontSize: 13, lineHeight: 1.1, fontWeight: 800 }}>{sym}</div>
                            <button
                              type="button"
                              className="pill silver"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRatingModal(r); }}
                              title={`System Rating ${sysRating} · click to rate ${sym}`}
                              style={{ padding: "2px 6px", fontSize: 10, lineHeight: 1.1, cursor: "pointer" }}
                            >
                              {sysRating}
                            </button>
                            <button
                              type="button"
                              className="pill silver"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openRatingModal(r); }}
                              title={userRatingBySymbol?.[sym] ? `User Rating: ${userRatingBySymbol?.[sym]}` : `Add your rating for ${sym}`}
                              style={{ padding: "2px 5px", fontSize: 10, lineHeight: 1.1, cursor: "pointer" }}
                            >
                              {userRatingBySymbol?.[sym] || "-"}
                            </button>
                            <span
                              className="pill silver"
                              title={mcTitle}
                              style={{ padding: "2px 5px", minWidth: 20, justifyContent: "center", textAlign: "center", fontSize: 10, lineHeight: 1.1, fontWeight: 900, color: mcUi.color, borderColor: mcUi.border }}
                            >
                              {mcUi.code}
                            </span>
                            <span className={`mono tiny ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`} style={{ fontSize: 12, lineHeight: 1.1, color: Number(r.change24h) >= 0 ? "var(--green)" : "var(--red)" }}>{fmtPct(r.change24h)}</span>
                          </div>
                        </div>
                        <div className="watchCompactStats" style={{ gap: 10 }}>
                          <span className="muted tiny" style={{ fontSize: 11, lineHeight: 1.1 }}>Vol {isCompactWatchNumbers ? fmtCompactUsd(r.volume24h) : fmtUsd(r.volume24h)}</span>
                          <span className="muted tiny" style={{ fontSize: 11, lineHeight: 1.1 }}>MCap {((r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) != null) ? (isCompactWatchNumbers ? fmtCompactUsd(r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) : fmtUsd(r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap)) : "—"}</span>
                        </div>
                      </div>
                      <div className="watchCompactPrice" style={{ display: "grid", gap: 4, alignItems: "center", minWidth: 0 }}>
                        <div className="mono" style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtUsd(r.price)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 34 }}>
                        <button
                          className="iconBtn"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            flex: "0 0 28px",
                            fontSize: 12,
                            lineHeight: 1,
                            margin: 0,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeWatchItemByKey({
                              symbol: sym,
                              mode: mm,
                              tokenAddress: (mm === "dex" ? (r.contract || "") : ""),
                              contract: (mm === "dex" ? (r.contract || "") : ""),
                            });
                          }}
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!sortedWatchRows.length ? <div className="muted" style={{ padding: 10 }}>No watchlist data yet.</div> : null}
              </div>
            )}
          </div>

          <div className="muted tiny"></div>
        </div></section>


        {activeWhaleNews && (
          <div className="modalBackdrop" onClick={() => setActiveWhaleNews(null)}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 380,
                width: "calc(100vw - 28px)",
                background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
              }}
            >
              <div className="modalHead">
                <div>
                  <div className="cardTitle">Whale Activity · {activeWhaleNews.symbol}</div>
                  <div
                    className="muted tiny"
                    style={{ color: activeWhaleNews.type === "buy" ? "#22c55e" : "#ef4444", fontWeight: 900 }}
                  >
                    {activeWhaleNews.type === "buy" ? "Whale BOUGHT recently" : "Whale SOLD recently"}
                  </div>
                </div>
                <button className="iconBtn" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveWhaleNews(null); }}>×</button>
              </div>

              <div className="softBox" style={{ padding: 12, marginTop: 12 }}>
                <div style={{ display: "grid", gap: 7, fontSize: 12, lineHeight: 1.45 }}>
                  <div>
                    <b>Amount:</b>{" "}
                    {Number(activeWhaleNews.amountUsd || 0) > 0
                      ? `$${Number(activeWhaleNews.amountUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : activeWhaleNews.type === "buy" && Number(activeWhaleNews.buyUsd || 0) > 0
                        ? `$${Number(activeWhaleNews.buyUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        : activeWhaleNews.type === "sell" && Number(activeWhaleNews.sellUsd || 0) > 0
                          ? `$${Number(activeWhaleNews.sellUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                          : "pending"}
                  </div>
                  <div>
                    <b>DEX:</b> {activeWhaleNews.dex || "pending"}
                  </div>
                  <div>
                    <b>Time:</b> {formatWhaleTimeAgo(activeWhaleNews.time)}
                  </div>
                  {activeWhaleNews.summary && (
                    <div className="muted tiny" style={{ marginTop: 4 }}>
                      {activeWhaleNews.summary}
                    </div>
                  )}
                </div>
              </div>

              <button type="button" className="btn" style={{ width: "100%", marginTop: 12 }} onClick={() => setActiveWhaleNews(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {ratingModal.open && (
          <div className="modalBackdrop" onClick={closeRatingModal}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 440,
                width: "calc(100vw - 28px)",
                background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
              }}
            >
              <div className="modalHead">
                <div>
                  <div className="cardTitle">Coin Rating · {ratingModal.symbol}</div>
                  <div className="muted tiny">
                    System Rating: <b>{ratingModal.systemRating}</b> · Score {ratingModal.systemScore}
                    <br />
                    User Rating: <b>{ratingStatus?.user_rating_today || ratingStatus?.last_user_rating || "-"}</b>
                  </div>
                </div>
                <button className="iconBtn" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeRatingModal(); }}>×</button>
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                <div className="softBox" style={{ padding: 12 }}>
                  <div className="muted tiny" style={{ marginBottom: 8 }}>
                    Your personal User Rating (not mixed with System Rating)
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "CC", "C", "RISK"].map((rt) => {
                      const chosen = String(ratingStatus?.user_rating_today || ratingStatus?.last_user_rating || "").toUpperCase() === rt;
                      return (
                        <button
                          key={rt}
                          type="button"
                          className={chosen ? "btn" : "btnGhost"}
                          disabled={ratingBusy}
                          onClick={() => submitUserRating(rt)}
                          title={`Set your rating for ${ratingModal.symbol} to ${rt}`}
                          style={{ minWidth: 62, justifyContent: "center" }}
                        >
                          {rt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="muted tiny" style={{ marginTop: 8 }}>
                    {(ratingStatus?.user_rating_today || ratingStatus?.last_user_rating)
                      ? `Your saved rating: ${ratingStatus?.user_rating_today || ratingStatus?.last_user_rating}`
                      : "No personal rating saved yet."}
                  </div>
                </div>

                {ratingErr && <div style={{ color: "#ffb3b3", fontSize: 12 }}>{ratingErr}</div>}

                {ratingStatus?.coin_info ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 6,
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div>
                        <div className="muted tiny">Coin</div>
                        <div style={{ fontWeight: 900 }}>
                          {ratingStatus?.coin_info?.name || ratingModal.symbol}
                          {ratingStatus?.coin_info?.coin_id ? (
                            <span className="muted tiny" style={{ marginLeft: 8 }}>
                              {ratingStatus.coin_info.coin_id}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className={ratingStatus?.link_enabled ? "btn" : "btnGhost"}
                          disabled={!ratingStatus?.link_enabled}
                          onClick={openRatingLink}
                          title={ratingStatus?.link_enabled ? "Open official coin page or CoinGecko fallback" : "No coin info link available yet"}
                        >
                          Coin Info
                        </button>
                        <button
                          type="button"
                          className={ratingStatus?.coin_info?.explorer ? "btn" : "btnGhost"}
                          disabled={!ratingStatus?.coin_info?.explorer}
                          onClick={openRatingExplorer}
                          title={ratingStatus?.coin_info?.explorer ? "Open blockchain explorer" : "No explorer link available yet"}
                        >
                          Explorer
                        </button>
                      </div>
                    </div>

                    <div className="muted tiny" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {ratingStatus?.coin_info?.homepage ? <span>Website ✓</span> : <span>Website fallback</span>}
                      {ratingStatus?.coin_info?.explorer ? <span>Explorer ✓</span> : <span>Explorer —</span>}
                      {ratingStatus?.coin_info?.source ? <span>Source: {ratingStatus.coin_info.source}</span> : null}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div className="muted tiny">
                      Community votes: {ratingStatus?.summary?.count ?? 0}
                    </div>
                    <button
                      type="button"
                      className={ratingStatus?.link_enabled ? "btn" : "btnGhost"}
                      disabled={!ratingStatus?.link_enabled}
                      onClick={openRatingLink}
                      title={ratingStatus?.link_enabled ? "Open coin info page" : "No coin info link available yet"}
                    >
                      Coin Info
                    </button>
                  </div>
                )}

                <div className="muted tiny">
                  Community votes: {ratingStatus?.summary?.count ?? 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI */}
        <section className={`card section-ai dashboardPanel ${activePanel === "ai" ? "panelActive" : ""}`} onClick={handlePanelActivate("ai")}>
          <div className="cardHead">
            <div className="cardTitle">AI Analyst</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <span className="pill silver">{aiSelected.length}/6 selected</span>
              <InfoButton title="AI Analyst">
                <Help showClose dismissable
                  de={<><p>Maximal <b>6 Coins</b> pro Analyse. Die Coins kommen aus deiner Compare-Auswahl.</p><p><b>AI Insight</b> kombiniert Marktstruktur, Rating, Community-Votes und On-Chain-Signale.</p><p><b>Kind</b> bestimmt den Analyse-Typ: Analysis, Risk oder Explain.</p><p><b>Profile</b> steuert den Stil der Antwort, z. B. konservativ, ausgewogen oder volatilitätsfokussiert.</p><p><b>Follow-up</b> hält den Kontext für Rückfragen im selben AI-Dialog.</p></>}
                  en={<><p>Maximum <b>6 coins</b> per analysis. Coins are taken from your compare selection.</p><p><b>AI Insight</b> combines market structure, rating, community votes, and on-chain signals.</p><p><b>Kind</b> sets the analysis type: Analysis, Risk, or Explain.</p><p><b>Profile</b> controls the answer style, for example conservative, balanced, or volatility-focused.</p><p><b>Follow-up</b> keeps context for follow-up questions inside the same AI dialog.</p></>}
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="aiWrap">
            <div className="aiSelect">
              <div className="label">Coins (from Compare)</div>
              <div className="aiChips">
                {aiOptions.map((s) => {
                  const on = aiSelected.includes(s);
                  return (
                    <button key={s} className={`chip ${on ? "active" : ""}`} onClick={() => toggleAi(s)} disabled={!on && aiSelected.length >= 6} title="Toggle AI selection">
                      {s}
                    </button>
                  );
                })}
                {!aiOptions.length ? <div className="muted">Select coins for Compare first.</div> : null}
              </div>

              <div className="divider" />

              <div className="formRow">
                <label>Kind</label>
                <select value={aiKind} onChange={(e) => setAiKind(e.target.value)}>
                  <option value="analysis">Analysis</option>
                  <option value="risk">Risk</option>
                  <option value="explain">Explain</option>
                </select>
              </div>

              <div className="formRow">
                <label>Profile</label>
                <select value={aiProfile} onChange={(e) => setAiProfile(e.target.value)}>
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="volatility">Volatility</option>
                </select>
              </div>
<div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label className="muted" style={{ display: "inline-flex", gap: 8, alignItems: "center", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={aiFollowUp}
                    onChange={(e) => {
                      const on = !!e.target.checked;
                      setAiFollowUp(on);
                      setAiQuestion("");
                      if (!on) setAiHistory([]);
                    }}
                  />
                  Follow-up
                </label>
                <button
                  className="btnGhost"
                  type="button"
                  onClick={() => {
                    setAiOutput("");
                    setAiQuestion("");
                    setAiHistory([]);
                    setErrorMsg("");
                  }}
                >
                  Clear
                </button>
              </div>

              {!isPro ? (
                <div className="hint" style={{ marginTop: 10, color: "rgba(255,255,255,0.75)" }}>
                  AI is available for <b>Nexus Pro</b> only. Subscribe to unlock.
                </div>
              ) : null}

              <button className="btn" onClick={runAi} disabled={aiLoading}>
                {aiLoading ? "Running…" : "Run"}
              </button>
            </div>

            <div className="aiOut">
              <div className="label">Output</div>
              <div className="aiPanel">{aiOutput ? <div className="aiText" style={{ whiteSpace: "pre-wrap" }}>{aiOutput}</div> : <div className="muted">No output yet.</div>}</div>

              {aiFollowUp ? (
                <div style={{ marginTop: 12 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Ask about this analysis</div>
                  <div className="formRow" style={{ marginBottom: 8 }}>
                    <input
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder={aiOutput ? "Ask something about this analysis..." : "Run the analysis first, then ask a follow-up..."}
                      disabled={!aiOutput || aiLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && aiQuestion.trim() && aiOutput && !aiLoading) {
                          e.preventDefault();
                          runAi();
                        }
                      }}
                    />
                  </div>
                  {aiQuestion.trim() ? (
                    <button className="btn" onClick={runAi} disabled={!aiOutput || aiLoading}>
                      {aiLoading ? "Asking…" : "Ask"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div></div>
        </section>
        </div>
      </main>

      {null}

      {/* Add modal */}

      {/* Wallet panel is rendered in the header (top-right dropdown). */}

            {addOpen && (
  <div className="modalBackdrop" onClick={resetAddModal}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modalHead">
        <div className="cardTitle">{addTab === "dex" ? "Add token (Contract)" : "Select token (CoinGecko)"}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <InfoButton title="Select token (CoinGecko)">
            <Help
              de={
                <>
                  <p>
                    Suche nach <b>Symbol</b> oder <b>Name</b> (z.B. <code>TON</code>, <code>BNB</code>). Bei gleichen Symbolen bitte den richtigen{" "}
                    <b>Namen/Rank</b> auswählen.
                  </p>
                  <p>
                    <b>Market (CEX)</b> nutzt CoinGecko-IDs und ist für normale Markt-Coins gedacht. <b>DEX (Contract)</b> fügt stattdessen einen Token per Contract-Adresse hinzu.
                  </p>
                  <p>
                    Wähle immer den exakten Eintrag, damit Preise, Updates und Watchlist-Daten korrekt bleiben.
                  </p>
                </>
              }
              en={
                <>
                  <p>
                    Search by <b>symbol</b> or <b>name</b> (e.g. <code>TON</code>, <code>BNB</code>). If there are multiple matches, pick the right{" "}
                    <b>name/rank</b>.
                  </p>
                  <p>
                    <b>Market (CEX)</b> uses CoinGecko IDs and is meant for normal market coins. <b>DEX (Contract)</b> instead adds a token by contract address.
                  </p>
                  <p>
                    Always choose the exact entry so prices, updates, and watchlist data stay correct.
                  </p>
                </>
              }
            />
          </InfoButton>
          <button className="iconBtn" onClick={resetAddModal} aria-label="Close">
            ×
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
	          className="btn"
	          style={{ opacity: addTab === "market" ? 1 : 0.7 }}
          onClick={() => setAddTab("market")}
          type="button"
        >
          Market (CEX)
        </button>
        <button
	          className="btn"
	          style={{ opacity: addTab === "dex" ? 1 : 0.7 }}
          onClick={() => setAddTab("dex")}
          type="button"
        >
          DEX (Contract)
        </button>
      </div>

      {addTab === "market" && (
        <>
          <div className="muted" style={{ marginTop: 10 }}>
            Search &mdash; pick the exact coin, so prices & updates are correct.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input
              className="input"
              placeholder="e.g. TON / BNB / Dogecoin"
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runMarketSearch();
              }}
            />
            <button className="btn" onClick={runMarketSearch} disabled={addSearching || !String(addQuery || "").trim()}>
              {addSearching ? "Searching..." : "Search"}
            </button>
          </div>

          {addSearchErr && !String(addSearchErr).toLowerCase().includes("aborted") ? (
            <div style={{ marginTop: 8, color: "#ffb4b4" }}>
              {addSearchErr}
            </div>
          ) : null}

          <div style={{ maxHeight: 360, overflow: "auto", marginTop: 10 }}>
            {(addResults || []).length === 0 &&
            !addSearching &&
            String(addQuery || "").trim() ? (
              <div className="muted" style={{ padding: 10 }}>
                No results yet. Try a different keyword.
              </div>
            ) : null}

            {(addResults || []).map((coin) => (
<div key={coin.id} className="watchRow" style={{ alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {coin.name} <span className="muted">({String(coin.symbol || "").toUpperCase()})</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    ID: <code>{coin.id}</code>
                    {coin.market_cap_rank != null ? <> &middot; Rank #{coin.market_cap_rank}</> : null}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
	                <button className="btn" onClick={() => addMarketCoin(coin)}>
                    Add
                  </button>
                </div>
              </div>
            
))}
          </div>
        </>
      )}

      {addTab === "dex" && (
        <>
          <div className="muted" style={{ marginTop: 10 }}>
            Add token by contract address (DEX). Backend must support resolving contract metadata.
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <div className="muted">Chain</div>
            <select value={"polygon"} disabled>
              <option value="polygon">Polygon</option>

            </select>

            <div className="muted">Contract</div>
            <input className="input" placeholder="0x..." value={addContract} onChange={(e) => setAddContract(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn" onClick={addDexToken} disabled={!String(addContract || "").trim()}>
              Add
            </button>
            <button className="btnGhost" onClick={resetAddModal}>
              Cancel
            </button>
          </div>
        
      <style>{`
        @media (min-width: 981px){
          .section-compare .liveListBox{
            max-height: clamp(260px, 34vh, 420px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .section-compare .pairsScroll{
            min-height: 0 !important;
            max-height: clamp(180px, 25vh, 300px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 6px;
            padding-bottom: 56px !important;
            scroll-padding-bottom: 56px !important;
          }
          .section-compare .liveListBox::-webkit-scrollbar,
          .section-compare .pairsScroll::-webkit-scrollbar{
            width: 10px;
          }
          .section-compare .liveListBox::-webkit-scrollbar-thumb,
          .section-compare .pairsScroll::-webkit-scrollbar-thumb{
            background: rgba(210,220,230,.22);
            border-radius: 999px;
            border: 2px solid rgba(0,0,0,.10);
          }
          .section-compare .liveListBox::-webkit-scrollbar-track,
          .section-compare .pairsScroll::-webkit-scrollbar-track{
            background: rgba(0,0,0,.10);
            border-radius: 999px;
          }
        }
      `}</style>
</>
      )}

      <div className="muted" style={{ marginTop: 10 }}>
        Tip: coins already cached on backend appear instantly; new ones may take a moment to fetch.
      </div>
    </div>
  </div>
)}
    </div>
  );
}
export default function App() {
  return <AppInner />;
}
