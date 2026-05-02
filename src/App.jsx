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

function InfoButton({ title = "Info", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      

            {/* External connect is EXPLICIT: only this button may open MetaMask */}
            
                      
              
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
