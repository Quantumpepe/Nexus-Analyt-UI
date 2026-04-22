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

function buildCompactAiInsight({ backendText = "", trendStructure = "", momentumShift = "", insightSummary = "" }) {
  const splitSentences = (value) =>
    String(value || "")
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map(_cleanAiInsightSentence)
      .filter(Boolean);

  const backendSentences = splitSentences(backendText)
    .filter((s) => s.length >= 20)
    .slice(0, 3);

  if (backendSentences.length >= 2) {
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

  return unique.slice(0, 3).join(" ") || "The current structure is mixed and does not show a fully clear edge yet.";
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

async function api(
  path,
  { method = "GET", token, body, signal, wallet } = {}
) {
  // Always send the wallet context (backend binds sessions to wallet).
  let wa = "";
  try {
    wa =
      (wallet || "").trim() ||
      (localStorage.getItem("nexus_wallet") || "").trim() ||
      (localStorage.getItem("wallet") || "").trim() ||
      "";
  } catch {}

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
      path?.includes("/api/access/redeem") ? 60000 : method === "GET" ? 15000 : 60000;

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
      return await fetch(`${API_BASE}${path}`, {
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
      <button className="infoBtn" onClick={() => setOpen(true)} title={title} aria-label={title}>
        i
      </button>

      {open && (
        <div className="modalBackdrop" onClick={() => setOpen(false)}>
          <div
            className="modal modalHelp"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
            }}
          >
            <div className="modalHead">
              <div className="cardTitle">{title}</div>
              <button className="iconBtn" type="button" style={{ pointerEvents: "auto" }} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}>
                ×
              </button>
            </div>
            <div className="helpBody">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ------------------------
// Health color (ampel)
// ------------------------
function bandFromScore(score) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return "na";
  const s = Number(score);
  if (s >= 71) return "good";
  if (s >= 51) return "mid";
  return "bad";
}
function bandFromSnapshot(row) {
  const ch = Number(row?.change24h);
  const vol = Number(row?.volume24h);
  if (!Number.isFinite(ch) && !Number.isFinite(vol)) return "na";
  if (Number.isFinite(ch) && ch <= -4) return "bad";
  if (Number.isFinite(ch) && ch >= 3) return "good";
  if (Number.isFinite(vol) && vol > 0) return "mid";
  return "mid";
}

// ------------------------
// Timeframes UI
// ------------------------
const TIMEFRAMES = [
  { key: "1D", label: "1D" },
  { key: "7D", label: "7D" },
  { key: "30D", label: "30D" },
  { key: "90D", label: "90D" },
  { key: "1Y", label: "1Y" },
  { key: "2Y", label: "2Y" },
];

// ------------------------
// Compare batching
// ------------------------
function mergeCompareBatches(batches) {
  const merged = { series: {}, health: {}, symbols: [] };
  for (const b of batches) {
    const syms = b?.symbols || [];
    for (const s of syms) {
      if (!merged.symbols.includes(s)) merged.symbols.push(s);
    }
    const series = b?.series || {};
    for (const [sym, pts] of Object.entries(series)) merged.series[sym] = pts;
    const health = b?.health || {};
    for (const [sym, h] of Object.entries(health)) merged.health[sym] = h;
  }
  return merged;
}

// Normalize backend series to UI format: {SYM: [{t, v}, ...]}
function normalizeBackendSeries(seriesLike) {
  const out = {};
  for (const [sym, pts] of Object.entries(seriesLike || {})) {
    if (!Array.isArray(pts)) {
      out[sym] = [];
      continue;
    }
    // backend often returns [[ts_ms, price], ...]
    if (pts.length && Array.isArray(pts[0])) {
      out[sym] = pts
        .map((p) => ({ t: Number(p?.[0] ?? 0), v: Number(p?.[1] ?? 0) }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t > 0);
      continue;
    }
    // backend may return objects already
    out[sym] = pts
      .map((p) => ({
        t: Number(p?.t ?? p?.time ?? p?.x ?? 0),
        v: Number(p?.v ?? p?.p ?? p?.y ?? 0),
      }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t > 0);
  }
  return out;
}

function _tfDays(tf) {
  const k = String(tf || "").toUpperCase();
  if (k === "1D") return 1;
  if (k === "7D") return 7;
  if (k === "30D") return 30;
  if (k === "90D") return 90;
  if (k === "1Y") return 365;
  return null; // e.g. 2Y handled separately
}

// Slice a full-series dict {SYM:[{t,v}...]} into the selected view timeframe.
// Uses per-series max timestamp as anchor (so it works even if coins have different ranges).
function sliceCompareSeries(full, timeframe) {
  const tf = String(timeframe || "90D").toUpperCase();
  if (!full || typeof full !== "object") return {};
  if (tf === "2Y" || tf === "1Y") return full;
  const days = _tfDays(tf);
  if (!days) return full;
  const windowMs = days * 24 * 60 * 60 * 1000;
  const out = {};
  for (const [sym, pts] of Object.entries(full)) {
    if (!Array.isArray(pts) || pts.length === 0) { out[sym] = []; continue; }
    const maxT = Number(pts[pts.length - 1]?.t ?? pts[pts.length - 1]?.[0] ?? 0);
    const cutoff = maxT ? (maxT - windowMs) : 0;
    out[sym] = pts.filter((p) => Number(p?.t ?? p?.[0] ?? 0) >= cutoff);
  }
  return out;
}

function _compareFetchRange(timeframe) {
  const tf = String(timeframe || "90D").toUpperCase();
  if (tf === "2Y") return "2Y";
  if (tf === "1D") return "1D"; // keep intraday fidelity
  return "1Y"; // fetch once, slice for 7D/30D/90D/1Y views
}

function _extractExplicitTfFromQuestion(q) {
  const s = String(q || "").toLowerCase();
  if (!s) return null;

  const patterns = [
    ["2Y", [/\b2\s*(year|years|yr|yrs|jahre|jahr|jahren)\b/i, /\btwo\s+years\b/i]],
    ["1Y", [/\b1\s*(year|years|yr|yrs|jahr|jahre|jahren)\b/i, /\bone\s+year\b/i]],
    ["90D", [/\b90\s*(day|days|tage|tagen)\b/i]],
    ["30D", [/\b30\s*(day|days|tage|tagen)\b/i]],
    ["7D", [/\b7\s*(day|days|tage|tagen)\b/i, /\b1\s*(week|weeks|woche|wochen)\b/i]],
    ["1D", [/\b1\s*(day|days|tag|tage)\b/i, /\b24\s*h\b/i, /\b24\s*hours?\b/i]],
  ];
  for (const [tf, regs] of patterns) {
    if (regs.some((rx) => rx.test(s))) return tf;
  }
  return null;
}

function _seriesStatsFromSeriesMap(seriesMap, syms) {
  const out = {};
  const statsForPts = (pts) => {
    const vals = (Array.isArray(pts) ? pts : [])
      .map((p) => (p && Number.isFinite(p.v) ? p.v : null))
      .filter((v) => v != null);
    if (vals.length < 2) return null;

    const first = vals[0];
    const last = vals[vals.length - 1];
    const changePct = first !== 0 ? ((last / first) - 1) * 100 : null;

    const rets = [];
    for (let i = 1; i < vals.length; i++) {
      const a = vals[i - 1], b = vals[i];
      if (a && b && a !== 0) rets.push((b / a) - 1);
    }
    const mean = rets.length ? rets.reduce((s, x) => s + x, 0) / rets.length : 0;
    const variance = rets.length ? rets.reduce((s, x) => s + (x - mean) ** 2, 0) / rets.length : 0;
    const volPct = Math.sqrt(variance) * 100;

    let peak = vals[0];
    let maxDD = 0;
    for (const v of vals) {
      if (v > peak) peak = v;
      const dd = peak ? (v / peak) - 1 : 0;
      if (dd < maxDD) maxDD = dd;
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    return { first, last, changePct, volPct, maxDDPct: maxDD * 100, min, max, points: vals.length };
  };

  for (const s of (syms || [])) {
    const pts = ((seriesMap && seriesMap[s]) || []).slice().sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
    const stats = statsForPts(pts);
    if (stats) out[s] = stats;
  }
  return out;
}

function _buildInsightWindows(compareSeries, syms) {
  const windows = ["7D", "30D", "90D", "1Y"];
  const out = {};
  for (const tf of windows) {
    const sliced = sliceCompareSeries(compareSeries || {}, tf);
    const stats = _seriesStatsFromSeriesMap(sliced, syms);
    if (Object.keys(stats).length) out[tf] = stats;
  }
  return out;
}

function buildUnifiedChart(seriesBySym) {
  const syms = Object.keys(seriesBySym || {});
  if (!syms.length) return { x: [], lines: {}, order: [] };

  const tsSet = new Set();
  for (const sym of syms) {
    const pts = seriesBySym[sym] || [];
    for (const p of pts) if (p && typeof p.t === "number") tsSet.add(p.t);
  }
  const x = Array.from(tsSet).sort((a, b) => a - b);
  if (!x.length) return { x: [], lines: {}, order: [] };

  const lines = {};
  for (const sym of syms) {
    const pts = (seriesBySym[sym] || []).slice().sort((a, b) => a.t - b.t);
    let i = 0;
    let last = null;
    const arr = [];
    for (const t of x) {
      while (i < pts.length && pts[i].t <= t) {
        last = pts[i].v;
        i += 1;
      }
      arr.push(last);
    }
    lines[sym] = arr;
  }

  return { x, lines, order: syms.slice() };
}

function normalizeToIndex(lines) {
  const out = {};
  for (const [sym, arr] of Object.entries(lines || {})) {
    let base = null;
    for (const v of arr) {
      if (v !== null && v !== undefined && Number.isFinite(v)) {
        base = v;
        break;
      }
    }
    if (!Number.isFinite(base) || base === 0) {
      out[sym] = arr.map(() => null);
      continue;
    }
    out[sym] = arr.map((v) => {
      if (v === null || v === undefined || !Number.isFinite(v)) return null;
      return (v / base) * 100.0;
    });
  }
  return out;
}

function formatXAxisLabel(t, timeframe) {
  const d = new Date(t);
  const tf = String(timeframe || "").toUpperCase();
  if (tf === "1D") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  if (tf === "2Y") {
    // Month labels with year (makes the long range obvious)
    return d.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
  }
  if (tf === "1Y") {
    return d.toLocaleDateString("de-DE", { month: "short", year: "numeric" });
  }
  return d.toLocaleDateString("de-DE", { month: "2-digit", day: "2-digit" });
}

function _monthStartTs(ms) {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

function buildMonthlyTicks(tMin, tMax) {
  const a = _monthStartTs(tMin);
  const b = _monthStartTs(tMax);
  const out = [];
  let d = new Date(a);
  const end = new Date(b);
  // include start..end inclusive
  while (d <= end) {
    out.push(d.getTime());
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  // If we somehow end up with no ticks, fall back.
  return out.length ? out : [tMin, tMax];
}

// ------------------------
// SVG chart with y-scale + x labels
// ------------------------
function SvgChart({ chart, height = 320, highlightedSyms = [], onHoverSym, indexMode, timeframe, colorForSym, lineClassForSym }) {
  const { x, lines, order } = chart || { x: [], lines: {}, order: [] };
  const syms = order?.length ? order : Object.keys(lines || {});

  if (!x?.length || !syms.length) {
    return (
      <div className="chartEmpty" style={{ height }}>
        <div className="muted">No chart data yet.</div>
      </div>
    );
  }

    const plotLines = indexMode ? normalizeToIndex(lines) : lines;

  // Hover: show crosshair + tooltip for ALL series (like finanzen.net)
  const [hoverIdx, setHoverIdx] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 }); // position in actual CSS pixels inside the chart overlay
  const [tooltipSize, setTooltipSize] = useState({ w: 220, h: 0 });
  const tooltipRef = useRef(null);

  const n = x.length;
  const clampIdx = (i) => Math.max(0, Math.min(i, n - 1));

  const fmtDeltaPct = (idxVal) => {
    if (idxVal === null || idxVal === undefined || !Number.isFinite(idxVal)) return "—";
    const d = idxVal - 100.0;
    const s = d >= 0 ? "+" : "";
    return `${s}${d.toFixed(2)} %`;
  };

  const fmtHoverVal = (sym) => {
    if (indexMode) return fmtDeltaPct(plotLines?.[sym]?.[hoverIdx]);
    const v = lines?.[sym]?.[hoverIdx];
    if (v === null || v === undefined || !Number.isFinite(v)) return "—";
    return fmtUsd(v);
  };

  const hoverDate = (t) => {
    try {
      const d = new Date(t);
      // show full date for longer ranges; time for 1D
      if (timeframe === "1D") {
        return d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
      return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return String(t);
    }
  };

  useEffect(() => {
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setTooltipSize((prev) => {
      if (prev.w === rect.width && prev.h === rect.height) return prev;
      return { w: rect.width, h: rect.height };
    });
  }, [hoverIdx, syms.length, indexMode, timeframe, highlightedSyms]);

    // Overlay + Price: use log scale so vastly different price magnitudes remain readable (BTC vs small coins).
    // Index 100 stays linear (already normalized).
    const logMode = !indexMode && syms.length > 1;
    const EPS = 1e-12;
    const tVal = (v) => (logMode ? Math.log10(Math.max(EPS, v)) : v);
    const invTVal = (tv) => (logMode ? Math.pow(10, tv) : tv);

    let min = Infinity,
      max = -Infinity;
    for (const sym of syms) {
      for (const v0 of plotLines[sym] || []) {
        if (v0 === null || v0 === undefined) continue;
        if (!Number.isFinite(v0)) continue;
        const tv = tVal(v0);
        if (!Number.isFinite(tv)) continue;
        min = Math.min(min, tv);
        max = Math.max(max, tv);
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
      // safe fallback for empty/flat charts
      min = logMode ? 0 : 0.8;
      max = logMode ? 1 : 1.2;
    }

    const w = 1000;
    const h = height;
    const padL = 70;
    const padR = 12;
    const padT = 12;
    const padB = 34;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;

    const sx = (i) => padL + (i * innerW) / Math.max(1, x.length - 1);

    const syTV = (tv) => {
      const t = (tv - min) / (max - min);
      return padT + (1 - t) * innerH;
    };
    const sy = (v) => syTV(tVal(v));
    const GRID_TICKS = 6;
    const ticksTV = Array.from({ length: GRID_TICKS }, (_, i) => min + ((max - min) * i) / (GRID_TICKS - 1));
const tMin = x[0];
    const tMid = x[Math.floor(x.length / 2)];
    const tMax = x[x.length - 1];

    const makePath = (sym) => {
      const arr = plotLines[sym] || [];
      let d = "";
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        if (v === null || v === undefined || !Number.isFinite(v)) continue;
        const X = sx(i);
        const Y = sy(v);
        d += d ? ` L ${X} ${Y}` : `M ${X} ${Y}`;
      }
      return d;
    };

    const yFmt = (tv) => (indexMode ? fmtDeltaPct(tv) : fmtUsd(invTVal(tv)));
    // Tooltip positioning must use real CSS pixels, not the SVG viewBox units.
    // Otherwise it will disappear on narrower rendered charts when moving right.
    const tooltipGap = 16;
    const chartPad = 12;
    const chartCssW = hoverPos.chartW || w;
    const chartCssH = hoverPos.chartH || h;

    const placeRight = hoverPos.x + tooltipGap;
    const placeLeft = hoverPos.x - tooltipSize.w - tooltipGap;
    const placeBelow = hoverPos.y + tooltipGap;
    const placeAbove = hoverPos.y - tooltipSize.h - tooltipGap;

    const tooltipLeftSafe =
      placeRight + tooltipSize.w <= chartCssW - chartPad
        ? placeRight
        : Math.max(chartPad, Math.min(placeLeft, chartCssW - tooltipSize.w - chartPad));

    const tooltipTopSafe =
      placeBelow + tooltipSize.h <= chartCssH - chartPad
        ? placeBelow
        : Math.max(chartPad, Math.min(placeAbove, chartCssH - tooltipSize.h - chartPad));

  return (
    <div className="chartWrap" style={{ width: "100%", position: "relative" }}>
      <svg className="chartSvg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} className="chartAxis" />
        <line x1={padL} y1={padT} x2={padL} y2={h - padB} className="chartAxis" />
        {/* grid + y labels */}
        {ticksTV.map((tv, i) => (
          <g key={i}>
            <line x1={padL} y1={syTV(tv)} x2={w - padR} y2={syTV(tv)} className="chartGrid" />
            <text x={8} y={syTV(tv) + 5} className="chartLabel">
              {yFmt(tv)}
            </text>
          </g>
        ))}
{/* X labels */}
        <text x={padL} y={h - 8} className="chartLabel">
          {formatXAxisLabel(tMin, timeframe)}
        </text>
        <text x={padL + innerW / 2} y={h - 8} textAnchor="middle" className="chartLabel">
          {formatXAxisLabel(tMid, timeframe)}
        </text>
        <text x={w - padR} y={h - 8} textAnchor="end" className="chartLabel">
          {formatXAxisLabel(tMax, timeframe)}
        </text>

{/* lines */}

        {syms.map((sym, idx) => {
          const d = makePath(sym);
          if (!d) return null;

          // IMPORTANT: only dim when user CLICK-highlighted; hover must not change visibility
          const hasHighlights = Array.isArray(highlightedSyms) && highlightedSyms.length > 0;
          const isHi = !hasHighlights || highlightedSyms.includes(sym);
          const opacity = hasHighlights ? (isHi ? 0.95 : 0.18) : 0.90;
          const strokeWidth = hasHighlights ? (isHi ? 3.2 : 2.2) : 3.0;

          return (
            <path
              key={sym}
              d={d}
              className={`chartLine ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`}
              style={{ opacity, strokeWidth, stroke: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]) }}
              onMouseEnter={() => onHoverSym?.(sym)}
              onMouseLeave={() => onHoverSym?.(null)}
            />
          );
        })}
        {hoverIdx !== null && (
          <line
            x1={sx(x[hoverIdx])}
            x2={sx(x[hoverIdx])}
            y1={padT}
            y2={h - padB}
            stroke="rgba(255,255,255,.25)"
            strokeDasharray="4 4"
          />
        )}
      </svg>

      <div
        style={{ position: "absolute", inset: 0, cursor: "crosshair" }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const svgX = (px / rect.width) * w;

          // Map mouse X onto plot area (between padL and w-padR)
          const clampedSvgX = Math.max(padL, Math.min(svgX, w - padR));
          const frac = (clampedSvgX - padL) / (w - padL - padR);
          const i = clampIdx(Math.round(frac * (n - 1)));
          setHoverIdx(i);
          setHoverPos({
            x: px,
            y: Math.max(12, Math.min(py, rect.height - 12)),
            chartW: rect.width,
            chartH: rect.height,
          });
        }}
        onMouseLeave={() => {
          setHoverIdx(null);
          setHoverPos({ x: 0, y: 0 });
        }}
      />

      {hoverIdx !== null && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            left: tooltipLeftSafe,
            top: tooltipTopSafe,
            background: "rgba(7,24,22,0.98)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "10px 12px",
            minWidth: 190,
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            {hoverDate(x[hoverIdx])}
          </div>

          {syms.map((sym) => (
            <div
              key={sym}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                fontWeight: 800,
                opacity: highlightedSyms.length > 0 && !highlightedSyms.includes(sym) ? 0.55 : 1,
              }}
            >
              <span>{sym}</span>
              <span
                style={{
                  color: indexMode
                    ? (() => {
                        const v = plotLines?.[sym]?.[hoverIdx];
                        if (!Number.isFinite(v)) return "rgba(232,242,240,.85)";
                        return v - 100 >= 0 ? "var(--green)" : "var(--red)";
                      })()
                    : "rgba(232,242,240,.92)",
                }}
              >
                {fmtHoverVal(sym)}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

function Legend({ symbols, highlightedSyms = [], setHighlightedSyms, colorForSym, lineClassForSym }) {
  const highlightedSet = useMemo(() => new Set((highlightedSyms || []).map((s) => String(s || "").toUpperCase())), [highlightedSyms]);

  const toggleHighlight = (sym) => {
    const S = String(sym || "").toUpperCase();
    setHighlightedSyms((prev) => {
      const prevArr = Array.isArray(prev) ? prev.map((s) => String(s || "").toUpperCase()) : [];
      return prevArr.includes(S)
        ? prevArr.filter((x) => x !== S)
        : [...prevArr, S];
    });
  };

  const showAll = () => setHighlightedSyms([]);

  return (
    <div className="chartLegend">
      {symbols.map((sym, idx) => {
        const hasHighlights = highlightedSet.size > 0;
        const active = !hasHighlights || highlightedSet.has(String(sym || "").toUpperCase());
        return (
          <button
            key={sym}
            className={`legendItem ${active ? "active" : ""}`}
            onClick={() => toggleHighlight(sym)}
            title={active ? "Click to fade this coin" : "Click to highlight this coin"}
            type="button"
          >
            <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]), opacity: active ? 1 : 0.35 }} />
            <span className="legendSym" style={{ opacity: active ? 1 : 0.5 }}>{sym}</span>
          </button>
        );
      })}
      {symbols.length > 0 ? (
        <button className="legendItem active" onClick={showAll} title="Show all coins" type="button">
          <span className="legendSym">all Coin</span>
        </button>
      ) : null}
      {symbols.length === 0 ? <span className="muted">No coins selected.</span> : null}
    </div>
  );
}

function SmallSpark({ sym, chart, idx, indexMode, timeframe, active, onClick, colorForSym, lineClassForSym }) {
  const { x, lines } = chart || { x: [], lines: {} };
  const arr = (lines?.[sym] || []).slice();
  if (!x?.length || !arr.length) {
    return (
      <button className={`sparkTile ${active ? "active" : ""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick} type="button">
        <div className="sparkTop">
          <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]) }} />
          <span className="sparkSym">{sym}</span>
          <span className="muted tiny">—</span>
        </div>
        <div className="sparkEmpty muted tiny">No data</div>
      </button>
    );
  }

  const values = indexMode
    ? (() => {
        let base = null;
        for (const v of arr) if (Number.isFinite(v)) { base = v; break; }
        if (!Number.isFinite(base) || base === 0) return arr.map(() => null);
        return arr.map((v) => (Number.isFinite(v) ? (v / base) * 100.0 : null));
      })()
    : arr;

  let min = Infinity, max = -Infinity;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    min = 0.9; max = 1.1;
  }

  const w = 360, h = 110;
  const padL = 10, padR = 10, padT = 12, padB = 18;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const sx = (i) => padL + (i * innerW) / Math.max(1, x.length - 1);
  const sy = (v) => {
    const t = (v - min) / (max - min);
    return padT + (1 - t) * innerH;
  };

  let d = "";
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) continue;
    const X = sx(i), Y = sy(v);
    d += d ? ` L ${X} ${Y}` : `M ${X} ${Y}`;
  }

  const last = [...values].reverse().find((v) => Number.isFinite(v));
  const [hovered, setHovered] = useState(false);

  const deltaPct = (() => {
    if (!indexMode) return null;
    const first = values.find((v) => Number.isFinite(v));
    const lastv = [...values].reverse().find((v) => Number.isFinite(v));
    if (!Number.isFinite(first) || !Number.isFinite(lastv)) return null;
    return ((lastv - first) / first) * 100;
  })();

  const lastTxt = last == null ? "—" : (indexMode ? last.toFixed(1) : fmtUsd(last));

  return (
    <button
      className={`sparkTile ${active ? "active" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      type="button"
      title="Click to open chart"
    >
      <div className="sparkTop">
        <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]) }} />
        <span className="sparkSym">{sym}</span>
        <span className="sparkVal mono">{hovered && deltaPct != null ? fmtPct(deltaPct) : lastTxt}</span>
      </div>
      <svg className="sparkSvg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={d} className={`chartLine ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ opacity: 0.95, strokeWidth: 2.8, stroke: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]) }} />
      </svg>
      <div className="sparkFoot muted tiny">{indexMode ? "Index 100" : "Price"} · 30D</div>
    </button>
  );
}

// ------------------------
// Best pairs
// ------------------------
// Build aligned daily lines from raw series map: {SYM: [{t,v}, ...]}
// This avoids "union timestamp" artifacts and ensures every pair compares over real overlapping days.
function buildAlignedDailyLines(seriesBySym, opts = {}) {
  const minDays = Number(opts.minDays ?? 20); // require at least this many overlapping days
  const syms = Object.keys(seriesBySym || {}).filter(Boolean);
  if (syms.length < 2) return { dates: [], lines: {} };

  // 1) Build per-symbol map: YYYY-MM-DD -> close price (last point of the day)
  const maps = {};
  const dateSets = [];

  for (const sym of syms) {
    const pts = Array.isArray(seriesBySym?.[sym]) ? seriesBySym[sym] : [];
    const m = new Map();
    for (const p of pts) {
      const t = Number(p?.t ?? p?.[0] ?? 0);
      const v = Number(p?.v ?? p?.[1] ?? NaN);
      if (!Number.isFinite(t) || !Number.isFinite(v) || t <= 0) continue;

      const d = new Date(t);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      // overwrite -> last value of that UTC day becomes the close
      m.set(key, v);
    }
    maps[sym] = m;
    dateSets.push(new Set(m.keys()));
  }

  // 2) Intersection of dates across all symbols (common overlap window)
  let common = null;
  for (const s of dateSets) {
    if (!common) common = new Set(s);
    else {
      for (const k of Array.from(common)) if (!s.has(k)) common.delete(k);
    }
  }
  const dates = Array.from(common || []).sort();
  if (dates.length < minDays) return { dates: [], lines: {} };

  // 3) Build aligned arrays (same length for all syms)
  const lines = {};
  for (const sym of syms) {
    const m = maps[sym];
    const arr = dates.map((d) => {
      const v = m.get(d);
      return Number.isFinite(v) ? v : null;
    });
    lines[sym] = arr;
  }
  return { dates, lines };
}

function computeBestPairsFromSeries(seriesBySym, limit = 30) {
  const { lines } = buildAlignedDailyLines(seriesBySym, { minDays: 20 });
  const syms = Object.keys(lines || {});
  if (syms.length < 2) return [];
  const normLines = normalizeToIndex(lines);

  const calcSimpleRsiLocal = (arr, period = 14) => {
    const pts = Array.isArray(arr) ? arr : [];
    if (pts.length < period + 1) return null;
    let gain = 0;
    let loss = 0;
    for (let i = pts.length - period; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const v0 = prev && typeof prev === "object" ? Number(prev.v) : Number(prev);
      const v1 = curr && typeof curr === "object" ? Number(curr.v) : Number(curr);
      if (!Number.isFinite(v0) || !Number.isFinite(v1)) continue;
      const diff = v1 - v0;
      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);
    }
    const avgGain = gain / period;
    const avgLoss = loss / period;
    if (!Number.isFinite(avgGain) || !Number.isFinite(avgLoss)) return null;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const res = [];
  for (let i = 0; i < syms.length; i++) {
    for (let j = i + 1; j < syms.length; j++) {
      const a = syms[i], b = syms[j];
      const r = pearson(normLines[a] || [], normLines[b] || []);
      if (r === null) continue;
      const score = Math.round(Math.abs(r) * 100);
      const rsiA = calcSimpleRsiLocal((seriesBySym && seriesBySym[a]) || [], 14);
      const rsiB = calcSimpleRsiLocal((seriesBySym && seriesBySym[b]) || [], 14);
      const rsiGap = Number.isFinite(rsiA) && Number.isFinite(rsiB) ? Math.abs(rsiA - rsiB) : null;
      res.push({ pair: `${a}/${b}`, a, b, corr: r, score, rsiA, rsiB, rsiGap });
    }
  }
  res.sort((x, y) => y.score - x.score);
  return res.slice(0, limit);
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 10) return null;
  let sx = 0,
    sy = 0,
    sxx = 0,
    syy = 0,
    sxy = 0,
    m = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i],
      y = b[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    m++;
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  }
  if (m < 10) return null;
  const num = m * sxy - sx * sy;
  const den = Math.sqrt((m * sxx - sx * sx) * (m * syy - sy * sy));
  if (!den) return null;
  return num / den;
}

function computeBestPairs(chart, limit = 30) {
  const lines = chart?.lines || {};
  const syms = Object.keys(lines);
  if (syms.length < 2) return [];
  const normLines = normalizeToIndex(lines);

  const res = [];
  for (let i = 0; i < syms.length; i++) {
    for (let j = i + 1; j < syms.length; j++) {
      const a = syms[i],
        b = syms[j];
      const r = pearson(normLines[a] || [], normLines[b] || []);
      if (r === null) continue;
      const score = Math.round(Math.abs(r) * 100);
      res.push({ pair: `${a}/${b}`, corr: r, score });
    }
  }
  res.sort((x, y) => y.score - x.score);
  return res.slice(0, limit);
}

// ------------------------
// App (inner)
// ------------------------
function AppInner() {

  // Multi-chain config (UI is ready; test phase enables POL + BNB)
  const CHAIN_ID = { ETH: 1, POL: 137, BNB: 56, ARB: 42161, OP: 10, BASE: 8453, AVAX: 43114, FTM: 250 };
  const ENABLED_CHAINS = ["POL","BNB","ETH"];
  const DEFAULT_CHAIN = "POL";

// One-time storage version gate: clears *derived* caches after deployments (keeps user selections)
useEffect(() => {
  try {
    const v = localStorage.getItem(LS_APP_VERSION);
    if (v !== APP_VERSION) {
      // Only clear volatile caches; never wipe user choices like compare set/watch items
      const keysToClear = [
        LS_WATCH_ROWS_CACHE,
        LS_COMPARE_SERIES_CACHE,
        LS_COMPARE_STORE,
      ];
      for (const k of keysToClear) {
        try { localStorage.removeItem(k); } catch {}
      }
      localStorage.setItem(LS_APP_VERSION, APP_VERSION);
    }
  } catch (e) {
    // ignore storage errors (private mode, blocked, etc.)
  }
}, []);

  
  const [watchErr, setWatchErr] = useState("");
const [errorMsg, setErrorMsg] = useState("");

  const isDesktopWide = typeof window !== "undefined" ? window.innerWidth >= 981 : true;

  const isCompactMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const compactGridChipStyle = {
    minHeight: isCompactMobile ? "28px" : "34px",
    height: isCompactMobile ? "28px" : "34px",
    padding: isCompactMobile ? "0 10px" : "6px 12px",
    borderRadius: isCompactMobile ? "10px" : "12px",
    fontSize: isCompactMobile ? "12px" : "13px",
    lineHeight: 1,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Privy (Auth + embedded wallet). IMPORTANT: We do NOT trigger MetaMask here.
  // External wallets must be optional and only enabled explicitly elsewhere.
  const { ready, authenticated, login, logout, getAccessToken } = usePrivy();
  const { wallets: privyWallets } = useWallets();

  // Prevent duplicate Privy login/sign flows (can cause AbortError / "already logged in")
  const _loginInFlight = useRef(false);

  // Prevent order flicker when backend GET lags behind POST/DB writes

  const _loginRetryUsed = useRef(false);
  const _backendAuthInFlight = useRef(false);

  const _autoAuthStarted = useRef(false);

  // auth
  // NOTE: Backend expects its OWN Bearer token (issued by /api/auth/verify),
  // not the Privy JWT. We keep both:
  const [privyJwt, setPrivyJwt] = useState("");
  const [token, setToken] = useLocalStorageState("nexus_token", ""); // backend token
  const [wallet, setWallet] = useLocalStorageState("nexus_wallet", "");
  const walletAddress = wallet; // alias for older handlers / debug
  // Trading policy is UI-only for now (no Vault/Allowance yet).
  // Keep it local to avoid backend auth/CORS coupling during early UX work.
const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [withdrawSendOpen, setWithdrawSendOpen] = useState(false);
  const [balActiveChain, setBalActiveChain] = useState(() => {
    try { return localStorage.getItem("nexus_wallet_bal_chain") || "BNB"; } catch (_) { return "BNB"; }
  });
  

useEffect(() => {
    try { localStorage.setItem("nexus_wallet_bal_chain", balActiveChain || "BNB"); } catch (_) {}
  }, [balActiveChain]);
const [wsChainKey, setWsChainKey] = useState(() => {
    try { return localStorage.getItem("nexus_wallet_bal_chain") || DEFAULT_CHAIN; } catch (_) { return DEFAULT_CHAIN; }
  });
  const [wsInfoOpen, setWsInfoOpen] = useState(false);
  const wsInfoRef = useRef(null);

  // Wallet actions (Vault withdraw + native send)
  const [txBusy, setTxBusy] = useState(false);
  const [txMsg, setTxMsg] = useState("");
  const [securityState, setSecurityState] = useState(null); // null | loading | ok | blocked | cancelled
  const [securityMsg, setSecurityMsg] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState(""); // in native units (e.g., POL)
  const [depositAmt, setDepositAmt] = useState(""); // deposit into vault (native units, e.g., POL)
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState(""); // in native units

  // Vault state (on-chain) + operator authorization
  const [vaultState, setVaultState] = useState({
    polBalanceWei: null,
    polBalance: null,
    inCycle: false,
    heldToken: null,
    heldTokenBalWei: null,
    heldTokenBal: null,
    operatorEnabled: false,
  });
  // Sync Withdraw&Send chain with Wallet chain selection
  useEffect(() => {
    if (!withdrawSendOpen) return;
    if (!balActiveChain) return;
    setWsChainKey((prev) => (prev === balActiveChain ? prev : balActiveChain));
  }, [balActiveChain, withdrawSendOpen]);

// Withdraw & Send info tooltip
  useEffect(() => {
    if (!withdrawSendOpen) setWsInfoOpen(false);
  }, [withdrawSendOpen]);

  useEffect(() => {
    if (!wsInfoOpen) return;
    const onDown = (e) => {
      if (wsInfoRef.current && !wsInfoRef.current.contains(e.target)) {
        setWsInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [wsInfoOpen]);

  useEffect(() => {
    setSecurityState(null);
    setSecurityMsg("");
  }, [withdrawSendOpen, balActiveChain, wsChainKey, depositAmt]);

  // Contracts (Vault/Executor/Router) fetched from backend ENV so UI stays in sync after deploys
  const [contracts, setContracts] = useState(null);
  // Fetch contract addresses from backend (Render ENV) once
  useEffect(() => {
    (async () => {
      try {
        const r = await api("/api/contracts", { method: "GET" });
        if (r && r.chains) setContracts(r);
      } catch (e) {
        // don't hard-fail UI if backend doesn't have this endpoint
      }
    })();
  }, []);

  // -------------------------
  // Wallet actions: Vault withdraw + native send
  // -------------------------
  const _getEmbeddedProvider = async () => {
    const embedded = privyWallets?.[0];
    const provider = await embedded?.getEthereumProvider?.();
    if (!provider?.request) throw new Error("Privy wallet provider not available.");
    return provider;
  };

  const signWithEmbeddedWallet = async (embeddedWallet, message, address) => {
    if (!embeddedWallet) throw new Error("No wallet available to sign.");
    const addr = String(address || embeddedWallet?.address || "").toLowerCase();
    if (!addr) throw new Error("Missing wallet address.");
    const provider = await embeddedWallet.getEthereumProvider?.();
    if (!provider?.request) throw new Error("Wallet provider not available.");
    return await provider.request({ method: "personal_sign", params: [String(message), addr] });
  };

  const ensureBackendAuthToken = async (force = false) => {
    const addr = String(wallet || "").toLowerCase();
    if (!addr) throw new Error("Authorization required.");
    if (!force && token) return token;
    if (_backendAuthInFlight.current) throw new Error("Authorization already in progress.");

    const embedded =
      privyWallets?.find((w) =>
        ["privy", "embedded"].includes(String(w?.walletClientType || "").toLowerCase()) ||
        String(w?.connectorType || "").toLowerCase() === "embedded"
      ) ||
      privyWallets?.[0];

    if (!embedded) throw new Error("Authorization required.");

    _backendAuthInFlight.current = true;
    try {
      const nonceRes = await api("/api/auth/nonce", {
        method: "POST",
        body: { address: addr },
      });
      const message = nonceRes?.message;
      const nonce = nonceRes?.nonce;
      if (!message || !nonce) throw new Error("Auth nonce failed.");

      const signature = await signWithEmbeddedWallet(embedded, message, addr);

      const verifyRes = await api("/api/auth/verify", {
        method: "POST",
        body: { address: addr, message, signature, nonce },
      });
      const backendToken = String(verifyRes?.token || "");
      if (!backendToken) throw new Error("Auth verify failed.");

      setToken(backendToken);
      return backendToken;
    } finally {
      _backendAuthInFlight.current = false;
    }
  };

  const _trySwitchChain = async (provider, chainId) => {
    if (!provider?.request || !chainId) return;
    const hexChainId = "0x" + Number(chainId).toString(16);
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch {
      // Some embedded providers don't support chain switching; the tx will fail if on wrong chain.
    }
  };

  const _encodeUint256 = (bn) => {
    // bn can be a BigNumber (ethers v5 style) or bigint
    let hex = "";
    try {
      hex = typeof bn === "bigint" ? bn.toString(16) : String(bn?.toHexString?.() || "").replace(/^0x/, "");
    } catch {
      hex = "";
    }
    if (!hex) hex = "0";
    return hex.padStart(64, "0");
  };
  const _encodeAddress = (addr) => {
    const a = String(addr || "").trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(a)) throw new Error("Bad address for ABI encode.");
    return a.toLowerCase().replace(/^0x/, "").padStart(64, "0");
  };

  const _encodeBool = (b) => {
    return (b ? "1" : "0").padStart(64, "0");
  };

  const _hexToAddress = (hex) => {
    const h = String(hex || "0x").replace(/^0x/, "").padStart(64, "0");
    return "0x" + h.slice(24); // last 20 bytes
  };

  const _hexToBool = (hex) => {
    try { return BigInt(hex || "0x0") !== 0n; } catch { return false; }
  };

  const _isAddr = (a) => /^0x[a-fA-F0-9]{40}$/.test(String(a || "").trim());

  const sendNative = async () => {
    try {
      setTxMsg("");
      if (!wallet) throw new Error("Wallet not connected.");
      if (!_isAddr(sendTo)) throw new Error("Recipient address invalid.");
      const amt = String(sendAmt || "").trim();
      if (!amt || Number(amt) <= 0) throw new Error("Amount invalid.");
      const chainKey = (activeGridChainKey || wsChainKey || balActiveChain || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      // Hard safety check: ensure we are on the expected chain before sending a tx.
      try {
        const currentHex = await provider.request({ method: "eth_chainId" });
        const wantHex = "0x" + Number(chainId).toString(16);
        if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
          throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${wantHex}).`);
        }
      } catch (e) {
        throw e;
      }

      const valueHex = Utils.hexValue(Utils.parseEther(amt));
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: String(sendTo).trim(), value: valueHex, data: "0x" }],
      });

      setTxMsg(`Sent. Tx: ${txHash}`);
      setSendAmt("");
      setSendTo("");
      // refresh wallet balances in background
      setTimeout(() => refreshBalances(), 200);
    } catch (e) {
      setTxMsg(String(e?.message || e || "Send failed"));
    } finally {
      setTxBusy(false);
    }
  };

  const depositToVault = async () => {
    try {
      setTxMsg("");
      setSecurityState("loading");
      setSecurityMsg("🟡 Checking token security...");

      if (!wallet) throw new Error("Wallet not connected.");
      const amt = String(depositAmt || "").trim();
      if (!amt || Number(amt) <= 0) throw new Error("Deposit amount invalid.");

      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr =
        (contracts?.chains?.[chainKey]?.vault || "").trim() ||
        (contracts?.chains?.[String(chainKey).toLowerCase()]?.vault || "").trim();
      if (!_isAddr(vaultAddr)) throw new Error("Vault address not available for this chain.");

      // Current UI deposits native only. We still run the new backend gate here so the
      // same flow is already wired for later token deposits. Native assets are bypassed backend-side.
      const nativeSymbol = String(chainKey || DEFAULT_CHAIN).toUpperCase();
      const pre = await securityPrecheckForDeposit({
        chainKey,
        symbol: nativeSymbol,
        isNative: true,
        token,
      });
      if (pre?.allowed === false) {
        setSecurityState("blocked");
        setSecurityMsg(`🔴 ${pre?.reason || "Deposit blocked by security check."}`);
        throw new Error(pre?.reason || "Deposit blocked by security check.");
      }

      setSecurityState("ok");
      setSecurityMsg("🟢 Token approved. Opening wallet signature...");
      // Let the user actually see the green state before Privy opens.
      await new Promise((r) => setTimeout(r, 3000));

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      // Hard safety check: ensure we are on the expected chain before sending a tx.
      const currentHex = await provider.request({ method: "eth_chainId" });
      const wantHex = "0x" + Number(chainId).toString(16);
      if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
        throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${wantHex}).`);
      }

      const valueHex = Utils.hexValue(Utils.parseEther(amt));

      // Try calling deposit() (WETH-style). If vault only has receive(), fallback to empty data.
      const trySend = async (data) => {
        return await provider.request({
          method: "eth_sendTransaction",
          params: [{ from: wallet, to: vaultAddr, value: valueHex, data }],
        });
      };

      let txHash = null;
      try {
        txHash = await trySend("0xd0e30db0"); // deposit()
      } catch (e) {
        txHash = await trySend("0x");
      }

      setSecurityState("ok");
      setSecurityMsg("🟢 Deposit submitted successfully.");
      setTxMsg(`Deposit submitted. Tx: ${txHash}`);
      setDepositAmt("");
      setTimeout(() => refreshBalances(), 1200);
    } catch (e) {
      const msg = String(e?.message || e || "Deposit failed");
      const low = msg.toLowerCase();

      if (e?.code === 4001 || low.includes("user rejected") || low.includes("rejected") || low.includes("denied") || low.includes("cancelled") || low.includes("canceled")) {
        setSecurityState("cancelled");
        setSecurityMsg("🟡 Transaction cancelled by user.");
      } else if (low.includes("execution reverted") || low.includes("estimate gas") || low.includes("call_exception") || low.includes("cycle_open") || low.includes("revert")) {
        setSecurityState("blocked");
        setSecurityMsg("🔴 Deposit rejected by contract.");
      } else if (!securityState) {
        setSecurityState("blocked");
        setSecurityMsg(`🔴 ${msg}`);
      } else if (securityState !== "blocked") {
        setSecurityState("blocked");
        setSecurityMsg(`🔴 ${msg}`);
      }

      setTxMsg(msg);
    } finally {
      setTxBusy(false);
    }
  };

  const withdrawFromVault = async () => {
    try {
      setTxMsg("");
      if (!wallet) throw new Error("Wallet not connected.");
      const amt = String(withdrawAmt || "").trim();
      if (!amt || Number(amt) <= 0) throw new Error("Withdraw amount invalid.");

      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr =
        (contracts?.chains?.[chainKey]?.vault || "").trim() ||
        (contracts?.chains?.[String(chainKey).toLowerCase()]?.vault || "").trim();
      if (!_isAddr(vaultAddr)) throw new Error("Vault address not available for this chain.");

      const wei = Utils.parseEther(amt);
      const data = "0x2e1a7d4d" + _encodeUint256(wei); // withdraw(uint256)

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      // Hard safety check: ensure we are on the expected chain before sending a tx.
      try {
        const currentHex = await provider.request({ method: "eth_chainId" });
        const wantHex = "0x" + Number(chainId).toString(16);
        if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
          throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${wantHex}).`);
        }
      } catch (e) {
        throw e;
      }

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: vaultAddr, value: "0x0", data }],
      });

      setTxMsg(`Withdraw submitted. Tx: ${txHash}`);
      setWithdrawAmt("");
      setTimeout(() => refreshBalances(), 1200);
    } catch (e) {
      setTxMsg(String(e?.message || e || "Withdraw failed"));
    } finally {
      setTxBusy(false);
    }
  };

  // ---------
  // Vault on-chain reads (polBalance / inCycle / heldToken / heldTokenBal / operatorEnabled)
  // NOTE: This reads directly from the Vault contract using eth_call (no backend needed).
  // ---------
  const VAULT_SIG = {
    setOperator: "0x558a7297",        // setOperator(address,bool)
    startCycle:  "0x0a20e8c0",        // startCycle(address)
    endCycle:   "0x85588ce8",        // endCycle(address)
    isOperatorFor: "0xd95b6371",      // isOperatorFor(address,address)
    inCycle: "0x7870293e",            // inCycle(address)
    polBalance: "0x7754e652",         // polBalance(address)
    heldToken: "0x90ba1a44",          // heldToken(address)
    heldTokenBal: "0x4ad59fe9",       // heldTokenBal(address)
  };

  const _getVaultAddrForChain = (chainKey) => {
    return (
      (contracts?.chains?.[chainKey]?.vault || "").trim() ||
      (contracts?.chains?.[String(chainKey).toLowerCase()]?.vault || "").trim()
    );
  };

  const _getBotOperatorForChain = (chainKey) => {
    // backend can expose operator/executor address in /api/contracts
    return (
      (contracts?.chains?.[chainKey]?.operator || "").trim() ||
      (contracts?.chains?.[chainKey]?.executor || "").trim() ||
      (contracts?.chains?.[chainKey]?.bot || "").trim() ||
      (contracts?.chains?.[String(chainKey).toLowerCase()]?.operator || "").trim() ||
      (contracts?.chains?.[String(chainKey).toLowerCase()]?.executor || "").trim()
    );
  };

  const refreshVaultState = async (preferredChainKey = "") => {
    try {
      if (!wallet) return;
      const forcedChain = String(preferredChainKey || "").toUpperCase().trim();
      const chainKey = (forcedChain || balActiveChain || wsChainKey || DEFAULT_CHAIN);

      // Primary path: backend RPC endpoint.
      // This avoids the embedded-wallet/provider race after F5.
      try {
        const qs = new URLSearchParams({ wallet, chain: chainKey }).toString();
        const r = await api(`/api/vault/state?${qs}`, { method: "GET", token, wallet });
        if (r && (r.status === "ok" || r.vault_balance !== undefined)) {
          const vaultBal = Number(r?.vault_balance ?? 0) || 0;
          const vaultWei = r?.vault_balance_wei != null ? hexToBigInt(r.vault_balance_wei) : BigInt(Math.round(vaultBal * 1e18));
          const heldTok = String(r?.heldToken || r?.held_token || "") || null;
          const heldBal = Number(r?.heldTokenBal ?? r?.held_token_bal ?? 0) || 0;
          const heldWei = r?.heldTokenBalWei != null ? hexToBigInt(r.heldTokenBalWei) : null;
          const operatorEnabled = !!(r?.operatorEnabled ?? r?.operator_enabled);
          const inCycle = !!(r?.inCycle ?? r?.in_cycle);

          setVaultState({
            polBalanceWei: vaultWei,
            polBalance: vaultBal,
            inCycle,
            heldToken: heldTok,
            heldTokenBalWei: heldWei,
            heldTokenBal: heldBal,
            operatorEnabled,
          });
          return;
        }
      } catch (_) {
        // fallback below
      }

      // Legacy fallback: direct provider eth_call
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr = _getVaultAddrForChain(chainKey);
      if (!_isAddr(vaultAddr)) return;

      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      const botOp = _getBotOperatorForChain(chainKey);
      const hasBotOp = _isAddr(botOp);

      const call = async (data) => {
        return await provider.request({
          method: "eth_call",
          params: [{ to: vaultAddr, data }, "latest"],
        });
      };

      const polHex = await call(VAULT_SIG.polBalance + _encodeAddress(wallet));
      const inCycleHex = await call(VAULT_SIG.inCycle + _encodeAddress(wallet));
      const heldTokHex = await call(VAULT_SIG.heldToken + _encodeAddress(wallet));
      const heldBalHex = await call(VAULT_SIG.heldTokenBal + _encodeAddress(wallet));

      let operatorEnabled = false;
      if (hasBotOp) {
        const opHex = await call(
          VAULT_SIG.isOperatorFor + _encodeAddress(wallet) + _encodeAddress(botOp)
        );
        operatorEnabled = _hexToBool(opHex);
      }

      const polWei = hexToBigInt(polHex);
      const heldWei = hexToBigInt(heldBalHex);

      setVaultState({
        polBalanceWei: polWei,
        polBalance: Number(Utils.formatEther(polWei)),
        inCycle: _hexToBool(inCycleHex),
        heldToken: _hexToAddress(heldTokHex),
        heldTokenBalWei: heldWei,
        heldTokenBal: Number(Utils.formatUnits(heldWei, 18)),
        operatorEnabled,
      });
    } catch (e) {
      // keep UI alive; vault state is best-effort
    }
  };

  const setVaultOperator = async (allowed) => {
    try {
      setTxMsg("");
      if (!wallet) throw new Error("Wallet not connected.");
      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr = _getVaultAddrForChain(chainKey);
      if (!_isAddr(vaultAddr)) throw new Error("Vault address not available for this chain.");
      const botOp = _getBotOperatorForChain(chainKey);
      if (!_isAddr(botOp)) throw new Error("Backend bot operator address is missing in /api/contracts.");

      const data = VAULT_SIG.setOperator + _encodeAddress(botOp) + _encodeBool(!!allowed);

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      const currentHex = await provider.request({ method: "eth_chainId" });
      const wantHex = "0x" + Number(chainId).toString(16);
      if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
        throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${wantHex}).`);
      }

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: vaultAddr, value: "0x0", data }],
      });

      setTxMsg(`${allowed ? "Operator enabled" : "Operator disabled"}. Tx: ${txHash}`);
      setTimeout(() => refreshVaultState(), 1400);
    } catch (e) {
      setTxMsg(String(e?.message || e || "Operator tx failed"));
    } finally {
      setTxBusy(false);
    }
  };

  const startVaultCycle = async () => {
    try {
      setTxMsg("");
      if (!wallet) throw new Error("Wallet not connected.");
      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr = _getVaultAddrForChain(chainKey);
      if (!_isAddr(vaultAddr)) throw new Error("Vault address not available for this chain.");

      const data = VAULT_SIG.startCycle + _encodeAddress(wallet);

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      const currentHex = await provider.request({ method: "eth_chainId" });
      const wantHex = "0x" + Number(chainId).toString(16);
      if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
        throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${wantHex}).`);
      }

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: vaultAddr, value: "0x0", data }],
      });

      setTxMsg(`Cycle start submitted. Tx: ${txHash}`);
      setTimeout(() => refreshVaultState(), 1400);
    } catch (e) {
      setTxMsg(String(e?.message || e || "Start cycle failed"));
    } finally {
      setTxBusy(false);
    }
  };

  const endVaultCycle = async () => {
    try {
      setTxMsg("");
      if (!wallet) throw new Error("Wallet not connected.");
      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const chainId = CHAIN_ID?.[chainKey] || 137;
      const vaultAddr = _getVaultAddrForChain(chainKey);
      if (!_isAddr(vaultAddr)) throw new Error("Vault address not available for this chain.");

      const data = VAULT_SIG.endCycle + _encodeAddress(wallet);

      setTxBusy(true);
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      const currentHex = await provider.request({ method: "eth_chainId" });
      const wantHex = "0x" + Number(chainId).toString(16);
      if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
        throw new Error(`Wrong network. Please switch your wallet to ${chainKey} (chainId ${chainId}).`);
      }

      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: vaultAddr, data }],
      });

      setTxMsg(`Cycle end submitted. Tx: ${tx}`);
      // refresh vault state (inCycle should turn to NO after confirmation; refresh anyway)
      setTimeout(() => { try { refreshVaultState(); } catch {} }, 1200);
      setTimeout(() => { try { refreshVaultState(); } catch {} }, 4500);
      return tx;
    } catch (e) {
      setTxMsg(String(e?.message || e || "End cycle tx failed"));
      throw e;
    } finally {
      setTxBusy(false);
    }
  };

  // Alchemy balances (native per chain, optionally tokens later)
  const [balLoading, setBalLoading] = useState(false);
  const [balError, setBalError] = useState("");
  const [balByChain, setBalByChain] = useState({}); // { ETH: { native: "0.0" }, ... }
  const [showAllWalletChains, setShowAllWalletChains] = useState(() => {
    try { return localStorage.getItem("nexus_wallet_bal_all") !== "0"; } catch (_) { return true; }
  });

  

useEffect(() => {
    try { localStorage.setItem("nexus_wallet_bal_all", showAllWalletChains ? "1" : "0"); } catch (_) {}
  }, [showAllWalletChains]);
// keep vault state fresh
  useEffect(() => {
    if (!wallet) return;
    const chain = String(balActiveChain || wsChainKey || DEFAULT_CHAIN).toUpperCase();
    let forcedChain = chain;
    try {
      const savedCoin = String(
        localStorage.getItem(`${LS_GRID_COIN_PREFIX}:${chain}`) || ""
      ).toUpperCase().trim();
      if (["POL", "BNB", "ETH"].includes(savedCoin)) {
        forcedChain = savedCoin;
      }
    } catch (_) {}
    refreshVaultState(forcedChain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, wsChainKey, balActiveChain, contracts]);

  // Wallet USD valuation (CoinGecko). Includes native + stables + user-added tokens (when priced).
  const [gridBudgets, setGridBudgets] = useState({ totals: { locked_usd: 0, available_usd: 0 }, by_chain: {}, items: [], ts: null });
  const [gridBudgetsErr, setGridBudgetsErr] = useState("");
  const [walletUsd, setWalletUsd] = useState({ total: null, byChain: {}, unpriced: 0, ts: null });
  const [walletPx, setWalletPx] = useState({ native: {}, tokenByChain: {}, ts: null });
  const [walletUsdLoading, setWalletUsdLoading] = useState(false);

  // ------------------------
  // Wallet tokens (User-added, unlimited, persisted)
  // ------------------------
  // We do NOT auto-scan all tokens on a chain (prevents spam/airdrop tokens).
  // Only tokens explicitly added by the user are fetched + shown.
  const [walletTokenStore, setWalletTokenStore] = useLocalStorageState("nexus_wallet_tokens_v1", {});
  const walletKey = String(wallet || "").toLowerCase();
  const walletTokensByChain = useMemo(() => {
    const empty = { ETH: [], POL: [], BNB: [] };
    if (!walletKey) return empty;
    const v = walletTokenStore?.[walletKey];
    return v && typeof v === "object" ? { ...empty, ...v } : empty;
  }, [walletKey, walletTokenStore]);

  const setWalletTokensForChain = (chain, nextList) => {
    const c = String(chain || "").toUpperCase();
    if (!walletKey) return;
    setWalletTokenStore((prev) => {
      const empty = { ETH: [], POL: [], BNB: [] };
      const cur = (prev && prev[walletKey] && typeof prev[walletKey] === "object") ? { ...empty, ...prev[walletKey] } : empty;
      const next = { ...cur, [c]: Array.isArray(nextList) ? nextList : [] };
      return { ...(prev || {}), [walletKey]: next };
    });
  };

  const removeWalletToken = (chain, tokenAddress) => {
    const c = String(chain || "").toUpperCase();
    const addr = String(tokenAddress || contract || "").toLowerCase();

    const cur = walletTokensByChain?.[c] || [];
    const next = cur.filter((t) => String(t?.address || "").toLowerCase() != addr);
    setWalletTokensForChain(c, next);
  };

  // Add-token modal state
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const [addTokenChain, setAddTokenChain] = useState("BNB");
  const [addTokenQuery, setAddTokenQuery] = useState("");
  const [addTokenContract, setAddTokenContract] = useState("");
  const [addTokenBusy, setAddTokenBusy] = useState(false);
  const [addTokenErr, setAddTokenErr] = useState("");
  const [tokenListCache, setTokenListCache] = useState({ ETH: null, POL: null, BNB: null });

  const TOKEN_LIST_URL = {
    ETH: "https://tokens.uniswap.org",
    POL: "https://api-polygon-tokens.polygon.technology/tokenlists/popular.tokenlist.json",
    BNB: "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
  };

  const loadTokenList = async (chain) => {
    const c = String(chain || "").toUpperCase();
    if (tokenListCache?.[c]) return;
    const url = TOKEN_LIST_URL[c];
    if (!url) return;
    try {
      const res = await fetch(url, { cache: "force-cache" });
      const json = await res.json();
      const tokens = Array.isArray(json?.tokens) ? json.tokens : [];
      const filtered = tokens
        .filter((t) => Number(t?.chainId) === CHAIN_ID[c])
        .map((t) => ({
          address: String(t?.address || "").toLowerCase(),
          symbol: String(t?.symbol || "").toUpperCase(),
          name: String(t?.name || ""),
          decimals: Number(t?.decimals ?? 18),
        }))
        .filter((t) => t.address && t.symbol && Number.isFinite(t.decimals));
      setTokenListCache((prev) => ({ ...(prev || {}), [c]: filtered }));
    } catch {
      // If token list fetch fails, user can still add via contract address.
      setTokenListCache((prev) => ({ ...(prev || {}), [c]: [] }));
    }
  };

  const openAddToken = (chain) => {
    const c = String(chain || DEFAULT_CHAIN).toUpperCase();
    setAddTokenChain(c);
    setAddTokenQuery("");
    setAddTokenContract("");
    setAddTokenErr("");
    setAddTokenOpen(true);
    loadTokenList(c);
  };

  const addWalletToken = async () => {
    const chain = String(addTokenChain || "").toUpperCase();
    const list = walletTokensByChain?.[chain] || [];

    const safeAdd = (token) => {
      const addr = String(token?.address || "").toLowerCase();
      if (!addr) return;
      const exists = list.some((t) => String(t?.address || "").toLowerCase() === addr);
      if (exists) {
        setAddTokenErr("Token already added.");
        return;
      }
      const next = [...list, {
        address: addr,
        symbol: String(token?.symbol || "").toUpperCase() || "TOKEN",
        decimals: Number(token?.decimals ?? 18),
        name: String(token?.name || ""),
      }];
      setWalletTokensForChain(chain, next);
      // Refresh balances after state commit (ensure new token list is included).
      // React state updates are async; calling refresh immediately can use stale walletTokens.
      requestAnimationFrame(() => requestAnimationFrame(() => refreshBalances()));
      setTimeout(() => refreshBalances(), 200);
      setAddTokenOpen(false);
    };

    setAddTokenBusy(true);
    setAddTokenErr("");
    try {
      const contract = String(addTokenContract || "").trim();
      if (contract && /^0x[a-fA-F0-9]{40}$/.test(contract)) {
        if (!alchemyClients?.[chain]) throw new Error("Network not ready.");
        const md = await alchemyClients[chain].core.getTokenMetadata(contract);
        const token = {
          address: String(contract).toLowerCase(),
          symbol: String(md?.symbol || "").toUpperCase(),
          name: String(md?.name || ""),
          decimals: Number(md?.decimals ?? 18),
        };
        if (!token.symbol) throw new Error("Invalid token contract.");
        safeAdd(token);
        return;
      }

      // If no contract, add from selected search result (first match by query+symbol)
      const q = String(addTokenQuery || "").trim().toLowerCase();
      if (!q) throw new Error("Search or paste a contract address.");
      const pool = tokenListCache?.[chain] || [];
      const match = pool.find((t) => (t.symbol || "").toLowerCase() == q || (t.address || "").toLowerCase() == q);
      if (!match) throw new Error("Select a token from results or paste contract address.");
      safeAdd(match);
    } catch (e) {
      setAddTokenErr(String(e?.message || e || "Failed to add token"));
    } finally {
      setAddTokenBusy(false);
    }
  };

  // Sync Privy auth + embedded wallet into our local UI state.
  // IMPORTANT:
  // Keep the initial Privy wallet-creation flow as light as possible:
  // - set wallet
  // - fetch Privy access token
  // - do NOT immediately trigger backend nonce/sign/verify here
  // Access / Redeem / Subscribe continue to work via wallet + refreshAccess().
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!ready) return;

      if (!authenticated) {
        _autoAuthStarted.current = false;
        setWallet("");
        setToken("");
        setPrivyJwt("");
        return;
      }

      const embedded =
        privyWallets?.find((w) =>
          ["privy", "embedded"].includes(String(w?.walletClientType || "").toLowerCase()) ||
          String(w?.connectorType || "").toLowerCase() === "embedded"
        ) ||
        privyWallets?.[0];

      const addr = String(embedded?.address || "").toLowerCase();
      if (!cancelled && addr) {
        setWallet(addr);
      }

      try {
        const t = (await getAccessToken?.()) || "";
        if (!cancelled) setPrivyJwt(t);
      } catch {
        if (!cancelled) setPrivyJwt("");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, privyWallets?.length]);

  useEffect(() => {
    if (!wallet) {
      _autoAuthStarted.current = false;
      return;
    }

    if (token) return;
    if (!authenticated) return;
    if (_autoAuthStarted.current) return;

    const walletAtSchedule = String(wallet || "").toLowerCase();

    const timer = setTimeout(async () => {
      try {
        if (!walletAtSchedule) return;
        if (String(wallet || "").toLowerCase() !== walletAtSchedule) return;
        if (token) return;
        if (!authenticated) return;
        if (_autoAuthStarted.current) return;
        if (_backendAuthInFlight.current) return;

        _autoAuthStarted.current = true;
        await ensureBackendAuthToken();
      } catch (_) {
        // Keep silent in UI. If auto-auth fails, the normal on-demand flow still works.
        _autoAuthStarted.current = false;
      }
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, token, authenticated]);

  const connectWallet = async () => {
    // Keep login simple to avoid interfering with Privy's wallet-creation UI.
    try {
      if (!ready) return;
      if (authenticated) return;
      if (_loginInFlight.current) return;
      _loginInFlight.current = true;
      setErrorMsg("");
      await login();
    } catch (e) {
            setErrorMsg("");
    } finally {
      _loginInFlight.current = false;
    }
  };

  const disconnectWallet = async () => {
    try {
      try { resetWalletBoundUi({ clearAuth: true }); } catch {}
      await logout();
      setWalletModalOpen(false);
    } catch (e) {
      setErrorMsg(String(e?.message || e || "Logout failed"));
    } finally {
      try { resetWalletBoundUi({ clearAuth: true }); } catch {}
    }
  };

  const alchemyClients = useMemo(() => {
    if (!ALCHEMY_KEY) return null;
    // alchemy-sdk uses the API key directly; no manual RPC fetch needed.
    const clients = {
      ETH: new Alchemy({ apiKey: ALCHEMY_KEY, network: Network.ETH_MAINNET }),
      POL: new Alchemy({ apiKey: ALCHEMY_KEY, network: Network.MATIC_MAINNET }),
    };
    // Some older alchemy-sdk versions may not include BNB_MAINNET.
    if (Network?.BNB_MAINNET) {
      clients.BNB = new Alchemy({ apiKey: ALCHEMY_KEY, network: Network.BNB_MAINNET });
    }
    return clients;
  }, [ALCHEMY_KEY]);

  const refreshBalances = async () => {
    if (!wallet) return;
    if (!ALCHEMY_KEY) {
      setBalError("Alchemy key missing (VITE_ALCHEMY_KEY).");
      return;
    }
    if (!alchemyClients) {
      setBalError("Alchemy client init failed. Check VITE_ALCHEMY_KEY and restart dev server.");
      return;
    }

    setBalLoading(true);
    setBalError("");
    try {
      const address = wallet;
      const baseChains = ENABLED_CHAINS;

      const results = await Promise.all(
        baseChains.map(async (c) => {
          try {
            if (!alchemyClients[c]) {
              throw new Error(c + " not supported by alchemy-sdk (update alchemy-sdk or disable this chain).");
            }
            const bal = await alchemyClients[c].core.getBalance(address);
// ethers v5 BigNumber -> string
const nativeStr = Utils.formatEther(bal);
const nativeNum = Number(nativeStr);
const native = Number.isFinite(nativeNum)
  ? stripTrailingZeros(nativeNum.toFixed(6))
  : nativeStr;

// Phase 2: whitelisted tokens (per chain)
// Phase 2: tokens are fetched ONLY from (a) stable whitelist + (b) user-added tokens.
const stableSpecs = TOKEN_WHITELIST[c] || [];
const customSpecs = walletTokensByChain?.[c] || [];

// De-dupe by contract address.
const allSpecs = [];
const seen = new Set();
for (const t of [...stableSpecs, ...customSpecs]) {
  const addr = String(t?.address || "").toLowerCase();
  if (!addr || seen.has(addr)) continue;
  seen.add(addr);
  allSpecs.push({
    address: addr,
    symbol: String(t?.symbol || "").toUpperCase(),
    decimals: Number(t?.decimals ?? 18),
    name: String(t?.name || ""),
  });
}

const stables = {};
const custom = [];

if (allSpecs.length) {
  const resp = await alchemyClients[c].core.getTokenBalances(
    address,
    allSpecs.map((t) => t.address)
  );
  const byAddr = new Map(
    (resp?.tokenBalances || []).map((tb) => [
      String(tb?.contractAddress || "").toLowerCase(),
      tb?.tokenBalance,
    ])
  );

  const stableAddrSet = new Set(stableSpecs.map((t) => String(t?.address || "").toLowerCase()));

  for (const t of allSpecs) {
    const raw = byAddr.get(t.address) || "0x0";
    const bi = hexToBigInt(raw);
    const val = stripTrailingZeros(formatNativeFromWei(bi, t.decimals, 6));
    if (stableAddrSet.has(t.address)) {
      // For stables, show compact (2 decimals) unless tiny.
      const val2 = stripTrailingZeros(formatNativeFromWei(bi, t.decimals, 2));
      stables[t.symbol] = val2;
    } else {
      custom.push({ address: t.address, symbol: t.symbol, balance: val, decimals: t.decimals, name: t.name });
    }
  }
}

return [c, { native, stables, custom }];
          } catch (e) {
            return [c, { native: "—", error: String(e?.message || e || "error") }];
          }
        })
      );

      const out = {};
      for (const [c, v] of results) out[c] = v;
      setBalByChain(out);

      // Compute wallet total value in USD (best-effort; unpriced tokens are excluded from total).
      (async () => {
        try {
          setWalletUsdLoading(true);

          const chains = ENABLED_CHAINS.filter((c) => out?.[c]);
          const nativePx = await fetchNativeUsdPrices(chains);

          // Token prices (user-added tokens only; stables assumed $1)
          const tokenPxByChain = {};
          for (const c of chains) {
            const custom = out?.[c]?.custom || [];
            const addrs = custom.map((t) => t?.address).filter(Boolean);
            tokenPxByChain[c] = addrs.length ? await fetchTokenUsdPrices(c, addrs) : {};
          }

          // Save latest price maps for UI (wallet token price display).
          setWalletPx({ native: nativePx || {}, tokenByChain: tokenPxByChain || {}, ts: Date.now() });

const byChain = {};
          let total = 0;
          let unpriced = 0;

          for (const c of chains) {
            const row = out?.[c] || {};
            // native
            const nativeBal = Number(row?.native);
            const nPx = nativePx?.[c];
            const nativeVal = (Number.isFinite(nativeBal) && Number.isFinite(nPx)) ? nativeBal * nPx : 0;

            // stables (assume $1)
            const stablesMap = row?.stables || {};
            let stableVal = 0;
            for (const k of Object.keys(stablesMap || {})) {
              const b = Number(stablesMap?.[k]);
              if (Number.isFinite(b)) stableVal += b * 1.0;
            }

            // custom priced tokens
            let customVal = 0;
            for (const t of (row?.custom || [])) {
              const addr = String(t?.address || "").toLowerCase();
              const b = Number(t?.balance);
              const px = tokenPxByChain?.[c]?.[addr];
              if (Number.isFinite(b) && Number.isFinite(px)) customVal += b * px;
              else if (Number.isFinite(b) && b > 0) unpriced += 1;
            }

            const chainTotal = nativeVal + stableVal + customVal;
            byChain[c] = {
              total: chainTotal,
              native: nativeVal,
              stables: stableVal,
              custom: customVal,
            };
            total += chainTotal;
          }

          setWalletUsd({ total, byChain, unpriced, ts: Date.now() });
        } catch {
          // keep silent; balances still show
          setWalletUsd((prev) => ({ ...(prev || {}), total: prev?.total ?? null, ts: Date.now() }));

      // Grid budget locks (USD-based) so wallet can show "Available vs In bots"
      try {
        setGridBudgetsErr("");

        // Prefer per-chain budgets if backend supports it.
        // Fallback to legacy totals-only endpoint.
        let bdata = null;
        try {
          const budByChain = await api("/api/grid/budgets_by_chain", { method: "GET", token });
          bdata = budByChain?.data || budByChain;
        } catch (_) {
          const bud = await api("/api/grid/budgets", { method: "GET", token });
          bdata = bud?.data || bud;
        }

        const totals = (bdata && bdata.totals) ? bdata.totals : { locked_usd: 0, available_usd: 0 };
        const by_chain = (bdata && bdata.by_chain) ? bdata.by_chain : {};
        const items = (bdata && bdata.items) ? bdata.items : [];

        setGridBudgets({ totals, by_chain, items, ts: Date.now() });
      } catch (e) {
        // Don't break wallet balances if budgets fail
        setGridBudgetsErr(String(e?.message || e || "Failed to load grid budgets"));
        setGridBudgets((prev) => ({ ...(prev || {}), totals: prev?.totals ?? { locked_usd: 0, available_usd: 0 }, by_chain: prev?.by_chain ?? {}, items: prev?.items ?? [], ts: Date.now() }));
      }

        } finally {
          setWalletUsdLoading(false);
        }
      })();
    } catch (e) {
      setBalError(String(e?.message || e || "Failed to load balances"));
    } finally {
      setBalLoading(false);
    }
  };

  // Auto-refresh balances when the token list changes (add/remove),
  // so the user doesn't need to click Refresh manually.
  const walletTokensSig = useMemo(() => JSON.stringify(walletTokensByChain), [walletTokensByChain]);
  const didInitTokenAutoRefresh = useRef(false);
  useEffect(() => {
    if (!wallet) return;
    if (!didInitTokenAutoRefresh.current) {
      didInitTokenAutoRefresh.current = true;
      return;
    }
    const t = setTimeout(() => {
      refreshBalances();
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, walletTokensSig]);

  // Auto-load balances when the wallet panel is opened.
  // Auto-load balances once after wallet connect (so Grid coin list is populated without opening the wallet panel).
  const didAutoLoadBalances = useRef(false);
  useEffect(() => {
    if (!wallet) return;
    if (didAutoLoadBalances.current) return;
    didAutoLoadBalances.current = true;
    refreshBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  // Refresh balances when active chain changes (keeps UI + Grid coin list in sync).
  useEffect(() => {
    if (!wallet) return;
    refreshBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balActiveChain]);

  // Auto-load balances when the wallet panel is opened.
  useEffect(() => {
    if (!walletModalOpen) return;
    if (!wallet) return;
    refreshBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletModalOpen, wallet]);

  // watchlist
  const [watchItems, setWatchItems] = useLocalStorageState("nexus_watch_items", []);
  const [watchRows, setWatchRows] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_WATCH_ROWS_CACHE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [watchDragKey, setWatchDragKey] = useState("");
  const [watchDropKey, setWatchDropKey] = useState("");

  const [watchSyncedWallet, setWatchSyncedWallet] = useLocalStorageState("nexus_watch_synced_wallet", "");
  const [appStateSyncedWallet, setAppStateSyncedWallet] = useLocalStorageState("nexus_app_state_synced_wallet", "");
  const watchSyncBusyRef = useRef(false);
  const appStateHydratedRef = useRef(false);
  const prevWalletRef = useRef(String(wallet || "").toLowerCase());
  const appStateSyncBusyRef = useRef(false);
  const normalizeWatchItems = useCallback((items) => {
    const arr = Array.isArray(items) ? items : [];
    const out = [];
    const seen = new Set();

    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const mode = String(it?.mode || "market").toLowerCase();

      if (mode === "dex") {
        const contract = String(it?.contract || it?.tokenAddress || "").trim().toLowerCase();
        if (!contract) continue;
        const item = {
          ...it,
          mode: "dex",
          contract,
          tokenAddress: contract,
          symbol: String(it?.symbol || contract.slice(0, 10)).trim().toUpperCase(),
          chain: String(it?.chain || "pol").trim(),
        };
        const key = _watchKeyFromItem(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      } else {
        const symbol = String(it?.symbol || "").trim().toUpperCase();
        const cgId = String(it?.coingecko_id || it?.id || "").trim().toLowerCase();
        if (!symbol || !cgId) continue;
        const item = {
          ...it,
          mode: "market",
          symbol,
          coingecko_id: cgId,
          id: cgId,
          name: String(it?.name || symbol).trim(),
        };
        const key = _watchKeyFromItem(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(item);
      }
    }
    return out;
  }, []);

  const saveWatchlistToServer = useCallback(async (itemsArg) => {
    if (!wallet) return;
    try {
      const normalized = normalizeWatchItems(itemsArg);

      const clean = normalized.map((it) => {
        const mode = String(it?.mode || "market").toLowerCase();

        if (mode === "dex") {
          const contract = String(it?.contract || it?.tokenAddress || "").trim().toLowerCase();
          return {
            mode: "dex",
            contract,
            tokenAddress: contract,
            symbol: String(it?.symbol || "").trim().toUpperCase(),
            chain: String(it?.chain || "pol").trim(),
            name: String(it?.name || it?.symbol || "").trim(),
          };
        }

        const cgId = String(it?.coingecko_id || it?.id || "").trim().toLowerCase();
        return {
          mode: "market",
          id: cgId,
          coingecko_id: cgId,
          symbol: String(it?.symbol || "").trim().toUpperCase(),
          name: String(it?.name || it?.symbol || "").trim(),
        };
      });

      await api("/api/watchlist", {
        method: "POST",
        token,
        wallet,
        body: { wallet, items: clean },
      });
    } catch (e) {
      console.warn("watchlist save failed", e);
    }
  }, [wallet, token, normalizeWatchItems]);

  const syncWatchlistFromServer = useCallback(async () => {
    if (!wallet) {
      setWatchRows([]);
      return;
    }
    if (watchSyncBusyRef.current) return;
    watchSyncBusyRef.current = true;

    try {
      const r = await api(`/api/watchlist?wallet=${encodeURIComponent(wallet)}`, {
        method: "GET",
        token,
        wallet,
      });

      const serverItems = normalizeWatchItems(r?.items || []);
      const localItems = normalizeWatchItems(watchItems || []);

      const sig = (arr) => JSON.stringify((arr || []).map((x) => _watchKeyFromItem(x)).filter(Boolean));
      const serverSig = sig(serverItems);
      const localSig = sig(localItems);
      const neverSynced = String(watchSyncedWallet || "").toLowerCase() !== String(wallet || "").toLowerCase();

      if (neverSynced && !serverItems.length && localItems.length) {
        await saveWatchlistToServer(localItems);
        setWatchSyncedWallet(wallet);
        fetchWatchSnapshot(localItems, { force: true, user: false });
        return;
      }

      // Once a wallet has synced, server is the source of truth — even when empty.
      if (serverSig !== localSig || (!serverItems.length && localItems.length) || (serverItems.length && !localItems.length)) {
        setWatchItems(serverItems);
        try { localStorage.setItem("nexus_watch_items", JSON.stringify(serverItems)); } catch {}
      }
      setWatchSyncedWallet(wallet);
      fetchWatchSnapshot(serverItems, { force: true, user: false });
    } catch (e) {
      console.warn("watchlist sync failed", e);
      fetchWatchSnapshot();
    } finally {
      watchSyncBusyRef.current = false;
    }
  }, [wallet, token, watchItems, normalizeWatchItems, setWatchItems, watchSyncedWallet, setWatchSyncedWallet, saveWatchlistToServer]);
  const [compareSet, setCompareSet] = useLocalStorageState("nexus_compare_set", []);
  const compareSymbols = useMemo(() => {
    const uniq = [];
    for (const s of compareSet || []) {
      const sym = String(s || "").toUpperCase().trim();
      if (sym && !uniq.includes(sym)) uniq.push(sym);
    }
    return uniq.slice(0, 20);
  }, [compareSet]);

  // -------- Fixed color slots (10), stable per coin --------
  // Rule: coin keeps its color while selected; when removed, its slot becomes free for the next new coin.
  const colorSlotsRef = useRef(new Map()); // sym -> slot index (0..9)
  const freeSlotsRef = useRef(new Set(PALETTE20.map((_, i) => i)));

  const ensureColorSlot = (sym) => {
    const S = String(sym || "").toUpperCase();
    if (!S) return 0;
    const m = colorSlotsRef.current;
    if (m.has(S)) return m.get(S);
    const free = freeSlotsRef.current;
    const next = free.values().next().value;
    const idx = next !== undefined ? next : (m.size % PALETTE20.length);
    free.delete(idx);
    m.set(S, idx);
    return idx;
  };

  const releaseColorSlot = (sym) => {
    const S = String(sym || "").toUpperCase();
    if (!S) return;
    const m = colorSlotsRef.current;
    const idx = m.get(S);
    if (idx === undefined) return;
    m.delete(S);
    freeSlotsRef.current.add(idx);
  };

  // Keep mapping in sync with current compareSymbols.
  useEffect(() => {
    const current = new Set(compareSymbols);
    for (const sym of Array.from(colorSlotsRef.current.keys())) {
      if (!current.has(sym)) releaseColorSlot(sym);
    }
    compareSymbols.forEach((sym) => ensureColorSlot(sym));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareSymbols.join("|")]);

  const colorForSym = (sym) => PALETTE20[ensureColorSlot(sym) % PALETTE20.length];
  const lineClassForSym = (sym) => `line${(ensureColorSlot(sym) % PALETTE20.length) + 1}`;

  // compare/chart
  const [timeframe, setTimeframe] = useLocalStorageState("nexus_timeframe", "90D");
  const compareFetchRange = useMemo(() => _compareFetchRange(timeframe), [timeframe]);
  const PAIR_EXPLAIN_TF = "30D";

  // ------------------------
  // 2Y (from CoinGecko)
  // ------------------------
  // 2Y is available from the backend (CoinGecko). Always allow selecting 2Y.
  // We may still load data in the background, but we don't block selection.
  // timeframe (e.g. 90D) until 2Y is ready.
  const MIN_2Y_POINTS = 0; // 0 = no gating
  const [pendingTf, setPendingTf] = useState(null); // e.g. '2Y' while loading
  const pendingTfRef = useRef(null);
  useEffect(() => { pendingTfRef.current = pendingTf; }, [pendingTf]);

  const has2YData = useMemo(() => {
    if (!compareSymbols.length) return false;
    const cached2y = _cmpGetCached(compareSymbols, "2Y");
    if (!cached2y) return false;
    // Require all selected symbols to have enough 2Y points.
    return compareSymbols.every((s) => {
      const S = String(s || "").toUpperCase();
      const arr = cached2y?.[S];
      return Array.isArray(arr) && arr.length >= MIN_2Y_POINTS;
    });
  }, [compareSymbols.join("|"), timeframe]);

  // Safety: if localStorage remembers timeframe=2Y but we don't have data yet,
  // fall back to 90D (prevents blank/confusing chart states).
  useEffect(() => {
    if (String(timeframe || "").toUpperCase() === "2Y" && !has2YData) {
      setTimeframe("90D");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, has2YData]);

  // Access (NFT / Code) - UI only (stored locally). Later we can wire this to backend verification.
  // Access (NFT / Code) — backend driven (status + redeem)
  const [access, setAccess] = useState(null); // { active, until, source, tier, note }
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessTab, setAccessTab] = useState("redeem"); // 'redeem' | 'subscribe'

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  // Subscribe (USDC/USDT on ETH)
  // Single plan: PRO $15
  const SUB_PRICE_USD = 15;
  const SUB_PLAN = "pro";
  const [subChain, setSubChain] = useState("ETH"); // ETH | BNB | POL
  const [subToken, setSubToken] = useState("USDC"); // NATIVE | USDC | USDT
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState("");

  const refreshAccess = useCallback(async () => {
    if (!wallet) {
      setAccess(null);
      return;
    }
    try {
      const res = await api(`/api/access/status?addr=${encodeURIComponent(wallet)}`);
      const active = (res && res.active !== undefined) ? !!res.active : !!(res && res.plan && res.plan !== "free");
      setAccess(res ? { ...res, active } : null);
    } catch (e) {
      console.warn("access/status failed", e);
      // keep previous state
    }
  }, [wallet, api]);

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

  // Pro access: subscription or redeem code
  const isPro = !!(access?.active);

  const requirePro = useCallback((actionLabel = "This action") => {
    if (isPro) return true;
    // Open Access modal directly on Subscribe tab with a friendly message
    setAccessTab("subscribe");
    setAccessModalOpen(true);
    setSubMsg(`🔒 ${actionLabel} requires an active Nexus Pro subscription ($15/mo).`);
    return false;
  }, [isPro]);

  const redeemNow = useCallback(async () => {
    const code = (redeemCode || "").trim();
    if (!code) {
      setRedeemMsg("Bitte Code eingeben.");
      return;
    }
    if (!wallet) {
      setRedeemMsg("Wallet nicht verbunden.");
      return;
    }
    setRedeemBusy(true);
    setRedeemMsg("");
    try {
      const res = await api("/api/access/redeem", {
        method: "POST",
        body: { addr: wallet, code },
      });
      if (res?.ok === false) throw new Error(res?.error || "Redeem failed");
      setRedeemMsg(res?.message || "Aktiviert.");
      setRedeemCode("");
      setAccessModalOpen(false);
      await refreshAccess();
    } catch (e) {
      setRedeemMsg(e?.message || "Fehler beim Aktivieren.");
    } finally {
      setRedeemBusy(false);
    }
  }, [redeemCode, wallet, api, refreshAccess]);

  // Alias for UI handler (legacy name)
  const redeemAccess = redeemNow;

  // NFTs disabled in Phase 1 (UI + backend)

  const subscribePay = useCallback(async () => {
    if (!wallet) {
      setSubMsg("Wallet not connected.");
      return;
    }
    if (!TREASURY_ADDRESS) {
      setSubMsg("Missing treasury address (VITE_TREASURY_ADDRESS).");
      return;
    }

    setSubBusy(true);
    setSubMsg("");
    try {
      const chainKey = String(subChain || "ETH").toUpperCase();
      const chainIdMap = { ETH: 1, BNB: 56, POL: 137 };
      const chainId = chainIdMap[chainKey];
      if (!chainId) throw new Error("Unsupported chain.");

      // Ensure wallet is on the selected chain
      await _ensureChain(chainKey);

      let txHash = null;

      if (subToken === "NATIVE") {
        // Pay $15 in native coin (ETH/BNB/POL). We compute a small buffer (+2%)
        // to avoid underpay due to minor price movement.
        const px = (await fetchNativeUsdPrices([chainKey]))?.[chainKey];
        if (!px || !Number.isFinite(px) || px <= 0) throw new Error("Price feed unavailable.");
        const nativeAmt = (SUB_PRICE_USD / px) * 1.02; // +2% buffer
        const wei = BigInt(Math.floor(nativeAmt * 1e18));
        if (wei <= 0n) throw new Error("Invalid amount.");

        txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: wallet,
              to: TREASURY_ADDRESS,
              value: "0x" + wei.toString(16),
              data: "0x",
            },
          ],
        });

        // Verify + activate
        const res = await api("/api/access/subscribe/verify", {
          method: "POST",
          body: { chain_id: chainId, tx_hash: txHash, plan: SUB_PLAN, token_type: "native", token: chainKey },
        });

        setSubMsg(res?.already_verified ? "Payment already verified. Access updated." : "Payment verified. Access activated.");
      } else {
        // Pay with stablecoin (USDC/USDT) on the selected chain
        const specs = TOKEN_WHITELIST[chainKey] || [];
        const spec = specs.find((t) => t.symbol === subToken);
        if (!spec?.address) throw new Error("Token not supported on this chain.");

        const amountUnits = BigInt(SUB_PRICE_USD) * (10n ** BigInt(spec.decimals || 6));
        const data = _erc20TransferData(TREASURY_ADDRESS, amountUnits);

        txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: wallet,
              to: spec.address,
              data,
              value: "0x0",
            },
          ],
        });

        const res = await api("/api/access/subscribe/verify", {
          method: "POST",
          body: { chain_id: chainId, tx_hash: txHash, plan: SUB_PLAN, token_type: "erc20", token: subToken },
        });

        setSubMsg(res?.already_verified ? "Payment already verified. Access updated." : "Payment verified. Access activated.");
      }

      setAccessModalOpen(false);
      await refreshAccess();
    } catch (e) {
      setSubMsg(e?.message || "Payment failed.");
    } finally {
      setSubBusy(false);
    }
  }, [wallet, subChain, subToken, refreshAccess]);

  // Best-pair explain (click -> modal)
  const [selectedPair, setSelectedPair] = useState(null); // e.g. { pair:"BTC/ETH", score, corr }
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplainText, setAiExplainText] = useState("");
  const [aiExplainData, setAiExplainData] = useState(null);
  const [pairExplainSeries, setPairExplainSeries] = useState({}); // {SYM: [values...]}
  const [pairExplainLoading, setPairExplainLoading] = useState(false);

  function _pairSyms(p) {
    const s = (p || "").split("/");
    return [String(s[0] || "").trim().toUpperCase(), String(s[1] || "").trim().toUpperCase()];
  }

  function _retPctFromChart(sym) {
    try {
      const lines = chartRaw?.lines || {};
      const norm = normalizeToIndex(lines);
      const arr = norm[sym] || [];
      if (!arr.length) return null;
      const first = Number(arr[0]);
      const last = Number(arr[arr.length - 1]);
      if (!Number.isFinite(first) || !Number.isFinite(last) || !first) return null;
      return ((last - first) / first) * 100.0;
    } catch {
      return null;
    }
  }

  function _pctColorStyle(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return {};
  return { color: n >= 0 ? "#39d98a" : "#ff5c5c" };
}

function _fmtPctLocal(x) {
    if (x === null || x === undefined || !Number.isFinite(Number(x))) return "—";
    const n = Number(x);
    const sign = n > 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  }

  function _toMs(ts) {
    // accept seconds or ms
    const n = Number(ts);
    if (!Number.isFinite(n)) return null;
    return n < 1e11 ? n * 1000 : n;
  }

  function _fmtDay(ts) {
    const ms = _toMs(ts);
    if (!ms) return "—";
    const d = new Date(ms);
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getUTCFullYear()}`;
  }

  function _fmtDayFromIndex(i, total) {
    const now = new Date();
    const baseUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); // start of today (UTC)
    const daysAgo = (Math.max(0, (total - 1) - i));
    return _fmtDay(baseUtcMs - (daysAgo * 86400000));
  }

  function _dailyPctSeries(arr) {
    // arr: [{t, v}, ...] or [number,...]
    if (!Array.isArray(arr) || arr.length < 2) return [];
    const out = [];
    for (let i = 1; i < arr.length; i++) {
      const p0 = arr[i - 1];
      const p1 = arr[i];
      const v0 = (p0 && typeof p0 === "object") ? Number(p0.v) : Number(p0);
      const v1 = (p1 && typeof p1 === "object") ? Number(p1.v) : Number(p1);
      const t1 = (p1 && typeof p1 === "object") ? p1.t : i;
      if (!Number.isFinite(v0) || !Number.isFinite(v1) || !v0) continue;
      out.push({ t: t1, pct: ((v1 - v0) / v0) * 100.0 });
    }
    return out;
  }

  function _buildDailyRows(seriesMap, a, b, maxDays) {
    const aArr = seriesMap?.[a] || [];
    const bArr = seriesMap?.[b] || [];
    const aD = _dailyPctSeries(aArr);
    const bD = _dailyPctSeries(bArr);
    const n = Math.min(aD.length, bD.length);
    if (!n) return [];
    const rows = [];
    for (let i = 0; i < n; i++) {
      const ap = aD[i]?.pct;
      const bp = bD[i]?.pct;
      const t = aD[i]?.t ?? bD[i]?.t;
      rows.push({
        t,
        a: Number.isFinite(ap) ? ap : null,
        b: Number.isFinite(bp) ? bp : null,
        d: Number.isFinite(ap) && Number.isFinite(bp) ? (ap - bp) : null,
      });
    }
    // keep last maxDays rows
    const keep = Math.max(1, Number(maxDays) || 30);
    const kept = rows.slice(Math.max(0, rows.length - keep));

    // Force dates to be "today back N days" in UTC to avoid weird/old timestamps and timezone confusion.
    // This assumes the daily series is ordered oldest -> newest (which our backend series typically is).
    const now = new Date();
    const baseUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); // start of today (UTC)
    const k = kept.length;
    for (let i = 0; i < k; i++) {
      const daysAgo = (k - 1 - i);
      kept[i].t = baseUtcMs - (daysAgo * 86400000);
    }
    return kept;
  }

  function _calcSimpleRsi(arr, period = 14) {
    const pts = Array.isArray(arr) ? arr : [];
    if (pts.length < period + 1) return null;
    let gain = 0;
    let loss = 0;
    for (let i = pts.length - period; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const v0 = (prev && typeof prev === "object") ? Number(prev.v) : Number(prev);
      const v1 = (curr && typeof curr === "object") ? Number(curr.v) : Number(curr);
      if (!Number.isFinite(v0) || !Number.isFinite(v1)) continue;
      const diff = v1 - v0;
      if (diff > 0) gain += diff;
      else loss += Math.abs(diff);
    }
    const avgGain = gain / period;
    const avgLoss = loss / period;
    if (!Number.isFinite(avgGain) || !Number.isFinite(avgLoss)) return null;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  function _rsiBadgeState(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return { label: "n/a", tone: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.10)", color: "rgba(232,242,240,0.92)" };
    if (n > 70) return { label: "overbought", tone: "rgba(255,92,92,0.16)", border: "rgba(255,92,92,0.32)", color: "#ff8d8d" };
    if (n < 30) return { label: "oversold", tone: "rgba(57,217,138,0.16)", border: "rgba(57,217,138,0.32)", color: "#58e7a0" };
    return { label: "neutral", tone: "rgba(255,184,0,0.14)", border: "rgba(255,184,0,0.28)", color: "#ffd36a" };
  }

  function _seriesStatsFallback(arr) {
    const pts = Array.isArray(arr) ? arr : [];
    const vals = pts
      .map((p) => (p && typeof p === "object") ? Number(p.v) : Number(p))
      .filter((v) => Number.isFinite(v));
    if (vals.length < 2) return { volPct: null, maxDDPct: null };
    const rets = [];
    for (let i = 1; i < vals.length; i++) {
      const a = vals[i - 1];
      const b = vals[i];
      if (Number.isFinite(a) && Number.isFinite(b) && a !== 0) rets.push((b / a) - 1);
    }
    const mean = rets.length ? rets.reduce((s, x) => s + x, 0) / rets.length : 0;
    const variance = rets.length ? rets.reduce((s, x) => s + ((x - mean) ** 2), 0) / rets.length : 0;
    const volPct = rets.length ? Math.sqrt(variance) * 100 : null;
    let peak = vals[0];
    let maxDD = 0;
    for (const v of vals) {
      if (v > peak) peak = v;
      const dd = peak ? ((v / peak) - 1) * 100 : 0;
      if (dd < maxDD) maxDD = dd;
    }
    return { volPct, maxDDPct: maxDD };
  }

  function _pairQualityMeta(score) {
    const n = Number(score);
    if (!Number.isFinite(n)) {
      return {
        label: "Unclear Pair",
        color: "rgba(255,255,255,0.72)",
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.14)",
      };
    }
    if (n >= 90) {
      return {
        label: "Strong Pair",
        color: "#00ff88",
        bg: "rgba(0,255,136,0.08)",
        border: "rgba(0,255,136,0.55)",
      };
    }
    if (n >= 75) {
      return {
        label: "Good Pair",
        color: "#ffd36a",
        bg: "rgba(255,211,106,0.08)",
        border: "rgba(255,211,106,0.45)",
      };
    }
    if (n >= 60) {
      return {
        label: "Neutral Pair",
        color: "#ffaa00",
        bg: "rgba(255,170,0,0.08)",
        border: "rgba(255,170,0,0.42)",
      };
    }
    return {
      label: "Weak Pair",
      color: "#ff6b6b",
      bg: "rgba(255,107,107,0.08)",
      border: "rgba(255,107,107,0.45)",
    };
  }


  function openPairExplain(p) {
    setSelectedPair(p);
    setAiExplainText("");
    setAiExplainData(null);
    setAiExplainLoading(false);

    // No automatic chart sync here:
    // clicking a pair should only open the pair modal.

    // preload cached series for this pair + timeframe (refreshes automatically on new UTC day)
    const cached = _readPairExplainCache(p?.pair, PAIR_EXPLAIN_TF);
    if (cached) setPairExplainSeries(cached);
  }

  const inflightPairExplain = useRef(false);
  const pairExplainMemCache = useRef({}); // key -> { day: 'YYYY-MM-DD', series: {...} }

  function _utcDayKey() {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  function _pairExplainCacheKey(pairStr, tf) {
    const p = String(pairStr || "").toUpperCase().replace(/\s+/g, "");
    const t = String(tf || "").toUpperCase();
    return `pairExplain:${t}:${p}`;
  }

  function _readPairExplainCache(pairStr, tf) {
    const key = _pairExplainCacheKey(pairStr, tf);
    const day = _utcDayKey();

    // memory first
    const mem = pairExplainMemCache.current?.[key];
    if (mem?.day === day && mem?.series) return mem.series;

    // localStorage next
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj?.day !== day) return null;
      if (obj?.series) {
        pairExplainMemCache.current[key] = { day, series: obj.series };
        return obj.series;
      }
    } catch {}
    return null;
  }

  
function _buildDailyPctFromPrice(points, maxDays = 30) {
  // points: [{t, v}] where v=price. returns [{t, v}] where v=% change day-over-day
  if (!Array.isArray(points) || points.length < 2) return [];
  const dayLast = new Map(); // dayKey -> {t, v}
  for (const p of points) {
    const t = Number(p?.t);
    const v = Number(p?.v);
    if (!Number.isFinite(t) || !Number.isFinite(v) || t <= 0) continue;
    const d = new Date(t);
    const dayKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
    // keep the last point of the day
    dayLast.set(dayKey, { t, v });
  }
  const days = Array.from(dayLast.keys()).sort();
  if (days.length < 2) return [];
  const out = [];
  let prev = dayLast.get(days[0])?.v;
  for (let i = 1; i < days.length; i++) {
    const cur = dayLast.get(days[i]);
    if (!cur) continue;
    const pct = (prev && prev !== 0) ? ((cur.v - prev) / prev) * 100 : NaN;
    if (Number.isFinite(pct)) {
      // put timestamp at midday UTC for stable labels
      const [Y,M,D] = days[i].split("-").map(Number);
      const tMid = Date.UTC(Y, M-1, D, 12, 0, 0);
      out.push({ t: tMid, v: pct });
    }
    prev = cur.v;
  }
  return out.slice(-maxDays);
}

function _writePairExplainCache(pairStr, tf, series) {
    const key = _pairExplainCacheKey(pairStr, tf);
    const day = _utcDayKey();
    try {
      pairExplainMemCache.current[key] = { day, series };
      localStorage.setItem(key, JSON.stringify({ day, series }));
    } catch {}
  }

  async function ensurePairExplainSeries(pairStr) {
    if (!pairStr) return;
    const [a, b] = _pairSyms(pairStr);
    if (!a || !b) return;

    // Use cached daily series (refreshes automatically on new UTC day)
    const cached = _readPairExplainCache(pairStr, PAIR_EXPLAIN_TF);
    if (cached?.[a]?.length && cached?.[b]?.length) {
      setPairExplainSeries(cached);
      return;
    }

    // If we already have both, skip.
    if (pairExplainSeries?.[a]?.length && pairExplainSeries?.[b]?.length) return;
    if (inflightPairExplain.current) return;

    inflightPairExplain.current = true;
    setPairExplainLoading(true);
    try {
      const qs = new URLSearchParams({ symbols: `${a},${b}`, range: PAIR_EXPLAIN_TF }).toString();
      const r = await api(`/api/compare?${qs}`, { method: "GET" });

// Prefer backend-provided daily series for "Daily moves (last 30 days)".
// If backend doesn't send daily (or it's empty), derive it from the price series.
const hasDaily = !!(r?.daily && Object.keys(r.daily || {}).length);
const raw = hasDaily ? (r.daily || {}) : (r?.series || {});

// Normalize: backend may return points as [[ts_ms, price], ...]. UI expects {t, v}.
const series = {};
for (const [sym, pts] of Object.entries(raw || {})) {
  if (!Array.isArray(pts)) { series[sym] = []; continue; }
  if (pts.length && Array.isArray(pts[0])) {
    series[sym] = pts
      .map((p) => ({ t: Number(p?.[0] ?? 0), v: Number(p?.[1] ?? 0) }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t > 0);
  } else {
    series[sym] = pts
      .map((p) => ({ t: Number(p?.t ?? p?.time ?? p?.x ?? 0), v: Number(p?.v ?? p?.p ?? p?.y ?? 0) }))
      .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t > 0);
  }
}

if (!hasDaily) {
  // raw was price series -> convert to daily % moves
  for (const sym of Object.keys(series)) {
    series[sym] = _buildDailyPctFromPrice(series[sym], 30);
  }
}

setPairExplainSeries(series);
_writePairExplainCache(pairStr, PAIR_EXPLAIN_TF, series);
    } catch (e) {
      // keep silent; UI will show —
    } finally {
      inflightPairExplain.current = false;
      setPairExplainLoading(false);
    }
  }

  function _retPctFromSeries(seriesMap, sym) {
    try {
      const arr = seriesMap?.[sym] || [];
      if (!arr.length) return null;

      const firstPt = arr[0];
      const lastPt = arr[arr.length - 1];

      // backend series format can be:
// - [{t, v}, ...]
// - [[ts_ms, price], ...]
// - [number, ...] (rare fallback)
      const first = Array.isArray(firstPt) ? Number(firstPt?.[1]) : ((firstPt && typeof firstPt === "object") ? Number(firstPt.v) : Number(firstPt));
      const last  = Array.isArray(lastPt)  ? Number(lastPt?.[1])  : ((lastPt && typeof lastPt === "object") ? Number(lastPt.v) : Number(lastPt));

      if (!Number.isFinite(first) || !Number.isFinite(last) || !first) return null;
      return ((last - first) / first) * 100.0;
    } catch {
      return null;
    }
  }

  function _retPctForExplain(sym) {
    // Prefer dedicated pair series (works even if coin not selected in Compare chart)
    const x = _retPctFromSeries(pairExplainSeries, sym);
    if (Number.isFinite(x)) return x;
    // fallback to current chart
    return _retPctFromChart(sym);
  }

  useEffect(() => {
    if (!selectedPair?.pair) return;
    ensurePairExplainSeries(selectedPair.pair);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPair?.pair, timeframe]);

  async function runAiExplain() {
    if (!requirePro("AI explain")) return;
    if (!selectedPair) return;
    setAiExplainLoading(true);
    try {
      const [a, b] = _pairSyms(selectedPair.pair);
      const corr = Number(selectedPair?.corr);

      const windowDefs = ["7D", "30D", "90D", "1Y"];
      const pairWindows = {};
      for (const tf of windowDefs) {
        const sliced = sliceCompareSeries(pairExplainSeries || {}, tf);
        const stats = _seriesStatsFromSeriesMap(sliced, [a, b]);
        pairWindows[tf] = stats || {};
      }

      const getRet = (sym, tf) => {
        const st = pairWindows?.[tf]?.[sym];
        return Number.isFinite(Number(st?.changePct)) ? Number(st.changePct) : null;
      };

      const ra = getRet(a, "30D");
      const rb = getRet(b, "30D");
      const spread = (Number.isFinite(ra) && Number.isFinite(rb)) ? (ra - rb) : null;

      const winner = Number.isFinite(ra) && Number.isFinite(rb) ? (ra >= rb ? a : b) : null;
      const loser = Number.isFinite(ra) && Number.isFinite(rb) ? (ra >= rb ? b : a) : null;

      const classify = (v) => {
        if (!Number.isFinite(v)) return "n/a";
        if (v >= 8) return "bullish";
        if (v <= -8) return "bearish";
        return "neutral";
      };

      const avgRet = (tf) => {
        const aa = getRet(a, tf);
        const bb = getRet(b, tf);
        if (Number.isFinite(aa) && Number.isFinite(bb)) return (aa + bb) / 2;
        if (Number.isFinite(aa)) return aa;
        if (Number.isFinite(bb)) return bb;
        return null;
      };

      const trendStructure = windowDefs
        .map((tf) => `${tf} ${classify(avgRet(tf))}`)
        .join(" · ");

      const shortBias = classify(avgRet("30D"));
      const longBias = classify(avgRet("1Y"));

      let momentumShift = "Momentum is mixed across timeframes.";
      if (shortBias === "bearish" && longBias === "bullish") momentumShift = "Short-term weakness inside a stronger long-term structure.";
      else if (shortBias === "bullish" && longBias === "bearish") momentumShift = "Short-term recovery attempt against a weaker long-term backdrop.";
      else if (shortBias === longBias && shortBias !== "n/a") momentumShift = `Short-term and long-term momentum are aligned ${shortBias}.`;

      let setup = "Neutral";
      let confidence = 5.4;
      let confidenceLabel = "MEDIUM";
      let risk = "Medium";
      let gridMode = "Standard";
      let gridRange = "2–4%";
      let why = [];
      let verdictText = "This pair is interesting, but the signal is not strong enough for a clear structure yet.";

      if (Number.isFinite(corr)) {
        if (corr >= 0.9) confidence += 1.8;
        else if (corr >= 0.8) confidence += 1.2;
        else if (corr >= 0.65) confidence += 0.6;
        else if (corr < 0.45) confidence -= 1.4;
      }

      if (Number.isFinite(spread)) {
        const absSpread = Math.abs(spread);
        if (absSpread >= 4) confidence += 1.6;
        else if (absSpread >= 2) confidence += 1.0;
        else if (absSpread >= 1) confidence += 0.5;
        else confidence -= 0.4;
      }

      if (Number.isFinite(corr) && corr >= 0.8 && Number.isFinite(spread) && Math.abs(spread) >= 0.75 && winner && loser) {
        setup = "MEAN REVERSION";
        verdictText = `${winner} outperformed ${loser} over 30D. With relatively high correlation, the pair shows a mean-reversion style structure.`;
        why.push(`High correlation (${corr >= 0 ? "+" : ""}${corr.toFixed(2)}) means both coins often move together.`);
        why.push(`The performance spread of ${_fmtPctLocal(spread)} creates a visible imbalance between both sides.`);
        why.push(`${winner} is currently the stronger side, while ${loser} is the weaker side in this window.`);
        if (Math.abs(spread) >= 4) {
          gridMode = "Wide";
          gridRange = "4–6%";
          risk = "Medium-High";
        } else if (Math.abs(spread) >= 2) {
          gridMode = "Standard";
          gridRange = "3–5%";
          risk = "Medium";
        }
      } else if (Number.isFinite(corr) && corr < 0.45) {
        setup = "AVOID";
        confidence -= 1.2;
        confidenceLabel = "LOW";
        risk = "High";
        verdictText = "This pair is not moving together reliably enough for a clean paired structure.";
        why.push(`Low correlation (${Number.isFinite(corr) ? ((corr >= 0 ? "+" : "") + corr.toFixed(2)) : "—"}) weakens the paired logic.`);
        why.push("Pairs with weak correlation can drift apart instead of reverting.");
        why.push("This increases the chance of persistent divergence.");
        gridMode = "Wait";
        gridRange = "No setup";
      } else if (Number.isFinite(spread) && Math.abs(spread) < 0.75) {
        setup = "WAIT";
        confidence -= 0.6;
        confidenceLabel = "LOW-MED";
        risk = "Low-Medium";
        verdictText = "The pair is correlated enough, but the spread is still small and the structure remains less expressive.";
        why.push("The current performance gap is still narrow.");
        why.push("Without enough spread, the relative structure can feel random and weak.");
        why.push("A clearer imbalance usually creates a stronger read.");
        gridMode = "Wait";
        gridRange = "Below 2%";
      } else if (winner && loser) {
        setup = "TREND BIAS";
        confidence += 0.2;
        confidenceLabel = "MEDIUM";
        risk = "Medium-High";
        verdictText = `${winner} is stronger than ${loser}, but the pair does not yet qualify as a clean high-confidence paired structure.`;
        why.push("There is a leader and a laggard, but the data is not perfectly aligned for a strong reversion structure.");
        why.push("Mixed conditions increase the chance of continuation instead of catch-up.");
        why.push("The current profile looks more mixed than clean.");
      }

      confidence = Math.max(1, Math.min(10, Math.round(confidence * 10) / 10));
      if (confidence >= 8) confidenceLabel = "HIGH";
      else if (confidence <= 4.9) confidenceLabel = "LOW";

      const insightSummary =
        longBias === "bullish" && shortBias === "bearish"
          ? "Short-term pressure is visible, but the broader structure still looks stronger."
          : longBias === "bearish" && shortBias === "bullish"
            ? "There is a rebound attempt, but the broader structure remains weaker."
            : "The pair structure is currently mixed and should be monitored across multiple windows.";

      const localFallbackText = [
        `Trend Structure: ${trendStructure}`,
        `Momentum Shift: ${momentumShift}`,
        `Risk View: ${risk}`,
        `Interpretation: ${verdictText}`,
        `Insight Summary: ${insightSummary}`,
      ].join("\n")


      const pairStats = pairWindows?.["30D"] || {};
      const payload = {
        kind: "explain",
        symbols: [a, b].filter(Boolean),
        profile: "balanced",
        timeframe: String(timeframe || "90D").toUpperCase(),
        index_mode: !!indexMode,
        series_stats: pairStats,
        insight_windows: pairWindows,
        question:
          `Analyze the current pair structure for ${a} vs ${b}. ` +
          `Use the pair statistics, multi-timeframe context, and the wallet-bound order memory only to describe structure, behavior, and risk posture. ` +
          `Do not tell the user what to do. ` +
          `Current pair correlation: ${Number.isFinite(corr) ? corr.toFixed(2) : "n/a"}. ` +
          `30D spread: ${Number.isFinite(spread) ? spread.toFixed(2) + "%" : "n/a"}. ` +
          `Short bias: ${shortBias}. Long bias: ${longBias}.`,
      };

      let backendText = "";
      if (!token) throw new Error("Please reconnect your wallet to authorize AI.");
      try {
        const r = await api("/api/ai/insight", { method: "POST", token, body: payload });
		console.log("AI RESPONSE:", r);  
        backendText =
          r?.answer ??
          r?.output ??
          r?.text ??
          r?.message ??
          (typeof r === "string" ? r : "");
      } catch {
        backendText = "";
      }

      const finalText = buildCompactAiInsight({
        backendText,
        trendStructure,
        momentumShift,
        insightSummary,
      });
      setAiExplainText(finalText);
      setAiExplainData({
        setup,
        confidence,
        confidenceLabel,
        risk,
        gridMode,
        gridRange,
        why,
        verdictText: finalText,
        winner,
        loser,
        corr,
        trendStructure,
        momentumShift,
        insightSummary,
        windows: pairWindows,
      });
    } catch (e) {
      setAiExplainText("");
      setAiExplainData(null);
    } finally {
      setAiExplainLoading(false);
    }
  }

  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSeries, setCompareSeries] = useState(() => {
    // Prefer per-(timeframe+symbols) cache so reloads feel instant
    const cached = _cmpGetCached(compareSymbols, _compareFetchRange(timeframe));
    if (cached) return cached;

    // Fallback: legacy single-bucket cache
    try {
      const raw = localStorage.getItem(LS_COMPARE_SERIES_CACHE);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const lastGoodCompareRef = useRef(null);
  const compareAbortRef = useRef(null);
  const lastCompareFetchRef = useRef(0);
  const compareRetryRef = useRef({ key: "", n: 0, t: null });
  const compareFailRetryRef = useRef({ key: "", n: 0, t: null });

  // seed "last good" on first load
  useEffect(() => {
    if (!lastGoodCompareRef.current && compareSeries && Object.keys(compareSeries).length) {
      lastGoodCompareRef.current = compareSeries;
    }
  }, []);

  // Keep compareSeries in sync with compareSymbols so removing coins never leaves "ghost" lines
  // (compare fetch is throttled; this prunes immediately even if fetchCompare returns early)
  const prevCompareSymbolsRef = useRef(compareSymbols);

  useEffect(() => {
    // prune local series immediately
    setCompareSeries((prev) => {
      const next = {};
      for (const s of compareSymbols || []) {
        if (prev && prev[s]) next[s] = prev[s];
      }
      lastGoodCompareRef.current = next;
      try { localStorage.setItem(LS_COMPARE_SERIES_CACHE, JSON.stringify(next)); } catch {}
      return next;
    });

    // If symbols decreased (removal), bypass throttle once to refresh from backend
    const prevSyms = prevCompareSymbolsRef.current || [];
    const removed = prevSyms.length > (compareSymbols || []).length;
    prevCompareSymbolsRef.current = compareSymbols;

    if (removed) fetchCompare({ force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareSymbols.join("|")]);

  const [indexMode, setIndexMode] = useLocalStorageState("nexus_index_mode", true);
  const [viewMode, setViewMode] = useState("overlay"); // overlay | grid
  const [comparePage, setComparePage] = useState("first10"); // first10 | next10 | all
  const [highlightedSyms, setHighlightedSyms] = useState([]);
  const [showTop10Pairs, setShowTop10Pairs] = useState(true);
  const [gridModalSym, setGridModalSym] = useState(null);

  useEffect(() => {
    setHighlightedSyms((prev) => {
      const allowed = new Set((compareSymbols || []).map((s) => String(s || "").toUpperCase()));
      return (Array.isArray(prev) ? prev : [])
        .map((s) => String(s || "").toUpperCase())
        .filter((s) => allowed.has(s));
    });
  }, [compareSymbols.join("|")]);

  useEffect(() => {
    const sym = String(gridModalSym || "").toUpperCase().trim();
    if (!sym) return;
    if (!(compareSymbols || []).includes(sym)) setGridModalSym(null);
  }, [gridModalSym, compareSymbols.join("|")]);

  const compareSeriesView = useMemo(() => sliceCompareSeries(compareSeries, timeframe), [compareSeries, timeframe]);

  const visibleCompareSymbols = useMemo(() => {
    if (comparePage === "first10") return compareSymbols.slice(0, 10);
    if (comparePage === "next10") return compareSymbols.slice(10, 20);
    return compareSymbols;
  }, [compareSymbols, comparePage]);

  const visibleHighlightedSyms = useMemo(() => {
    const visibleSet = new Set((visibleCompareSymbols || []).map((s) => String(s || "").toUpperCase()));
    return (highlightedSyms || []).filter((s) => visibleSet.has(String(s || "").toUpperCase()));
  }, [highlightedSyms, visibleCompareSymbols]);

  const visibleCompareSeriesView = useMemo(() => {
    const out = {};
    for (const sym of visibleCompareSymbols || []) {
      out[sym] = compareSeriesView?.[sym] || [];
    }
    return out;
  }, [visibleCompareSymbols, compareSeriesView]);

  // Chart uses the *view* timeframe (default 90D), but analytics like "best pairs" still use full data (1Y/2Y)
  const chartRaw = useMemo(() => buildUnifiedChart(visibleCompareSeriesView), [visibleCompareSeriesView]);
  const chartRawFull = useMemo(() => buildUnifiedChart(compareSeries), [compareSeries]);
  const gridModalChart = useMemo(() => {
    const sym = String(gridModalSym || "").toUpperCase().trim();
    if (!sym) return { x: [], lines: {}, order: [] };
    return buildUnifiedChart({ [sym]: compareSeriesView?.[sym] || [] });
  }, [gridModalSym, compareSeriesView]);
  const gridModalRow = useMemo(() => {
    const sym = String(gridModalSym || "").toUpperCase().trim();
    return sym ? (watchRows || []).find((r) => String(r?.symbol || "").toUpperCase() === sym) || null : null;
  }, [gridModalSym, watchRows]);
    const bestPairsAll = useMemo(() => computeBestPairsFromSeries(compareSeries, 1000), [compareSeries]);
  const bestPairsToShow = useMemo(() => (showTop10Pairs ? bestPairsAll.slice(0, 10) : bestPairsAll), [showTop10Pairs, bestPairsAll]);

  // grid (manual)
  // Grid UI works with symbols; backend grid endpoints are keyed by item_id.
  const [gridItem, setGridItem] = useState(() => {
    try {
      const chain = (localStorage.getItem("nexus_wallet_bal_chain") || DEFAULT_CHAIN || "POL").toUpperCase();
      return localStorage.getItem(`${LS_GRID_COIN_PREFIX}:${chain}`) || chain;
    } catch (_) {
      return DEFAULT_CHAIN;
    }
  });
  const [gridUiHydrated, setGridUiHydrated] = useState(false);
  // Derived identifiers for backend grid endpoints (stable across refreshes)
  const uiChainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
  const activeGridChainKey = useMemo(() => {
    const sym = String(gridItem || "").toUpperCase().trim();
    if (["POL", "BNB", "ETH"].includes(sym)) return sym;
    return String(balActiveChain || wsChainKey || DEFAULT_CHAIN).toUpperCase();
  }, [gridItem, balActiveChain, wsChainKey]);

  const gridItemId = useMemo(() => {
    const sym = String(gridItem || "").toUpperCase().trim();
    if (!sym) return "";
    return `${activeGridChainKey}:${sym}`;
  }, [activeGridChainKey, gridItem]);

  // If the selected grid coin is a native coin, re-read the Vault on that chain after refresh.
  // Important: do NOT mutate wallet chain state here. We only force the vault read itself.
  useEffect(() => {
    const sym = String(gridItem || "").toUpperCase().trim();
    if (!wallet) return;
    if (!["POL", "BNB", "ETH"].includes(sym)) return;

    const t1 = setTimeout(() => { try { refreshVaultState(sym); } catch (_) {} }, 250);
    const t2 = setTimeout(() => { try { refreshVaultState(sym); } catch (_) {} }, 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [wallet, gridItem]);

const [gridNativeUsd, setGridNativeUsd] = useState({});

// Ensure native coin USD price is available for POL/BNB/ETH even if they are not in the watchlist.
// This fixes Grid "Price: --" when the watch snapshot doesn't include the native symbol.
useEffect(() => {
  const sym = String(gridItem || "").toUpperCase();
  if (!["ETH", "BNB", "POL"].includes(sym)) return;

  (async () => {
    try {
      const px = await fetchNativeUsdPrices([sym]);
      if (px && px[sym] != null) {
        setGridNativeUsd((prev) => ({ ...(prev || {}), [sym]: px[sym] }));
      }
    } catch {
      // ignore
    }
  })();
}, [gridItem]);
  // Grid coin source: wallet holdings only (native + stables + user-added tokens).
  // This avoids showing market/watchlist items that cannot be traded from the wallet.
  const gridWalletCoins = useMemo(() => {
    const chain = String(balActiveChain || DEFAULT_CHAIN).toUpperCase();
    const row = balByChain?.[chain] || {};
    const out = [];

    // native coin of the active chain (ETH / POL / BNB)
    out.push(chain);

    // stables present on this chain (USDC/USDT etc.)
    const stablesMap = row?.stables || {};
    for (const k of Object.keys(stablesMap)) out.push(String(k).toUpperCase());

    // user-added tokens
    const custom = row?.custom || [];
    for (const t of custom) {
      const sym = String(t?.symbol || "").toUpperCase().trim();
      if (sym) out.push(sym);
    }

    // unique
    const seen = new Set();
    const uniq = [];
    for (const s of out) {
      const k = String(s || "").toUpperCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      uniq.push(k);
    }
    return uniq;
  }, [balByChain, balActiveChain]);

  // Keep selected grid coin valid when chain/balances change
  useEffect(() => {
    if (!gridUiHydrated) return;
    if (!gridWalletCoins.length) return;
    const cur = String(gridItem || "").toUpperCase();
    if (!cur || !gridWalletCoins.includes(cur)) {
      setGridItem(gridWalletCoins[0]);
    }
  }, [gridUiHydrated, gridWalletCoins, gridItem]);

  // Restore the last used grid coin for the active wallet chain immediately after refresh.
  // Without this, the wallet tab can show the right chain (e.g. POL) while the Grid still
  // points to the default chain/coin until the user clicks the chain again.
  useEffect(() => {
    if (!gridUiHydrated) return;
    const chain = String(balActiveChain || DEFAULT_CHAIN).toUpperCase();
    if (!chain) return;
    try {
      const saved = String(localStorage.getItem(`${LS_GRID_COIN_PREFIX}:${chain}`) || "").toUpperCase();
      if (saved && saved !== String(gridItem || "").toUpperCase()) {
        setGridItem(saved);
        return;
      }
    } catch (_) {}
    if (["ETH", "POL", "BNB"].includes(chain) && String(gridItem || "").toUpperCase() !== chain) {
      setGridItem(chain);
    }
  }, [gridUiHydrated, balActiveChain]);

  // Persist the selected grid coin per chain so refresh restores the same working context.
  useEffect(() => {
    if (!gridUiHydrated) return;
    const chain = String(balActiveChain || DEFAULT_CHAIN).toUpperCase();
    const sym = String(gridItem || "").toUpperCase();
    if (!chain || !sym) return;
    try { localStorage.setItem(`${LS_GRID_COIN_PREFIX}:${chain}`, sym); } catch (_) {}
  }, [gridUiHydrated, balActiveChain, gridItem]);

  const [gridAutoPath, setGridAutoPath] = useState(true); // V2 -> V3 fallback (EVM)

  // const uiChainKey defined above (useMemo) 

  const isEthChain = String(uiChainKey || "").toUpperCase().includes("ETH");

  const [gridInvestQty, setGridInvestQty] = useState(250);
  const [gridMeta, setGridMeta] = useState({ tick: null, price: null });
  const [gridOrders, setGridOrders] = useState([]);
  const [gridOrdersOpen, setGridOrdersOpen] = useState(false);
  const [gridVaultStats, setGridVaultStats] = useState({ vault: 0, reserved: 0, free: 0 });
  // Helper: extract order id from different backend schemas
  const idOf = (o) => o?.order_id ?? o?.orderId ?? o?.id ?? o?._id ?? o?.uuid ?? null;

  // Normalize orders coming from backend/polling so the UI can't show duplicates.
  // (Some backend revisions may return the same order twice during eventual consistency.)

  useEffect(() => {
    if (gridOrders.length === 0) {
      setGridOrdersOpen(false);
      return;
    }
    if (gridOrders.length <= 3) {
      setGridOrdersOpen(true);
    }
  }, [gridOrders.length]);

  const normalizeGridOrders = useCallback(
    (arr) => {
      if (!Array.isArray(arr)) return [];
      const seen = new Set();
      const out = [];
      for (const o of arr) {
        const id = idOf(o);
        const key = id != null ? String(id) : JSON.stringify(o);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(o);
      }
      return out;
    },
    [idOf]
  );

  const [manualSide, setManualSide] = useState("BUY");
  const [manualPrice, setManualPrice] = useState("");
  const [manualBuyMode, setManualBuyMode] = useState("QTY"); // USD | QTY (only used for BUY)
  const [manualUsd, setManualUsd] = useState("");
  const [manualSlippagePct, setManualSlippagePct] = useState(5); // %
  const [manualDeadlineMin, setManualDeadlineMin] = useState(20); // minutes
  const GRID_PRICE_PRESETS = useMemo(
    () => ({
      FAST: [0.25, 0.5, 1],
      STANDARD: [0.5, 1, 2],
      WIDE: [1, 2, 3],
      VERY_WIDE: [5, 10, 15],
    }),
    []
  );
  const [manualPricePreset, setManualPricePreset] = useState("STANDARD");
  const gridQuickSteps = useMemo(() => {
    const arr = GRID_PRICE_PRESETS?.[manualPricePreset] || GRID_PRICE_PRESETS?.STANDARD || [0.5, 1, 2];
    return Array.isArray(arr) ? arr : [0.5, 1, 2];
  }, [GRID_PRICE_PRESETS, manualPricePreset]);
  const [manualQty, setManualQty] = useState("");
  const [manualPayoutAsset, setManualPayoutAsset] = useState("USDC");
  const currentPayoutAssets = useMemo(() => {
    const ck = String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase();
    const base = ["USDC", "USDT", ck];
    const uniq = [];
    for (const a of base) {
      const v = String(a || "").toUpperCase().trim();
      if (!v || uniq.includes(v)) continue;
      uniq.push(v);
    }
    return uniq;
  }, [activeGridChainKey]);
  const visiblePayoutAssets = useMemo(() => currentPayoutAssets.slice(0, 2), [currentPayoutAssets]);
  const extraPayoutAssets = useMemo(() => currentPayoutAssets.slice(2), [currentPayoutAssets]);
  const [payoutMenuOpen, setPayoutMenuOpen] = useState(false);
  const payoutMenuRef = useRef(null);
  useEffect(() => {
    if (!currentPayoutAssets.length) return;
    const cur = String(manualPayoutAsset || "").toUpperCase();
    if (!currentPayoutAssets.includes(cur)) {
      setManualPayoutAsset(currentPayoutAssets[0]);
    }
  }, [currentPayoutAssets, manualPayoutAsset]);
  useEffect(() => {
    if (!payoutMenuOpen) return;
    const onDown = (e) => {
      if (payoutMenuRef.current && !payoutMenuRef.current.contains(e.target)) {
        setPayoutMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [payoutMenuOpen]);
  const [gridOrderChainOpen, setGridOrderChainOpen] = useState({});

  // AI
  const [aiSelected, setAiSelected] = useLocalStorageState("nexus_ai_selected", []);
  const syncAppStateFromServer = useCallback(async () => {
    if (!wallet) {
      appStateHydratedRef.current = true;
      return;
    }
    if (appStateSyncBusyRef.current) return;
    appStateSyncBusyRef.current = true;
    try {
      const r = await api(`/api/app-state?wallet=${encodeURIComponent(wallet)}`, { method: "GET", token, wallet });
      const state = r?.state || {};
      const serverCompare = Array.isArray(state?.compare) ? state.compare.map((x) => String(x || "").toUpperCase()).filter(Boolean).slice(0, 20) : [];
      const serverTf = String(state?.timeframe || "90D").toUpperCase();
      const serverIndex = state?.indexMode == null ? true : !!state.indexMode;
      const serverAi = Array.isArray(state?.aiSelected) ? state.aiSelected.map((x) => String(x || "").toUpperCase()).filter(Boolean).slice(0, 6) : [];
      const neverSynced = String(appStateSyncedWallet || "").toLowerCase() !== String(wallet || "").toLowerCase();
      const hasLocal = (Array.isArray(compareSet) && compareSet.length) || (Array.isArray(aiSelected) && aiSelected.length) || String(timeframe || "90D").toUpperCase() !== "90D" || !!indexMode === false;
      const hasServer = serverCompare.length || serverAi.length || serverTf !== "90D" || serverIndex !== true;

      if (neverSynced && !hasServer && hasLocal) {
        await api("/api/app-state", {
          method: "POST",
          token,
          wallet,
          body: { wallet, compare: compareSet, timeframe, indexMode, aiSelected },
        });
        setAppStateSyncedWallet(wallet);
      } else {
        // Keep the larger/local compare selection so an older server state (e.g. 10 coins)
        // does not kick out newly selected coins after hydration.
        const localCompare = Array.isArray(compareSet)
          ? compareSet.map((x) => String(x || "").toUpperCase()).filter(Boolean)
          : [];
        const mergedCompare = Array.from(new Set([...localCompare, ...serverCompare])).slice(0, 20);

        setCompareSet(mergedCompare);
        setTimeframe(serverTf || "90D");
        setIndexMode(!!serverIndex);
        setAiSelected(serverAi);
        setAppStateSyncedWallet(wallet);
      }
    } catch (e) {
      console.warn("app-state sync failed", e);
    } finally {
      appStateHydratedRef.current = true;
      appStateSyncBusyRef.current = false;
    }
  }, [wallet, token, compareSet, timeframe, indexMode, aiSelected, appStateSyncedWallet, setCompareSet, setTimeframe, setIndexMode, setAiSelected, setAppStateSyncedWallet]);

  useEffect(() => {
    syncAppStateFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  useEffect(() => {
    if (!wallet || !appStateHydratedRef.current) return;
    const payload = {
      wallet,
      compare: Array.isArray(compareSet) ? compareSet : [],
      timeframe,
      indexMode,
      aiSelected: Array.isArray(aiSelected) ? aiSelected : [],
    };
    const t = setTimeout(async () => {
      if (appStateSyncBusyRef.current) return;
      appStateSyncBusyRef.current = true;
      try {
        await api("/api/app-state", { method: "POST", token, wallet, body: payload });
        setAppStateSyncedWallet(wallet);
      } catch (e) {
        console.warn("app-state save failed", e);
      } finally {
        appStateSyncBusyRef.current = false;
      }
    }, 300);
    return () => clearTimeout(t);
  }, [wallet, token, compareSet, timeframe, indexMode, aiSelected, setAppStateSyncedWallet]);

  const resetWalletBoundUi = useCallback(({ clearAuth = false } = {}) => {
    try {
      if (watchRetryRef.current?.t) {
        clearTimeout(watchRetryRef.current.t);
      }
    } catch {}
    watchRetryRef.current = { key: "", n: 0, t: null };
    watchSyncBusyRef.current = false;
    appStateSyncBusyRef.current = false;
    appStateHydratedRef.current = false;
    inflightWatch.current = false;
    watchRefreshQueued.current = false;

    setWatchItems([]);
    setWatchRows([]);
    setCompareSet([]);
    setTimeframe("90D");
    setIndexMode(true);
    setAiSelected([]);
    setCompareSeries({});
    lastGoodCompareRef.current = {};
    setWatchSyncedWallet("");
    setAppStateSyncedWallet("");
    try { setGridOrders([]); } catch {}
    try { setGridMeta({ tick: null, price: null }); } catch {}
    try { setGridVaultStats({ vault: 0, reserved: 0, free: 0 }); } catch {}
    try { setGridUiHydrated(false); } catch {}
    if (clearAuth) {
      try { setWallet(""); } catch {}
      try { setToken(""); } catch {}
      try { setPrivyJwt(""); } catch {}
    }

    const keys = [
      "nexus_watch_items",
      "nexus_watch_synced_wallet",
      "nexus_app_state_synced_wallet",
      "nexus_compare_set",
      "nexus_timeframe",
      "nexus_ai_selected",
      LS_WATCH_ROWS_CACHE,
      LS_COMPARE_SERIES_CACHE,
      LS_COMPARE_STORE,
      LS_WATCH_REMOVED,
    ];
    if (clearAuth) {
      keys.push("nexus_wallet", "nexus_token");
    }
    for (const key of keys) {
      try { localStorage.removeItem(key); } catch {}
    }
  }, [setWatchItems, setWatchRows, setCompareSet, setTimeframe, setIndexMode, setAiSelected, setCompareSeries, setWatchSyncedWallet, setAppStateSyncedWallet, setGridOrders, setGridMeta, setGridVaultStats, setGridUiHydrated, setWallet, setToken, setPrivyJwt]);

  useEffect(() => {
    const prev = prevWalletRef.current || "";
    const curr = String(wallet || "").toLowerCase();
    if (prev && prev !== curr) {
      resetWalletBoundUi({ clearAuth: !curr });
    }
    prevWalletRef.current = curr;
  }, [wallet, resetWalletBoundUi]);

  const [aiKind, setAiKind] = useState("analysis");
  const [aiProfile, setAiProfile] = useState("balanced");
const [aiQuestion, setAiQuestion] = useState("");
  
  const [aiFollowUp, setAiFollowUp] = useState(false);
  const [aiHistory, setAiHistory] = useState([]); // [{role:"user"|"assistant", content:string}]
const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  // watch snapshot polling
  const inflightWatch = useRef(false);
  const watchRefreshQueued = useRef(false);
  const watchRetryRef = useRef({ key: "", n: 0, t: null });

  const fillMissingWatchMarketData = useCallback(async (rowsArg, itemsArg) => {
    const rows = Array.isArray(rowsArg) ? rowsArg : [];
    const items = Array.isArray(itemsArg) ? itemsArg : [];
    const marketMissing = rows.filter((r) => {
      const mode = String(r?.mode || "market").toLowerCase();
      const p = Number(r?.price);
      return mode === "market" && (!Number.isFinite(p) || p <= 0);
    });
    if (!marketMissing.length) return rows;

    // Build symbol <-> CoinGecko id hints from both rows and watch items.
    const itemBySym = new Map(
      items
        .map((it) => [String(it?.symbol || "").toUpperCase(), it])
        .filter(([sym]) => !!sym)
    );

    const marketById = {};
    const ids = Array.from(new Set(
      marketMissing
        .map((r) => {
          const sym = String(r?.symbol || "").toUpperCase();
          const item = itemBySym.get(sym);
          return String(r?.coingecko_id || r?.id || item?.coingecko_id || item?.id || "").trim().toLowerCase();
        })
        .filter(Boolean)
    ));

    // Strongest fallback first: exact CoinGecko ids.
    if (ids.length) {
      try {
        const qs = new URLSearchParams({
          ids: ids.join(","),
          vs_currencies: "usd",
          include_24hr_change: "true",
          include_24hr_vol: "true",
        }).toString();
        const cg = await api(`/api/coingecko/simple_price?${qs}`, { method: "GET", token, wallet });
        for (const [id, data] of Object.entries(cg || {})) {
          const p = Number(data?.usd);
          if (!Number.isFinite(p) || p <= 0) continue;
          marketById[String(id || "").toLowerCase()] = {
            price: p,
            change24h: Number(data?.usd_24h_change),
            volume24h: Number(data?.usd_24h_vol),
            source: "coingecko-id",
          };
        }
      } catch (e) {
        console.warn("coingecko id fallback failed", e);
      }
    }

    const nativeSyms = Array.from(new Set(
      marketMissing.map((r) => String(r?.symbol || "").toUpperCase()).filter((s) => ["ETH","BNB","POL","MATIC"].includes(s))
    ));
    const nativeMap = {};
    if (nativeSyms.length) {
      try {
        const px = await fetchNativeUsdPrices(nativeSyms.map((s) => (s === "MATIC" ? "POL" : s)));
        for (const [k, v] of Object.entries(px || {})) {
          nativeMap[k === "POL" ? "POL" : k] = Number(v);
        }
        if (nativeMap.POL && !nativeMap.MATIC) nativeMap.MATIC = nativeMap.POL;
      } catch {}
    }

    const otherSyms = Array.from(new Set(
      marketMissing
        .map((r) => String(r?.symbol || "").toUpperCase())
        .filter(Boolean)
        .filter((s) => !nativeMap[s])
    ));
    const otherMap = {};
    if (otherSyms.length) {
      try {
        const priceResp = await api(`/api/prices?symbols=${encodeURIComponent(otherSyms.join(","))}`, { method: "GET", token, wallet });
        const priceMap = priceResp?.prices || {};
        for (const [sym, data] of Object.entries(priceMap || {})) {
          const p = Number(data?.price);
          if (Number.isFinite(p) && p > 0) {
            otherMap[String(sym || "").toUpperCase()] = {
              price: p,
              change24h: Number(data?.change24h ?? data?.chg_24h),
              volume24h: Number(data?.volume24h ?? data?.vol),
              source: "price-fallback",
            };
          }
        }
      } catch (e) {
        console.warn("supplemental market prices failed", e);
      }
    }

    let changed = false;
    const next = rows.map((row) => {
      const sym = String(row?.symbol || "").toUpperCase();
      const cur = Number(row?.price);
      if (Number.isFinite(cur) && cur > 0) return row;

      const item = itemBySym.get(sym);
      const cgId = String(row?.coingecko_id || row?.id || item?.coingecko_id || item?.id || "").trim().toLowerCase();
      const exact = (cgId && marketById[cgId]) ? marketById[cgId] : null;
      const fallback = exact || (nativeMap[sym] ? { price: nativeMap[sym], source: "native-fallback" } : null) || otherMap[sym];

      const p = Number(fallback?.price);
      if (!Number.isFinite(p) || p <= 0) return row;

      changed = true;
      const ch24 = Number.isFinite(Number(fallback?.change24h)) ? Number(fallback.change24h) : row?.change24h ?? row?.chg_24h ?? null;
      const v24 = Number.isFinite(Number(fallback?.volume24h)) ? Number(fallback.volume24h) : row?.volume24h ?? row?.vol ?? null;

      return {
        ...row,
        coingecko_id: row?.coingecko_id || row?.id || cgId || undefined,
        id: row?.id || row?.coingecko_id || cgId || undefined,
        price: p,
        change24h: ch24,
        chg_24h: ch24,
        volume24h: v24,
        vol: v24,
        source: row?.source === "error" || row?.source === "pending" || !row?.source ? (fallback?.source || "price-fallback") : row.source,
      };
    });

    if (!changed) return rows;
    try { localStorage.setItem(LS_WATCH_ROWS_CACHE, JSON.stringify(next)); } catch {}
    setWatchRows(next);
    return next;
  }, [token, wallet, setWatchRows]);

  const fetchWatchSnapshot = async (itemsOverride = null, opts = {}) => {
    if (!wallet && !opts?.allowGuest) {
      setWatchRows([]);
      return;
    }
    if (inflightWatch.current) {
      // If a refresh is requested while a snapshot is already in-flight, queue exactly one refresh.
      watchRefreshQueued.current = true;
      return;
    }
    inflightWatch.current = true;
    try {
      const r = await api("/api/watchlist/snapshot", { method: "POST", token, wallet, body: { wallet, items: (itemsOverride ?? watchItems) } });
      const nextRowsRaw = (r?.results || r?.rows || []);
      // Merge-only rule: watchItems is the source of truth. Never resurrect removed items.
      const allowedKeys = new Set(((itemsOverride ?? watchItems) || []).map(_watchKeyFromItem));
      const tomb = _loadTombstones();
      const nextRows = (Array.isArray(nextRowsRaw) ? nextRowsRaw : []).filter((row) => {
        const k = _watchKeyFromRow(row);
        if (tomb && tomb[k] != null) return false;
        // Also drop anything not in current watchItems (never replace by snapshot).
        return allowedKeys.has(k);
      });
      let mergedRows = [];
      setWatchRows((prev0) => {
        const prev = Array.isArray(prev0) ? prev0 : [];
        const prevMap = new Map(prev.map((r) => [_watchKeyFromRow(r), r]));
        const nextMap = new Map((nextRows || []).map((r) => [_watchKeyFromRow(r), r]));
        const itemsSrc = (itemsOverride ?? watchItems) || [];
        const merged = [];

        // Ensure one row per watch item (source of truth), preserving any existing placeholder rows
        for (const it of itemsSrc) {
          const k = _watchKeyFromItem(it);
          const row = nextMap.get(k) || prevMap.get(k) || {
            symbol: String(it?.symbol || "").toUpperCase(),
            mode: String(it?.mode || "market"),
            coingecko_id: String(it?.coingecko_id || it?.id || ""),
            id: String(it?.coingecko_id || it?.id || ""),
            name: it?.name || String(it?.symbol || "").toUpperCase(),
            price: null,
            chg_24h: null,
            vol: null,
            source: "pending",
          };
          merged.push(row);
          nextMap.delete(k);
        }

        // Add any remaining rows returned by backend that are still allowed (should be none, but keep safe)
        for (const [k, row] of nextMap.entries()) {
          if (allowedKeys.has(k)) merged.push(row);
        }

        mergedRows = merged;
        try { localStorage.setItem(LS_WATCH_ROWS_CACHE, JSON.stringify(merged)); } catch {}
        return merged;
      });
      try {
        await fillMissingWatchMarketData(mergedRows, (itemsOverride ?? watchItems) || []);
      } catch {}
      if ((r?.results || r?.rows || []).length) {
        const symUp = String(gridItem || "").toUpperCase();
        const list = (r?.results || r?.rows || []);
        const exists = (list || []).some((x) => String(x.symbol || "").toUpperCase() === symUp);
        if (!exists && (list || []).length) setGridItem(String(list[0].symbol || "BTC").toUpperCase());
      }

      // If backend is warming up (new coin), rows may temporarily show source="error"/missing price.
      // Retry a couple times quickly so user doesn't need a full page refresh.
      const _items = (itemsOverride ?? watchItems) || [];
      const _key = Array.isArray(_items)
        ? _items
            .map((w) => String(w?.symbol || "").toUpperCase())
            .filter(Boolean)
            .sort()
            .join("|")
        : "";
      const _hasErrors = Array.isArray(nextRows) && nextRows.some((x) => {
        const src = String(x?.source || "").toLowerCase();
        const p = x?.price;
        return src === "error" || p == null || p === "—" || (typeof p === "string" && !p.trim());
      });

      if (!_hasErrors) {
        // reset retry state when good data arrives
        if (watchRetryRef.current.t) { try { clearTimeout(watchRetryRef.current.t); } catch {} }
        watchRetryRef.current = { key: _key, n: 0, t: null };
      } else if (_key) {
        if (watchRetryRef.current.key !== _key) {
          // new selection -> reset counter
          if (watchRetryRef.current.t) { try { clearTimeout(watchRetryRef.current.t); } catch {} }
          watchRetryRef.current = { key: _key, n: 0, t: null };
        }
        if (watchRetryRef.current.n < 5) {
          const delay = 1200 * (watchRetryRef.current.n + 1);
          const nnext = watchRetryRef.current.n + 1;
          if (watchRetryRef.current.t) { try { clearTimeout(watchRetryRef.current.t); } catch {} }
          watchRetryRef.current.t = setTimeout(() => {
            watchRetryRef.current.n = nnext;
            fetchWatchSnapshot(itemsOverride, { ...opts, force: true });
          }, delay);
        }
      }
    } catch (e) {
      setErrorMsg(`Watchlist: ${e.message}`);
    } finally {
      inflightWatch.current = false;
      if (watchRefreshQueued.current) {
        // Run exactly one queued refresh after the current one completes.
        watchRefreshQueued.current = false;
        // Force refresh so we don't get blocked by any internal guards.
        fetchWatchSnapshot(itemsOverride, { ...opts, force: true });
      }
    }
  };

  useEffect(() => {
    syncWatchlistFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);
  useInterval(syncWatchlistFromServer, 45000, !!wallet);
  useInterval(syncAppStateFromServer, 45000, !!wallet);

  useEffect(() => {
    const onFocusSync = () => {
      syncWatchlistFromServer();
      syncAppStateFromServer();
    };
    window.addEventListener("focus", onFocusSync);
    document.addEventListener("visibilitychange", onFocusSync);
    return () => {
      window.removeEventListener("focus", onFocusSync);
      document.removeEventListener("visibilitychange", onFocusSync);
    };
  }, [syncWatchlistFromServer, syncAppStateFromServer]);

  // 🔁 Refetch snapshot immediately when watchlist changes (so newly added coins get data without full page refresh)
  const watchlistKey = useMemo(() => {
  const arr = Array.isArray(watchItems) ? watchItems : [];
  // Use full unique key (mode + id/contract + symbol) so adding tokens or same-symbol variants triggers refresh immediately.
  return arr
    .map((w) => {
      const sym = String(w?.symbol || "").toUpperCase().trim();
      const mode = String(w?.mode || "market").toLowerCase();
      const id = String(w?.coingecko_id || w?.id || "").toLowerCase();
      const addr = String(w?.contract || w?.tokenAddress || "").toLowerCase();
      return `${mode}|${sym}|${id || addr}`;
    })
    .filter(Boolean)
    .join("|");
}, [watchItems]);

  useEffect(() => {
    if (!watchItems || !watchItems.length) return;
    fetchWatchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistKey]);

  // compare fetch (batched /api/compare)
  const inflightCompare = useRef(false);
  const fetchCompare = async (opts = {}) => {
    if (!compareSymbols.length) {
      // Clear chart immediately when nothing is selected (prevents stale cache lines)
      setCompareSeries({});
      lastGoodCompareRef.current = {};
      try { localStorage.setItem(LS_COMPARE_SERIES_CACHE, JSON.stringify({})); } catch {}
      if (compareRetryRef.current.t) { try { clearTimeout(compareRetryRef.current.t); } catch {} }
      compareRetryRef.current = { key: "", n: 0, t: null };
      return;
    }

    // simple throttle so UI changes don't spam the backend
    const now = Date.now();
    if (!opts.force && now - lastCompareFetchRef.current < 800) return;
    lastCompareFetchRef.current = now;

    // Abort previous in-flight compare request
    if (compareAbortRef.current) {
      try { compareAbortRef.current.abort(); } catch {}
    }
    const ac = new AbortController();
    compareAbortRef.current = ac;

    // Show cached series immediately (SWR) so chart renders without waiting for backend
    // NOTE: fetchRange can be overridden (used for preloading 2Y while keeping UI timeframe at 90D).
    const fetchRange = (opts && opts.fetchRangeOverride) ? String(opts.fetchRangeOverride).toUpperCase() : _compareFetchRange(timeframe);
    const cached = _cmpGetCached(compareSymbols, fetchRange);
    if (cached && Object.keys(cached || {}).length) {
      setCompareSeries(cached);
      lastGoodCompareRef.current = cached;
    }

    setCompareLoading(true);
    try {
      const syms = compareSymbols.slice(0, 20).join(",");
      const url = `${API_BASE}/api/compare?symbols=${encodeURIComponent(syms)}&range=${encodeURIComponent(fetchRange)}`;
      const r = await fetch(url, { method: "GET", credentials: "include", headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, signal: ac.signal });

      let data = null;
      try { data = await r.json(); } catch { data = null; }

      if (!r.ok) {
        const msg = (data && (data.error || data.message)) ? (data.error || data.message) : `HTTP ${r.status}`;
        throw new Error(msg);
      }

      // reset HTTP-failure retry state on any successful HTTP response
      {
        const cmpKeyHTTP = compareSymbols.join("|");
        if (compareFailRetryRef.current.t) { try { clearTimeout(compareFailRetryRef.current.t); } catch {} }
        compareFailRetryRef.current = { key: cmpKeyHTTP, n: 0, t: null };
      }

      if (data && data.series) {
        const normalized = normalizeBackendSeries(data.series);
        // Ensure all currently selected symbols exist as keys (even if empty)
        for (const s of compareSymbols) {
          const S = String(s || "").toUpperCase();
          if (S && !Object.prototype.hasOwnProperty.call(normalized, S)) normalized[S] = [];
        }

        // If some selected coins are still warming up (empty series), retry a couple times.
        const cmpKey = compareSymbols.join("|");
        const missing = compareSymbols.filter((s) => {
          const S = String(s || "").toUpperCase();
          return !S || !Array.isArray(normalized[S]) || normalized[S].length === 0;
        });

        if (!missing.length) {
          if (compareRetryRef.current.t) { try { clearTimeout(compareRetryRef.current.t); } catch {} }
          compareRetryRef.current = { key: cmpKey, n: 0, t: null };
        } else {
          if (compareRetryRef.current.key !== cmpKey) {
            if (compareRetryRef.current.t) { try { clearTimeout(compareRetryRef.current.t); } catch {} }
            compareRetryRef.current = { key: cmpKey, n: 0, t: null };
          }
          if (compareRetryRef.current.n < 2) {
            const delay = 1400 * (compareRetryRef.current.n + 1);
            const nnext = compareRetryRef.current.n + 1;
            if (compareRetryRef.current.t) { try { clearTimeout(compareRetryRef.current.t); } catch {} }
            compareRetryRef.current.t = setTimeout(() => {
              compareRetryRef.current.n = nnext;
              fetchCompare({ force: true });
            }, delay);
          }
        }

        const hasAny = Object.values(normalized).some((arr) => Array.isArray(arr) && arr.length);
        if (hasAny) {
          setCompareSeries(normalized);
          lastGoodCompareRef.current = normalized;
          try { localStorage.setItem(LS_COMPARE_SERIES_CACHE, JSON.stringify(normalized)); } catch {}
          _cmpPutCached(compareSymbols, fetchRange, normalized);

          // If we were preloading 2Y, only switch UI to 2Y once data is actually sufficient.
          if (String(fetchRange).toUpperCase() === "2Y" && pendingTfRef.current === "2Y") {
            const ok2y = compareSymbols.every((s) => {
              const S = String(s || "").toUpperCase();
              const arr = normalized?.[S];
              return Array.isArray(arr) && arr.length >= MIN_2Y_POINTS;
            });
            setPendingTf(null);
            if (ok2y) {
              setTimeframe("2Y");
            } else {
              // Keep current timeframe (e.g. 90D) and inform user.
              setErrorMsg("2Y Daten sind noch nicht verfügbar (zu wenig Historie gesammelt)." );
            }
          }
        } else if (lastGoodCompareRef.current) {
          setCompareSeries(lastGoodCompareRef.current);
        }
      } else if (lastGoodCompareRef.current) {
        // keep last-good series if backend returns empty
        setCompareSeries(lastGoodCompareRef.current);
      }
    } catch (e) {
      // If request was aborted, ignore silently
      if (e && (e.name === "AbortError" || String(e).includes("AbortError"))) return;

      // keep last good data (no UI errors)
      if (lastGoodCompareRef.current) {
        setCompareSeries(lastGoodCompareRef.current);
      }

      // Auto-retry on transient backend/network failures so users don't need to refresh.
      // This is separate from the "missing series" warm-up retry above.
      try {
        const cmpKeyHTTP = compareSymbols.join("|");
        if (compareFailRetryRef.current.key !== cmpKeyHTTP) {
          if (compareFailRetryRef.current.t) { try { clearTimeout(compareFailRetryRef.current.t); } catch {} }
          compareFailRetryRef.current = { key: cmpKeyHTTP, n: 0, t: null };
        }
        const maxRetries = 3;
        const online = (typeof navigator === "undefined") ? true : (navigator.onLine !== false);
        if (online && compareFailRetryRef.current.n < maxRetries) {
          const nnext = compareFailRetryRef.current.n + 1;
          // backoff: 1.2s, 2.4s, 4.8s
          const delay = 1200 * Math.pow(2, compareFailRetryRef.current.n);
          if (compareFailRetryRef.current.t) { try { clearTimeout(compareFailRetryRef.current.t); } catch {} }
          compareFailRetryRef.current.t = setTimeout(() => {
            compareFailRetryRef.current.n = nnext;
            fetchCompare({ force: true });
          }, delay);
        }
      } catch {}

      // If we were preloading 2Y, clear pending state on failure.
      try {
        if (String(fetchRange).toUpperCase() === "2Y" && pendingTfRef.current === "2Y") {
          setPendingTf(null);
        }
      } catch {}

      // still log for debugging
      // eslint-disable-next-line no-console
      console.warn("compare fetch failed:", e);
    } finally {
      setCompareLoading(false);
    }
  };

  useEffect(() => {
    fetchCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareFetchRange, compareSymbols.join("|")]);

  useInterval(fetchCompare, 120000, compareSymbols.length > 0);

  // policy (UI-only for now)

  // grid
  
// Hydrate grid chain/item from backend once per wallet.
// Backend is the source of truth across devices, so do not trust local defaults on refresh.
useEffect(() => {
  let cancelled = false;
  if (!walletAddress) {
    setGridUiHydrated(false);
    return;
  }

  (async () => {
    try {
      const r = await api("/api/grid/ui/state", {
        method: "GET",
        token,
        wallet: walletAddress,
      });
      if (cancelled) return;

      const srvChain = String(r?.active_chain ?? r?.activeChain ?? "").toUpperCase().trim();
      const srvItem = String(r?.active_item ?? r?.activeItem ?? "").trim();
      const srvSym = srvItem ? String(srvItem.split(":").pop() || "").toUpperCase().trim() : "";

      if (srvChain && ENABLED_CHAINS.includes(srvChain)) {
        setBalActiveChain((prev) => (String(prev || "").toUpperCase() === srvChain ? prev : srvChain));
        setWsChainKey((prev) => (String(prev || "").toUpperCase() === srvChain ? prev : srvChain));
      }
      if (srvSym) {
        setGridItem((prev) => (String(prev || "").toUpperCase() === srvSym ? prev : srvSym));
      }
    } catch (_) {
      // keep local fallback if backend UI state is unavailable
    } finally {
      if (!cancelled) setGridUiHydrated(true);
    }
  })();

  return () => { cancelled = true; };
}, [walletAddress, token]);

// After hydration and on every chain/item switch, ask backend for the authoritative grid context.
// This fixes the stale-chain issue where the UI only became correct after toggling BNB -> POL manually.
useEffect(() => {
  let cancelled = false;
  if (!gridUiHydrated || !walletAddress || !gridItemId) return;

  (async () => {
    try {
      const params = new URLSearchParams({
        chain: activeGridChainKey,
        item: gridItemId,
        wallet: walletAddress,
        addr: walletAddress,
      });
      const r = await api(`/api/grid/init?${params.toString()}`, {
        method: "GET",
        token,
        wallet: walletAddress,
      });
      if (cancelled) return;
      if (r?.status && String(r.status).toLowerCase() === "error") return;

      const srvChain = String(r?.active_chain ?? r?.loaded_chain ?? activeGridChainKey).toUpperCase().trim();
      const srvItemId = String(r?.active_item ?? r?.loaded_item_id ?? gridItemId).trim();
      const srvSym = srvItemId ? String(srvItemId.split(":").pop() || "").toUpperCase().trim() : "";

      if (srvChain && ENABLED_CHAINS.includes(srvChain)) {
        setBalActiveChain((prev) => (String(prev || "").toUpperCase() === srvChain ? prev : srvChain));
        setWsChainKey((prev) => (String(prev || "").toUpperCase() === srvChain ? prev : srvChain));
      }
      if (srvSym && srvSym !== String(gridItem || "").toUpperCase().trim()) {
        setGridItem(srvSym);
      }

      const initOrdersRaw = getGridOrdersFromResponse(r);
      if (Array.isArray(initOrdersRaw)) {
        const initOrders = normalizeGridOrders(initOrdersRaw);
        setGridOrders(initOrders);
      }

      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
      applyGridMetaResponse(r, srvItemId || gridItemId);
      if (r?.vault_state) setVaultState((prev) => ({ ...(prev || {}), ...(r.vault_state || {}) }));
    } catch (e) {
      setErrorMsg((prev) => prev || `Grid init: ${e?.message || e}`);
    }
  })();

  return () => { cancelled = true; };
}, [gridUiHydrated, walletAddress, token, activeGridChainKey, gridItemId]);

const [gridBusy, setGridBusy] = useState({
  start: false,
  stop: false,
  add: false,
  stopOrderId: null,
  deleteOrderId: null,
});

const isGridReady = useMemo(() => {
  return !!walletAddress && !!gridItemId && gridUiHydrated;
}, [walletAddress, gridItemId, gridUiHydrated]);

const mergeGridMetaStable = useCallback((prev, incoming) => {
  const out = { ...(prev || {}), ...(incoming || {}) };
  const prevTick = Number(prev?.tick || 0);
  const nextTick = Number(incoming?.tick || 0);

  if (Number.isFinite(prevTick) && prevTick > 0) {
    if (!Number.isFinite(nextTick) || nextTick <= 0) {
      out.tick = prevTick;
    } else {
      // Never let stale/alternate streams move the tick backwards.
      if (nextTick < prevTick) out.tick = prevTick;
      // Forward jumps are allowed so the visible tick can continue advancing.
    }
  } else if (Number.isFinite(nextTick) && nextTick > 500) {
    // When no stable tick exists yet, ignore obviously wrong large counter values.
    out.tick = prev?.tick ?? null;
  }

  const prevPrice = Number(prev?.price || 0);
  const nextPrice = Number(incoming?.price || 0);
  if (Number.isFinite(prevPrice) && prevPrice > 0 && (!Number.isFinite(nextPrice) || nextPrice <= 0)) {
    out.price = prevPrice;
  }
  return out;
}, []);

const applyGridMetaResponse = useCallback((r, fallbackItemId = gridItemId) => {
  setGridMeta((prev) => {
    const incoming = getGridMetaFromResponse(r, { ...prev, gridItemId: fallbackItemId });
    return mergeGridMetaStable(prev, incoming);
  });
}, [gridItemId, mergeGridMetaStable]);

useEffect(() => {
  if (!gridItemId) return;
  setGridOrders([]);
  setGridVaultStats({ vault: 0, reserved: 0, free: 0 });
}, [gridItemId]);

const fetchGridOrders = useCallback(async () => {
  // Only fetch when wallet + backend grid context are ready.
  // Do not require the backend auth token here: api() can fall back to API key + wallet header,
  // and requiring token caused empty grid state after refresh on some devices until auth finished.
  if (!gridUiHydrated || !gridItemId || !walletAddress) return;

  try {
    // Be permissive with query param naming across backend revisions.
    // Some deployments use `addr`, others `wallet`.
    const params = new URLSearchParams({
      item: gridItemId,
      chain: activeGridChainKey,
      addr: walletAddress,
      wallet: walletAddress,
    });

    const r = await api(`/api/grid/orders?${params.toString()}`, {
      method: "GET",
      token,
    wallet: walletAddress,
    });

    // If auth isn't ready yet, NEVER overwrite current UI state
    if (r?.unauthenticated || r?.data?.unauthenticated) {
      return;
    }

    setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));

    const nextOrdersRaw = r?.orders ?? r?.data?.orders;

    // Do not clear orders if backend didn't return an orders array (transient HTML/errors/etc.)
    if (!Array.isArray(nextOrdersRaw)) return;

    const nextOrders = normalizeGridOrders(nextOrdersRaw);
    setGridOrders(nextOrders);

	try {
      const sym = String(gridItem || "").toUpperCase().trim();
      if (["POL", "BNB", "ETH"].includes(sym)) {
        setTimeout(() => { try { refreshVaultState(sym); } catch (_) {} }, 500);
      }
    } catch (_) {}

    applyGridMetaResponse(r, gridItemId);
  } catch (e) {
    // Keep existing orders on transient errors; just surface message
    setErrorMsg(`Grid orders: ${e.message}`);
  }
}, [gridUiHydrated, gridItemId, activeGridChainKey, walletAddress, token, normalizeGridOrders, gridItem, refreshVaultState]);

// Auto-load orders as soon as wallet/auth becomes ready (e.g. after refresh)
useEffect(() => {
  if (!isGridReady) return;
  fetchGridOrders();
}, [isGridReady, fetchGridOrders]);

const kickGridRefresh = useCallback(() => {
  try { fetchGridOrders(); } catch (_) {}
  setTimeout(() => { try { fetchGridOrders(); } catch (_) {} }, 400);
  setTimeout(() => { try { fetchGridOrders(); } catch (_) {} }, 1400);
}, [fetchGridOrders]);

useInterval(
  () => {
    fetchGridOrders();
  },
  10000,
  !!isGridReady &&
    !gridBusy.start &&
    !gridBusy.stop &&
    !gridBusy.add &&
    !gridBusy.stopOrderId &&
    !gridBusy.deleteOrderId &&
    gridOrders.some((o) => String(o?.status || "").toUpperCase() === "OPEN")
);

// Execute polling: this is the real trigger that makes BUY/SELL fire.
useInterval(
  async () => {
    if (!gridItemId || !walletAddress) return;
    try {
      const r = await setGridExecute(gridItemId);
      applyGridMetaResponse(r, gridItemId);
      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));

      const execOrdersRaw = getGridOrdersFromResponse(r);
      if (Array.isArray(execOrdersRaw)) {
        const execOrders = normalizeGridOrders(execOrdersRaw);
        setGridOrders(execOrders);
      }

      try {
        const sym = String(gridItem || "").toUpperCase().trim();
        if (["POL", "BNB", "ETH"].includes(sym)) {
          setTimeout(() => { try { refreshVaultState(sym); } catch (_) {} }, 500);
        }
      } catch (_) {}
    } catch (_) {
      // silent: polling should never spam the UI
    }
  },
  3000,
  !!isGridReady &&
    !!gridItemId &&
    !!walletAddress &&
    !gridBusy.start &&
    !gridBusy.stop &&
    !gridBusy.add &&
    !gridBusy.stopOrderId &&
    !gridBusy.deleteOrderId &&
    gridOrders.some((o) => String(o?.status || "").toUpperCase() === "OPEN")
);

  async function gridStart() {
    console.log("[GRID] Start clicked");
    setErrorMsg("");

if (gridBusy.start) return;
if (!isGridReady) {
  setErrorMsg("Grid not ready yet (connect wallet + select coin).");
  return;
}
setGridBusy((s) => ({ ...s, start: true }));

    // NOTE: Do not silently block the button. Always hit backend so Network shows a request.
    // Backend will validate subscription / vault prerequisites and return a clear error if needed.

    // Safety: Grid runs autonomously via backend operator + Vault funds.
    // Require: Vault has budget deposited and operator is enabled (so backend can trade without further user signatures).
    const chainKeyPre = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
    const want = Number(gridInvestQty) || 0;
    const have = Number(vaultState?.polBalance || 0);

    // Friendly UI guidance instead of crashing:
    // If prerequisites are missing, open the Vault modal and pre-fill the required deposit amount.
    if (!vaultState?.operatorEnabled) {
      setErrorMsg("Vault setup required: Please enable the Grid Operator (Vault → Enable Operator) once.");
      setWsChainKey(chainKeyPre);
      setWithdrawSendOpen(true);
      // (no hard return)
    }
    if (!want || want <= 0) {
      setErrorMsg("Set a Budget (Qty) amount > 0.");
      // (no hard return)
    }
    if (have <= 0) {
      setErrorMsg("Vault has 0 balance. Please deposit funds into the Vault first.");
      setWsChainKey(chainKeyPre);
      setDepositAmt(String(want));
      setWithdrawSendOpen(true);
      // (no hard return)
    }
    if (want > have + 1e-12) {
      const needed = Math.max(0, want - have);
      setErrorMsg(`Not enough Vault funds. Deposit +${needed.toFixed(6)} native into the Vault to start.`);
      setWsChainKey(chainKeyPre);
      setDepositAmt(String(needed));
      setWithdrawSendOpen(true);
      // (no hard return)
    }

    try {
      const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const curPriceNum = Number(gridMeta?.price ?? 0) || 0;
      const investQty = Number(gridInvestQty) || 0;
      const investUsd = (investQty > 0 && curPriceNum > 0) ? (investQty * curPriceNum) : investQty;
      const itemId =
        gridItemId ||
        gridMeta?.gridItemId ||
        gridMeta?.itemId ||
        gridMeta?.id ||
        `${chainKey}:${String(gridItem || "").toUpperCase()}`; // fallback
      const body = {
        item: gridItemId,
        // Include wallet so backend's anon-grid mode (GRID_ALLOW_ANON=1) can authorize.
        addr: walletAddress || undefined,
        order_mode: "MANUAL",
        // Vault budget is in native units (POL/BNB/ETH). Backend may ignore unknown keys; keep invest_usd for backwards compatibility; invest_qty is the new canonical key.
        invest_native: investQty,
        invest_qty: investQty,
        invest_usd: investUsd,
        budget_qty: investQty,
        budget_usd: investUsd,
        chain: chainKey,
        auto_path: !!gridAutoPath,
      };
      const r = await api("/api/grid/cycle/start", { method: "POST", token, body });
      applyGridMetaResponse(r, itemId);
      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
      const startOrdersRaw = getGridOrdersFromResponse(r);
      if (Array.isArray(startOrdersRaw)) {
        const startOrders = normalizeGridOrders(startOrdersRaw);
        setGridOrders(startOrders);
      }
      setGridBusy((s) => ({ ...s, stop: false }));
      kickGridRefresh();
      setGridBusy((s) => ({ ...s, start: false }));
} catch (e) {
      setErrorMsg(`Grid start: ${e.message}`);
      setGridBusy((s) => ({ ...s, start: false }));
    }
  }

async function setGridExecute(itemIdArg = "") {
  const itemId = String(
    itemIdArg ||
    gridItemId ||
    gridMeta?.gridItemId ||
    gridMeta?.itemId ||
    gridMeta?.id ||
    `${(balActiveChain || wsChainKey || DEFAULT_CHAIN)}:${String(gridItem || "").toUpperCase()}`
  ).trim();
  if (!itemId) throw new Error("Missing grid item for execute.");

  const frontendPriceCandidates = [
    shownGridPrice,
    gridLiveFallback,
    gridNativeUsd?.[String(gridItem || "").toUpperCase()],
    gridMeta?.price,
  ];
  const frontendPrice = frontendPriceCandidates
    .map((v) => Number(v))
    .find((v) => Number.isFinite(v) && v > 0);

  return await api("/api/grid/execute", {
    method: "POST",
    token,
    wallet: walletAddress,
    body: {
      item: itemId,
      addr: walletAddress || undefined,
      wallet: walletAddress || undefined,
      price: frontendPrice,
      current_price: frontendPrice,
      market_price: frontendPrice,
    },
  });
}

  async function gridStop() {
    setErrorMsg("");

if (gridBusy.stop) return;
if (!isGridReady) {
  setErrorMsg("Grid not ready yet (connect wallet + select coin).");
  return;
}
setGridBusy((s) => ({ ...s, stop: true }));

    try {
	  const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
      const itemId =
        gridItemId ||
        gridMeta?.gridItemId ||
        gridMeta?.itemId ||
        gridMeta?.id ||
        `${chainKey}:${String(gridItem || "").toUpperCase()}`;
      const r = await api("/api/grid/stop", { method: "POST", token, wallet: walletAddress, body: { item: gridItemId, addr: walletAddress || undefined }, });
      applyGridMetaResponse(r, itemId);
      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
      const stopOrdersRaw = getGridOrdersFromResponse(r);
      if (Array.isArray(stopOrdersRaw)) {
        const stopOrders = normalizeGridOrders(stopOrdersRaw);
        setGridOrders(stopOrders);
      }
      setGridBusy((s) => ({ ...s, stop: false }));
      kickGridRefresh();
    } catch (e) {
      setErrorMsg(`Grid stop: ${e.message}`);
      setGridBusy((s) => ({ ...s, stop: false }));
    }
  }

  async function addManualOrder() {
    setErrorMsg("");
    if (!token) return setErrorMsg("");
    if (!requirePro("Placing a new order")) return;
    if (!gridItemId) return setErrorMsg('Select coin first.');
    if (gridBusy.add) return;
    if (!isGridReady) {
      setErrorMsg("Grid not ready yet (connect wallet + select coin).");
      return;
    }
    setGridBusy((s) => ({ ...s, add: true }));
try {
      const price = Number(manualPrice);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Invalid price.");

      const slp = Math.min(20, Math.max(0.1, Number(manualSlippagePct) || 5));
      const dlm = Math.min(120, Math.max(5, Number(manualDeadlineMin) || 20));
      const deadlineSec = Math.floor(dlm * 60);
      const body = {
        item: gridItemId,
        addr: walletAddress || undefined,
        wallet: walletAddress || undefined,
        side: manualSide,
        price,
        chain: String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase(),
        payout_asset: String(manualPayoutAsset || "USDC").toUpperCase(),
        payoutAsset: String(manualPayoutAsset || "USDC").toUpperCase(),
        settlement_mode: "swap_on_fill_hold_until_withdraw",
        slippage_bps: Math.round(slp * 100),
        deadline_sec: deadlineSec,
      };

      
// Qty-only: all coins/tokens are entered as quantity (also USDC/USDT)
const qty = manualQty === "" ? undefined : Number(manualQty);
if (qty === undefined || !Number.isFinite(qty) || qty <= 0) throw new Error("Invalid Qty amount.");
body.qty = qty;

	// Canonical endpoint is /api/grid/manual/add.
	// If the backend is on an older deployed revision, fall back to known aliases.
	      const endpoints = ["/api/grid/manual/add", "/api/grid/add", "/api/grid/order/add", "/api/add"]; 
	      let r = null;
	      let lastErr = null;
	      for (const ep of endpoints) {
	        try {
	          r = await api(ep, { method: "POST", token, body, wallet: walletAddress });
	          lastErr = null;
	          break;
	        } catch (err) {
	          lastErr = err;
	          const m = String(err?.message || "");
	          if (!m.includes("404") && !m.toLowerCase().includes("not found")) throw err;
	        }
	      }
	      if (lastErr) throw lastErr;
      
      applyGridMetaResponse(r, gridItemId);
      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));

      const addOrdersRaw = getGridOrdersFromResponse(r);
      if (Array.isArray(addOrdersRaw)) {
        const addOrders = normalizeGridOrders(addOrdersRaw);
        setGridOrders(addOrders);
      }
      // Always reload from backend so the server can commit the order and the UI stays live.
      kickGridRefresh();
      setGridBusy((s) => ({ ...s, add: false }));
} catch (e) {
      setErrorMsg(`Manual add: ${e.message}`);
    
      setGridBusy((s) => ({ ...s, add: false }));}
  }
  
  
  async function stopGridOrder(orderId) {
    setErrorMsg("");
    if (!token) return setErrorMsg("");
    if (!gridItem) return;

    const _oid = String(orderId);
    if (gridBusy.stopOrderId === _oid) return;
    if (!isGridReady) {
      setErrorMsg("Grid not ready yet (connect wallet + select coin).");
      return;
    }
    setGridBusy((s) => ({ ...s, stopOrderId: _oid }));

    const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
    const gridItemId = gridMeta?.gridItemId ?? gridMeta?.itemId ?? gridMeta?.id ?? `${chainKey}:${gridItem}`;

    // Try several known endpoints/methods (backend revisions differ)
    const addrPayload = walletAddress || undefined;
    const attempts = [
      { url: "/api/grid/order/stop", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/cancel", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/stop", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/stop", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, id: orderId } },
      { url: "/api/grid/order/stop", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, orderId } },
    ];

    let lastErr = null;
    for (const a of attempts) {
      try {
        const r = await api(a.url, { method: a.method, token, wallet: walletAddress, body: a.body });
        const stopOrdersRaw = getGridOrdersFromResponse(r);
        if (Array.isArray(stopOrdersRaw)) {
          const stopOrders = normalizeGridOrders(stopOrdersRaw);
          setGridOrders(stopOrders);
        }
        setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
        applyGridMetaResponse(r, gridItemId);
        fetchGridOrders();
        setGridBusy((s) => ({ ...s, stopOrderId: null }));
        return;
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (!(msg.includes("404") || msg.toLowerCase().includes("not found"))) throw e;
      }
    }

    setGridBusy((s) => ({ ...s, stopOrderId: null }));
    setErrorMsg(`Stop order: ${lastErr?.message || "failed"}`);
  }
  async function resumeGridOrder(orderId) {
    setErrorMsg("");
    if (!token) return setErrorMsg("");
    if (!gridItem) return;

    const _oid = String(orderId);
    if (gridBusy.stopOrderId === _oid) return;
    if (!isGridReady) {
      setErrorMsg("Grid not ready yet (connect wallet + select coin).");
      return;
    }
    setGridBusy((s) => ({ ...s, stopOrderId: _oid }));

    const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
    const gridItemId = gridMeta?.gridItemId ?? gridMeta?.itemId ?? gridMeta?.id ?? `${chainKey}:${gridItem}`;
    const addrPayload = walletAddress || undefined;
    const attempts = [
      { url: "/api/grid/order/resume", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/start", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/restart", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/resume", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, id: orderId } },
      { url: "/api/grid/order/resume", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, orderId } },
    ];

    let lastErr = null;
    for (const a of attempts) {
      try {
        const r = await api(a.url, { method: a.method, token, wallet: walletAddress, body: a.body });
        const resumeOrdersRaw = getGridOrdersFromResponse(r);
        if (Array.isArray(resumeOrdersRaw)) {
          const resumeOrders = normalizeGridOrders(resumeOrdersRaw);
          setGridOrders(resumeOrders);
        }
        setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
        applyGridMetaResponse(r, gridItemId);
        fetchGridOrders();
        setGridBusy((s) => ({ ...s, stopOrderId: null }));
        return;
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (!(msg.includes("404") || msg.toLowerCase().includes("not found"))) break;
      }
    }

    setGridBusy((s) => ({ ...s, stopOrderId: null }));
    setErrorMsg(`Resume order: ${lastErr?.message || "failed"}`);
  }

  async function deleteGridOrder(orderId) {
    setErrorMsg("");
    if (!token) return setErrorMsg("");
    if (!gridItem) return;

    const _oid = String(orderId);
    if (gridBusy.deleteOrderId === _oid) return;
    if (!isGridReady) {
      setErrorMsg("Grid not ready yet (connect wallet + select coin).");
      return;
    }
    setGridBusy((s) => ({ ...s, deleteOrderId: _oid }));

    const chainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
    const gridItemId = gridMeta?.gridItemId ?? gridMeta?.itemId ?? gridMeta?.id ?? `${chainKey}:${gridItem}`;

    // Some backends support POST /delete, others require DELETE, others use /remove
    const addrPayload = walletAddress || undefined;
    const attempts = [
      { url: "/api/grid/order/delete", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/remove", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/delete", method: "DELETE", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/remove", method: "DELETE", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, order_id: orderId } },
      { url: "/api/grid/order/delete", method: "POST", body: { item: gridItemId, addr: addrPayload, wallet: addrPayload, id: orderId } },
    ];

    let lastErr = null;
    for (const a of attempts) {
      try {
        if (a.method === "DELETE") {
          const res = await fetch(`${API_BASE}${a.url}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(a.body),
          });
          if (!res.ok) {
            const t = await res.text();
            throw new Error(`${res.status} ${res.statusText}: ${t}`);
          }
          const r = await res.json().catch(() => ({}));
          const delOrdersRaw = getGridOrdersFromResponse(r);
          if (Array.isArray(delOrdersRaw)) {
            const delOrders = normalizeGridOrders(delOrdersRaw);
            setGridOrders(delOrders);
          }
          setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
          applyGridMetaResponse(r, gridItemId);
          kickGridRefresh();
          setGridBusy((s) => ({ ...s, deleteOrderId: null }));
          return;
        } else {
          const r = await api(a.url, { method: a.method, token, wallet: walletAddress, body: a.body });
          const respOrdersRaw = getGridOrdersFromResponse(r);
          if (Array.isArray(respOrdersRaw)) {
            const respOrders = normalizeGridOrders(respOrdersRaw);
            setGridOrders(respOrders);
          }
          setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
          applyGridMetaResponse(r, gridItemId);
          kickGridRefresh();
          setGridBusy((s) => ({ ...s, deleteOrderId: null }));
          return;
        }
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (
          msg.includes("405") ||
          msg.toLowerCase().includes("method not allowed") ||
          msg.includes("404") ||
          msg.toLowerCase().includes("not found")
        ) {
          continue;
        }
        continue;
      }
    }

    setGridBusy((s) => ({ ...s, deleteOrderId: null }));
    setErrorMsg(`Delete order: ${lastErr?.message || "failed"}`);
  }
useInterval(fetchGridOrders, 15000, isGridReady);

  const gridLiveFallback = useMemo(() => {
  const tgt = String(gridItem || "").toUpperCase();
  const rows = watchRows || [];

  const findPrice = (sym) => {
    const r = rows.find(
      (x) => String(x.symbol || "").toUpperCase() === String(sym || "").toUpperCase()
    );
    return r?.price != null ? r.price : null;
  };

  // 1) Direct match
  let p = findPrice(tgt);
  if (p != null) return p;

  // 2) Alias mapping for wrapped/native differences
  if (tgt === "POL") {
    p = findPrice("MATIC");
    if (p != null) return p;
    p = findPrice("WMATIC");
    if (p != null) return p;
  }

  if (tgt === "BNB") {
    p = findPrice("WBNB");
    if (p != null) return p;
  }

  if (tgt === "ETH") {
    p = findPrice("WETH");
    if (p != null) return p;
  }

  return null;
}, [watchRows, gridItem]);
  const shownGridPrice = gridLiveFallback ?? gridNativeUsd[String(gridItem || '').toUpperCase()] ?? gridMeta.price ?? null;

  const setManualPriceFromMarket = () => {
    if (!shownGridPrice || !Number.isFinite(Number(shownGridPrice))) return;
    setManualPrice(String(shownGridPrice));
  };

  const nudgeManualPricePct = (pct) => {
    const px = Number(shownGridPrice);
    if (!Number.isFinite(px) || px <= 0) return;
    const p = Number(pct);
    if (!Number.isFinite(p)) return;
    const next = px * (1 + p / 100);
    // Keep enough decimals for small coins; manual input can be adjusted by user.
    setManualPrice(next.toFixed(12));
  };

  const inferOrderChainKey = useCallback((o) => {
    const raw =
      o?.chain ||
      o?.chainKey ||
      o?.chain_key ||
      o?.network ||
      o?.vault_chain ||
      o?.vaultChain ||
      o?.item_chain ||
      o?.itemChain ||
      (typeof o?.item === "string" ? String(o.item).split(":")[0] : "") ||
      (typeof o?.gridItemId === "string" ? String(o.gridItemId).split(":")[0] : "") ||
      activeGridChainKey ||
      DEFAULT_CHAIN;
    const norm = String(raw || DEFAULT_CHAIN).toUpperCase().trim();
    return ["POL", "BNB", "ETH"].includes(norm)
      ? norm
      : String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase();
  }, [activeGridChainKey]);

  const inferOrderPayoutAsset = useCallback((o) => {
    const raw =
      o?.payout_asset ||
      o?.payoutAsset ||
      o?.payout ||
      o?.settlement_asset ||
      o?.settlementAsset ||
      o?.settlement ||
      o?.asset_out ||
      o?.assetOut ||
      o?.quote_asset ||
      o?.quoteAsset ||
      o?.return_asset ||
      o?.returnAsset ||
      o?.meta?.payout_asset ||
      o?.meta?.payoutAsset ||
      o?.meta?.settlement_asset ||
      o?.meta?.settlementAsset ||
      o?.data?.payout_asset ||
      o?.data?.payoutAsset ||
      o?.data?.settlement_asset ||
      o?.data?.settlementAsset ||
      manualPayoutAsset ||
      "—";
    return String(raw || "—").toUpperCase();
  }, [manualPayoutAsset]);

  const inferOrderStatus = useCallback((o) => {
    const raw = String(o?.status || o?.state || "OPEN").toUpperCase();
    if (["OPEN", "ACTIVE", "RUNNING", "LIVE"].includes(raw)) return "OPEN";
    if (["STOPPED", "STOP", "PAUSED", "CANCELLED", "CANCELED", "CANCELLING", "PAUSING"].includes(raw)) return "PAUSED";
    if (["FILLED", "EXECUTED", "DONE", "COMPLETED", "SETTLED"].includes(raw)) return "FILLED";
    if (["FAILED", "ERROR", "REJECTED"].includes(raw)) return "FAILED";
    if (["DELETED", "REMOVED"].includes(raw)) return "DELETED";
    return raw || "OPEN";
  }, []);

  const orderNotionalUsd = useCallback((o) => {
    const px = Number(o?.price || o?.limit_price || 0);
    const qty = Number(o?.qty || o?.quantity || 0);
    if (Number.isFinite(px) && px > 0 && Number.isFinite(qty) && qty > 0) return px * qty;
    return 0;
  }, []);

  const openGridOrders = useMemo(() => {
    return (Array.isArray(gridOrders) ? gridOrders : []).filter((o) => inferOrderStatus(o) === "OPEN");
  }, [gridOrders, inferOrderStatus]);

  const visibleGridOrders = useMemo(() => {
    return (Array.isArray(gridOrders) ? gridOrders : []).filter((o) => inferOrderStatus(o) !== "DELETED");
  }, [gridOrders, inferOrderStatus]);

  const gridOrdersGroupedByChain = useMemo(() => {
    const map = {};
    for (const o of visibleGridOrders) {
      const ck = inferOrderChainKey(o);
      if (!map[ck]) map[ck] = [];
      map[ck].push(o);
    }
    const pref = ["POL", "BNB", "ETH"];
    return Object.entries(map).sort((a, b) => {
      const ai = pref.indexOf(a[0]);
      const bi = pref.indexOf(b[0]);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [visibleGridOrders, inferOrderChainKey]);

  const manualOrderNotionalUsd = useMemo(() => {
    const px = Number(manualPrice || shownGridPrice || 0);
    const qty = Number(manualQty || 0);
    if (Number.isFinite(px) && px > 0 && Number.isFinite(qty) && qty > 0) return px * qty;
    const usd = Number(manualUsd || 0);
    return Number.isFinite(usd) && usd > 0 ? usd : 0;
  }, [manualPrice, shownGridPrice, manualQty, manualUsd]);

  const manualOpenExposureUsd = useMemo(() => {
    const chain = String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase();
    return openGridOrders
      .filter((o) => inferOrderChainKey(o) === chain)
      .reduce((sum, o) => sum + orderNotionalUsd(o), 0);
  }, [openGridOrders, inferOrderChainKey, orderNotionalUsd, activeGridChainKey]);

  const manualExposureAfterUsd = useMemo(() => {
    return manualOpenExposureUsd + manualOrderNotionalUsd;
  }, [manualOpenExposureUsd, manualOrderNotionalUsd]);

  const manualSettlementPreview = useMemo(() => {
    const payout = String(manualPayoutAsset || "USDC").toUpperCase();
    return `On target hit -> swap immediately into ${payout} -> hold in vault until withdraw.`;
  }, [manualPayoutAsset]);

  const activeGridChainSymbol = useMemo(() => {
    return String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase();
  }, [activeGridChainKey]);

  const activeGridNativeUsd = useMemo(() => {
    const px = Number(walletPx?.native?.[activeGridChainSymbol]);
    return Number.isFinite(px) && px > 0 ? px : null;
  }, [walletPx, activeGridChainSymbol]);

  const persistWatchOrder = useCallback(async (nextItems) => {
    const normalized = normalizeWatchItems(nextItems || []);
    setWatchItems(normalized);
    try { localStorage.setItem("nexus_watch_items", JSON.stringify(normalized)); } catch {}
    setWatchRows((prev) => {
      const prevMap = new Map((Array.isArray(prev) ? prev : []).map((row) => [_watchKeyFromRow(row), row]));
      const ordered = normalized.map((it) => {
        const key = _watchKeyFromItem(it);
        return prevMap.get(key) || {
          symbol: String(it?.symbol || "").toUpperCase(),
          mode: String(it?.mode || "market"),
          chain: it?.chain || undefined,
          contract: it?.contract || it?.tokenAddress || undefined,
          tokenAddress: it?.tokenAddress || it?.contract || undefined,
          coingecko_id: String(it?.coingecko_id || it?.id || ""),
          id: String(it?.coingecko_id || it?.id || ""),
          name: it?.name || String(it?.symbol || "").toUpperCase(),
          price: null,
          chg_24h: null,
          change24h: null,
          vol: null,
          volume24h: null,
          source: "pending",
        };
      });
      try { localStorage.setItem(LS_WATCH_ROWS_CACHE, JSON.stringify(ordered)); } catch {}
      return ordered;
    });
    if (wallet) {
      try {
        await saveWatchlistToServer(normalized);
        setWatchSyncedWallet(wallet || "");
      } catch (_) {}
    }
    fetchWatchSnapshot(normalized, { force: true, user: false });
  }, [normalizeWatchItems, setWatchItems, wallet, saveWatchlistToServer, setWatchSyncedWallet]);

  const reorderWatchItems = useCallback(async (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;
    const items = Array.isArray(watchItems) ? [...watchItems] : [];
    const fromIndex = items.findIndex((it) => _watchKeyFromItem(it) === fromKey);
    const toIndex = items.findIndex((it) => _watchKeyFromItem(it) === toKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    await persistWatchOrder(items);
  }, [watchItems, persistWatchOrder]);

  function handleWatchDragStart(item) {
    setWatchDragKey(_watchKeyFromRow(item) || "");
    setWatchDropKey("");
  }

  function handleWatchDragOver(e, item) {
    e.preventDefault();
    const key = _watchKeyFromRow(item) || "";
    if (key && key !== watchDropKey) setWatchDropKey(key);
  }

  async function handleWatchDrop(e, item) {
    e.preventDefault();
    const toKey = _watchKeyFromRow(item) || "";
    const fromKey = watchDragKey || "";
    setWatchDropKey("");
    setWatchDragKey("");
    await reorderWatchItems(fromKey, toKey);
  }

  function handleWatchDragEnd() {
    setWatchDragKey("");
    setWatchDropKey("");
  }

  // watchlist actions
  function toggleCompare(sym) {
    const S = String(sym || "").toUpperCase();
    if (!S) return;
    setCompareSet((prev) => {
      const arr = Array.isArray(prev) ? prev.slice() : [];
      const has = arr.includes(S);
      if (has) return arr.filter((x) => x !== S);
      if (arr.length >= 20) return arr;
      arr.push(S);
      return arr;
    });
  }

  const [addOpen, setAddOpen] = useState(false);

// Add-Coin modal (old-app style): Market (CoinGecko search) + DEX (Contract)
const [addTab, setAddTab] = useState("market"); // "market" | "dex"
const [addQuery, setAddQuery] = useState("");
const [addSearching, setAddSearching] = useState(false);
const [addResults, setAddResults] = useState([]); // [{id,symbol,name,market_cap_rank}]
const [addSearchErr, setAddSearchErr] = useState("");

const addSearchAbortRef = useRef(null);

// Search is triggered only when user presses Search (or Enter).

// DEX tab inputs
const [addChain, setAddChain] = useState("polygon");
const [addContract, setAddContract] = useState("");

const resetAddModal = () => {
  setAddOpen(false);
  setAddTab("market");
  setAddQuery("");
  setAddSearching(false);
  setAddResults([]);
  setAddSearchErr("");
  setAddChain("eth");
  setAddContract("");
};

const runMarketSearch = async (opts = {}) => {
  const q = String(addQuery || "").trim();
  if (!q) return;
  const qKey = q.toLowerCase();

  // Abort previous in-flight search (keeps UI responsive)
  if (addSearchAbortRef.current) { try { addSearchAbortRef.current.abort(); } catch {} }
  const ac = new AbortController();
  addSearchAbortRef.current = ac;

  setAddSearchErr("");

  // 1) Instant result from client cache (if present)
  const cached = _cgSearchGet(qKey);
  if (cached) {
    setAddResults(cached);
    if (!cached.length) setAddSearchErr("No results.");
    // revalidate in background (do not block UI)
    (async () => {
      try {
        const r = await apiSearchCoins(q, { signal: ac.signal });
        const list = Array.isArray(r) ? r : Array.isArray(r?.coins) ? r.coins : Array.isArray(r?.results) ? r.results : [];
        const norm = (list || [])
          .map((x) => ({
            id: String(x.id || x.coingecko_id || x.cg_id || "").trim(),
            symbol: String(x.symbol || "").trim(),
            name: String(x.name || "").trim(),
            market_cap_rank: x.market_cap_rank ?? x.rank ?? null,
          }))
          .filter((x) => x.id && x.symbol);
        _cgSearchPut(qKey, norm);
        // only update if query didn't change
        if (String(addQuery || "").trim().toLowerCase() === qKey) {
          setAddResults(norm);
          setAddSearchErr(norm.length ? "" : "No results.");
        }
      } catch {
        // ignore background refresh errors
      }
    })();
    return;
  }

  // 2) No cache => do a normal fetch, but show spinner
  setAddSearching(true);
  try {
    // If Render is sleeping or the backend hangs, do not keep the UI in
    // "Searching..." forever.
    const r = await apiSearchCoins(q, { signal: ac.signal });
    const list = Array.isArray(r) ? r : Array.isArray(r?.coins) ? r.coins : Array.isArray(r?.results) ? r.results : [];
    const norm = (list || [])
      .map((x) => ({
        id: String(x.id || x.coingecko_id || x.cg_id || "").trim(),
        symbol: String(x.symbol || "").trim(),
        name: String(x.name || "").trim(),
        market_cap_rank: x.market_cap_rank ?? x.rank ?? null,
      }))
      .filter((x) => x.id && x.symbol);

    _cgSearchPut(qKey, norm);
    setAddResults(norm);
    if (!norm.length) setAddSearchErr("No results.");
  } catch (e) {
    // If request was aborted (due to debounce / new query), ignore silently.
    if (e && (e.name === "AbortError" || String(e).includes("AbortError") || String(e).toLowerCase().includes("aborted"))) {
      return;
    }
    const msg = String(e?.message || e);
    if (msg.toLowerCase().includes("timeout") || msg.toLowerCase().includes("aborted")) {
      setAddSearchErr("Search timed out. Backend may be sleeping — try again.");
    } else {
      setAddSearchErr(msg);
    }
    setAddResults([]);
  } finally {
    setAddSearching(false);
  }
};

const addMarketCoin = async (coin) => {
  const sym = String(coin?.symbol || "").trim().toUpperCase();
  const cgId = String(coin?.id || "").trim();
  if (!sym || !cgId) return;

  const item = { symbol: sym, mode: "market", coingecko_id: cgId, name: coin?.name || "", rank: coin?.market_cap_rank ?? null };

  // If user previously removed this coin, clear its tombstone so it can appear again.
  _clearTombstone(_watchKeyFromItem(item));

  // Optimistic: update local state immediately (never wait for backend)
  let nextItems = null;
  setWatchItems((prev0) => {
    const prev = Array.isArray(prev0) ? prev0 : [];
    const key = `${item.mode}|${item.symbol}|${item.coingecko_id}`.toLowerCase();
    const exists = prev.some((x) => {
      const xs = String(x?.symbol || "").trim().toUpperCase();
      const xm = String(x?.mode || "market").toLowerCase();
      const xid = String(x?.coingecko_id || x?.id || "").toLowerCase();
      return `${xm}|${xs}|${xid}`.toLowerCase() === key;
    });
    nextItems = exists ? prev : [...prev, item];
    return nextItems;
  });

  // Ensure it shows instantly in the table even if snapshot is down (placeholder row).
  setWatchRows((prev0) => {
    const prev = Array.isArray(prev0) ? prev0 : [];
    const has = prev.some((r) => {
      const rs = String(r?.symbol || "").toUpperCase().trim();
      const rm = String(r?.mode || "market").toLowerCase();
      const rid = String(r?.coingecko_id || r?.id || "").toLowerCase();
      return `${rm}|${rs}|${rid}` === `market|${sym}|${String(cgId || "").toLowerCase()}`;
    });
    if (has) return prev;
    return [
      ...prev,
      {
        symbol: sym,
        mode: "market",
        coingecko_id: cgId,
        name: item.name || sym,
        price: null,
        chg_24h: null,
        vol: null,
        source: "pending",
      },
    ];
  });

  // NOTE: Do NOT auto-add to Compare when adding to Watchlist.

  // Kick a background snapshot refresh (best-effort). Never block the click.
  // Save first, then snapshot, and also try an exact-id direct price hydration for instant UX.
  try {
    setTimeout(async () => {
      try {
        await saveWatchlistToServer(nextItems || null);
        try { setWatchSyncedWallet(wallet || ""); } catch {}
      } catch {}

      try {
        const qs = new URLSearchParams({
          ids: String(cgId || "").toLowerCase(),
          vs_currencies: "usd",
          include_24hr_change: "true",
          include_24hr_vol: "true",
        }).toString();
        const direct = await api(`/api/coingecko/simple_price?${qs}`, { method: "GET", token, wallet });
        const d = direct?.[String(cgId || "").toLowerCase()];
        const p = Number(d?.usd);
        if (Number.isFinite(p) && p > 0) {
          setWatchRows((prev0) => {
            const prev = Array.isArray(prev0) ? prev0 : [];
            const next = prev.map((r) => {
              const rs = String(r?.symbol || "").toUpperCase().trim();
              const rid = String(r?.coingecko_id || r?.id || "").toLowerCase();
              if (rs !== sym || rid !== String(cgId || "").toLowerCase()) return r;
              const ch24 = Number.isFinite(Number(d?.usd_24h_change)) ? Number(d.usd_24h_change) : (r?.change24h ?? r?.chg_24h ?? null);
              const v24 = Number.isFinite(Number(d?.usd_24h_vol)) ? Number(d.usd_24h_vol) : (r?.volume24h ?? r?.vol ?? null);
              return {
                ...r,
                price: p,
                change24h: ch24,
                chg_24h: ch24,
                volume24h: v24,
                vol: v24,
                source: "coingecko-id",
              };
            });
            try { localStorage.setItem(LS_WATCH_ROWS_CACHE, JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {}

      try {
        await fetchWatchSnapshot(nextItems || null, { force: true, user: true });
      } catch {}
    }, 0);
  } catch {}

  // keep modal open to allow adding multiple, but clear search to reduce confusion
  setAddQuery("");
  setAddResults([]);
  setAddSearchErr("");
};

const addDexToken = async () => {
  const contract = String(addContract || "").trim();
  const chain = String(addChain || "pol").trim();
  if (!contract) return setErrorMsg("Contract address required.");

  // We store contract in both "contract" (UI) and "tokenAddress" (backward compat for older backend)
  const item = { symbol: contract.slice(0, 10).toUpperCase(), mode: "dex", contract, tokenAddress: contract, chain };

  _clearTombstone(_watchKeyFromItem(item));

  let nextItems = null;
  setWatchItems((prev0) => {
    const prev = Array.isArray(prev0) ? prev0 : [];
    const key = `${item.mode}|${item.contract}`.toLowerCase();
    const exists = prev.some((x) => `${String(x?.mode || "market").toLowerCase()}|${String(x?.contract || x?.tokenAddress || "").toLowerCase()}` === key);
    nextItems = exists ? prev : [...prev, item];
    return nextItems;
  });

  // placeholder row so user sees it instantly
  setWatchRows((prev0) => {
    const prev = Array.isArray(prev0) ? prev0 : [];
    const addr = contract.toLowerCase();
    const has = prev.some((r) => String(r?.contract || r?.tokenAddress || "").toLowerCase() === addr);
    if (has) return prev;
    return [
      ...prev,
      {
        symbol: item.symbol,
        mode: "dex",
        contract,
        tokenAddress: contract,
        chain,
        name: item.symbol,
        price: null,
        chg_24h: null,
        vol: null,
        source: "pending",
      },
    ];
  });

  // Background snapshot refresh (best-effort)
  try {
    setTimeout(() => {
      fetchWatchSnapshot(nextItems || null, { force: true, user: true });
    }, 0);
  } catch {}

  try {
    setTimeout(async () => {
      await saveWatchlistToServer(nextItems || null);
      try { setWatchSyncedWallet(wallet || ""); } catch {}
    }, 0);
  } catch {}

  // keep modal open; clear contract for next add
  setAddContract("");
};

  function removeWatchItemByKey({ symbol, mode = "market", tokenAddress = "", contract = "" }) {
  const sym = String(symbol || "").toUpperCase();
  const m = String(mode || "market").toLowerCase();
  const addr = String(tokenAddress || contract || "").toLowerCase();

// Tombstone: prevent backend snapshots from resurrecting removed items.
// Derive stable key from stored watchItems when possible.
const removedItem = (watchItems || []).find((x) => {
  const xs = String(x?.symbol || "").toUpperCase();
  const xm = String(x?.mode || "market").toLowerCase();
  const xa = String(x?.contract || x?.tokenAddress || "").toLowerCase();
  return xs === sym && xm === m && xa === addr;
});
const removedKey = removedItem
  ? _watchKeyFromItem(removedItem)
  : (m === "dex" ? `dex|${addr}` : `market|${sym}|`);
_setTombstone(removedKey);

  // Build next "items" array (the true source of truth we send to backend)
  const nextItems = (watchItems || []).filter((x) => {
    if (!x) return false;
    const xs = String(x.symbol || "").toUpperCase();
    const xm = String(x.mode || "market").toLowerCase();
    const xa = String(x.contract || x.tokenAddress || "").toLowerCase();
    const xid = String(x.coingecko_id || x.id || "").toLowerCase();
    if (m === "dex") return !(xs === sym && xm === m && xa === addr);
    return !(xs === sym && xm === m);
  });

  // Optimistic UI update (so it disappears immediately)
  setWatchItems(nextItems);
  setWatchRows((prev) =>
    (prev || []).filter((r) => {
      if (!r) return false;
      const rs = String(r.symbol || "").toUpperCase();
      const rm = String(r.mode || "market").toLowerCase();
      const ra = String(r.contract || r.tokenAddress || "").toLowerCase();
      if (m === "dex") return !(rs === sym && rm === m && ra === addr);
      return !(rs === sym && rm === m);
    })
  );

  // Keep compare selection consistent (avoid "ghost" selections)
  setCompareSet((prev) => {
    const p = Array.isArray(prev) ? prev : [];
    return p.filter((s) => String(s || "").toUpperCase() !== sym);
  });

  // If you removed the last watch item, also clear compare selection + chart cache
  if (!nextItems.length) {
    setCompareSet([]);
    setCompareSeries({});
    lastGoodCompareRef.current = {};
    try { localStorage.setItem(LS_COMPARE_SERIES_CACHE, JSON.stringify({})); } catch {}
  }

  // Persist: ask backend to recompute snapshot for the new items list
  // (This makes sure the item doesn't come back on next poll.)
  (async () => {
    try {
      try { await saveWatchlistToServer(nextItems); setWatchSyncedWallet(wallet || ""); } catch (_) {}

      const data = await api("/api/watchlist/snapshot", {
        method: "POST",
        body: { items: nextItems },
      });

      const nextRowsRaw = data?.results || data?.rows || [];
      const allowedKeys = new Set((nextItems || []).map(_watchKeyFromItem));
      const tomb = _loadTombstones();
      const nextRows = (Array.isArray(nextRowsRaw) ? nextRowsRaw : []).filter((row) => {
        const k = _watchKeyFromRow(row);
        if (tomb && tomb[k] != null) return false;
        return allowedKeys.has(k);
      });
      if (Array.isArray(nextRows)) setWatchRows(nextRows);
if (Array.isArray(data?.symbols)) setCompareSet((prev) => (Array.isArray(prev) && prev.length ? prev : data.symbols));
if (data?.cached != null) setWatchCached(Boolean(data.cached));
      setWatchErr("");
    } catch (e) {
      setWatchErr(String(e?.message || e));
    }
  })();
  }

  // AI
  const aiOptions = useMemo(() => compareSymbols, [compareSymbols]);
  function toggleAi(sym) {
    const S = String(sym || "").toUpperCase();
    setAiSelected((prev) => {
      const arr = Array.isArray(prev) ? prev.slice() : [];
      const has = arr.includes(S);
      if (has) return arr.filter((x) => x !== S);
      if (arr.length >= 6) return arr;
      arr.push(S);
      return arr;
    });
  }

  
  const normalizeAiOutput = (rawText, tf, q, seriesStats) => {
    const TF = String(tf || "").toUpperCase();
    const is1D = TF === "1D" || TF === "24H" || TF === "24HRS" || TF === "1DAY";
    let text = String(rawText || "");

    if (is1D) return text;

    // Remove obvious 24h-only lines/metrics to avoid misleading output when timeframe != 1D
    const lines = text.split(/\r?\n/);
    const filtered = lines.filter((ln) => {
      const s = ln.toLowerCase();
      if (s.includes("24h") || s.includes("24 h") || s.includes("24-stunden") || s.includes("24 stunden")) return false;
      if (s.includes("price_change_percentage_24h") || s.includes("volume_24h") || s.includes("high_24h") || s.includes("low_24h")) return false;
      return true;
    });

    // Build a factual timeframe summary from chart series stats (same data as overlay)
    const entries = Object.entries(seriesStats || {});
    if (!entries.length) return filtered.join("\n");

    const isGerman = /\b(wie|was|warum|in|den|letzten|tage|wochen|markt|zukunft)\b/i.test(q || "");
    const headTitle = isGerman ? `Zeitraum-Stats (${TF})` : `Timeframe stats (${TF})`;

    const fmt = (n) => (n == null || !Number.isFinite(n) ? "—" : n.toFixed(2));
    const bullets = entries.map(([sym, stats]) => {
      const ch = stats?.changePct;
      const vol = stats?.volPct;
      const mdd = stats?.maxDDPct;
      const last = stats?.last;
      const first = stats?.first;
      if (isGerman) {
        return `- ${sym}: Start ${fmtUsd(first)}, Ende ${fmtUsd(last)}, Veränderung ${fmt(ch)}%, Volatilität ${fmt(vol)}%, MaxDD ${fmt(mdd)}%`;
      }
      return `- ${sym}: start ${fmtUsd(first)}, end ${fmtUsd(last)}, change ${fmt(ch)}%, vol ${fmt(vol)}%, maxDD ${fmt(mdd)}%`;
    });

    return `${headTitle}\n${bullets.join("\n")}\n\n${filtered.join("\n")}`.trim();
  };
async function runAi() {
    setErrorMsg("");
    setAiOutput("");
    if (!requirePro("AI analysis")) return;
    const q = (aiQuestion || "").trim();

    const syms = (aiSelected && aiSelected.length ? aiSelected : compareSymbols).slice(0, 6);
    if (!syms.length) return setErrorMsg("Select at least 1 coin in Compare (or AI).");

    const isFollowUpAsk = !!aiFollowUp && !!q;
    if (aiFollowUp && !aiOutput && q) {
      return setErrorMsg("Run an AI analysis first, then ask a follow-up question.");
    }

    const qFinal = isFollowUpAsk
      ? q
      : (aiKind === "Signals"
          ? `Give ${aiProfile} trading signals and key levels based on the selected timeframe.`
          : `Provide a ${aiProfile} ${aiKind.toLowerCase()} based on the selected timeframe, and summarize key trends, risks, and actionable takeaways.`);

    setAiLoading(true);
    try {
      await ensureBackendAuthToken();

      const uiTf = String(timeframe || "").toUpperCase();
      const explicitTf = _extractExplicitTfFromQuestion(qFinal);
      const tf = String(explicitTf || uiTf || "90D").toUpperCase();

      const slicedSeries = sliceCompareSeries(compareSeries || {}, tf);
      const seriesStats = _seriesStatsFromSeriesMap(slicedSeries, syms);
      const insightWindows = _buildInsightWindows(compareSeries || {}, syms);

      const statsText = Object.entries(seriesStats)
        .map(([s, stats]) => `${s}: change=${(stats.changePct ?? 0).toFixed(2)}%, vol=${(stats.volPct ?? 0).toFixed(2)}%, maxDD=${(stats.maxDDPct ?? 0).toFixed(2)}%, range=[${stats.min}, ${stats.max}], points=${stats.points}`)
        .join("\n");

      const insightText = Object.entries(insightWindows)
        .map(([windowTf, bySym]) => {
          const lines = Object.entries(bySym || {}).map(([s, stats]) =>
            `${s}: change=${(stats.changePct ?? 0).toFixed(2)}%, vol=${(stats.volPct ?? 0).toFixed(2)}%, maxDD=${(stats.maxDDPct ?? 0).toFixed(2)}%, points=${stats.points}`
          );
          return lines.length ? `Insight window ${windowTf}:\n${lines.join("\n")}` : "";
        })
        .filter(Boolean)
        .join("\n\n");

      const trimmedHist = (aiHistory || []).slice(-10);
      const historyText = trimmedHist
        .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
        .join("\n");

      const header =
        `UI timeframe: ${uiTf}.\n` +
        `Active analysis timeframe: ${tf}.\n` +
        (explicitTf
          ? `The user explicitly asked for ${explicitTf}, so this overrides the current UI timeframe.\n`
          : `No explicit timeframe was found in the user's question, so use the current UI timeframe.\n`) +
        `Coins: ${syms.join(", ")}\n` +
        (statsText ? `Series stats (${tf}):\n${statsText}\n` : "") +
        (insightText ? `\nMulti-timeframe insight context (use this for AI Insight / trend-structure comparison):\n${insightText}\n` : "");

      const questionText =
        isFollowUpAsk && historyText ? `${header}${historyText}\nUser: ${qFinal}` : `${header}User: ${qFinal}`;

      const body = {
        kind: aiKind,
        symbols: syms,
        profile: aiProfile,
        question: questionText,
        timeframe: tf,
        selected_timeframe: uiTf,
        explicit_question_timeframe: explicitTf || null,
        index_mode: !!indexMode,
        history: isFollowUpAsk ? trimmedHist : [],
        series_stats: seriesStats,
        insight_windows: insightWindows,
      };

      if (!token) throw new Error("Please reconnect your wallet to authorize AI.");
      const r = await api("/api/ai/run", { method: "POST", token, body });

      let text =
        r?.answer ??
        r?.output ??
        r?.text ??
        r?.message ??
        (typeof r === "string" ? r : "");

      if (!text) text = "No AI response.";
      text = String(text).replace(/\n/g, "\n");
      text = normalizeAiOutput(text, tf, qFinal, seriesStats);
      setAiOutput(text);

      if (isFollowUpAsk) {
        setAiHistory((prev) => {
          const next = [...(prev || []), { role: "user", content: qFinal }, { role: "assistant", content: text }];
          return next.slice(-10);
        });
      }
      if (isFollowUpAsk) {
        setAiQuestion("");
      } else if (!aiFollowUp) {
        setAiHistory([]);
      }
    } catch (e) {
      setErrorMsg("");
    } finally {
      setAiLoading(false);
    }
  }

  // compare live list
  const liveList = useMemo(() => {
    const bySym = new Map();
    for (const r of watchRows || []) {
      const sym = String(r.symbol || "").toUpperCase();
      if (sym) bySym.set(sym, r);
    }
    return visibleCompareSymbols.map((sym) => ({ sym, row: bySym.get(sym) || null }));
  }, [watchRows, visibleCompareSymbols]);

// --- Grid Vault usage (vault-contract only) ---
// IMPORTANT:
// Use the on-chain vault balance as the single source of truth.
// Do NOT trust accumulated backend vault/free values here, because they can drift during
// start/stop/resume/delete test cycles.
// Reserved includes OPEN + PAUSED orders, so a paused order still keeps funds allocated.
const reservedQtyOpen = useMemo(() => {
  try {
    return (gridOrders || [])
      .filter((o) => {
        const st = String(o?.status || "").toUpperCase();
        return st === "OPEN" || st === "PAUSED";
      })
      .reduce((s, o) => s + (Number(o.qty) || 0), 0);
  } catch {
    return 0;
  }
}, [gridOrders]);

const vaultNativeBal = useMemo(() => {
  // The vault contract reader stores the current chain's native balance in `polBalance`
  // for historical reasons. Do NOT branch to bnbBalance/ethBalance here.
  return Number(vaultState?.polBalance) || 0;
}, [vaultState]);

const vaultFreeQty = useMemo(
  () => Math.max(0, (Number(vaultNativeBal) || 0) - (Number(reservedQtyOpen) || 0)),
  [vaultNativeBal, reservedQtyOpen]
);

const manualVaultAvailableQty = useMemo(() => {
  return Number(vaultFreeQty) || 0;
}, [vaultFreeQty]);

const manualVaultAllocatedQty = useMemo(() => {
  return Number(reservedQtyOpen) || 0;
}, [reservedQtyOpen]);

const manualVaultTotalQty = useMemo(() => {
  return Number(vaultNativeBal) || 0;
}, [vaultNativeBal]);

const manualVaultSettledQty = useMemo(() => {
  const v = Number(vaultState?.heldTokenBal);
  return Number.isFinite(v) ? v : 0;
}, [vaultState]);

const manualPoolLiquidityUsd = useMemo(() => {
  if (!Number.isFinite(Number(activeGridNativeUsd)) || Number(activeGridNativeUsd) <= 0) return null;
  const qty = Number(manualVaultTotalQty || 0);
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  return qty * Number(activeGridNativeUsd);
}, [manualVaultTotalQty, activeGridNativeUsd]);

const manualEstimatedImpactPct = useMemo(() => {
  const liq = Number(manualPoolLiquidityUsd);
  const after = Number(manualExposureAfterUsd);
  if (!Number.isFinite(liq) || liq <= 0 || !Number.isFinite(after) || after <= 0) return null;
  return (after / liq) * 100;
}, [manualPoolLiquidityUsd, manualExposureAfterUsd]);

const manualRiskState = useMemo(() => {
  const liq = Number(manualPoolLiquidityUsd);
  const impact = Number(manualEstimatedImpactPct);
  if (!Number.isFinite(liq) || liq <= 0 || !Number.isFinite(impact) || impact < 0) {
    return {
      key: "pending",
      label: "⏳ Backend pending",
      tone: "rgba(245, 193, 108, 0.18)",
      border: "1px solid rgba(245, 193, 108, 0.28)",
      color: "#f5c16c",
    };
  }

  let greenMax = 1;
  let yellowMax = 2.5;

  if (liq < 5000) {
    greenMax = 1;
    yellowMax = 2.5;
  } else if (liq < 25000) {
    greenMax = 1.75;
    yellowMax = 4;
  } else if (liq < 100000) {
    greenMax = 2.5;
    yellowMax = 6;
  } else if (liq < 350000) {
    greenMax = 3.5;
    yellowMax = 8;
  } else {
    greenMax = 5;
    yellowMax = 10;
  }

  if (impact < greenMax) {
    return {
      key: "green",
      label: "🟢 Green · normal execution",
      tone: "rgba(34, 197, 94, 0.16)",
      border: "1px solid rgba(34, 197, 94, 0.28)",
      color: "#86efac",
    };
  }
  if (impact <= yellowMax) {
    return {
      key: "yellow",
      label: "🟡 Yellow · warning, review before submit",
      tone: "rgba(245, 193, 108, 0.16)",
      border: "1px solid rgba(245, 193, 108, 0.28)",
      color: "#f5c16c",
    };
  }
  return {
    key: "red",
    label: "🔴 Red · high impact / critical",
    tone: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.28)",
    color: "#fca5a5",
  };
}, [manualPoolLiquidityUsd, manualEstimatedImpactPct]);

const [activePanel, setActivePanel] = useState(null);
const isWatchSidebarCompact = isDesktopWide && !!activePanel && activePanel !== "watchlist";
const isGridSidebarCompact = isDesktopWide && !!activePanel && activePanel !== "vault";
const handlePanelActivate = useCallback((name) => (e) => {
  if (typeof window !== "undefined" && window.innerWidth <= 980) return;
  const el = e?.target;
  if (el && typeof el.closest === "function") {
    const interactive = el.closest('button, input, select, textarea, label, a, [role="dialog"], .infoBtn, .iconBtn, .chip, .btn, .btnGhost, .btnDanger, .btnPill, .pill, .pairRow, .pairsScroll, .watchRow');
    if (interactive) return;
  }
  setActivePanel((prev) => (prev === name ? null : name));
}, []);

  return (
    <div className="app nexusApp">
      
      <style>{`
.btnPill, .btnPill *, .btnGhost, .btnGhost * { 
          color: #fff !important; 
          -webkit-text-fill-color: #fff !important;
        }

        /* --- Mobile / small screens: prevent horizontal overflow and wrap topbar controls --- */
        html, body { max-width: 100%; overflow-x: hidden; }
        #root { max-width: 100%; overflow-x: hidden; }

        @media (max-width: 820px) {
          header.topbar {
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            align-items: stretch !important;
            row-gap: 4px !important;
            column-gap: 4px !important;
            padding-top: 4px !important;
            padding-bottom: 4px !important;
            min-height: 0 !important;
          }
          header.topbar .brand {
            flex: 0 0 auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 8px !important;
          }
          header.topbar .brandTitle {
            line-height: 1.05 !important;
            margin: 0 !important;
          }
          header.topbar .brandSub {
            margin-top: 1px !important;
          }
          header.topbar .walletBox {
            flex: 0 0 auto !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            gap: 4px !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          header.topbar .walletBox > * {
            flex: 0 0 auto;
          }
          header.topbar .btnGhost,
          header.topbar .btnPill {
            white-space: nowrap;
          }

          /* Main layout: stack grids/columns to avoid sideways scroll */
          main.main {
            max-width: 100%;
            overflow-x: hidden;
          }
          .chartGrid {
            display: block !important;
          }
          .sparkGridWrap, .sparkGrid {
            max-width: 100%;
            overflow-x: auto;
          }
        }

      

        /* --- Compare header chips: wrap on small screens to avoid horizontal scroll --- */
        @media (max-width: 820px) {
          .cardHead { flex-wrap: wrap; align-items: flex-start; gap: 10px; }
          .cardTitle { flex: 1 1 180px; }
          .cardActions {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            gap: 8px;
            max-width: 100%;
            overflow-x: hidden;
          }
          .cardActions .chip { white-space: nowrap; }
        }

        /* --- Grid layout: left controls, right orders --- */
        .gridLayout{
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 16px;
          align-items: start;
        }
        .gridLeft{min-width:0;}
        .gridLeft{justify-self:start;}

        /* Ensure controls stack and never center */
        .gridLeft .gridWrap,
        .gridLeft .gridControls{
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .gridLeft .gridControls > *{ width: 100%; }
        .gridLeft .formRow{ width: 100%; display: flex; flex-direction: column; align-items: flex-start; }

        /* --- Force manual/grid inputs to align left (no centering) --- */
        .gridLeft .formRow select,
        .gridLeft .formRow input,
        .gridLeft select,
        .gridLeft input {
          align-self: flex-start;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        .gridLeft .formRow select,
        .gridLeft .formRow input {
          width: 100%;
          max-width: 560px;
        }
        /* Keep inline rows (slippage/deadline/quick steps) anchored left */
        .gridLeft .row {
          justify-content: flex-start !important;
          align-items: center;
        }
        
        .gridLeft .row{justify-content:flex-start;}
        
        .gridRight{
          position: sticky;
          top: 16px;
          justify-self: end;
          width: min(420px, 100%);
        }
        @media (max-width: 980px){
          .gridLayout{
            grid-template-columns: 1fr;
          }
          .gridRight{
            position: static;
          }
        }

        /* --- Desktop dashboard overview (Compare / Vault / Watchlist / AI) --- */
        .brandTag {
          font-size: 12px;
          color: rgba(232,242,240,.72);
          margin-top: 2px;
          font-weight: 700;
        }
        .dashboardGrid {
          display: block;
        }
        .dashboardPanel {
          transition: transform .22s ease, opacity .22s ease, box-shadow .22s ease;
        }
        @media (min-width: 981px) {
          .dashboardGrid {
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(0,1fr);
            grid-template-rows: minmax(320px,auto) minmax(320px,auto);
            gap: 18px;
            align-items: stretch;
          }
          .dashboardPanel {
            margin-bottom: 0;
            min-width: 0;
            min-height: 320px;
            overflow: hidden;
            cursor: pointer;
          }
          .dashboardGrid.hasFocus {
            grid-template-columns: minmax(0,1.35fr) minmax(0,1.35fr) minmax(280px,0.9fr);
            grid-template-rows: repeat(3, minmax(180px, auto));
          }
          .dashboardGrid.hasFocus .dashboardPanel {
            min-height: 180px;
            opacity: .84;
            transform: scale(.97);
          }
          .dashboardGrid.hasFocus .dashboardPanel:hover {
            opacity: .95;
          }
          .dashboardGrid.hasFocus .dashboardPanel.panelActive {
            opacity: 1;
            transform: none;
            box-shadow: 0 20px 60px rgba(0,0,0,.42), inset 0 0 0 1px rgba(46,204,113,.10);
          }
          .dashboardGrid.focus-compare .section-compare { grid-column: 1 / span 2; grid-row: 1 / span 3; }
          .dashboardGrid.focus-compare .section-grid { grid-column: 3; grid-row: 1; }
          .dashboardGrid.focus-compare .section-watch { grid-column: 3; grid-row: 2; }
          .dashboardGrid.focus-compare .section-ai { grid-column: 3; grid-row: 3; }

          .dashboardGrid.focus-vault .section-grid { grid-column: 1 / span 2; grid-row: 1 / span 3; }
          .dashboardGrid.focus-vault .section-compare { grid-column: 3; grid-row: 1; }
          .dashboardGrid.focus-vault .section-watch { grid-column: 3; grid-row: 2; }
          .dashboardGrid.focus-vault .section-ai { grid-column: 3; grid-row: 3; }

          .dashboardGrid.focus-watchlist .section-watch { grid-column: 1 / span 2; grid-row: 1 / span 3; }
          .dashboardGrid.focus-watchlist .section-compare { grid-column: 3; grid-row: 1; }
          .dashboardGrid.focus-watchlist .section-grid { grid-column: 3; grid-row: 2; }
          .dashboardGrid.focus-watchlist .section-ai { grid-column: 3; grid-row: 3; }

          .dashboardGrid.focus-ai .section-ai { grid-column: 1 / span 2; grid-row: 1 / span 3; }
          .dashboardGrid.focus-ai .section-compare { grid-column: 3; grid-row: 1; }
          .dashboardGrid.focus-ai .section-grid { grid-column: 3; grid-row: 2; }
          .dashboardGrid.focus-ai .section-watch { grid-column: 3; grid-row: 3; }
        }

        /* --- FINAL OVERRIDE: whole panel scroll on desktop --- */
        @media (min-width: 981px) {
          html, body, #root, .app { height: 100%; }
          body { overflow: hidden; }
          .main { height: calc(100vh - 96px); overflow: hidden; }

          .dashboardGrid{
            height: 100%;
            min-height: 0;
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(0,1fr);
            grid-template-rows: minmax(0,1fr) minmax(0,1fr);
            gap: 18px;
          }
          .dashboardGrid.hasFocus{
            grid-template-columns: minmax(0,1.18fr) minmax(0,1.18fr) minmax(260px,0.82fr);
            grid-template-rows: minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);
          }

          .dashboardPanel{
            min-height: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .dashboardPanel.panelActive{
            transform: none;
          }
          .panelScroll{
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 6px;
            scrollbar-gutter: stable;
          }
          .panelScroll::-webkit-scrollbar{
            width: 10px;
          }
          .panelScroll::-webkit-scrollbar-thumb{
            background: rgba(210,220,230,.22);
            border-radius: 999px;
            border: 2px solid rgba(0,0,0,.10);
          }
          .panelScroll::-webkit-scrollbar-track{
            background: rgba(0,0,0,.10);
            border-radius: 999px;
          }

          /* disable inner desktop scroll strips */
          .dashboardPanel .watchScroll,
          .dashboardPanel .pairsScroll,
          .dashboardPanel .liveListBox,
          .dashboardPanel .ordersList,
          .dashboardPanel .aiPanel,
          .dashboardPanel .aiOut,
          .dashboardPanel .aiSelect,
          .dashboardPanel .gridLeft,
          .dashboardPanel .gridRight{
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
          }
          .dashboardPanel .watchTable,
          .dashboardPanel .compareGrid,
          .dashboardPanel .gridLayout,
          .dashboardPanel .aiWrap{
            overflow: visible !important;
            min-height: 0 !important;
          }
          .gridRight{
            position: static !important;
            top: auto !important;
          }

          /* re-enable Compare internal scrolls after the global desktop override */
          .section-compare .compareGrid{
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) !important;
            align-items: start !important;
            min-height: 0 !important;
            gap: 12px !important;
          }
          .section-compare .compareChart{
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
          }
          .section-compare .pairsBox{
            display: flex !important;
            flex-direction: column !important;
            min-height: 0 !important;
            flex: 1 1 auto !important;
          }
          .section-compare .liveListBox{
            max-height: clamp(260px, 34vh, 420px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .section-compare .pairsScroll{
            flex: 1 1 auto !important;
            min-height: 360px !important;
            max-height: clamp(360px, 42vh, 520px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 8px !important;
            padding-bottom: 48px !important;
            margin-top: 6px !important;
            margin-bottom: 24px !important;
            scroll-padding-bottom: 48px !important;
            overscroll-behavior: contain !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
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
          .section-compare .pairsScroll::after{
            content: "";
            position: sticky;
            left: 0;
            right: 0;
            bottom: 0;
            display: block;
            height: 18px;
            margin-top: -18px;
            background: linear-gradient(180deg, rgba(6,24,22,0), rgba(6,24,22,.95));
            pointer-events: none;
          }

          /* focused desktop: give Compare more usable pair-list height */
          .dashboardGrid.hasFocus.focus-compare .section-compare .pairsScroll{
            min-height: 380px !important;
            max-height: clamp(380px, 46vh, 620px) !important;
            padding-bottom: 64px !important;
            scroll-padding-bottom: 64px !important;
          }

          .dashboardGrid.hasFocus.focus-compare .section-compare .pairsBox{
            flex: 1 1 auto !important;
          }

                    /* focused desktop: compact sidebar panels */
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .cardHead,
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .cardHead,
          .dashboardGrid.hasFocus .section-ai:not(.panelActive) .cardHead{
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .cardActions,
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .cardActions,
          .dashboardGrid.hasFocus .section-ai:not(.panelActive) .cardActions{
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-start !important;
            gap: 8px !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }

          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .gridLayout{
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .gridRight{
            position: static !important;
            width: 100% !important;
            justify-self: stretch !important;
          }
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .ordersHead{
            gap: 8px !important;
          }
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .ordersList{
            max-height: 220px !important;
          }
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .gridControls .hint,
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .gridControls .muted,
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .gridControls .tiny{
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          .watchCompact{
            display: grid;
            gap: 10px;
          }
          .watchCompactCard{
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
            align-items: center;
            padding: 10px 12px;
            border: 1px solid rgba(255,255,255,.06);
            border-radius: 14px;
            background: rgba(255,255,255,.03);
          }
          .watchCompactMain{
            min-width: 0;
            display: grid;
            gap: 4px;
          }
          .watchCompactTop{
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }
          .watchCompactMeta{
            display: grid;
            gap: 2px;
            min-width: 0;
          }
          .watchCompactPrice{
            text-align: right;
            display: grid;
            gap: 2px;
            justify-items: end;
            min-width: 0;
          }
          .watchCompactStats{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            min-width: 0;
          }
          .watchCompactStats .muted{
            white-space: nowrap;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchTable{
            display: block !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchHead{
            display: none !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchScroll{
            display: grid !important;
            gap: 10px !important;
            overflow-y: auto !important;
            max-height: clamp(180px, 26vh, 320px) !important;
            padding-right: 6px !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchRow{
            display: grid !important;
            grid-template-columns: 36px minmax(88px,1fr) 72px auto !important;
            gap: 10px !important;
            align-items: center !important;
            padding: 10px 12px !important;
            border: 1px solid rgba(255,255,255,.06) !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,.03) !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchRow > :nth-child(5),
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchRow > :nth-child(6){
            display: none !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchCoin{
            min-width: 0 !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchCoin > div:last-child{
            min-width: 0 !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchSym{
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }

        @media (max-width: 820px) {
          /* Mobile: keep desktop-style Compare + Watchlist, but smaller and horizontally scrollable inside the panel */
          .section-compare .panelScroll,
          .section-watch .panelScroll{
            overflow-x: hidden !important;
          }

          .section-compare .compareGrid{
            display: block !important;
            min-width: 0 !important;
          }
          .section-compare .compareLive{
            margin-bottom: 12px !important;
          }
          .section-compare .chartHeader{
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .section-compare .rowBtn{
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
          }
          .section-compare svg,
          .section-compare .svgChart,
          .section-compare .chartSvg{
            max-width: 100% !important;
          }
          .section-compare .pairsBox{
            min-width: 0 !important;
          }
          .section-compare .pairsBox > div[style*="justify-content: space-between"]{
            flex-wrap: wrap !important;
            align-items: flex-start !important;
          }
          .section-compare .pairsScroll{
            overflow-x: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
            padding: 8px !important;
          }
          .section-compare .pairRow{
            display: flex !important;
            align-items: center !important;
            min-width: 620px !important;
            padding: 10px 8px !important;
            gap: 8px !important;
          }
          .section-compare .pairRow > span:first-child{
            flex: 0 0 28px !important;
            width: 28px !important;
            font-size: 12px !important;
          }
          .section-compare .pairRow > div{
            display: grid !important;
            grid-template-columns: minmax(82px, 1.2fr) 104px 104px 52px auto auto !important;
            gap: 6px !important;
            align-items: center !important;
            min-width: 0 !important;
            flex: 1 0 auto !important;
          }
          .section-compare .pairName{
            white-space: nowrap !important;
            font-size: 12px !important;
          }
          .section-compare .pairRow .pill{
            font-size: 11px !important;
            padding: 4px 8px !important;
            line-height: 1.05 !important;
          }

          .section-watch .watchTable,
          .section-watch .watchScroll{
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .section-watch .watchHead,
          .section-watch .watchRow{
            min-width: 620px !important;
            grid-template-columns: 40px minmax(100px,1fr) 76px 96px 110px 110px 34px !important;
            gap: 8px !important;
            align-items: center !important;
          }
          .section-watch .watchHead{
            font-size: 11px !important;
          }
          .section-watch .watchRow{
            padding: 8px 6px !important;
          }
          .section-watch .watchCoin{
            min-width: 0 !important;
            white-space: nowrap !important;
          }
          .section-watch .watchSym{
            font-size: 12px !important;
          }
          .section-watch .watchRow .coinLogo.small{
            width: 18px !important;
            height: 18px !important;
            font-size: 10px !important;
          }
          .section-watch .watchRow .mono,
          .section-watch .watchRow .muted,
          .section-watch .watchRow button,
          .section-watch .watchRow input{
            font-size: 12px !important;
          }
          .section-watch .watchRow .iconBtn{
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
          }
        }

        @media (max-width: 980px) {
          .panelScroll{
            overflow: visible !important;
            padding-right: 0;
          }
        }

`}</style>
<header className="topbar">
        <div className="brand">
          <div className="logoBox" title="Logo placeholder">
            <svg viewBox="0 0 64 64" className="logoSvg" aria-hidden="true">
              <path d="M32 6 54 18v28L32 58 10 46V18L32 6Z" className="logoHex" />
              <path d="M32 14 46 22v20L32 50 18 42V22l14-8Z" className="logoInner" />
              <circle cx="32" cy="32" r="4" className="logoDot" />
            </svg>
          </div>
          <div>
            <div className="brandTitle">Nexus Analyt</div>
            <div className="brandSub">Live Vault Trading</div>
            <div className="brandTag">Secured by GoPlus</div>
          </div>
        </div>

        <div className="walletBox" style={{ position: "relative" }}>
          <div className="walletRow">
            {/* Wallet pill is DISPLAY-ONLY: opens modal, must never trigger external wallet connect */}
            <button
              type="button"
              className="pill silver"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setWalletModalOpen((v) => !v);
              }}
              aria-label="Open wallet details"
              title="Open wallet details"
            >
              {wallet
                ? `Wallet: ${wallet.slice(0, 6)}…${wallet.slice(-4)}`
                : authenticated
                  ? "Wallet: loading…"
                  : "Wallet not connected"}
            </button>

            {/* External connect is EXPLICIT: only this button may open MetaMask */}
            <button
              type="button"
              className="btn"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Use Privy auth state (wallet can be briefly empty while Privy initializes)
                if (authenticated) disconnectWallet();
                else connectWallet();
              }}
            >
              {authenticated ? "Disconnect" : "Connect"}
            </button>
          </div>

          

          {/* Access (Redeem / Subscribe) */}
          {wallet && (
            <div className="flex items-center gap-2">
              <button
                className="btnGhost"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAccessTab("redeem");
                  setRedeemMsg("");
                  setAccessModalOpen(true);
                }}
                title="Redeem Code"
              >
                Redeem Code
              </button>

              <button
                className="btnGhost"
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAccessTab("subscribe");
                  setSubMsg("");
                  setAccessModalOpen(true);
                }}
                title="Subscribe (USDC/USDT on ETH)"
              >
                Subscribe
              </button>

              <div className="text-xs" style={{ opacity: 0.75, marginLeft: 6 }}>
                {isPro ? (
                  <>
                    Access: <span className="pillOn">ACTIVE</span>
                    {access?.until ? (
                      <span style={{ marginLeft: 6 }}>
                        until {new Date(access.until).toLocaleDateString()}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    Access: <span className="pillOff">OFF</span>
                  </>
                )}
              </div>

              {/* Access modal */}
              
          {accessModalOpen && (
            <>
              {/* click-outside catcher */}
              <div
                onClick={() => setAccessModalOpen(false)}
                style={{ position: "fixed", inset: 0, background: "transparent", zIndex: 3000 }}
              />

              {/* top-right panel */}
              <div
                role="dialog"
                aria-label="Access / Redeem"
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{
                  position: "fixed",
                  top: 78,
                  right: 24,
                  width: 380,
                  maxWidth: "calc(100vw - 24px)",
                  background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                  border: "none",
                  borderRadius: 14,
                  padding: 14,
                  zIndex: 4000,
                  boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div className="cardTitle" style={{ margin: 0 }}>Access</div>
                  <button
                    className="iconBtn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAccessModalOpen(false);
                    }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="muted" style={{ marginTop: 8 }}>
                Redeem a permanent code, or subscribe to unlock <b>Trading + AI</b>.
                </div>

                <div className="hr" style={{ margin: "12px 0" }} />

{accessTab === "redeem" ? (
                  <div>
                    <div className="hint">Enter your permanent code:</div>
                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      <input
                        className="input"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        placeholder="XXXX-XXXX"
                      />
                      <button className="btn" disabled={redeemBusy} onClick={redeemAccess}>
                        {redeemBusy ? "..." : "Redeem"}
                      </button>
                    </div>
                    {redeemMsg ? <div className="hint" style={{ marginTop: 8 }}>{redeemMsg}</div> : null}
                  </div>
                ) : (
                  <div>
                                        <div className="hint" style={{ marginBottom: 8 }}>
                      Subscribe for <b>Nexus Pro</b> (${SUB_PRICE_USD}/30 days). Pay with <b>ETH / BNB / POL</b> (native) or <b>USDC/USDT</b>.
                    </div>

                    <div className="row" style={{ gap: 8, marginBottom: 10, alignItems: "center" }}>
                      <div className="hint" style={{ margin: 0, opacity: 0.9 }}>Network:</div>
                      <select
                        className="select"
                        value={subChain}
                        onChange={(e) => setSubChain(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="BNB">BNB Chain (BNB)</option>
                        <option value="POL">Polygon (POL)</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <div style={{ flex: 1 }} />
                      <button
                        type="button"
                        className={`pill ${subToken === "NATIVE" ? "active" : ""}`}
                        style={{ color: "#fff", background: subToken === "NATIVE" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "none", cursor: "pointer" }}
                        onClick={() => setSubToken("NATIVE")}
                      >
                        {subChain}
                      </button>
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

                    {ENABLED_CHAINS.map((c) => {
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
                {(showAllWalletChains ? ENABLED_CHAINS : [balActiveChain || DEFAULT_CHAIN]).map((c) => {
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
                  {[
                    { k: "BNB", label: "BNB (BNB Chain)", enabled: true },
                    { k: "POL", label: "POL (Polygon)", enabled: true },
                    { k: "ETH", label: "ETH (Ethereum)", enabled: true },
                    { k: "SOL", label: "SOL (soon)", enabled: false },
                    { k: "BTC", label: "BTC (soon)", enabled: false },
                  ].map((c) => (
                    <option key={c.k} value={c.k} disabled={!ENABLED_CHAINS.includes(c.k)}>
                      {c.label}{!ENABLED_CHAINS.includes(c.k) ? " — soon" : ""}
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
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); refreshVaultState(); }}
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
                    </>
                  }
                  en={
                    <>
                      <p><b>What is this?</b> Compare up to 20 coins selected via Watchlist → Compare.</p>
                      <p><b>Price</b> shows real price values. <b>Index 100</b> normalizes all coins to the same starting value of 100 and is better when many coins are compared at once.</p>
                      <p><b>Overlay</b> shows all selected coins in one shared chart. <b>Grid</b> shows one small tile per coin.</p>
                      <p><b>First 10 / Next 10 / All</b> lets you switch between the first 10, the next 10, or all compare coins.</p>
                      <p><b>Grid detail</b>: click a tile to open the large chart. There you can switch directly between <b>Price</b> and <b>Index 100</b>.</p>
                      <p><b>Legend</b>: color → coin. Click a legend item to highlight one coin.</p>
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
                  <div className="chartEmpty" style={{ minHeight: 300 }}>
                    <div className="muted">No coins in this compare range.</div>
                  </div>
                ) : (
                  <>
                    <SvgChart chart={chartRaw} height={300} highlightedSyms={visibleHighlightedSyms} onHoverSym={() => {}} indexMode={indexMode} timeframe={timeframe} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
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
                            </>
                        }

                      />
                    </InfoButton>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div className="muted tiny">Showing {bestPairsToShow.length} / {bestPairsAll.length} pairs</div>
                  <button className="ghostBtn tiny" onClick={() => setShowTop10Pairs(v => !v)}>
                    {showTop10Pairs ? "Show all pairs" : "Show top 10"}
                  </button>
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

                    minHeight: 380,
                    maxHeight: 440,
                    overflowY: "auto",
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
                              gridTemplateColumns: "minmax(88px, 1.2fr) 120px 120px 56px auto auto",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <span className="pairName" style={{ minWidth: 0, whiteSpace: "nowrap" }}>{p.pair}</span>

                            <span
                              className="pill"
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

                            <span className="pill silver" style={{ justifySelf: "end", whiteSpace: "nowrap" }}>Score {p.score}</span>
                            <span className="pill" style={{ justifySelf: "end", whiteSpace: "nowrap" }}>{(p.corr >= 0 ? "+" : "") + p.corr.toFixed(2)}</span>
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
                          High score here is based on correlation of the indexed series (Index 100). A big spread helps you decide which side
                          is stronger/weaker for a grid/rebalance idea.
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
                      onClick={runAiExplain}
                      disabled={aiExplainLoading}
                      title={!isPro ? "Subscribe to Nexus Pro to use AI" : ""}
                    >
                      {aiExplainLoading ? "Thinking…" : (isPro ? "AI Insight" : "Pro required")}
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

                            <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <div>
                                  <div className="label" style={{ marginBottom: 0 }}>Spread Analysis</div>
                                  <div className="muted tiny" style={{ marginTop: 2 }}>30D Relative Spread ({a} vs {b}) · Positive = {a} stronger · Negative = {b} stronger</div>
                                </div>
                                <span className="pill silver">Latest: {_fmtPctLocal(latestSpread)}</span>
                              </div>
                              {rows.length ? (
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none" style={{ width: "100%", height: 190, display: "block" }}>
                                  {[yMin, yMin / 2, 0, yMax / 2, yMax].map((tick, idx) => (
                                    <g key={idx}>
                                      <line x1={padL} x2={svgW - padR} y1={sy(tick)} y2={sy(tick)} stroke={tick === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"} strokeDasharray={tick === 0 ? "4 4" : "3 5"} />
                                      <text x={6} y={sy(tick) + 4} fill="rgba(232,242,240,0.72)" fontSize="11">{_fmtPctLocal(tick)}</text>
                                    </g>
                                  ))}
                                  <line x1={padL} x2={svgW - padR} y1={svgH - padB} y2={svgH - padB} stroke="rgba(255,255,255,0.12)" />
                                  <path d={pathD} fill="none" stroke="#35e0a1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                                  {Number.isFinite(latestSpread) ? (
                                    <>
                                      <circle cx={latestX} cy={latestY} r="4.5" fill="#35e0a1" />
                                      <text x={Math.max(padL + 8, latestX - 64)} y={Math.max(18, latestY - 10)} fill="#35e0a1" fontSize="12" fontWeight="700">{_fmtPctLocal(latestSpread)}</text>
                                    </>
                                  ) : null}
                                  <text x={padL} y={svgH - 6} fill="rgba(232,242,240,0.72)" fontSize="11">Start</text>
                                  <text x={padL + (innerW / 2)} y={svgH - 6} textAnchor="middle" fill="rgba(232,242,240,0.72)" fontSize="11">Mid</text>
                                  <text x={svgW - padR} y={svgH - 6} textAnchor="end" fill="rgba(232,242,240,0.72)" fontSize="11">Now</text>
                                  <text x={svgW - padR} y={Math.max(14, zeroY - 6)} textAnchor="end" fill="rgba(232,242,240,0.58)" fontSize="10">Mean reversion line (0%)</text>
                                </svg>
                              ) : (
                                <div className="muted tiny">No spread series available yet.</div>
                              )}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Direction</div><div style={{ fontWeight: 900, marginTop: 4 }}>{spreadDirection}</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Zero line</div><div style={{ fontWeight: 900, marginTop: 4 }}>0% = balanced pair</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Reading</div><div style={{ fontWeight: 900, marginTop: 4 }}>{reading}</div></div>
                              </div>
                              <div className="muted tiny" style={{ lineHeight: 1.45 }}>
                                {spreadDirection === "Falling"
                                  ? `Spread is falling — mean reversion is becoming more likely. Positive values mean ${a} was stronger; negative values mean ${b} was stronger.`
                                  : spreadDirection === "Rising"
                                    ? `Spread is rising — trend continuation is still active. Positive values mean ${a} is extending; negative values mean ${b} is extending.`
                                    : `Spread is flat — the pair is currently moving without a clear widening or compression signal.`}
                              </div>
                            </div>
                          </>
                        );
                      })()}

                      <div style={{ display: "grid", gap: 10, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                        <div className="label" style={{ marginBottom: 0 }}>Longer-Term Reversion Idea</div>

                        {aiExplainData.winner && aiExplainData.loser ? (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <span className="pill" style={{ background: "rgba(255,92,92,0.18)", borderColor: "rgba(255,92,92,0.35)" }}>SELL {aiExplainData.winner} later-view</span>
                            <span className="pill" style={{ background: "rgba(57,217,138,0.18)", borderColor: "rgba(57,217,138,0.35)" }}>BUY {aiExplainData.loser} later-view</span>
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
                      <p><b>SAFE / AGGRESSIVE</b> setzt nur deine Eingabewerte bzw. Presets. Es gibt keine vollautomatische Strategie-Ausführung nur durch den Modus.</p>
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
                      <p><b>SAFE / AGGRESSIVE</b> only changes your input preset values. It does not run a fully automatic strategy by itself.</p>
                      <p><b>Manual orders</b> are single orders and are not part of the main grid block.</p>
                      <p>BUY can be defined either by <b>USD</b> or by <b>token quantity</b>, depending on your input mode.</p>
                    </>
                  }
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="gridLayout">
            <div className="gridLeft">

          <div className="gridWrap">
            <div className="gridControls">
              <div className="formRow">
                <label>Coin</label>
                <select value={gridItem} onChange={(e) => setGridItem(e.target.value)}>
                  {gridWalletCoins.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              
              <div className="formRow">
                <label>Budget (Qty)</label>
                <input value={gridInvestQty} onChange={(e) => setGridInvestQty(e.target.value)} placeholder="250" />
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
          <div style={{
            marginTop: "10px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "rgba(255, 165, 0, 0.08)",
            border: "none",
            fontSize: "13px",
            lineHeight: "1.4",
            color: "#f5c16c"
          }}>
            <strong>Warning:</strong> Trading low-liquidity tokens may fail (no fills or high slippage). 
            You may still pay gas fees even if the trade does not execute successfully.
          </div>

              </div>

              <div className="divider" />

              <div className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Manual order
                <InfoButton title="Manual Order">
                  <Help showClose dismissable
                    de={
                      <>
                        <p><b>Side</b> bestimmt, ob du eine BUY- oder SELL-Order anlegst.</p>
                        <p><b>Price</b> ist dein Limit-Preis.</p>
                        <p><b>Price preset</b> wählt die Prozent-Gruppe: Fast, Standard, Wide oder Very Wide.</p>
                        <p><b>Quick price</b> übernimmt auf Basis des aktuellen Marktpreises direkt den gewünschten Prozent-Abstand in das Price-Feld.</p>
                        <p><b>Payout asset</b> legt fest, in welcher Chain-/Payout-Währung die Order geführt wird.</p>
                        <p><b>Qty</b> ist optional. <b>Add Order</b> erstellt die Order erst nach deiner Bestätigung.</p>
                      </>
                    }
                    en={
                      <>
                        <p><b>Side</b> defines whether you create a BUY or SELL order.</p>
                        <p><b>Price</b> is your limit price.</p>
                        <p><b>Price preset</b> chooses the percentage group: Fast, Standard, Wide or Very Wide.</p>
                        <p><b>Quick price</b> fills the Price field from the current market price using the selected percentage distance.</p>
                        <p><b>Payout asset</b> defines which chain/payout asset the order uses.</p>
                        <p><b>Qty</b> is optional. <b>Add Order</b> creates the order only after your confirmation.</p>
                      </>
                    }
                  />
                </InfoButton>
              </div>

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
                  marginTop: 8,
                  marginBottom: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <div style={{ fontWeight: 800 }}>Risk & settlement preview</div>
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: manualRiskState.tone,
                      border: manualRiskState.border,
                      color: manualRiskState.color,
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {manualRiskState.label}
                  </div>
                </div>
                <div className="tiny muted" style={{ display: "grid", gap: 4 }}>
                  <div>Chain: <b>{activeGridChainSymbol}</b></div>
                  <div>Pool liquidity: <b>{manualPoolLiquidityUsd == null ? "Backend pending" : fmtUsd(manualPoolLiquidityUsd)}</b></div>
                  <div>Open exposure: <b>{fmtUsd(manualOpenExposureUsd)}</b></div>
                  <div>After this order: <b>{fmtUsd(manualExposureAfterUsd)}</b></div>
                  <div>Estimated impact: <b>{manualEstimatedImpactPct == null ? "Backend pending" : `${manualEstimatedImpactPct.toFixed(2)}%`}</b></div>
                  <div>Payout asset: <b>{String(manualPayoutAsset || "USDC").toUpperCase()}</b></div>
                  <div>Settlement: <b>{manualSettlementPreview}</b></div>
                </div>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#bdebd8" }}>
                  <span>In chain: <b>{fmtUsd(Number(manualVaultTotalQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Allocated: <b>{fmtUsd(Number(manualVaultAllocatedQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Settled: <b>{fmtUsd(Number(manualVaultSettledQty || 0) * Number(activeGridNativeUsd || 0))}</b></span>
                  <span>Cycle out: <b>{fmtUsd((Number(manualVaultAvailableQty || 0) + Number(manualVaultAllocatedQty || 0) + Number(manualVaultSettledQty || 0)) * Number(activeGridNativeUsd || 0))}</b></span>
                </div>
              </div>

              <div className="row" style={{ display: "flex", justifyContent: "flex-start", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: -6, marginBottom: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>Slippage:</div>
                <input
                  value={manualSlippagePct}
                  onChange={(e) => setManualSlippagePct(e.target.value)}
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

              <div className="row" style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: -4, marginBottom: 10 }}>
                <div className="muted" style={{ fontSize: 12, minWidth: 90 }}>Price preset:</div>

                <button
                  className="btn"
                  type="button"
                  onClick={() => setManualPricePreset("FAST")}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "FAST" ? 1 : 0.88 }}
                  title="Fast preset (0.25 / 0.5 / 1)"
                >
                  Fast
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => setManualPricePreset("STANDARD")}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "STANDARD" ? 1 : 0.88 }}
                  title="Standard preset (0.5 / 1 / 2)"
                >
                  Standard
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => setManualPricePreset("WIDE")}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "WIDE" ? 1 : 0.88 }}
                  title="Wide preset (1 / 2 / 3)"
                >
                  Wide
                </button>

                <button
                  className="btn"
                  type="button"
                  onClick={() => setManualPricePreset("VERY_WIDE")}
                  style={{ ...compactGridChipStyle, opacity: manualPricePreset === "VERY_WIDE" ? 1 : 0.88 }}
                  title="Very Wide preset (5 / 10 / 15)"
                >
                  Very Wide
                </button>
              </div>

              <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
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
                <>
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
                </>
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
            <div className="cardTitle">Watchlist</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <button className="btn" onClick={() => setAddOpen(true)}>+ Add</button>
              <button className="btnGhost" onClick={() => fetchWatchSnapshot(null, { force: true, user: true })}>Refresh</button>
              <InfoButton title="Watchlist">
                <Help showClose dismissable
                  de={<><p><b>Compare</b> Checkbox steuert die Compare-Auswahl (max 20).</p><p><b>Drag & Drop</b> über den Griff links ändert die Reihenfolge. Diese Reihenfolge wird mit deiner Wallet auf dem Server gespeichert.</p><p><b>Market</b> ist ein Coin über CoinGecko-ID. <b>Token</b> ist ein DEX-Asset und braucht eine Contract-Address.</p><p><b>Refresh</b>: Nach dem Hinzufügen oder Ändern eines Coins/Tokens einmal drücken, damit Preis, 24h und Volumen nachgeladen werden.</p></>}
                  en={<><p><b>Compare</b> checkbox controls the compare set (max 20).</p><p><b>Drag & Drop</b> using the handle on the left changes the order. This order is saved on the server for your wallet.</p><p><b>Market</b> is a coin via CoinGecko ID. <b>Token</b> is a DEX asset and needs a contract address.</p><p><b>Refresh</b>: After adding or changing a coin/token, press once so price, 24h, and volume can be fetched.</p></>}
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="watchTable">
            {!isWatchSidebarCompact ? (
              <>
                <div className="watchHead watchStickyHead" style={{ gridTemplateColumns: "36px 120px 70px 110px 140px 140px 40px", gap: 10 }}>
                  <div style={{ textAlign: "center" }}>Compare</div>
                  <div>Coin</div>
                  <div className="right">%</div>
                  <div className="right">Price</div>
                  <div className="right">24h Vol</div>
                  <div className="right">Market Cap</div>
                  <div className="right"> </div>
                </div>

                <div className="watchScroll">
                  {watchRows.map((r, idx) => {
                    const sym = String(r.symbol || "").toUpperCase();
                    const checked = compareSymbols.includes(sym);
                    const marketCap = r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap ?? null;
                    return (
                      <div
                        key={`${sym}-${idx}`}
                        className="watchRow"
                        draggable
                        onDragStart={() => handleWatchDragStart(r)}
                        onDragOver={(e) => handleWatchDragOver(e, r)}
                        onDrop={(e) => handleWatchDrop(e, r)}
                        onDragEnd={handleWatchDragEnd}
                        style={{
                          cursor: "grab",
                          border: watchDropKey === _watchKeyFromRow(r) ? "1px dashed var(--line)" : undefined,
                          background: watchDropKey === _watchKeyFromRow(r) ? "rgba(255,255,255,0.04)" : undefined,
                          gridTemplateColumns: "44px minmax(110px,1.05fr) 84px 110px 140px 140px 46px",
                          gap: 10,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleCompare(sym)} disabled={!checked && compareSymbols.length >= 20} style={{ transform: "scale(0.95)" }} />
                        </div>
                        <div className="watchCoin" style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", minWidth: 0, whiteSpace: "nowrap" }}>
                            <div className="watchSym" style={{ fontSize: 13, lineHeight: 1.1, fontWeight: 800 }}>{sym}</div>
                          </div>
                        </div>
                        <div className={`right mono ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 13, lineHeight: 1.1, color: Number(r.change24h) >= 0 ? "var(--green)" : "var(--red)" }}>{fmtPct(r.change24h)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 13, lineHeight: 1.1 }}>{fmtUsd(r.price)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 12, lineHeight: 1.1 }}>{fmtUsd(r.volume24h)}</div>
                        <div className="right mono" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 12, lineHeight: 1.1 }}>{marketCap != null ? fmtUsd(marketCap) : "—"}</div>
                        <div className="right" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}><button className="iconBtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, lineHeight: 1 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); const mm = (r.mode || "market"); removeWatchItemByKey({ symbol: sym, mode: mm, tokenAddress: (mm === "dex" ? (r.contract || "") : "") , contract: (mm === "dex" ? (r.contract || "") : "") }); }} title="Remove">×</button></div>
                      </div>
                    );
                  })}
                  {!watchRows.length ? <div className="muted" style={{ padding: 10 }}>No watchlist data yet.</div> : null}
                </div>
              </>
            ) : (
              <div className="watchCompact">
                {watchRows.map((r, idx) => {
                  const sym = String(r.symbol || "").toUpperCase();
                  const checked = compareSymbols.includes(sym);
                  const mm = (r.mode || "market");
                  return (
                    <div
                      key={`${sym}-${idx}`}
                      className="watchCompactCard"
                      draggable
                      onDragStart={() => handleWatchDragStart(r)}
                      onDragOver={(e) => handleWatchDragOver(e, r)}
                      onDrop={(e) => handleWatchDrop(e, r)}
                      onDragEnd={handleWatchDragEnd}
                      style={{
                        cursor: "grab",
                        border: watchDropKey === _watchKeyFromRow(r) ? "1px dashed var(--line)" : undefined,
                        background: watchDropKey === _watchKeyFromRow(r) ? "rgba(255,255,255,0.04)" : undefined,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCompare(sym)} disabled={!checked && compareSymbols.length >= 20} style={{ transform: "scale(0.9)" }} />
                      </div>
                      <div className="watchCompactMain">
                        <div className="watchCompactTop" style={{ gap: 6 }}>
                          <div className="watchCompactMeta" style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                            <div className="watchSym" style={{ fontSize: 13, lineHeight: 1.1, fontWeight: 800 }}>{sym}</div>
                            <span className={`mono tiny ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`} style={{ fontSize: 12, lineHeight: 1.1, color: Number(r.change24h) >= 0 ? "var(--green)" : "var(--red)" }}>{fmtPct(r.change24h)}</span>
                          </div>
                        </div>
                        <div className="watchCompactStats" style={{ gap: 10 }}>
                          <span className="muted tiny" style={{ fontSize: 11, lineHeight: 1.1 }}>Vol {fmtUsd(r.volume24h)}</span>
                          <span className="muted tiny" style={{ fontSize: 11, lineHeight: 1.1 }}>MCap {((r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) != null) ? fmtUsd(r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) : "—"}</span>
                        </div>
                      </div>
                      <div className="watchCompactPrice" style={{ display: "grid", gap: 4, alignItems: "center" }}>
                        <div className="mono" style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.1 }}>{fmtUsd(r.price)}</div>
                        <button className="iconBtn" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, lineHeight: 1, justifySelf: "end" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeWatchItemByKey({ symbol: sym, mode: mm, tokenAddress: (mm === "dex" ? (r.contract || "") : ""), contract: (mm === "dex" ? (r.contract || "") : "") }); }} title="Remove">×</button>
                      </div>
                    </div>
                  );
                })}
                {!watchRows.length ? <div className="muted" style={{ padding: 10 }}>No watchlist data yet.</div> : null}
              </div>
            )}
          </div>

          <div className="muted tiny"></div>
        </div></section>

        {/* AI */}
        <section className={`card section-ai dashboardPanel ${activePanel === "ai" ? "panelActive" : ""}`} onClick={handlePanelActivate("ai")}>
          <div className="cardHead">
            <div className="cardTitle">AI Analyst</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <span className="pill silver">{aiSelected.length}/6 selected</span>
              <InfoButton title="AI Analyst">
                <Help showClose dismissable
                  de={<><p>Maximal <b>6 Coins</b> pro Analyse. Die Coins kommen aus deiner Compare-Auswahl.</p><p><b>Kind</b> bestimmt den Analyse-Typ: Analysis, Risk oder Explain.</p><p><b>Profile</b> steuert den Stil der Antwort, z. B. konservativ, ausgewogen oder volatilitätsfokussiert.</p><p><b>Follow-up</b> hält den Kontext für Rückfragen im selben AI-Dialog.</p></>}
                  en={<><p>Maximum <b>6 coins</b> per analysis. Coins are taken from your compare selection.</p><p><b>Kind</b> sets the analysis type: Analysis, Risk, or Explain.</p><p><b>Profile</b> controls the answer style, for example conservative, balanced, or volatility-focused.</p><p><b>Follow-up</b> keeps context for follow-up questions inside the same AI dialog.</p></>}
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
            max-height: clamp(220px, 28vh, 420px) !important;
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

function optimisticRemoveWatch(symbol) {
  const removed = loadSetLS(LS_WATCH_REMOVED);
  removed.add(symbol);
  saveSetLS(LS_WATCH_REMOVED, removed);

  setWatchItems(prev => prev.filter(x => x.symbol !== symbol));
  setCompareSet(prev => prev.filter(s => s !== symbol));

  // best-effort backend sync
  fetch(`${API_BASE}/api/watchlist/remove`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ symbol })
  }).catch(() => {});
}
