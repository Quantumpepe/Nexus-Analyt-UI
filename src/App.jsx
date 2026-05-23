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

// -------------------------
// Nexus Demo / Live Network Support
// -------------------------
const DEMO_ALL_EVM_ENABLED = true;

const ENABLE_VAULT_SUBSCRIBE = false; // Set true when vault subscription is ready and audited.

const LIVE_ENABLED_CHAINS = ["ETH", "BNB", "POL"];

const DEMO_MODE_NOTICE =
  "Demo Mode: All EVM networks can be simulated with real market data. Live execution is currently limited to ETH, BNB and POL.";

function getChainExecutionMode(chainKey, isLiveMode) {
  const ck = String(chainKey || "").toUpperCase();

  if (!isLiveMode) {
    return {
      mode: "demo",
      allowed: true,
      note: DEMO_MODE_NOTICE,
    };
  }

  if (LIVE_ENABLED_CHAINS.includes(ck)) {
    return {
      mode: "live",
      allowed: true,
      note: "Live execution enabled.",
    };
  }

  return {
    mode: "simulation_only",
    allowed: false,
    note: "Live execution for this chain is not active yet. Simulation only.",
  };
}

// -------------------------
// End Nexus Demo / Live Support
// -------------------------

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


function _cleanAiCardText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function _pickAiSectionValue(source, keys = []) {
  if (!source || typeof source !== "object") return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return _cleanAiCardText(value);
  }
  return "";
}

function _parseAiConclusionSections(aiExplainData = {}) {
  const structured =
    aiExplainData.analysis ||
    aiExplainData.market_intelligence ||
    aiExplainData.marketIntelligence ||
    aiExplainData.sections ||
    aiExplainData.ai_sections ||
    {};

  const base = {
    market_structure: _pickAiSectionValue(aiExplainData, ["market_structure", "marketStructure"]) || _pickAiSectionValue(structured, ["market_structure", "marketStructure", "structure"]),
    liquidity_state: _pickAiSectionValue(aiExplainData, ["liquidity_state", "liquidityState"]) || _pickAiSectionValue(structured, ["liquidity_state", "liquidityState", "liquidity"]),
    warnings: _pickAiSectionValue(aiExplainData, ["warnings", "liquidity_warnings", "liquidityWarnings"]) || _pickAiSectionValue(structured, ["warnings", "liquidity_warnings", "liquidityWarnings"]),
    risk_posture: _pickAiSectionValue(aiExplainData, ["risk_posture", "riskPosture"]) || _pickAiSectionValue(structured, ["risk_posture", "riskPosture", "risk"]),
    pair_relationship: _pickAiSectionValue(aiExplainData, ["pair_relationship", "pairRelationship"]) || _pickAiSectionValue(structured, ["pair_relationship", "pairRelationship", "relationship"]),
    tactical_read: _pickAiSectionValue(aiExplainData, ["tactical_read", "tacticalRead"]) || _pickAiSectionValue(structured, ["tactical_read", "tacticalRead", "tactical"]),
    invalidations: _pickAiSectionValue(aiExplainData, ["invalidations", "invalidation"]) || _pickAiSectionValue(structured, ["invalidations", "invalidation"]),
    edge: _pickAiSectionValue(aiExplainData, ["edge"]) || _pickAiSectionValue(structured, ["edge"]),
    setup_bias: _pickAiSectionValue(aiExplainData, ["setup_bias", "setupBias"]) || _pickAiSectionValue(structured, ["setup_bias", "setupBias"]),
    signal_context: _pickAiSectionValue(aiExplainData, ["signal_context", "signalContext"]) || _pickAiSectionValue(structured, ["signal_context", "signalContext"]),
  };

  const raw = String(aiExplainData.verdictText || aiExplainData.ai_conclusion || aiExplainData.conclusion || "").trim();
  if (raw) {
    const labels = [
      ["market_structure", "Market Structure"],
      ["liquidity_state", "Liquidity State"],
      ["warnings", "Warnings"],
      ["risk_posture", "Risk Posture"],
      ["pair_relationship", "Pair Relationship"],
      ["tactical_read", "Tactical Read"],
      ["invalidations", "Invalidations"],
      ["edge", "Edge"],
      ["setup_bias", "Setup bias"],
      
    ];
    labels.forEach(([key, label], idx) => {
      if (base[key]) return;
      const nextLabels = labels.slice(idx + 1).map(([, l]) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
      const re = nextLabels
        ? new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\s*(?:${nextLabels}):|$)`, "i")
        : new RegExp(`${label}:\\s*([\\s\\S]*)$`, "i");
      const m = raw.match(re);
      if (m && m[1]) base[key] = _cleanAiCardText(m[1]);
    });
  }

  return base;
}

function AiInsightCard({ title, value, tone = "neutral" }) {
  if (!value) return null;
  const tones = {
    structure: { border: "rgba(64,196,255,0.22)", bg: "rgba(64,196,255,0.055)", color: "#8bdcff" },
    liquidity: { border: "rgba(0,255,136,0.20)", bg: "rgba(0,255,136,0.050)", color: "#54f0a4" },
    warning: { border: "rgba(255,193,7,0.30)", bg: "rgba(255,193,7,0.075)", color: "#ffd166" },
    risk: { border: "rgba(255,107,107,0.26)", bg: "rgba(255,107,107,0.060)", color: "#ff8a8a" },
    tactical: { border: "rgba(187,134,252,0.24)", bg: "rgba(187,134,252,0.055)", color: "#c9a7ff" },
    edge: { border: "rgba(0,255,200,0.22)", bg: "rgba(0,255,200,0.050)", color: "#70ffe0" },
    neutral: { border: "rgba(255,255,255,0.10)", bg: "rgba(255,255,255,0.025)", color: "#d8fff1" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, padding: "8px 10px", background: t.bg }}>
      <div className="muted tiny" style={{ color: t.color, fontWeight: 900, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.45, color: "rgba(235,255,247,0.96)" }}>{value}</div>
    </div>
  );
}


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
const normalizeWalletChainKey = (chain) => {
  const raw = String(chain || "").trim().toUpperCase().replace(/^"|"$/g, "");
  const map = {
    ETH: "ETH",
    ETHEREUM: "ETH",
    1: "ETH",
    POL: "POL",
    POLYGON: "POL",
    MATIC: "POL",
    137: "POL",
    BNB: "BNB",
    BSC: "BNB",
    BINANCE: "BNB",
    56: "BNB",
  };
  return map[raw] || raw || "ETH";
};

const walletChainDisplayName = (chain) => {
  const c = normalizeWalletChainKey(chain);
  if (c === "ETH") return "Ethereum";
  if (c === "POL") return "Polygon";
  if (c === "BNB") return "BNB Chain";
  return c;
};

const getStableWhitelistForChain = (chain) => TOKEN_WHITELIST[normalizeWalletChainKey(chain)] || [];

const getTokenSpecKey = (t) => String(t?.address || "").toLowerCase();

const CHAIN_ID_BY_KEY = { ETH: 1, POL: 137, BNB: 56 };
const CHAIN_KEY_BY_ID = { 1: "ETH", 137: "POL", 56: "BNB" };

function decimalStringToUnits(value, decimals) {
  const dec = Number(decimals || 6);
  const s = String(value ?? "0").trim();
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error("Invalid payment amount");
  const [whole, fracRaw = ""] = s.split(".");
  const frac = (fracRaw + "0".repeat(dec)).slice(0, dec);
  return BigInt(whole || "0") * (10n ** BigInt(dec)) + BigInt(frac || "0");
}

function getSubscribeTokenSpec(config, chainKey, symbol) {
  const c = normalizeWalletChainKey(chainKey);
  const sym = String(symbol || "").toUpperCase();
  const cfgToken = config?.tokens?.[c]?.[sym];
  if (cfgToken?.address) {
    return { symbol: sym, address: String(cfgToken.address), decimals: Number(cfgToken.decimals ?? 6) };
  }
  const local = (TOKEN_WHITELIST[c] || []).find((t) => String(t.symbol).toUpperCase() === sym);
  if (local?.address) return local;
  throw new Error(`${sym} is not supported on ${c}.`);
}

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
  // - Frontend must NOT contain backend/API secrets.
  // - Use the user/session token when available, plus credentials: "include" for cookies.
  const candidates = [];
  const t = (token || "").trim();
  if (t) candidates.push(t);

  // Deduplicate while preserving order
  const seen = new Set();
  const bearers = candidates.filter((x) => {
    const k = String(x || "").trim();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const makeHeaders = (bearer, requestPath = "") => {
    const headers = { Accept: "application/json" };

    // Only send Content-Type when we actually send a JSON body.
    if (body != null && method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    if (bearer) headers["Authorization"] = `Bearer ${bearer}`;

    // Important for request volume:
    // GET requests already receive wallet + wallet_address as query params via withWalletQuery().
    // Adding a custom X-Wallet-Address header to every GET turns simple GETs into CORS preflight
    // pairs (OPTIONS + GET). That doubled/throttled the app with thousands of network rows.
    // Keep the wallet header only for non-GET requests where JSON body actions may need it.
    if (wa && method !== "GET") {
      headers["X-Wallet-Address"] = wa;
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
      const safeBody =
        body && typeof body === "object" && !Array.isArray(body)
          ? (() => {
              const next = { ...body };
              for (const key of ["wallet", "wallet_address", "walletAddress"]) {
                if (next[key]) next[key] = resolveWalletAddress(next[key]) || wa || "";
              }
              return next;
            })()
          : body;

      return await fetch(`${API_BASE}${requestPath}`, {
        method,
        signal: merged.signal,
        headers: makeHeaders(bearer, requestPath),
        credentials: "include",
        body: safeBody ? JSON.stringify(safeBody) : undefined,
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

async function fetchSubscribeConfig() {
  const res = await fetch(`${API_BASE}/api/access/subscribe/config`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const txt = await res.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = { raw: txt }; }
  if (!res.ok || !data || data.status === "error") {
    throw new Error(data?.error || data?.message || `Payment config failed (HTTP ${res.status})`);
  }
  const treasury = String(data.treasury || "").trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(treasury)) {
    throw new Error("Treasury address is not configured in backend.");
  }
  return data;
}

function useInterval(fn, ms, enabled = true) {
  const fnRef = useRef(fn);
  const inFlightRef = useRef(false);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled || !ms) return;

    const tick = async () => {
      // Do not poll aggressively while the browser tab is hidden.
      if (typeof document !== "undefined" && document.hidden) return;

      // Prevent stacked requests when the previous async poll is still pending.
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await fnRef.current?.();
      } finally {
        inFlightRef.current = false;
      }
    };

    const id = setInterval(tick, ms);
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


// Stable top-level helper: avoids React TDZ crashes when session ids are used in early hooks/dependency arrays.
function makeNexusSessionId(prefix = "NS") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
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
        className="btn"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        style={{ marginTop: 14 }}
      >
        Rotation Info
      </button>

      {open && (
        <div
          className="modalBackdrop"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
          style={{ zIndex: 99999 }}
        >
          <div
            className="modal modalHelp"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
              maxHeight: "82vh",
              overflowY: "auto",
            }}
          >
            <div className="modalHead">
              <div className="cardTitle">Nexus Rotation</div>
              <button
                className="iconBtn"
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
              >
                ×
              </button>
            </div>
            <div className="helpBody">
              <Help
                de={
                  <>
                    <p><b>Nexus Rotation</b> ist ein datenbasiertes System, das Kapital zwischen verschiedenen Assets verschiebt.</p>
                    <p><b>Ziel:</b> Kapital wird dort eingesetzt, wo Score, Momentum, Volumen und Marktstruktur am stärksten sind.</p>
                    <p><b>Demo Mode:</b> Rotation zeigt echte Marktdaten und simuliert, was passieren würde. Es wird nichts wirklich ausgeführt.</p>
                    <p><b>Live Mode:</b> Nach Zahlung oder Redeem Code kann der Vault echte Rotation-Aktionen ausführen, aber nur nach User-Bestätigung / Privy-Signatur.</p>
                    <p><b>Wichtig:</b> Nexus Rotation garantiert keinen Gewinn. Es ist ein Risiko- und Rebalancing-System auf Basis von Daten.</p>
                  </>
                }
                en={
                  <>
                    <p><b>Nexus Rotation</b> is a data-driven system that shifts capital between different assets.</p>
                    <p><b>Goal:</b> capital is allocated where score, momentum, volume and market structure are strongest.</p>
                    <p><b>Demo Mode:</b> Rotation shows real market data and simulates what would happen. Nothing is executed for real.</p>
                    <p><b>Live Mode:</b> After payment or redeem code, the Vault can execute real rotation actions, but only after user confirmation / Privy signature.</p>
                    <p><b>Important:</b> Nexus Rotation does not guarantee profit. It is a risk and rebalancing system based on data.</p>
                  </>
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
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
              maxHeight: "82vh",
              overflowY: "auto",
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

function watchSystemScore(row) {
  const ch = Number(row?.change24h ?? row?.chg_24h ?? row?.usd_24h_change ?? row?.change_24h);
  const vol = Number(row?.volume24h ?? row?.total_volume ?? row?.volume_24h);
  const mcap = Number(row?.marketCap ?? row?.market_cap ?? row?.mcap ?? row?.marketcap);
  let score = 55;
  if (Number.isFinite(ch)) {
    if (ch >= 10) score += 24;
    else if (ch >= 5) score += 18;
    else if (ch >= 2) score += 10;
    else if (ch >= 0) score += 4;
    else if (ch <= -10) score -= 24;
    else if (ch <= -5) score -= 16;
    else if (ch <= -2) score -= 8;
    else score -= 3;
  }
  if (Number.isFinite(vol) && vol > 0) {
    const v = Math.log10(Math.max(1, vol));
    score += Math.max(0, Math.min(14, (v - 5) * 3));
  }
  if (Number.isFinite(mcap) && mcap > 0) {
    const m = Math.log10(Math.max(1, mcap));
    score += Math.max(0, Math.min(10, (m - 7) * 2));
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function watchSystemRating(row) {
  return ratingFromScore(watchSystemScore(row));
}

const USER_RATING_POINTS = {
  AAA: 98,
  AA: 90,
  A: 80,
  BBB: 70,
  BB: 60,
  B: 50,
  CCC: 40,
  CC: 30,
  C: 20,
  RISK: 5,
};

function ratingFromScore(score) {
  const s = Number(score);
  if (!Number.isFinite(s)) return "RISK";
  if (s >= 95) return "AAA";
  if (s >= 85) return "AA";
  if (s >= 75) return "A";
  if (s >= 65) return "BBB";
  if (s >= 55) return "BB";
  if (s >= 45) return "B";
  if (s >= 35) return "CCC";
  if (s >= 25) return "CC";
  if (s >= 15) return "C";
  return "RISK";
}

function userRatingAverageScore(summary) {
  const ratings = summary?.ratings || {};
  let total = 0;
  let count = 0;
  for (const [rating, votes] of Object.entries(ratings)) {
    const points = USER_RATING_POINTS[String(rating || "").toUpperCase()];
    const c = Number(votes || 0);
    if (!Number.isFinite(points) || !Number.isFinite(c) || c <= 0) continue;
    total += points * c;
    count += c;
  }
  return count > 0 ? total / count : null;
}

function watchFinalScore(row, summary) {
  // System Rating stays objective and must not be mixed with User Rating.
  return watchSystemScore(row);
}

function watchOnchainScoreDelta(onchain) {
  const n = Number(onchain?.score_delta ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-5, Math.min(5, Math.round(n)));
}


function formatWhaleTimeAgo(timestamp) {
  if (!timestamp) return "recent";
  const t = new Date(timestamp).getTime();
  if (!Number.isFinite(t)) return "recent";
  const seconds = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getWhaleNewsSignal(onchain) {
  // IMPORTANT:
  // NEWS must only appear for a REAL Bitquery whale buy/sell signal.
  // No text guessing, no score_delta guessing, no fake NEWS.
  const whale = onchain?.whale && typeof onchain.whale === "object" ? onchain.whale : onchain;
  const source = String(whale?.source || "").toLowerCase();
  const action = String(whale?.action || "").toLowerCase();
  const amount = Number(whale?.amountUsd || whale?.latest?.amountUsd || 0);
  const dex = String(whale?.latest?.dex || whale?.dex || "").trim();
  const time = String(whale?.latest?.time || whale?.time || "").trim();

  const isRealBitqueryWhale =
    source === "bitquery" &&
    (action === "buy" || action === "sell") &&
    Number.isFinite(amount) &&
    amount > 0 &&
    !!dex &&
    dex.toLowerCase() !== "pending" &&
    !!time;

  if (!isRealBitqueryWhale) {
    return { type: "neutral", label: "🔥", color: "#aaa", title: "No fresh whale activity" };
  }

  if (action === "buy") {
    return { type: "buy", label: "NEWS", color: "#22c55e", title: "Whale bought recently" };
  }

  return { type: "sell", label: "NEWS", color: "#ef4444", title: "Whale sold recently" };
}

function marketConditionUi(state) {
  const s = String(state || "").toUpperCase();
  if (s === "REAL_BREAKOUT") {
    return {
      code: "B",
      text: "Breakout",
      color: "#16c784",
      border: "rgba(22,199,132,.45)",
      help: "Breakout: price is extended, but strong relative volume confirms the move."
    };
  }
  if (s === "FAKE_MOVE") {
    return {
      code: "W",
      text: "Weak",
      color: "#ea3943",
      border: "rgba(234,57,67,.45)",
      help: "Weak: price is extended, but volume does not confirm the move. Fake-move risk is higher."
    };
  }
  if (s === "EARLY_ACCUMULATION") {
    return {
      code: "E",
      text: "Early",
      color: "#f5b300",
      border: "rgba(245,179,0,.45)",
      help: "Early: relative volume is high while price is not yet heavily extended."
    };
  }
  if (s === "OVEREXTENDED") {
    return {
      code: "H",
      text: "Hot",
      color: "#ff8a3d",
      border: "rgba(255,138,61,.45)",
      help: "Hot: price is far above its 20-day average. Pullback risk can increase."
    };
  }
  return {
    code: "N",
    text: "Normal",
    color: "var(--muted)",
    border: "rgba(255,255,255,.12)",
    help: "Normal: no strong Overextension/RVOL anomaly detected."
  };
}

function normalizeMarketConditionForAi(mc) {
  if (!mc || typeof mc !== "object") return null;
  const ctx = mc.ai_context || {};
  return {
    state: mc.state || ctx.market_condition_state || "",
    label: mc.label || ctx.market_condition_label || "",
    level: mc.level || "",
    confidence: mc.confidence || "",
    oe_pct: Number.isFinite(Number(mc.oe_pct ?? ctx.overextension_pct)) ? Number(mc.oe_pct ?? ctx.overextension_pct) : null,
    rvol: Number.isFinite(Number(mc.rvol ?? ctx.relative_volume)) ? Number(mc.rvol ?? ctx.relative_volume) : null,
    score_delta: Number.isFinite(Number(mc.score_delta)) ? Number(mc.score_delta) : 0,
    interpretation: ctx.interpretation || mc.interpretation || mc.condition?.insight || "",
  };
}

function watchFinalRating(row, summary, onchain) {
  const base = watchFinalScore(row, summary);
  const delta = watchOnchainScoreDelta(onchain);
  return ratingFromScore(Math.max(0, Math.min(100, base + delta)));
}

function buildAiSignalContext({ syms, watchRows, ratingSummaryBySymbol, onchainBySymbol, marketConditionBySymbol, bestPairsToShow, compareWeights, aiMode, nexusTradingContext }) {
  const explicitSelected = Array.isArray(syms) ? syms.map((s) => String(s || "").toUpperCase()).filter(Boolean) : [];
  const fallbackSymbols = [];
  const addFallbackSym = (sym) => {
    const s = String(sym || "").trim().toUpperCase();
    if (s && /^[A-Z0-9]{2,12}$/.test(s) && !fallbackSymbols.includes(s)) fallbackSymbols.push(s);
  };
  for (const p of Array.isArray(bestPairsToShow) ? bestPairsToShow.slice(0, 8) : []) {
    String(p?.pair || "").split("/").slice(0, 2).forEach(addFallbackSym);
  }
  for (const r of Array.isArray(watchRows) ? watchRows.slice(0, 12) : []) {
    addFallbackSym(r?.symbol);
  }
  const selected = explicitSelected.length ? explicitSelected : fallbackSymbols.slice(0, 8);
  const rowBySym = new Map();
  for (const r of Array.isArray(watchRows) ? watchRows : []) {
    const sym = String(r?.symbol || "").toUpperCase();
    if (sym) rowBySym.set(sym, r);
  }

  const coins = selected.map((sym) => {
    const row = rowBySym.get(sym) || {};
    const summary = ratingSummaryBySymbol?.[sym] || null;
    const onchain = onchainBySymbol?.[sym] || null;
    const marketCondition = normalizeMarketConditionForAi(marketConditionBySymbol?.[sym]);
    const baseScore = watchFinalScore(row, summary);
    const onchainDelta = watchOnchainScoreDelta(onchain);
    const finalScore = Math.max(0, Math.min(100, baseScore + onchainDelta));

    return {
      symbol: sym,
      rating: ratingFromScore(finalScore),
      score: finalScore,
      base_score: baseScore,
      onchain_delta: onchainDelta,
      user_rating_votes: summary?.count ?? 0,
      user_rating_avg_score: userRatingAverageScore(summary),
      change_24h_pct: Number.isFinite(Number(row?.change24h)) ? Number(row.change24h) : null,
      price: Number.isFinite(Number(row?.price)) ? Number(row.price) : null,
      volume_24h: Number.isFinite(Number(row?.volume24h)) ? Number(row.volume24h) : null,
      market_cap: Number.isFinite(Number(row?.marketCap ?? row?.market_cap)) ? Number(row?.marketCap ?? row?.market_cap) : null,
      market_condition: marketCondition,
      onchain: onchain ? {
        icon: onchain.icon || "",
        label: onchain.label || "",
        score_delta: onchainDelta,
        summary: onchain.summary || "",
        source: onchain.source || "",
        signals: onchain.signals || {},
        contract: onchain.contract || null,
      } : null,
    };
  });

  const selectedSet = new Set(selected);
  const normalizePairForAi = (p) => ({
    pair: p?.pair,
    score: Number.isFinite(Number(p?.score)) ? Number(p.score) : null,
    corr: Number.isFinite(Number(p?.corr)) ? Number(p.corr) : null,
    spread_pct: Number.isFinite(Number(p?.spreadPct)) ? Number(p.spreadPct) : null,
    rsi_gap: Number.isFinite(Number(p?.rsiGap)) ? Number(p.rsiGap) : null,
    rsi_a: Number.isFinite(Number(p?.rsiA)) ? Number(p.rsiA) : null,
    rsi_b: Number.isFinite(Number(p?.rsiB)) ? Number(p.rsiB) : null,
    momentum_score: Number.isFinite(Number(p?.momentumScore)) ? Number(p.momentumScore) : null,
    opportunity_score: Number.isFinite(Number(p?.opportunityScore)) ? Number(p.opportunityScore) : null,
    stability_score: Number.isFinite(Number(p?.stabilityScore)) ? Number(p.stabilityScore) : null,
  });

  const allComparePairs = (Array.isArray(bestPairsToShow) ? bestPairsToShow : [])
    .slice(0, 20)
    .map(normalizePairForAi);

  const pairs = (Array.isArray(bestPairsToShow) ? bestPairsToShow : [])
    .filter((p) => {
      const pair = String(p?.pair || "");
      const parts = pair.split("/").map((x) => x.trim().toUpperCase());
      return parts.length === 2 && selectedSet.has(parts[0]) && selectedSet.has(parts[1]);
    })
    .slice(0, 8)
    .map(normalizePairForAi);

  return {
    version: "strategist_context_v3_coingecko_max",
    selected_origin: explicitSelected.length ? "explicit_symbols" : "hidden_watchlist_compare_scope",
    analysis_symbols: selected,
    ai_mode: String(aiMode || "standard").toLowerCase() === "extreme" ? "extreme" : "standard",
    compare_weights: sanitizeCompareWeights(compareWeights || DEFAULT_COMPARE_WEIGHTS),
    coins,
    relevant_pairs: pairs,
    all_compare_pairs: allComparePairs,
    nexus_trading: nexusTradingContext || null,
    notes: [
      "Rating is one visible rating built from market/system score, user rating average, and small on-chain delta.",
      "On-chain signals are supporting evidence only and capped to a small score impact.",
      "Missing on-chain icon means neutral/no strong signal, not an error.",
    ],
  };
}


function buildLocalPairAlertsForUi(pairs, compareWeights, aiMode) {
  const rows = Array.isArray(pairs) ? pairs : [];
  if (!rows.length) return [];
  const mode = String(aiMode || "standard").toLowerCase() === "extreme" ? "extreme" : "standard";
  const w = sanitizeCompareWeights(compareWeights || DEFAULT_COMPARE_WEIGHTS);
  const sens = mode === "extreme" ? 0.82 : 1.0;
  const alerts = [];

  rows.forEach((p, sourceIndex) => {
    if (!p || typeof p !== "object") return;
    const pair = String(p.pair || "").toUpperCase();
    if (!pair || !pair.includes("/")) return;

    const corr = Number(p.corr);
    const spread = Math.abs(Number(p.spreadPct));
    const rsiGap = Math.abs(Number(p.rsiGap));
    const score = Number(p.score);
    const momentumScore = Number(p.momentumScore);
    const opportunityScore = Number(p.opportunityScore);

    const reasons = [];
    let type = "";
    let base = Number.isFinite(score) ? score : 0;

    if (Number.isFinite(corr) && Number.isFinite(spread) && corr >= 0.72 * sens && spread >= 5.0 * sens) {
      type = "hidden_opportunity";
      reasons.push("spread movement");
      base += Number(w.opportunity || 25) * 0.28;
    }
    if (Number.isFinite(rsiGap) && rsiGap >= 14.0 * sens) {
      type = type || "rsi_divergence";
      reasons.push("RSI divergence");
      base += Number(w.momentum || 25) * 0.24;
    }
    if (Number.isFinite(momentumScore) && momentumScore >= 72 * sens) {
      type = type || "momentum_shift";
      reasons.push("momentum shift");
      base += Number(w.momentum || 25) * 0.12;
    }
    if (Number.isFinite(corr) && Number.isFinite(spread) && corr >= 0.82 * sens && spread >= 2.0 * sens && spread <= 7.5 / sens) {
      type = type || "rebound_watch";
      reasons.push("rebound watch");
      base += Number(w.corr || 35) * 0.14;
    }
    if (Number.isFinite(score) && score < 70 && ((Number.isFinite(spread) && spread >= 6.0 * sens) || (Number.isFinite(rsiGap) && rsiGap >= 16.0 * sens))) {
      type = type || "low_rank_unusual_activity";
      reasons.push("low-rank unusual activity");
      base += 8;
    }
    if (Number.isFinite(opportunityScore) && opportunityScore >= 78 * sens && !reasons.length) {
      type = "hidden_opportunity";
      reasons.push("opportunity score spike");
      base += Number(w.opportunity || 25) * 0.18;
    }

    if (!reasons.length) return;
    const strengthScore = Math.max(0, Math.min(100, Math.round(base * 10) / 10));
    const strength = strengthScore >= 82 ? "high" : strengthScore >= 65 ? "medium" : "low";
    alerts.push({
      pair,
      type: type || "pair_alert",
      strength,
      score: strengthScore,
      corr: Number.isFinite(corr) ? corr : null,
      spread_pct: Number.isFinite(spread) ? spread : null,
      rsi_gap: Number.isFinite(rsiGap) ? rsiGap : null,
      reasons: reasons.slice(0, 3),
      source_rank: Number.isFinite(sourceIndex) ? sourceIndex + 1 : null,
    });
  });

  const byPair = new Map();
  for (const alert of alerts) {
    const key = String(alert?.pair || "").toUpperCase().trim();
    if (!key) continue;
    const prev = byPair.get(key);
    if (!prev || Number(alert.score || 0) > Number(prev.score || 0)) {
      byPair.set(key, alert);
    }
  }

  return Array.from(byPair.values()).sort((a, b) => {
    const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
    if (scoreDiff) return scoreDiff;
    const spreadDiff = Number(b.spread_pct || 0) - Number(a.spread_pct || 0);
    if (spreadDiff) return spreadDiff;
    return Number(a.source_rank || 9999) - Number(b.source_rank || 9999);
  });
}

function formatAiSignalContextForPrompt(ctx) {
  const coins = Array.isArray(ctx?.coins) ? ctx.coins : [];
  const lines = coins.map((c) => {
    const oc = c.onchain;
    const mc = c.market_condition;
    const ocText = oc?.summary ? `on-chain: ${oc.summary}` : "on-chain: neutral/no strong signal";
    const mcText = mc?.state
      ? `market condition: ${mc.label || mc.state} (OE=${mc.oe_pct ?? "n/a"}%, RVOL=${mc.rvol ?? "n/a"}x, confidence=${mc.confidence || "n/a"}; ${mc.interpretation || "no interpretation"})`
      : "market condition: unavailable";
    const voteText = Number(c.user_rating_votes || 0) > 0 ? `community votes=${c.user_rating_votes}, avg=${c.user_rating_avg_score ?? "n/a"}` : "community votes=0";
    const ch = Number.isFinite(Number(c.change_24h_pct)) ? `${Number(c.change_24h_pct).toFixed(2)}% 24h` : "24h n/a";
    return `${c.symbol}: rating=${c.rating}, score=${c.score}, base=${c.base_score}, onchain_delta=${c.onchain_delta}, ${ch}, ${voteText}, ${ocText}, ${mcText}`;
  });

  const pairLines = (Array.isArray(ctx?.relevant_pairs) ? ctx.relevant_pairs : []).map((p) =>
    `${p.pair}: score=${p.score ?? "n/a"}, corr=${p.corr ?? "n/a"}, spread=${p.spread_pct ?? "n/a"}%, rsi_gap=${p.rsi_gap ?? "n/a"}`
  );

  const scopeLine = Array.isArray(ctx?.analysis_symbols) && ctx.analysis_symbols.length
    ? `Hidden Strategist analysis scope (${ctx.selected_origin || "context"}): ${ctx.analysis_symbols.join(", ")}`
    : "";
  const weightLine = ctx?.compare_weights ? `AI mode=${ctx.ai_mode || "standard"}; Compare weights corr=${ctx.compare_weights.corr}, momentum=${ctx.compare_weights.momentum}, opportunity=${ctx.compare_weights.opportunity}, stability=${ctx.compare_weights.stability}, sentiment=${ctx.compare_weights.sentiment}` : "";
  const tradingLine = ctx?.nexus_trading
    ? `Nexus Trading context: prepared=${ctx.nexus_trading?.prepared_setup?.symbol || "none"}, executable=${ctx.nexus_trading?.prepared_setup?.executable ?? "n/a"}, learning_setups=${ctx.nexus_trading?.learning_count ?? 0}, budget=${ctx.nexus_trading?.configured_budget_usd || "not set"}, risk_mode=${ctx.nexus_trading?.risk_mode || "n/a"}`
    : "";

  return [
    scopeLine,
    weightLine,
    tradingLine,
    lines.length ? `AI Signal Context:\n${lines.join("\n")}` : "",
    pairLines.length ? `Relevant pair context:\n${pairLines.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
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
            x1={sx(hoverIdx)}
            x2={sx(hoverIdx)}
            y1={padT}
            y2={h - padB}
            stroke="rgba(255,255,255,.25)"
            strokeDasharray="4 4"
          />
        )}

        {hoverIdx !== null && syms.map((sym, idx) => {
          const arr = plotLines?.[sym] || [];
          const v = arr?.[hoverIdx];
          if (v === null || v === undefined || !Number.isFinite(v)) return null;

          const hasHighlights = Array.isArray(highlightedSyms) && highlightedSyms.length > 0;
          const isHi = !hasHighlights || highlightedSyms.includes(sym);
          if (!isHi) return null;

          const c = colorForSym ? colorForSym(sym) : PALETTE20[idx % 10];
          return (
            <g key={`hover-dot-${sym}`} pointerEvents="none">
              <circle
                cx={sx(hoverIdx)}
                cy={sy(v)}
                r={6.4}
                fill="rgba(7,24,22,0.92)"
                stroke={c}
                strokeWidth={2.6}
              />
              <circle
                cx={sx(hoverIdx)}
                cy={sy(v)}
                r={2.6}
                fill={c}
              />
            </g>
          );
        })}
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
            padding: "8px 10px",
            minWidth: 190,
            boxShadow: "0 18px 50px rgba(0,0,0,.45)",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 4 }}>
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
    <div
      className="chartLegend"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "nowrap",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        paddingBottom: 2,
        scrollbarWidth: "thin",
      }}
    >
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
            style={{
              height: 20,
              minHeight: 20,
              minWidth: 0,
              flex: "0 0 auto",
              padding: "0 5px",
              gap: 3,
              fontSize: 10,
              lineHeight: 1,
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            <span
              className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`}
              style={{
                backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE20[idx % 10]),
                opacity: active ? 1 : 0.35,
                width: 6,
                height: 6,
                minWidth: 6,
              }}
            />
            <span className="legendSym" style={{ opacity: active ? 1 : 0.5, fontSize: 10 }}>{sym}</span>
          </button>
        );
      })}
      {symbols.length > 0 ? (
        <button
          className="legendItem active"
          onClick={showAll}
          title="Show all coins"
          type="button"
          style={{
            height: 20,
            minHeight: 20,
            minWidth: 0,
            flex: "0 0 auto",
            padding: "0 6px",
            fontSize: 10,
            lineHeight: 1,
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          <span className="legendSym" style={{ fontSize: 10 }}>All</span>
        </button>
      ) : null}
      {symbols.length === 0 ? <span className="muted">No coins selected.</span> : null}
    </div>
  );
}

function InlineWatchSpark({ sym, row, seriesMap, colorForSym, lineClassForSym, idx = 0 }) {
  const fullSeries = Array.isArray(seriesMap?.[sym]) ? (seriesMap[sym] || []) : [];

  const values = (() => {
    const normalize = (pts) => (pts || [])
      .map((pt) => {
        if (Array.isArray(pt)) {
          const t = Number(pt[0]);
          const v = Number(pt[1]);
          return Number.isFinite(t) && Number.isFinite(v) && v > 0 ? { t, v } : null;
        }
        if (pt && typeof pt === "object") {
          const t = Number(pt.t ?? pt.time ?? pt.ts ?? pt.x ?? 0);
          const v = Number(pt.v ?? pt.price ?? pt.value ?? pt.close ?? pt.y);
          return Number.isFinite(t) && Number.isFinite(v) && v > 0 ? { t, v } : null;
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.t - b.t);

    const pts = normalize(fullSeries);

    if (pts.length) {
      const maxT = Number(pts[pts.length - 1]?.t || 0);
      const sevenDayMs = 7 * 24 * 60 * 60 * 1000;

      // CoinGecko-style: use the real 7D line with many points.
      // Old version sampled down to ~36 points, which made the line look rough/simple.
      const chosen = maxT > 0 ? pts.filter((p) => p.t >= (maxT - sevenDayMs)) : pts;
      const src = chosen.length >= 12 ? chosen : pts;

      const maxPoints = 120;
      const step = Math.max(1, Math.ceil(src.length / maxPoints));
      const sampled = src
        .filter((_, i) => i % step === 0)
        .map((p) => p.v)
        .filter((v) => Number.isFinite(v) && v > 0);

      const last = src[src.length - 1]?.v;
      if (Number.isFinite(last) && last > 0 && sampled[sampled.length - 1] !== last) sampled.push(last);

      if (sampled.length >= 8) return sampled;
    }

    // Fallback only if no history is available. Keep it subtle, not zig-zaggy.
    const price = Number(row?.price);
    const chg = Number(row?.change24h);
    if (!Number.isFinite(price) || price <= 0) return [];
    const start = Number.isFinite(chg) ? price / (1 + chg / 100) : price * 0.985;
    return Array.from({ length: 42 }, (_, i) => {
      const t = i / 41;
      const drift = start + (price - start) * t;
      const wave = Math.sin(i * 0.55) * Math.abs(price) * 0.0018;
      return drift + wave;
    }).filter((v) => Number.isFinite(v) && v > 0);
  })();

  if (values.length < 2) {
    return <div className="watchMiniSpark empty" aria-hidden="true">—</div>;
  }

  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.01, 1e-6);
    min -= pad;
    max += pad;
  }

  const w = 150;
  const h = 44;
  const padX = 2;
  const padY = 3;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const sx = (i) => padX + (i * innerW) / Math.max(1, values.length - 1);
  const sy = (v) => {
    const t = (v - min) / Math.max(1e-9, (max - min));
    return padY + (1 - t) * innerH;
  };

  let d = "";
  values.forEach((v, i) => {
    const X = sx(i);
    const Y = sy(v);
    d += d ? ` L ${X.toFixed(2)} ${Y.toFixed(2)}` : `M ${X.toFixed(2)} ${Y.toFixed(2)}`;
  });

  const trendUp = values[values.length - 1] >= values[0];
  const stroke = trendUp ? "var(--green)" : "var(--red)";

  return (
    <div className="watchMiniSpark watchMiniSparkCg" title={`${sym} 7D chart`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        <path
          d={d}
          style={{
            fill: "none",
            stroke,
            strokeWidth: 2.05,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            opacity: 0.98,
            vectorEffect: "non-scaling-stroke",
          }}
        />
      </svg>
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
      <div className="sparkFoot muted tiny">{indexMode ? "Index 100" : "Price"} · 30D
<div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
  <button
    className="btnGhost"
    type="button"
    onClick={() => {
      setAccessTab("subscribe");
      setSubPlan("strategist_weekly");
      setSubMsg("");
      setAccessModalOpen(true);
    }}
    title="Strategist Weekly Access"
  >
    Strategist Weekly · $20
  </button>

  <button
    className="btnGhost"
    type="button"
    onClick={() => {
      setAccessTab("subscribe");
      setSubPlan("strategist_monthly");
      setSubMsg("");
      setAccessModalOpen(true);
    }}
    title="Strategist Monthly Access"
  >
    Strategist Monthly · $50
  </button>
</div>

</div>
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

const DEFAULT_COMPARE_WEIGHTS = { corr: 40, momentum: 20, opportunity: 20, stability: 10, sentiment: 10 };
const COMPARE_WEIGHT_KEYS = ["corr", "momentum", "opportunity", "stability", "sentiment"];
const COMPARE_WEIGHT_LABELS = {
  corr: "Correlation",
  momentum: "Momentum / RSI Gap",
  opportunity: "Spread / Opportunity",
  stability: "Stability / Volatility",
  sentiment: "Community Sentiment",
};
const COMPARE_WEIGHT_HELP = {
  corr: "How strongly pair relationship similarity influences ranking.",
  momentum: "Weights short-term movement pressure and relative momentum imbalance.",
  opportunity: "Prioritizes larger divergence and higher movement potential.",
  stability: "Controls preference for stable versus highly volatile setups.",
  sentiment: "Weights user ratings and community voting context when available.",
};
function sanitizeCompareWeights(input) {
  const out = { ...DEFAULT_COMPARE_WEIGHTS };
  const src = input && typeof input === "object" ? input : {};
  for (const k of COMPARE_WEIGHT_KEYS) {
    const n = Math.round(Number(src[k]));
    out[k] = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : DEFAULT_COMPARE_WEIGHTS[k];
  }
  let total = COMPARE_WEIGHT_KEYS.reduce((sum, k) => sum + out[k], 0);
  if (total > 100) {
    // Defensive cleanup for older/corrupt localStorage values. User edits still stay manual.
    for (const k of [...COMPARE_WEIGHT_KEYS].reverse()) {
      if (total <= 100) break;
      const cut = Math.min(out[k], total - 100);
      out[k] -= cut;
      total -= cut;
    }
  }
  return out;
}
function compareWeightTotal(weights) {
  const w = sanitizeCompareWeights(weights);
  return COMPARE_WEIGHT_KEYS.reduce((sum, k) => sum + Number(w[k] || 0), 0);
}

function computeBestPairsFromSeries(seriesBySym, limit = 30, scoreWeights = DEFAULT_COMPARE_WEIGHTS, ratingSummaryBySymbol = {}) {
  const { lines } = buildAlignedDailyLines(seriesBySym, { minDays: 20 });
  const syms = Object.keys(lines || {});
  if (syms.length < 2) return [];
  const normLines = normalizeToIndex(lines);

  const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number(v)));

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

  const lastReturnPct = (arr, days = 30) => {
    const vals = (Array.isArray(arr) ? arr : [])
      .map((p) => (p && typeof p === "object") ? Number(p.v) : Number(p))
      .filter((v) => Number.isFinite(v) && v > 0);
    if (vals.length < 2) return null;
    const start = vals[Math.max(0, vals.length - Math.max(2, days))];
    const end = vals[vals.length - 1];
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0) return null;
    return ((end / start) - 1) * 100;
  };

  const dailyVolPct = (arr, days = 30) => {
    const vals = (Array.isArray(arr) ? arr : [])
      .map((p) => (p && typeof p === "object") ? Number(p.v) : Number(p))
      .filter((v) => Number.isFinite(v) && v > 0)
      .slice(-Math.max(3, days));
    if (vals.length < 4) return null;
    const rets = [];
    for (let k = 1; k < vals.length; k++) {
      if (vals[k - 1] > 0) rets.push((vals[k] / vals[k - 1]) - 1);
    }
    if (rets.length < 3) return null;
    const mean = rets.reduce((sum, x) => sum + x, 0) / rets.length;
    const variance = rets.reduce((sum, x) => sum + ((x - mean) ** 2), 0) / rets.length;
    return Math.sqrt(variance) * 100;
  };

  const rsiGapScore = (gap) => {
    if (!Number.isFinite(gap)) return 50;
    // Best zone for pair ideas: enough momentum difference to matter, but not so extreme that it is pure chaos.
    if (gap <= 5) return 30 + gap * 5;          // 30..55
    if (gap <= 15) return 55 + (gap - 5) * 4;   // 55..95
    if (gap <= 30) return 95 - (gap - 15) * 1;  // 95..80
    return clamp(80 - (gap - 30) * 2, 35, 80);
  };

  const weights = sanitizeCompareWeights(scoreWeights);
  const res = [];
  for (let i = 0; i < syms.length; i++) {
    for (let j = i + 1; j < syms.length; j++) {
      const a = syms[i], b = syms[j];
      const r = pearson(normLines[a] || [], normLines[b] || []);
      if (r === null) continue;

      const rsiA = calcSimpleRsiLocal((seriesBySym && seriesBySym[a]) || [], 14);
      const rsiB = calcSimpleRsiLocal((seriesBySym && seriesBySym[b]) || [], 14);
      const rsiGap = Number.isFinite(rsiA) && Number.isFinite(rsiB) ? Math.abs(rsiA - rsiB) : null;

      const retA = lastReturnPct((seriesBySym && seriesBySym[a]) || [], 30);
      const retB = lastReturnPct((seriesBySym && seriesBySym[b]) || [], 30);
      const spreadPct = Number.isFinite(retA) && Number.isFinite(retB) ? Math.abs(retA - retB) : null;
      const volA = dailyVolPct((seriesBySym && seriesBySym[a]) || [], 30);
      const volB = dailyVolPct((seriesBySym && seriesBySym[b]) || [], 30);
      const volGap = Number.isFinite(volA) && Number.isFinite(volB) ? Math.abs(volA - volB) : null;

      const corrScore = Math.round(clamp(Math.abs(r) * 100));
      const momentumScore = Math.round(rsiGapScore(rsiGap));
      const opportunityScore = Math.round(Number.isFinite(spreadPct) ? clamp(spreadPct * 3.5, 0, 100) : 50);
      const stabilityScore = Math.round(Number.isFinite(volGap) ? clamp(100 - (volGap * 10), 25, 100) : 60);
      const sentimentA = userRatingAverageScore(ratingSummaryBySymbol?.[a]);
      const sentimentB = userRatingAverageScore(ratingSummaryBySymbol?.[b]);
      const sentimentScore = Math.round(
        Number.isFinite(sentimentA) && Number.isFinite(sentimentB)
          ? clamp((sentimentA + sentimentB) / 2, 0, 100)
          : 50
      );

      // Composite: correlation still matters, but the score now also reflects momentum gap,
      // real 30D opportunity spread, volatility stability, and optional user/community sentiment.
      const score = Math.round(
        (corrScore * (Number(weights.corr || 0) / 100)) +
        (momentumScore * (Number(weights.momentum || 0) / 100)) +
        (opportunityScore * (Number(weights.opportunity || 0) / 100)) +
        (stabilityScore * (Number(weights.stability || 0) / 100)) +
        (sentimentScore * (Number(weights.sentiment || 0) / 100))
      );

      res.push({
        pair: `${a}/${b}`,
        a,
        b,
        corr: r,
        score,
        corrScore,
        momentumScore,
        opportunityScore,
        stabilityScore,
        sentimentScore,
        rsiA,
        rsiB,
        rsiGap,
        retA,
        retB,
        spreadPct,
        volA,
        volB,
        volGap,
      });
    }
  }
  res.sort((x, y) => (y.score - x.score) || (y.corrScore - x.corrScore));
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

  const weights = sanitizeCompareWeights(scoreWeights);
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
  const CHAIN_LABELS = {
    ETH: "ETH (Ethereum)",
    POL: "POL (Polygon)",
    BNB: "BNB (BNB Chain)",
    ARB: "ARB (Arbitrum)",
    OP: "OP (Optimism)",
    BASE: "BASE (Base)",
    AVAX: "AVAX (Avalanche)",
    FTM: "FTM (Fantom)",
  };
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
  const [activePanel, setActivePanel] = useState(null);

  const isCompactMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const isCompactWatchNumbers = typeof window !== "undefined" && window.innerWidth <= 1280;
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

  const [marketBannerItems, setMarketBannerItems] = useState([
    { label: "Trader Pulse", value: "Loading live liquidity, volatility and risk…", detail: "Waiting for real market data from the backend.", metric: "LIVE", tone: "neutral", chartType: "line", chartData: [] },
  ]);
  const [marketBannerIndex, setMarketBannerIndex] = useState(0);

  useEffect(() => {
    let alive = true;

    const fmtBannerUsd = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return "—";
      if (Math.abs(n) >= 1_000_000_000_000) return `$${stripTrailingZeros((n / 1_000_000_000_000).toFixed(2))}T`;
      if (Math.abs(n) >= 1_000_000_000) return `$${stripTrailingZeros((n / 1_000_000_000).toFixed(2))}B`;
      if (Math.abs(n) >= 1_000_000) return `$${stripTrailingZeros((n / 1_000_000).toFixed(2))}M`;
      return fmtUsd(n);
    };

    const pctText = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return "—";
      return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
    };

    const cleanSeries = (arr = []) => (Array.isArray(arr) ? arr : [])
      .map((x) => Array.isArray(x) ? Number(x[1]) : Number(x))
      .filter((n) => Number.isFinite(n));

    const pctSeries = (values = []) => {
      const v = cleanSeries(values);
      if (v.length < 2) return [];
      const base = v[0] || 1;
      return v.map((x) => ((x - base) / base) * 100);
    };

    const returnSeries = (values = []) => {
      const v = cleanSeries(values);
      const out = [];
      for (let i = 1; i < v.length; i += 1) {
        const prev = v[i - 1];
        if (prev) out.push(((v[i] - prev) / prev) * 100);
      }
      return out;
    };

    const sumAlignedSeries = (seriesList = []) => {
      const cleaned = seriesList.map(cleanSeries).filter((v) => v.length >= 2);
      if (!cleaned.length) return [];
      const len = Math.min(...cleaned.map((v) => v.length));
      return Array.from({ length: len }, (_, i) => cleaned.reduce((sum, v) => sum + Number(v[v.length - len + i] || 0), 0));
    };

    const avgAbsReturnSeries = (seriesList = []) => {
      const returns = seriesList.map(returnSeries).filter((v) => v.length >= 1);
      if (!returns.length) return [];
      const len = Math.min(...returns.map((v) => v.length));
      return Array.from({ length: len }, (_, i) => {
        const vals = returns.map((v) => Math.abs(Number(v[v.length - len + i] || 0)));
        return vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
      });
    };

    const latestPctChange = (values = []) => {
      const v = cleanSeries(values);
      if (v.length < 2 || !v[0]) return NaN;
      return ((v[v.length - 1] - v[0]) / v[0]) * 100;
    };


    const KNOWN_MARKET_IDS = {
      BTC: "bitcoin",
      ETH: "ethereum",
      BNB: "binancecoin",
      XRP: "ripple",
      SOL: "solana",
      POL: "polygon-ecosystem-token",
      MATIC: "polygon-ecosystem-token",
      ADA: "cardano",
      AVAX: "avalanche-2",
      LINK: "chainlink",
      TON: "the-open-network",
      DOGE: "dogecoin",
      TRX: "tron",
      DOT: "polkadot",
      LTC: "litecoin",
      BCH: "bitcoin-cash",
      UNI: "uniswap",
      NEAR: "near",
      APT: "aptos",
      ARB: "arbitrum",
      OP: "optimism",
      SUI: "sui",
      INJ: "injective-protocol",
      FET: "fetch-ai",
      RENDER: "render-token",
      RNDR: "render-token",
      TAO: "bittensor",
    };

    const readJsonLS = (key, fallback) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    const isProbablyCgId = (value) => {
      const v = String(value || "").trim().toLowerCase();
      if (!v || v.startsWith("0x")) return false;
      if (/^[a-z0-9-]{3,80}$/.test(v) && !/^[a-z]{1,6}$/.test(v)) return true;
      return false;
    };

    const pushAdaptiveCoin = (map, id, sym, source = "market") => {
      const coinId = String(id || "").trim().toLowerCase();
      const symbol = String(sym || "").trim().toUpperCase();
      if (!coinId || !symbol || coinId.startsWith("0x")) return;
      if (!map.has(coinId)) map.set(coinId, { id: coinId, sym: symbol, sources: new Set() });
      map.get(coinId).sources.add(source);
    };

    const buildAdaptiveCoinUniverse = () => {
      const map = new Map();
      const core = [
        ["bitcoin", "BTC", "core"],
        ["ethereum", "ETH", "core"],
      ];
      const broadMarket = [
        ["binancecoin", "BNB", "major"],
        ["ripple", "XRP", "major"],
        ["solana", "SOL", "major"],
        ["polygon-ecosystem-token", "POL", "major"],
        ["cardano", "ADA", "major"],
        ["avalanche-2", "AVAX", "major"],
        ["chainlink", "LINK", "major"],
        ["the-open-network", "TON", "major"],
        ["dogecoin", "DOGE", "major"],
        ["arbitrum", "ARB", "major"],
        ["optimism", "OP", "major"],
        ["sui", "SUI", "major"],
      ];

      [...core, ...broadMarket].forEach(([id, sym, source]) => pushAdaptiveCoin(map, id, sym, source));

      const addFromObj = (obj, source) => {
        if (!obj || typeof obj !== "object") return;
        const sym = String(obj.symbol || obj.sym || obj.coin || obj.ticker || "").trim().toUpperCase();
        const directId = obj.coingecko_id || obj.coingeckoId || obj.cg_id || obj.coin_id || obj.coinId;
        const id = isProbablyCgId(directId) ? directId : KNOWN_MARKET_IDS[sym];
        if (id && sym) pushAdaptiveCoin(map, id, sym, source);
      };

      const watchItemsLS = readJsonLS("nexus_watch_items", []);
      const watchRowsLS = readJsonLS(LS_WATCH_ROWS_CACHE, []);
      if (Array.isArray(watchItemsLS)) watchItemsLS.forEach((x) => addFromObj(x, "watchlist"));
      if (Array.isArray(watchRowsLS)) watchRowsLS.forEach((x) => addFromObj(x, "watchlist"));

      return Array.from(map.values()).slice(0, 24).map((x) => ({ ...x, sources: Array.from(x.sources || []) }));
    };

    const selectAdaptiveCoins = (universe, prices) => {
      const safe = Array.isArray(universe) ? universe : [];
      const coreIds = new Set(["bitcoin", "ethereum"]);
      const core = safe.filter((c) => coreIds.has(c.id));
      const scored = safe
        .filter((c) => !coreIds.has(c.id))
        .map((c) => {
          const p = prices?.[c.id] || {};
          const ch = Number(p.usd_24h_change);
          const vol = Number(p.usd_24h_vol);
          const cap = Number(p.usd_market_cap);
          const sourceBoost = c.sources?.includes("watchlist") ? 18 : c.sources?.includes("major") ? 7 : 0;
          const volatilityScore = Number.isFinite(ch) ? Math.min(45, Math.abs(ch) * 4) : 0;
          const volumeScore = Number.isFinite(vol) && vol > 0 ? Math.min(25, Math.log10(vol) * 3) : 0;
          const capScore = Number.isFinite(cap) && cap > 0 ? Math.min(15, Math.log10(cap) * 1.4) : 0;
          return { ...c, score: sourceBoost + volatilityScore + volumeScore + capScore, ch, vol, cap };
        })
        .sort((a, b) => b.score - a.score);

      const picked = [...core, ...scored.slice(0, 6)];
      const seen = new Set();
      return picked.filter((c) => {
        if (!c?.id || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    };

    const loadGlobalMarketBanner = async () => {
      try {
        const universe = buildAdaptiveCoinUniverse();
        const universeIds = universe.map((c) => c.id).filter(Boolean).join(",");

        const [globalRes, priceRes] = await Promise.allSettled([
          api("/api/coingecko/global"),
          api(`/api/coingecko/simple_price?ids=${encodeURIComponent(universeIds)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`),
        ]);

        const globalRaw = globalRes.status === "fulfilled" ? globalRes.value : {};
        const globalData = globalRaw?.data || globalRaw || {};
        const prices = priceRes.status === "fulfilled" ? priceRes.value || {} : {};

        const selectedCoins = selectAdaptiveCoins(universe, prices);
        const coins = selectedCoins.map((c) => [c.id, c.sym, c.sources || []]);

        const chartResults = await Promise.allSettled(
          coins.map(([id]) => api(`/api/coingecko/market_chart/${encodeURIComponent(id)}?vs_currency=usd&days=7&interval=daily`))
        );

        const chartById = {};
        chartResults.forEach((res, idx) => {
          if (res.status === "fulfilled" && res.value) chartById[coins[idx][0]] = res.value;
        });

        const priceSeriesById = {};
        const volumeSeriesById = {};
        coins.forEach(([id]) => {
          priceSeriesById[id] = cleanSeries(chartById[id]?.prices || []);
          volumeSeriesById[id] = cleanSeries(chartById[id]?.total_volumes || []);
        });

        const priceSeriesList = Object.values(priceSeriesById).filter((v) => v.length >= 2);
        const volumeSeriesList = Object.values(volumeSeriesById).filter((v) => v.length >= 2);

        const next = [];
        const capChange = Number(globalData?.market_cap_change_percentage_24h_usd);
        const totalCap = Number(globalData?.total_market_cap?.usd);
        const totalVol = Number(globalData?.total_volume?.usd);
        const btcDom = Number(globalData?.market_cap_percentage?.btc);
        const ethDom = Number(globalData?.market_cap_percentage?.eth);
        const liquidityRatio = Number.isFinite(totalVol) && Number.isFinite(totalCap) && totalCap > 0
          ? (totalVol / totalCap) * 100
          : NaN;

        const majorChanges = coins
          .map(([id]) => {
            const live24h = Number(prices?.[id]?.usd_24h_change);
            return Number.isFinite(live24h) ? live24h : latestPctChange(priceSeriesById[id]);
          })
          .filter((n) => Number.isFinite(n));
        const avgAbsVolatility = majorChanges.length
          ? majorChanges.reduce((a, b) => a + Math.abs(b), 0) / majorChanges.length
          : NaN;
        const gainers = majorChanges.filter((n) => n > 0).length;
        const breadthPct = majorChanges.length ? (gainers / majorChanges.length) * 100 : NaN;

        const volatilityCurve = avgAbsReturnSeries(priceSeriesList);
        const liquidityCurve = sumAlignedSeries(volumeSeriesList);
        const btcCurve = pctSeries(priceSeriesById.bitcoin || []);
        const ethCurve = pctSeries(priceSeriesById.ethereum || []);
        const rotationCurve = (() => {
          const len = Math.min(btcCurve.length, ethCurve.length);
          if (!len) return [];
          return Array.from({ length: len }, (_, i) => ethCurve[ethCurve.length - len + i] - btcCurve[btcCurve.length - len + i]);
        })();
        const riskCurve = (() => {
          const len = Math.max(volatilityCurve.length, liquidityCurve.length, btcCurve.length);
          if (!len) return [];
          return Array.from({ length: len }, (_, i) => {
            const vol = Number(volatilityCurve[volatilityCurve.length - len + i] ?? avgAbsVolatility ?? 0);
            const liqBase = liquidityCurve[0] || 1;
            const liqNow = Number(liquidityCurve[liquidityCurve.length - len + i] ?? liquidityCurve[liquidityCurve.length - 1] ?? liqBase);
            const liqPct = liqBase ? ((liqNow - liqBase) / liqBase) * 100 : 0;
            const btcMove = Number(btcCurve[btcCurve.length - len + i] ?? 0);
            let score = 50;
            score += Math.max(-12, Math.min(12, liqPct / 2));
            score += Math.max(-10, Math.min(10, btcMove));
            score -= Math.max(0, Math.min(18, vol * 3));
            return Math.max(0, Math.min(100, score));
          });
        })();

        const riskScore = (() => {
          let score = 50;
          if (Number.isFinite(capChange)) score += Math.max(-18, Math.min(18, capChange * 4));
          if (Number.isFinite(liquidityRatio)) score += liquidityRatio >= 4 ? 8 : liquidityRatio < 2.5 ? -8 : 0;
          if (Number.isFinite(avgAbsVolatility)) score += avgAbsVolatility > 5 ? -12 : avgAbsVolatility > 3 ? -6 : 4;
          if (Number.isFinite(breadthPct)) score += breadthPct >= 66 ? 8 : breadthPct <= 34 ? -8 : 0;
          if (Number.isFinite(btcDom) && Number.isFinite(capChange) && btcDom > 58 && capChange < 0) score -= 6;
          return Math.max(0, Math.min(100, Math.round(score)));
        })();
        const riskLabel = riskScore >= 62 ? "Risk-On" : riskScore <= 42 ? "Risk-Off" : "Neutral";
        const riskTone = riskScore >= 62 ? "positive" : riskScore <= 42 ? "negative" : "warning";

        next.push({
          label: "Market Risk",
          value: `${riskLabel} ${riskScore}/100${Number.isFinite(capChange) ? ` · MCap ${pctText(capChange)}` : ""}`,
          detail: Number.isFinite(capChange) ? `Live global market cap ${pctText(capChange)} · breadth ${Number.isFinite(breadthPct) ? breadthPct.toFixed(0) + "%" : "—"}` : "Live risk state from market cap, breadth, liquidity and volatility.",
          metric: `${riskScore}/100`,
          tone: riskTone,
          chartType: "line",
          chartData: riskCurve,
        });

        if (Number.isFinite(liquidityRatio) || Number.isFinite(totalVol) || liquidityCurve.length) {
          next.push({
            label: "Global Liquidity",
            value: `${Number.isFinite(liquidityRatio) ? `${liquidityRatio.toFixed(2)}% vol/cap` : "—"}${Number.isFinite(totalVol) ? ` · Vol ${fmtBannerUsd(totalVol)}` : ""}`,
            detail: "Live volume curve from major market charts plus global vol/cap pressure.",
            metric: Number.isFinite(liquidityRatio) ? `${liquidityRatio.toFixed(2)}%` : fmtBannerUsd(totalVol),
            tone: Number.isFinite(liquidityRatio) && liquidityRatio >= 4 ? "positive" : Number.isFinite(liquidityRatio) && liquidityRatio < 2.5 ? "negative" : "neutral",
            chartType: "bars",
            chartData: liquidityCurve,
          });
        }

        if (Number.isFinite(avgAbsVolatility) || volatilityCurve.length) {
          next.push({
            label: "Volatility Pulse",
            value: `${Number.isFinite(avgAbsVolatility) ? avgAbsVolatility.toFixed(2) + "% avg 24h move" : "Live volatility"} · ${Number.isFinite(breadthPct) ? `${breadthPct.toFixed(0)}% green` : "breadth —"}`,
            detail: `Live adaptive 7D return-volatility from BTC/ETH core plus ${Math.max(0, coins.length - 2)} active market/watchlist assets.`,
            metric: Number.isFinite(avgAbsVolatility) ? `${avgAbsVolatility.toFixed(2)}%` : "LIVE",
            tone: avgAbsVolatility > 5 ? "negative" : avgAbsVolatility > 3 ? "warning" : "positive",
            chartType: "bars",
            chartData: volatilityCurve,
          });
        }

        if (Number.isFinite(btcDom) || btcCurve.length) {
          next.push({
            label: "Dominance Risk",
            value: `BTC ${Number.isFinite(btcDom) ? btcDom.toFixed(1) + "%" : "—"}${Number.isFinite(ethDom) ? ` · ETH ${ethDom.toFixed(1)}%` : ""}`,
            detail: btcDom > 58 ? "High BTC dominance can signal defensive positioning and lower alt risk appetite." : "Dominance is not showing extreme defensive pressure.",
            metric: Number.isFinite(btcDom) ? `${btcDom.toFixed(1)}%` : "LIVE",
            tone: btcDom > 58 ? "warning" : "neutral",
            chartType: "line",
            chartData: btcCurve,
          });
        }

        const btcCh = Number.isFinite(Number(prices?.bitcoin?.usd_24h_change)) ? Number(prices?.bitcoin?.usd_24h_change) : latestPctChange(priceSeriesById.bitcoin || []);
        const ethCh = Number.isFinite(Number(prices?.ethereum?.usd_24h_change)) ? Number(prices?.ethereum?.usd_24h_change) : latestPctChange(priceSeriesById.ethereum || []);
        if ((Number.isFinite(btcCh) && Number.isFinite(ethCh)) || rotationCurve.length) {
          const spread = Number.isFinite(btcCh) && Number.isFinite(ethCh) ? ethCh - btcCh : Number(rotationCurve[rotationCurve.length - 1] || 0);
          next.push({
            label: "Rotation Signal",
            value: `ETH-BTC ${spread >= 0 ? "+" : ""}${spread.toFixed(2)}%${Number.isFinite(btcCh) && Number.isFinite(ethCh) ? ` · BTC ${pctText(btcCh)} / ETH ${pctText(ethCh)}` : ""}`,
            detail: spread >= 0 ? "Live ETH curve is outperforming BTC in the current window." : "Live BTC curve is outperforming ETH in the current window.",
            metric: `${spread >= 0 ? "+" : ""}${spread.toFixed(2)}%`,
            tone: Math.abs(spread) >= 2 ? "warning" : "neutral",
            chartType: "line",
            chartData: rotationCurve,
          });
        }

        const strongest = coins
          .map(([id, sym]) => ({ sym, ch: Number.isFinite(Number(prices?.[id]?.usd_24h_change)) ? Number(prices?.[id]?.usd_24h_change) : latestPctChange(priceSeriesById[id]) }))
          .filter((x) => Number.isFinite(x.ch))
          .sort((a, b) => b.ch - a.ch);
        if (strongest.length) {
          const top = strongest[0];
          const weak = strongest[strongest.length - 1];
          next.push({
            label: "Relative Strength",
            value: `Strong ${top.sym} ${pctText(top.ch)} · Weak ${weak.sym} ${pctText(weak.ch)}`,
            detail: `Live top/weak adaptive spread: ${pctText(top.ch - weak.ch)} across core, active market and watchlist assets.`,
            metric: `${top.sym}`,
            tone: Math.abs(top.ch - weak.ch) >= 4 ? "warning" : "neutral",
            chartType: "line",
            chartData: strongest.map((x) => x.ch),
          });
        }

        if (alive && next.length) {
          setMarketBannerItems(next.slice(0, 8));
          setMarketBannerIndex((i) => i % next.length);
        }
      } catch (e) {
        if (alive) {
          setMarketBannerItems([{ label: "Trader Pulse", value: "Live trader market data unavailable", detail: "No dummy chart is shown. Waiting for real market data from the backend.", metric: "—", tone: "neutral", chartType: "line", chartData: [] }]);
          setMarketBannerIndex(0);
        }
      }
    };

    loadGlobalMarketBanner();
    const refreshTimer = setInterval(loadGlobalMarketBanner, 120000);
    return () => {
      alive = false;
      clearInterval(refreshTimer);
    };
  }, [token, wallet]);

  useEffect(() => {
    const t = setInterval(() => {
      setMarketBannerIndex((i) => (marketBannerItems.length ? (i + 1) % marketBannerItems.length : 0));
    }, 8000);
    return () => clearInterval(t);
  }, [marketBannerItems.length]);

  const activeMarketBanner = marketBannerItems[marketBannerIndex] || marketBannerItems[0] || {
    label: "Trader Pulse",
    value: "Loading liquidity, volatility and risk…",
    detail: "Preparing trader intelligence feed.",
    metric: "—",
    tone: "neutral",
    chartType: "line",
    chartData: [],
  };

  const renderMarketDeskChart = (item) => {
    const values = Array.isArray(item?.chartData) && item.chartData.length ? item.chartData.map(Number).filter(Number.isFinite) : [];
    if (!values.length) {
      return <div className="marketDeskNoChart">LIVE DATA</div>;
    }
    const w = 210;
    const h = 76;
    const pad = 8;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(1, max - min);
    const points = values.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y];
    });
    const path = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area = `${path} L${(w - pad).toFixed(1)} ${(h - pad).toFixed(1)} L${pad.toFixed(1)} ${(h - pad).toFixed(1)} Z`;
    const tone = item?.tone || "neutral";
    if (item?.chartType === "bars") {
      const bw = Math.max(4, (w - pad * 2) / Math.max(1, values.length) - 3);
      return (
        <svg className={`marketDeskChartSvg ${tone}`} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${item?.label || "Market"} mini chart`}>
          <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="marketDeskAxis" />
          {values.map((v, i) => {
            const bh = Math.max(5, ((v - min) / range) * (h - pad * 2));
            const x = pad + i * ((w - pad * 2) / Math.max(1, values.length));
            const y = h - pad - bh;
            return <rect key={i} x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} rx="3" className="marketDeskBar" />;
          })}
        </svg>
      );
    }
    return (
      <svg className={`marketDeskChartSvg ${tone}`} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${item?.label || "Market"} mini chart`}>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="marketDeskAxis" />
        <path d={area} className="marketDeskArea" />
        <path d={path} className="marketDeskLine" />
        {points.slice(-1).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" className="marketDeskDot" />)}
      </svg>
    );
  };

  const visibleMarketBannerItems = useMemo(() => {
    const arr = Array.isArray(marketBannerItems) && marketBannerItems.length
      ? marketBannerItems
      : [activeMarketBanner];
    const maxItems = Math.min(5, arr.length);
    return Array.from({ length: maxItems }, (_, idx) => arr[(marketBannerIndex + idx) % arr.length]);
  }, [marketBannerItems, marketBannerIndex, activeMarketBanner]);
  // Trading policy is UI-only for now (no Vault/Allowance yet).
  // Keep it local to avoid backend auth/CORS coupling during early UX work.
const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [withdrawSendOpen, setWithdrawSendOpen] = useState(false);
  const [balActiveChain, setBalActiveChain] = useState(() => {
    try { return normalizeWalletChainKey(localStorage.getItem("nexus_wallet_bal_chain") || DEFAULT_CHAIN); } catch (_) { return DEFAULT_CHAIN; }
  });
  

useEffect(() => {
    try { localStorage.setItem("nexus_wallet_bal_chain", normalizeWalletChainKey(balActiveChain || DEFAULT_CHAIN)); } catch (_) {}
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

  const vaultStateFetchRef = useRef({ key: "", ts: 0, inflight: false });

  const refreshVaultState = async (preferredChainKey = "", opts = {}) => {
    try {
      if (!wallet) return;
      const force = opts === true || !!opts?.force;
      const forcedChain = String(preferredChainKey || "").toUpperCase().trim();
      const chainKey = (forcedChain || balActiveChain || wsChainKey || DEFAULT_CHAIN);

      // Protect Alchemy/RPC quota:
      // - Grid order execution still polls fast elsewhere (2.5s) and is NOT slowed here.
      // - Vault balance/operator state is expensive and does not need every render.
      // - When open orders run, keep vault state reasonably fresh (12s).
      // - When no open orders run, refresh it only about once per minute.
      const hasActiveGridOrdersForVault = Array.isArray(gridOrders) && gridOrders.some((o) => String(o?.status || "").toUpperCase() === "OPEN");
      const minAgeMs = force ? 0 : (hasActiveGridOrdersForVault ? 12000 : 60000);
      const nowMs = Date.now();
      const cacheKey = `${String(wallet || "").toLowerCase()}|${chainKey}`;
      if (!force && vaultStateFetchRef.current?.key === cacheKey && (nowMs - Number(vaultStateFetchRef.current?.ts || 0)) < minAgeMs) {
        return;
      }
      if (!force && vaultStateFetchRef.current?.inflight && vaultStateFetchRef.current?.key === cacheKey) {
        return;
      }
      vaultStateFetchRef.current = { key: cacheKey, ts: nowMs, inflight: true };

      // Primary path: backend RPC endpoint.
      // This avoids the embedded-wallet/provider race after F5.
      try {
        const qs = new URLSearchParams({ wallet, chain: chainKey, ...(force ? { refresh: "1" } : {}) }).toString();
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
            balanceSource: r?.vault_balance_source || "",
            contractNativeBalance: Number(r?.vault_contract_native_balance ?? 0) || 0,
            walletAccountingBalance: Number(r?.wallet_accounting_balance ?? 0) || 0,
          });
          vaultStateFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
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
      vaultStateFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
    } catch (e) {
      // keep UI alive; vault state is best-effort
      try { vaultStateFetchRef.current = { ...(vaultStateFetchRef.current || {}), inflight: false }; } catch (_) {}
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
      setTimeout(() => refreshVaultState("", { force: true }), 1400);
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
      setTimeout(() => refreshVaultState("", { force: true }), 1400);
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
      setTimeout(() => { try { refreshVaultState("", { force: true }); } catch {} }, 1200);
      setTimeout(() => { try { refreshVaultState("", { force: true }); } catch {} }, 4500);
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

  // Dynamic wallet-chain list used by Wallet details and Withdraw & Send.
  // It is built from the Privy app-wallet balance object, so new EVM networks
  // (BASE, ARB, AVAX, etc.) appear automatically once balances are loaded.
  const walletChainKeys = useMemo(() => {
    const supported = new Set(Object.keys(CHAIN_ID || {}));
    const fromWallet = Object.keys(balByChain || {})
      .map((c) => normalizeWalletChainKey(c))
      .filter((c) => c && supported.has(c));
    const fallback = (Array.isArray(ENABLED_CHAINS) ? ENABLED_CHAINS : [])
      .map((c) => normalizeWalletChainKey(c))
      .filter((c) => c && supported.has(c));
    const seen = new Set();
    const merged = [...fromWallet, ...fallback].filter((c) => !seen.has(c) && seen.add(c));
    return merged.length ? merged : [DEFAULT_CHAIN];
  }, [balByChain]);

  const walletChainOptions = useMemo(() => {
    return walletChainKeys.map((k) => ({ k, label: CHAIN_LABELS?.[k] || k }));
  }, [walletChainKeys]);

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
  const [walletProfitBaselineStore, setWalletProfitBaselineStore] = useLocalStorageState("nexus_wallet_profit_baseline_v1", {});

  const walletProfitBaseline = useMemo(() => {
    const key = String(wallet || "").toLowerCase();
    const entry = key ? walletProfitBaselineStore?.[key] : null;
    const amount = Number(entry?.amountUsd ?? entry?.amount ?? entry);
    return {
      amountUsd: Number.isFinite(amount) && amount > 0 ? amount : null,
      ts: Number(entry?.ts || 0) || null,
    };
  }, [wallet, walletProfitBaselineStore]);

  const walletProfit = useMemo(() => {
    const total = Number(walletUsd?.total);
    const base = Number(walletProfitBaseline?.amountUsd);
    if (!Number.isFinite(total) || !Number.isFinite(base) || base <= 0) {
      return { available: false, amount: null, pct: null };
    }
    const amount = total - base;
    const pct = base > 0 ? (amount / base) * 100 : null;
    return { available: true, amount, pct };
  }, [walletUsd, walletProfitBaseline]);

  const setWalletProfitBaselineNow = useCallback(() => {
    const key = String(wallet || "").toLowerCase();
    const total = Number(walletUsd?.total);
    if (!key || !Number.isFinite(total) || total <= 0) return;
    setWalletProfitBaselineStore((prev) => ({
      ...(prev || {}),
      [key]: { amountUsd: total, ts: Date.now() },
    }));
  }, [wallet, walletUsd, setWalletProfitBaselineStore]);

  const clearWalletProfitBaseline = useCallback(() => {
    const key = String(wallet || "").toLowerCase();
    if (!key) return;
    setWalletProfitBaselineStore((prev) => {
      const next = { ...(prev || {}) };
      delete next[key];
      return next;
    });
  }, [wallet, setWalletProfitBaselineStore]);

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
    const c = normalizeWalletChainKey(chain);
    if (!walletKey) return;
    setWalletTokenStore((prev) => {
      const empty = { ETH: [], POL: [], BNB: [] };
      const cur = (prev && prev[walletKey] && typeof prev[walletKey] === "object") ? { ...empty, ...prev[walletKey] } : empty;
      const next = { ...cur, [c]: Array.isArray(nextList) ? nextList : [] };
      return { ...(prev || {}), [walletKey]: next };
    });
  };

  const removeWalletToken = (chain, tokenAddress) => {
    const c = normalizeWalletChainKey(chain);
    const addr = String(tokenAddress || contract || "").toLowerCase();

    const cur = walletTokensByChain?.[c] || [];
    const next = cur.filter((t) => String(t?.address || "").toLowerCase() != addr);
    setWalletTokensForChain(c, next);
  };

  // Add-token modal state
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const [addTokenChain, setAddTokenChain] = useState(() => normalizeWalletChainKey(DEFAULT_CHAIN));
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

      // Always include Nexus stable whitelist first (USDC/USDT), even if external lists fail/miss them.
      const merged = [];
      const seenTokens = new Set();
      for (const t of [...getStableWhitelistForChain(c), ...filtered]) {
        const addr = String(t?.address || "").toLowerCase();
        if (!addr || seenTokens.has(addr)) continue;
        seenTokens.add(addr);
        merged.push({
          address: addr,
          symbol: String(t?.symbol || "").toUpperCase(),
          name: String(t?.name || ""),
          decimals: Number(t?.decimals ?? 18),
        });
      }
      setTokenListCache((prev) => ({ ...(prev || {}), [c]: merged }));
    } catch {
      // If token list fetch fails, user can still add via contract address.
      setTokenListCache((prev) => ({ ...(prev || {}), [c]: getStableWhitelistForChain(c).map((t) => ({ ...t, address: String(t.address || "").toLowerCase() })) }));
    }
  };

  const openAddToken = (chain) => {
    const c = normalizeWalletChainKey(chain || balActiveChain || DEFAULT_CHAIN);
    setAddTokenChain(c);
    setAddTokenQuery("");
    setAddTokenContract("");
    setAddTokenErr("");
    setAddTokenOpen(true);
    loadTokenList(c);
  };

  const addWalletToken = async () => {
    const chain = normalizeWalletChainKey(addTokenChain || balActiveChain || DEFAULT_CHAIN);
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
      setBalActiveChain(chain);
      setWsChainKey(chain);
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

  const fetchBackendNativeBalances = async (address, chains) => {
    try {
      const q = new URLSearchParams({
        wallet: String(address || ""),
        wallet_address: String(address || ""),
        chains: (Array.isArray(chains) ? chains : ENABLED_CHAINS).join(","),
      }).toString();
      const r = await api(`/api/wallet/native-balances?${q}`, { method: "GET", token, wallet: address });
      return r?.balances || {};
    } catch {
      return {};
    }
  };

  const fetchBackendTokenBalances = async (address, chain, specs) => {
    try {
      const tokenSpecs = Array.isArray(specs) ? specs.filter((t) => /^0x[a-fA-F0-9]{40}$/.test(String(t?.address || ""))) : [];
      if (!tokenSpecs.length) return {};
      const r = await api("/api/wallet/token-balances", {
        method: "POST",
        token,
        wallet: address,
        body: {
          wallet: String(address || ""),
          wallet_address: String(address || ""),
          chain: normalizeWalletChainKey(chain),
          tokens: tokenSpecs.map((t) => ({ address: t.address, symbol: t.symbol, decimals: t.decimals })),
        },
      });
      return r?.balances || {};
    } catch {
      return {};
    }
  };

  const fetchProviderErc20BalanceRaw = async (address, chain, tokenAddress) => {
    try {
      const c = normalizeWalletChainKey(chain);
      const provider = await _getEmbeddedProvider();
      const chainId = CHAIN_ID?.[c];
      if (!provider?.request || !chainId) return null;
      await _trySwitchChain(provider, chainId);
      const walletHex = String(address || "").toLowerCase().replace(/^0x/, "").padStart(64, "0");
      const to = String(tokenAddress || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(to)) return null;
      const data = "0x70a08231" + walletHex; // balanceOf(address)
      const rawHex = await provider.request({ method: "eth_call", params: [{ to, data }, "latest"] });
      if (!String(rawHex || "").startsWith("0x")) return null;
      return hexToBigInt(rawHex).toString();
    } catch {
      return null;
    }
  };

  const refreshBalances = async () => {
    if (!wallet) return;
    // Wallet balances are loaded through the backend RPC fallback.
    // This avoids frontend Alchemy limits and keeps API keys out of the browser path.
    setBalLoading(true);
    setBalError("");
    try {
      const address = wallet;
      const baseChains = ENABLED_CHAINS;
      const backendNativeBalances = await fetchBackendNativeBalances(address, baseChains);

      const results = await Promise.all(
        baseChains.map(async (c) => {
          try {
            let nativeStr = "";
            let backendNativeNum = NaN;
            try {
              const backendNative = backendNativeBalances?.[c]?.native;
              if (backendNative !== null && backendNative !== undefined && Number.isFinite(Number(backendNative))) {
                backendNativeNum = Number(backendNative);
                nativeStr = String(backendNativeNum);
              }
            } catch (_) {}

            // Important: backend RPC can legally return 0 when the RPC/provider is stale
            // or when the wrong source is queried. Do not treat 0 as final; verify through
            // the connected wallet provider and prefer the larger value.
            try {
              const provider = await _getEmbeddedProvider();
              const chainId = CHAIN_ID?.[c];
              if (provider && chainId) {
                await _trySwitchChain(provider, chainId);
                const rawBal = await provider.request({ method: "eth_getBalance", params: [address, "latest"] });
                const providerNum = Number(Utils.formatEther(hexToBigInt(rawBal || "0x0")));
                if (Number.isFinite(providerNum) && (!Number.isFinite(backendNativeNum) || providerNum > backendNativeNum)) {
                  nativeStr = String(providerNum);
                }
              }
            } catch (_) {}

            if (!nativeStr) {
              throw new Error(c + " backend/provider balance unavailable");
            }

            const nativeNum = Number(nativeStr);
            const native = Number.isFinite(nativeNum)
              ? stripTrailingZeros(nativeNum.toFixed(6))
              : nativeStr;

// Phase 2: whitelisted tokens (per chain)
// Phase 2: tokens are fetched ONLY from (a) stable whitelist + (b) user-added tokens.
const stableSpecs = getStableWhitelistForChain(c);
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
  const respBalances = await fetchBackendTokenBalances(address, c, allSpecs);
  const stableAddrSet = new Set(stableSpecs.map((t) => String(t?.address || "").toLowerCase()));

  for (const t of allSpecs) {
    let rawBalance = respBalances?.[t.address]?.balance_raw;

    // Backend RPC is the preferred source, but for Privy embedded wallets it can be
    // missing/stale depending on the chain ENV. Fallback to the connected wallet
    // provider and force the correct chain before reading ERC20 balanceOf.
    try {
      const backendBi = rawBalance != null ? BigInt(String(rawBalance || "0")) : 0n;
      if (backendBi <= 0n) {
        const providerRaw = await fetchProviderErc20BalanceRaw(address, c, t.address);
        if (providerRaw != null) {
          const providerBi = BigInt(String(providerRaw || "0"));
          if (providerBi > backendBi) rawBalance = providerRaw;
        }
      }
    } catch (_) {}

    const bi = rawBalance != null ? BigInt(String(rawBalance || "0")) : 0n;
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
            return [c, { native: "—", error: String(e?.message || e || "backend RPC balance unavailable") }];
          }
        })
      );

      const out = {};
      for (const [c, v] of results) out[c] = v;
      setBalByChain(out);
      const chainErrors = Object.entries(out)
        .filter(([, v]) => v?.error)
        .map(([c, v]) => `${c}: ${v.error}`);
      setBalError(chainErrors.length ? chainErrors.join(" · ") : "");

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
  const [watchSortMode, setWatchSortMode] = useLocalStorageState("nexus_watch_sort_mode", "manual"); // manual | winner | loser
  const [ratingModal, setRatingModal] = useState({ open: false, row: null, symbol: "", systemRating: "", systemScore: 0 });
  const [ratingStatus, setRatingStatus] = useState(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingErr, setRatingErr] = useState("");
  const [ratingSummaryBySymbol, setRatingSummaryBySymbol] = useState({});
  const [userRatingBySymbol, setUserRatingBySymbol] = useState({});
  const [onchainBySymbol, setOnchainBySymbol] = useState({});
  const [marketConditionBySymbol, setMarketConditionBySymbol] = useState({});
  const [activeWhaleNews, setActiveWhaleNews] = useState(null);

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
    const wa = resolveWalletAddress(wallet);
    if (!wa) return;
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

      await api(`/api/watchlist?wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`, {
        method: "POST",
        token,
        wallet: wa,
        body: { wallet: wa, wallet_address: wa, items: clean },
      });
    } catch (e) {
      console.warn("watchlist save failed", e);
    }
  }, [wallet, token, normalizeWatchItems]);

  const syncWatchlistFromServer = useCallback(async () => {
    const wa = resolveWalletAddress(wallet);
    if (!wa) {
      setWatchRows([]);
      return;
    }
    if (watchSyncBusyRef.current) return;
    watchSyncBusyRef.current = true;

    try {
      const r = await api(`/api/watchlist?wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`, {
        method: "GET",
        token,
        wallet: wa,
      });

      const serverItems = normalizeWatchItems(r?.items || []);
      const localItems = normalizeWatchItems(watchItems || []);

      const sig = (arr) => JSON.stringify((arr || []).map((x) => _watchKeyFromItem(x)).filter(Boolean));
      const serverSig = sig(serverItems);
      const localSig = sig(localItems);
      const neverSynced = String(watchSyncedWallet || "").toLowerCase() !== String(wa || "").toLowerCase();

      if (neverSynced && !serverItems.length && localItems.length) {
        await saveWatchlistToServer(localItems);
        setWatchSyncedWallet(wa);
        fetchWatchSnapshot(localItems, { force: true, user: false });
        return;
      }

      // Once a wallet has synced, server is the source of truth — even when empty.
      if (serverSig !== localSig || (!serverItems.length && localItems.length) || (serverItems.length && !localItems.length)) {
        setWatchItems(serverItems);
        try { localStorage.setItem("nexus_watch_items", JSON.stringify(serverItems)); } catch {}
      }
      setWatchSyncedWallet(wa);
      fetchWatchSnapshot(serverItems, { force: true, user: false });
    } catch (e) {
      console.warn("watchlist sync failed", e);
      fetchWatchSnapshot();
    } finally {
      watchSyncBusyRef.current = false;
    }
  }, [wallet, token, watchItems, normalizeWatchItems, setWatchItems, watchSyncedWallet, setWatchSyncedWallet, saveWatchlistToServer]);

  // Persist local watchlist edits to the backend so desktop/mobile stay in sync.
  const watchItemsPersistKey = useMemo(() => {
    try {
      return JSON.stringify(normalizeWatchItems(watchItems || []).map(_watchKeyFromItem).filter(Boolean));
    } catch {
      return "[]";
    }
  }, [watchItems, normalizeWatchItems]);

  useEffect(() => {
    const wa = resolveWalletAddress(wallet);
    if (!wa) return;
    const items = normalizeWatchItems(watchItems || []);
    const t = setTimeout(() => {
      saveWatchlistToServer(items)
        .then(() => setWatchSyncedWallet(wa))
        .catch((e) => console.warn("watchlist autosave failed", e));
    }, 450);
    return () => clearTimeout(t);
  }, [wallet, watchItemsPersistKey, saveWatchlistToServer, normalizeWatchItems, setWatchSyncedWallet]);

  const watchSortValue = useCallback((row) => {
    const raw = row?.change24h ?? row?.chg_24h ?? row?.usd_24h_change ?? row?.change_24h;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, []);

  // Watchlist display rows must be derived from watchItems (MASTER), not only from
  // the async snapshot rows. This keeps desktop/mobile, Compare and AI in sync even
  // when the snapshot request is delayed or returns only partial rows on mobile.
  const watchDisplayRows = useMemo(() => {
    const items = normalizeWatchItems(watchItems || []);
    const rows = Array.isArray(watchRows) ? watchRows : [];
    const rowMap = new Map(rows.map((r) => [_watchKeyFromRow(r), r]));

    return items.map((it) => {
      const mode = String(it?.mode || "market").toLowerCase();
      const sym = String(it?.symbol || "").toUpperCase();
      const contract = String(it?.contract || it?.tokenAddress || "").toLowerCase();
      const cgId = String(it?.coingecko_id || it?.id || "").toLowerCase();
      const key = _watchKeyFromItem(it);
      const row = rowMap.get(key) || {};

      const base = {
        ...it,
        mode,
        symbol: sym,
        name: it?.name || row?.name || sym,
        source: "pending",
        price: null,
        change24h: null,
        chg_24h: null,
        volume24h: null,
        vol: null,
        marketCap: null,
        market_cap: null,
      };

      if (mode === "dex") {
        base.contract = contract;
        base.tokenAddress = contract;
        base.chain = String(it?.chain || row?.chain || "pol").trim();
      } else {
        base.id = cgId;
        base.coingecko_id = cgId;
      }

      // Snapshot/enriched row wins for market data, but identity stays anchored to watchItems.
      return {
        ...base,
        ...row,
        mode,
        symbol: String(row?.symbol || sym).toUpperCase(),
        name: row?.name || base.name,
        contract: mode === "dex" ? String(row?.contract || row?.tokenAddress || contract).toLowerCase() : row?.contract,
        tokenAddress: mode === "dex" ? String(row?.tokenAddress || row?.contract || contract).toLowerCase() : row?.tokenAddress,
        chain: mode === "dex" ? String(row?.chain || base.chain || "pol").trim() : row?.chain,
        id: mode !== "dex" ? String(row?.id || row?.coingecko_id || cgId).toLowerCase() : row?.id,
        coingecko_id: mode !== "dex" ? String(row?.coingecko_id || row?.id || cgId).toLowerCase() : row?.coingecko_id,
      };
    });
  }, [watchItems, watchRows, normalizeWatchItems]);

  const sortedWatchRows = useMemo(() => {
    const rows = Array.isArray(watchDisplayRows) ? [...watchDisplayRows] : [];
    const mode = String(watchSortMode || "manual").toLowerCase();
    if (mode !== "winner" && mode !== "loser") return rows;

    return rows
      .map((row, originalIndex) => ({ row, originalIndex, value: watchSortValue(row) }))
      .sort((a, b) => {
        const av = a.value;
        const bv = b.value;
        if (av == null && bv == null) return a.originalIndex - b.originalIndex;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (mode === "winner") return (bv - av) || (a.originalIndex - b.originalIndex);
        return (av - bv) || (a.originalIndex - b.originalIndex);
      })
      .map((x) => x.row);
  }, [watchDisplayRows, watchSortMode, watchSortValue]);

  const toggleWatchSort = useCallback((mode) => {
    setWatchSortMode((prev) => (String(prev || "manual") === mode ? "manual" : mode));
  }, [setWatchSortMode]);

  useEffect(() => {
    const wa = resolveWalletAddress(wallet);
    if (!wa) return;
    const symbols = Array.from(new Set((sortedWatchRows || []).map((r) => String(r?.symbol || "").toUpperCase()).filter(Boolean)));
    if (!symbols.length) return;
    let cancelled = false;
    Promise.all(symbols.map(async (sym) => {
      try {
        const r = await api(`/api/ratings/coin?symbol=${encodeURIComponent(sym)}&wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`, {
          method: "GET",
          token,
          wallet: wa,
        });
        return [sym, r || null];
      } catch {
        return [sym, null];
      }
    })).then((entries) => {
      if (cancelled) return;
      setRatingSummaryBySymbol((prev) => {
        const next = { ...(prev || {}) };
        for (const [sym, status] of entries) {
          if (status?.summary) next[sym] = status.summary;
        }
        return next;
      });
      setUserRatingBySymbol((prev) => {
        const next = { ...(prev || {}) };
        for (const [sym, status] of entries) {
          const own = String(status?.user_rating_today || status?.last_user_rating || "").toUpperCase();
          if (own) next[sym] = own;
        }
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [wallet, token, sortedWatchRows]);

  const onchainWatchSymbolsKey = useMemo(() => {
    return Array.from(new Set((sortedWatchRows || []).map((r) => String(r?.symbol || "").toUpperCase()).filter(Boolean)))
      .sort()
      .join(",");
  }, [sortedWatchRows]);

  const marketConditionFetchRef = useRef({ key: "", ts: 0, inflight: false });

  useEffect(() => {
    const symbols = onchainWatchSymbolsKey ? onchainWatchSymbolsKey.split(",").filter(Boolean) : [];
    if (!symbols.length) return;

    const nowMs = Date.now();
    const cacheKey = onchainWatchSymbolsKey;
    const minAgeMs = 10 * 60 * 1000; // 10 minutes
    if (marketConditionFetchRef.current?.key === cacheKey && (nowMs - Number(marketConditionFetchRef.current?.ts || 0)) < minAgeMs) {
      return;
    }
    if (marketConditionFetchRef.current?.inflight && marketConditionFetchRef.current?.key === cacheKey) {
      return;
    }

    let cancelled = false;
    const t = setTimeout(() => {
      marketConditionFetchRef.current = { key: cacheKey, ts: nowMs, inflight: true };
      Promise.all(symbols.map(async (sym) => {
        try {
          const r = await api(`/api/market-condition?symbol=${encodeURIComponent(sym)}`, { method: "GET", token, wallet });
          return [sym, r || null];
        } catch {
          return [sym, null];
        }
      })).then((entries) => {
        if (cancelled) return;
        setMarketConditionBySymbol((prev) => {
          const next = { ...(prev || {}) };
          for (const [sym, data] of entries) {
            if (data?.status === "ok" || data?.state) next[sym] = data;
          }
          return next;
        });
        marketConditionFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
      }).catch(() => {
        marketConditionFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
      });
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [onchainWatchSymbolsKey, token, wallet]);

  const onchainFetchRef = useRef({ key: "", ts: 0, inflight: false });

  useEffect(() => {
    const symbols = onchainWatchSymbolsKey ? onchainWatchSymbolsKey.split(",").filter(Boolean) : [];
    if (!symbols.length) return;

    // Protect Moralis quota:
    // Do not refetch on every price/watchlist render. Fetch only when the visible symbol set
    // changes or when the cache is old. AI Insight still uses the latest cached signals.
    const nowMs = Date.now();
    const cacheKey = `${String(wallet || "").toLowerCase()}|${onchainWatchSymbolsKey}`;
    const minAgeMs = 10 * 60 * 1000; // 10 minutes
    if (onchainFetchRef.current?.key === cacheKey && (nowMs - Number(onchainFetchRef.current?.ts || 0)) < minAgeMs) {
      return;
    }
    if (onchainFetchRef.current?.inflight && onchainFetchRef.current?.key === cacheKey) {
      return;
    }

    let cancelled = false;
    const t = setTimeout(() => {
      onchainFetchRef.current = { key: cacheKey, ts: nowMs, inflight: true };
      api(`/api/onchain/signals?symbols=${encodeURIComponent(symbols.join(","))}`, {
        method: "GET",
        token,
        wallet,
      })
        .then((res) => {
          if (cancelled) return;
          const signals = res?.signals || {};
          setOnchainBySymbol((prev) => ({ ...(prev || {}), ...(signals || {}) }));
          onchainFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
        })
        .catch(() => {
          onchainFetchRef.current = { key: cacheKey, ts: Date.now(), inflight: false };
        });
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [wallet, token, onchainWatchSymbolsKey]);

  const openRatingModal = useCallback(async (row) => {
    const sym = String(row?.symbol || "").toUpperCase();
    if (!sym) return;
    const summary = ratingSummaryBySymbol?.[sym];
    const onchain = onchainBySymbol?.[sym];
    const sysScore = Math.max(0, Math.min(100, watchFinalScore(row, summary) + watchOnchainScoreDelta(onchain)));
    const sysRating = ratingFromScore(sysScore);
    setRatingModal({ open: true, row, symbol: sym, systemRating: sysRating, systemScore: sysScore });
    setRatingStatus(null);
    setRatingErr("");
    const wa = resolveWalletAddress(wallet);
    if (!wa) {
      setRatingErr("Connect wallet first.");
      return;
    }
    try {
      const r = await api(`/api/ratings/coin?symbol=${encodeURIComponent(sym)}&wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`, {
        method: "GET",
        token,
        wallet: wa,
      });
      setRatingStatus(r || null);
    } catch (e) {
      setRatingErr(e?.message || "Rating status failed");
    }
  }, [wallet, token, ratingSummaryBySymbol, onchainBySymbol]);

  const closeRatingModal = useCallback(() => {
    setRatingModal({ open: false, row: null, symbol: "", systemRating: "", systemScore: 0 });
    setRatingStatus(null);
    setRatingErr("");
    setRatingBusy(false);
  }, []);

  const submitUserRating = useCallback(async (rating) => {
    const sym = String(ratingModal?.symbol || "").toUpperCase();
    const wa = resolveWalletAddress(wallet);
    if (!sym || !wa) return;
    setRatingBusy(true);
    setRatingErr("");
    try {
      const r = await api(`/api/ratings/vote?wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}`, {
        method: "POST",
        token,
        wallet: wa,
        body: { wallet: wa, wallet_address: wa, symbol: sym, rating },
      });
      setRatingStatus((prev) => ({ ...(prev || {}), ...(r || {}), already_voted_today: true, user_rating_today: rating, last_user_rating: rating }));
      setUserRatingBySymbol((prev) => ({ ...(prev || {}), [sym]: rating }));
      if (r?.summary) setRatingSummaryBySymbol((prev) => ({ ...(prev || {}), [sym]: r.summary }));
    } catch (e) {
      const msg = e?.data?.error || e?.message || "Rating failed";
      setRatingErr(msg === "already rated today" ? "You already rated this coin today." : msg);
      if (e?.data?.user_rating_today) {
        setRatingStatus((prev) => ({ ...(prev || {}), ...(e.data || {}), can_vote: false, already_voted_today: true }));
      }
    } finally {
      setRatingBusy(false);
    }
  }, [ratingModal, wallet, token]);

  const openRatingLink = useCallback(() => {
    const link = String(ratingStatus?.link || "").trim();
    if (!link) return;
    try { window.open(link, "_blank", "noopener,noreferrer"); } catch {}
  }, [ratingStatus]);

  const openRatingExplorer = useCallback(() => {
    const link = String(ratingStatus?.coin_info?.explorer || "").trim();
    if (!link) return;
    try { window.open(link, "_blank", "noopener,noreferrer"); } catch {}
  }, [ratingStatus]);


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
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState("General");
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportBusy, setSupportBusy] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [nexusBackendState, setNexusBackendState] = useState(null);
  const [shadowExecutorState, setShadowExecutorState] = useState(null);
  const [shadowExecutorBusy, setShadowExecutorBusy] = useState(false);
  const [shadowExecutorMsg, setShadowExecutorMsg] = useState("");

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  // Subscribe (USDC/USDT on ETH)
  // Core plan: $25 / 30 days
  const SUB_PRICE_USD = 25;
  const SUB_PLAN = "pro";
  const STRATEGIST_WEEKLY_PRICE_USD = 20;
  const STRATEGIST_MONTHLY_PRICE_USD = 50;
  const [subPlan, setSubPlan] = useState("core"); // core | strategist_weekly | strategist_monthly
  const [subChain, setSubChain] = useState("ETH"); // ETH | BNB | POL
  const [subToken, setSubToken] = useState("USDT"); // USDC | USDT only

  const selectedSubPlan = subPlan === "strategist_weekly" || subPlan === "strategist_monthly" ? subPlan : SUB_PLAN;
  const selectedSubPriceUsd =
    subPlan === "strategist_weekly" ? STRATEGIST_WEEKLY_PRICE_USD :
    subPlan === "strategist_monthly" ? STRATEGIST_MONTHLY_PRICE_USD :
    SUB_PRICE_USD;
  const selectedSubLabel =
    subPlan === "strategist_weekly" ? "Strategist Weekly" :
    subPlan === "strategist_monthly" ? "Strategist Monthly" :
    "Nexus Core";
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState("");
  const [autoRenewBusy, setAutoRenewBusy] = useState(false);
  const [autoRenewMsg, setAutoRenewMsg] = useState("");

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
  const strategistActive = !!(access?.strategist_active || access?.strategist_access?.active);
  const canUseStrategist = !!(access?.can_use_strategist || strategistActive || access?.is_demo);
  const demoAiUsedToday = Number(access?.ai_used_today ?? 0);
  const demoAiDailyLimit = access?.ai_daily_limit ?? 3;
  const demoAiMonthDaysUsed = Number(access?.ai_month_days_used ?? 0);
  const demoAiMonthDaysLimit = access?.ai_month_days_limit ?? 5;
  const accessExpiresTs = Number(access?.expires_at || 0);
  const accessDaysLeft = accessExpiresTs > 0
    ? Math.ceil((accessExpiresTs - Math.floor(Date.now() / 1000)) / 86400)
    : null;
  const showAccessReminder = !!(isPro && accessDaysLeft !== null && accessDaysLeft <= 3);
  const showAccessExpiredNotice = !!(!isPro && accessExpiresTs > 0);

  const requirePro = useCallback((actionLabel = "This action") => {
    if (isPro) return true;
    // Open Access modal directly on Subscribe tab with a friendly message
    setAccessTab("subscribe");
    setAccessModalOpen(true);
    setSubMsg(`🔒 ${actionLabel} requires an active Nexus Core subscription ($25/30 days).`);
    return false;
  }, [isPro]);

  const requireStrategistAccess = useCallback((actionLabel = "Nexus Strategist") => {
    if (canUseStrategist) return true;
    setAccessTab("subscribe");
    setSubPlan("strategist_monthly");
    setAccessModalOpen(true);
    setSubMsg(`🔒 ${actionLabel} requires Strategist access. Weekly: $20/7 days. Monthly: $50/30 days.`);
    return false;
  }, [canUseStrategist]);

  const submitSupportTicket = useCallback(async () => {
    const msg = String(supportMessage || "").trim();
    const email = String(supportEmail || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setSupportMsg("Please enter a valid email address.");
      return;
    }
    if (msg.length < 10) {
      setSupportMsg("Please describe the issue with at least 10 characters.");
      return;
    }
    setSupportBusy(true);
    setSupportMsg("");
    try {
      const res = await api("/api/support/ticket", {
        method: "POST",
        token,
        wallet,
        body: {
          wallet,
          wallet_address: wallet,
          email,
          category: supportCategory,
          subject: supportSubject || supportCategory,
          message: msg,
          meta: {
            app_version: APP_VERSION,
            access_mode: access?.mode || "DEMO",
            core_active: !!isPro,
            strategist_active: !!strategistActive,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          },
        },
      });
      setSupportMsg(`Support ticket created: ${res?.ticket_id || "received"}`);
      setSupportSubject("");
      setSupportMessage("");
      setSupportEmail("");
    } catch (e) {
      setSupportMsg(e?.message || "Support ticket failed.");
    } finally {
      setSupportBusy(false);
    }
  }, [supportMessage, supportEmail, supportCategory, supportSubject, token, wallet, api, access?.mode, isPro, strategistActive]);

  const refreshNexusBackendState = useCallback(async () => {
    if (!wallet) {
      setNexusBackendState(null);
      setShadowExecutorState(null);
      return null;
    }
    try {
      const data = await api(`/api/nexus/trading/state`, { wallet });
      setNexusBackendState(data || null);
      if (data?.shadow_executor) setShadowExecutorState(data.shadow_executor);
      return data || null;
    } catch {
      return null;
    }
  }, [api, wallet]);

  const refreshShadowExecutorState = useCallback(async () => {
    if (!wallet) {
      setShadowExecutorState(null);
      return null;
    }
    try {
      const data = await api(`/api/nexus/shadow/executor`, { wallet });
      setShadowExecutorState(data || null);
      return data || null;
    } catch {
      return null;
    }
  }, [api, wallet]);

  useEffect(() => {
    refreshNexusBackendState();
    refreshShadowExecutorState();
  }, [refreshNexusBackendState, refreshShadowExecutorState]);


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

  // Auto-Renew settings (safe mode: stores preference only; payment trigger comes later via Privy)
  const fmtAccessDate = useCallback((ts) => {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return "—";
    try {
      return new Date(n * 1000).toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
    } catch {
      return "—";
    }
  }, []);

  const getPrimaryPrivyWallet = useCallback(() => {
    return (
      privyWallets?.find((w) =>
        ["privy", "embedded"].includes(String(w?.walletClientType || "").toLowerCase()) ||
        String(w?.connectorType || "").toLowerCase() === "embedded"
      ) ||
      privyWallets?.[0] ||
      null
    );
  }, [privyWallets]);

  const ensureAutoRenewConsent = useCallback(async () => {
    // IMPORTANT:
    // Privy useDelegatedActions / delegateWallet is NOT supported in this normal web/browser flow.
    // Calling it here causes the UI to hang at "..." with:
    //   "useDelegatedActions is only supported for on-device execution"
    //
    // For the live website we therefore store Auto Renew as a backend preference only.
    // The real recurring charge must be executed later by the server-side Privy worker.
    if (!wallet) throw new Error("Wallet not connected.");
    if (!["USDC", "USDT"].includes(String(subToken || "").toUpperCase())) {
      throw new Error("Auto Renew supports USDC or USDT only.");
    }

    const res = await api("/api/access/auto-renew/set", {
      method: "POST",
      body: {
        wallet,
        enabled: true,
        token: subToken,
        chain: subChain,
        mode: "web_preference_only",
      },
    });

    if (res?.status === "error" || res?.ok === false) {
      throw new Error(res?.error || "Auto Renew update failed.");
    }

    return res;
  }, [wallet, subToken, subChain, api]);

  const setAutoRenewPreference = useCallback(async (enabled) => {
    if (!wallet) {
      setAutoRenewMsg("Wallet not connected.");
      return;
    }
    if (!["USDC", "USDT"].includes(String(subToken || "").toUpperCase())) {
      setAutoRenewMsg("Auto Renew supports USDC or USDT only.");
      return;
    }

    setAutoRenewBusy(true);
    setAutoRenewMsg("");
    try {
      const res = await api("/api/access/auto-renew/set", {
        method: "POST",
        body: {
          wallet,
          enabled: !!enabled,
          token: subToken,
          chain: subChain,
          mode: "web_preference_only",
        },
      });

      if (res?.status === "error" || res?.ok === false) {
        throw new Error(res?.error || "Auto Renew update failed.");
      }

      setAutoRenewMsg(
        enabled
          ? "Auto Renew ON. Web mode saved. Server-side Privy worker is required for real recurring payment."
          : "Auto Renew disabled."
      );

      await refreshAccess();
    } catch (e) {
      setAutoRenewMsg(e?.message || "Auto Renew update failed.");
    } finally {
      setAutoRenewBusy(false);
    }
  }, [wallet, subToken, subChain, api, refreshAccess]);

  // NFTs disabled in Phase 1 (UI + backend)

  const subscribePay = useCallback(async () => {
    if (!wallet) {
      setSubMsg("Wallet not connected.");
      return;
    }

    setSubBusy(true);
    setSubMsg("");
    try {
      const chainKey = normalizeWalletChainKey(subChain || "POL");
      const chainId = CHAIN_ID_BY_KEY[chainKey];
      if (!chainId) throw new Error("Unsupported chain.");

      const payToken = String(subToken || "").toUpperCase();
      if (!["USDC", "USDT"].includes(payToken)) {
        throw new Error("Subscription payment must be USDC or USDT.");
      }

      const cfg = await fetchSubscribeConfig();
      const treasury = String(cfg?.treasury || "").trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(treasury)) throw new Error("Treasury address is not configured.");

      // Use the Privy embedded wallet provider for payment.
      // Do NOT use window.ethereum here: with Privy embedded wallets it can throw
      // "The requested account and/or method has not been authorized by the user."
      const provider = await _getEmbeddedProvider();
      await _trySwitchChain(provider, chainId);

      // Hard safety check: payment must be sent on the selected subscription chain.
      const currentHex = await provider.request({ method: "eth_chainId" });
      const wantHex = "0x" + Number(chainId).toString(16);
      if (String(currentHex).toLowerCase() !== String(wantHex).toLowerCase()) {
        throw new Error(`Wrong network. Please switch your Privy wallet to ${chainKey}.`);
      }

      // Pay with stablecoin (USDC/USDT) on the selected chain.
      // Token address + decimals come from backend config first, then local safe fallback.
      const spec = getSubscribeTokenSpec(cfg, chainKey, payToken);
      if (!/^0x[a-fA-F0-9]{40}$/.test(String(spec.address || ""))) {
        throw new Error(`${payToken} address is not configured for ${chainKey}.`);
      }

      const priceUsd = String(selectedSubPriceUsd ?? cfg?.price_usd ?? SUB_PRICE_USD ?? "25");
      const amountUnits = decimalStringToUnits(priceUsd, spec.decimals || 6);
      if (amountUnits <= 0n) throw new Error("Payment amount is zero.");
      const data = _erc20TransferData(treasury, amountUnits);

      const txHash = await provider.request({
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
        token,
        wallet,
        body: { wallet, wallet_address: wallet, chain_id: chainId, tx_hash: txHash, plan: selectedSubPlan, token_type: "erc20", token: payToken, email: billingEmail },
      });

      setSubMsg(res?.already_verified ? "Payment already verified. Access updated." : `${selectedSubLabel} payment verified. Access activated.`);

      setAccessModalOpen(false);
      await refreshAccess();
    } catch (e) {
      setSubMsg(e?.message || "Payment failed.");
      console.error("Payment failed:", e);
    } finally {
      setSubBusy(false);
    }
  }, [wallet, subChain, subToken, selectedSubPlan, selectedSubPriceUsd, selectedSubLabel, billingEmail, token, api, refreshAccess, _getEmbeddedProvider, _trySwitchChain]);

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
        label: "Unclear",
        color: "rgba(255,255,255,0.72)",
        bg: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.14)",
      };
    }
    if (n >= 82) {
      return {
        label: "Strong",
        color: "#00ff88",
        bg: "rgba(0,255,136,0.08)",
        border: "rgba(0,255,136,0.55)",
      };
    }
    if (n >= 68) {
      return {
        label: "Good",
        color: "#ffd36a",
        bg: "rgba(255,211,106,0.08)",
        border: "rgba(255,211,106,0.45)",
      };
    }
    if (n >= 52) {
      return {
        label: "Neutral",
        color: "#ffaa00",
        bg: "rgba(255,170,0,0.08)",
        border: "rgba(255,170,0,0.42)",
      };
    }
    return {
      label: "Risky",
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
    if (!selectedPair) {
      setAiExplainText("Select a pair first, then run AI Insight.");
      return;
    }
    setAiExplainLoading(true);
    try {
      const [a, b] = _pairSyms(selectedPair.pair);
      const corr = Number(selectedPair?.corr);
      const isExtremeInsight = normalizedAiInsightMode === "extreme";

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

      const adaptiveWeights = sanitizeCompareWeights(activeCompareWeights || DEFAULT_COMPARE_WEIGHTS);
      const wCorr = Number(adaptiveWeights.corr || 0);
      const wMomentum = Number(adaptiveWeights.momentum || 0);
      const wOpportunity = Number(adaptiveWeights.opportunity || 0);
      const wStability = Number(adaptiveWeights.stability || 0);
      const wSentiment = Number(adaptiveWeights.sentiment || 0);

      // Adaptive Threshold System:
      // Custom Weighting now changes the actual AI Insight thresholds, not only the prompt.
      // Higher Opportunity/Momentum makes the system earlier and more scout-oriented.
      // Higher Stability/Correlation makes it stricter and confirmation-oriented.
      const adaptiveAggression =
        (isExtremeInsight ? 0.18 : 0) +
        ((wMomentum - DEFAULT_COMPARE_WEIGHTS.momentum) / 100) * 0.22 +
        ((wOpportunity - DEFAULT_COMPARE_WEIGHTS.opportunity) / 100) * 0.26 -
        ((wStability - DEFAULT_COMPARE_WEIGHTS.stability) / 100) * 0.18 -
        ((wCorr - DEFAULT_COMPARE_WEIGHTS.corr) / 100) * 0.12;

      const thresholdShift = Math.max(-0.18, Math.min(0.24, adaptiveAggression));
      const adaptiveCorrMin = Math.max(0.42, Math.min(0.86, (isExtremeInsight ? 0.62 : 0.80) - thresholdShift));
      const adaptiveAvoidCorr = Math.max(0.18, Math.min(0.52, (isExtremeInsight ? 0.30 : 0.45) - thresholdShift * 0.65));
      const adaptiveSpreadMin = Math.max(0.25, Math.min(1.25, (isExtremeInsight ? 0.45 : 0.75) - thresholdShift * 1.35));
      const adaptiveWaitSpread = Math.max(0.20, Math.min(1.00, (isExtremeInsight ? 0.35 : 0.75) - thresholdShift * 1.15));
      const adaptiveWideSpread = Math.max(2.5, Math.min(6.5, 4 - thresholdShift * 5));
      const adaptiveMidSpread = Math.max(1.25, Math.min(3.5, 2 - thresholdShift * 3));

      const adaptiveProfileLabel =
        thresholdShift >= 0.12 ? "Aggressive / early scout" :
        thresholdShift <= -0.10 ? "Strict / confirmation-first" :
        "Balanced adaptive";

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
      let confidence = isExtremeInsight ? 5.9 : 5.4;
      let confidenceLabel = "MEDIUM";
      let risk = isExtremeInsight ? "Medium-High" : "Medium";
      let gridMode = isExtremeInsight ? "Extreme Scout" : "Standard";
      let gridRange = isExtremeInsight ? "4–8%" : "2–4%";
      let why = [];
      let verdictText = isExtremeInsight
        ? "Extreme mode treats this as an early-signal scan: weaker confirmation is allowed, but invalidation is faster."
        : "This pair is interesting, but the signal is not strong enough for a clear structure yet.";

      if (Number.isFinite(corr)) {
        if (corr >= Math.max(0.88, adaptiveCorrMin + 0.18)) confidence += isExtremeInsight ? 1.5 : 1.8;
        else if (corr >= adaptiveCorrMin) confidence += isExtremeInsight ? 1.1 : 1.2;
        else if (corr >= Math.max(0.52, adaptiveCorrMin - 0.15)) confidence += isExtremeInsight ? 0.9 : 0.6;
        else if (corr >= adaptiveAvoidCorr && isExtremeInsight) confidence += 0.3;
        else if (corr < adaptiveAvoidCorr) confidence -= isExtremeInsight ? 0.7 : 1.4;
      }

      if (Number.isFinite(spread)) {
        const absSpread = Math.abs(spread);
        if (absSpread >= adaptiveWideSpread) confidence += isExtremeInsight ? 2.1 : 1.6;
        else if (absSpread >= adaptiveMidSpread) confidence += isExtremeInsight ? 1.5 : 1.0;
        else if (absSpread >= adaptiveSpreadMin) confidence += isExtremeInsight ? 0.9 : 0.5;
        else confidence -= isExtremeInsight ? 0.1 : 0.4;
      }

      // Weight bias changes confidence after raw metric scoring.
      confidence += thresholdShift * 2.2;
      if (wStability >= 40 && Number.isFinite(corr) && corr < 0.65) confidence -= 0.8;
      if (wOpportunity >= 40 && Number.isFinite(spread) && Math.abs(spread) >= adaptiveSpreadMin) confidence += 0.5;
      if (wMomentum >= 40 && shortBias !== "n/a" && shortBias !== "neutral") confidence += 0.35;

      if (Number.isFinite(corr) && corr >= adaptiveCorrMin && Number.isFinite(spread) && Math.abs(spread) >= adaptiveSpreadMin && winner && loser) {
        setup = isExtremeInsight ? "EXTREME REVERSAL SCOUT" : "MEAN REVERSION";
        verdictText = isExtremeInsight
          ? `${winner} is leading ${loser} over 30D. Extreme mode flags this earlier as a high-sensitivity reversal/rotation scout, not as a confirmed clean setup.`
          : `${winner} outperformed ${loser} over 30D. With relatively high correlation, the pair shows a mean-reversion style structure.`;
        why.push(`${isExtremeInsight ? "Usable" : "High"} correlation (${corr >= 0 ? "+" : ""}${corr.toFixed(2)}) keeps the pair relationship relevant.`);
        why.push(`The performance spread of ${_fmtPctLocal(spread)} creates a visible imbalance between both sides.`);
        why.push(`${winner} is currently the stronger side, while ${loser} is the weaker side in this window.`);
        if (isExtremeInsight) {
          why.push("Extreme mode accepts earlier imbalance, but the setup can invalidate faster if follow-through fails.");
        }
        if (Math.abs(spread) >= adaptiveWideSpread) {
          gridMode = isExtremeInsight ? "Extreme Wide" : "Wide";
          gridRange = isExtremeInsight ? "6–10%" : "4–6%";
          risk = isExtremeInsight ? "High" : "Medium-High";
        } else if (Math.abs(spread) >= adaptiveMidSpread) {
          gridMode = isExtremeInsight ? "Extreme Scout" : "Standard";
          gridRange = isExtremeInsight ? "4–8%" : "3–5%";
          risk = isExtremeInsight ? "Medium-High" : "Medium";
        } else if (isExtremeInsight) {
          gridMode = "Extreme Scout";
          gridRange = "3–6%";
          risk = "Medium-High";
        }
      } else if (Number.isFinite(corr) && corr < adaptiveAvoidCorr) {
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
      } else if (Number.isFinite(spread) && Math.abs(spread) < adaptiveWaitSpread) {
        setup = isExtremeInsight ? "EARLY WATCH" : "WAIT";
        confidence -= isExtremeInsight ? 0.2 : 0.6;
        confidenceLabel = "LOW-MED";
        risk = isExtremeInsight ? "Medium" : "Low-Medium";
        verdictText = isExtremeInsight
          ? "Extreme mode keeps this on early watch, but the spread is still too small for a strong edge."
          : "The pair is correlated enough, but the spread is still small and the structure remains less expressive.";
        why.push("The current performance gap is still narrow.");
        why.push("Without enough spread, the relative structure can feel random and weak.");
        why.push(isExtremeInsight ? "Extreme mode can monitor it earlier, but confirmation is still thin." : "A clearer imbalance usually creates a stronger read.");
        gridMode = isExtremeInsight ? "Extreme Watch" : "Wait";
        gridRange = isExtremeInsight ? "2–4%" : "Below 2%";
      } else if (winner && loser) {
        setup = isExtremeInsight ? "EXTREME TREND SCOUT" : "TREND BIAS";
        confidence += isExtremeInsight ? 0.8 : 0.2;
        confidenceLabel = "MEDIUM";
        risk = isExtremeInsight ? "High" : "Medium-High";
        verdictText = isExtremeInsight
          ? `${winner} is stronger than ${loser}. Extreme mode treats this as an early trend/rotation scout with higher false-signal risk.`
          : `${winner} is stronger than ${loser}, but the pair does not yet qualify as a clean high-confidence paired structure.`;
        why.push("There is a leader and a laggard, but the data is not perfectly aligned for a strong reversion structure.");
        why.push(isExtremeInsight ? "Extreme mode prioritizes early movement, so false continuation risk is higher." : "Mixed conditions increase the chance of continuation instead of catch-up.");
        why.push(isExtremeInsight ? "This is a scout read, not a confirmed structure." : "The current profile looks more mixed than clean.");
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
      const aiSignalContext = buildAiSignalContext({
        syms: [a, b].filter(Boolean),
        watchRows,
        ratingSummaryBySymbol,
        onchainBySymbol,
        marketConditionBySymbol,
        bestPairsToShow,
        compareWeights: activeCompareWeights,
        aiMode: normalizedAiInsightMode,
        nexusTradingContext: {
          prepared_setup: tradingPreparedSetup || null,
          learning_count: Array.isArray(tradingLearningSetups) ? tradingLearningSetups.length : 0,
          latest_learning_event: Array.isArray(tradingLearningSetups) && tradingLearningSetups[0]?.learningEvent ? tradingLearningSetups[0].learningEvent : null,
          configured_budget_usd: tradingBudgetUsd || "",
          risk_mode: tradingRiskMode || "",
        },
      });
      const aiSignalText = formatAiSignalContextForPrompt(aiSignalContext);
      const payload = {
        kind: "explain",
        symbols: [a, b].filter(Boolean),
        profile: "balanced",
        timeframe: String(timeframe || "90D").toUpperCase(),
        index_mode: !!indexMode,
        series_stats: pairStats,
        insight_windows: pairWindows,
        ai_signal_context: aiSignalContext,
        ai_mode: normalizedAiInsightMode,
        compare_weights: activeCompareWeights,
        question:
          `Analyze the current pair structure for ${a} vs ${b}. ` +
          `This is AI Insight Level 2: explain not only what the data says, but how the structure may behave. ` +
          `AI Insight mode is ${normalizedAiInsightMode}. Extreme mode means higher sensitivity to early momentum, rebound, spread and hidden-opportunity structures, while still explaining invalidation clearly. ` +
          `Use the active Compare weights as interpretation priorities: correlation ${activeCompareWeights.corr}%, momentum ${activeCompareWeights.momentum}%, opportunity ${activeCompareWeights.opportunity}%, stability ${activeCompareWeights.stability}%, community sentiment ${activeCompareWeights.sentiment}%. ` +
          `Use pair statistics, multi-timeframe context, rating, community votes, on-chain context, all_compare_pairs hidden-opportunity scan, and wallet-fit to describe structure, behavior, strategy fit, and risk posture. ` +
          `IMPORTANT: mention rating, market condition (OE/RVOL), and on-chain confirmation explicitly when available. If on-chain is neutral or missing, say it is neutral/no strong signal instead of ignoring it. ` +
          `Include a compact behavior read, for example range-bound, mean-reversion style, trend-bias, unstable/choppy, or low-conviction. ` +
          `Include strategy fit without giving advice: grid-fit, wait/no-clean-setup, rotation-style, or continuation-risk. ` +
          `Do not tell the user what to do and do not give buy/sell instructions. ` +
          `Current pair correlation: ${Number.isFinite(corr) ? corr.toFixed(2) : "n/a"}. ` +
          `30D spread: ${Number.isFinite(spread) ? spread.toFixed(2) + "%" : "n/a"}. ` +
          `Short bias: ${shortBias}. Long bias: ${longBias}. ` +
          `Local setup classification: ${setup}, confidence ${confidence}/10, risk ${risk}, grid fit ${gridMode} (${gridRange}). ` +
          (aiSignalText ? `Signal context: ${aiSignalText}` : ""),
      };

      let backendText = "";
      if (!token) throw new Error("Please reconnect your wallet to authorize AI.");
      try {
        const r = await api("/api/ai/insight", { method: "POST", token, body: payload });
        console.log("AI RESPONSE:", r);
        const backendEngineV2 = r?.ai_engine_v2 || r?.engine_v2 || null;
        if (backendEngineV2 && typeof backendEngineV2 === "object") {
          payload.__backendEngineV2 = backendEngineV2;
        }
        if (r?.context_used && typeof r.context_used === "object") {
          payload.__contextUsed = r.context_used;
        }
        if (r?.market_memory_snapshot_id) {
          payload.__marketMemorySnapshotId = r.market_memory_snapshot_id;
        }
        backendText =
          r?.answer ??
          r?.output ??
          r?.text ??
          r?.message ??
          (typeof r === "string" ? r : "");
      } catch {
        backendText = "";
      }

      const engineV2 = payload.__backendEngineV2 || null;
      const backendContextUsed = payload.__contextUsed || null;
      const finalTextRaw = buildCompactAiInsight({
        backendText,
        trendStructure,
        momentumShift,
        insightSummary,
      });

      const signalCoins = Array.isArray(aiSignalContext?.coins) ? aiSignalContext.coins : [];
      const signalLine = signalCoins.length
        ? signalCoins.map((c) => {
            const rating = c?.rating || "n/a";
            const votes = Number(c?.user_rating_votes || 0);
            const delta = Number(c?.onchain_delta || 0);
            const ocSummary = String(c?.onchain?.summary || "").trim();
            const ocShort = ocSummary
              ? ocSummary
              : (delta ? `on-chain delta ${delta > 0 ? "+" : ""}${delta}` : "on-chain neutral/no strong signal");
            return `${c.symbol}: Rating ${rating}, Votes ${votes}, ${ocShort}`;
          }).join(" | ")
        : "";

      const absSpreadForLevel2 = Math.abs(Number(spread));
      const behaviorRead =
        Number.isFinite(corr) && corr >= adaptiveCorrMin && Number.isFinite(absSpreadForLevel2) && absSpreadForLevel2 >= adaptiveMidSpread
          ? (thresholdShift >= 0.12 ? "early mean-reversion / opportunity-scout behavior" : "mean-reversion style behavior with visible imbalance")
          : Number.isFinite(corr) && corr < adaptiveAvoidCorr
            ? "unstable/choppy behavior because the pair relationship is weak"
            : Number.isFinite(absSpreadForLevel2) && absSpreadForLevel2 < adaptiveWaitSpread
              ? "low-conviction/range-bound behavior because the spread is still narrow"
              : (thresholdShift <= -0.10 ? "confirmation-watch behavior with stricter stability requirements" : "mixed behavior with limited confirmation");
      const strategyFitLine = `Behavior: ${behaviorRead}. Adaptive profile: ${adaptiveProfileLabel}. Strategy fit: ${gridMode || "Standard"} / ${gridRange || "n/a"} with ${risk || "medium"} risk.`;

      let finalText = finalTextRaw;
      if (isExtremeInsight && !/extreme mode|high-sensitivity|early-signal|false-signal/i.test(finalText)) {
        finalText = `Extreme mode: high-sensitivity early-signal read. It reacts sooner than Standard mode, but false-signal and fast invalidation risk are higher.\n\n${finalText}`;
      }
      if (signalLine && !/rating|on-chain|onchain|community|vote/i.test(finalText)) {
        finalText = `${finalText}\n\nSignal context: ${signalLine}`;
      }
      if (!/behavior|strategy fit|grid-fit|range-bound|mean-reversion|unstable|choppy|conviction/i.test(finalText)) {
        finalText = `${finalText}\n\nLevel 2: ${strategyFitLine}`;
      }
      if (isExtremeInsight && !/Extreme fit:/i.test(finalText)) {
        finalText = `${finalText}\n\nExtreme fit: earlier detection, wider scout range, higher risk, faster invalidation if momentum or spread confirmation fades.`;
      }
      if (customCompareWeightsOn && !/Adaptive weighting:/i.test(finalText)) {
        finalText = `${finalText}\n\nAdaptive weighting: ${adaptiveProfileLabel}. Momentum ${wMomentum}%, Opportunity ${wOpportunity}%, Stability ${wStability}%, Correlation ${wCorr}% changed the active thresholds for this read.`;
      }

      setAiExplainText(finalText);
      setAiExplainData({
        setup: setup,
        confidence: confidence,
        confidenceLabel: confidenceLabel,
        risk: risk,
        effectiveMode: isExtremeInsight ? "Extreme" : "Standard",
        exitRisk: engineV2?.exit_risk || null,
        preExitWarning: Boolean(engineV2?.pre_exit_warning),
        contradictions: Array.isArray(engineV2?.contradictions) ? engineV2.contradictions : [],
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
        aiSignalContext,
        engineV2,
        aiMode: normalizedAiInsightMode,
        compareWeights: activeCompareWeights,
        adaptiveProfile: adaptiveProfileLabel,
        adaptiveThresholds: {
          corrMin: adaptiveCorrMin,
          avoidCorr: adaptiveAvoidCorr,
          spreadMin: adaptiveSpreadMin,
          waitSpread: adaptiveWaitSpread,
          thresholdShift,
          customOn: !!customCompareWeightsOn,
        },
        strategistMemory: {
          snapshotId: payload.__marketMemorySnapshotId || null,
          used: Boolean(backendContextUsed?.has_strategist_memory_v2),
          bias: backendContextUsed?.strategist_memory_bias || "",
        },
        aiInsightBridge: {
          used: Boolean(backendContextUsed?.has_ai_insight_bridge),
          bias: backendContextUsed?.ai_insight_bridge_bias || "",
        },
        pairAlerts: Array.isArray(engineV2?.pair_alerts) ? engineV2.pair_alerts : [],
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
  const [comparePage, setComparePage] = useState("all"); // first10 | next10 | all
  const [highlightedSyms, setHighlightedSyms] = useState([]);
  const [showTop10Pairs, setShowTop10Pairs] = useState(true);
  const [bestPairsSortMode, setBestPairsSortMode] = useLocalStorageState("nexus_best_pairs_sort_mode", "score"); // score | spread
  const [movementPanelOpen, setMovementPanelOpen] = useState(false);
  const [customCompareWeightsOn, setCustomCompareWeightsOn] = useLocalStorageState("nexus_compare_custom_weights_on", false);
  const [compareWeightsExpanded, setCompareWeightsExpanded] = useLocalStorageState("nexus_compare_weights_expanded", false);
  const [compareWeights, setCompareWeights] = useLocalStorageState("nexus_compare_custom_weights_v1", DEFAULT_COMPARE_WEIGHTS);
  const [aiInsightMode, setAiInsightMode] = useLocalStorageState("nexus_ai_insight_mode_v1", "standard");
  const normalizedAiInsightMode = String(aiInsightMode || "standard").toLowerCase() === "extreme" ? "extreme" : "standard";
  const safeCompareWeights = useMemo(() => sanitizeCompareWeights(compareWeights), [compareWeights]);
  const activeCompareWeights = useMemo(() => customCompareWeightsOn ? safeCompareWeights : DEFAULT_COMPARE_WEIGHTS, [customCompareWeightsOn, safeCompareWeights]);
  const compareWeightsTotal = useMemo(() => compareWeightTotal(safeCompareWeights), [safeCompareWeights]);
  const compareWeightsRemaining = Math.max(0, 100 - compareWeightsTotal);
  const updateCompareWeight = useCallback((key, rawValue) => {
    const k = String(key || "");
    if (!COMPARE_WEIGHT_KEYS.includes(k)) return;
    const requested = Math.max(0, Math.min(100, Math.round(Number(rawValue) || 0)));
    setCompareWeights((prev) => {
      const base = sanitizeCompareWeights(prev);
      const otherTotal = COMPARE_WEIGHT_KEYS
        .filter((x) => x !== k)
        .reduce((sum, x) => sum + Number(base[x] || 0), 0);
      const maxAllowed = Math.max(0, 100 - otherTotal);
      return { ...base, [k]: Math.min(requested, maxAllowed) };
    });
  }, [setCompareWeights]);
  const resetCompareWeights = useCallback(() => setCompareWeights(DEFAULT_COMPARE_WEIGHTS), [setCompareWeights]);
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
    const bestPairsAll = useMemo(() => computeBestPairsFromSeries(compareSeries, 1000, activeCompareWeights, ratingSummaryBySymbol), [compareSeries, activeCompareWeights, ratingSummaryBySymbol]);
  const bestPairsSorted = useMemo(() => {
    const rows = Array.isArray(bestPairsAll) ? [...bestPairsAll] : [];
    if (String(bestPairsSortMode || "score") !== "spread") return rows;

    return rows.sort((a, b) => {
      const av = Number.isFinite(Number(a?.spreadPct)) ? Number(a.spreadPct) : -Infinity;
      const bv = Number.isFinite(Number(b?.spreadPct)) ? Number(b.spreadPct) : -Infinity;
      if (bv !== av) return bv - av;
      return (Number(b?.score || 0) - Number(a?.score || 0));
    });
  }, [bestPairsAll, bestPairsSortMode]);
  const bestPairsToShow = useMemo(() => (showTop10Pairs ? bestPairsSorted.slice(0, 10) : bestPairsSorted), [showTop10Pairs, bestPairsSorted]);
  const bestPairUiAlerts = useMemo(
    () => buildLocalPairAlertsForUi(bestPairsAll, activeCompareWeights, normalizedAiInsightMode),
    [bestPairsAll, activeCompareWeights, normalizedAiInsightMode]
  );
  const bestPairTopAlert = bestPairUiAlerts?.[0] || null;
  const bestPairAlertTone = bestPairUiAlerts.some((a) => a?.strength === "high")
    ? "high"
    : bestPairUiAlerts.some((a) => a?.strength === "medium")
      ? "medium"
      : bestPairUiAlerts.length
        ? "low"
        : "none";
  const bestPairAlertPairSet = useMemo(() => {
    const set = new Set();
    for (const a of bestPairUiAlerts || []) {
      const key = String(a?.pair || "").toUpperCase().trim();
      if (key) set.add(key);
    }
    return set;
  }, [bestPairUiAlerts]);
  const bestPairAlertToneByPair = useMemo(() => {
    const out = {};
    for (const a of bestPairUiAlerts || []) {
      const key = String(a?.pair || "").toUpperCase().trim();
      if (!key) continue;
      const tone = a?.strength === "high" ? "high" : a?.strength === "medium" ? "medium" : "low";
      if (!out[key] || tone === "high" || (tone === "medium" && out[key] !== "high")) out[key] = tone;
    }
    return out;
  }, [bestPairUiAlerts]);
  const bestPairAlertScoreByPair = useMemo(() => {
    const out = {};
    for (const a of bestPairUiAlerts || []) {
      const key = String(a?.pair || "").toUpperCase().trim();
      if (!key) continue;
      const score = Number(a?.movement_chance_score ?? a?.movementChanceScore ?? a?.score);
      if (!Number.isFinite(score)) continue;
      if (!Number.isFinite(Number(out[key])) || score > Number(out[key])) out[key] = score;
    }
    return out;
  }, [bestPairUiAlerts]);
  const selectedPairLocalAlerts = useMemo(() => {
    const pairKey = String(selectedPair?.pair || "").toUpperCase();
    if (!pairKey) return [];
    return (bestPairUiAlerts || []).filter((a) => String(a?.pair || "").toUpperCase() === pairKey);
  }, [bestPairUiAlerts, selectedPair?.pair]);
  const selectedPairMainAlert = selectedPairLocalAlerts?.[0] || null;
  const selectedPairAlertTone = selectedPairLocalAlerts.some((a) => a?.strength === "high")
    ? "high"
    : selectedPairLocalAlerts.some((a) => a?.strength === "medium")
      ? "medium"
      : selectedPairLocalAlerts.length
        ? "low"
        : "none";
  const toggleBestPairsSort = useCallback((mode) => {
    setBestPairsSortMode((prev) => (String(prev || "score") === mode ? "score" : mode));
  }, [setBestPairsSortMode]);

  // grid (manual)
  // Grid UI works with symbols; backend grid endpoints are keyed by item_id.
  const [gridChain, setGridChain] = useState(() => {
    try {
      return String(localStorage.getItem("nexus_grid_chain") || localStorage.getItem("nexus_wallet_bal_chain") || DEFAULT_CHAIN || "POL").toUpperCase();
    } catch (_) {
      return String(DEFAULT_CHAIN || "POL").toUpperCase();
    }
  });
  const [gridItem, setGridItem] = useState(() => {
    try {
      const chain = String(localStorage.getItem("nexus_grid_chain") || localStorage.getItem("nexus_wallet_bal_chain") || DEFAULT_CHAIN || "POL").toUpperCase();
      return localStorage.getItem(`${LS_GRID_COIN_PREFIX}:${chain}`) || chain;
    } catch (_) {
      return DEFAULT_CHAIN;
    }
  });
  const [rotationSelectedPick, setRotationSelectedPick] = useState(null);
  const [rotationShowAllRecommendations, setRotationShowAllRecommendations] = useState(false);
  const [rotationNetworkScope, setRotationNetworkScope] = useState("ALL");
  const [rotationMode, setRotationMode] = useState("RECOMMENDATION");
  const [rotationBudgetRelease, setRotationBudgetRelease] = useState("");
  const [rotationRiskLimit, setRotationRiskLimit] = useState("");
  const [rotationMinNetAdvantage, setRotationMinNetAdvantage] = useState("0.5");
  const [rotationMaxSlippage, setRotationMaxSlippage] = useState("1");
  const [rotationAllowDexSpread, setRotationAllowDexSpread] = useState(true);
  const [rotationAllowCexDexSpread, setRotationAllowCexDexSpread] = useState(false);
  const [rotationRouters, setRotationRouters] = useState({ QuickSwap: true, Uniswap: true, PancakeSwap: true, "1inch": true, "0x": false, SushiSwap: false });
  const [rotationSwapModalOpen, setRotationSwapModalOpen] = useState(false);
  const [rotationSwapFromAsset, setRotationSwapFromAsset] = useState("AUTO");
  const [rotationSwapAmount, setRotationSwapAmount] = useState("");
  const [fundingPrompt, setFundingPrompt] = useState(null);
  const [rotationBudgetReleased, setRotationBudgetReleased] = useState(false);
  const [rotationBackendLoading, setRotationBackendLoading] = useState(false);
  const [rotationBackendMsg, setRotationBackendMsg] = useState("");

  // Multi-session support: each later budget approval becomes an independent user-bounded session.
  // Existing sessions are preserved; new Trading/Rotation sessions get their own session_id.
  const [tradingSessions, setTradingSessions] = useLocalStorageState("nexus_trading_sessions_v1", []);
  const [activeTradingSessionId, setActiveTradingSessionId] = useLocalStorageState("nexus_trading_active_session_id", "");
  const [rotationSessions, setRotationSessions] = useLocalStorageState("nexus_rotation_sessions_v1", []);
  const [activeRotationSessionId, setActiveRotationSessionId] = useLocalStorageState("nexus_rotation_active_session_id", "");
  const [gridUiHydrated, setGridUiHydrated] = useState(false);
  // Derived identifiers for backend grid endpoints (stable across refreshes)
  const uiChainKey = (balActiveChain || wsChainKey || DEFAULT_CHAIN);
  const activeGridChainKey = useMemo(() => {
    return String(gridChain || DEFAULT_CHAIN || "POL").toUpperCase().trim();
  }, [gridChain]);

  // Keep this directly after activeGridChainKey. Several Trading/Rotation/Grid
  // preflight builders use the native chain symbol as a safe fallback, so it
  // must be initialized before those callbacks are created.
  const activeGridChainSymbol = useMemo(() => {
    return String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase();
  }, [activeGridChainKey]);

  const gridItemId = useMemo(() => {
    const sym = String(gridItem || "").toUpperCase().trim();
    if (!sym) return "";
    return `${activeGridChainKey}:${sym}`;
  }, [activeGridChainKey, gridItem]);

  // Nexus backend bridge: load Vault router allowlist + fee policy for the active Grid/Rotation chain.
  // These calls are background checks only; they do not execute trades or touch the Vault.
  useEffect(() => {
    let cancelled = false;

    const chain = String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase().trim();

    async function loadNexusBackendBridge() {
      try {
        const routers = await api(`/api/nexus/routers?chain=${encodeURIComponent(chain)}`, { token, wallet });
        if (!cancelled) console.log("NEXUS ROUTERS", routers);
      } catch (e) {
        if (!cancelled) console.warn("NEXUS ROUTERS FAILED", e);
      }

      try {
        const feePolicy = await api(`/api/nexus/fee-policy?chain=${encodeURIComponent(chain)}`, { token, wallet });
        if (!cancelled) console.log("NEXUS FEE POLICY", feePolicy);
      } catch (e) {
        if (!cancelled) console.warn("NEXUS FEE POLICY FAILED", e);
      }
    }

    loadNexusBackendBridge();

    return () => {
      cancelled = true;
    };
  }, [activeGridChainKey, token, wallet]);

  // If the selected grid coin is a native coin, re-read the Vault on that chain after refresh.
  // Important: do NOT mutate wallet chain state here. We only force the vault read itself.
  useEffect(() => {
    const sym = String(gridItem || "").toUpperCase().trim();
    if (!wallet) return;
    if (!["POL", "BNB", "ETH"].includes(sym)) return;

    const t1 = setTimeout(() => { try { refreshVaultState(sym, { force: true }); } catch (_) {} }, 250);
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
  // Grid source: Privy app-wallet holdings across ALL supported chains.
  // Network selector is independent from the currently active Privy/wallet network.
  // First choose the Grid network, then the Coin dropdown only shows assets on that network.
  const gridWalletCoinsByChain = useMemo(() => {
    const map = {};
    const chains = Array.isArray(ENABLED_CHAINS) && ENABLED_CHAINS.length
      ? ENABLED_CHAINS
      : ["POL", "BNB", "ETH"];

    for (const rawChain of chains) {
      const chain = String(rawChain || "").toUpperCase().trim();
      if (!chain) continue;
      const row = balByChain?.[chain] || {};
      const out = [];

      // native coin per supported chain (ETH / POL / BNB)
      out.push(chain);

      // stables present on this chain (USDC/USDT etc.)
      const stablesMap = row?.stables || {};
      for (const k of Object.keys(stablesMap)) out.push(String(k).toUpperCase());

      // user-added tokens on this chain
      const custom = row?.custom || [];
      for (const t of custom) {
        const sym = String(t?.symbol || "").toUpperCase().trim();
        if (sym) out.push(sym);
      }

      const seen = new Set();
      map[chain] = out
        .map((x) => String(x || "").toUpperCase().trim())
        .filter((x) => x && !seen.has(x) && seen.add(x));
    }
    return map;
  }, [balByChain]);

  const gridWalletChains = useMemo(() => {
    const chains = Object.keys(gridWalletCoinsByChain || {}).filter((ck) => (gridWalletCoinsByChain?.[ck] || []).length > 0);
    return chains.length ? chains : [String(DEFAULT_CHAIN || "POL").toUpperCase()];
  }, [gridWalletCoinsByChain]);

  const gridWalletCoins = useMemo(() => {
    const ck = String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    return gridWalletCoinsByChain?.[ck] || [];
  }, [gridWalletCoinsByChain, activeGridChainKey]);

  const handleRotationPickToGrid = useCallback((pick) => {
    const rawSym = String(pick?.sym || pick || "").toUpperCase().trim();
    if (!rawSym) return;

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

    let resolved = null;
    let note = "";

    if (rawSym === "BTC") {
      resolved = chooseFirstAvailable([
        { chain: "ETH", coin: "WBTC" },
        { chain: "BNB", coin: "BTCB" },
        { chain: "BNB", coin: "WBTC" },
        { chain: "POL", coin: "WBTC" },
      ]);
      note = resolved ? `${rawSym} selected for Nexus Rotation as ${resolved.coin} on ${resolved.chain}.` : "BTC needs WBTC/BTCB in the Vault wallet first.";
    } else if (rawSym === "SOL") {
      resolved = chooseFirstAvailable([
        { chain: "ETH", coin: "WSOL" },
        { chain: "BNB", coin: "WSOL" },
        { chain: "POL", coin: "WSOL" },
      ]);
      note = resolved ? `${rawSym} selected for Nexus Rotation as ${resolved.coin} on ${resolved.chain}.` : "SOL needs WSOL in the Vault wallet first.";
    } else {
      for (const chain of Object.keys(coinsByChain || {}).map((x) => String(x || "").toUpperCase())) {
        if (hasCoinOnChain(chain, rawSym)) {
          resolved = { chain, coin: rawSym };
          break;
        }
      }
      note = resolved ? `${rawSym} selected for Nexus Rotation on ${resolved.chain}.` : `${rawSym} is not available in the Vault wallet assets yet.`;
    }

    setRotationSelectedPick({
      source: rawSym,
      chain: resolved?.chain || "",
      coin: resolved?.coin || "",
      ok: Boolean(resolved),
      note,
      score: Number(pick?.score ?? pick?.strategistScore),
      rank: pick?.rank || "",
      rating: pick?.rating || "",
      change24h: Number(pick?.ch),
      whaleText: pick?.whaleText || "Neutral",
      riskText: pick?.riskText || "Normal",
      ts: Date.now(),
    });
    setRotationBudgetReleased(false);
  }, [gridWalletCoinsByChain]);

  const releaseRotationBudget = useCallback(() => {
    const amount = Number(String(rotationBudgetRelease || "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;

    // Must not call getRotationPreflight here because that callback is declared later in the component.
    // Use a safe local fallback so React never hits a before-initialization crash.
    const fallbackChain = String(rotationSelectedPick?.chain || activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    const fallbackSymbol = String(rotationSelectedPick?.coin || rotationSelectedPick?.source || gridItem || fallbackChain).toUpperCase();
    const now = Date.now();
    const sessionId = makeNexusSessionId("ROT");
    setRotationBudgetReleased(true);
    setActiveRotationSessionId(sessionId);
    setRotationSessions((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      return [
        {
          id: sessionId,
          type: "ROTATION",
          budgetUsd: amount,
          chain: fallbackChain,
          symbol: fallbackSymbol,
          status: "APPROVED",
          createdAt: now,
          updatedAt: now,
        },
        ...existing,
      ].slice(0, 20);
    });
    setRotationBudgetRelease("");
    setRotationBackendMsg(`Rotation session approved ✓ ${sessionId}. Enter the next Rotation budget and approve/sign again when needed.`);
  }, [rotationBudgetRelease, makeNexusSessionId, setRotationSessions, setActiveRotationSessionId, activeGridChainKey, rotationSelectedPick, gridItem, setRotationBudgetRelease]);

  const startRotationSafeMode = useCallback(async () => {
    // SAFE MODE only: preview + backend safety check. No swap, no Vault transaction.
    setRotationBackendLoading(true);
    setRotationBackendMsg("");
    try {
      const chain = String(rotationSelectedPick?.chain || activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
      const native = chain === "BNB" ? "BNB" : chain === "ETH" ? "ETH" : "POL";
      const symbol = String(rotationSelectedPick?.coin || rotationSelectedPick?.source || gridItem || native).toUpperCase();
      let amountUsd = Number(String(rotationBudgetRelease || "").replace(",", "."));
      if (!Number.isFinite(amountUsd) || amountUsd <= 0) amountUsd = 1; // tiny test amount for preview/check
      const slippagePct = Number(String(rotationMaxSlippage || "1").replace(",", "."));

      const body = {
        wallet,
        chain,
        symbol,
        side: "BUY",
        amountUsd,
        amount_usd: amountUsd,
        tokenIn: native,
        token_in: native,
        tokenOut: symbol,
        token_out: symbol,
        slippageBps: Number.isFinite(slippagePct) ? Math.round(slippagePct * 100) : 100,
        slippage_bps: Number.isFinite(slippagePct) ? Math.round(slippagePct * 100) : 100,
        riskLimitPct: rotationRiskLimit,
        minNetAdvantagePct: rotationMinNetAdvantage,
        safeMode: true,
      };

      const preview = await api("/api/nexus/order-preview", { method: "POST", token, wallet, body });
      console.log("NEXUS ORDER PREVIEW", preview);

      const exec = await api("/api/nexus/execute-plan", {
        method: "POST",
        token,
        wallet,
        body: { wallet, chain, preview, requireVaultBalance: true, safeMode: true },
      });
      console.log("NEXUS EXECUTION CHECK", exec);

      setRotationBackendMsg("Vault check sent ✓");
    } catch (e) {
      console.error("NEXUS VAULT CHECK FAILED", e);
      setRotationBackendMsg(`Vault check failed: ${e?.message || e}`);
    } finally {
      setRotationBackendLoading(false);
    }
  }, [rotationSelectedPick, activeGridChainKey, gridItem, rotationBudgetRelease, rotationMaxSlippage, rotationRiskLimit, rotationMinNetAdvantage, token, wallet]);

  const resetRotationBudgetRelease = useCallback(() => {
    setRotationBudgetReleased(false);
  }, []);

  const toggleRotationRouter = useCallback((router) => {
    setRotationRouters((prev) => ({ ...(prev || {}), [router]: !prev?.[router] }));
    setRotationBudgetReleased(false);
  }, []);

  // Keep selected Grid network valid, independent from active Privy network.
  useEffect(() => {
    if (!gridUiHydrated) return;
    const cur = String(gridChain || "").toUpperCase();
    if (cur && gridWalletChains.includes(cur)) return;
    if (gridWalletChains.length) setGridChain(gridWalletChains[0]);
  }, [gridUiHydrated, gridWalletChains, gridChain]);

  // Keep selected grid coin valid for the selected Grid network.
  useEffect(() => {
    if (!gridUiHydrated) return;
    if (!gridWalletCoins.length) return;
    const cur = String(gridItem || "").toUpperCase();
    if (!cur || !gridWalletCoins.includes(cur)) {
      setGridItem(gridWalletCoins[0]);
    }
  }, [gridUiHydrated, gridWalletCoins, gridItem]);

  // Restore the saved Grid coin per selected network only.
  useEffect(() => {
    if (!gridUiHydrated) return;
    const ck = String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    const cur = String(gridItem || "").toUpperCase();
    if (cur && gridWalletCoins.includes(cur)) return;

    try {
      const savedForChain = String(localStorage.getItem(`${LS_GRID_COIN_PREFIX}:${ck}`) || "").toUpperCase();
      if (savedForChain && gridWalletCoins.includes(savedForChain)) {
        setGridItem(savedForChain);
        return;
      }
    } catch (_) {}

    if (gridWalletCoins.length) setGridItem(gridWalletCoins[0]);
  }, [gridUiHydrated, activeGridChainKey, gridWalletCoins, gridItem]);

  // Persist selected Grid network and selected coin per network.
  useEffect(() => {
    if (!gridUiHydrated) return;
    const ck = String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    const sym = String(gridItem || "").toUpperCase();
    try { localStorage.setItem("nexus_grid_chain", ck); } catch (_) {}
    if (sym) {
      try { localStorage.setItem(`${LS_GRID_COIN_PREFIX}:${ck}`, sym); } catch (_) {}
    }
  }, [gridUiHydrated, activeGridChainKey, gridItem]);

  const [gridAutoPath, setGridAutoPath] = useState(true); // V2 -> V3 fallback (EVM)
  const [gridMode, setGridMode] = useState(() => {
    try { return localStorage.getItem("nexus_grid_mode") || "normal"; } catch (_) { return "normal"; }
  });
  useEffect(() => {
    try { localStorage.setItem("nexus_grid_mode", gridMode); } catch (_) {}
  }, [gridMode]);

  const [tradingBudgetUsd, setTradingBudgetUsd] = useLocalStorageState("nexus_trading_budget_usd", "");
  const [tradingBudgetSplitInput, setTradingBudgetSplitInput] = useLocalStorageState("nexus_trading_budget_splits", "");
  const [tradingExecutionQueue, setTradingExecutionQueue] = useLocalStorageState("nexus_trading_execution_queue", []);
  const [tradingRuntimeHours, setTradingRuntimeHours] = useLocalStorageState("nexus_trading_runtime_hours", "24");
  const [tradingHoldHours, setTradingHoldHours] = useLocalStorageState("nexus_trading_hold_hours", "1");
  const [tradingAllowedAssets, setTradingAllowedAssets] = useLocalStorageState("nexus_trading_allowed_assets", "");
  const [tradingAllowedChains, setTradingAllowedChains] = useLocalStorageState("nexus_trading_allowed_chains", "POL,BNB,ETH");
  const [tradingRiskMode, setTradingRiskMode] = useLocalStorageState("nexus_trading_risk_mode", "BALANCED");
  const [tradingCautionDrawdownPct, setTradingCautionDrawdownPct] = useLocalStorageState("nexus_trading_caution_drawdown_pct", "3");
  const [tradingHardStopPct, setTradingHardStopPct] = useLocalStorageState("nexus_trading_hard_stop_pct", "12");
  const [tradingProfitLockPct, setTradingProfitLockPct] = useLocalStorageState("nexus_trading_profit_lock_pct", "20");
  const [tradingMaxSlippagePct, setTradingMaxSlippagePct] = useLocalStorageState("nexus_trading_max_slippage_pct", "1.2");
  const [tradingMaxTrades, setTradingMaxTrades] = useLocalStorageState("nexus_trading_max_trades", "6");
  const [tradingConfidenceMin, setTradingConfidenceMin] = useLocalStorageState("nexus_trading_confidence_min", "MEDIUM");
  const [tradingStyle, setTradingStyle] = useLocalStorageState("nexus_trading_style", "TACTICAL");
  const [tradingPreparedSetup, setTradingPreparedSetup] = useLocalStorageState("nexus_trading_prepared_setup", null);
  const [tradingLearningSetups, setTradingLearningSetups] = useLocalStorageState("nexus_trading_learning_setups", []);
  const [tradingRiskExpanded, setTradingRiskExpanded] = useLocalStorageState("nexus_trading_risk_expanded", false);
  const [rotationRecommendationsExpanded, setRotationRecommendationsExpanded] = useLocalStorageState("nexus_rotation_recommendations_expanded", false);
  const [tradingSessionStatus, setTradingSessionStatus] = useLocalStorageState("nexus_trading_session_status", "PREPARED");
  const [tradingSessionUpdatedTs, setTradingSessionUpdatedTs] = useLocalStorageState("nexus_trading_session_updated_ts", 0);

  const tradingHoldStateHydratedRef = useRef(false);
  const tradingRiskRequestRef = useRef({ key: "", ts: 0, inFlight: false });

  const tradingSessionLabel = String(tradingSessionStatus || "PREPARED").toUpperCase();

  const getTradingSlotSessionId = useCallback((slot = {}) => {
    return String(slot?.session_id || slot?.sessionId || slot?.trade_session_id || "").trim();
  }, []);

  const dedupeTradingQueue = useCallback((items = []) => {
    const rows = Array.isArray(items) ? items.filter((x) => x && typeof x === "object") : [];
    const order = [];
    const byKey = new Map();

    rows.forEach((slot, idx) => {
      const sid = String(getTradingSlotSessionId(slot) || "NO_SESSION").trim();
      const chain = String(slot?.chain || slot?.chain_key || slot?.network || activeGridChainKey || "NO_CHAIN").toUpperCase().trim();
      const slotNo = String(slot?.slot || slot?.slot_id || slot?.slotId || idx + 1).trim();
      const symbol = String(slot?.symbol || slot?.asset || "").toUpperCase().trim();
      const id = String(slot?.id || slot?.queue_id || "").trim();

      // Queue ids are sometimes regenerated by preview/simulation. For visible cards,
      // session + chain + slot is the stable identity. This prevents duplicated ETH slots
      // and prevents a BNB session from inheriting ETH preview rows.
      const key = sid !== "NO_SESSION" && slotNo
        ? `session:${sid}|chain:${chain}|slot:${slotNo}`
        : id
          ? `id:${id}`
          : `fallback:${chain}|${symbol}|${slotNo}`;

      if (!byKey.has(key)) order.push(key);
      byKey.set(key, { ...slot, chain, slot: slot?.slot || slotNo });
    });

    return order.map((key) => byKey.get(key)).filter(Boolean);
  }, [getTradingSlotSessionId, activeGridChainKey]);

  // One-time/local cleanup for queues that were polluted by an older Shadow preview merge.
  // This removes duplicated slot cards from localStorage without touching stopped sessions.
  useEffect(() => {
    setTradingExecutionQueue((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const next = dedupeTradingQueue(existing);
      if (next.length === existing.length) return prev;
      return next;
    });
  }, [dedupeTradingQueue, setTradingExecutionQueue]);

  const openTradingSessions = useMemo(() => {
    const sessions = Array.isArray(tradingSessions) ? tradingSessions : [];
    return sessions.filter((sess) => {
      const st = String(sess?.status || "").toUpperCase();
      return !["STOPPED", "CLOSED", "EXPIRED", "CANCELLED", "RELEASED"].includes(st);
    });
  }, [tradingSessions]);

  const stoppedTradingSessions = useMemo(() => {
    const sessions = Array.isArray(tradingSessions) ? tradingSessions : [];
    return sessions.filter((sess) => {
      const st = String(sess?.status || "").toUpperCase();
      return ["STOPPED", "CLOSED", "EXPIRED", "CANCELLED", "RELEASED"].includes(st);
    });
  }, [tradingSessions]);

  const selectedTradingSession = useMemo(() => {
    const sessions = Array.isArray(openTradingSessions) ? openTradingSessions : [];
    if (!sessions.length) return null;
    const activeId = String(activeTradingSessionId || "").trim();
    const active = sessions.find((sess) => String(sess?.id || "") === activeId);
    if (active) return active;

    // Prefer a session that belongs to the currently selected Trading/Grid chain.
    // Without this, switching POL/BNB/ETH can show the wrong session or an empty panel.
    const chain = String(activeGridChainKey || DEFAULT_CHAIN || "").toUpperCase().trim();
    const sameChain = chain
      ? sessions.find((sess) => (Array.isArray(sess?.chains) ? sess.chains : [])
          .map((x) => String(x || "").toUpperCase().trim())
          .includes(chain))
      : null;
    return sameChain || sessions[0] || null;
  }, [openTradingSessions, activeTradingSessionId, activeGridChainKey]);

  const selectedTradingSessionId = String(selectedTradingSession?.id || activeTradingSessionId || "").trim();

  const updateTradingSessionMeta = useCallback((sessionId, patch = {}) => {
    const sid = String(sessionId || "").trim();
    if (!sid) return;
    setTradingSessions((prev) => (Array.isArray(prev) ? prev : []).map((sess) => {
      if (String(sess?.id || "") !== sid) return sess;
      return { ...sess, ...(patch || {}), updatedAt: Date.now() };
    }));
  }, [setTradingSessions]);

  const selectTradingSession = useCallback((sessionId) => {
    const sid = String(sessionId || "").trim();
    if (!sid) return;
    setActiveTradingSessionId(sid);
  }, [setActiveTradingSessionId]);
  const clampTradingHoldHours = useCallback((value) => {
    const n = Number(String(value ?? "").replace(",", "."));
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(12, n));
  }, []);

  const normalizeTradingCsv = useCallback((value) => {
    return String(value || "")
      .split(",")
      .map((x) => String(x || "").trim().toUpperCase())
      .filter(Boolean);
  }, []);

  const parseTradingBudgetSplits = useCallback((value, totalBudget = tradingBudgetUsd) => {
    const total = Number(String(totalBudget || "").replace(",", "."));
    const raw = String(value || "").trim();
    const nums = raw
      ? raw.split(/[,+;\s]+/)
          .map((x) => Number(String(x || "").replace(",", ".")))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

    if (nums.length) return nums.slice(0, 12);

    if (!(total > 0)) return [];
    if (total <= 100) return [Number(total.toFixed(2))];
    if (total <= 250) return [Number((total * 0.5).toFixed(2)), Number((total * 0.25).toFixed(2)), Number((total * 0.25).toFixed(2))];

    const first = Math.min(100, Math.round(total * 0.34));
    const remaining = Math.max(0, total - first);
    const slot = Math.max(25, Math.round(remaining / 4));
    const out = [first];
    let used = first;
    while (used + slot < total && out.length < 6) {
      out.push(slot);
      used += slot;
    }
    const last = Number((total - used).toFixed(2));
    if (last > 0) out.push(last);
    return out;
  }, [tradingBudgetUsd]);

  const buildTradingQueue = useCallback((setup = tradingPreparedSetup, splitsArg = null) => {
    const budgetTotal = Number(String(tradingBudgetUsd || "").replace(",", "."));
    const splitsRaw = Array.isArray(splitsArg) ? splitsArg : parseTradingBudgetSplits(tradingBudgetSplitInput, tradingBudgetUsd);
    const splits = (Array.isArray(splitsRaw) ? splitsRaw : [])
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n) && n > 0);

    // If the user clears the trading budget or all slot values, the prepared slot cards
    // must disappear immediately instead of showing the last queue from localStorage.
    if (!(budgetTotal > 0) || !splits.length) return [];

    const base = setup && typeof setup === "object" ? setup : {};
    const confidence = String(base.confidence || tradingConfidenceMin || "MEDIUM").toUpperCase();
    const suitability = String(base.suitability || "MEDIUM").toUpperCase();
    const riskMode = String(base.riskMode || tradingRiskMode || "BALANCED").toUpperCase();
    const style = String(base.style || tradingStyle || "TACTICAL").toUpperCase();

    // Trading must stay usable even when the user did not manually type an asset yet.
    // Fallback order: prepared Strategist setup -> allowed assets -> selected Grid asset -> active chain symbol.
    // This prevents the Prepared/Budget flow from locking itself with an empty queue.
    const symbol = String(
      base.symbol ||
      base.sym ||
      (String(tradingAllowedAssets || "").split(",")[0] || "") ||
      gridItem ||
      activeGridChainSymbol ||
      ""
    ).trim().toUpperCase();

    const priorityBase =
      confidence === "HIGH" ? 80 :
      confidence === "LOW" ? 35 :
      55;

    return splits.map((amount, idx) => {
      let status = "WAIT";
      if (suitability === "LOW" || confidence === "LOW") status = idx === 0 ? "BLOCKED" : "WAIT";
      else if (idx === 0 && ["HIGH", "MEDIUM-HIGH", "MEDIUM"].includes(confidence)) status = "READY";
      else if (idx === 1 && confidence === "HIGH" && riskMode !== "DEFENSIVE") status = "READY";

      const condition =
        status === "READY"
          ? "Ready after user approval; execution still requires manual/session control."
          : status === "BLOCKED"
            ? "Blocked until confidence, liquidity or risk improves."
            : idx === 1
              ? "Wait for confirmation that momentum and liquidity remain stable."
              : "Wait for follow-up confirmation or a cleaner pullback/edge.";

      return {
        id: `slot_${idx + 1}_${Date.now()}`,
        slot: idx + 1,
        amountUsd: Number(Number(amount).toFixed(2)),
        symbol,
        chain: activeGridChainKey,
        chain_key: activeGridChainKey,
        status,
        priority: Math.max(0, Math.min(100, priorityBase - idx * 8)),
        condition,
        confidence,
        suitability,
        riskMode,
        style,
      };
    });
  }, [
    parseTradingBudgetSplits,
    tradingBudgetSplitInput,
    tradingBudgetUsd,
    tradingPreparedSetup,
    tradingConfidenceMin,
    tradingRiskMode,
    tradingStyle,
    tradingAllowedAssets,
    gridItem,
    activeGridChainSymbol,
    activeGridChainKey,
  ]);

  const tradingQueueSummary = useMemo(() => {
    const queue = Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : [];
    const active = queue.filter((s) => ["ACTIVE", "PROTECT"].includes(String(s.status || "").toUpperCase()));
    const ready = queue.filter((s) => s.status === "READY");
    const blocked = queue.filter((s) => s.status === "BLOCKED");
    const wait = queue.filter((s) => s.status === "WAIT");
    const hold = queue.filter((s) => ["HOLD", "OBSERVE"].includes(String(s.status || "").toUpperCase()));
    const releaseRequired = queue.filter((s) => String(s.status || "").toUpperCase() === "RELEASE_REQUIRED");
    const total = queue.reduce((sum, s) => sum + (Number(s.amountUsd) || 0), 0);
    return { queue, active, ready, blocked, wait, hold, releaseRequired, total };
  }, [tradingExecutionQueue]);

  const tradingVisibleQueueSummary = useMemo(() => {
    const allQueue = Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : [];
    const sid = String(selectedTradingSessionId || "").trim();
    let queue = sid
      ? allQueue.filter((slot) => String(getTradingSlotSessionId(slot) || "") === sid)
      : allQueue;

    // Backward compatibility for sessions created before every slot carried a session id.
    if (!queue.length && selectedTradingSession && Array.isArray(selectedTradingSession.queue)) {
      queue = selectedTradingSession.queue;
    }

    const active = queue.filter((slot) => ["ACTIVE", "PROTECT"].includes(String(slot.status || "").toUpperCase()));
    const ready = queue.filter((slot) => String(slot.status || "").toUpperCase() === "READY");
    const blocked = queue.filter((slot) => String(slot.status || "").toUpperCase() === "BLOCKED");
    const wait = queue.filter((slot) => String(slot.status || "").toUpperCase() === "WAIT");
    const hold = queue.filter((slot) => ["HOLD", "OBSERVE"].includes(String(slot.status || "").toUpperCase()));
    const releaseRequired = queue.filter((slot) => String(slot.status || "").toUpperCase() === "RELEASE_REQUIRED");
    const total = queue.reduce((sum, slot) => sum + (Number(slot.amountUsd) || 0), 0);
    return { queue, active, ready, blocked, wait, hold, releaseRequired, total };
  }, [tradingExecutionQueue, selectedTradingSessionId, selectedTradingSession, getTradingSlotSessionId]);

  const selectedTradingSessionLabel = useMemo(() => {
    const raw = String(selectedTradingSession?.status || "").toUpperCase();
    if (raw) return raw;
    const q = tradingVisibleQueueSummary.queue || [];
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "PROTECT")) return "PROTECT";
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "ACTIVE")) return "ACTIVE";
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "HOLD")) return "HOLD";
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "OBSERVE")) return "OBSERVE";
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "WAIT")) return "WAIT";
    if (q.some((slot) => String(slot.status || "").toUpperCase() === "BLOCKED")) return "WAIT";
    return tradingSessionLabel;
  }, [selectedTradingSession, tradingVisibleQueueSummary.queue, tradingSessionLabel]);

  const refreshTradingQueue = useCallback((setup = tradingPreparedSetup) => {
    const next = buildTradingQueue(setup);
    // Multi-session safety: do not overwrite existing runtime queues from
    // older approved sessions while the user edits the next-budget form.
    setTradingExecutionQueue((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const hasApprovedSessions = Array.isArray(openTradingSessions) && openTradingSessions.length > 0;
      return hasApprovedSessions ? existing : next;
    });
    return next;
  }, [buildTradingQueue, setTradingExecutionQueue, tradingPreparedSetup, openTradingSessions]);

  useEffect(() => {
    if (String(gridMode || "").toLowerCase() !== "trading") return;
    if (["HOLD", "OBSERVE", "RELEASE_REQUIRED"].includes(tradingSessionLabel)) return;
    const budget = Number(String(tradingBudgetUsd || "").replace(",", "."));
    const splits = parseTradingBudgetSplits(tradingBudgetSplitInput, tradingBudgetUsd);
    const hasPositiveSlots = Array.isArray(splits) && splits.some((n) => Number(n) > 0);
    const hasSetup = tradingPreparedSetup && typeof tradingPreparedSetup === "object";
    const hasAssets = String(tradingAllowedAssets || "").trim();

    const hasApprovedSessions = Array.isArray(openTradingSessions) && openTradingSessions.length > 0;

    if (!(budget > 0) || !hasPositiveSlots || (!hasSetup && !hasAssets)) {
      if (!hasApprovedSessions) setTradingExecutionQueue([]);
      return;
    }

    // In multi-session mode, editing the form prepares the next budget only.
    // It must not replace or erase queues from already approved sessions.
    if (hasApprovedSessions) return;

    const t = setTimeout(() => {
      refreshTradingQueue(hasSetup ? tradingPreparedSetup : null);
    }, 200);
    return () => clearTimeout(t);
  }, [
    gridMode,
    tradingSessionLabel,
    tradingBudgetUsd,
    tradingBudgetSplitInput,
    tradingAllowedAssets,
    tradingAllowedChains,
    tradingRiskMode,
    tradingConfidenceMin,
    tradingStyle,
    tradingPreparedSetup,
    refreshTradingQueue,
    parseTradingBudgetSplits,
    setTradingExecutionQueue,
    tradingSessions,
  ]);

  const tradingPreflight = useMemo(() => {
    const budget = Number(String(tradingBudgetUsd || "").replace(",", "."));
    const runtime = Number(String(tradingRuntimeHours || "").replace(",", "."));
    const holdHours = Number(String(tradingHoldHours || "").replace(",", "."));
    const slippage = Number(String(tradingMaxSlippagePct || "").replace(",", "."));
    const maxTrades = Number(String(tradingMaxTrades || "").replace(",", "."));
    const cautionDd = Number(String(tradingCautionDrawdownPct || "").replace(",", "."));
    const hardStop = Number(String(tradingHardStopPct || "").replace(",", "."));
    const profitLock = Number(String(tradingProfitLockPct || "").replace(",", "."));
    // User-entered values stay primary. If fields are still empty, fall back to the
    // currently prepared/selected context so Redeem-Code users are not stuck in PREPARED.
    const rawAssets = normalizeTradingCsv(tradingAllowedAssets);
    const fallbackAsset = String(
      tradingPreparedSetup?.symbol ||
      tradingPreparedSetup?.sym ||
      gridItem ||
      activeGridChainSymbol ||
      ""
    ).trim().toUpperCase();
    const assets = rawAssets.length ? rawAssets : normalizeTradingCsv(fallbackAsset);

    const rawChains = normalizeTradingCsv(tradingAllowedChains);
    const fallbackChain = String(activeGridChainKey || "POL").trim().toUpperCase();
    const chains = rawChains.length ? rawChains : normalizeTradingCsv(fallbackChain);
    const budgetSplits = parseTradingBudgetSplits(tradingBudgetSplitInput, tradingBudgetUsd);
    const splitTotal = budgetSplits.reduce((sum, n) => sum + (Number(n) || 0), 0);
    const knownChains = new Set([...(gridWalletChains || []), "POL", "BNB", "ETH"].map((x) => String(x || "").toUpperCase()));
    const unsupportedChains = chains.filter((ck) => !knownChains.has(ck));
    const issues = [];

    if (!(budget > 0)) issues.push("budget");
    if (budgetSplits.length && budget > 0 && Math.abs(splitTotal - budget) > Math.max(1, budget * 0.03)) issues.push("split total");
    if (!assets.length) issues.push("asset");
    if (!chains.length) issues.push("chain");
    if (unsupportedChains.length) issues.push(`unsupported chain ${unsupportedChains[0]}`);
    if (!(runtime >= 1 && runtime <= 168)) issues.push("runtime 1-168h");
    if (!(holdHours >= 1 && holdHours <= 12)) issues.push("hold 1-12h");
    if (!Number.isFinite(slippage) || slippage <= 0 || slippage > 5) issues.push("slippage <=5%");
    if (!Number.isFinite(maxTrades) || maxTrades < 1 || maxTrades > 50) issues.push("max trades");
    if (!Number.isFinite(cautionDd) || cautionDd < 0 || cautionDd > 25) issues.push("caution DD");
    if (!Number.isFinite(hardStop) || hardStop < 1 || hardStop > 50) issues.push("hard stop");
    if (!Number.isFinite(profitLock) || profitLock < 0 || profitLock > 80) issues.push("profit lock");
    if (!["DEFENSIVE", "BALANCED", "DYNAMIC"].includes(String(tradingRiskMode || "").toUpperCase())) issues.push("risk mode");

    return {
      ok: issues.length === 0,
      issues,
      budget,
      runtime,
      holdHours,
      assets,
      chains,
      slippage,
      maxTrades,
      budgetSplits,
      splitTotal,
      cautionDd,
      hardStop,
      profitLock,
      title: issues.length ? `Preflight needs: ${issues.join(", ")}` : "Preflight ready. Nexus Trading can be armed.",
    };
  }, [
    tradingBudgetUsd,
    tradingRuntimeHours,
    tradingHoldHours,
    tradingAllowedAssets,
    tradingAllowedChains,
    tradingRiskMode,
    tradingCautionDrawdownPct,
    tradingHardStopPct,
    tradingProfitLockPct,
    tradingMaxSlippagePct,
    tradingMaxTrades,
    tradingBudgetSplitInput,
    parseTradingBudgetSplits,
    gridWalletChains,
    normalizeTradingCsv,
    tradingPreparedSetup,
    gridItem,
    activeGridChainSymbol,
    activeGridChainKey,
  ]);

  const tradingCanApprove = !!tradingPreflight.ok;
  const tradingCanStart = false;
  const tradingCanPause = ["ACTIVE", "PROTECT"].includes(selectedTradingSessionLabel);
  const tradingCanResume = selectedTradingSessionLabel === "PAUSED";
  const tradingCanStop = ["ARMED", "ACTIVE", "PROTECT", "PAUSED", "WAIT"].includes(selectedTradingSessionLabel);
  const tradingCanReleaseCapital = ["HOLD", "OBSERVE", "RELEASE_REQUIRED", "STOPPED"].includes(selectedTradingSessionLabel);

  const applyShadowQueuePreview = useCallback((shadowQueue = [], shadowRun = null) => {
    const previewRows = Array.isArray(shadowQueue) ? shadowQueue.filter((x) => x && typeof x === "object") : [];
    if (!previewRows.length) return false;

    const now = Date.now();
    const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
    const chain = String(activeGridChainKey || DEFAULT_CHAIN || "").toUpperCase().trim();
    const runId = String(shadowRun?.run_id || shadowRun?.id || "").trim();

    const keysFor = (slot = {}, idx = 0) => {
      const slotSession = String(getTradingSlotSessionId(slot) || sid || "").trim();
      const slotChain = String(slot?.chain || slot?.chain_key || slot?.network || chain || "").toUpperCase().trim();
      const id = String(slot?.id || slot?.queue_id || "").trim();
      const slotNo = String(slot?.slot || slot?.slot_id || slot?.slotId || idx + 1).trim();
      const symbol = String(slot?.symbol || slot?.asset || "").trim().toUpperCase();
      const out = [];
      if (id) out.push(`id:${id}`);
      if (slotSession && slotChain && slotNo) out.push(`session:${slotSession}|chain:${slotChain}|slot:${slotNo}`);
      if (slotSession && slotChain && slotNo && symbol) out.push(`session:${slotSession}|chain:${slotChain}|slot:${slotNo}|symbol:${symbol}`);
      return out;
    };

    const previewByKey = new Map();
    previewRows.forEach((row, idx) => {
      // Only accept preview rows for the selected session and selected chain.
      const rowSession = String(getTradingSlotSessionId(row) || row?.session_id || row?.sessionId || sid || "").trim();
      const rowChain = String(row?.chain || row?.chain_key || row?.network || chain || "").toUpperCase().trim();
      if (sid && rowSession && rowSession !== sid) return;
      if (chain && rowChain && rowChain !== chain) return;
      keysFor({ ...row, session_id: rowSession, chain: rowChain }, idx).forEach((key) => previewByKey.set(key, row));
    });

    let appliedCount = 0;
    let hasActive = false;
    let hasReady = false;
    let hasProtect = false;

    setTradingExecutionQueue((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const next = existing.map((slot, idx) => {
        const slotSession = String(getTradingSlotSessionId(slot) || "").trim();
        const slotChain = String(slot?.chain || slot?.chain_key || slot?.network || chain || "").toUpperCase().trim();
        if (sid && slotSession && slotSession !== sid) return slot;
        if (chain && slotChain && slotChain !== chain) return slot;

        let preview = null;
        for (const key of keysFor(slot, idx)) {
          if (previewByKey.has(key)) {
            preview = previewByKey.get(key);
            break;
          }
        }
        // Do not fall back to previewRows[idx]. That caused ETH preview rows to be
        // written into BNB/POL slots and duplicated cards across sessions.
        if (!preview) return slot;

        const nextStatus = String(preview.status || preview.state || slot.status || "WAIT").toUpperCase();
        const transition = preview.shadow_transition && typeof preview.shadow_transition === "object" ? preview.shadow_transition : {};
        const reason = String(transition.reason || preview.condition || preview.reason || slot.condition || "Shadow updated this slot.");
        appliedCount += 1;
        if (nextStatus === "ACTIVE") hasActive = true;
        if (nextStatus === "READY") hasReady = true;
        if (nextStatus === "PROTECT") hasProtect = true;

        return {
          ...slot,
          status: nextStatus,
          state: nextStatus,
          chain: slotChain || chain,
          chain_key: slotChain || chain,
          priority: Number.isFinite(Number(preview.priority)) ? Number(preview.priority) : Number(slot.priority || 0),
          confidence: Number.isFinite(Number(preview.confidence)) ? Number(preview.confidence) : (preview.confidence_score ?? slot.confidence),
          confidence_score: Number.isFinite(Number(preview.confidence_score)) ? Number(preview.confidence_score) : (preview.confidence ?? slot.confidence_score),
          risk_score: Number.isFinite(Number(preview.risk_score)) ? Number(preview.risk_score) : Number(slot.risk_score || 0),
          condition: reason,
          shadowTransition: transition,
          shadowLastRunId: runId,
          shadowUpdatedAt: now,
        };
      });
      return dedupeTradingQueue(next);
    });

    if (appliedCount <= 0) return false;

    const nextSessionStatus = hasProtect ? "PROTECT" : hasActive ? "ACTIVE" : hasReady ? "ACTIVE" : "WAIT";
    setTradingSessionStatus(nextSessionStatus);
    setTradingSessionUpdatedTs(now);
    updateTradingSessionMeta(sid, {
      status: nextSessionStatus,
      shadowLastRunId: runId,
      shadowAppliedAt: now,
      shadowAppliedSlots: appliedCount,
    });
    setTradingPreparedSetup((prev) => {
      const base = prev && typeof prev === "object" ? prev : {};
      const previousSession = base.session && typeof base.session === "object" ? base.session : {};
      const nextSession = {
        ...previousSession,
        status: nextSessionStatus,
        shadowLastRunId: runId,
        shadowAppliedAt: now,
        shadowAppliedSlots: appliedCount,
        userAction: {
          ...(previousSession.userAction || {}),
          shadowPreviewApplied: true,
          sessionId: sid,
        },
        updatedTs: now,
      };
      return { ...base, session: nextSession };
    });

    return true;
  }, [selectedTradingSessionId, activeTradingSessionId, activeGridChainKey, getTradingSlotSessionId, dedupeTradingQueue, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, setTradingPreparedSetup]);

  const runShadowExecutorValidation = useCallback(async () => {
    if (!wallet) {
      setShadowExecutorMsg("Wallet not connected.");
      return;
    }
    setShadowExecutorBusy(true);
    setShadowExecutorMsg("");
    try {
      const currentQueue = Array.isArray(tradingVisibleQueueSummary?.queue) ? tradingVisibleQueueSummary.queue : [];
      const res = await api(`/api/nexus/shadow/executor`, {
        method: "POST",
        wallet,
        body: {
          source: "frontend_trading_panel",
          queue: currentQueue,
          config: {
            session_id: selectedTradingSessionId || "",
            runtime_hours: tradingRuntimeHours,
            max_trades: tradingMaxTrades,
            risk_mode: tradingRiskMode,
            max_slippage_pct: tradingMaxSlippagePct,
            persist_state: true,
          },
        },
      });
      const shadowRun = res?.run || null;
      const shadowQueue = Array.isArray(shadowRun?.queue) ? shadowRun.queue : [];
      const applied = applyShadowQueuePreview(shadowQueue, shadowRun);
      const summary = shadowRun?.summary || {};
      setShadowExecutorState({ ...(shadowExecutorState || {}), ...(res || {}), last_run: shadowRun, run: shadowRun });
      setShadowExecutorMsg(
        applied
          ? `Shadow updated ${summary?.slots_tested ?? shadowQueue.length} slot(s): ${summary?.ready_slots ?? 0} ready, ${summary?.virtual_fills ?? 0} virtual fill(s), ${summary?.virtual_waits ?? 0} waiting.`
          : (res?.message || "Shadow validation completed. No Vault execution was triggered.")
      );
      await refreshNexusBackendState();
    } catch (e) {
      setShadowExecutorMsg(e?.message || "Shadow validation failed.");
    } finally {
      setShadowExecutorBusy(false);
    }
  }, [api, wallet, tradingVisibleQueueSummary, selectedTradingSessionId, tradingRuntimeHours, tradingMaxTrades, tradingRiskMode, tradingMaxSlippagePct, shadowExecutorState, applyShadowQueuePreview, refreshNexusBackendState]);


  // Runtime heartbeat for multi-session Trading.
  // A user-approved session must not stay forever in WAIT/BLOCKED without a fresh
  // decision. This is still off-chain/session-control logic; it does not trigger Vault
  // execution. It only keeps the selected/open sessions moving through READY/ACTIVE/WAIT
  // so Shadow and later Live Execution have a current runtime state to evaluate.
  const updateTradingPreparedSession = useCallback((patch = {}) => {
    setTradingPreparedSetup((prev) => {
      const base = prev && typeof prev === "object" ? prev : {};
      const previousSession = base.session && typeof base.session === "object" ? base.session : {};
      const nextSession = { ...previousSession, ...patch, updatedTs: Date.now() };
      const next = { ...base, session: nextSession };

      if (next.learningEvent && typeof next.learningEvent === "object") {
        next.learningEvent = {
          ...next.learningEvent,
          userAction: {
            ...(next.learningEvent.userAction || {}),
            ...(patch.userAction || {}),
          },
          session: nextSession,
        };
      }
      return next;
    });
  }, [setTradingPreparedSetup]);

  const applyTradingRuntimeHeartbeat = useCallback((reason = "auto") => {
    const now = Date.now();
    const openIds = new Set((Array.isArray(openTradingSessions) ? openTradingSessions : [])
      .map((sess) => String(sess?.id || "").trim())
      .filter(Boolean));
    if (!openIds.size) return;

    let changed = false;
    const promotedBySession = new Map();
    const bySession = new Map();

    const currentQueue = Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : [];
    currentQueue.forEach((slot, idx) => {
      const sid = String(getTradingSlotSessionId(slot) || "").trim();
      if (!sid || !openIds.has(sid)) return;
      if (!bySession.has(sid)) bySession.set(sid, []);
      bySession.get(sid).push({ slot, idx });
    });

    for (const [sid, rows] of bySession.entries()) {
      const hasExecutable = rows.some(({ slot }) => ["ACTIVE", "PROTECT", "EXECUTING"].includes(String(slot?.status || "").toUpperCase()));
      const hasProtected = rows.some(({ slot }) => ["HOLD", "OBSERVE", "RELEASE_REQUIRED"].includes(String(slot?.status || "").toUpperCase()));
      if (hasExecutable || hasProtected) continue;

      const candidates = rows
        .filter(({ slot }) => {
          const st = String(slot?.status || "").toUpperCase();
          const risk = Number(slot?.risk_score ?? slot?.riskScore ?? 0);
          return ["READY", "WAIT", "BLOCKED"].includes(st) && (!Number.isFinite(risk) || risk < 70);
        })
        .sort((a, b) => Number(b.slot?.priority || 0) - Number(a.slot?.priority || 0));

      const pick = candidates[0];
      if (pick) promotedBySession.set(sid, pick.idx);
    }

    if (!promotedBySession.size) return;

    const nextQueue = currentQueue.map((slot, idx) => {
      const sid = String(getTradingSlotSessionId(slot) || "").trim();
      if (!sid || !promotedBySession.has(sid) || promotedBySession.get(sid) !== idx) return slot;
      const prevStatus = String(slot?.status || "WAIT").toUpperCase();
      changed = true;
      return {
        ...slot,
        status: "ACTIVE",
        previousStatus: prevStatus,
        runtimePromotedAt: now,
        lastRuntimeRecheckAt: now,
        condition: prevStatus === "BLOCKED"
          ? "Runtime recheck released this slot from BLOCKED into ACTIVE monitoring. Execution still remains inside user/session limits."
          : "Runtime recheck promoted this slot into ACTIVE monitoring. Execution still remains inside user/session limits.",
        observeReason: `Runtime heartbeat (${reason}) prevented the approved session from staying idle without a fresh decision.`,
      };
    });

    if (changed) {
      setTradingExecutionQueue(nextQueue);
      promotedBySession.forEach((_, sid) => {
        setTradingSessionStatus("ACTIVE");
        setTradingSessionUpdatedTs(now);
        updateTradingSessionMeta(sid, { status: "ACTIVE", lastRuntimeHeartbeatAt: now, runtimeHeartbeatReason: reason });
      });
      updateTradingPreparedSession({
        status: "ACTIVE",
        executionQueue: nextQueue,
        runtimeHeartbeatAt: now,
        runtimeHeartbeatReason: reason,
      });
    }
  }, [openTradingSessions, tradingExecutionQueue, getTradingSlotSessionId, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, updateTradingPreparedSession]);

  useEffect(() => {
    if (String(gridMode || "").toLowerCase() !== "trading") return;
    if (!openTradingSessions?.length) return;
    applyTradingRuntimeHeartbeat("mount");
    const id = setInterval(() => applyTradingRuntimeHeartbeat("interval"), 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [gridMode, openTradingSessions, applyTradingRuntimeHeartbeat]);

  const tradingGlobalRiskState = useMemo(() => {
    const fromBackend = nexusBackendState?.risk_state || nexusBackendState?.global_risk_state || null;
    const fromSession = tradingPreparedSetup?.session?.backendRiskState || tradingPreparedSetup?.session?.backendRiskDecision?.risk_state || null;
    const rs = fromBackend && typeof fromBackend === "object" ? fromBackend : fromSession && typeof fromSession === "object" ? fromSession : null;
    if (!rs) return null;
    const status = String(rs.global_status || rs.status || "ACTIVE_OK").toUpperCase();
    const cooldownUntil = Number(rs.cooldown_until_ts || 0) > 0 ? Number(rs.cooldown_until_ts) * 1000 : 0;
    const invalidations = Array.isArray(rs.invalidations) ? rs.invalidations : [];
    return { ...rs, status, cooldownUntil, invalidations };
  }, [nexusBackendState, tradingPreparedSetup]);

  const tradingGlobalRiskLabel = useMemo(() => {
    const rs = tradingGlobalRiskState;
    if (!rs) return "Risk sync: ready";
    const score = Number.isFinite(Number(rs.risk_score)) ? ` · Risk ${Math.round(Number(rs.risk_score))}/100` : "";
    const cooldown = rs.cooldownUntil > Date.now() ? ` · cooldown until ${new Date(rs.cooldownUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "";
    const status = rs.status === "ACTIVE_OK" ? "Risk sync: clean" : rs.status === "PROTECT" ? "Risk sync: PROTECT" : rs.status === "COOLDOWN" ? "Risk sync: COOLDOWN" : `Risk sync: ${rs.status}`;
    return `${status}${score}${cooldown}`;
  }, [tradingGlobalRiskState]);

  const handleTradingApproveBudget = useCallback(() => {
    if (!tradingCanApprove) {
      setErrorMsg(tradingPreflight.title || "Complete Nexus Trading preflight before approving.");
      return;
    }
    const now = Date.now();
    const sessionId = makeNexusSessionId("TRD");
    setActiveTradingSessionId(sessionId);
    const queue = buildTradingQueue();
    let activatedOne = false;
    const activeQueue = (Array.isArray(queue) ? queue : []).map((slot, idx) => {
      let next = { ...slot, session_id: sessionId, sessionId, trade_session_id: sessionId };
      if (slot.status === "READY") {
        activatedOne = true;
        next = { ...next, status: "ACTIVE", activatedAt: now };
      } else if (!activatedOne && idx === 0 && ["WAIT", "BLOCKED"].includes(String(slot.status || "").toUpperCase()) && Number(slot.priority || 0) >= 50) {
        // User-approved sessions must enter active monitoring instead of staying idle forever.
        // Risk decisions can still move the slot back to PROTECT/HOLD/BLOCKED afterwards.
        activatedOne = true;
        next = { ...next, previousStatus: slot.status, status: "ACTIVE", activatedAt: now, lastRuntimeRecheckAt: now };
      }
      return next;
    });

    // Do not replace older trades. A later 300$ approval becomes a separate session.
    setTradingExecutionQueue((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      return dedupeTradingQueue([...existing, ...activeQueue]);
    });
    setTradingSessions((prev) => {
      const existing = Array.isArray(prev) ? prev : [];
      const assets = Array.isArray(tradingPreflight.assets) && tradingPreflight.assets.length ? tradingPreflight.assets : [activeQueue?.[0]?.symbol].filter(Boolean);
      const chains = Array.isArray(tradingPreflight.chains) && tradingPreflight.chains.length ? tradingPreflight.chains : [activeGridChainKey].filter(Boolean);
      return [
        {
          id: sessionId,
          type: "TRADING",
          budgetUsd: Number(String(tradingBudgetUsd || "").replace(",", ".")) || 0,
          assets,
          chains,
          status: activeQueue.some((s) => String(s.status || "").toUpperCase() === "ACTIVE") ? "ACTIVE" : "WAIT",
          slots: activeQueue.length,
          createdAt: now,
          updatedAt: now,
        },
        ...existing,
      ].slice(0, 20);
    });
    setTradingSessionStatus("ACTIVE");
    setTradingSessionUpdatedTs(now);
    updateTradingPreparedSession({
      status: "ACTIVE",
      sessionId,
      approvedBudgetUsd: tradingBudgetUsd,
      approvedAt: now,
      startedAt: now,
      holdHours: clampTradingHoldHours(tradingHoldHours),
      observeMaxHours: 12,
      preflight: tradingPreflight,
      executionQueue: activeQueue,
      userAction: { approvedBudget: true, armed: true, started: true, preflightOk: true, multiSession: true },
      note: "New independent Trading session created. Nexus Trading is autonomous only inside this session's approved limits. User controls Pause and Stop.",
    });
    setTradingBudgetUsd("");
    setTradingBudgetSplitInput("");
    setErrorMsg(`Trading session created: ${fmtUsd(Number(String(tradingBudgetUsd || "0").replace(",", ".")) || 0)} · ${sessionId}. Enter the next budget and approve/sign again when you want another independent session.`);
  }, [tradingCanApprove, tradingBudgetUsd, tradingHoldHours, tradingPreflight, buildTradingQueue, clampTradingHoldHours, activeGridChainKey, makeNexusSessionId, dedupeTradingQueue, setTradingExecutionQueue, setTradingSessions, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingPreparedSession, setActiveTradingSessionId, setErrorMsg, setTradingBudgetUsd, setTradingBudgetSplitInput]);

  const handleTradingStartSession = useCallback(() => {
    if (!tradingCanStart) return;
    const now = Date.now();
    setTradingExecutionQueue((prev) => (Array.isArray(prev) ? prev : []).map((s) => s.status === "READY" ? { ...s, status: "EXECUTED", executedAt: now } : s));
    setTradingSessionStatus("ACTIVE");
    setTradingSessionUpdatedTs(now);
    updateTradingPreparedSession({ status: "ACTIVE", startedAt: now, executionQueue: tradingExecutionQueue, userAction: { started: true } });
  }, [tradingCanStart, tradingExecutionQueue, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingPreparedSession]);

  const handleTradingPauseSession = useCallback(() => {
    if (!tradingCanPause) return;
    const now = Date.now();
    const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
    setTradingExecutionQueue((prev) => (Array.isArray(prev) ? prev : []).map((s) => {
      const sameSession = !sid || String(getTradingSlotSessionId(s) || "") === sid;
      return sameSession && ["ACTIVE", "READY"].includes(String(s.status || "").toUpperCase())
        ? { ...s, status: "WAIT", pausedAt: now }
        : s;
    }));
    setTradingSessionStatus("PAUSED");
    setTradingSessionUpdatedTs(now);
    updateTradingSessionMeta(sid, { status: "PAUSED", pausedAt: now });
    updateTradingPreparedSession({ status: "PAUSED", pausedAt: now, userAction: { paused: true, sessionId: sid } });
  }, [tradingCanPause, selectedTradingSessionId, activeTradingSessionId, getTradingSlotSessionId, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, updateTradingPreparedSession]);

  const handleTradingResumeSession = useCallback(() => {
    if (!tradingCanResume) return;
    const now = Date.now();
    const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
    setTradingExecutionQueue((prev) => {
      let activated = false;
      return (Array.isArray(prev) ? prev : []).map((s) => {
        const sameSession = !sid || String(getTradingSlotSessionId(s) || "") === sid;
        if (sameSession && !activated && String(s.status || "").toUpperCase() === "WAIT" && Number(s.priority || 0) >= 50) {
          activated = true;
          return { ...s, status: "ACTIVE", resumedAt: now };
        }
        return s;
      });
    });
    setTradingSessionStatus("ACTIVE");
    setTradingSessionUpdatedTs(now);
    updateTradingSessionMeta(sid, { status: "ACTIVE", resumedAt: now });
    updateTradingPreparedSession({ status: "ACTIVE", resumedAt: now, executionQueue: tradingVisibleQueueSummary.queue, userAction: { paused: false, sessionId: sid } });
  }, [tradingCanResume, selectedTradingSessionId, activeTradingSessionId, getTradingSlotSessionId, tradingVisibleQueueSummary.queue, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, updateTradingPreparedSession]);

  const handleTradingStopSession = useCallback(() => {
    if (!tradingCanStop) return;
    const now = Date.now();
    const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
    let stoppedQueue = [];

    // Stop means: close the selected independent session and remove its slots
    // from the active runtime view. The session is kept only as local history so
    // old sessions are not overwritten, but they no longer count as active capital.
    setTradingExecutionQueue((prev) => {
      const all = Array.isArray(prev) ? prev : [];
      stoppedQueue = all
        .filter((slot) => String(getTradingSlotSessionId(slot) || "") === sid)
        .map((slot) => ({ ...slot, status: "STOPPED", stoppedAt: now, closedAt: now }));
      return all.filter((slot) => String(getTradingSlotSessionId(slot) || "") !== sid);
    });

    setTradingSessionStatus("PREPARED");
    setTradingSessionUpdatedTs(now);
    updateTradingSessionMeta(sid, { status: "STOPPED", stoppedAt: now, closedAt: now, active: false });

    const remainingOpen = (Array.isArray(openTradingSessions) ? openTradingSessions : [])
      .filter((sess) => String(sess?.id || "") !== sid);
    setActiveTradingSessionId(String(remainingOpen?.[0]?.id || ""));

    updateTradingPreparedSession({
      status: "PREPARED",
      sessionId: sid,
      stoppedAt: now,
      closedAt: now,
      executionQueue: [],
      stoppedQueue,
      userAction: { stopped: true, closedSession: true, sessionId: sid },
      outcome: { status: "session_stopped_by_user" },
      note: "Selected Trading session stopped. It is removed from active sessions and kept only as local history. A new budget must be approved/signed for the next independent session.",
    });

    api("/api/nexus/trading/hold-state", {
      method: "POST",
      body: { action: "stop", queue: [], stopped_queue: stoppedQueue, reason: "user_stop_session", session_id: sid },
    }).catch(() => {});
  }, [tradingCanStop, selectedTradingSessionId, activeTradingSessionId, getTradingSlotSessionId, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, updateTradingPreparedSession, openTradingSessions, setActiveTradingSessionId]);

  const handleTradingReleaseCapital = useCallback(() => {
    if (!tradingCanReleaseCapital) return;
    const now = Date.now();
    const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
    setTradingExecutionQueue((prev) => (Array.isArray(prev) ? prev : []).filter((slot) => String(getTradingSlotSessionId(slot) || "") !== sid));
    setTradingSessionStatus("PREPARED");
    setTradingSessionUpdatedTs(now);
    updateTradingSessionMeta(sid, { status: "RELEASED", releasedAt: now });
    updateTradingPreparedSession({
      status: "PREPARED",
      sessionId: sid,
      releasedAt: now,
      executionQueue: [],
      userAction: { releasedCapital: true, sessionId: sid },
      note: "Capital released by user for the selected session. Other Trading sessions remain untouched.",
    });
    api("/api/nexus/trading/hold-state", { method: "POST", body: { action: "release", session_id: sid } }).catch(() => {});
  }, [tradingCanReleaseCapital, selectedTradingSessionId, activeTradingSessionId, getTradingSlotSessionId, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingSessionMeta, updateTradingPreparedSession]);



  const applyTradingRiskDecision = useCallback((riskResult = {}) => {
    const decisions = Array.isArray(riskResult?.decisions) ? riskResult.decisions : [];
    if (!decisions.length) return;

    const now = Date.now();
    const decisionBySlot = new Map();
    decisions.forEach((d) => {
      const key = String(d?.slot ?? "");
      if (key) decisionBySlot.set(key, d);
    });

    let shouldEnterHold = false;
    let nextSession = tradingSessionLabel;
    let holdReason = "Risk decision engine requested capital protection.";
    const holdHours = clampTradingHoldHours(tradingHoldHours);
    const holdUntil = now + holdHours * 60 * 60 * 1000;
    const observeUntil = now + 12 * 60 * 60 * 1000;

    const nextQueue = (Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : []).map((slot) => {
      const d = decisionBySlot.get(String(slot?.slot ?? ""));
      if (!d) return slot;

      const action = String(d.action || "KEEP_ACTIVE").toUpperCase();
      const reasons = Array.isArray(d.reasons) ? d.reasons.filter(Boolean).join(" ") : String(d.reason || "");
      const riskScore = Number(d.risk_score || 0);
      const confirmations = Number(d.confirmations || 0);
      const decisionMeta = {
        riskDecision: d.decision || action,
        riskScore,
        riskConfirmations: confirmations,
        riskReasons: Array.isArray(d.reasons) ? d.reasons : [],
        riskCheckedAt: now,
      };

      if (action === "FORCE_EXIT" || action === "EXIT") {
        shouldEnterHold = true;
        nextSession = "HOLD";
        holdReason = reasons || (action === "FORCE_EXIT" ? "Hard risk block triggered force exit." : "Confirmed risk cluster triggered exit.");
        return {
          ...slot,
          ...decisionMeta,
          status: "HOLD",
          exitRequestedAt: now,
          holdStartedAt: now,
          holdUntil,
          observeUntil,
          condition: action === "FORCE_EXIT" ? "Force exit risk detected. Capital is protected in HOLD." : "Exit risk confirmed. Capital is protected in HOLD.",
          observeReason: holdReason,
        };
      }

      if (action === "REDUCE") {
        nextSession = nextSession === "ACTIVE" ? "PROTECT" : nextSession;
        return {
          ...slot,
          ...decisionMeta,
          status: "PROTECT",
          reduceRecommendedAt: now,
          condition: "Reduce / protect recommended. Risk cluster is elevated but not force-exit critical.",
          observeReason: reasons || "The Strategist detected elevated risk and recommends reducing exposure before conditions worsen.",
        };
      }

      if (action === "PROTECT") {
        nextSession = nextSession === "ACTIVE" ? "PROTECT" : nextSession;
        return {
          ...slot,
          ...decisionMeta,
          status: "PROTECT",
          protectStartedAt: slot.protectStartedAt || now,
          condition: "Protect mode. No new add-ons; Strategist watches for confirmation or recovery.",
          observeReason: reasons || "The Strategist detected early risk signals. This is not an exit yet, but the trade is under protection.",
        };
      }

      if (action === "CLEAR_PROTECT") {
        return {
          ...slot,
          ...decisionMeta,
          status: "ACTIVE",
          protectClearedAt: now,
          condition: "Risk normalized. Slot returned to ACTIVE monitoring.",
          observeReason: reasons || "Risk cluster cleared and market conditions normalized enough for active monitoring.",
        };
      }

      return {
        ...slot,
        ...decisionMeta,
        condition: slot.condition || "Active; Strategist continues monitoring for risk changes.",
      };
    });

    setTradingExecutionQueue(nextQueue);
    if (nextSession !== tradingSessionLabel) {
      setTradingSessionStatus(nextSession);
      setTradingSessionUpdatedTs(now);
    }
    updateTradingPreparedSession({
      status: nextSession,
      executionQueue: nextQueue,
      backendRiskDecision: riskResult,
      backendRiskState: riskResult?.risk_state || riskResult?.global_risk_state || null,
      riskCheckedAt: now,
    });

    if (shouldEnterHold) {
      api("/api/nexus/trading/hold-state", {
        method: "POST",
        body: { action: "exit", hold_hours: holdHours, queue: nextQueue, reason: holdReason },
      }).catch(() => {});
    }
  }, [tradingExecutionQueue, tradingSessionLabel, tradingHoldHours, clampTradingHoldHours, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingPreparedSession]);

  useEffect(() => {
    if (String(gridMode || "").toLowerCase() !== "trading") return;
    if (!["ACTIVE", "PROTECT"].includes(tradingSessionLabel)) return;
    if (!Array.isArray(tradingExecutionQueue) || !tradingExecutionQueue.length) return;

    let cancelled = false;
    const checkRisk = () => {
      const monitoredQueue = (Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : [])
        .filter((slot) => ["ACTIVE", "PROTECT", "READY"].includes(String(slot?.status || "").toUpperCase()));
      if (!monitoredQueue.length) return;

      // Prevent request storms: queue/risk updates can re-render the component and
      // would otherwise immediately re-trigger this effect. Keep one risk decision
      // request per stable queue/config snapshot unless the 60s interval fires.
      const riskKey = JSON.stringify({
        wallet: String(wallet || "").toLowerCase(),
        session: String(selectedTradingSessionId || activeTradingSessionId || ""),
        queue: monitoredQueue.map((slot) => ({
          slot: slot?.slot || slot?.slot_id || slot?.id || "",
          symbol: slot?.symbol || slot?.asset || "",
          status: String(slot?.status || "").toUpperCase(),
          confidence: Number(slot?.confidence ?? slot?.confidence_score ?? 0),
          risk_score: Number(slot?.risk_score ?? slot?.riskScore ?? 0),
          priority: Number(slot?.priority ?? 0),
        })),
        risk_mode: tradingRiskMode,
        caution_drawdown_pct: tradingCautionDrawdownPct,
        hard_stop_pct: tradingHardStopPct,
        max_slippage_pct: tradingMaxSlippagePct,
      });
      const nowMs = Date.now();
      const last = tradingRiskRequestRef.current || { key: "", ts: 0, inFlight: false };
      if (last.inFlight) return;
      if (last.key === riskKey && nowMs - Number(last.ts || 0) < 55000) return;
      tradingRiskRequestRef.current = { key: riskKey, ts: nowMs, inFlight: true };

      api("/api/nexus/trading/risk-decision", {
        method: "POST",
        wallet,
        body: {
          wallet,
          wallet_address: wallet,
          queue: monitoredQueue,
          config: {
            risk_mode: tradingRiskMode,
            caution_drawdown_pct: tradingCautionDrawdownPct,
            hard_stop_pct: tradingHardStopPct,
            max_slippage_pct: tradingMaxSlippagePct,
          },
        },
      })
        .then((res) => {
          if (cancelled) return;
          if (res?.status === "ok") {
            applyTradingRiskDecision(res);
            if (typeof refreshNexusBackendState === "function") refreshNexusBackendState();
          }
        })
        .catch(() => {})
        .finally(() => {
          const cur = tradingRiskRequestRef.current || {};
          tradingRiskRequestRef.current = { ...cur, inFlight: false };
        });
    };

    const first = setTimeout(checkRisk, 5000);
    const id = setInterval(checkRisk, 120 * 1000);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(id);
    };
  }, [gridMode, tradingSessionLabel, tradingExecutionQueue, tradingRiskMode, tradingCautionDrawdownPct, tradingHardStopPct, tradingMaxSlippagePct, wallet, selectedTradingSessionId, activeTradingSessionId, applyTradingRiskDecision, refreshNexusBackendState]);

  useEffect(() => {
    if (String(gridMode || "").toLowerCase() !== "trading") return;
    if (!["HOLD", "OBSERVE"].includes(tradingSessionLabel)) return;

    const tick = () => {
      const now = Date.now();
      let nextSession = tradingSessionLabel;
      let changed = false;
      let releaseNeeded = false;

      const nextQueue = (Array.isArray(tradingExecutionQueue) ? tradingExecutionQueue : []).map((slot) => {
        const st = String(slot?.status || "").toUpperCase();
        if (!["HOLD", "OBSERVE"].includes(st)) return slot;
        const holdUntil = Number(slot.holdUntil || 0);
        const observeUntil = Number(slot.observeUntil || 0);

        if (observeUntil > 0 && now >= observeUntil) {
          changed = true;
          releaseNeeded = true;
          return {
            ...slot,
            status: "RELEASE_REQUIRED",
            releaseRequiredAt: now,
            condition: "Max 12h observation reached. Capital stays protected and requires user release before new allocation.",
            observeReason: "The maximum observation window has been reached. Nexus will not reallocate automatically; user release is required before capital can be used again.",
          };
        }

        if (st === "HOLD" && holdUntil > 0 && now >= holdUntil) {
          changed = true;
          nextSession = "OBSERVE";
          return {
            ...slot,
            status: "OBSERVE",
            observeStartedAt: now,
            condition: "Minimum HOLD completed. Strategist keeps observing; no trade unless market quality becomes clean.",
            observeReason: "Minimum HOLD is complete, but this is not trade approval. The Strategist still needs clean market structure, liquidity confirmation, acceptable RVOL and controlled risk before any new allocation.",
          };
        }

        return slot;
      });

      if (releaseNeeded) nextSession = "RELEASE_REQUIRED";
      if (changed) {
        setTradingExecutionQueue(nextQueue);
        setTradingSessionStatus(nextSession);
        setTradingSessionUpdatedTs(now);
        updateTradingPreparedSession({
          status: nextSession,
          executionQueue: nextQueue,
          updatedByHoldObserve: true,
          releaseRequired: releaseNeeded,
        });
      }
    };

    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [gridMode, tradingSessionLabel, tradingExecutionQueue, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingPreparedSession]);

  useEffect(() => {
    if (String(gridMode || "").toLowerCase() !== "trading") return;
    if (tradingHoldStateHydratedRef.current) return;
    tradingHoldStateHydratedRef.current = true;

    api("/api/nexus/trading/hold-state")
      .then((res) => {
        const holdState = res?.hold_state;
        if (!holdState || typeof holdState !== "object") return;

        const status = String(holdState.status || "").toUpperCase();
        if (!["HOLD", "OBSERVE", "RELEASE_REQUIRED"].includes(status)) return;

        const holdUntilMs = Number(holdState.hold_until_ts || 0) > 0 ? Number(holdState.hold_until_ts) * 1000 : 0;
        const observeUntilMs = Number(holdState.observe_until_ts || 0) > 0 ? Number(holdState.observe_until_ts) * 1000 : 0;
        const reason = String(holdState.reason || "Capital is protected while the Strategist keeps observing market quality.");
        const queue = Array.isArray(holdState.queue) ? holdState.queue : [];
        const nextQueue = queue.map((slot) => {
          const slotStatus = String(slot?.status || "").toUpperCase();
          const shouldForceRelease = status === "RELEASE_REQUIRED" && ["HOLD", "OBSERVE", "RELEASE_REQUIRED"].includes(slotStatus);
          const shouldSyncObserve = status === "OBSERVE" && slotStatus === "HOLD";
          return {
            ...slot,
            status: shouldForceRelease ? "RELEASE_REQUIRED" : shouldSyncObserve ? "OBSERVE" : (slot.status || status),
            holdUntil: Number(slot?.holdUntil || 0) || holdUntilMs || undefined,
            observeUntil: Number(slot?.observeUntil || 0) || observeUntilMs || undefined,
            observeReason: slot?.observeReason || reason,
            condition: slot?.condition || reason,
          };
        });

        setTradingSessionStatus(status);
        setTradingSessionUpdatedTs(Date.now());
        if (nextQueue.length) {
          const sid = String(selectedTradingSessionId || activeTradingSessionId || "").trim();
          const chain = String(activeGridChainKey || DEFAULT_CHAIN || "").toUpperCase().trim();
          const normalizedHoldQueue = nextQueue.map((slot, idx) => ({
            ...slot,
            session_id: getTradingSlotSessionId(slot) || sid || slot.session_id,
            sessionId: getTradingSlotSessionId(slot) || sid || slot.sessionId,
            trade_session_id: getTradingSlotSessionId(slot) || sid || slot.trade_session_id,
            chain: String(slot?.chain || slot?.chain_key || chain || "").toUpperCase(),
            chain_key: String(slot?.chain || slot?.chain_key || chain || "").toUpperCase(),
            slot: slot?.slot || slot?.slot_id || idx + 1,
          }));
          setTradingExecutionQueue((prev) => {
            const existing = Array.isArray(prev) ? prev : [];
            const kept = existing.filter((slot) => {
              const slotSession = String(getTradingSlotSessionId(slot) || "").trim();
              const slotChain = String(slot?.chain || slot?.chain_key || "").toUpperCase().trim();
              if (sid && slotSession === sid && (!chain || slotChain === chain)) return false;
              return true;
            });
            return dedupeTradingQueue([...kept, ...normalizedHoldQueue]);
          });
        }
        updateTradingPreparedSession({
          status,
          executionQueue: nextQueue,
          hydratedFromHoldState: true,
          releaseRequired: status === "RELEASE_REQUIRED",
        });
      })
      .catch(() => {});
  }, [gridMode, selectedTradingSessionId, activeTradingSessionId, activeGridChainKey, getTradingSlotSessionId, dedupeTradingQueue, setTradingExecutionQueue, setTradingSessionStatus, setTradingSessionUpdatedTs, updateTradingPreparedSession]);

  const applyTradingRiskPreset = useCallback((mode, confidence = tradingConfidenceMin) => {
    const risk = String(mode || "BALANCED").toUpperCase();
    const conf = String(confidence || "MEDIUM").toUpperCase();

    const presets = {
      DEFENSIVE: { caution: 2, hard: 8, profit: 12, slip: 0.7, trades: 3 },
      BALANCED: { caution: 3, hard: 12, profit: 20, slip: 1.2, trades: 6 },
      DYNAMIC: { caution: 5, hard: 18, profit: 28, slip: 1.8, trades: 10 },
    };

    const confidenceAdjust = {
      LOW: { caution: 1, hard: 2, profit: 4, slip: 0.4, trades: 2 },
      MEDIUM: { caution: 0, hard: 0, profit: 0, slip: 0, trades: 0 },
      HIGH: { caution: -1, hard: -2, profit: -4, slip: -0.3, trades: -2 },
    };

    const base = presets[risk] || presets.BALANCED;
    const adj = confidenceAdjust[conf] || confidenceAdjust.MEDIUM;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    setTradingRiskMode(risk);
    setTradingConfidenceMin(conf);
    setTradingCautionDrawdownPct(String(clamp(base.caution + adj.caution, 1, 8)));
    setTradingHardStopPct(String(clamp(base.hard + adj.hard, 5, 25)));
    setTradingProfitLockPct(String(clamp(base.profit + adj.profit, 8, 40)));
    setTradingMaxSlippagePct(String(clamp(Number((base.slip + adj.slip).toFixed(1)), 0.3, 3)));
    setTradingMaxTrades(String(clamp(base.trades + adj.trades, 1, 15)));
  }, [
    tradingConfidenceMin,
    setTradingRiskMode,
    setTradingConfidenceMin,
    setTradingCautionDrawdownPct,
    setTradingHardStopPct,
    setTradingProfitLockPct,
    setTradingMaxSlippagePct,
    setTradingMaxTrades,
  ]);

  const handleTradingRiskModeChange = useCallback((value) => {
    applyTradingRiskPreset(value, tradingConfidenceMin);
  }, [applyTradingRiskPreset, tradingConfidenceMin]);

  const handleTradingConfidenceChange = useCallback((value) => {
    applyTradingRiskPreset(tradingRiskMode, value);
  }, [applyTradingRiskPreset, tradingRiskMode]);





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
  const [aiGridAssistState, setAiGridAssistState] = useState({ active: false, preset: "", slippage: "", note: "" });
  const [aiGridManualOverride, setAiGridManualOverride] = useState(false);
  const aiGridAssistKeyRef = useRef("");
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


  const renderPayoutAssetSelector = (label = "Payout asset") => (
    <div className="formRow">
      <label>{label}</label>
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
                gap: 8,
                fontWeight: 800,
                boxShadow: payoutMenuOpen ? "0 0 12px rgba(34,197,94,.22)" : "none",
              }}
            >
              <span>{extraPayoutAssets.includes(String(manualPayoutAsset || "").toUpperCase()) ? String(manualPayoutAsset || "").toUpperCase() : "More assets"}</span>
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
                        padding: "8px 10px",
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
    </div>
  );
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

  const [aiKind, setAiKind] = useState("research");
  const aiProfile = "balanced";
const [aiQuestion, setAiQuestion] = useState("");
  
  const [aiFollowUp, setAiFollowUp] = useState(false);
  const [aiHistory, setAiHistory] = useState([]); // [{role:"user"|"assistant", content:string}]
const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [strategistBridge, setStrategistBridge] = useState(null);
  const [strategistRotationCandidates, setStrategistRotationCandidates] = useState([]);
  const [strategistAppliedOpen, setStrategistAppliedOpen] = useState(false);

  // watch snapshot polling
  const inflightWatch = useRef(false);
  const watchRefreshQueued = useRef(false);
  const watchRetryRef = useRef({ key: "", n: 0, t: null });

  const fillMissingWatchMarketData = useCallback(async (rowsArg, itemsArg) => {
    const rows = Array.isArray(rowsArg) ? rowsArg : [];
    const items = Array.isArray(itemsArg) ? itemsArg : [];
    // Mobile can have price/volume cached while Market Cap is still missing.
    // So we hydrate rows when either price OR Market Cap is incomplete.
    const marketMissing = rows.filter((r) => {
      const mode = String(r?.mode || "market").toLowerCase();
      const p = Number(r?.price);
      const mcRaw = r?.marketCap ?? r?.market_cap ?? r?.mcap ?? r?.marketcap;
      const mc = Number(mcRaw);
      return mode === "market" && ((!Number.isFinite(p) || p <= 0) || !Number.isFinite(mc) || mc <= 0);
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
          include_market_cap: "true",
        }).toString();
        const cg = await api(`/api/coingecko/simple_price?${qs}`, { method: "GET", token, wallet });
        for (const [id, data] of Object.entries(cg || {})) {
          const p = Number(data?.usd);
          if (!Number.isFinite(p) || p <= 0) continue;
          marketById[String(id || "").toLowerCase()] = {
            price: p,
            change24h: Number(data?.usd_24h_change),
            volume24h: Number(data?.usd_24h_vol),
            marketCap: Number(data?.usd_market_cap),
            market_cap: Number(data?.usd_market_cap),
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
      const curMc = Number(row?.marketCap ?? row?.market_cap ?? row?.mcap ?? row?.marketcap);
      const needsPrice = !Number.isFinite(cur) || cur <= 0;
      const needsMcap = !Number.isFinite(curMc) || curMc <= 0;
      if (!needsPrice && !needsMcap) return row;

      const item = itemBySym.get(sym);
      const cgId = String(row?.coingecko_id || row?.id || item?.coingecko_id || item?.id || "").trim().toLowerCase();
      const exact = (cgId && marketById[cgId]) ? marketById[cgId] : null;
      const fallback = exact || (nativeMap[sym] ? { price: nativeMap[sym], source: "native-fallback" } : null) || otherMap[sym];

      const p = Number(fallback?.price);
      const nextPrice = Number.isFinite(p) && p > 0 ? p : cur;
      const fbMc = Number(fallback?.marketCap ?? fallback?.market_cap ?? fallback?.usd_market_cap);
      const nextMcap = Number.isFinite(fbMc) && fbMc > 0 ? fbMc : (Number.isFinite(curMc) && curMc > 0 ? curMc : null);
      if ((!Number.isFinite(nextPrice) || nextPrice <= 0) && nextMcap == null) return row;

      changed = true;
      const ch24 = Number.isFinite(Number(fallback?.change24h)) ? Number(fallback.change24h) : row?.change24h ?? row?.chg_24h ?? null;
      const v24 = Number.isFinite(Number(fallback?.volume24h)) ? Number(fallback.volume24h) : row?.volume24h ?? row?.vol ?? null;

      return {
        ...row,
        coingecko_id: row?.coingecko_id || row?.id || cgId || undefined,
        id: row?.id || row?.coingecko_id || cgId || undefined,
        price: nextPrice,
        change24h: ch24,
        chg_24h: ch24,
        volume24h: v24,
        vol: v24,
        marketCap: nextMcap,
        market_cap: nextMcap,
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
      const wa = resolveWalletAddress(wallet);
      const snapPath = wa ? `/api/watchlist/snapshot?wallet=${encodeURIComponent(wa)}&wallet_address=${encodeURIComponent(wa)}` : "/api/watchlist/snapshot";
      const r = await api(snapPath, { method: "POST", token, wallet: wa || wallet, body: { wallet: wa || wallet, wallet_address: wa || wallet, items: (itemsOverride ?? watchItems) } });
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
  useInterval(syncWatchlistFromServer, 120000, !!wallet);
  useInterval(syncAppStateFromServer, 120000, !!wallet);

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

  // Normal market/watchlist refresh:
  // Keep this slower than Grid execution. It updates prices, 24h data and mini charts.
  // fetchWatchSnapshot already has an in-flight guard, so it will not stack requests.
  useInterval(
    () => fetchWatchSnapshot(null, { force: true, user: false }),
    30000,
    !!wallet && Array.isArray(watchItems) && watchItems.length > 0
  );

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

  // Compare/history refresh: keep charts reasonably fresh without hammering backend/CoinGecko.
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

      // /api/grid/init returns backend vault_state with backend field names
      // (vault_balance, vault_balance_wei). The UI reads the historical frontend
      // fields (polBalance, polBalanceWei), so normalize here. Otherwise a real
      // on-chain vault balance can show as 0 in Grid Trader until a separate
      // /api/vault/state refresh happens.
      if (r?.vault_state) {
        const vs = r.vault_state || {};
        const rawBal = vs.vault_balance ?? vs.polBalance ?? vs.nativeBalance ?? null;
        const rawWei = vs.vault_balance_wei ?? vs.polBalanceWei ?? vs.nativeBalanceWei ?? null;
        const rawHeldBal = vs.heldTokenBal ?? vs.held_token_bal ?? null;
        const rawHeldWei = vs.heldTokenBalWei ?? vs.held_token_bal_wei ?? null;
        setVaultState((prev) => ({
          ...(prev || {}),
          ...(vs || {}),
          polBalance: rawBal != null ? (Number(rawBal) || 0) : (Number(prev?.polBalance) || 0),
          polBalanceWei: rawWei != null ? hexToBigInt(rawWei) : (prev?.polBalanceWei ?? null),
          heldToken: vs.heldToken ?? vs.held_token ?? prev?.heldToken ?? null,
          heldTokenBal: rawHeldBal != null ? (Number(rawHeldBal) || 0) : (Number(prev?.heldTokenBal) || 0),
          heldTokenBalWei: rawHeldWei != null ? hexToBigInt(rawHeldWei) : (prev?.heldTokenBalWei ?? null),
          inCycle: !!(vs.inCycle ?? vs.in_cycle ?? prev?.inCycle),
          operatorEnabled: !!(vs.operatorEnabled ?? vs.operator_enabled ?? prev?.operatorEnabled),
        }));
      }

      setTimeout(() => { try { refreshVaultState(srvChain || activeGridChainKey || "", { force: true }); } catch (_) {} }, 300);
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

const gridOrdersFetchGuardRef = useRef({ key: "", ts: 0, inflight: false });

const fetchGridOrders = useCallback(async (opts = {}) => {
  // Hard request-storm guard. This function is called from several places
  // (initial load, manual refresh, intervals, grid actions). Keep the guard here
  // so every caller is protected, even if React re-renders quickly.
  const force = !!(opts && opts.force);
  const nowMs = Date.now();
  const requestKey = `${String(gridItemId || "")}|${String(activeGridChainKey || "")}|${String(walletAddress || "")}`;
  const guard = gridOrdersFetchGuardRef.current || { key: "", ts: 0, inflight: false };
  const openNow = (Array.isArray(gridOrders) ? gridOrders : []).some((o) => String(o?.status || "").toUpperCase() === "OPEN");
  const minGapMs = openNow ? 15000 : 60000;
  if (guard.inflight) return;
  if (!force && guard.key === requestKey && nowMs - Number(guard.ts || 0) < minGapMs) return;

  // Only fetch when wallet + backend grid context are ready.
  // Do not require the backend auth token here: api() can fall back to API key + wallet header,
  // and requiring token caused empty grid state after refresh on some devices until auth finished.
  if (!gridUiHydrated || !gridItemId || !walletAddress) return;

  gridOrdersFetchGuardRef.current = { key: requestKey, ts: nowMs, inflight: true };
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
    // Browser/timeout aborts are transient. Keep current grid state and do not show a red error box.
    const msg = String(e?.message || e || "");
    if (
      e?.name === "AbortError" ||
      msg.toLowerCase().includes("abort") ||
      msg.toLowerCase().includes("signal is aborted")
    ) {
      return;
    }
    // Keep existing orders on real backend errors; surface message.
    setErrorMsg(`Grid orders: ${msg || "temporary backend error"}`);
  } finally {
    const cur = gridOrdersFetchGuardRef.current || {};
    gridOrdersFetchGuardRef.current = { ...cur, inflight: false };
  }
}, [gridUiHydrated, gridItemId, activeGridChainKey, walletAddress, token, normalizeGridOrders, gridItem, refreshVaultState, gridOrders]);

// Auto-load orders as soon as wallet/auth becomes ready (e.g. after refresh)
useEffect(() => {
  if (!isGridReady) return;
  fetchGridOrders();
}, [isGridReady, fetchGridOrders]);

const kickGridRefresh = useCallback(() => {
  try { fetchGridOrders({ force: true }); } catch (_) {}
}, [fetchGridOrders]);

const hasOpenGridOrders = useMemo(
  () => (gridOrders || []).some((o) => String(o?.status || "").toUpperCase() === "OPEN"),
  [gridOrders]
);

const gridUiActive = ["grid", "trading"].includes(String(gridMode || "").toLowerCase());
const gridPollingAllowed =
  gridUiActive &&
  !!isGridReady &&
  !!gridItemId &&
  !!walletAddress &&
  !gridBusy.start &&
  !gridBusy.stop &&
  !gridBusy.add &&
  !gridBusy.stopOrderId &&
  !gridBusy.deleteOrderId &&
  !(typeof document !== "undefined" && document.hidden);

// Grid order-state refresh:
// - active/open orders: fast enough for trader UI
// - no open orders: slower background refresh
useInterval(
  () => {
    fetchGridOrders();
  },
  hasOpenGridOrders ? 45000 : 180000,
  gridPollingAllowed
);

// Execute polling: this is the real trigger that makes BUY/SELL fire.
// It only runs while at least one order is OPEN.
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
  45000,
  gridPollingAllowed && hasOpenGridOrders
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


  const activeGridNativeUsd = useMemo(() => {
    const px = Number(walletPx?.native?.[activeGridChainSymbol]);
    return Number.isFinite(px) && px > 0 ? px : null;
  }, [walletPx, activeGridChainSymbol]);

  const getNexusOrderPriceUsd = useCallback((symbol) => {
    const sym = String(symbol || "").toUpperCase().trim();
    if (!sym) return 0;
    try {
      const rows = Array.isArray(watchRows) ? watchRows : [];
      const row = rows.find((r) => String(r?.symbol || r?.coin || r?.id || "").toUpperCase() === sym);
      const candidates = [
        row?.price,
        row?.priceUsd,
        row?.usd,
        row?.current_price,
        row?.currentPrice,
        row?.market_data?.current_price?.usd,
      ];
      for (const v of candidates) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) return n;
      }
    } catch (_) {}
    const activePx = Number(activeGridNativeUsd || 0);
    return Number.isFinite(activePx) && activePx > 0 ? activePx : 0;
  }, [watchRows, activeGridNativeUsd]);

  const resolveFundingBeforeOrder = useCallback(async ({ source, chain, symbol, side = "BUY", priceUsd, qty, budgetUsd, meta = {}, fundingApproved = false, fundingSourceAsset = "", pendingKind = "CORE" }) => {
    if (fundingApproved) return true;
    try {
      const src = String(source || "GRID").toUpperCase();
      const ch = String(chain || activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
      const sym = String(symbol || "").toUpperCase();
      const px = Number(priceUsd || 0);
      const q = Number(qty || 0);
      const usd = Number(budgetUsd || (px * q) || 0);
      if (!walletAddress || !token || !sym || !(usd > 0) || !(px > 0) || !(q > 0)) return true;

      const report = await api("/api/nexus/funding/resolve", {
        method: "POST",
        token,
        wallet: walletAddress,
        body: {
          wallet: walletAddress,
          wallet_address: walletAddress,
          item: `${ch}:${sym}`,
          item_id: `${ch}:${sym}`,
          chain: ch,
          symbol: sym,
          side: String(side || "BUY").toUpperCase(),
          price: px,
          qty: q,
          amountUsd: usd,
          budgetUsd: usd,
          nativePriceUsd: Number(activeGridNativeUsd || 0),
          source: src,
          ...meta,
        },
      });

      if (report?.funding_required) {
        setFundingPrompt({
          source: src,
          chain: ch,
          symbol: sym,
          side: String(side || "BUY").toUpperCase(),
          budgetUsd: usd,
          priceUsd: px,
          qty: q,
          message: report?.message || `Not enough ${ch} available.`,
          shortageUsd: Number(report?.shortageUsd || 0),
          shortageNative: Number(report?.shortageNative || 0),
          suggestions: Array.isArray(report?.suggestions) ? report.suggestions : [],
          pending: { kind: pendingKind, source: src, chain: ch, symbol: sym, side, budgetUsd: usd, priceUsd: px, qty: q, meta },
          ts: Date.now(),
        });
        return false;
      }
      return true;
    } catch (e) {
      if (e?.status === 409 && e?.data?.funding) {
        const report = e.data.funding;
        const src = String(source || "GRID").toUpperCase();
        const ch = String(chain || activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
        const sym = String(symbol || "").toUpperCase();
        setFundingPrompt({
          source: src,
          chain: ch,
          symbol: sym,
          side: String(side || "BUY").toUpperCase(),
          budgetUsd: Number(budgetUsd || 0),
          priceUsd: Number(priceUsd || 0),
          qty: Number(qty || 0),
          message: report?.message || `Not enough ${ch} available.`,
          shortageUsd: Number(report?.shortageUsd || 0),
          shortageNative: Number(report?.shortageNative || 0),
          suggestions: Array.isArray(report?.suggestions) ? report.suggestions : [],
          pending: { kind: pendingKind, source: src, chain: ch, symbol: sym, side, budgetUsd, priceUsd, qty, meta },
          ts: Date.now(),
        });
        return false;
      }
      // Funding resolver is a safety helper. If it is unavailable, do not hard-freeze the UI;
      // the backend add endpoint still performs its own funding check.
      return true;
    }
  }, [api, token, walletAddress, activeGridChainKey, activeGridNativeUsd]);

  const addCoreOrderFromModule = useCallback(async ({ source, chain, symbol, side = "BUY", budgetUsd, priceUsd, meta = {}, fundingApproved = false, fundingSourceAsset = "" }) => {
    setErrorMsg("");
    if (!token) return setErrorMsg("");
    if (!requirePro("Placing a new order")) return;
    if (gridBusy.add) return;
    const src = String(source || "MANUAL").toUpperCase();
    const ch = String(chain || activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase().trim();
    const sym = String(symbol || "").toUpperCase().trim();
    if (!sym) return setErrorMsg(`${src}: select an asset first.`);
    const usd = Number(String(budgetUsd ?? "").replace(",", "."));
    if (!Number.isFinite(usd) || usd <= 0) return setErrorMsg(`${src}: set a budget > 0.`);
    const px = Number(priceUsd || getNexusOrderPriceUsd(sym));
    if (!Number.isFinite(px) || px <= 0) return setErrorMsg(`${src}: price unavailable for ${sym}.`);
    const qty = usd / px;
    if (!Number.isFinite(qty) || qty <= 0) return setErrorMsg(`${src}: invalid quantity.`);

    const fundingOk = await resolveFundingBeforeOrder({
      source: src, chain: ch, symbol: sym, side, priceUsd: px, qty, budgetUsd: usd, meta, fundingApproved, fundingSourceAsset, pendingKind: "CORE"
    });
    if (!fundingOk) return;

    setGridBusy((st) => ({ ...st, add: true }));
    try {
      const itemId = `${ch}:${sym}`;
      const slippagePct = src === "ROTATION"
        ? Number(String(rotationMaxSlippage || "1").replace(",", "."))
        : src === "TRADING"
          ? Number(String(tradingMaxSlippagePct || "1").replace(",", "."))
          : Number(manualSlippagePct || 5);
      const deadlineMin = Number(manualDeadlineMin || 20);
      const clientOrderId = `${src.toLowerCase()}_${ch}_${sym}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const body = {
        item: itemId,
        item_id: itemId,
        addr: walletAddress || undefined,
        wallet: walletAddress || undefined,
        chain: ch,
        side: String(side || "BUY").toUpperCase(),
        price: px,
        qty,
        source: src,
        origin_module: src === "ROTATION" ? "nexus_rotation" : src === "TRADING" ? "nexus_trading" : "nexus_grid",
        client_order_id: clientOrderId,
        payout_asset: String(manualPayoutAsset || "USDC").toUpperCase(),
        payoutAsset: String(manualPayoutAsset || "USDC").toUpperCase(),
        settlement_mode: "swap_on_fill_hold_until_withdraw",
        slippage_bps: Math.round(Math.max(0.1, Math.min(20, Number.isFinite(slippagePct) ? slippagePct : 1)) * 100),
        deadline_sec: Math.floor(Math.max(5, Math.min(120, Number.isFinite(deadlineMin) ? deadlineMin : 20)) * 60),
        nativePriceUsd: Number(activeGridNativeUsd || 0),
        funding_approved: !!fundingApproved,
        funding_source_asset: String(fundingSourceAsset || "").toUpperCase(),
        ...meta,
      };

      const r = await api("/api/grid/manual/add", { method: "POST", token, wallet: walletAddress, body });
      const savedOrder = r?.order || null;
      setGridChain(ch);
      setGridItem(sym);
      if (savedOrder) {
        const normalized = normalizeGridOrders([{ ...savedOrder, item: itemId, item_id: itemId, chain: ch }]);
        setGridOrders((prev) => {
          const keep = (prev || []).filter((o) => String(o?.id || o?.order_id || "") !== String(savedOrder.id || savedOrder.order_id || ""));
          return [...keep, ...normalized];
        });
      }
      applyGridMetaResponse(r, itemId);
      setGridVaultStats((prev) => getGridVaultStatsFromResponse(r, prev));
      setTimeout(() => { try { fetchGridOrders({ force: true }); } catch (_) {} }, 800);
      setErrorMsg(`${src} order added: ${String(side || "BUY").toUpperCase()} ${sym} with ${fmtUsd(usd)} budget.`);
    } catch (e) {
      setErrorMsg(`${src} add order: ${e?.message || e}`);
    } finally {
      setGridBusy((st) => ({ ...st, add: false }));
    }
  }, [
    token,
    walletAddress,
    gridBusy.add,
    activeGridChainKey,
    activeGridNativeUsd,
    getNexusOrderPriceUsd,
    resolveFundingBeforeOrder,
    rotationMaxSlippage,
    tradingMaxSlippagePct,
    manualSlippagePct,
    manualDeadlineMin,
    manualPayoutAsset,
    requirePro,
    api,
    normalizeGridOrders,
    applyGridMetaResponse,
    getGridVaultStatsFromResponse,
    fetchGridOrders,
    setGridChain,
    setGridItem,
    setGridOrders,
    setGridVaultStats,
    setErrorMsg,
  ]);

  const continueWithFundingSuggestion = useCallback(async (suggestion) => {
    const p = fundingPrompt?.pending;
    if (!p) return;
    const asset = String(suggestion?.asset || fundingPrompt?.suggestions?.[0]?.asset || "").toUpperCase();
    setFundingPrompt(null);
    if (p.kind === "MANUAL") {
      await addManualOrder({ fundingApproved: true, fundingSourceAsset: asset });
      return;
    }
    await addCoreOrderFromModule({
      source: p.source,
      chain: p.chain,
      symbol: p.symbol,
      side: p.side,
      budgetUsd: p.budgetUsd,
      priceUsd: p.priceUsd,
      meta: p.meta || {},
      fundingApproved: true,
      fundingSourceAsset: asset,
    });
  }, [fundingPrompt, addCoreOrderFromModule]);

  const renderFundingPrompt = useCallback((moduleName = "GRID") => {
    const fp = fundingPrompt;
    if (!fp) return null;
    const src = String(fp.source || "").toUpperCase();
    const mod = String(moduleName || "").toUpperCase();
    if (src && mod && src !== mod) return null;
    const suggestions = Array.isArray(fp.suggestions) ? fp.suggestions : [];
    return (
      <div
        style={{
          padding: "9px 10px",
          borderRadius: 12,
          border: "1px solid rgba(245,193,108,.34)",
          background: "rgba(245,193,108,.08)",
          display: "grid",
          gap: 8,
          marginTop: 8,
        }}
      >
        <div style={{ color: "#f5c16c", fontWeight: 900, fontSize: 13 }}>
          Funding needed · {fp.symbol} / {fp.chain}
        </div>
        <div className="muted tiny">
          {fp.message || "Not enough direct asset available."} {fp.shortageUsd > 0 ? `Shortage about ${fmtUsd(fp.shortageUsd)}.` : ""}
        </div>
        {suggestions.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((sug, i) => (
              <button key={`${sug.asset || "asset"}-${i}`} type="button" className="miniBtn" onClick={() => continueWithFundingSuggestion(sug)}>
                Use {String(sug.asset || "asset").toUpperCase()}
              </button>
            ))}
            <button type="button" className="miniBtn" onClick={() => setFundingPrompt(null)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="miniBtn" onClick={() => setFundingPrompt(null)}>Close</button>
          </div>
        )}
      </div>
    );
  }, [fundingPrompt, continueWithFundingSuggestion]);

  const getRotationPreflight = useCallback(() => {
    const amount = Number(String(rotationBudgetRelease || "").replace(",", "."));
    const fallbackChain = String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    const native = fallbackChain === "BNB" ? "BNB" : fallbackChain === "ETH" ? "ETH" : "POL";

    const pick = rotationSelectedPick && typeof rotationSelectedPick === "object" ? rotationSelectedPick : {};
    const candidate = Array.isArray(strategistRotationCandidates)
      ? strategistRotationCandidates.find((c) => String(c?.rank || "").toUpperCase() !== "AVOID")
      : null;
    const watchFallback = Array.isArray(watchRows)
      ? watchRows.find((r) => String(r?.symbol || "").trim())
      : null;

    const sourceSymbol = String(
      pick.coin ||
      pick.source ||
      candidate?.sym ||
      candidate?.symbol ||
      watchFallback?.symbol ||
      gridItem ||
      native
    ).toUpperCase().trim();

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

    let resolvedChain = String(pick.chain || "").toUpperCase();
    let resolvedSymbol = String(pick.coin || "").toUpperCase();

    if (!resolvedSymbol && sourceSymbol === "BTC") {
      const resolved = chooseFirstAvailable([
        { chain: "ETH", coin: "WBTC" },
        { chain: "BNB", coin: "BTCB" },
        { chain: "BNB", coin: "WBTC" },
        { chain: "POL", coin: "WBTC" },
      ]);
      resolvedChain = resolved?.chain || resolvedChain;
      resolvedSymbol = resolved?.coin || "WBTC";
    } else if (!resolvedSymbol && sourceSymbol === "SOL") {
      const resolved = chooseFirstAvailable([
        { chain: "ETH", coin: "WSOL" },
        { chain: "BNB", coin: "WSOL" },
        { chain: "POL", coin: "WSOL" },
      ]);
      resolvedChain = resolved?.chain || resolvedChain;
      resolvedSymbol = resolved?.coin || "WSOL";
    }

    if (!resolvedSymbol) resolvedSymbol = sourceSymbol || native;
    if (!resolvedChain) {
      for (const chain of Object.keys(coinsByChain || {}).map((x) => String(x || "").toUpperCase())) {
        if (hasCoinOnChain(chain, resolvedSymbol)) {
          resolvedChain = chain;
          break;
        }
      }
    }
    if (!resolvedChain) resolvedChain = fallbackChain;

    const amountOk = Number.isFinite(amount) && amount > 0;
    const symbolOk = Boolean(resolvedSymbol);
    return {
      ok: amountOk && symbolOk,
      amount,
      amountOk,
      chain: resolvedChain,
      symbol: resolvedSymbol,
      source: pick.source || candidate?.sym || watchFallback?.symbol || gridItem || native,
      selected: Boolean(pick?.ok),
      score: pick.score ?? candidate?.score ?? watchFallback?.score,
      message: !amountOk
        ? "Enter a Rotation budget first."
        : pick?.ok
          ? `Ready: ${resolvedSymbol} on ${resolvedChain}.`
          : `Ready with fallback: ${resolvedSymbol} on ${resolvedChain}. You can still select a recommendation for more precision.`,
    };
  }, [rotationBudgetRelease, activeGridChainKey, rotationSelectedPick, strategistRotationCandidates, watchRows, gridItem, gridWalletCoinsByChain]);

  const addRotationOrder = useCallback(async () => {
    const pick = rotationSelectedPick || {};
    const preflight = getRotationPreflight();
    if (!preflight.ok) {
      setRotationBackendMsg(preflight.message || "Rotation preflight is not ready.");
      return;
    }
    const chain = preflight.chain;
    const symbol = preflight.symbol;
    await addCoreOrderFromModule({
      source: "ROTATION",
      chain,
      symbol,
      side: "BUY",
      budgetUsd: rotationBudgetRelease,
      priceUsd: getNexusOrderPriceUsd(symbol),
      meta: {
        strategy_id: `rotation_${chain}_${symbol}`,
        rotation_score: pick.score ?? preflight.score,
        rotation_mode: rotationMode,
        risk_limit_pct: rotationRiskLimit,
        min_net_advantage_pct: rotationMinNetAdvantage,
        session_id: activeRotationSessionId || makeNexusSessionId("ROT"),
        rotation_session_id: activeRotationSessionId || "",
        preflight_fallback_used: !preflight.selected,
        preflight_source: preflight.source,
      },
    });
  }, [rotationSelectedPick, rotationBudgetRelease, getRotationPreflight, getNexusOrderPriceUsd, rotationMode, rotationRiskLimit, rotationMinNetAdvantage, activeRotationSessionId, makeNexusSessionId, addCoreOrderFromModule]);

  const addTradingOrder = useCallback(async () => {
    const chains = String(tradingAllowedChains || activeGridChainKey || DEFAULT_CHAIN || "POL").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
    const assets = String(tradingAllowedAssets || gridItem || chains[0] || "POL").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
    const chain = chains[0] || String(activeGridChainKey || DEFAULT_CHAIN || "POL").toUpperCase();
    const symbol = assets[0] || chain;
    await addCoreOrderFromModule({
      source: "TRADING",
      chain,
      symbol,
      side: "BUY",
      budgetUsd: tradingBudgetUsd,
      priceUsd: getNexusOrderPriceUsd(symbol),
      meta: {
        strategy_id: `trading_${chain}_${symbol}_${String(tradingStyle || "TACTICAL").toLowerCase()}`,
        session_id: activeTradingSessionId || makeNexusSessionId("TRDORDER"),
        trade_session_id: activeTradingSessionId || "",
        trading_style: tradingStyle,
        trading_runtime_hours: tradingRuntimeHours,
        trading_hold_hours: clampTradingHoldHours(tradingHoldHours),
        trading_observe_max_hours: 12,
        trading_risk_mode: tradingRiskMode,
        caution_drawdown_pct: tradingCautionDrawdownPct,
        hard_stop_pct: tradingHardStopPct,
        profit_lock_pct: tradingProfitLockPct,
        max_trades: tradingMaxTrades,
        budget_splits: parseTradingBudgetSplits(tradingBudgetSplitInput, tradingBudgetUsd),
        execution_queue: tradingExecutionQueue,
      },
    });
  }, [tradingAllowedChains, tradingAllowedAssets, activeGridChainKey, gridItem, tradingBudgetUsd, tradingBudgetSplitInput, tradingExecutionQueue, parseTradingBudgetSplits, getNexusOrderPriceUsd, tradingStyle, tradingRuntimeHours, tradingHoldHours, clampTradingHoldHours, tradingRiskMode, tradingCautionDrawdownPct, tradingHardStopPct, tradingProfitLockPct, tradingMaxTrades, activeTradingSessionId, makeNexusSessionId, addCoreOrderFromModule]);

  async function addManualOrder(opts = {}) {
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
        source: "GRID",
        origin_module: "nexus_grid",
        client_order_id: `grid_${String(activeGridChainKey || DEFAULT_CHAIN).toLowerCase()}_${String(gridItem || "asset").toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };

      
// Qty-only: all coins/tokens are entered as quantity (also USDC/USDT)
const qty = manualQty === "" ? undefined : Number(manualQty);
if (qty === undefined || !Number.isFinite(qty) || qty <= 0) throw new Error("Invalid Qty amount.");
body.qty = qty;
body.nativePriceUsd = Number(activeGridNativeUsd || 0);
body.funding_approved = !!opts.fundingApproved;
body.funding_source_asset = String(opts.fundingSourceAsset || "").toUpperCase();

const manualFundingOk = await resolveFundingBeforeOrder({
  source: "GRID",
  chain: String(activeGridChainKey || DEFAULT_CHAIN).toUpperCase(),
  symbol: String(gridItem || "").toUpperCase(),
  side: manualSide,
  priceUsd: price,
  qty,
  budgetUsd: price * qty,
  meta: { payout_asset: String(manualPayoutAsset || "USDC").toUpperCase() },
  fundingApproved: !!opts.fundingApproved,
  fundingSourceAsset: String(opts.fundingSourceAsset || "").toUpperCase(),
  pendingKind: "MANUAL",
});
if (!manualFundingOk) {
  setGridBusy((s) => ({ ...s, add: false }));
  return;
}

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
// Duplicate slow fallback disabled: the main grid order-state refresh above already
// handles the no-open-orders case at a slower cadence.
useInterval(fetchGridOrders, 30000, false);

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



  const getLivePriceForSymbol = useCallback((sym) => {
    const S = String(sym || "").toUpperCase().trim();
    if (!S) return null;

    const rows = Array.isArray(watchRows) ? watchRows : [];
    const row = rows.find((x) => String(x?.symbol || "").toUpperCase().trim() === S);
    const pxRow = Number(row?.price);
    if (Number.isFinite(pxRow) && pxRow > 0) return pxRow;

    const pxNative = Number(gridNativeUsd?.[S]);
    if (Number.isFinite(pxNative) && pxNative > 0) return pxNative;

    if (S === String(gridItem || "").toUpperCase().trim()) {
      const pxShown = Number(shownGridPrice);
      if (Number.isFinite(pxShown) && pxShown > 0) return pxShown;
    }

    return null;
  }, [watchRows, gridNativeUsd, gridItem, shownGridPrice]);

  const parseSuggestedGridPct = useCallback((raw) => {
    const s = String(raw || "").replace(/–/g, "-");
    const nums = (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite);
    if (!nums.length) return 2;
    if (nums.length === 1) return Math.abs(nums[0]);
    return Math.abs((nums[0] + nums[1]) / 2);
  }, []);

  const deriveAiGridAssist = useCallback((data) => {
    const d = data || {};
    const modeText = String(d.mode || d.gridMode || d.grid_mode || d.setup || d.verdict || "").toUpperCase();
    const riskText = String(d.risk || d.riskView || d.risk_view || "").toUpperCase();
    const gridText = String(d.gridRange || d.range || d.suggestedGrid || "").toUpperCase();
    const behaviorText = String(d.behavior || d.behaviorRead || d.strategy || d.action || "").toUpperCase();
    const pct = parseSuggestedGridPct(gridText || "2-4%");

    let preset = "STANDARD";
    if (modeText.includes("VERY") || gridText.includes("8") || pct >= 5) {
      preset = "VERY_WIDE";
    } else if (modeText.includes("WIDE") || pct >= 2.5 || behaviorText.includes("VOLATILITY")) {
      preset = "WIDE";
    } else if (modeText.includes("FAST") || pct <= 1) {
      preset = "FAST";
    }

    let slippage = 5;
    if (preset === "VERY_WIDE" || riskText.includes("HIGH")) slippage = 8;
    else if (preset === "WIDE" || riskText.includes("MEDIUM")) slippage = 6;
    else if (preset === "FAST") slippage = 3;

    const note = `AI Assist: ${preset.replace("_", " ")} / ${slippage}% slippage`;
    return { preset, slippage, note };
  }, [parseSuggestedGridPct]);

  const openGridPanel = useCallback(() => {
    setActivePanel("vault");
    setSelectedPair(null);

    setTimeout(() => {
      try {
        setActivePanel("vault");
        const el = document.querySelector(".section-grid");
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (_) {}
    }, 80);
  }, [setActivePanel, setSelectedPair]);

  const applyAiSuggestionToGrid = useCallback((sym, side) => {
    const S = String(sym || "").toUpperCase().trim();
    const SIDE = String(side || "BUY").toUpperCase() === "SELL" ? "SELL" : "BUY";
    if (!S) return;

    const nativeChain = ["POL", "BNB", "ETH"].includes(S) ? S : "";
    const availableNow = (gridWalletCoins || []).map((x) => String(x || "").toUpperCase()).includes(S);

    // Open the Grid even if the asset cannot be applied, so the user sees the context.
    openGridPanel();

    // Native assets require switching the Grid chain first.
    if (nativeChain) {
      setGridChain(nativeChain);
      setBalActiveChain(nativeChain);
      setWsChainKey(nativeChain);
    } else if (!availableNow) {
      setErrorMsg(`${S} is not available in your Grid wallet assets on the current chain. Add the token to Wallet/Grid first, then apply again.`);
      return;
    }

    setGridItem(S);
    setManualSide(SIDE);
    setManualBuyMode("QTY");

    // Level 4 Light: AI may prefill soft grid parameters, but it never creates orders.
    const aiAssist = deriveAiGridAssist(aiExplainData);
    setManualPricePreset(aiAssist.preset);
    setManualSlippagePct(String(aiAssist.slippage));
    setAiGridManualOverride(false);
    setAiGridAssistState({ active: true, preset: aiAssist.preset, slippage: aiAssist.slippage, note: aiAssist.note });

    const pct = parseSuggestedGridPct(aiExplainData?.gridRange || aiExplainData?.range || "2-4%");
    const px = getLivePriceForSymbol(S);
    if (Number.isFinite(px) && px > 0) {
      const target = SIDE === "BUY" ? px * (1 - pct / 100) : px * (1 + pct / 100);
      setManualPrice(target.toFixed(12).replace(/\.?0+$/, ""));
    } else {
      // Price may arrive after the chain/coin switch; keep empty rather than writing a fake value.
      setManualPrice("");
    }

    setErrorMsg(`Applied ${SIDE} ${S} to Grid. Enter Qty and press Add Order when you are ready.`);
  }, [
    aiExplainData,
    getLivePriceForSymbol,
    parseSuggestedGridPct,
    gridWalletCoins,
    openGridPanel,
    setGridChain,
    setBalActiveChain,
    setWsChainKey,
    setGridItem,
    setManualSide,
    setManualBuyMode,
    setManualPrice,
    setManualPricePreset,
    setManualSlippagePct,
    deriveAiGridAssist,
    setErrorMsg,
  ]);

  const extractStrategistSymbol = useCallback((body) => {
    const text = String(body || "");
    const known = Array.from(new Set([
      ...(compareSymbols || []),
      ...(watchRows || []).map((r) => r?.symbol || r?.sym),
      ...(gridWalletCoins || []),
      gridItem,
      "BTC",
      "ETH",
      "SOL",
      "BNB",
      "POL",
    ].map((x) => String(x || "").toUpperCase().trim()).filter(Boolean)));

    const upper = text.toUpperCase();
    const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const fromKnown = known.find((sym) => sym && new RegExp(`\\b${escapeRegExp(sym)}\\b`).test(upper));
    if (fromKnown) return fromKnown;

    const generic = upper.match(/\b[A-Z0-9]{2,10}\b/g) || [];
    const blocked = new Set(["NEXUS", "GRID", "ROTATION", "MARKET", "READ", "RISK", "RVOL", "EMA", "BTCUSD", "USDC", "USDT"]);
    return generic.find((sym) => !blocked.has(sym)) || "";
  }, [compareSymbols, watchRows, gridWalletCoins, gridItem]);

  const strategistAssetRoutes = useMemo(() => {
    const routes = [];
    const enabled = Array.isArray(ENABLED_CHAINS) && ENABLED_CHAINS.length ? ENABLED_CHAINS : ["POL", "BNB", "ETH"];
    const enabledSet = new Set(enabled.map((x) => String(x || "").toUpperCase()));

    const addRoute = ({ symbol, chain, contract = "", source = "vault" }) => {
      const sym = String(symbol || "").toUpperCase().trim();
      const ck = String(chain || "").toUpperCase().trim();
      if (!sym || !ck || !enabledSet.has(ck)) return;
      routes.push({
        symbol: sym,
        chain: ck,
        contract: String(contract || "").trim(),
        source,
        isNative: sym === ck || (sym === "MATIC" && ck === "POL"),
      });
    };

    for (const chain of enabledSet) {
      addRoute({ symbol: chain, chain, contract: "native", source: "native" });
    }

    const coinsByChain = gridWalletCoinsByChain || {};
    for (const chain of Object.keys(coinsByChain || {})) {
      for (const symbol of coinsByChain[chain] || []) {
        addRoute({ symbol, chain, source: "vault_asset" });
      }
    }

    for (const chain of Object.keys(balByChain || {})) {
      const row = balByChain?.[chain] || {};
      for (const t of row?.custom || []) {
        addRoute({
          symbol: t?.symbol,
          chain,
          contract: t?.address || t?.contract || t?.tokenAddress || "",
          source: "wallet_token",
        });
      }
      for (const stable of Object.keys(row?.stables || {})) {
        addRoute({ symbol: stable, chain, source: "stable" });
      }
    }

    for (const item of watchItems || []) {
      const symbol = item?.symbol || item?.sym;
      const chain = item?.chain || item?.chainKey || item?.network;
      const contract = item?.contract || item?.tokenAddress || item?.address || "";
      if (contract && chain) addRoute({ symbol, chain, contract, source: "watchlist_contract" });
    }

    const seen = new Set();
    return routes.filter((r) => {
      const key = `${r.symbol}|${r.chain}|${String(r.contract || "").toLowerCase()}|${r.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [gridWalletCoinsByChain, balByChain, watchItems]);

  const strategistExecutionGuard = useCallback((sym, target = "grid", targetChainOverride = "") => {
    const raw = String(sym || "").toUpperCase().trim();
    const targetMode = String(target || "grid").toLowerCase();
    const currentChain = String(targetChainOverride || activeGridChainKey || gridChain || DEFAULT_CHAIN || "POL").toUpperCase();

    if (!raw) {
      return { ok: false, normalized: "", warning: "No asset symbol found for Nexus execution." };
    }

    const routesFor = (symbol) => (strategistAssetRoutes || []).filter((r) => String(r?.symbol || "").toUpperCase() === String(symbol || "").toUpperCase());
    const currentChainRoute = (routes) => routes.find((r) => String(r.chain || "").toUpperCase() === currentChain);
    const routeLabel = (routes) => routes.map((r) => `${r.symbol} on ${r.chain}${r.contract && r.contract !== "native" ? " (contract)" : ""}`).join(", ");

    const nativeMap = {
      ETH: { chain: "ETH", coin: "ETH" },
      BNB: { chain: "BNB", coin: "BNB" },
      POL: { chain: "POL", coin: "POL" },
      MATIC: { chain: "POL", coin: "POL" },
    };

    if (nativeMap[raw]) {
      const n = nativeMap[raw];
      if (targetMode === "grid" && n.chain !== currentChain) {
        return {
          ok: false,
          normalized: n.coin,
          chain: n.chain,
          warning: `${raw} is native on ${n.chain}, but Grid is currently on ${currentChain}. Switch the Grid network first, then apply again.`,
        };
      }
      return { ok: true, normalized: n.coin, chain: n.chain, warning: "" };
    }

    const wrappedSymbols = {
      BTC: ["WBTC", "BTCB"],
      SOL: ["WSOL"],
    };

    if (wrappedSymbols[raw]) {
      const wrappedRoutes = wrappedSymbols[raw].flatMap((s) => routesFor(s));
      if (!wrappedRoutes.length) {
        const needed = raw === "BTC" ? "WBTC / BTCB" : "WSOL";
        return {
          ok: false,
          normalized: needed,
          warning: `${raw} native is not executable directly in the current EVM Vault setup. Please add/fund ${needed} first, then apply again.`,
        };
      }

      const route = targetMode === "grid" ? (currentChainRoute(wrappedRoutes) || wrappedRoutes[0]) : wrappedRoutes[0];
      if (targetMode === "grid" && route.chain !== currentChain) {
        return {
          ok: false,
          normalized: route.symbol,
          chain: route.chain,
          warning: `${raw} is available as ${route.symbol} on ${route.chain}, but Grid is currently on ${currentChain}. Switch the Grid network first, then apply again.`,
        };
      }

      return {
        ok: true,
        normalized: targetMode === "rotation" ? raw : route.symbol,
        chain: route.chain,
        route,
        warning: "",
      };
    }

    const routes = routesFor(raw);
    if (!routes.length) {
      return {
        ok: false,
        normalized: raw,
        warning: `${raw} can be used on supported EVM networks, but it is not currently available in your wallet/Vault. Please fund or add ${raw} on POL, BNB, or ETH first, then apply again.`,
      };
    }

    const route = targetMode === "grid" ? (currentChainRoute(routes) || routes[0]) : routes[0];
    if (targetMode === "grid" && route.chain !== currentChain) {
      return {
        ok: false,
        normalized: raw,
        chain: route.chain,
        route,
        warning: `${raw} exists on ${route.chain} (${routeLabel(routes)}), but Grid is currently on ${currentChain}. Switch the Grid network first, then apply again.`,
      };
    }

    return {
      ok: true,
      normalized: raw,
      chain: route.chain,
      route,
      warning: "",
    };
  }, [activeGridChainKey, gridChain, strategistAssetRoutes]);

  const deriveStrategistRiskPreset = useCallback((body) => {
    const text = String(body || "").toLowerCase();
    if (text.includes("high risk") || text.includes("elevated") || text.includes("weak liquidity") || text.includes("overextended")) {
      return { confidence: "Medium", riskLimit: "3", rotationSlippage: "1.5", minAdvantage: "0.8", gridSlippage: "6", preset: "WIDE" };
    }
    if (text.includes("low risk") || text.includes("stable") || text.includes("range") || text.includes("compression")) {
      return { confidence: "Medium-High", riskLimit: "2", rotationSlippage: "1", minAdvantage: "0.5", gridSlippage: "4", preset: "STANDARD" };
    }
    return { confidence: "Medium", riskLimit: "2.5", rotationSlippage: "1.2", minAdvantage: "0.6", gridSlippage: "5", preset: "STANDARD" };
  }, []);


  const deriveStrategistTraderSetup = useCallback((body, preparedSym = "", preset = {}) => {
    const raw = String(body || "");
    const cleanAsset = (value) => String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9:_,-]/g, "")
      .replace(/,+/g, ",")
      .replace(/^,|,$/g, "");

    const cleanChains = (value) => {
      const text = String(value || "").toUpperCase();
      const found = [];
      if (/\b(POL|POLYGON|MATIC)\b/.test(text)) found.push("POL");
      if (/\b(BNB|BSC|BINANCE)\b/.test(text)) found.push("BNB");
      if (/\b(ETH|ETHEREUM)\b/.test(text)) found.push("ETH");
      return Array.from(new Set(found)).join(",") || "POL,BNB,ETH";
    };

    const pickLineValue = (keys) => {
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        const s = String(line || "").trim();
        for (const key of keys) {
          const rx = new RegExp(`${key}\\s*[:=\\-]\\s*(.+)$`, "i");
          const m = s.match(rx);
          if (m && m[1]) return m[1].trim().replace(/^[-•*]\s*/, "");
        }
      }
      return "";
    };

    const numberFrom = (value, fallback, { min = 0, max = 999, midpoint = false } = {}) => {
      const s = String(value || "");
      const range = s.match(/(-?\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(-?\d+(?:\.\d+)?)/i);
      let n = fallback;
      if (range && midpoint) n = (Number(range[1]) + Number(range[2])) / 2;
      else {
        const single = s.match(/(-?\d+(?:\.\d+)?)/);
        if (single) n = Number(single[1]);
      }
      if (!Number.isFinite(Number(n))) n = fallback;
      n = Math.max(min, Math.min(max, Number(n)));
      return `${Number.isInteger(n) ? n : Number(n.toFixed(2))}`;
    };

    const valueNumber = (keys, fallback, opts = {}) => numberFrom(pickLineValue(keys), fallback, opts);

    // Hidden Nexus Trading suitability engine.
    // This stays internal: it only shapes the prepared Trading/Risk values and does not add UI noise.
    const lowered = raw.toLowerCase();
    let suitabilityScore = 0;
    const addIf = (rx, delta) => { if (rx.test(lowered)) suitabilityScore += delta; };
    addIf(/\b(fake move|fake breakout|bull trap|bear trap|trap risk|weak breakout|failed breakout)\b/i, -3);
    addIf(/\b(weak liquidity|thin liquidity|low liquidity|illiquid|unstable liquidity)\b/i, -2);
    addIf(/\b(overextended|exhaustion|exhausted|blow[- ]?off|parabolic)\b/i, -2);
    addIf(/\b(low rvol|weak rvol|volume does not confirm|no volume confirmation|weak volume)\b/i, -2);
    addIf(/\b(high volatility|volatility spike|unstable momentum|choppy|uncertain|uncertainty)\b/i, -1);
    addIf(/\b(strong rvol|healthy rvol|volume[- ]?backed|volume confirmation|confirmed breakout)\b/i, 2);
    addIf(/\b(strong continuation|trend continuation|momentum continuation|stable trend|higher lows|clean structure)\b/i, 2);
    addIf(/\b(good liquidity|deep liquidity|stable liquidity)\b/i, 1);

    let suitability = "MEDIUM";
    const suitabilityRaw = pickLineValue(["Trading Suitability", "Nexus Trading Suitability", "Suitability"]);
    if (/\b(low|not recommended|avoid|poor)\b/i.test(suitabilityRaw)) suitability = "LOW";
    else if (/\b(high|strong|suitable)\b/i.test(suitabilityRaw)) suitability = "HIGH";
    else if (suitabilityScore <= -3) suitability = "LOW";
    else if (suitabilityScore >= 3) suitability = "HIGH";

    let riskMode = "BALANCED";
    const riskRaw = pickLineValue(["Recommended Risk Mode", "Risk Mode", "Risk"]);
    if (/\b(defensive|cautious|low risk|weak|fake|unstable|avoid)\b/i.test(riskRaw || raw)) riskMode = "DEFENSIVE";
    if (/\b(dynamic|aggressive|momentum|breakout|strong continuation|high confidence)\b/i.test(riskRaw || raw)) riskMode = "DYNAMIC";
    if (/\b(balanced|medium|normal)\b/i.test(riskRaw)) riskMode = "BALANCED";
    if (suitability === "LOW") riskMode = "DEFENSIVE";

    const styleRaw = pickLineValue(["Tactical Style", "Trading Style", "Style"]);
    let style = "TACTICAL";
    if (/\b(momentum|breakout|continuation)\b/i.test(styleRaw || raw)) style = "MOMENTUM";
    if (/\b(accumulation|accumulate)\b/i.test(styleRaw || raw)) style = "ACCUMULATION";
    if (/\b(range|grid|cycle)\b/i.test(styleRaw || raw)) style = "RANGE";
    if (/\b(rotation|relative strength)\b/i.test(styleRaw || raw)) style = "ROTATION";
    if (/\b(defensive|caution|protect)\b/i.test(styleRaw || raw)) style = "TACTICAL";

    const runtimeRaw = pickLineValue(["Runtime", "Runtime Suggestion", "Trading Runtime"]);
    let runtimeHours = numberFrom(runtimeRaw, riskMode === "DEFENSIVE" ? 6 : riskMode === "DYNAMIC" ? 24 : 12, { min: 1, max: 72, midpoint: true });
    if (/\bday|days\b/i.test(runtimeRaw)) runtimeHours = numberFrom(runtimeRaw, 1, { min: 1, max: 3, midpoint: true });
    if (/\bday|days\b/i.test(runtimeRaw)) runtimeHours = `${Math.min(72, Math.max(1, Number(runtimeHours) * 24))}`;

    let maxTrades = valueNumber(["Max Trades", "Max Trades Suggestion", "Trades"], riskMode === "DEFENSIVE" ? 2 : riskMode === "DYNAMIC" ? 8 : 4, { min: 1, max: 20, midpoint: true });
    let maxSlippagePct = valueNumber(["Max Slippage", "Max Slippage Suggestion", "Slippage"], riskMode === "DEFENSIVE" ? 0.7 : riskMode === "DYNAMIC" ? 1.5 : 1.0, { min: 0.1, max: 10, midpoint: true });

    const allowedAssetsRaw = pickLineValue(["Allowed Assets", "Assets"]);
    const allowedChainsRaw = pickLineValue(["Allowed Chains", "Chains"]);
    const assets = cleanAsset(allowedAssetsRaw) || cleanAsset(preparedSym) || "";
    const chains = cleanChains(allowedChainsRaw || raw);

    const confidenceRaw = pickLineValue(["AI Confidence", "Confidence"]);
    let confidence = "MEDIUM";
    if (/\b(high|medium-high|strong)\b/i.test(confidenceRaw || String(preset?.confidence || ""))) confidence = "HIGH";
    if (/\b(low|weak)\b/i.test(confidenceRaw || "")) confidence = "LOW";

    let cautionDrawdownPct = valueNumber(["Caution Drawdown", "Caution DD", "Drawdown"], riskMode === "DEFENSIVE" ? 2 : riskMode === "DYNAMIC" ? 4 : 3, { min: 1, max: 20, midpoint: true });
    let hardStopPct = valueNumber(["Hard Stop", "Stop"], riskMode === "DEFENSIVE" ? 8 : riskMode === "DYNAMIC" ? 15 : 12, { min: 2, max: 40, midpoint: true });
    let profitLockPct = valueNumber(["Profit Lock", "Lock"], riskMode === "DEFENSIVE" ? 10 : riskMode === "DYNAMIC" ? 25 : 20, { min: 1, max: 80, midpoint: true });

    // Background guardrails: keep UI clean, but make weak setups automatically safer.
    if (suitability === "LOW") {
      riskMode = "DEFENSIVE";
      runtimeHours = `${Math.min(Number(runtimeHours) || 6, 6)}`;
      maxTrades = `${Math.min(Number(maxTrades) || 2, 2)}`;
      maxSlippagePct = `${Math.min(Number(maxSlippagePct) || 0.7, 0.7)}`;
      cautionDrawdownPct = `${Math.min(Number(cautionDrawdownPct) || 2, 2)}`;
      hardStopPct = `${Math.min(Number(hardStopPct) || 8, 8)}`;
      profitLockPct = `${Math.min(Number(profitLockPct) || 10, 10)}`;
    } else if (suitability === "MEDIUM" && riskMode === "DYNAMIC") {
      riskMode = "BALANCED";
      maxTrades = `${Math.min(Number(maxTrades) || 4, 6)}`;
      maxSlippagePct = `${Math.min(Number(maxSlippagePct) || 1.0, 1.2)}`;
    }

    return {
      suitability,
      suitabilityScore,
      riskMode,
      style,
      runtimeHours,
      maxTrades,
      maxSlippagePct,
      cautionDrawdownPct,
      hardStopPct,
      profitLockPct,
      allowedAssets: assets,
      allowedChains: chains,
      confidence,
      schemaVersion: "strategist_trader_setup_v1",
      reason: pickLineValue(["Tactical Reason", "Reason"]) || "Strategist-derived controlled trading preparation.",
      invalidation: pickLineValue(["Invalidation", "Invalidation Conditions"]) || "Review market structure before approval.",
    };
  }, []);

  const applyStrategistToGrid = useCallback((body) => {
    const sym = extractStrategistSymbol(body);
    if (!sym) {
      setGridMode("normal");
      openGridPanel();
      setErrorMsg("No coin symbol found in the Nexus Grid card. Add a coin symbol to the task or card output first.");
      return;
    }

    // Always open Nexus Grid and prefill non-executing strategy fields.
    // Guard only blocks execution readiness, not visible preparation.
    setGridMode("normal");
    openGridPanel();

    const intendedGridChain = ["ETH", "BNB", "POL"].includes(sym)
      ? sym
      : String(activeGridChainKey || gridChain || DEFAULT_CHAIN || "POL").toUpperCase();

    const preset = deriveStrategistRiskPreset(body);
    setManualPricePreset(preset.preset);
    setManualSlippagePct(String(preset.gridSlippage));
    setAiGridAssistState({
      active: true,
      preset: preset.preset,
      slippage: preset.gridSlippage,
      note: `Strategist prepared ${preset.preset.replace("_", " ")} grid / ${preset.gridSlippage}% slippage`,
    });

    const guard = strategistExecutionGuard(sym, "grid", intendedGridChain);
    const preparedSym = guard.normalized && guard.ok ? guard.normalized : sym;

    if (!guard.ok) {
      setStrategistBridge({
        type: "blocked",
        sym: preparedSym,
        label: "Execution Guard",
        confidence: "Blocked",
        note: `${guard.warning} Grid strategy fields were still prepared; switch/add the correct EVM asset before adding any order.`,
        ts: Date.now(),
      });
      setErrorMsg(guard.warning);
      return;
    }

    setGridChain(intendedGridChain);

    setStrategistBridge({
      type: "grid",
      sym: preparedSym,
      label: "Nexus Grid",
      confidence: preset.confidence,
      note: `Prepared by Nexus Strategist. Preset ${preset.preset.replace("_", " ")} · slippage ${preset.gridSlippage}%. Review price, amount and risk before adding any order.`,
      ts: Date.now(),
    });
    applyAiSuggestionToGrid(preparedSym, "BUY");
    setErrorMsg(`Prepared ${preparedSym} in Nexus Grid. Review price, amount and risk before adding any order.`);
  }, [extractStrategistSymbol, strategistExecutionGuard, deriveStrategistRiskPreset, activeGridChainKey, gridChain, setGridMode, setGridChain, openGridPanel, setManualPricePreset, setManualSlippagePct, setAiGridAssistState, applyAiSuggestionToGrid, setErrorMsg]);

  const extractStrategistRotationCandidates = useCallback((body) => {
    const raw = String(body || "");
    const out = [];
    const seen = new Set();

    const parseNum = (value) => {
      const n = Number(String(value ?? "").replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    };

    const classifyCandidate = (spreadPct, line = "") => {
      const s = Number(spreadPct);
      const txt = String(line || "").toLowerCase();
      const saysHigh = /(confidence:\s*high|saubere rotation|clean rotation|best choice|beste wahl|strong edge)/i.test(txt);
      const saysMedium = /(confidence:\s*medium|secondary|zweite wahl|good secondary|schwache edge|weak edge)/i.test(txt);
      const saysAvoid = /(avoid|meiden|zu kleiner|too small|fake|spike|low confidence|confidence:\s*low|nicht sauber|not confirmed)/i.test(txt);

      if (saysAvoid || (Number.isFinite(s) && s < 0.5)) return "AVOID";
      if (saysHigh || (Number.isFinite(s) && s >= 2.0)) return "BEST";
      if (saysMedium || (Number.isFinite(s) && s >= 0.8)) return "SECONDARY";
      return "SECONDARY";
    };

    const rankWeight = (rank) => {
      if (rank === "BEST") return 300;
      if (rank === "SECONDARY") return 200;
      if (rank === "AVOID") return 50;
      return 100;
    };

    const add = (sym, meta = {}) => {
      const s = String(sym || "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
      if (!s || s.length < 2 || s.length > 12) return;
      if (["USD", "USDT", "USDC", "EUR", "BTCB", "WBTC", "PRICE", "SPREAD", "EXCHANGE", "BUY", "SELL"].includes(s)) return;

      const spreadPct = parseNum(meta.spreadPct);
      const sourceLine = meta.sourceLine || "";
      const rank = meta.rank || classifyCandidate(spreadPct, sourceLine);
      const score = rankWeight(rank) + (Number.isFinite(spreadPct) ? Math.min(80, Math.max(0, spreadPct * 4)) : 0);

      const item = { sym: s, ...meta, spreadPct, rank, strategistScore: score };
      if (seen.has(s)) {
        const i = out.findIndex((x) => x.sym === s);
        if (i >= 0 && Number(out[i].strategistScore || 0) < score) out[i] = item;
        return;
      }
      seen.add(s);
      out.push(item);
    };

    // Prefer bullet/list lines like "- LINK: cheaper buy..." or "- ETH: günstig..."
    raw.split(/\r?\n/).forEach((line) => {
      const s = String(line || "").trim();
      const m = s.match(/^[\-•*]\s*\*\*?([A-Z0-9]{2,12})\*\*?\s*:/i)
        || s.match(/^[\-•*]\s*([A-Z0-9]{2,12})\s*:/i);
      if (m) {
        const spread = s.match(/(?:Netto-Edge|Net edge|Differenz|difference|Spread|Premium)\s*(?:ca\.?|about|~)?\s*([+-]?\d+(?:[.,]\d+)?)\s*%/i);
        let rank = "";
        if (/(best choice|beste wahl|saubere rotation|clean rotation|confidence:\s*high)/i.test(s)) rank = "BEST";
        else if (/(avoid|meiden|zu kleiner|too small|fake|spike|confidence:\s*low)/i.test(s)) rank = "AVOID";
        else if (/(secondary|zweite wahl|weak edge|schwache edge|confidence:\s*medium)/i.test(s)) rank = "SECONDARY";
        add(m[1], { sourceLine: s, spreadPct: spread ? spread[1] : undefined, rank });
      }
    });

    // Fallback: extract bold symbols.
    if (!out.length) {
      const rx = /\*\*([A-Z0-9]{2,12})\*\*/g;
      let m;
      while ((m = rx.exec(raw))) add(m[1]);
    }

    // Last fallback: old single-symbol extractor.
    if (!out.length) {
      const one = extractStrategistSymbol(raw);
      if (one) add(one, { rank: "SECONDARY" });
    }

    return out
      .sort((a, b) => Number(b.strategistScore || 0) - Number(a.strategistScore || 0))
      .slice(0, 8);
  }, [extractStrategistSymbol]);


  const applyStrategistToRotation = useCallback((body) => {
    const candidates = extractStrategistRotationCandidates(body);
    const sym = candidates[0]?.sym || "";
    if (!sym) {
      setGridMode("rotation");
      openGridPanel();
      setStrategistRotationCandidates([]);
      setErrorMsg("No coin symbol found in the Nexus Rotation card. Add a coin symbol to the task or card output first.");
      return;
    }

    setStrategistRotationCandidates(candidates);

    // Always open Nexus Rotation and always prefill the non-executing strategy fields.
    // Guard only blocks execution readiness, not visible preparation.
    setGridMode("rotation");
    openGridPanel();

    const preset = deriveStrategistRiskPreset(body);
    const guard = strategistExecutionGuard(sym, "rotation");
    const preparedSym = guard.normalized && guard.ok ? guard.normalized : sym;

    const normalizeRotationScope = (raw) => {
      const s = String(raw || "").toUpperCase().trim();
      if (!s) return "";
      if (/\b(ETH|ETHEREUM)\b/.test(s)) return "ETH";
      if (/\b(BNB|BSC|BINANCE)\b/.test(s)) return "BNB";
      if (/\b(POL|POLYGON|MATIC)\b/.test(s)) return "POL";
      return ["ETH", "BNB", "POL"].includes(s) ? s : "";
    };

    const pickLineValue = (keys) => {
      const lines = String(body || "").split(/\r?\n/);
      for (const line of lines) {
        const s = String(line || "").trim();
        for (const key of keys) {
          const rx = new RegExp(`${key}\\s*[:=\\-]\\s*(.+)$`, "i");
          const m = s.match(rx);
          if (m && m[1]) return m[1].trim().replace(/^[-•*]\s*/, "");
        }
      }
      return "";
    };

    const scopeFromOutput = normalizeRotationScope(pickLineValue(["Allowed Chains", "Network Scope", "Chains"]));
    const targetScope = normalizeRotationScope(guard.chain) || scopeFromOutput || normalizeRotationScope(preparedSym) || "ALL";
    const nextNetworkScope = targetScope === "ALL" ? "ALL" : targetScope;
    const nextMode = "RECOMMENDATION";
    const nextRiskLimit = preset.riskLimit;
    const nextMinAdvantage = preset.minAdvantage;
    const nextMaxSlippage = preset.rotationSlippage;

    const buildAppliedSetting = (label, value, previous, suffix = "") => ({
      label,
      value: `${value ?? ""}${suffix}`,
      previous: previous === undefined || previous === null || previous === "" ? "empty" : `${previous}${suffix}`,
      changed: String(value ?? "") !== String(previous ?? ""),
      source: "Strategist",
    });

    const appliedSettings = [
      buildAppliedSetting("Network Scope", nextNetworkScope, rotationNetworkScope),
      buildAppliedSetting("Mode", nextMode, rotationMode),
      buildAppliedSetting("Selected Asset", preparedSym || "—", rotationSelectedPick?.source || rotationSelectedPick?.coin || ""),
      buildAppliedSetting("Strategist Rank", candidates[0]?.rank || "SECONDARY", rotationSelectedPick?.rank || ""),
      buildAppliedSetting("Risk Limit", nextRiskLimit, rotationRiskLimit, "%"),
      buildAppliedSetting("Min Advantage", nextMinAdvantage, rotationMinNetAdvantage, "%"),
      buildAppliedSetting("Max Slippage", nextMaxSlippage, rotationMaxSlippage, "%"),
    ];

    setRotationNetworkScope(nextNetworkScope);
    setRotationMode(nextMode);
    setRotationRiskLimit(nextRiskLimit);
    setRotationMinNetAdvantage(nextMinAdvantage);
    setRotationMaxSlippage(nextMaxSlippage);
    setRotationBudgetRelease("");
    setRotationBudgetReleased(false);
    setStrategistAppliedOpen(false);

    // Mark/select the recommendation so the user sees what the Strategist tried to use.
    // If it is not executable, handleRotationPickToGrid will still show the selected recommendation / not available note.
    handleRotationPickToGrid({ sym: preparedSym });

    if (!guard.ok) {
      setStrategistBridge({
        type: "blocked",
        sym: preparedSym,
        label: "Execution Guard",
        confidence: "Blocked",
        note: `${guard.warning} Strategy fields were still prepared; add/select the correct EVM asset before budget release.`,
        appliedSettings,
        ts: Date.now(),
      });
      setErrorMsg(guard.warning);
      return;
    }

    setStrategistBridge({
      type: "rotation",
      sym: preparedSym,
      label: "Nexus Rotation",
      confidence: preset.confidence,
      note: candidates.length > 1
        ? `Prepared ${preparedSym} first. ${candidates.length} Strategist candidates were detected: ${candidates.map((c) => c.sym).join(", ")}. Candidates are ranked by Strategist quality. Select another candidate in the Strategist candidates list if needed.`
        : "",
      candidates,
      appliedSettings,
      ts: Date.now(),
    });
    setErrorMsg(
      candidates.length > 1
        ? `Prepared ${preparedSym} first. ${candidates.length} Strategist candidates available: ${candidates.map((c) => c.sym).join(", ")}.`
        : `Prepared ${preparedSym} in Nexus Rotation. Enter budget, review selection, then continue manually.`
    );
  }, [
    extractStrategistSymbol,
    extractStrategistRotationCandidates,
    strategistExecutionGuard,
    deriveStrategistRiskPreset,
    setGridMode,
    setRotationNetworkScope,
    setRotationMode,
    setRotationRiskLimit,
    setRotationMinNetAdvantage,
    setRotationMaxSlippage,
    setRotationBudgetRelease,
    setRotationBudgetReleased,
    openGridPanel,
    handleRotationPickToGrid,
    setErrorMsg,
    rotationNetworkScope,
    rotationMode,
    rotationSelectedPick,
    rotationRiskLimit,
    rotationMinNetAdvantage,
    rotationMaxSlippage,
  ]);

  const applyStrategistToTrading = useCallback((body) => {
    const sym = extractStrategistSymbol(body);

    setGridMode("trading");
    openGridPanel();

    const preset = deriveStrategistRiskPreset(body);
    const guard = sym ? strategistExecutionGuard(sym, "rotation") : { ok: false, normalized: "", warning: "No asset symbol found for Nexus Trading." };
    const preparedSym = (guard.ok && guard.normalized) ? guard.normalized : (sym || "");
    const traderSetup = deriveStrategistTraderSetup(body, preparedSym, preset);

    const setup = {
      id: `trading_${Date.now()}`,
      ts: Date.now(),
      source: "Nexus Strategist",
      schemaVersion: traderSetup.schemaVersion,
      symbol: preparedSym,
      requestedSymbol: sym || "",
      executable: !!guard.ok,
      guardWarning: guard.ok ? "" : guard.warning,
      suitability: traderSetup.suitability,
      confidence: traderSetup.confidence || preset.confidence,
      style: traderSetup.style || "TACTICAL",
      budgetUsd: tradingBudgetUsd || "",
      budgetSplits: parseTradingBudgetSplits(tradingBudgetSplitInput, tradingBudgetUsd),
      runtimeHours: traderSetup.runtimeHours || "24",
      allowedAssets: traderSetup.allowedAssets || preparedSym || "",
      allowedChains: traderSetup.allowedChains || "POL,BNB,ETH",
      riskMode: traderSetup.riskMode || "BALANCED",
      cautionDrawdownPct: traderSetup.cautionDrawdownPct || "3",
      hardStopPct: traderSetup.hardStopPct || "12",
      profitLockPct: traderSetup.profitLockPct || "20",
      maxSlippagePct: traderSetup.maxSlippagePct || "1.2",
      maxTrades: traderSetup.maxTrades || "6",
      confidenceMin: traderSetup.confidence || "MEDIUM",
      tacticalReason: traderSetup.reason || "",
      invalidation: traderSetup.invalidation || "",
      notes: String(body || "").slice(0, 900),
      executionQueue: [],
      session: {
        status: "PREPARED",
        approvedBudgetUsd: "",
        approvedAt: null,
        startedAt: null,
        pausedAt: null,
        stoppedAt: null,
        updatedTs: Date.now(),
      },
    };

    const buildAppliedSetting = (label, value, previous, suffix = "") => ({
      label,
      value: `${value ?? ""}${suffix}`,
      previous: previous === undefined || previous === null || previous === "" ? "empty" : `${previous}${suffix}`,
      changed: String(value ?? "") !== String(previous ?? ""),
      source: "Strategist",
    });

    setup.appliedSettings = [
      buildAppliedSetting("Risk Mode", setup.riskMode, tradingRiskMode),
      buildAppliedSetting("Budget Slots", setup.budgetSplits?.length ? setup.budgetSplits.join(" / ") : "auto", tradingBudgetSplitInput || "auto"),
      buildAppliedSetting("Runtime", setup.runtimeHours, tradingRuntimeHours, "h"),
      buildAppliedSetting("Style", setup.style, tradingStyle),
      buildAppliedSetting("Allowed Assets", setup.allowedAssets || "—", tradingAllowedAssets),
      buildAppliedSetting("Allowed Chains", setup.allowedChains, tradingAllowedChains),
      buildAppliedSetting("Caution DD", setup.cautionDrawdownPct, tradingCautionDrawdownPct, "%"),
      buildAppliedSetting("Hard Stop", setup.hardStopPct, tradingHardStopPct, "%"),
      buildAppliedSetting("Profit Lock", setup.profitLockPct, tradingProfitLockPct, "%"),
      buildAppliedSetting("Max Slippage", setup.maxSlippagePct, tradingMaxSlippagePct, "%"),
      buildAppliedSetting("Max Trades", setup.maxTrades, tradingMaxTrades),
    ];

    const appliedChangedCount = setup.appliedSettings.filter((item) => item?.changed).length;
    const appliedUnchangedCount = Math.max(0, setup.appliedSettings.length - appliedChangedCount);

    // Internal learning queue event.
    // This stays invisible in the UI for now, but preserves the Strategist -> Trading decision
    // so future Learning Memory / AI Insight can evaluate setup quality and later outcomes.
    setup.executionQueue = buildTradingQueue(setup, setup.budgetSplits);

    setup.learningEvent = {
      id: `learn_${setup.id}`,
      type: "STRATEGIST_TRADING_SETUP_PREPARED",
      schemaVersion: "trading_learning_event_v1",
      ts: setup.ts,
      source: "Nexus Strategist",
      setupId: setup.id,
      symbol: setup.symbol,
      requestedSymbol: setup.requestedSymbol,
      suitability: setup.suitability,
      confidence: setup.confidence,
      riskMode: setup.riskMode,
      style: setup.style,
      runtimeHours: setup.runtimeHours,
      maxTrades: setup.maxTrades,
      maxSlippagePct: setup.maxSlippagePct,
      budgetSplits: setup.budgetSplits,
      executionQueue: setup.executionQueue,
      cautionDrawdownPct: setup.cautionDrawdownPct,
      hardStopPct: setup.hardStopPct,
      profitLockPct: setup.profitLockPct,
      allowedAssets: setup.allowedAssets,
      allowedChains: setup.allowedChains,
      guard: {
        executable: setup.executable,
        warning: setup.guardWarning || "",
      },
      applied: {
        changedCount: appliedChangedCount,
        unchangedCount: appliedUnchangedCount,
        settings: setup.appliedSettings,
      },
      userAction: {
        approvedBudget: false,
        armed: false,
        started: false,
        paused: false,
        stopped: false,
      },
      outcome: {
        status: "pending",
        pnlUsd: null,
        drawdownPct: null,
        durationMinutes: null,
        notes: "",
      },
      context: {
        tacticalReason: setup.tacticalReason,
        invalidation: setup.invalidation,
        rawStrategistNotes: setup.notes,
        executionQueue: setup.executionQueue,
      },
    };

    setTradingPreparedSetup(setup);
    setTradingExecutionQueue(setup.executionQueue || []);
    setTradingAllowedAssets(setup.allowedAssets);
    setTradingAllowedChains(setup.allowedChains);
    setTradingRiskMode(setup.riskMode);
    setTradingRuntimeHours(setup.runtimeHours);
    setTradingCautionDrawdownPct(setup.cautionDrawdownPct);
    setTradingHardStopPct(setup.hardStopPct);
    setTradingProfitLockPct(setup.profitLockPct);
    setTradingMaxSlippagePct(setup.maxSlippagePct);
    setTradingMaxTrades(setup.maxTrades);
    setTradingConfidenceMin(setup.confidenceMin);
    setTradingStyle(setup.style);
    setTradingSessionStatus("PREPARED");
    setTradingSessionUpdatedTs(Date.now());

    setTradingLearningSetups((prev) => [setup, ...((Array.isArray(prev) ? prev : []).slice(0, 24))]);
    setStrategistAppliedOpen(false);

    setStrategistBridge({
      type: setup.executable ? "trading" : "blocked",
      sym: preparedSym || sym || "—",
      label: "Nexus Trading",
      confidence: setup.executable ? setup.confidence : "Blocked",
      note: setup.executable ? `` : `${guard.warning || "Trading setup could not be matched to a supported asset."}`,
      appliedSettings: setup.appliedSettings,
      executionQueue: setup.executionQueue,
      ts: Date.now(),
    });

    setErrorMsg("");
  }, [
    extractStrategistSymbol,
    strategistExecutionGuard,
    deriveStrategistRiskPreset,
    deriveStrategistTraderSetup,
    setGridMode,
    openGridPanel,
    tradingPreparedSetup,
    tradingBudgetUsd,
    tradingBudgetSplitInput,
    parseTradingBudgetSplits,
    buildTradingQueue,
    tradingRuntimeHours,
    tradingRiskMode,
    tradingStyle,
    tradingAllowedAssets,
    tradingAllowedChains,
    tradingCautionDrawdownPct,
    tradingHardStopPct,
    tradingProfitLockPct,
    tradingMaxSlippagePct,
    tradingMaxTrades,
    setTradingPreparedSetup,
    setTradingExecutionQueue,
    setTradingAllowedAssets,
    setTradingAllowedChains,
    setTradingRiskMode,
    setTradingRuntimeHours,
    setTradingCautionDrawdownPct,
    setTradingHardStopPct,
    setTradingProfitLockPct,
    setTradingMaxSlippagePct,
    setTradingMaxTrades,
    setTradingConfidenceMin,
    setTradingStyle,
    setTradingSessionStatus,
    setTradingSessionUpdatedTs,
    setTradingLearningSetups,
    setErrorMsg,
  ]);

  // Level 4 Light:
  // While a grid/order is running, AI can softly adapt only UI parameters
  // (price preset + slippage). It never edits, creates, cancels or moves orders.
  useEffect(() => {
    if (!hasOpenGridOrders) {
      aiGridAssistKeyRef.current = "";
      return;
    }
    if (aiGridManualOverride) return;
    if (!aiExplainData) return;
  
    const rec = deriveAiGridAssist(aiExplainData);
    const key = [
      String(aiExplainData?.pair || aiExplainData?.winner || ""),
      String(aiExplainData?.gridRange || aiExplainData?.range || ""),
      String(aiExplainData?.mode || ""),
      String(aiExplainData?.risk || ""),
      rec.preset,
      rec.slippage,
    ].join("|");
  
    if (aiGridAssistKeyRef.current === key) return;
    aiGridAssistKeyRef.current = key;
  
    setManualPricePreset(rec.preset);
    setManualSlippagePct(String(rec.slippage));
    setAiGridAssistState({ active: true, preset: rec.preset, slippage: rec.slippage, note: rec.note });
  }, [hasOpenGridOrders, aiGridManualOverride, aiExplainData, deriveAiGridAssist]);

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
        setWatchSyncedWallet(resolveWalletAddress(wallet) || "");
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

  // IMPORTANT: adding a coin to Watchlist must NOT auto-check it for Compare.
  // If this symbol was still present in persisted/desktop compare state from an older session,
  // remove it explicitly so the checkbox stays empty until the user ticks it manually.
  setCompareSet((prev) => {
    const arr = Array.isArray(prev) ? prev : [];
    return arr.filter((x) => String(x || "").toUpperCase() !== sym);
  });

  // Kick a background snapshot refresh (best-effort). Never block the click.
  // Save first, then snapshot, and also try an exact-id direct price hydration for instant UX.
  try {
    setTimeout(async () => {
      try {
        await saveWatchlistToServer(nextItems || null);
        try { setWatchSyncedWallet(resolveWalletAddress(wallet) || ""); } catch {}
      } catch {}

      try {
        const qs = new URLSearchParams({
          ids: String(cgId || "").toLowerCase(),
          vs_currencies: "usd",
          include_24hr_change: "true",
          include_24hr_vol: "true",
          include_market_cap: "true",
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
              const mc = Number.isFinite(Number(d?.usd_market_cap)) ? Number(d.usd_market_cap) : (r?.marketCap ?? r?.market_cap ?? null);
              return {
                ...r,
                price: p,
                change24h: ch24,
                chg_24h: ch24,
                volume24h: v24,
                vol: v24,
                marketCap: mc,
                market_cap: mc,
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

  // IMPORTANT: adding a DEX token to Watchlist must NOT auto-check it for Compare.
  // Keep the checkbox empty until the user selects it manually.
  setCompareSet((prev) => {
    const arr = Array.isArray(prev) ? prev : [];
    return arr.filter((x) => String(x || "").toUpperCase() !== String(item.symbol || "").toUpperCase());
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
      try { setWatchSyncedWallet(resolveWalletAddress(wallet) || ""); } catch {}
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
      try { await saveWatchlistToServer(nextItems); setWatchSyncedWallet(resolveWalletAddress(wallet) || ""); } catch (_) {}

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
  const aiCompareContextModes = useMemo(() => new Set(["research", "daily_report"]), []);
  const aiUsesCompareContext = aiCompareContextModes.has(aiKind);
  
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

function detectNexusUserLanguage(text = "") {
  const raw = String(text || "");
  const q = ` ${raw.toLowerCase()} `;
  if (/[А-Яа-яЁё]/.test(raw)) return "ru";
  if (/[أ-ي]/.test(raw)) return "ar";
  if (/[ぁ-んァ-ン一-龯]/.test(raw)) return "ja";
  if (/[가-힣]/.test(raw)) return "ko";
  const lexicons = {
    de: [" der ", " die ", " das ", " und ", " oder ", " welche", " welcher", " welches", "wieso", "warum", "kaufen", "verkaufen", "teurer", "günstig", "guenstig", "börse", "boerse", "bitte", "mache", "zeige", "suche", " wo ", " wie ", " ist ", " sind "],
    en: [" the ", " and ", " or ", " which", " what", " why", " buy", " sell", " cheaper", " expensive", " show", " find", " where ", " how ", " is ", " are "],
    fr: [" le ", " la ", " les ", " et ", " ou ", " quel", " quelle", " acheter", " vendre", " moins cher", " plus cher", " pourquoi", " comment"],
    es: [" el ", " la ", " los ", " las ", " y ", " o ", " cuál", " cual", " comprar", " vender", " barato", " caro", " donde", " dónde"],
    it: [" il ", " la ", " gli ", " le ", " e ", " o ", " quale", " comprare", " vendere", " economico", " caro", " dove"],
    pt: [" o ", " a ", " os ", " as ", " e ", " ou ", " qual", " comprar", " vender", " barato", " caro", " onde"],
    tr: [" ve ", " veya ", " hangi", " nerede", " almak", " satmak", " ucuz", " pahalı", " pahali"],
    nl: [" de ", " het ", " en ", " of ", " welke", " kopen", " verkopen", " goedkoper", " duurder", " waar"],
  };
  let best = "en";
  let bestScore = 0;
  Object.entries(lexicons).forEach(([lang, words]) => {
    const score = words.reduce((n, w) => n + (q.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { best = lang; bestScore = score; }
  });
  return bestScore > 0 ? best : "en";
}

function detectNexusUserIntent(text = "") {
  const q = String(text || "").toLowerCase();
  // Strict query router: latest user wording decides the Strategist mode.
  if (/(günstig|guenstig|billig|teurer|verkaufen|arbitrage|spread|exchange|börse|boerse|preisunterschied|premium|discount|wo.*kaufen|wo.*verkaufen|wo.*besser|wo.*mehr wert|anderer preis|lohnt|different price|cheaper|buy cheaper|sell higher|where.*buy|where.*sell|where.*better|higher price|more expensive there|worth it)/i.test(q)) return "rotation_spread";
  if (/(rotation|rotieren|relative|stärke|staerke|weakness|strength|kapitalfluss|capital flow|outperform|underperform|welcher.*stärker|welcher.*staerker|which.*stronger|besserer coin|better coin|stärker als|staerker als|stronger than)/i.test(q)) return "rotation";
  if (/(grid|range|seitwärts|seitwaerts|sideways|levels|raster)/i.test(q)) return "grid";
  if (/(trading|autonom|runtime|slot|allocation|budget|position|vault|execute|execution)/i.test(q)) return "trading";
  if (/(risiko|risk|fake|manipul|gefährlich|gefaehrlich|danger|überhitzt|ueberhitzt|overheat|trap|liquidität|liquidity)/i.test(q)) return "risk";
  if (/(report|daily|täglich|taeglich|markt|market|overview|überblick|ueberblick)/i.test(q)) return "market";
  return "general";
}

function nexusStrategistResponseProfile(intent = "general") {
  const i = String(intent || "general").toLowerCase();
  if (i === "rotation_spread") return "ROTATION_SPREAD_ANALYSIS";
  if (i === "rotation") return "ROTATION_ANALYSIS";
  if (i === "grid") return "GRID_ANALYSIS";
  if (i === "trading") return "TRADING_ALLOCATION_ANALYSIS";
  if (i === "risk") return "RISK_ANALYSIS";
  if (i === "market") return "MARKET_ANALYSIS";
  return "GENERAL_MARKET_ANALYSIS";
}

function nexusStrategistCanShowAction(section, userIntent = "general") {
  const key = String(section?.key || "");
  const body = String(section?.body || "").toLowerCase();
  const allowedKeys = ["nexus_grid", "nexus_rotation", "nexus_trading", "exchange_spread"];
  if (!allowedKeys.includes(key)) return false;
  if (/(watch only|nur beobachten|kein sauberer vorteil|no clean edge|nicht bestätigt|not confirmed|risk only|zu riskant|not cleanly confirmed|nicht sauber bestätigt)/i.test(body)) return false;

  const intent = String(userIntent || "general").toLowerCase();

  // Exchange/Spread is an input source for Rotation, but only for spread/buy-sell questions.
  if (key === "exchange_spread") {
    if (!["rotation_spread", "rotation"].includes(intent)) return false;
    return /(kaufen\s*\/\s*verkaufen|buy\s*\/\s*sell|günstiger kaufen|teurer verkaufen|cheaper buy|higher sell|cheapest|highest|spread|premium|differenz|difference|exchange|börse|boerse)/i.test(body);
  }

  if (intent === "rotation_spread" && key !== "nexus_rotation") return false;
  if (intent === "grid" && key !== "nexus_grid") return false;
  if (intent === "trading" && key !== "nexus_trading") return false;
  return /(action ready|aktion bereit|prepared|vorbereitet|setup|rotation|grid|allocation)/i.test(body);
}


function aiTaskPlaceholder(kind) {
    const k = String(kind || "");
    if (k === "strategy_builder") return "Example: Build a low-risk ETH breakout strategy using RVOL confirmation, EMA trend filter, clear invalidation rules, and alert logic.";
    if (k === "backtest_review") return "Example: Paste my backtest summary and explain where this strategy is weak, whether it looks overfitted, and which market regimes hurt performance.";
    if (k === "pine_tradingview") return "Example: Create a Pine Script indicator that shows overextension from the 50 EMA with alerts when RVOL confirms the move.";
    if (k === "daily_report") return "Example: Create today's market report for BTC, ETH, SOL and my watchlist. Highlight risk, rotation, strongest/weakest assets, and what to watch next.";
    if (k === "diagnostics") return "Example: Review my recent trades/orders and identify execution mistakes, overtrading risk, position sizing issues, and behavior patterns.";
    return "Example: Analyze ETH vs BTC relative strength, rotation signals, unusual volume, whale activity, and whether momentum looks healthy or unstable.";
  }

  const AI_ANALYST_SECTION_META_BY_LANG = {
    de: {
      direct_view: { title: "Direkte Einschätzung", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Preisunterschiede" },
      market_read: { title: "Marktlage", sub: "Aktuelle Struktur" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Relative Stärke / Rotation" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / Zyklus" },
      nexus_trading: { title: "Nexus Trading", sub: "Kontrollierte autonome Ausführung" },
      risk_context: { title: "Risikokontext", sub: "Was kippen kann" },
      tactical_take: { title: "Taktische Einordnung", sub: "Indirekte nächste Schritte" },
      strategist_check: { title: "Strategist Check", sub: "Warum / Risiko / Invalidation / Confidence" },
      next_check: { title: "Nächste Prüfung", sub: "Was zu beobachten ist" },
      output: { title: "Antwort", sub: "Nexus Strategist" },
    },
    en: {
      direct_view: { title: "Direct Assessment", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Price differences" },
      market_read: { title: "Market Read", sub: "Current structure" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Relative strength / rotation" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / cycle" },
      nexus_trading: { title: "Nexus Trading", sub: "Controlled autonomous execution" },
      risk_context: { title: "Risk Context", sub: "What can go wrong" },
      tactical_take: { title: "Tactical Take", sub: "Indirect next steps" },
      strategist_check: { title: "Strategist Check", sub: "Why / Risk / Invalidation / Confidence" },
      next_check: { title: "Next Check", sub: "What to monitor" },
      output: { title: "Answer", sub: "Nexus Strategist" },
    },
    fr: {
      direct_view: { title: "Évaluation directe", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Différences de prix" },
      market_read: { title: "Lecture du marché", sub: "Structure actuelle" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Force relative / rotation" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / cycle" },
      nexus_trading: { title: "Nexus Trading", sub: "Exécution autonome contrôlée" },
      risk_context: { title: "Contexte de risque", sub: "Ce qui peut mal tourner" },
      tactical_take: { title: "Lecture tactique", sub: "Prochaines étapes indirectes" },
      next_check: { title: "Prochaine vérification", sub: "À surveiller" },
      output: { title: "Réponse", sub: "Nexus Strategist" },
    },
    es: {
      direct_view: { title: "Evaluación directa", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Diferencias de precio" },
      market_read: { title: "Lectura del mercado", sub: "Estructura actual" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Fuerza relativa / rotación" },
      nexus_grid: { title: "Nexus Grid", sub: "Rango / ciclo" },
      nexus_trading: { title: "Nexus Trading", sub: "Ejecución autónoma controlada" },
      risk_context: { title: "Contexto de riesgo", sub: "Qué puede fallar" },
      tactical_take: { title: "Lectura táctica", sub: "Próximos pasos indirectos" },
      strategist_check: { title: "Strategist Check", sub: "Por qué / Riesgo / Invalidation / Confidence" },
      next_check: { title: "Próxima revisión", sub: "Qué vigilar" },
      output: { title: "Respuesta", sub: "Nexus Strategist" },
    },
    it: {
      direct_view: { title: "Valutazione diretta", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Differenze di prezzo" },
      market_read: { title: "Lettura del mercato", sub: "Struttura attuale" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Forza relativa / rotazione" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / ciclo" },
      nexus_trading: { title: "Nexus Trading", sub: "Esecuzione autonoma controllata" },
      risk_context: { title: "Contesto di rischio", sub: "Cosa può andare storto" },
      tactical_take: { title: "Lettura tattica", sub: "Prossimi passi indiretti" },
      strategist_check: { title: "Strategist Check", sub: "Perché / Rischio / Invalidation / Confidence" },
      next_check: { title: "Prossimo controllo", sub: "Cosa monitorare" },
      output: { title: "Risposta", sub: "Nexus Strategist" },
    },
    pt: {
      direct_view: { title: "Avaliação direta", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Diferenças de preço" },
      market_read: { title: "Leitura do mercado", sub: "Estrutura atual" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Força relativa / rotação" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / ciclo" },
      nexus_trading: { title: "Nexus Trading", sub: "Execução autônoma controlada" },
      risk_context: { title: "Contexto de risco", sub: "O que pode dar errado" },
      tactical_take: { title: "Leitura tática", sub: "Próximos passos indiretos" },
      next_check: { title: "Próxima verificação", sub: "O que monitorar" },
      output: { title: "Resposta", sub: "Nexus Strategist" },
    },
    tr: {
      direct_view: { title: "Doğrudan değerlendirme", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Fiyat farkları" },
      market_read: { title: "Piyasa okuması", sub: "Mevcut yapı" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Göreceli güç / rotasyon" },
      nexus_grid: { title: "Nexus Grid", sub: "Aralık / döngü" },
      nexus_trading: { title: "Nexus Trading", sub: "Kontrollü otonom yürütme" },
      risk_context: { title: "Risk bağlamı", sub: "Ne ters gidebilir" },
      tactical_take: { title: "Taktik değerlendirme", sub: "Dolaylı sonraki adımlar" },
      next_check: { title: "Sonraki kontrol", sub: "Ne izlenmeli" },
      output: { title: "Yanıt", sub: "Nexus Strategist" },
    },
    nl: {
      direct_view: { title: "Directe beoordeling", sub: "Nexus Strategist" },
      exchange_spread: { title: "Exchange / Spread", sub: "Prijsverschillen" },
      market_read: { title: "Marktlezing", sub: "Huidige structuur" },
      nexus_rotation: { title: "Nexus Rotation", sub: "Relatieve sterkte / rotatie" },
      nexus_grid: { title: "Nexus Grid", sub: "Range / cyclus" },
      nexus_trading: { title: "Nexus Trading", sub: "Gecontroleerde autonome uitvoering" },
      risk_context: { title: "Risicocontext", sub: "Wat mis kan gaan" },
      tactical_take: { title: "Tactische inschatting", sub: "Indirecte volgende stappen" },
      strategist_check: { title: "Strategist Check", sub: "Waarom / Risico / Invalidation / Confidence" },
      next_check: { title: "Volgende controle", sub: "Wat te volgen" },
      output: { title: "Antwoord", sub: "Nexus Strategist" },
    },
  };

  const aiOutputLanguage = useMemo(() => {
    return detectNexusUserLanguage(aiQuestion || aiOutput || "");
  }, [aiQuestion, aiOutput]);

  const aiAnalystSectionMeta = useMemo(() => {
    return AI_ANALYST_SECTION_META_BY_LANG[aiOutputLanguage] || AI_ANALYST_SECTION_META_BY_LANG.en;
  }, [aiOutputLanguage]);

  const parseAiAnalystOutput = useCallback((raw) => {
    const source = String(raw || "").trim();
    if (!source) return [];

    const headingMap = {
      "DIRECT VIEW": "direct_view",
      "DIREKTE EINSCHÄTZUNG": "direct_view",
      "DIREKTE EINSCHAETZUNG": "direct_view",
      "ANSWER": "output",
      "ANTWORT": "output",
      "EXCHANGE / SPREAD": "exchange_spread",
      "BUY / SELL": "exchange_spread",
      "KAUFEN / VERKAUFEN": "exchange_spread",
      "BÖRSE / SPREAD": "exchange_spread",
      "BOERSE / SPREAD": "exchange_spread",
      "MARKET READ": "market_read",
      "MARKTLAGE": "market_read",
      "NEXUS ROTATION": "nexus_rotation",
      "ROTATION / RELATIVER WERT": "nexus_rotation",
      "NEXUS GRID": "nexus_grid",
      "NEXUS TRADING": "nexus_trading",
      "RISK CONTEXT": "risk_context",
      "RISIKOKONTEXT": "risk_context",
      "TACTICAL TAKE": "tactical_take",
      "TAKTISCHE EINORDNUNG": "tactical_take",
      "STRATEGIST CHECK": "strategist_check",
      "STRATEGIST-CHECK": "strategist_check",
      "NEXUS STRATEGIST CHECK": "strategist_check",
      "WHY / RISK / INVALIDATION / CONFIDENCE": "strategist_check",
      "WARUM / RISIKO / INVALIDATION / CONFIDENCE": "strategist_check",
      "NEXT CHECK": "next_check",
      "NÄCHSTE PRÜFUNG": "next_check",
      "NAECHSTE PRUEFUNG": "next_check",
    };

    const lines = source.split(/\r?\n/);
    const sections = [];
    let current = null;

    const flush = () => {
      if (!current) return;
      const body = current.lines
        .join("\n")
        .replace(/^\s*-\s+/gm, "• ")
        .replace(/^\s*\*\*([^*]+)\*\*/gm, "• $1")
        .trim();
      if (body) sections.push({ key: current.key, body });
      current = null;
    };

    for (const line of lines) {
      const clean = String(line || "").replace(/^\s*#{1,4}\s*/, "").replace(/^\s*[-*]\s*/, "").trim();
      const normalized = clean.replace(/[:：]+\s*$/, "").toUpperCase();
      const key = headingMap[normalized];

      if (key) {
        flush();
        current = { key, lines: [] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    flush();

    if (!sections.length) {
      return [{ key: "output", body: source }];
    }

    const order = ["direct_view", "exchange_spread", "market_read", "nexus_rotation", "nexus_grid", "nexus_trading", "risk_context", "tactical_take", "strategist_check", "next_check", "output"];
    return sections.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  }, []);

  const aiOutputSections = useMemo(() => parseAiAnalystOutput(aiOutput), [aiOutput, parseAiAnalystOutput]);
  const strategistCompactInput = !!aiOutput && !aiLoading;


async function runAi() {
    setErrorMsg("");
    setAiOutput("");
    if (!requireStrategistAccess("Nexus Strategist")) return;
    const q = (aiQuestion || "").trim();
    if (!q) return setErrorMsg("Please describe what the Nexus Strategist should do.");
    const userLang = detectNexusUserLanguage(q);
    const isGermanAsk = userLang === "de";
    const isEnglishAsk = userLang === "en";
    const userIntent = detectNexusUserIntent(q);

    // Compare/watchlist data may still be useful as hidden context for Research and Daily Report,
    // but coin chips are no longer shown in the AI Analyst UI.
    const syms = aiUsesCompareContext ? (compareSymbols || []) : [];

    const isFollowUpAsk = !!aiFollowUp && !!aiOutput;
    const aiKindPrompts = isGermanAsk ? {
      research: `Arbeite als Nexus Strategist. Verstehe die Nutzerfrage zuerst, erkenne den passenden Marktmodus und antworte direkt. Nutze Rotation, relative Stärke, Spread, Volumen, Marktstruktur und Exchange-Kontext nur wenn relevant. Keine internen Module erwähnen.`,
      strategy_builder: `Arbeite als Nexus Strategist und Strategy Builder. Übersetze die Idee in eine verständliche, nicht-anweisende Strategie-Logik. Wenn der Nutzer nach günstig kaufen / teurer verkaufen / Rotation fragt, behandle es als Rotation-/Spread-Analyse und nicht als allgemeinen Trading-Report.`,
      backtest_review: `Arbeite als Backtest-Prüfer. Bewerte Robustheit, Drawdown, Marktphasen und Schwachstellen.`,
      pine_tradingview: `Arbeite als TradingView/Pine-Assistent. Hilf mit Pine Script, Logik und Alerts.`,
      daily_report: `Erstelle einen kompakten Tagesbericht mit stärksten/schwächsten Assets, Risiko, Rotation und Beobachtungspunkten.`,
      diagnostics: `Arbeite als Trading-Diagnostiker. Erkläre Risiko, Ausführungsqualität und Schwachstellen ruhig und nicht-befehlend.`,
    } : {
      research: `Act as Nexus Strategist. Understand the user's intent first, choose the correct market mode, and answer directly. Use rotation, relative strength, spread, volume, market structure, and exchange context only when relevant. Never mention internal modules.`,
      strategy_builder: `Act as Nexus Strategist and strategy builder. Translate the idea into clear non-prescriptive strategy logic. If the user asks about buying cheaper / selling higher / rotation, treat it as rotation/spread analysis, not as a generic trading report.`,
      backtest_review: `Act as a backtest reviewer. Evaluate robustness, drawdown, regimes and weak points.`,
      pine_tradingview: `Act as a TradingView/Pine assistant. Help with Pine Script, logic and alerts.`,
      daily_report: `Create a compact daily report with strongest/weakest assets, risk, rotation and watch points.`,
      diagnostics: `Act as a trading diagnostics analyst. Explain risk, execution quality and weak points calmly and non-prescriptively.`,
    };

    const responseFormatPrompt = isGermanAsk ? `

SPRACHE:
- Antworte vollständig auf Deutsch.
- Keine englischen Überschriften, keine englischen Bulletpoints, keine englischen Begriffe außer etablierten Produktnamen wie Nexus Trading oder Exchange.
- Wenn die Nutzereingabe deutsch ist, muss die komplette Ausgabe deutsch sein.

Antwortprofil:
- Nutze nur die Blöcke, die zur Frage passen.
- Wenn die Frage nach Rotation, günstig kaufen, teurer verkaufen, Spread, Börsen oder Arbitrage klingt, nutze bevorzugt:
DIREKTE EINSCHÄTZUNG
ROTATION / RELATIVER WERT
EXCHANGE / SPREAD
RISIKOKONTEXT
NÄCHSTE PRÜFUNG
- Bei dieser Frage KEIN Nexus Trading, KEIN Grid und KEIN kompletter Multi-Report, außer der Nutzer fragt ausdrücklich danach.
- Beginne mit einer klaren Antwort: Vorteil vorhanden / kein sauberer Vorteil / nur beobachten.
- Nutze konkrete Prozentwerte nur, wenn sie im Kontext vorhanden sind.
- Erfinde keine Börsen, Preise oder Spreads.
- Keine direkten Kauf-/Verkaufsbefehle.
- Verstehe normale Sprache: "wo besser", "lohnt sich das", "ist das echt", "wo mehr gehandelt" und übersetze es intern in Spread/Rotation/Liquidität/Risiko.
- Bei "wo kaufen/wo verkaufen" zuerst Coin + günstige Börse + teurere Börse nennen. Paare nur als Zusatz verwenden.` : `

LANGUAGE:
- Answer fully in English.
- Do not use German headings or German bullet text.

Response profile:
- Use only the blocks that match the question.
- If the question is about rotation, buying cheaper, selling higher, spread, exchanges, or arbitrage, prefer:
DIRECT VIEW
ROTATION / RELATIVE VALUE
EXCHANGE / SPREAD
RISK CONTEXT
NEXT CHECK
- For this question do NOT output Nexus Trading, Grid, or a full multi-report unless the user explicitly asks for it.
- Start with a clear answer: edge present / no clean edge / watch only.
- Use concrete percentages only when they exist in context.
- Do not invent exchanges, prices, or spreads.
- No direct buy/sell commands.
- Understand casual wording: "where is better", "is it worth it", "is this real", "where is it traded more" and map it internally to spread/rotation/liquidity/risk.
- For "where to buy/where to sell" questions, name coin + cheaper exchange + higher exchange first. Use pairs only as support.`;

    const basePrompt = aiKindPrompts[aiKind] || `Provide a ${aiProfile} analyst response based on the current task, timeframe, and available context.`;
    const qFinal = isFollowUpAsk
      ? `${basePrompt}${responseFormatPrompt}

Follow-up mode:
Answer only the user's follow-up. Keep the previous Strategist context.

Previous Strategist output:
${String(aiOutput || "").slice(0, 1200)}

User follow-up:
${q}`
      : `${basePrompt}${responseFormatPrompt}

User intent profile:
${nexusStrategistResponseProfile(userIntent)}

User task:
${q}`;

    setAiLoading(true);
    try {
      await ensureBackendAuthToken();

      const uiTf = String(timeframe || "").toUpperCase();
      const explicitTf = _extractExplicitTfFromQuestion(qFinal);
      const tf = String(explicitTf || uiTf || "90D").toUpperCase();

      const slicedSeries = sliceCompareSeries(compareSeries || {}, tf);
      const seriesStats = _seriesStatsFromSeriesMap(slicedSeries, syms);
      const insightWindows = _buildInsightWindows(compareSeries || {}, syms);
      const aiSignalContext = buildAiSignalContext({
        syms,
        watchRows,
        ratingSummaryBySymbol,
        onchainBySymbol,
        marketConditionBySymbol,
        bestPairsToShow,
        compareWeights: activeCompareWeights,
        aiMode: normalizedAiInsightMode,
        nexusTradingContext: {
          prepared_setup: tradingPreparedSetup || null,
          learning_count: Array.isArray(tradingLearningSetups) ? tradingLearningSetups.length : 0,
          latest_learning_event: Array.isArray(tradingLearningSetups) && tradingLearningSetups[0]?.learningEvent ? tradingLearningSetups[0].learningEvent : null,
          configured_budget_usd: tradingBudgetUsd || "",
          risk_mode: tradingRiskMode || "",
        },
      });
      const aiSignalText = formatAiSignalContextForPrompt(aiSignalContext);

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

      const header = isGermanAsk
        ? (`USER_LANGUAGE: de
USER_INTENT: ${userIntent}
` +
          `UI-Zeitraum: ${uiTf}.
` +
          `Aktiver Analysezeitraum: ${tf}.
` +
          (explicitTf
            ? `Der Nutzer hat ausdrücklich ${explicitTf} gefragt; das überschreibt den UI-Zeitraum.
`
            : `Kein expliziter Zeitraum in der Nutzerfrage; nutze den aktuellen UI-Zeitraum.
`) +
          (syms.length ? `Verdeckter Markt-Kontext Symbole: ${syms.join(", ")}
` : "Keine sichtbaren Coins gewählt; nutze den verdeckten Watchlist-/Compare-Kontext.\n") +
          (statsText ? `Serienstatistik (${tf}):
${statsText}
` : "") +
          (insightText ? `
Multi-Zeitraum-Marktkontext für Nexus Strategist:
${insightText}
` : "") +
          (aiSignalText ? `
Verdeckter Markt-, Rating-, Community-, Marktphasen-, On-chain-, Rotation- und Pair-Kontext. Nutze ihn still, liste ihn nicht mechanisch und erwähne keine internen Module:
${aiSignalText}
` : ""))
        : (`USER_LANGUAGE: en
USER_INTENT: ${userIntent}
` +
          `UI timeframe: ${uiTf}.
` +
          `Active analysis timeframe: ${tf}.
` +
          (explicitTf
            ? `The user explicitly asked for ${explicitTf}, so this overrides the current UI timeframe.
`
            : `No explicit timeframe was found in the user's question, so use the current UI timeframe.
`) +
          (syms.length ? `Hidden market context symbols: ${syms.join(", ")}
` : "No visible coin scope selected; use hidden watchlist/compare context.\n") +
          (statsText ? `Series stats (${tf}):
${statsText}
` : "") +
          (insightText ? `
Multi-timeframe market context for Nexus Strategist:
${insightText}
` : "") +
          (aiSignalText ? `
Hidden market, rating, community, market-condition, on-chain, rotation and pair context for Nexus Strategist. Use it silently when relevant; do not list it mechanically and do not mention internal modules:
${aiSignalText}
` : ""));

      const questionText =
        isFollowUpAsk && historyText ? `${header}${historyText}\nUser: ${qFinal}` : `${header}User: ${qFinal}`;

      const body = {
        kind: aiKind,
        symbols: syms.length ? syms : (aiSignalContext?.analysis_symbols || []),
        profile: aiProfile,
        question: questionText,
        timeframe: tf,
        selected_timeframe: uiTf,
        explicit_question_timeframe: explicitTf || null,
        index_mode: !!indexMode,
        history: isFollowUpAsk ? trimmedHist : [],
        series_stats: seriesStats,
        insight_windows: insightWindows,
        ai_signal_context: aiSignalContext,
        user_language: userLang,
        raw_user_question: q,
        user_intent: userIntent,
        response_profile: nexusStrategistResponseProfile(userIntent),
        strategist_phase: "phase2_depth_engine",
        strategist_intelligence_focus: "hidden_why_risk_context_invalidation_confidence",
        strategist_quality_gate: true,
        strategist_followup: !!isFollowUpAsk,
        previous_response_summary: isFollowUpAsk ? String(aiOutput || "").slice(0, 1200) : "",
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
      const msg = String(e?.message || e || "AI Analyst request failed.");
      setErrorMsg(msg);
      setAiOutput(`Nexus Strategist could not run.\n\n${msg}`);
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

  if (!Number.isFinite(liq)) {
    return {
      key: "pending",
      label: "⏳ Checking liquidity",
      tone: "rgba(245, 193, 108, 0.18)",
      border: "1px solid rgba(245, 193, 108, 0.28)",
      color: "#f5c16c",
    };
  }

  if (liq <= 0) {
    return {
      key: "no_liquidity",
      label: "🟡 No vault liquidity",
      tone: "rgba(245, 193, 108, 0.16)",
      border: "1px solid rgba(245, 193, 108, 0.30)",
      color: "#f5c16c",
    };
  }

  if (!Number.isFinite(impact) || impact < 0) {
    return {
      key: "input_needed",
      label: "🟡 Enter order amount",
      tone: "rgba(245, 193, 108, 0.16)",
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
        @keyframes nexusMovementPulse {
          0%, 100% {
            color: rgba(255, 209, 102, 0.62);
            text-shadow: 0 0 0 rgba(255, 184, 0, 0);
            transform: scale(1);
          }
          50% {
            color: rgba(255, 209, 102, 1);
            text-shadow: 0 0 10px rgba(255, 184, 0, 0.55);
            transform: scale(1.06);
          }
        }
        .movementChanceRankPulse {
          display: inline-block;
          font-weight: 900 !important;
          color: #ffd166 !important;
          animation: nexusMovementPulse 2.15s ease-in-out infinite;
          will-change: transform, text-shadow, color;
        }
        .movementChanceRankPulse.extreme {
          animation-duration: 1.45s;
          text-shadow: 0 0 12px rgba(255, 133, 51, 0.45);
        }
        @media (prefers-reduced-motion: reduce) {
          .movementChanceRankPulse,
          .movementChanceRankPulse.extreme {
            animation: none !important;
          }
        }

        /* Mobile Watchlist fix:
           Keep the same desktop columns on phone, only smaller and horizontally scrollable.
           Nothing is hidden: Market Cap, 7D Chart and X remain visible. */
        @media (max-width: 780px) {
          .section-watch{
            overflow: hidden !important;
          }

          .section-watch .panelScroll,
          .section-watch .watchTable,
          .section-watch .watchScroll{
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            -webkit-overflow-scrolling: touch;
          }

          .section-watch .watchTable{
            position: relative !important;
          }

          .section-watch .watchHead.watchStickyHead{
            display: grid !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 9 !important;
            background: rgba(2, 18, 17, 0.96) !important;
            backdrop-filter: blur(8px);
          }

          .section-watch .watchHead,
          .section-watch .watchRow{
            display: grid !important;
            width: 980px !important;
            min-width: 980px !important;
            max-width: none !important;
            grid-template-columns: 34px 100px 72px 128px 138px 150px 122px 132px 42px !important;
            gap: 7px !important;
            align-items: center !important;
          }

          .section-watch .watchHead > *,
          .section-watch .watchRow > *{
            min-width: 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .section-watch .watchRow{
            padding: 7px 8px !important;
            min-height: 46px !important;
          }

          .section-watch .watchHead{
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .section-watch .watchRow > :nth-child(1),
          .section-watch .watchHead > :nth-child(1){
            justify-content: center !important;
            text-align: center !important;
          }

          .section-watch .watchRow > :nth-child(2),
          .section-watch .watchHead > :nth-child(2){
            justify-content: flex-start !important;
            text-align: left !important;
          }

          .section-watch .watchRow > :nth-child(3),
          .section-watch .watchRow > :nth-child(4),
          .section-watch .watchRow > :nth-child(5),
          .section-watch .watchRow > :nth-child(6),
          .section-watch .watchHead > :nth-child(3),
          .section-watch .watchHead > :nth-child(4),
          .section-watch .watchHead > :nth-child(5),
          .section-watch .watchHead > :nth-child(6){
            justify-content: flex-end !important;
            text-align: right !important;
            font-size: 10.5px !important;
            line-height: 1.05 !important;
          }

          .section-watch .watchRow > :nth-child(7),
          .section-watch .watchHead > :nth-child(7){
            justify-content: center !important;
            text-align: center !important;
            overflow: visible !important;
          }

          .section-watch .watchRow > :nth-child(8),
          .section-watch .watchHead > :nth-child(8){
            justify-content: flex-start !important;
            text-align: left !important;
            overflow: visible !important;
          }

          .section-watch .watchRow > :nth-child(9),
          .section-watch .watchHead > :nth-child(9){
            display: flex !important;
            justify-content: center !important;
            text-align: center !important;
            overflow: visible !important;
          }

          .section-watch .watchSym{
            font-size: 11.5px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }

          .section-watch .watchSignals{
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 4px !important;
            align-items: center !important;
          }

          .section-watch .watchSignals input{
            margin: 0 !important;
            transform: scale(.86) !important;
          }

          .section-watch .watchSignals .pill{
            font-size: 8.5px !important;
            line-height: 1 !important;
          }

          .section-watch .watchMiniSpark,
          .section-watch .watchSpark,
          .section-watch canvas{
            max-width: 116px !important;
          }
        }


        /* RSI legend */
        .rsiLegend{
          display:flex;
          gap:8px;
          margin:6px 0 10px 0;
          flex-wrap:wrap;
        }
        .rsiLegend .pill{
          font-size:11px;
          padding:4px 10px;
          border-radius:999px;
          opacity:0.9;
        }
        .rsiOverbought{
          background: rgba(239,68,68,0.22);
          color:#ff6b6b;
          border:1px solid rgba(239,68,68,0.55);
        }
        .rsiNeutral{
          background: rgba(255,184,0,0.18);
          color:#ffd34d;
          border:1px solid rgba(255,184,0,0.55);
        }
        .rsiOversold{
          background: rgba(57,217,138,0.18);
          color:#39d98a;
          border:1px solid rgba(57,217,138,0.45);
        }

.btnPill, .btnPill *, .btnGhost, .btnGhost * { 
          color: #fff !important; 
          -webkit-text-fill-color: #fff !important;
        }

        .desktopMarketDeskPanel {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 185px;
          align-items: center;
          gap: 16px;
          height: 74px;
          min-height: 74px;
          flex: 1 1 720px;
          max-width: 820px;
          min-width: 360px;
          margin: 0 18px 0 28px;
          padding: 0;
          border-radius: 0;
          border: 0;
          background: transparent;
          box-shadow: none;
          overflow: hidden;
        }
        .marketDeskCopy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
        }
        .marketDeskKicker {
          color: #ff5252;
          font-size: 12px;
          font-weight: 1000;
          line-height: 1;
          letter-spacing: 1.1px;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(255,82,82,0.42);
        }
        .marketDeskHeadline {
          color: #64ddff;
          font-size: clamp(21px, 1.45vw, 28px);
          line-height: 1.05;
          font-weight: 1000;
          letter-spacing: -0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 0 18px rgba(100,221,255,0.38);
        }
        .marketDeskDetail {
          color: rgba(221,255,247,0.74);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .marketDeskChartBox {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
          height: 68px;
          border-left: 1px solid rgba(98,214,255,0.16);
          padding-left: 14px;
        }
        .marketDeskMetric {
          position: absolute;
          top: 0;
          right: 2px;
          color: #64ddff;
          font-size: 12px;
          font-weight: 1000;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 12px rgba(100,221,255,0.36);
          z-index: 2;
        }
        .marketDeskChartSvg {
          width: 172px;
          height: 62px;
          overflow: visible;
        }
        .marketDeskNoChart {
          width: 172px;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(100,221,255,0.76);
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: 1px;
          border: 1px dashed rgba(100,221,255,0.22);
          border-radius: 12px;
        }
        .marketDeskAxis { stroke: rgba(255,255,255,0.16); stroke-width: 1; }
        .marketDeskArea { fill: rgba(100,221,255,0.11); }
        .marketDeskLine { fill: none; stroke: #64ddff; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; filter: drop-shadow(0 0 7px rgba(100,221,255,0.45)); }
        .marketDeskDot { fill: #64ddff; stroke: rgba(0,0,0,0.55); stroke-width: 2; filter: drop-shadow(0 0 7px rgba(100,221,255,0.7)); }
        .marketDeskBar { fill: #64ddff; opacity: 0.78; filter: drop-shadow(0 0 5px rgba(100,221,255,0.34)); }
        .marketDeskChartSvg.negative .marketDeskLine,
        .marketDeskChartSvg.negative .marketDeskDot,
        .marketDeskChartSvg.negative .marketDeskBar { stroke: #ff6b6b; fill: #ff6b6b; }
        .marketDeskChartSvg.negative .marketDeskArea { fill: rgba(255,107,107,0.12); }
        .marketDeskChartSvg.warning .marketDeskLine,
        .marketDeskChartSvg.warning .marketDeskDot,
        .marketDeskChartSvg.warning .marketDeskBar { stroke: #ffd166; fill: #ffd166; }
        .marketDeskChartSvg.warning .marketDeskArea { fill: rgba(255,209,102,0.12); }
        .marketDeskFadeKey {
          animation: marketDeskSoftIn 420ms ease both;
        }
        @keyframes marketDeskSoftIn {
          from { opacity: 0; transform: translateY(4px); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @media (max-width: 1100px) {
          .desktopMarketDeskPanel { grid-template-columns: minmax(0, 1fr) 150px; min-width: 280px; margin-left: 18px; margin-right: 12px; }
          .marketDeskChartSvg { width: 145px; }
          .marketDeskHeadline { font-size: 22px; }
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
          .desktopMarketDeskPanel {
            display: none !important;
          }
          header.topbar .walletBox {
            order: 3 !important;
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
          .cardHead { flex-wrap: wrap; align-items: flex-start; gap: 8px; }
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
            min-height: 0 !important;
            max-height: clamp(230px, 31vh, 360px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 8px !important;
            padding-bottom: 10px !important;
            margin-top: 6px !important;
            margin-bottom: 0 !important;
            scroll-padding-bottom: 10px !important;
            overscroll-behavior: contain !important;
            box-shadow: none !important;
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

          /* focused desktop: give Compare more usable pair-list height */
          .dashboardGrid.hasFocus.focus-compare .section-compare .pairsScroll{
            min-height: 0 !important;
            max-height: clamp(230px, 31vh, 360px) !important;
            padding-bottom: 10px !important;
            scroll-padding-bottom: 10px !important;
          }

          .dashboardGrid.hasFocus.focus-compare .section-compare .pairsBox{
            flex: 1 1 auto !important;
          }

          .section-compare .pairsScroll::after,
          .section-compare .pairsScroll::before{
            content: none !important;
            display: none !important;
            background: none !important;
          }

                    /* focused desktop: compact sidebar panels */
          .dashboardGrid.hasFocus .section-grid:not(.panelActive) .cardHead,
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .cardHead,
          .dashboardGrid.hasFocus .section-ai:not(.panelActive) .cardHead{
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            gap: 8px !important;
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
            gap: 8px !important;
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

          .watchMiniSpark{
            width: 88px !important;
            height: 28px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;

            width: 92px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: rgba(255,255,255,.025);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
            overflow: hidden;
          }
          .watchMiniSpark svg{
            width: 100%;
            height: 100%;
            display: block;
          }
          .watchMiniSpark.empty{
            font-size: 11px;
            color: rgba(232,242,240,.45);
          }
          .watchCompact{
            display: grid;
            gap: 8px;
          }
          .watchCompactCard{
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 8px;
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
            gap: 8px !important;
            overflow-y: auto !important;
            max-height: clamp(180px, 26vh, 320px) !important;
            padding-right: 6px !important;
          }
          .dashboardGrid.hasFocus .section-watch:not(.panelActive) .watchRow{
            display: grid !important;
            grid-template-columns: 36px minmax(88px,1fr) 72px auto !important;
            gap: 8px !important;
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
          /*
            Mobile/small screens:
            Keep the desktop table/list layout, only make it smaller.
            No card stacking, no giant chart cells, no hidden chart column.
          */
          .section-compare .panelScroll,
          .section-watch .panelScroll{
            overflow-x: hidden !important;
          }

          .section-compare .compareGrid{
            display: block !important;
            min-width: 0 !important;
          }
          .section-compare .compareLive{
            margin-bottom: 10px !important;
          }
          .section-compare .chartHeader{
            flex-wrap: wrap !important;
            gap: 7px !important;
          }
          .section-compare .rowBtn{
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 5px !important;
          }
          .section-compare .chartWrap{
            width: 100% !important;
            max-width: 100% !important;
          }
          .section-compare svg,
          .section-compare .svgChart,
          .section-compare .chartSvg{
            width: 100% !important;
            max-width: 100% !important;
          }
          .section-compare .pairsBox{
            min-width: 0 !important;
          }
          .section-compare .pairsBox > div[style*="justify-content: space-between"]{
            flex-wrap: wrap !important;
            align-items: center !important;
            gap: 8px !important;
          }

          /* Best pairs: same row layout as desktop, just smaller */
          .section-compare .pairsScroll{
            overflow-x: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
            padding: 6px !important;
          }
          .section-compare .pairRow{
            display: flex !important;
            align-items: center !important;
            flex-wrap: nowrap !important;
            min-width: 620px !important;
            padding: 6px 6px !important;
            gap: 6px !important;
          }
          .section-compare .pairRow > span:first-child{
            flex: 0 0 24px !important;
            width: 24px !important;
            font-size: 10.5px !important;
          }
          .section-compare .pairRow > div{
            display: grid !important;
            grid-template-columns: minmax(86px, 1fr) 86px 86px 42px 60px 76px 52px !important;
            gap: 5px !important;
            align-items: center !important;
            min-width: 560px !important;
            flex: 1 0 auto !important;
          }
          .section-compare .pairName{
            min-width: 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            font-size: 11px !important;
          }
          .section-compare .pairRow .pill{
            width: auto !important;
            min-width: 0 !important;
            max-width: 100% !important;
            font-size: 10px !important;
            padding: 3px 5px !important;
            line-height: 1.05 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          /* Watchlist: same table as desktop, only smaller */
          .section-watch .watchTable{
            overflow-x: hidden !important;
            max-width: 100% !important;
          }
          .section-watch .watchScroll{
            overflow-x: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          .section-watch .watchHead,
          .section-watch .watchRow{
            min-width: 520px !important;
            grid-template-columns: 28px 54px 46px 68px 92px 94px 76px 28px !important;
            gap: 4px !important;
            align-items: center !important;
          }
          .section-watch .watchHead{
            font-size: 9.5px !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
          .section-watch .watchRow{
            padding: 7px 4px !important;
            min-height: 44px !important;
          }
          .section-watch .watchCoin{
            min-width: 0 !important;
            white-space: nowrap !important;
          }
          .section-watch .watchSym{
            font-size: 10.5px !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .section-watch .watchRow .coinLogo.small{
            width: 16px !important;
            height: 16px !important;
            font-size: 9px !important;
          }
          .section-watch .watchRow .mono,
          .section-watch .watchRow .muted,
          .section-watch .watchRow button,
          .section-watch .watchRow input{
            font-size: 9.5px !important;
            line-height: 1.05 !important;
          }
          .section-watch .watchRow .mono{
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .section-watch .watchRow .iconBtn{
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            font-size: 11px !important;
          }
          .section-watch .watchRow svg,
          .section-watch .watchRow canvas{
            max-width: 76px !important;
            width: 76px !important;
          }
        }

        @media (max-width: 560px) {
          /* Very narrow phones: keep desktop-style rows, but allow a small horizontal swipe */
          .section-compare .pairRow{
            min-width: 620px !important;
          }
          .section-watch .watchHead,
          .section-watch .watchRow{
            min-width: 520px !important;
          }
        }

        @media (max-width: 980px) {
          .panelScroll{
            overflow: visible !important;
            padding-right: 0;
          }
        }

        /* FINAL MOBILE WATCHLIST FIX:
           One horizontal scroll container for BOTH header and rows.
           This keeps the header aligned and restores left/right swipe on phones. */
        @media (max-width: 820px) {
          .section-watch .panelScroll{
            overflow-x: hidden !important;
          }

          .section-watch .watchTable{
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-x: contain !important;
            touch-action: pan-x pan-y !important;
          }

          .section-watch .watchHead.watchStickyHead{
            display: grid !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 10 !important;
            background: rgba(2,18,17,.96) !important;
            backdrop-filter: blur(8px);
          }

          .section-watch .watchScroll{
            display: block !important;
            width: max-content !important;
            min-width: 720px !important;
            max-width: none !important;
            overflow: visible !important;
          }

          .section-watch .watchHead,
          .section-watch .watchRow{
            width: 720px !important;
            min-width: 720px !important;
            max-width: none !important;
            grid-template-columns: 30px 62px 50px 82px 112px 118px 86px 32px !important;
            gap: 5px !important;
            align-items: center !important;
            box-sizing: border-box !important;
            touch-action: pan-x pan-y !important;
          }

          .section-watch .watchHead{
            font-size: 9.5px !important;
            padding-left: 4px !important;
            padding-right: 4px !important;
          }

          .section-watch .watchRow{
            padding: 7px 4px !important;
            min-height: 46px !important;
          }

          .section-watch .watchRow svg,
          .section-watch .watchRow canvas{
            width: 86px !important;
            max-width: 86px !important;
          }

          .section-watch .watchRow .mono,
          .section-watch .watchRow .muted,
          .section-watch .watchRow button,
          .section-watch .watchRow input{
            font-size: 9.5px !important;
            line-height: 1.05 !important;
          }

          .section-watch .watchRow .iconBtn{
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            font-size: 11px !important;
          }
        }

        /* FINAL Watchlist sparkline precision: CoinGecko-like 7D mini charts */
        .watchMiniSpark.watchMiniSparkCg{
          width: 132px !important;
          height: 38px !important;
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .watchMiniSpark.watchMiniSparkCg svg{
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          overflow: visible !important;
        }

        @media (max-width: 820px) {
          .section-watch .watchHead,
          .section-watch .watchRow{
            width: 780px !important;
            min-width: 780px !important;
            grid-template-columns: 26px 30px 62px 50px 82px 112px 118px 110px 32px !important;
          }
          .section-watch .watchScroll{
            min-width: 780px !important;
            width: max-content !important;
          }
          .section-watch .watchRow svg,
          .section-watch .watchRow canvas{
            width: 110px !important;
            max-width: 110px !important;
          }
          .section-watch .watchMiniSpark.watchMiniSparkCg{
            width: 110px !important;
            height: 34px !important;
          }
        }


        /* FINAL MOBILE WATCHLIST FIT - keep the delete button in-row without crushing columns.
           Uses the available row width first, then falls back to one horizontal scroll on very small screens. */
        @media (max-width: 820px) {
          .section-watch .panelScroll{ overflow-x: hidden !important; }
          .section-watch .watchTable{
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
            overflow-y: visible !important;
            -webkit-overflow-scrolling: touch !important;
            touch-action: pan-x pan-y !important;
          }
          .section-watch .watchScroll{
            display: block !important;
            overflow: visible !important;
            max-width: none !important;
            width: max(100%, 790px) !important;
            min-width: 790px !important;
          }
          .section-watch .watchHead,
          .section-watch .watchRow{
            display: grid !important;
            width: max(100%, 790px) !important;
            min-width: 790px !important;
            max-width: none !important;
            grid-template-columns: 28px 64px 54px 86px 112px 108px 104px 150px 38px !important;
            gap: 5px !important;
            align-items: center !important;
            box-sizing: border-box !important;
          }
          .section-watch .watchHead.watchStickyHead{
            position: sticky !important;
            top: 0 !important;
            z-index: 9 !important;
            background: rgba(2, 18, 17, 0.96) !important;
            backdrop-filter: blur(8px) !important;
          }
          .section-watch .watchHead{
            padding-left: 5px !important;
            padding-right: 5px !important;
            font-size: 9.5px !important;
          }
          .section-watch .watchRow{
            padding: 7px 5px !important;
            min-height: 46px !important;
          }
          .section-watch .watchRow > *,
          .section-watch .watchHead > *{ min-width: 0 !important; }
          .section-watch .watchCoin,
          .section-watch .watchSym{ min-width: 0 !important; white-space: nowrap !important; }
          .section-watch .watchRow .mono{
            font-size: 10.5px !important;
            line-height: 1.05 !important;
            white-space: nowrap !important;
            font-variant-numeric: tabular-nums !important;
          }
          .section-watch .watchMiniSpark.watchMiniSparkCg{ width: 86px !important; height: 32px !important; }
          .section-watch .watchRow svg,
          .section-watch .watchRow canvas{ width: 86px !important; max-width: 86px !important; }
          .section-watch .watchRow .iconBtn{
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            margin-left: auto !important;
            justify-self: end !important;
            flex: 0 0 auto !important;
          }
          .section-watch .watchSignals{
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 5px !important;
            overflow: visible !important;
            min-width: 150px !important;
          }
          .section-watch .watchSignals .pill{
            flex: 0 0 auto !important;
          }
          .section-watch .watchRow > :nth-child(9),
          .section-watch .watchHead > :nth-child(9){
            overflow: visible !important;
            justify-content: center !important;
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


        <section
          className="desktopMarketDeskPanel marketDeskFadeKey"
          key={`${activeMarketBanner?.label || "market"}-${marketBannerIndex}`}
          title={`${activeMarketBanner.label}: ${activeMarketBanner.value}`}
          aria-label={`Trader intelligence banner: ${activeMarketBanner.label} ${activeMarketBanner.value}`}
        >
          <div className="marketDeskCopy">
            <div className="marketDeskKicker">{activeMarketBanner?.label || "Nexus Market Desk"}</div>
            <div className="marketDeskHeadline">{activeMarketBanner?.value || "Loading liquidity, volatility and risk…"}</div>
            <div className="marketDeskDetail">{activeMarketBanner?.detail || "Smart global market intelligence rotates every 8 seconds."}</div>
          </div>
          <div className="marketDeskChartBox">
            <div className="marketDeskMetric">{activeMarketBanner?.metric || "—"}</div>
            {renderMarketDeskChart(activeMarketBanner)}
          </div>
        </section>

        <div className="walletBox" style={{ position: "relative" }}>
          <div
            className="walletRow"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: isCompactMobile ? 5 : 8,
              flexWrap: isCompactMobile ? "wrap" : "nowrap",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
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

            {wallet && (
              <button
                type="button"
                style={{
                  cursor: "pointer",
                  background: "transparent",
                  color: "rgba(255,255,255,0.92)",
                  border: "none",
                  boxShadow: "none",
                  padding: isCompactMobile ? "1px 2px" : "0 2px",
                  margin: 0,
                  fontSize: isCompactMobile ? 10 : 11,
                  lineHeight: 1.08,
                  fontWeight: 800,
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: 2,
                  whiteSpace: "nowrap",
                  minWidth: 0,
                  maxWidth: isCompactMobile ? 132 : 190,
                  overflow: "hidden",
                  flex: "0 1 auto",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setWalletModalOpen((v) => !v);
                }}
                title={walletProfit.available ? "Wallet value and profit since saved baseline" : "Wallet value. Open wallet details to set profit baseline."}
              >
                <span style={{ display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Value: {walletUsdLoading ? "Loading…" : fmtUsd(walletUsd?.total)}
                </span>
                <span style={{ display: "block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Profit: {walletProfit.available
                    ? `${Number(walletProfit.amount || 0) >= 0 ? "+" : ""}${fmtUsd(walletProfit.amount)}${Number.isFinite(Number(walletProfit.pct)) ? ` (${Number(walletProfit.pct).toFixed(2)}%)` : ""}`
                    : "Set baseline"}
                </span>
              </button>
            )}

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
            <button
              type="button"
              className="btnGhost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSupportOpen(true);
                setSupportMsg("");
              }}
            >
              Support
            </button>
          </div>

          {supportOpen && (
            <>
              <div
                onClick={() => setSupportOpen(false)}
                style={{ position: "fixed", inset: 0, background: "transparent", zIndex: 3000 }}
              />
              <div
                role="dialog"
                aria-label="Support"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "fixed",
                  top: 78,
                  right: 24,
                  width: 420,
                  maxWidth: "calc(100vw - 24px)",
                  background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  padding: 14,
                  zIndex: 4000,
                  boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div className="cardTitle" style={{ margin: 0 }}>Support</div>
                  <button className="iconBtn" type="button" onClick={() => setSupportOpen(false)}>×</button>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Send a support request. App state, wallet and access mode are attached automatically when available.
                </div>
                <div className="hr" style={{ margin: "12px 0" }} />
                <div className="formRow">
                  <label className="label">Category</label>
                  <select className="select" value={supportCategory} onChange={(e) => setSupportCategory(e.target.value)}>
                    <option>General</option>
                    <option>Subscription</option>
                    <option>Strategist</option>
                    <option>Nexus Trading</option>
                    <option>AI Insight</option>
                    <option>Wallet</option>
                    <option>Payment</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                  </select>
                </div>
                <div className="formRow">
                  <label className="label">Email <span className="muted tiny">(required)</span></label>
                  <input
                    className="input"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="formRow">
                  <label className="label">Subject</label>
                  <input className="input" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Short summary" />
                </div>
                <div className="formRow">
                  <label className="label">Message</label>
                  <textarea className="input" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe what happened..." style={{ minHeight: 110, resize: "vertical" }} />
                </div>
                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <button className="btn" type="button" disabled={supportBusy} onClick={submitSupportTicket}>{supportBusy ? "..." : "Send Support"}</button>
                  <button className="btnGhost" type="button" onClick={() => setSupportOpen(false)}>Close</button>
                </div>
                {supportMsg ? <div className="hint" style={{ marginTop: 8 }}>{supportMsg}</div> : null}
              </div>
            </>
          )}

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
                disabled={!ENABLE_VAULT_SUBSCRIBE}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!ENABLE_VAULT_SUBSCRIBE) return;
                  setAccessTab("subscribe");
                  setSubPlan("core");
                  setSubMsg("");
                  setAccessModalOpen(true);
                }}
                title={
                  ENABLE_VAULT_SUBSCRIBE
                    ? "Subscribe (USDC/USDT)"
                    : "Vault infrastructure upgrade in progress. Trading access will activate after security deployment."
                }
                style={
                  !ENABLE_VAULT_SUBSCRIBE
                    ? { opacity: 0.55, cursor: "not-allowed" }
                    : undefined
                }
              >
                Vault System (Coming Soon)
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                      Select <b>Nexus Core</b> or the separate <b>Strategist</b> add-on. Pay with <b>USDC or USDT only</b>.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8, marginBottom: 10 }}>
                      <button
                        type="button"
                        className={`btnGhost ${subPlan === "core" ? "active" : ""}`}
                        onClick={() => { setSubPlan("core"); setSubMsg(""); }}
                        style={{ textAlign: "left", borderColor: subPlan === "core" ? "rgba(57,217,138,0.45)" : undefined, background: subPlan === "core" ? "rgba(57,217,138,0.10)" : undefined }}
                      >
                        <b>Nexus Core</b> · ${SUB_PRICE_USD}/30 days · AI Insight included
                      </button>
                      <button
                        type="button"
                        className={`btnGhost ${subPlan === "strategist_weekly" ? "active" : ""}`}
                        onClick={() => { setSubPlan("strategist_weekly"); setSubMsg(""); }}
                        style={{ textAlign: "left", borderColor: subPlan === "strategist_weekly" ? "rgba(57,217,138,0.45)" : undefined, background: subPlan === "strategist_weekly" ? "rgba(57,217,138,0.10)" : undefined }}
                      >
                        <b>Strategist Weekly</b> · ${STRATEGIST_WEEKLY_PRICE_USD}/7 days
                      </button>
                      <button
                        type="button"
                        className={`btnGhost ${subPlan === "strategist_monthly" ? "active" : ""}`}
                        onClick={() => { setSubPlan("strategist_monthly"); setSubMsg(""); }}
                        style={{ textAlign: "left", borderColor: subPlan === "strategist_monthly" ? "rgba(57,217,138,0.45)" : undefined, background: subPlan === "strategist_monthly" ? "rgba(57,217,138,0.10)" : undefined }}
                      >
                        <b>Strategist Monthly</b> · ${STRATEGIST_MONTHLY_PRICE_USD}/30 days · best value
                      </button>
                    </div>

                    <div className="formRow" style={{ marginBottom: 10 }}>
                      <label className="label">Billing email (optional)</label>
                      <input
                        className="input"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
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
                      Selected: <b>{selectedSubLabel} ${selectedSubPriceUsd}</b> · <b>{subToken}</b>
                    </div>

                    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.02)", margin: "10px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 900 }}>Auto Renew</div>
                          <div className="hint" style={{ marginTop: 4, opacity: 0.82 }}>
                            Optional. Keeps access active every 30 days with your Privy permission. USDC/USDT only.
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`pill ${access?.auto_renew_enabled ? "active" : ""}`}
                          disabled={autoRenewBusy}
                          onClick={() => setAutoRenewPreference(!access?.auto_renew_enabled)}
                          style={{
                            color: "#fff",
                            background: access?.auto_renew_enabled ? "rgba(57,217,138,0.24)" : "rgba(0,0,0,0.18)",
                            border: access?.auto_renew_enabled ? "1px solid rgba(57,217,138,0.45)" : "1px solid rgba(255,255,255,0.12)",
                            cursor: autoRenewBusy ? "wait" : "pointer"
                          }}
                        >
                          {autoRenewBusy ? "..." : (access?.auto_renew_enabled ? "Auto Renew: ON" : "Auto Renew: OFF")}
                        </button>
                      </div>

                      <div className="hint" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, opacity: 0.9 }}>
                        <span>Expires: <b>{fmtAccessDate(access?.expires_at)}</b></span>
                        <span>Next billing: <b>{fmtAccessDate(access?.next_billing_ts || access?.expires_at)}</b></span>
                        <span>Token: <b>{access?.preferred_token || subToken}</b></span>
                        <span>Chain: <b>{access?.preferred_chain || subChain}</b></span>
                      </div>
                      {autoRenewMsg ? <div className="hint" style={{ marginTop: 8 }}>{autoRenewMsg}</div> : null}
                    </div>

                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      <button className="btn" disabled={subBusy} onClick={subscribePay}>
                        {subBusy ? "..." : `Pay ${selectedSubPriceUsd} ${subToken} & Activate`}
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

                {showAccessReminder ? (
                  <div style={{
                    marginTop: 12,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "rgba(255,180,0,0.12)",
                    border: "1px solid rgba(255,180,0,0.32)"
                  }}>
                    <div style={{ fontWeight: 900 }}>⚠ Subscription expires in {Math.max(0, accessDaysLeft)} day{Math.max(0, accessDaysLeft) === 1 ? "" : "s"}</div>
                    <div className="hint" style={{ marginTop: 5, opacity: 0.9 }}>
                      Renew now to keep opening new grids and Nexus Rotation actions. Existing grids continue running.
                    </div>
                    <button
                      type="button"
                      className="btnGhost"
                      style={{ marginTop: 8 }}
                      onClick={() => {
                        setAccessTab("subscribe");
                        setSubMsg("");
                      }}
                    >
                      Renew now
                    </button>
                  </div>
                ) : null}

                {showAccessExpiredNotice ? (
                  <div style={{
                    marginTop: 12,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "rgba(255,92,92,0.12)",
                    border: "1px solid rgba(255,92,92,0.32)"
                  }}>
                    <div style={{ fontWeight: 900 }}>Subscription expired</div>
                    <div className="hint" style={{ marginTop: 5, opacity: 0.9 }}>
                      Existing grids continue running, but new grids and new rotation actions require renewal.
                    </div>
                    <button
                      type="button"
                      className="btnGhost"
                      style={{ marginTop: 8 }}
                      onClick={() => {
                        setAccessTab("subscribe");
                        setSubMsg("");
                      }}
                    >
                      Renew access
                    </button>
                  </div>
                ) : null}

                <div className="hint" style={{ marginTop: 14 }}>
                  Status: {isPro ? "ACTIVE" : "OFF"}
                  {access?.source ? ` • via ${access.source}` : ""}
                </div>
                {!isPro ? (
                  <div className="hint" style={{ marginTop: 8, opacity: 0.86 }}>
                    Demo AI: {demoAiUsedToday}/{demoAiDailyLimit} today · {demoAiMonthDaysUsed}/{demoAiMonthDaysLimit} days this month. Simulation only.
                  </div>
                ) : (
                  <div className="hint" style={{ marginTop: 8, opacity: 0.86 }}>
                    Core active. AI Insight included. Strategist: {strategistActive ? "ACTIVE" : "separate add-on ($20/7d or $50/30d)"}.
                  </div>
                )}
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                  padding: "8px 10px",
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

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                            const nextChain = normalizeWalletChainKey(c);
                            setBalActiveChain(nextChain);
                            setWsChainKey(nextChain);
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
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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

              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: 12 }}>Profit baseline</div>
                  <div className="mono" style={{ fontWeight: 900 }}>
                    {walletProfitBaseline.amountUsd ? fmtUsd(walletProfitBaseline.amountUsd) : "Not set"}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: 12 }}>Estimated profit</div>
                  <div
                    className="mono"
                    style={{
                      fontWeight: 900,
                      color: walletProfit.available
                        ? Number(walletProfit.amount || 0) >= 0
                          ? "#21d07a"
                          : "#ff8a8a"
                        : "inherit",
                    }}
                  >
                    {walletProfit.available
                      ? `${Number(walletProfit.amount || 0) >= 0 ? "+" : ""}${fmtUsd(walletProfit.amount)}${Number.isFinite(Number(walletProfit.pct)) ? ` (${Number(walletProfit.pct).toFixed(2)}%)` : ""}`
                      : "Set baseline first"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="miniBtn"
                    disabled={!wallet || walletUsdLoading || !Number.isFinite(Number(walletUsd?.total)) || Number(walletUsd?.total) <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setWalletProfitBaselineNow();
                    }}
                    title="Save the current wallet value as the baseline for future profit display."
                  >
                    Set baseline now
                  </button>
                  <button
                    type="button"
                    className="miniBtn"
                    disabled={!walletProfitBaseline.amountUsd}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearWalletProfitBaseline();
                    }}
                    title="Clear the saved profit baseline for this wallet on this browser."
                  >
                    Clear baseline
                  </button>
                </div>
                <div className="muted tiny">Profit is calculated from your saved baseline and excludes unpriced tokens.</div>
              </div>

              {balError && (
                <div style={{ marginTop: 8, color: "#ffb3b3", fontSize: 12 }}>{"Could not load balances."}</div>
              )}

              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {(showAllWalletChains ? walletChainKeys : [balActiveChain || DEFAULT_CHAIN]).map((chainRaw) => {
                  const c = normalizeWalletChainKey(chainRaw);
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
                        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.82, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                        {Object.keys(row.stables || { USDC: 0, USDT: 0 }).map((sym) => {
                          const stableBal = Number((row.stables && row.stables[sym]) ?? 0);
                          return (
                            <React.Fragment key={sym}>
                              <div>
                                <div className="muted">{sym}</div>
                                <div style={{ fontSize: 12, opacity: 0.75 }}>Value: {Number.isFinite(stableBal) ? fmtUsd(stableBal) : "—"}</div>
                              </div>
                              <div style={{ fontVariantNumeric: "tabular-nums", textAlign: "right", fontWeight: 800 }}>
                                {(row.stables && row.stables[sym]) ?? "0"}
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* User-added tokens (unlimited) */}
                      {(row.custom && row.custom.length > 0) && (
                        <div style={{ marginTop: 10 }}>
                          <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Added by you</div>
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
                            const nextChain = normalizeWalletChainKey(c);
                            setBalActiveChain(nextChain);
                            setWsChainKey(nextChain);
                            openAddToken(nextChain);
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                            The Vault always pays the connected wallet (<code style={{ fontSize: 12 }}>msg.sender</code>).
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <b>2) Send:</b> After the withdrawal is completed, you can optionally send the funds from your wallet to any other address.
                          </div>
                          <div style={{ opacity: 0.95 }}>
                            <b>Important:</b><br />
                            • Make sure you are on the correct blockchain (ETH / BNB / POL)<br />
                            • Withdraw and Send are two separate steps<br />
                            • In Demo Mode this is only shown/simulated; real withdrawal needs Live access<br />
                            • Gas fees are paid in the native coin (ETH / BNB / POL)
                          </div>

                          <hr style={{ margin: "12px 0", borderColor: "rgba(40, 255, 160, 0.35)" }} />

                          {/* DEUTSCH */}
                          <div style={{ fontWeight: 800, marginBottom: 8 }}>Withdraw &amp; Send – So funktioniert es</div>
                          <div style={{ marginBottom: 8 }}>
                            <b>1) Withdraw:</b> Das Guthaben wird zuerst aus dem Vault zurück in dein verbundenes Privy-Wallet ausgezahlt.
                            Der Vault zahlt immer an das verbundene Wallet (<code style={{ fontSize: 12 }}>msg.sender</code>).
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <b>2) Send:</b> Nach dem Withdraw kannst du die Coins optional von deinem Wallet an eine beliebige Adresse weiterleiten.
                          </div>
                          <div style={{ opacity: 0.95 }}>
                            <b>Wichtig:</b><br />
                            • Du musst auf der richtigen Blockchain sein (ETH / BNB / POL)<br />
                            • Withdraw und Send sind zwei getrennte Schritte<br />
                            • Im Demo Mode wird das nur angezeigt/simuliert; echter Withdraw braucht Live-Zugang<br />
                            • Gas-Gebühren werden in der Native Coin bezahlt (ETH / BNB / POL)
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Deposit to Vault (native • security gate ready)</div>
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
                        padding: "8px 10px",
                        borderRadius: 12,
                        fontWeight: 800,
                        lineHeight: 1.28,
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

                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
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

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Withdraw amount</div>
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
                    <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Send to address</div>
                    <input
                      className="input"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      placeholder="0x…"
                      style={{ width: "100%", height: 44, fontSize: 14, fontFamily: "monospace", background: "linear-gradient(180deg, rgba(0,255,166,0.18), rgba(0,210,140,0.12))", color: "#ffffff", caretColor: "#ffffff", border: "none", borderRadius: 10, padding: "0 12px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
                    <div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Amount</div>
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

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
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
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {ENABLED_CHAINS.map((chainOpt) => {
                      const opt = normalizeWalletChainKey(chainOpt);
                      const active = normalizeWalletChainKey(addTokenChain) === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={active ? "btn" : "btnGhost"}
                          style={{ padding: "8px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAddTokenChain(opt);
                            setBalActiveChain(opt);
                            setWsChainKey(opt);
                            setAddTokenErr("");
                            loadTokenList(opt);
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    Active: <b>{walletChainDisplayName(addTokenChain)}</b> ({normalizeWalletChainKey(addTokenChain)})
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
                    <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Results (click to add)</div>
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
                              padding: "8px 10px",
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
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
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
                      <p><b>Was ist das?</b> Compare vergleicht bis zu 20 Coins aus deiner Watchlist-Compare-Auswahl.</p>
                      <p><b>Price</b> zeigt die echten Preiswerte. <b>Index 100</b> normalisiert alle Coins auf denselben Startwert 100 und ist besser, wenn viele Coins gleichzeitig verglichen werden.</p>
                      <p><b>Overlay</b> zeigt alle gewählten Coins in einem gemeinsamen Chart. <b>Grid</b> zeigt pro Coin eine kleine Kachel.</p>
                      <p><b>First 10 / Next 10 / All</b> steuert, ob du die ersten 10, die zweiten 10 oder alle Compare-Coins sehen willst.</p>
                      <p><b>Grid-Detail:</b> Klick auf eine Kachel öffnet den großen Chart. Dort kannst du direkt zwischen Price und Index 100 umschalten.</p>
                      <p><b>Legende:</b> Farbe → Coin. Klick auf einen Eintrag hebt einen Coin hervor.</p>
                      <p><b>Custom Weighting:</b> Wenn OFF aktiv ist, nutzt Compare die System-Gewichtung. Wenn ON aktiv ist, bleibt der Bereich trotzdem kompakt; über Settings kannst du die 5 Regler aufklappen. Die Summe kann nie über 100% gehen.</p>
                      <p><b>Pair-Liste:</b> zeigt die stärksten Coin-Paare aus den aktuellen Compare-Daten.</p>
                      <ul>
                        <li><b>Pair Score</b> → Stärke der Pair-Struktur</li>
                        <li><b>Spread</b> → Performance-Abstand zwischen zwei Coins</li>
                        <li><b>Δ</b> → Stärke-Abweichung innerhalb des Pairs</li>
                        <li><b>⚡ Movement</b> → ungewöhnliche Bewegung / erhöhte Aktivität, kein Buy-Signal</li>
                      </ul>
                      <p><b>Klick auf ein Pair</b> öffnet Details wie Performance, tägliche Moves, Spread und Erklärung.</p>
                      <p><b>RSI (Relative Strength Index)</b> zeigt Momentum, nicht echtes Kaufvolumen.</p>
                      <ul>
                        <li><b>Overbought (Rot)</b> → stark gestiegen / eventuell überhitzt.</li>
                        <li><b>Neutral (Gelb)</b> → ausgeglichener Markt.</li>
                        <li><b>Oversold (Grün)</b> → stark gefallen / möglicher Rebound.</li>
                      </ul>
                      <p className="muted tiny">RSI zeigt Extreme, aber keine direkten Buy/Sell-Signale.</p>
                    </>
                  }
                  en={
                    <>
                      <p><b>What is this?</b> Compare compares up to 20 coins from your Watchlist Compare selection.</p>
                      <p><b>Price</b> shows real price values. <b>Index 100</b> normalizes all coins to the same starting value of 100 and is better when many coins are compared at the same time.</p>
                      <p><b>Overlay</b> shows all selected coins in one shared chart. <b>Grid</b> shows a small tile for each coin.</p>
                      <p><b>First 10 / Next 10 / All</b> controls whether you see the first 10, the next 10, or all selected Compare coins.</p>
                      <p><b>Grid detail:</b> Click a tile to open the large chart. There you can switch directly between Price and Index 100.</p>
                      <p><b>Legend:</b> Color → Coin. Click a legend entry to highlight one coin.</p>
                      <p><b>Custom Weighting:</b> When OFF is active, Compare uses system weighting. When ON is active, the area stays compact; open Settings to adjust the 5 sliders. The total can never exceed 100%.</p>
                      <p><b>Pair list:</b> shows the strongest coin pairs from the current Compare data.</p>
                      <ul>
                        <li><b>Pair Score</b> → strength of the pair structure</li>
                        <li><b>Spread</b> → performance distance between two coins</li>
                        <li><b>Δ</b> → strength gap inside the pair</li>
                        <li><b>⚡ Movement</b> → unusual movement / elevated activity, not a buy signal</li>
                      </ul>
                      <p><b>Click a pair</b> to open details such as performance, daily moves, spread and explanation.</p>
                      <p><b>RSI (Relative Strength Index)</b> shows momentum, not actual buy volume.</p>
                      <ul>
                        <li><b>Overbought (Red)</b> → strong recent rise, may be overheated.</li>
                        <li><b>Neutral (Yellow)</b> → balanced market.</li>
                        <li><b>Oversold (Green)</b> → strong recent selling, possible rebound.</li>
                      </ul>
                      <p className="muted tiny">RSI indicates extremes, not direct buy/sell signals.</p>
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
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              paddingBottom: 14
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div className="label" style={{ marginBottom: 0 }}>Compare Score Weighting</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="ghostBtn tiny"
                    onClick={() => {
                      setCustomCompareWeightsOn((v) => {
                        const next = !v;
                        if (!next) setCompareWeightsExpanded(false);
                        return next;
                      });
                    }}
                    title={customCompareWeightsOn ? "Disable custom weighting and use system values" : "Enable custom weighting"}
                    style={{
                      background: "rgba(255,255,255,.025)",
                      border: "1px solid rgba(255,255,255,.10)",
                      color: "rgba(255,255,255,.72)",
                      boxShadow: "none"
                    }}
                  >
                    Custom Weighting:{" "}
                    <span
                      style={{
                        color: customCompareWeightsOn ? "#22c55e" : "#ef4444",
                        fontWeight: 800
                      }}
                    >
                      {customCompareWeightsOn ? "ON" : "OFF"}
                    </span>
                  </button>
                  {customCompareWeightsOn && (
                    <button
                      className="ghostBtn tiny"
                      onClick={() => setCompareWeightsExpanded((v) => !v)}
                      title={compareWeightsExpanded ? "Hide weighting settings" : "Open weighting settings"}
                      style={{
                        background: "rgba(255,255,255,.025)",
                        border: "1px solid rgba(255,255,255,.10)",
                        color: "rgba(255,255,255,.72)",
                        boxShadow: "none"
                      }}
                    >
                      Settings {compareWeightsExpanded ? "▲" : "▼"}
                    </button>
                  )}
                </div>
              </div>

              {customCompareWeightsOn && compareWeightsExpanded && (
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                  <div className="muted tiny" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>Total {compareWeightsTotal}% · Remaining {compareWeightsRemaining}%</span>
                    <button className="ghostBtn tiny" onClick={resetCompareWeights} title="Reset to system default weights">
                      Reset
                    </button>
                  </div>
                  {COMPARE_WEIGHT_KEYS.map((key) => {
                    const current = Number(safeCompareWeights[key] || 0);
                    const otherTotal = COMPARE_WEIGHT_KEYS.filter((k) => k !== key).reduce((sum, k) => sum + Number(safeCompareWeights[k] || 0), 0);
                    const maxAllowed = Math.max(0, 100 - otherTotal);
                    return (
                      <label key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }} title={COMPARE_WEIGHT_HELP[key]}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span className="muted tiny" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{COMPARE_WEIGHT_LABELS[key]} <span title={COMPARE_WEIGHT_HELP[key]} style={{ opacity: 0.75, cursor: "help" }}>ⓘ</span></span>
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

            <div className="compareChart" style={{ minHeight: 0, overflow: "visible" }}>
              <div className="chartHeader">
                <div className="label"></div>
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
                    <SvgChart chart={chartRaw} height={movementPanelOpen ? 205 : 255} highlightedSyms={visibleHighlightedSyms} onHoverSym={() => {}} indexMode={indexMode} timeframe={timeframe} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
                    <div style={{ marginTop: 6 }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className={String(bestPairsSortMode || "score") === "spread" ? "btn tiny" : "ghostBtn tiny"}
                      title="Sort by largest 30D spread first. Click again to return to score ranking."
                      onClick={() => toggleBestPairsSort("spread")}
                    >
                      Spread
                    </button>
                    <button
                      className={movementPanelOpen ? "btn tiny" : "ghostBtn tiny"}
                      title="Open Movement Opportunities. This does not change the main pair ranking."
                      onClick={() => setMovementPanelOpen((v) => !v)}
                    >
                      ⚡ Movement{bestPairUiAlerts.length ? ` (${bestPairUiAlerts.length})` : ""}
                    </button>
                    <button className="ghostBtn tiny" onClick={() => setShowTop10Pairs(v => !v)}>
                      {showTop10Pairs ? "Show all pairs" : "Show top 10"}
                    </button>
                  </div>
                </div>

                
                {movementPanelOpen && bestPairUiAlerts.length ? (
                  <div style={{
                    border: "1px solid rgba(255,184,0,.14)",
                    borderRadius: 12,
                    background: "rgba(255,184,0,.04)",
                    padding: "8px 10px",
                    marginBottom: 10,
                    height: 270,
                    maxHeight: 270,
                    minHeight: 270,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 8
                    }}>
                      <div>
                        <div className="label" style={{ marginBottom: 2 }}>⚡ Movement Opportunities ({bestPairUiAlerts.length})</div>
                        <div className="muted tiny">
                          Discovery-only setups. Main pair ranking stays purely data-fit based.
                        </div>
                      </div>

                      <button
                        className="ghostBtn tiny"
                        onClick={() => setMovementPanelOpen(false)}
                      >
                        Close
                      </button>
                    </div>

                    <div style={{
                      display: "grid",
                      gap: 5,
                      height: 205,
                      maxHeight: 205,
                      minHeight: 205,
                      overflowY: "auto",
                      paddingRight: 4,
                      paddingBottom: 6,
                      alignContent: "start"
                    }}>
                      {(bestPairUiAlerts || [])
                        .map((al) => {
                          const match = (bestPairsAll || []).find(
                            (p) => String(p?.pair || "").toUpperCase() === String(al?.pair || "").toUpperCase()
                          );

                          return (
                            <button
                              key={`${al.pair}-${al.type}`}
                              type="button"
                              className="ghostBtn tiny"
                              onClick={() => {
                                if (match) openPairExplain(match);
                              }}
                              style={{
                                justifyContent: "flex-start",
                                textAlign: "left",
                                padding: "6px 8px",
                                opacity: 0.9
                              }}
                              title={`Open movement opportunity${al.source_rank ? ` · source rank #${al.source_rank}` : ""}${Number.isFinite(Number(al.score)) ? ` · score ${Number(al.score).toFixed(1)}` : ""}`}
                            >
                              ⚡ <b>{al.pair}</b>
                              <span className="muted tiny" style={{ marginLeft: 8 }}>
                                {aiTagLabel(al.type)}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ) : null}


                <div
                  className="pairsScroll"
                  style={{
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.02)",
                    boxSizing: "border-box",
                    marginTop: movementPanelOpen ? 0 : 6,

                    minHeight: 0,
                    maxHeight: movementPanelOpen ? "0px" : "clamp(230px, 31vh, 360px)",
                    height: movementPanelOpen ? "0px" : "clamp(230px, 31vh, 360px)",
                    padding: movementPanelOpen ? "0px" : "8px",
                    borderWidth: movementPanelOpen ? 0 : 1,
                    opacity: movementPanelOpen ? 0 : 1,
                    pointerEvents: movementPanelOpen ? "none" : "auto",
                    overflowY: movementPanelOpen ? "hidden" : "auto",
                    overflowX: "hidden",
                    paddingBottom: movementPanelOpen ? 0 : 8,
                    scrollbarGutter: "stable",
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
                      const movementPairKey = String(p?.pair || "").toUpperCase().trim();
                      const hasMovementChance = bestPairAlertPairSet.has(movementPairKey);
                      const movementTone = bestPairAlertToneByPair[movementPairKey] || "low";
                      const movementChanceScore = Number.isFinite(Number(p?.movement_chance_score ?? p?.movementChanceScore))
                        ? Number(p?.movement_chance_score ?? p?.movementChanceScore)
                        : Number(bestPairAlertScoreByPair[movementPairKey]);

                      return (
                        <div
                          key={p.pair}
                          className="pairRow"
                          style={{
                            gap: 8,
                            cursor: "pointer",
                            marginBottom: 0,
                            alignItems: "center",
                          }}
                          onClick={(e) => { e.stopPropagation(); openPairExplain(p); }}
                        >
                          <span
                            className="muted"
                            title={hasMovementChance ? `${p.pair} has a Movement Opportunity. Position is unchanged; movement does not affect ranking.` : undefined}
                            style={{
                              width: 34,
                              textAlign: "right",
                              flex: "0 0 34px",
                              color: hasMovementChance ? "#ffd166" : undefined,
                            }}
                          >#{i + 1}</span>

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
                            <span
                              className="pairName"
                              style={{
                                minWidth: 0,
                                whiteSpace: "nowrap",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                overflow: "hidden",
                              }}
                            >
                              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{p.pair}</span>
                            </span>

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
                            {Number.isFinite(Number(p?.movement_quality_score)) ? (() => {
                              const mq = getMovementQualityUi(p.movement_quality_score);
                              return (
                                <span
                                  className="tiny"
                                  title={(Array.isArray(p?.movement_quality_reasons) ? p.movement_quality_reasons.join(", ") : p?.movement_rejection_reason) || "Movement Quality Filter v2"}
                                  style={{ border: `1px solid ${mq.border}`, borderRadius: 999, padding: "2px 6px", color: mq.color, fontWeight: 950 }}
                                >
                                  MQ {mq.label} {Math.round(Number(p.movement_quality_score))}
                                </span>
                              );
                            })() : null}
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
                  <div className="muted tiny" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
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
                      <div style={{ display: "grid", gap: 8 }}>
                        <div className="label">Performance (same period)</div>
                        {pairExplainLoading && <div className="muted tiny">Loading pair data…</div>}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                                    <text x={6} y={syQ(tick) + 4} fill="rgba(232,242,240,0.88)" fontSize="11" fontWeight="700">{_fmtPctLocal(tick)}</text>
                                  </g>
                                ))}
                                <path d={pathDQ} fill="none" stroke="#35e0a1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                                {Number.isFinite(latestSpreadQuick) ? (
                                  <>
                                    <circle cx={latestXQ} cy={latestYQ} r="4" fill="#35e0a1" />

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
                              <div className="tiny" style={{ display: "flex", flexWrap: "wrap", gap: 8, color: quality.color }}>
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

                {selectedPairLocalAlerts.length ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                      border: selectedPairAlertTone === "high" ? "1px solid rgba(255,184,0,0.42)" : "1px solid rgba(255,193,7,0.26)",
                      borderRadius: 12,
                      padding: "12px",
                      background: selectedPairAlertTone === "high" ? "rgba(255,184,0,0.10)" : "rgba(255,193,7,0.06)",
                      boxShadow: selectedPairAlertTone === "high" ? "0 0 22px rgba(255,184,0,0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div>
                        <div className="muted tiny" style={{ color: "#ffd166", fontWeight: 900 }}>AI Movement Alert Preview</div>
                        <div style={{ fontWeight: 900, marginTop: 4 }}>
                          Hey — {selectedPairMainAlert?.pair || selectedPair?.pair} shows unusual movement pressure.
                        </div>
                      </div>
                      <span
                        className="pill"
                        style={{
                          background: selectedPairAlertTone === "high" ? "rgba(255,184,0,0.16)" : "rgba(255,255,255,0.05)",
                          borderColor: selectedPairAlertTone === "high" ? "rgba(255,184,0,0.55)" : "rgba(255,193,7,0.28)",
                          color: "#ffd166",
                          fontWeight: 900,
                        }}
                      >
                        {String(selectedPairMainAlert?.strength || "watch").toUpperCase()}
                      </span>
                    </div>
                    <div className="muted" style={{ lineHeight: 1.5 }}>
                      This pair is not necessarily a clean top setup, but the scanner found {selectedPairLocalAlerts.map((a) => (a.reasons || []).join(" / ")).filter(Boolean).join(" · ") || "spread, RSI or momentum anomalies"}.
                      Even weak or lower-ranked pairs can create short-term profit chances when volatility, spread movement, RSI divergence or rebound pressure increases. Risk stays elevated, so this should be treated as a movement signal, not a quality recommendation.
                    </div>
                    <div className="muted tiny" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {selectedPairMainAlert?.spread_pct != null ? <span>Spread {Number(selectedPairMainAlert.spread_pct).toFixed(1)}%</span> : null}
                      {selectedPairMainAlert?.rsi_gap != null ? <span>RSI gap {Number(selectedPairMainAlert.rsi_gap).toFixed(0)}</span> : null}
                      {selectedPairMainAlert?.corr != null ? <span>Corr {Number(selectedPairMainAlert.corr).toFixed(2)}</span> : null}
                      <span>Open AI Insight for the full explanation before taking action.</span>
                    </div>
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div className="label">AI commentary (optional)</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button
                        className={normalizedAiInsightMode === "extreme" ? "btn" : "btnGhost"}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAiInsightMode(normalizedAiInsightMode === "extreme" ? "standard" : "extreme");
                        }}
                        title="Toggle AI Insight between Standard and Extreme mode"
                      >
                        {normalizedAiInsightMode === "extreme" ? "Extreme ON" : "Standard AI"}
                      </button>
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
                  </div>
                  {aiExplainData ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">AI Verdict</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.setup}</div>
                        </div>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">Confidence</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.confidenceLabel} ({aiExplainData.confidence}/10)</div>
                        </div>
                        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                          <div className="muted tiny">Risk</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.risk}</div>
                        </div>
                        <div style={{
                          border: `1px solid ${aiExplainData.aiMode === "extreme" ? "rgba(255,184,0,0.35)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 12,
                          padding: "8px 10px",
                          background: aiExplainData.aiMode === "extreme" ? "rgba(255,184,0,0.08)" : "rgba(255,255,255,0.03)"
                        }}>
                          <div className="muted tiny">Insight Mode</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.effectiveMode || (aiExplainData.aiMode === "extreme" ? "Extreme" : "Standard")}</div>
                        </div>
                        <div style={{
                          border: `1px solid ${aiExplainData?.adaptiveThresholds?.customOn ? "rgba(34,197,94,0.32)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 12,
                          padding: "8px 10px",
                          background: aiExplainData?.adaptiveThresholds?.customOn ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)"
                        }}>
                          <div className="muted tiny">Adaptive Lens</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData?.adaptiveProfile || "Balanced adaptive"}</div>
                        </div>
                        <div style={{
                          border: `1px solid ${aiExplainData?.strategistMemory?.used ? "rgba(96,165,250,0.32)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 12,
                          padding: "8px 10px",
                          background: aiExplainData?.strategistMemory?.used ? "rgba(96,165,250,0.07)" : "rgba(255,255,255,0.03)"
                        }}>
                          <div className="muted tiny">Strategist Memory</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData?.strategistMemory?.used ? (aiExplainData?.strategistMemory?.bias || "active") : "learning"}</div>
                        </div>
                        <div style={{
                          border: `1px solid ${aiExplainData?.aiInsightBridge?.used ? "rgba(168,85,247,0.32)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: 12,
                          padding: "8px 10px",
                          background: aiExplainData?.aiInsightBridge?.used ? "rgba(168,85,247,0.07)" : "rgba(255,255,255,0.03)"
                        }}>
                          <div className="muted tiny">AI Insight Bridge</div>
                          <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData?.aiInsightBridge?.used ? (aiExplainData?.aiInsightBridge?.bias || "active") : "learning"}</div>
                        </div>
                      </div>

                      {(() => {
                        const aiSections = _parseAiConclusionSections(aiExplainData);
                        const hasSections = Object.values(aiSections).some(Boolean);
                        return (
                          <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
                            <div className="label" style={{ marginBottom: 0 }}>AI Conclusion</div>
                            {hasSections ? (
                              <div style={{ display: "grid", gap: 8 }}>
                                <AiInsightCard title="Market Structure" value={aiSections.market_structure} tone="structure" />
                                <AiInsightCard title="Liquidity State" value={aiSections.liquidity_state} tone="liquidity" />
                                <AiInsightCard title="Risk Posture" value={aiSections.risk_posture} tone="risk" />
                                <AiInsightCard title="Tactical Read" value={aiSections.tactical_read} tone="tactical" />
                              </div>
                            ) : (
                              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.4 }}>
                                {aiExplainData.verdictText || "No clear AI conclusion available yet."}
                              </div>
                            )}
                            <div className="muted tiny" style={{ lineHeight: 1.5 }}>
                              {aiExplainData.winner && aiExplainData.loser
                                ? `Observed relative bias: ${aiExplainData.winner} is currently stronger than ${aiExplainData.loser} in this read.`
                                : "This conclusion is descriptive only and should not be read as an automatic trade command."}
                            </div>
                          </div>
                        );
                      })()}

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
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: rsiAState.tone }}>
                                  <div className="muted tiny">{a} RSI</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{Number.isFinite(rsiA) ? rsiA.toFixed(1) : "—"}</div>
                                  <div className="pill" style={{ marginTop: 8, width: "fit-content", background: rsiAState.tone, borderColor: rsiAState.border, color: rsiAState.color }}>{rsiAState.label}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: rsiBState.tone }}>
                                  <div className="muted tiny">{b} RSI</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{Number.isFinite(rsiB) ? rsiB.toFixed(1) : "—"}</div>
                                  <div className="pill" style={{ marginTop: 8, width: "fit-content", background: rsiBState.tone, borderColor: rsiBState.border, color: rsiBState.color }}>{rsiBState.label}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                                  <div className="muted tiny">Correlation</div>
                                  <div style={{ fontWeight: 900, marginTop: 4 }}>{corrText}</div>
                                  <div className="muted tiny" style={{ marginTop: 8 }}>{Number.isFinite(corrVal) ? (Math.abs(corrVal) >= 0.8 ? "High pair linkage" : Math.abs(corrVal) >= 0.6 ? "Moderate linkage" : "Low linkage") : "Pair linkage unclear"}</div>
                                </div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
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
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Health Score</div><div style={{ fontWeight: 900, marginTop: 4 }}>{healthScore}/100</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">Grid Fit</div><div style={{ fontWeight: 900, marginTop: 4 }}>{gridFit}</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">{a} Vol / DD</div><div style={{ fontWeight: 900, marginTop: 4 }}>{_fmtPctLocal(st30A?.volPct)} / {_fmtPctLocal(st30A?.maxDDPct)}</div></div>
                                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}><div className="muted tiny">{b} Vol / DD</div><div style={{ fontWeight: 900, marginTop: 4 }}>{_fmtPctLocal(st30B?.volPct)} / {_fmtPctLocal(st30B?.maxDDPct)}</div></div>
                              </div>
                              <div className="muted tiny" style={{ lineHeight: 1.45 }}>This panel currently reflects local risk metrics based on volatility and drawdown.</div>
                            </div>


                          </>
                        );
                      })()}

                      <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px", background: "rgba(255,255,255,0.02)" }}>
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
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                            <div className="muted tiny">Suggested Grid</div>
                            <div style={{ fontWeight: 900, marginTop: 4 }}>{aiExplainData.gridRange || aiExplainData.range || "—"}</div>
                          </div>
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
                            <div className="muted tiny">Mode</div>
                            <div style={{ fontWeight: 900, marginTop: 4 }}>
                              {aiExplainData.aiMode === "extreme" ? (aiExplainData.gridMode || "Extreme Scout") : (aiExplainData.gridMode || aiExplainData.mode || "—")}
                            </div>
                          </div>
                          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "8px 10px", background: "rgba(255,255,255,0.03)" }}>
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
                            <div className="tiny" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                      <p><b>Grid Trader</b> ist der gemeinsame Order-Bereich fuer <b>Nexus Grid</b>, <b>Nexus Rotation</b> und <b>Nexus Trading</b>.</p>
                      <p>Alle drei Bereiche erstellen Orders ueber denselben zentralen Order-Core. Sichtbare Orders werden wallet-gebunden in <b>SQLite grid_orders</b> gespeichert. Stop/Delete/Resume nutzen denselben schnellen Flow.</p>

                      <p><b>Budget-System:</b> Das Budget ist der maximale Betrag, den der jeweilige Modus verwenden darf. Nexus Trading darf nach der Freigabe nicht mehr Kapital einsetzen als vom User genehmigt wurde.</p>
                      <p><b>Slot-System:</b> Das Budget wird in einzelne Slots aufgeteilt. Jeder Slot ist ein eigenes taktisches Setup mit eigener Prioritaet. Ein Slot kann warten, aktiv werden oder blockiert bleiben, je nach Confidence, Liquiditaet, Risiko und Marktstruktur.</p>

                      <p><b>Slot-Farben:</b></p>
                      <p><b style={{ color: '#21d07a' }}>Gruen / ACTIVE:</b> Bedingungen sind stark genug. Der Slot ist bereit oder aktiv.</p>
                      <p><b style={{ color: '#ffc107' }}>Gelb / WAIT:</b> Die Richtung ist interessant, aber es fehlt noch Bestaetigung. Die AI beobachtet weiter und wartet auf bessere Bedingungen.</p>
                      <p><b style={{ color: '#ff6b6b' }}>Rot / BLOCKED:</b> Risiko, Confidence oder Liquiditaet sind aktuell nicht gut genug. Die AI blockiert den Slot bewusst, statt einen schlechten Entry zu nehmen.</p>

                      <p><b>Nexus Grid:</b> manueller Order-Modus. Du waehlst Network, Coin, Budget, Side, Preis und Payout Asset. <b>Approve Budget</b> reserviert das Grid-Budget lokal; <b>Add Order</b> erstellt die Order. Das Budget gilt fuer alle offenen Grid-Orders zusammen, nicht pro Order.</p>

                      <p><b>Nexus Rotation:</b> Recommendation-basierter Order-Modus. Du waehlst eine Watchlist-/Rotation-Empfehlung, setzt ein Rotation-Budget, waehlst das Payout Asset und erstellst danach eine Rotation-Order. Die Order bleibt technisch dieselbe Order-Struktur, wird aber intern als <b>source = ROTATION</b> markiert.</p>

                      <p><b>Nexus Trading:</b> autonomer Trading-Modus nach Budget-Freigabe. Du definierst Budget, Slots, Runtime, Style, erlaubte Assets/Chains, Risk Mode, Drawdown, Profit Lock, Slippage und Max Trades. Danach arbeitet Nexus Trading innerhalb dieser Grenzen selbststaendig.</p>
                      <p><b>HOLD / OBSERVE:</b> Nach einem Risk Exit, Protect oder Stop wird Kapital zuerst geschuetzt. Die HOLD-Zeit ist ein Mindestschutz von 1-12h. Nach Ablauf darf Nexus nicht blind neu einsteigen; der Strategist prueft weiter Marktstruktur, Liquiditaet, RVOL und Risiko.</p>
                      <p><b>Kein Blind-Reentry:</b> Wenn der Markt nach HOLD weiterhin schlecht ist, bleibt der Slot in OBSERVE. Nach der maximalen Beobachtungszeit muss der User Kapital wieder freigeben, bevor Nexus Trading neu allokieren darf.</p>
                      <p><b>Wichtig:</b> WAIT oder BLOCKED ist kein Fehler. Es bedeutet, dass das System lieber wartet oder blockiert, wenn Qualitaet und Risiko noch nicht passen. Lieber kein Trade als ein schlechter Trade.</p>

                      <p><b>Payout Asset:</b> bestimmt, wohin eine ausgefuehrte Order settled, z. B. USDC oder USDT. Wenn zu wenig direktes Asset vorhanden ist, kann Nexus einen Funding-/Swap-Vorschlag anzeigen. Nichts wird automatisch geswapt, bevor der User zustimmt.</p>

                      
                    </>
                  }
                  en={
                    <>
                      <p><b>Grid Trader</b> is the shared order area for <b>Nexus Grid</b>, <b>Nexus Rotation</b>, and <b>Nexus Trading</b>.</p>
                      <p>All three areas create orders through the same central order core. Visible orders are wallet-bound and stored in <b>SQLite grid_orders</b>. Stop/Delete/Resume use the same fast path.</p>

                      <p><b>Budget System:</b> The budget is the maximum amount the selected mode may use. Nexus Trading may not use more capital than the user has approved.</p>
                      <p><b>Slot System:</b> The budget is divided into tactical slots. Each slot is its own setup with its own priority. A slot can wait, activate or stay blocked depending on confidence, liquidity, risk and market structure.</p>

                      <p><b>Slot Colors:</b></p>
                      <p><b style={{ color: '#21d07a' }}>Green / ACTIVE:</b> Conditions are strong enough. The slot is ready or active.</p>
                      <p><b style={{ color: '#ffc107' }}>Yellow / WAIT:</b> The direction is interesting, but confirmation is still missing. The AI keeps monitoring and waits for better conditions.</p>
                      <p><b style={{ color: '#ff6b6b' }}>Red / BLOCKED:</b> Risk, confidence or liquidity are not good enough yet. The AI intentionally blocks the slot instead of taking a weak entry.</p>

                      <p><b>Nexus Grid:</b> manual order mode. You choose network, coin, budget, side, price, and payout asset. <b>Approve Budget</b> reserves the Grid budget locally; <b>Add Order</b> creates the order. The budget is shared across all open Grid orders, not per order.</p>

                      <p><b>Nexus Rotation:</b> recommendation-based order mode. You select a Watchlist/Rotation recommendation, set a Rotation budget, choose the payout asset, then create a Rotation order. Technically it uses the same order structure, but is marked internally as <b>source = ROTATION</b>.</p>

                      <p><b>Nexus Trading:</b> autonomous trading mode after budget approval. The user defines budget, slots, runtime, style, allowed assets/chains, risk mode, drawdown, profit lock, slippage and max trades. After that, Nexus Trading works independently inside those limits.</p>
                      <p><b>HOLD / OBSERVE:</b> After a Risk Exit, Protect or Stop, capital is protected first. HOLD is a minimum protection period from 1-12h. When it expires, Nexus must not blindly re-enter; the Strategist keeps checking market structure, liquidity, RVOL and risk.</p>
                      <p><b>No blind re-entry:</b> If the market is still weak after HOLD, the slot stays in OBSERVE. After the maximum observation window, the user must release the capital again before Nexus Trading may allocate it.</p>
                      <p><b>Important:</b> WAIT or BLOCKED is not an error. It means the system prefers to wait or block if quality and risk are not good enough. No trade is better than a bad trade.</p>

                      <p><b>Payout Asset:</b> defines where an executed order settles, for example USDC or USDT. If the direct asset is insufficient, Nexus can show a funding/swap suggestion. Nothing is swapped automatically before user approval.</p>

                      
                    </>
                  }
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="gridLayout">
            <div className="gridLeft">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
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
                  ["trading", "Nexus Trading"],
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

              {strategistBridge ? (
                <div
                  style={{
                    marginBottom: 10,
                    padding: "9px 11px",
                    borderRadius: 12,
                    border: "1px solid rgba(34,197,94,.34)",
                    background: "linear-gradient(180deg, rgba(34,197,94,.12), rgba(34,197,94,.055))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "grid", gap: 3 }}>
                    <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: ".04em", textTransform: "uppercase", color: "#dfffee" }}>
                      Strategist Setup Loaded
                    </div>
                    <div className="muted tiny">
                      <b>{strategistBridge.sym}</b> → <b>{strategistBridge.label}</b>{strategistBridge.confidence ? <> · Confidence: <b>{strategistBridge.confidence}</b></> : null}
                    </div>
                    {strategistBridge.note ? (
                      <div className="muted tiny">
                        {strategistBridge.note}
                      </div>
                    ) : null}
                    {String(gridMode || "normal") === "rotation" && Array.isArray(strategistRotationCandidates) && strategistRotationCandidates.length > 1 ? (
                      <div
                        style={{
                          marginTop: 7,
                          padding: "7px 8px",
                          borderRadius: 10,
                          border: "1px solid rgba(34,197,94,.24)",
                          background: "rgba(34,197,94,.08)",
                          display: "grid",
                          gap: 6,
                        }}
                      >
                        <div className="muted tiny" style={{ fontWeight: 900, color: "#dfffee" }}>
                          Strategist candidates · direkt wählen
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {strategistRotationCandidates.map((c, idx) => {
                            const active = String(rotationSelectedPick?.source || "").toUpperCase() === String(c?.sym || "").toUpperCase();
                            return (
                              <button
                                key={`setup-${c.sym}-${idx}`}
                                type="button"
                                className="btnGhost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRotationPickToGrid(c);
                                  setErrorMsg(`Prepared ${c.sym} from Strategist candidates in Nexus Rotation.`);
                                }}
                                title={c.sourceLine || "Select Strategist candidate for Nexus Rotation"}
                                style={{
                                  height: 26,
                                  paddingInline: 9,
                                  fontSize: 12,
                                  borderColor: active ? "rgba(34,197,94,.75)" : c.rank === "AVOID" ? "rgba(239,68,68,.35)" : undefined,
                                  background: active ? "rgba(34,197,94,.18)" : c.rank === "AVOID" ? "rgba(239,68,68,.08)" : undefined,
                                  color: active ? "#dfffee" : c.rank === "AVOID" ? "#fecaca" : undefined,
                                }}
                              >
                                {c.rank === "BEST" ? "BEST · " : c.rank === "AVOID" ? "AVOID · " : c.rank === "SECONDARY" ? "ALT · " : ""}{c.sym}{Number.isFinite(Number(c.spreadPct)) ? ` · ${Number(c.spreadPct).toFixed(2)}%` : ""}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {Array.isArray(strategistBridge.appliedSettings) && strategistBridge.appliedSettings.length ? (() => {
                      const appliedSettings = strategistBridge.appliedSettings;
                      const changedCount = appliedSettings.filter((item) => item?.changed).length;
                      const unchangedCount = Math.max(0, appliedSettings.length - changedCount);
                      return (
                        <div
                          style={{
                            marginTop: 7,
                            borderRadius: 10,
                            border: "1px solid rgba(34,197,94,.22)",
                            background: "rgba(0,0,0,.16)",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setStrategistAppliedOpen((v) => !v)}
                            aria-expanded={strategistAppliedOpen}
                            title="Show or hide applied Strategist trading settings"
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "#dfffee",
                              padding: "7px 9px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                              <span style={{ fontSize: 12, lineHeight: 1 }}>{strategistAppliedOpen ? "▾" : "▸"}</span>
                              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" }}>
                                Strategist Applied Settings
                              </span>
                            </span>
                            <span className="muted tiny" style={{ whiteSpace: "nowrap" }}>
                              {changedCount} updated · {unchangedCount} unchanged
                            </span>
                          </button>

                          {strategistAppliedOpen ? (
                            <div
                              style={{
                                padding: "2px 9px 8px",
                                display: "grid",
                                gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr",
                                gap: 6,
                              }}
                            >
                              {appliedSettings.map((item) => (
                                <div key={item.label} className="muted tiny" style={{ lineHeight: 1.35 }}>
                                  <b style={{ color: "#eafff5" }}>{item.label}:</b> {item.value} <span style={{ color: item.changed ? "#86efac" : "#9fb8ad" }}>· {item.changed ? "changed" : "already same"}</span>
                                  <br />
                                  <span style={{ color: "#8fb2a4" }}>Source: Strategist · Before: {item.previous}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })() : null}
                  </div>
                  <button
                    className="btnGhost"
                    type="button"
                    onClick={() => setStrategistBridge(null)}
                    title="Hide Strategist setup notice"
                    style={{ height: 28, paddingInline: 10, fontSize: 12 }}
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              {String(gridMode || "normal") === "rotation" ? (
                <div className="gridWrap">
                  <div className="gridControls" style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        padding: "8px 10px",
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
                          const rotationAllocatedUsd = (Array.isArray(rotationSessions) ? rotationSessions : []).reduce((sum, sess) => sum + (Number(sess?.budgetUsd) || 0), 0);
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
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          Mode
                          <span
                            title="Recommendation first uses Nexus ranking before creating Rotation orders. Manual confirm lets you select and confirm targets yourself. Auto after release is more aggressive and should only be used when the budget/risk setup is clear."
                            style={{ opacity: 0.75, cursor: "help", fontSize: 12 }}
                          >
                            ⓘ
                          </span>
                        </label>
                        <select value={rotationMode} onChange={(e) => { setRotationMode(e.target.value); setRotationBudgetReleased(false); }}>
                          <option value="RECOMMENDATION">Recommendation first</option>
                          <option value="MANUAL_CONFIRM">Manual confirm</option>
                          <option value="AUTO_AFTER_RELEASE">Auto after release</option>
                        </select>
                      </div>
                      <div className="formRow">
                        <label>{Array.isArray(rotationSessions) && rotationSessions.length ? "Next Rotation Budget ($)" : "Rotation Budget ($)"}</label>
                        <input
                          value={rotationBudgetRelease}
                          onChange={(e) => { setRotationBudgetRelease(e.target.value); setRotationBudgetReleased(false); }}
                          placeholder={Array.isArray(rotationSessions) && rotationSessions.length ? "e.g. next 500" : "e.g. 500"}
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
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          Min net advantage (%)
                          <span
                            title="Minimum estimated edge required before a Rotation order is allowed. Higher values are more selective and reduce noise. Lower values allow more opportunities but behave more aggressively."
                            style={{ opacity: 0.75, cursor: "help", fontSize: 12 }}
                          >
                            ⓘ
                          </span>
                        </label>
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

                    {renderPayoutAssetSelector("Payout asset")}

                    <div
                      className="muted tiny"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "rgba(0,0,0,.14)",
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      <span>
                        <b>Status:</b>{" "}
                        {rotationBudgetReleased
                          ? "Budget approved"
                          : "Waiting for budget approval"}
                      </span>
                      <span style={{ opacity: 0.75 }}>
                        {(() => {
                          const preflight = getRotationPreflight();
                          return preflight.symbol ? `${preflight.symbol} / ${preflight.chain}${preflight.selected ? "" : " · fallback"}` : "No selection";
                        })()}
                      </span>
                    </div>

                    <div className="muted tiny" style={{ marginTop: -4, lineHeight: 1.35 }}>
                      Rotation preflight: {getRotationPreflight().message}
                    </div>

                    {renderFundingPrompt("ROTATION")}

                    <div
                      style={{
                        padding: "8px 10px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,.035)",
                        border: "1px solid rgba(255,255,255,.07)",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      

                      <button
                        type="button"
                        className="btnGhost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRotationRecommendationsExpanded((v) => !v);
                        }}
                        style={{ justifyContent: "space-between", width: "100%", padding: 0, background: "transparent", border: 0 }}
                        title="Show or hide Watchlist recommendations"
                      >
                        <span className="label" style={{ marginBottom: 0 }}>Watchlist recommendations</span>
                        <span style={{ opacity: 0.75 }}>{rotationRecommendationsExpanded ? "▲" : "▼"}</span>
                      </button>
                      {rotationRecommendationsExpanded ? (() => {
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
                              gap: 8,
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
                      })() : (
                        <div className="muted tiny">Recommendations are hidden. Open this section to select a Rotation target.</div>
                      )}
                    </div>



                    <div className="btnRow">
                      <button
                        className="btn"
                        type="button"
                        disabled={(() => {
                          const preflight = getRotationPreflight();
                          if (!rotationBudgetReleased || !preflight.ok) return true;
                          const amount = Number(preflight.amount || 0);
                          const px = Number(activeGridNativeUsd || 0);
                          const vaultTotalUsd = Number.isFinite(px) && px > 0 ? Number(manualVaultTotalQty || 0) * px : 0;
                          const gridAllocatedUsd = Number.isFinite(px) && px > 0 ? Number(manualVaultAllocatedQty || 0) * px : 0;
                          const availableUsd = Math.max(0, vaultTotalUsd - gridAllocatedUsd);
                          return vaultTotalUsd > 0 && amount > availableUsd;
                        })()}
                        onClick={addRotationOrder}
                        title={rotationBudgetReleased ? getRotationPreflight().message : "Approve the Rotation budget first"}
                      >
                        {gridBusy.add ? "Adding..." : "Add Rotation Order"}
                      </button>
                      <button
                        className={rotationBudgetReleased ? "miniBtn" : "btn"}
                        type="button"
                        disabled={(() => {
                          const amount = Number(String(rotationBudgetRelease || "").replace(",", "."));
                          return !Number.isFinite(amount) || amount <= 0;
                        })()}
                        onClick={releaseRotationBudget}
                        title="Approve the Rotation budget locally. Vault safety is checked internally when an order is created."
                      >
                        {rotationBudgetReleased ? "Approve New Rotation Session" : "Approve Budget"}
                      </button>
                      {rotationBudgetReleased && (
                        <button className="miniBtn" type="button" onClick={resetRotationBudgetRelease}>Reset budget</button>
                      )}
                    </div>
                    {Array.isArray(rotationSessions) && rotationSessions.length ? (
                      <div style={{ display: "grid", gap: 5, marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(0,0,0,.14)", border: "1px solid rgba(255,255,255,.07)" }}>
                        <div className="muted tiny" style={{ fontWeight: 900, color: "#8bdcff" }}>Rotation sessions</div>
                        {rotationSessions.slice(0, 4).map((sess) => (
                          <div key={sess.id} className="muted tiny" style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                            <span>{sess.symbol || "ASSET"} / {sess.chain || "CHAIN"} · {fmtUsd(Number(sess.budgetUsd || 0))}</span>
                            <span>{String(sess.status || "APPROVED")} · {String(sess.id || "").slice(0, 18)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {rotationBackendMsg ? (
                      <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                        {rotationBackendMsg}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : String(gridMode || "normal") === "trading" ? (
                <div className="gridWrap">
                  <div className="gridControls" style={{ display: "grid", gap: 10 }}>
                    <div
                      style={{
                        padding: "8px 10px",
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
                          const tradingAllocatedUsd = (Array.isArray(openTradingSessions) ? openTradingSessions : []).reduce((sum, sess) => {
                            const st = String(sess?.status || "").toUpperCase();
                            if (["RELEASED", "CLOSED", "EXPIRED"].includes(st)) return sum;
                            return sum + (Number(sess?.budgetUsd) || 0);
                          }, 0);
                          const availableUsd = Math.max(0, vaultTotalUsd - gridAllocatedUsd - tradingAllocatedUsd);
                          const usagePct = vaultTotalUsd > 0 ? Math.min(100, Math.max(0, ((gridAllocatedUsd + tradingAllocatedUsd) / vaultTotalUsd) * 100)) : 0;
                          return (
                            <>
                              <div><b>Vault total:</b> {vaultTotalUsd ? fmtUsd(vaultTotalUsd) : `${vaultTotalNative.toFixed(6)} ${activeGridChainSymbol}`}</div>
                              <div><b>Grid allocated:</b> {vaultTotalUsd ? fmtUsd(gridAllocatedUsd) : `${gridAllocatedNative.toFixed(6)} ${activeGridChainSymbol}`}</div>
                              <div><b>Trading allocated:</b> {tradingAllocatedUsd ? fmtUsd(tradingAllocatedUsd) : "$0.00"}</div>
                              <div style={{ color: "#22c55e", fontWeight: 900 }}><b>Available:</b> {vaultTotalUsd ? fmtUsd(availableUsd) : "Price pending"}</div>
                              <div style={{ gridColumn: isCompactMobile ? "auto" : "1 / -1" }}><b>Usage:</b> {vaultTotalUsd ? `${usagePct.toFixed(1)}%` : "waiting for price"}</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr 1fr", gap: isCompactMobile ? 8 : 10, alignItems: "end" }}>
                      <div className="formRow">
                        <label>{Array.isArray(openTradingSessions) && openTradingSessions.length ? "Next Budget ($)" : "Budget ($)"}</label>
                        <input value={tradingBudgetUsd} onChange={(e) => setTradingBudgetUsd(e.target.value)} placeholder={Array.isArray(openTradingSessions) && openTradingSessions.length ? "e.g. next 300" : "e.g. 300"} />
                      </div>
                      <div className="formRow">
                        <label>Budget slots</label>
                        <input
                          value={tradingBudgetSplitInput}
                          onChange={(e) => {
                            // Next-budget draft only. Existing approved session queues stay untouched.
                            setTradingBudgetSplitInput(e.target.value);
                          }}
                          placeholder="100,50,50,50,50"
                          title="Optional: split approved budget into controlled slots"
                        />
                      </div>
                      <div className="formRow">
                        <label>Runtime (h)</label>
                        <input value={tradingRuntimeHours} onChange={(e) => setTradingRuntimeHours(e.target.value)} placeholder="24" />
                      </div>
                      <div className="formRow">
                        <label>Capital HOLD (1-12h)</label>
                        <input
                          value={tradingHoldHours}
                          onChange={(e) => setTradingHoldHours(e.target.value)}
                          onBlur={() => setTradingHoldHours(String(clampTradingHoldHours(tradingHoldHours)))}
                          placeholder="1"
                          title="Minimum HOLD after exit/protection. After that Strategist keeps observing; no blind re-entry. Max observation is 12h."
                        />
                      </div>
                      <div className="formRow">
                        <label>Style</label>
                        <select value={tradingStyle} onChange={(e) => setTradingStyle(e.target.value)}>
                          <option value="TACTICAL">Tactical</option>
                          <option value="DEFENSIVE">Defensive</option>
                          <option value="AGGRESSIVE">Aggressive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr", gap: isCompactMobile ? 8 : 10 }}>
                      <div className="formRow">
                        <label>Allowed assets</label>
                        <input value={tradingAllowedAssets} onChange={(e) => setTradingAllowedAssets(e.target.value.toUpperCase())} placeholder="ETH, POL, LINK" />
                      </div>
                      <div className="formRow">
                        <label>Allowed chains</label>
                        <input value={tradingAllowedChains} onChange={(e) => setTradingAllowedChains(e.target.value.toUpperCase())} placeholder="POL,BNB,ETH" />
                      </div>
                    </div>

                    <div
                      className="muted tiny"
                      style={{
                        marginTop: -2,
                        padding: "7px 9px",
                        borderRadius: 10,
                        border: tradingPreflight.ok ? "1px solid rgba(34,197,94,.22)" : "1px solid rgba(255,193,7,.28)",
                        background: tradingPreflight.ok ? "rgba(34,197,94,.06)" : "rgba(255,193,7,.075)",
                        color: tradingPreflight.ok ? "#9ff7b5" : "#ffd166",
                        fontWeight: 800,
                      }}
                    >
                      {tradingPreflight.ok
                        ? `Trading preflight ready · ${fmtUsd(tradingPreflight.budget)} · ${tradingPreflight.assets.join(", ")} · ${tradingPreflight.chains.join(",")}`
                        : `Trading preflight needs: ${tradingPreflight.issues.join(", ")}. Add Budget and at least one asset/chain, or use the selected asset fallback.`}
                    </div>

                    {renderPayoutAssetSelector("Payout asset")}

                    <div
                      style={{
                        borderRadius: 12,
                        background: "rgba(255,255,255,.035)",
                        border: "1px solid rgba(255,255,255,.065)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="btnGhost"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setTradingRiskExpanded((v) => !v);
                          }}
                          style={{ height: 30, paddingInline: 10, fontSize: 12 }}
                        >
                          {tradingRiskExpanded ? "Advanced Risk Engine ▲" : "Advanced Risk Engine ▼"}
                        </button>
                        <InfoButton title="Advanced Risk Engine – Info">
                          <Help showClose dismissable
                            de={
                              <>
                                <p><b>Caution DD</b>: Warnzone. Nexus soll spaeter nicht sofort stoppen, sondern Aggressivitaet reduzieren.</p>
                                <p><b>Hard Stop</b>: echter Notfall-Stopp bei zu hohem Risiko oder Regelbruch.</p>
                                <p><b>Profit Lock</b>: schuetzt Gewinne, indem Risiko nach starkem Profit reduziert wird.</p>
                                <p><b>Max Trades</b>: begrenzt Aktivitaet und verhindert Overtrading.</p>
                              </>
                            }
                            en={
                              <>
                                <p><b>Caution DD</b>: warning zone. Nexus should reduce aggression later, not instantly stop.</p>
                                <p><b>Hard Stop</b>: emergency stop for excessive risk or rule violation.</p>
                                <p><b>Profit Lock</b>: protects gains by reducing risk after strong profit.</p>
                                <p><b>Max Trades</b>: limits activity and avoids overtrading.</p>
                              </>
                            }
                          />
                        </InfoButton>
                      </div>

                      {tradingRiskExpanded ? (
                        <div style={{ padding: "0 10px 10px 10px", display: "grid", gap: 8 }}>
                          <div style={{ display: "grid", gridTemplateColumns: isCompactMobile ? "1fr" : "1fr 1fr 1fr", gap: isCompactMobile ? 8 : 10 }}>
                            <div className="formRow">
                              <label>Risk mode</label>
                              <select value={tradingRiskMode} onChange={(e) => handleTradingRiskModeChange(e.target.value)}>
                                <option value="DEFENSIVE">Defensive</option>
                                <option value="BALANCED">Balanced</option>
                                <option value="DYNAMIC">Dynamic</option>
                              </select>
                            </div>
                            <div className="formRow">
                              <label>Caution DD %</label>
                              <input value={tradingCautionDrawdownPct} onChange={(e) => setTradingCautionDrawdownPct(e.target.value)} placeholder="3" />
                            </div>
                            <div className="formRow">
                              <label>Hard stop %</label>
                              <input value={tradingHardStopPct} onChange={(e) => setTradingHardStopPct(e.target.value)} placeholder="12" />
                            </div>
                            <div className="formRow">
                              <label>Profit lock %</label>
                              <input value={tradingProfitLockPct} onChange={(e) => setTradingProfitLockPct(e.target.value)} placeholder="20" />
                            </div>
                            <div className="formRow">
                              <label>Max slippage %</label>
                              <input value={tradingMaxSlippagePct} onChange={(e) => setTradingMaxSlippagePct(e.target.value)} placeholder="1.2" />
                            </div>
                            <div className="formRow">
                              <label>Max trades</label>
                              <input value={tradingMaxTrades} onChange={(e) => setTradingMaxTrades(e.target.value)} placeholder="6" />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {tradingVisibleQueueSummary.queue.length ? (
                      <div
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          background: "rgba(0,0,0,.18)",
                          border: "1px solid rgba(34,197,94,.20)",
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "grid", gap: 6 }}>
                          {tradingVisibleQueueSummary.queue.map((slot) => (
                            <div
                              key={slot.id || `${slot.slot}-${slot.amountUsd}`}
                              style={(() => {
                                const st = String(slot.status || "").toUpperCase();
                                const isGreen = ["ACTIVE", "READY", "EXECUTED"].includes(st);
                                const isProtect = st === "PROTECT";
                                const isWait = st === "WAIT";
                                const isHold = ["HOLD", "OBSERVE"].includes(st);
                                const isRelease = st === "RELEASE_REQUIRED";
                                const isBlocked = st === "BLOCKED";
                                return {
                                  borderRadius: 10,
                                  border: isGreen ? "1px solid rgba(34,197,94,.45)" : isProtect ? "1px solid rgba(255,193,7,.42)" : isWait ? "1px solid rgba(255,193,7,.34)" : isHold ? "1px solid rgba(64,196,255,.34)" : isRelease ? "1px solid rgba(255,193,7,.42)" : isBlocked ? "1px solid rgba(239,68,68,.28)" : "1px solid rgba(255,255,255,.08)",
                                  background: isGreen ? "rgba(34,197,94,.11)" : isProtect ? "rgba(255,193,7,.095)" : isWait ? "rgba(255,193,7,.085)" : isHold ? "rgba(64,196,255,.075)" : isRelease ? "rgba(255,193,7,.10)" : isBlocked ? "rgba(239,68,68,.075)" : "rgba(255,255,255,.035)",
                                  padding: "7px 8px",
                                  display: "grid",
                                  gap: 3,
                                };
                              })()}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                                <b style={{ color: "#eafff5" }}>Slot {slot.slot} · {fmtUsd(Number(slot.amountUsd || 0))}</b>
                                <span
                                  className="tiny"
                                  style={{
                                    color: ["ACTIVE", "READY", "EXECUTED"].includes(String(slot.status || "").toUpperCase()) ? "#7cf7a2" : String(slot.status || "").toUpperCase() === "PROTECT" ? "#ffd166" : String(slot.status || "").toUpperCase() === "WAIT" ? "#ffc107" : ["HOLD", "OBSERVE"].includes(String(slot.status || "").toUpperCase()) ? "#8bdcff" : String(slot.status || "").toUpperCase() === "RELEASE_REQUIRED" ? "#ffd166" : String(slot.status || "").toUpperCase() === "BLOCKED" ? "#ff6b6b" : "rgba(235,255,247,.72)",
                                    fontWeight: 900,
                                  }}
                                >{String(slot.status || "WAIT").toUpperCase()} · priority {Math.round(Number(slot.priority || 0))}</span>
                              </div>
                              <div className="muted tiny">{slot.symbol || "asset pending"} · {slot.riskMode} · {slot.confidence} · {slot.condition}</div>
                              {["PROTECT", "HOLD", "OBSERVE", "RELEASE_REQUIRED"].includes(String(slot.status || "").toUpperCase()) ? (
                                <div className="muted tiny" style={{ display: "grid", gap: 4 }}>
                                  <div>
                                    {String(slot.status || "").toUpperCase() === "PROTECT" ? "Protect mode active" : <>HOLD until {slot.holdUntil ? new Date(Number(slot.holdUntil)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "n/a"} · max observe until {slot.observeUntil ? new Date(Number(slot.observeUntil)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "n/a"}</>}
                                  </div>
                                  <details style={{ border: "1px solid rgba(139,220,255,.18)", borderRadius: 8, padding: "4px 6px", background: "rgba(64,196,255,.045)" }}>
                                    <summary style={{ cursor: "pointer", color: "#8bdcff", fontWeight: 900 }}>Observe info</summary>
                                    <div style={{ marginTop: 4, lineHeight: 1.45 }}>
                                      {slot.observeReason || slot.condition || "The Strategist is still observing market structure, liquidity, RVOL and risk. Capital will not be reallocated until market quality is clean."}
                                    </div>
                                  </details>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div
                      style={{
                        padding: "9px 10px",
                        borderRadius: 12,
                        background: "rgba(64,196,255,.055)",
                        border: "1px solid rgba(64,196,255,.18)",
                        display: "grid",
                        gap: 7,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 950, color: "#8bdcff", fontSize: 13 }}>Shadow Executor</div>
                          <div className="muted tiny">Paper execution only: virtual fills, stop/re-entry validation, reallocation observation. No Vault transaction can be triggered here.</div>
                        </div>
                        <button
                          className="btnGhost"
                          type="button"
                          onClick={runShadowExecutorValidation}
                          disabled={shadowExecutorBusy || !wallet}
                          style={{ height: 30, paddingInline: 10 }}
                          title="Run off-chain Shadow Executor validation"
                        >
                          {shadowExecutorBusy ? "Testing..." : "Run Shadow Test"}
                        </button>
                      </div>
                      {(() => {
                        const run = shadowExecutorState?.last_run || shadowExecutorState?.run || null;
                        const summary = run?.summary || {};
                        if (!run && !shadowExecutorMsg) {
                          return <div className="muted tiny">No shadow run yet. Run this before Vault deployment to validate behavior without risking live capital.</div>;
                        }
                        const status = String(summary?.status || run?.status || "pending").toUpperCase();
                        const readiness = String(summary?.readiness || "PENDING").replaceAll("_", " ");
                        const score = Number(summary?.safety_score ?? NaN);
                        return (
                          <div style={{ display: "grid", gap: 5 }}>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <span className="tiny" style={{ fontWeight: 950, color: status === "PASSED" ? "#7cf7a2" : status === "BLOCKED" ? "#ff8a8a" : "#ffd166" }}>Status: {status}</span>
                              <span className="tiny" style={{ fontWeight: 900, color: "rgba(235,255,247,.78)" }}>Safety: {Number.isFinite(score) ? `${score}/100` : "—"}</span>
                              <span className="tiny" style={{ fontWeight: 900, color: "rgba(235,255,247,.78)" }}>Readiness: {readiness}</span>
                            </div>
                            <div className="muted tiny">
                              Virtual fills: {summary?.virtual_fills ?? 0} · Blocks: {summary?.virtual_blocks ?? 0} · Protect tests: {summary?.protect_tests ?? 0} · Re-entry allowed: {summary?.reentry_allowed ? "yes" : "no"}
                            </div>
                            {shadowExecutorMsg ? <div className="muted tiny" style={{ color: "#8bdcff" }}>{shadowExecutorMsg}</div> : null}
                            {Array.isArray(run?.events) && run.events.length ? (
                              <details
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                style={{ border: "1px solid rgba(139,220,255,.16)", borderRadius: 8, padding: "4px 6px", background: "rgba(64,196,255,.035)" }}
                              >
                                <summary
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  style={{ cursor: "pointer", color: "#8bdcff", fontWeight: 900 }}
                                >Latest shadow events</summary>
                                <div style={{ marginTop: 5, display: "grid", gap: 4 }}>
                                  {run.events.slice(0, 5).map((ev, idx) => (
                                    <div key={`${ev?.type || "event"}-${idx}`} className="muted tiny">{ev?.type || "EVENT"}: {ev?.message || "Shadow event recorded."}</div>
                                  ))}
                                </div>
                              </details>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>


                    {renderFundingPrompt("TRADING")}

                    {Array.isArray(openTradingSessions) && openTradingSessions.length ? (
                      <div style={{ display: "grid", gap: 8, padding: "8px 10px", borderRadius: 12, background: "rgba(0,0,0,.14)", border: "1px solid rgba(139,220,255,.12)" }}>
                        <div className="muted tiny" style={{ fontWeight: 950, color: "#8bdcff" }}>Active Trading sessions</div>
                        <select
                          value={selectedTradingSessionId || String(openTradingSessions?.[0]?.id || "")}
                          onChange={(e) => selectTradingSession(e.target.value)}
                          style={{
                            width: "100%",
                            border: "1px solid rgba(139,220,255,.22)",
                            borderRadius: 10,
                            background: "rgba(0,0,0,.28)",
                            color: "#eafff5",
                            padding: "8px 10px",
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                          title="Choose which independent Trading session to inspect/control"
                        >
                          {openTradingSessions.slice(0, 20).map((sess) => {
                            const sid = String(sess?.id || "");
                            const label = `${(sess.assets || []).join(",") || "ASSET"} · ${fmtUsd(Number(sess.budgetUsd || 0))} · ${sess.slots || 0} slots · ${String(sess.status || "ACTIVE").toUpperCase()} · ${sid.slice(0, 18)}`;
                            return <option key={sid || `session-${sess?.createdAt || Math.random()}`} value={sid}>{label}</option>;
                          })}
                        </select>
                        {selectedTradingSession ? (
                          <div
                            style={{
                              border: "1px solid rgba(34,197,94,.30)",
                              borderRadius: 10,
                              background: "rgba(34,197,94,.07)",
                              padding: "7px 8px",
                              display: "grid",
                              gap: 3,
                            }}
                          >
                            <div style={{ color: "#eafff5", fontWeight: 950, fontSize: 12 }}>{(selectedTradingSession.assets || []).join(",") || "ASSET"} · {fmtUsd(Number(selectedTradingSession.budgetUsd || 0))} · {selectedTradingSession.slots || 0} slots</div>
                            <div className="muted tiny" style={{ color: "#8bdcff" }}>Viewing: {selectedTradingSessionId}. This dropdown controls only the selected independent Trading session.</div>
                          </div>
                        ) : null}
                      </div>
                    ) : Array.isArray(stoppedTradingSessions) && stoppedTradingSessions.length ? (
                      <div className="muted tiny" style={{ padding: "8px 10px", borderRadius: 12, background: "rgba(0,0,0,.12)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(216,255,241,.68)" }}>
                        No active Trading sessions. {stoppedTradingSessions.length} stopped/released session{stoppedTradingSessions.length === 1 ? "" : "s"} kept only as local history.
                      </div>
                    ) : null}

                    <div
                      style={{
                        padding: "7px 10px",
                        borderRadius: 12,
                        background: selectedTradingSessionLabel === "ACTIVE" ? "rgba(34,197,94,.08)" : selectedTradingSessionLabel === "PROTECT" ? "rgba(255,193,7,.09)" : selectedTradingSessionLabel === "PAUSED" ? "rgba(245,193,108,.08)" : "rgba(245,193,108,.07)",
                        border: selectedTradingSessionLabel === "ACTIVE" ? "1px solid rgba(34,197,94,.22)" : selectedTradingSessionLabel === "PROTECT" ? "1px solid rgba(255,193,7,.28)" : "1px solid rgba(245,193,108,.20)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, color: selectedTradingSessionLabel === "ACTIVE" ? "#7cf7a2" : selectedTradingSessionLabel === "PROTECT" ? "#ffd166" : ["HOLD", "OBSERVE"].includes(selectedTradingSessionLabel) ? "#8bdcff" : selectedTradingSessionLabel === "RELEASE_REQUIRED" ? "#ffd166" : "#f5c16c", fontSize: 13 }}>
                          Status: {selectedTradingSessionLabel === "PREPARED" ? "Prepared" : selectedTradingSessionLabel === "ARMED" ? "Armed" : selectedTradingSessionLabel === "ACTIVE" ? "Active" : selectedTradingSessionLabel === "PROTECT" ? "Protect" : selectedTradingSessionLabel === "PAUSED" ? "Paused" : selectedTradingSessionLabel === "HOLD" ? "Capital Hold" : selectedTradingSessionLabel === "OBSERVE" ? "Observe" : selectedTradingSessionLabel === "RELEASE_REQUIRED" ? "Release required" : selectedTradingSessionLabel === "STOPPED" ? "Stopped" : "Prepared"}
                        </div>
                        <div className="muted tiny">{selectedTradingSessionLabel === "PREPARED" ? "Approve a budget to create a new independent Trading session. Later budgets create additional sessions inside your limits." : selectedTradingSessionLabel === "ARMED" ? "Armed. Nexus Trading activates automatically." : selectedTradingSessionLabel === "ACTIVE" ? "Autonomous trading active. User controls Pause and Stop only." : selectedTradingSessionLabel === "PROTECT" ? "Protect mode active. Strategist detected elevated risk; no new add-ons and exit can be triggered if risk worsens." : selectedTradingSessionLabel === "PAUSED" ? "Paused by user. Resume or Stop remains under user control." : selectedTradingSessionLabel === "HOLD" ? "Capital protected. Minimum HOLD is active; no new allocation can start." : selectedTradingSessionLabel === "OBSERVE" ? "Minimum HOLD completed. Strategist keeps checking; no trade unless market quality is clean." : selectedTradingSessionLabel === "RELEASE_REQUIRED" ? "Max 12h observation reached. User must release/approve capital before new allocation." : "Stopped. Load or approve a setup again to continue."}</div>
                        <div className="muted tiny" style={{ marginTop: 3, color: tradingGlobalRiskState?.status === "COOLDOWN" || tradingGlobalRiskState?.status === "PROTECT" ? "#ffd166" : "rgba(216,255,241,.72)" }}>
                          {tradingGlobalRiskLabel}
                          {tradingGlobalRiskState?.blocked_reason ? ` · ${String(tradingGlobalRiskState.blocked_reason).slice(0, 140)}` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        
                        <button className="btnGhost" type="button" onClick={handleTradingApproveBudget} disabled={!tradingCanApprove} title={tradingPreflight.title} style={{ height: 30, paddingInline: 10 }}>
                          {Array.isArray(openTradingSessions) && openTradingSessions.length ? "Approve Next Budget" : "Approve Budget"}
                        </button>
                        {(String(tradingBudgetUsd || "").trim() || String(tradingBudgetSplitInput || "").trim()) ? (
                          <button
                            className="miniBtn"
                            type="button"
                            onClick={() => { setTradingBudgetUsd(""); setTradingBudgetSplitInput(""); }}
                            style={{ height: 30, paddingInline: 10 }}
                            title="Clear only the next-budget draft. Existing Trading sessions remain active."
                          >
                            Clear Next Budget
                          </button>
                        ) : null}
                        
                        {["ACTIVE", "PROTECT"].includes(selectedTradingSessionLabel) ? (
                          <button className="btnGhost" type="button" onClick={handleTradingPauseSession} style={{ height: 30, paddingInline: 10 }}>Pause</button>
                        ) : null}
                        {selectedTradingSessionLabel === "PAUSED" ? (
                          <button className="btn" type="button" onClick={handleTradingResumeSession} style={{ height: 30, paddingInline: 10 }}>Resume</button>
                        ) : null}
                        {tradingCanStop ? (
                          <button className="btnDanger" type="button" onClick={handleTradingStopSession} style={{ height: 30, paddingInline: 10 }}>Protect / Stop</button>
                        ) : null}
                        {tradingCanReleaseCapital ? (
                          <button className="btnGhost" type="button" onClick={handleTradingReleaseCapital} style={{ height: 30, paddingInline: 10 }}>Release Capital</button>
                        ) : null}
                      </div>
                    </div>

                    
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
<div className="hint" style={{ marginTop: 4, marginBottom: 4, opacity: 0.95 }}>
  {tB("Available:")} <b>{manualVaultAvailableQty.toFixed(6)}</b> {activeGridChainSymbol}
  {" · "}
  {tB("Allocated:")} <b>{manualVaultAllocatedQty.toFixed(6)}</b> {activeGridChainSymbol}
  {" · "}
  {tB("Settled:")} <b>{manualVaultSettledQty.toFixed(6)}</b> {String(manualPayoutAsset || "USDC").toUpperCase()}
</div>
{renderFundingPrompt("GRID")}
{isEthChain ? (

              <div className="formRow" style={{ marginTop: 6 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  {gridBusy.start ? "Approving..." : "Approve Budget"}
                </button>
                <button className="btnDanger" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); gridStop(); }} disabled={!isGridReady || gridBusy.stop || gridBusy.start}>{gridBusy.stop ? "Resetting..." : "Reset Budget"}</button>
              </div>
              {errorMsg && !(
                String(errorMsg).includes("wallet/Vault") ||
                String(errorMsg).includes("fund or add") ||
                String(errorMsg).includes("apply again") ||
                String(errorMsg).includes("No vault liquidity") ||
                String(errorMsg).includes("Prepared ") ||
                String(errorMsg).includes("Review ")
              ) ? (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "rgba(245, 193, 108, 0.14)",
                    border: "1px solid rgba(245, 193, 108, 0.34)",
                    color: "#f5c16c",
                    fontSize: "13px",
                    lineHeight: "1.4",
                  }}
                >
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
                          gap: 8,
                          fontWeight: 800,
                          boxShadow: payoutMenuOpen ? "0 0 12px rgba(34,197,94,.22)" : "none",
                        }}
                      >
                        <span>{extraPayoutAssets.includes(String(manualPayoutAsset || "").toUpperCase()) ? String(manualPayoutAsset || "").toUpperCase() : "More assets"}</span>
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
                                  padding: "8px 10px",
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
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Execution Preview</div>
                  <div
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: manualRiskState.tone,
                      border: manualRiskState.border,
                      color: manualRiskState.color,
                      fontWeight: 800,
                      fontSize: 12,
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
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 12, color: "#bdebd8", lineHeight: 1.2 }}>
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
                </div>
              </div>

              <div className="row" style={{ display: "flex", justifyContent: "flex-start", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: -2, marginBottom: 7 }}>
                <div className="muted" style={{ fontSize: 12, minWidth: 76 }}>Preset:</div>

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
                  Std
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
                  VWide
                </button>
              </div>

              <div className="row" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 7 }}>
                <div className="muted" style={{ fontSize: 12, minWidth: 76 }}>Quick:</div>

                <button className="btn" type="button" onClick={setManualPriceFromMarket} disabled={!shownGridPrice} title="Set price to current market" style={compactGridChipStyle}>
                  MKT
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
                    <label>Order mode</label>
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
                      <label>Amount</label>
                      <input value={manualQty} onChange={(e) => setManualQty(e.target.value)} placeholder="e.g. 0.01" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="formRow">
                  <label>Amount</label>
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
              <div className="ordersHead" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
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
                  <div className="ordersList" style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4, display: "grid", gap: 8 }}>
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
                            padding: "8px 10px",
                            background: "rgba(255,255,255,.03)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
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
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minWidth: 0, flex: "1 1 460px", fontSize: 12 }}>
                                      <span className={`pill ${o.side === "BUY" ? "good" : "bad"}`} style={{ fontSize: 10, padding: "4px 7px" }}>{o.side}</span>
                                      <span className="orderPx" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{fmtUsd(Number(o?.price || 0))}</span>
                                      <span className="muted" style={{ whiteSpace: "nowrap", fontSize: 12 }}>{o?.qty ? `qty ${fmtQty(Number(o.qty), 4)}` : ""}</span>
                                      <span className="pill silver" style={{ fontSize: 10, padding: "4px 7px" }}>{statusTxt}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>Payout:</b> {payout}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>Inv:</b> {fmtUsd(investedUsd)}</span>
                                      <span className="muted tiny" style={{ whiteSpace: "nowrap", fontSize: 10 }}><b>At target:</b> {fmtUsd(atTargetUsd)}</span>
                                      {profitText ? (
                                        <span style={{ color: profitColor, fontWeight: 800, whiteSpace: "nowrap", fontSize: 12 }}>{profitText}</span>
                                      ) : null}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", flex: "0 0 auto" }}>
                                      <button
                                        type="button"
                                        className="btn ghost"
                                        style={{ height: 26, paddingInline: 9, fontSize: 12 }}
                                        disabled={!idOf(o) || !["OPEN","PAUSED"].includes(statusTxt) || gridBusy.stopOrderId === String(idOf(o))}
                                        onClick={() => (statusTxt === "PAUSED" ? resumeGridOrder(idOf(o)) : stopGridOrder(idOf(o)))}
                                        title={statusTxt === "PAUSED" ? "Resume this paused order." : "Pause this order without deleting it."}
                                      >
                                        {gridBusy.stopOrderId === String(idOf(o)) ? (statusTxt === "PAUSED" ? "Resuming..." : "Pausing...") : (statusTxt === "PAUSED" ? "Resume" : "Stop")}
                                      </button>
                                      <button
                                        type="button"
                                        className="btn ghost"
                                        style={{ height: 26, paddingInline: 9, fontSize: 12 }}
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
                <div className="muted">No orders yet. Approve Budget then Add Order.</div>
              )}
            </div>
            </div>
          </div></div>
        </section>

        {/* Watchlist */}
        <section className={`card section-watch dashboardPanel ${activePanel === "watchlist" ? "panelActive" : ""}`} onClick={handlePanelActivate("watchlist")}>
          <div className="cardHead">
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
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
                            fontSize: 12,
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
                        gridTemplateColumns: "24px minmax(0,1fr) 78px 30px",
                        columnGap: 6,
                        rowGap: 6,
                        paddingRight: 6,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCompare(sym)} disabled={!checked && compareSymbols.length >= 20} style={{ transform: "scale(0.9)" }} />
                      </div>
                      <div className="watchCompactMain">
                        <div className="watchCompactTop" style={{ gap: 6, minWidth: 0, overflow: "hidden" }}>
                          <div className="watchCompactMeta" style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0, flexWrap: "wrap", maxWidth: "100%" }}>
                            <div className="watchSym" style={{ fontSize: 13, lineHeight: 1.1, fontWeight: 800, maxWidth: 66, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sym}</div>
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
                            <span className={`mono tiny ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`} style={{ fontSize: 11, lineHeight: 1.1, color: Number(r.change24h) >= 0 ? "var(--green)" : "var(--red)", marginLeft: "auto", whiteSpace: "nowrap" }}>{fmtPct(r.change24h)}</span>
                          </div>
                        </div>
                        <div className="watchCompactStats" style={{ display: "grid", gap: 2, minWidth: 0, marginTop: 4 }}>
                          <span className="muted tiny" style={{ fontSize: 10.5, lineHeight: 1.12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Vol {fmtCompactUsd(r.volume24h)}</span>
                          <span className="muted tiny" style={{ fontSize: 10.5, lineHeight: 1.12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>MCap {((r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) != null) ? fmtCompactUsd(r.marketCap ?? r.market_cap ?? r.mcap ?? r.marketcap) : "—"}</span>
                        </div>
                      </div>
                      <div className="watchCompactPrice" style={{ display: "grid", gap: 2, alignItems: "center", justifyItems: "end", minWidth: 0, overflow: "hidden" }}>
                        <div className="mono" title={fmtUsd(r.price)} style={{ fontWeight: 900, fontSize: 11.5, lineHeight: 1.1, maxWidth: "78px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }}>{fmtUsd(r.price)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 30 }}>
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
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
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
            <div className="cardTitle">Nexus Strategist</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <InfoButton title="Nexus Strategist">
                <Help showClose dismissable
                  de={<><p><b>Nexus Strategist</b> ist dein aktiver Strategie-Arbeitsbereich in Nexus Analyt. Er arbeitet nicht mehr ueber sichtbare Coin-Chips, sondern ueber deine Eingabe.</p><p><b>Unterschied zu AI Insight:</b> AI Insight erklaert kompakt den aktuellen Markt. Nexus Strategist hilft dir aktiv bei Recherche, Strategie-Ideen, Backtests, Pine Script, Tagesberichten, Trade-Review und der Einordnung zwischen Nexus Grid und Nexus Rotation.</p><p><b>Research:</b> untersucht Marktfragen, Rotation, relative Staerke, Volumen, Watchlist-Themen und auffaellige Bedingungen.</p><p><b>Strategy Builder:</b> verwandelt deine Idee in klare Regeln, Filter, Entry-/Exit-Logik, Risiko-Logik und Alerts.</p><p><b>Backtest Review:</b> bewertet Backtest-Ergebnisse, Drawdown, Trefferquote, Expectancy, Overfitting-Risiko und schwache Marktphasen.</p><p><b>Pine Builder:</b> hilft bei TradingView/Pine Script: Indikatoren, Strategien, Alerts, Debugging und Verbesserungen.</p><p><b>Daily Report:</b> erstellt einen kompakten Bericht aus deiner Aufgabe und dem verfuegbaren App-Kontext.</p><p><b>Trade Review:</b> analysiert Ausfuehrung, Verhalten, Order-Struktur, wiederkehrende Fehler und Trading-Gewohnheiten.</p><p><b>Eingabe:</b> Beschreibe immer kurz, was der Analyst tun soll. Du kannst Coin-Namen, Strategie-Ideen, Backtest-Daten oder Pine Script direkt einfuegen.</p><p><b>Hinweis:</b> Nexus Strategist liefert Analyse, Struktur und taktische Orientierung. Er ist keine Finanzberatung und keine direkte Kauf-/Verkaufsempfehlung.</p></>}
                  en={<><p><b>Nexus Strategist</b> is your active strategy workspace inside Nexus Analyt. It no longer works through visible coin chips; it works through your task input.</p><p><b>Difference from AI Insight:</b> AI Insight gives a compact market interpretation. Nexus Strategist helps actively with research, strategy ideas, backtest review, Pine Script, reports, trade review, and choosing between Nexus Grid and Nexus Rotation.</p><p><b>Research:</b> investigates market questions, rotation, relative strength, volume, watchlist themes, and unusual conditions.</p><p><b>Strategy Builder:</b> turns your idea into clear rules, filters, entry/exit logic, risk logic, and alerts.</p><p><b>Backtest Review:</b> evaluates backtest results, drawdown, win rate, expectancy, overfitting risk, and weak market regimes.</p><p><b>Pine Builder:</b> helps with TradingView/Pine Script: indicators, strategies, alerts, debugging, and improvements.</p><p><b>Daily Report:</b> creates a compact report from your task and available app context.</p><p><b>Trade Review:</b> analyzes execution, behavior, order structure, repeated mistakes, and trading habits.</p><p><b>Input:</b> Always describe what the analyst should do. You can paste coin names, strategy ideas, backtest data, or Pine Script directly.</p><p><b>Note:</b> Nexus Strategist provides analysis, structure, and tactical orientation. It is not financial advice or a direct buy/sell recommendation.</p></>}
                />
              </InfoButton>
            </div>
          </div>

          <div className="panelScroll"><div className="aiWrap">
            <div className="aiSelect">
              <div className="label">Strategy Task</div>
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent?.isComposing) return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!aiLoading) {
                      void runAi();
                    }
                  }
                }}
                placeholder={aiTaskPlaceholder(aiKind)}
                rows={6}
                style={{
                  width: "100%",
                  minHeight: 130,
                  resize: "vertical",
                  borderRadius: 14,
                  padding: "12px 14px",
                  background: "rgba(0,0,0,0.28)",
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.14)",
                  outline: "none",
                }}
                disabled={aiLoading}
              />
              <div className="muted tiny" style={{ marginTop: 8 }}>
                Describe what the analyst should do. You can paste coins, strategy ideas, backtest notes, or Pine Script here.
              </div>

              <div className="divider" />

              <div className="formRow">
                <label>Mode</label>
                <div className="aiChips" style={{ gap: 8 }}>
                  {[
                    ["research", "Research"],
                    ["strategy_builder", "Strategy Builder"],
                    ["backtest_review", "Backtest Review"],
                    ["pine_tradingview", "Pine Builder"],
                    ["daily_report", "Daily Report"],
                    ["diagnostics", "Trade Review"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`chip ${aiKind === value ? "active" : ""}`}
                      onClick={() => {
                        setAiKind(value);
                        setAiOutput("");
                        setAiHistory([]);
                        setAiQuestion("");
                      }}
                      title={`Nexus Strategist mode: ${label}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
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
                  Nexus Strategist is a separate add-on: <b>$20/7 days</b> or <b>$50/30 days</b>. Demo users can try limited AI usage; Core users need Strategist access for full Strategist mode.
                </div>
              ) : null}

              <button className="btn" type="button" onClick={() => { if (!aiLoading) void runAi(); }} disabled={aiLoading}>
                {aiLoading ? "Running…" : (aiFollowUp && aiOutput ? "Ask" : "Run")}
              </button>
            </div>

            <div className="aiOut">
              <div className="label">Strategic Output</div>
              <div className="aiPanel">
                {aiOutput ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {aiOutputSections.map((section, idx) => {
                      const meta = aiAnalystSectionMeta[section.key] || aiAnalystSectionMeta.output;
                      return (
                        <div
                          key={`${section.key}-${idx}`}
                          style={{
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                            borderRadius: 14,
                            padding: "8px 10px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                            <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "#dfffee" }}>
                              {meta.title}
                            </div>
                            <div className="muted tiny" style={{ whiteSpace: "nowrap" }}>{meta.sub}</div>
                          </div>
                          <div className="aiText" style={{ whiteSpace: "pre-wrap", lineHeight: 1.28 }}>
                            {section.body}
                          </div>
                          {nexusStrategistCanShowAction(section, detectNexusUserIntent(aiQuestion || "")) ? (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                              <button
                                className="btn"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (section.key === "nexus_grid") applyStrategistToGrid(section.body);
                                  if (section.key === "nexus_rotation" || section.key === "exchange_spread") applyStrategistToRotation(section.body);
                                  if (section.key === "nexus_trading") applyStrategistToTrading(section.body);
                                }}
                                title={
                                  aiOutputLanguage === "de"
                                    ? (section.key === "nexus_grid"
                                      ? "Diese Idee in Nexus Grid vorbereiten. Es wird keine Order erstellt."
                                      : section.key === "nexus_trading"
                                        ? "Diese Idee in Nexus Trading vorbereiten. Die Automation wird nicht aktiviert."
                                        : "Diese Spread-/Rotation-Idee in Nexus Rotation vorbereiten. Es wird kein Swap ausgeführt.")
                                    : (section.key === "nexus_grid"
                                      ? "Prepare this idea in Nexus Grid. This does not create an order."
                                      : section.key === "nexus_trading"
                                        ? "Prepare this idea in Nexus Trading. This does not activate automation."
                                        : "Prepare this spread/rotation idea in Nexus Rotation. This does not execute a swap.")
                                }
                                style={{ height: 28, paddingInline: 10, fontSize: 12 }}
                              >
                                {aiOutputLanguage === "de"
                                  ? (section.key === "nexus_grid" ? "In Grid nutzen" : section.key === "nexus_trading" ? "In Trading nutzen" : "In Rotation nutzen")
                                  : (section.key === "nexus_grid" ? "Use in Grid" : section.key === "nexus_trading" ? "Use in Trading" : "Use in Rotation")}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="muted">{aiOutputLanguage === "de" ? "Noch keine Ausgabe." : "No output yet."}</div>
                )}
              </div>
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

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
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

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <div className="muted">Chain</div>
            <select value={"polygon"} disabled>
              <option value="polygon">Polygon</option>

            </select>

            <div className="muted">Contract</div>
            <input className="input" placeholder="0x..." value={addContract} onChange={(e) => setAddContract(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
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

        @media (min-width: 981px) {
          /* Desktop layout v92:
             - column 1 stays empty as reserved future workspace
             - active panel uses the wider center workspace
             - inactive panels are compressed into a narrow right rail
          */
          .dashboardGrid.hasFocus{
            grid-template-columns: minmax(220px, 0.58fr) minmax(0, 2.95fr) minmax(118px, 0.32fr) !important;
            grid-template-rows: repeat(3, minmax(0, 1fr)) !important;
            column-gap: 16px !important;
            row-gap: 12px !important;
            align-items: stretch !important;
          }

          .dashboardGrid.hasFocus .dashboardPanel.panelActive{
            grid-column: 2 !important;
            grid-row: 1 / span 3 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: none !important;
            height: 100% !important;
            opacity: 1 !important;
            transform: none !important;
          }

          /* Place the three inactive modules in the far-right rail, independent of which panel is active. */
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive){
            grid-column: 3 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 132px !important;
            justify-self: end !important;
            align-self: stretch !important;
            padding: 8px 7px !important;
            border-radius: 14px !important;
            opacity: .86 !important;
            transform: none !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive):nth-of-type(1){ grid-row: 1 !important; }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive):nth-of-type(2){ grid-row: 2 !important; }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive):nth-of-type(3){ grid-row: 3 !important; }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive):nth-of-type(4){ grid-row: 3 !important; }

          .dashboardGrid.hasFocus.focus-compare .section-grid{ grid-column: 3 !important; grid-row: 1 !important; }
          .dashboardGrid.hasFocus.focus-compare .section-watch{ grid-column: 3 !important; grid-row: 2 !important; }
          .dashboardGrid.hasFocus.focus-compare .section-ai{ grid-column: 3 !important; grid-row: 3 !important; }

          .dashboardGrid.hasFocus.focus-vault .section-compare{ grid-column: 3 !important; grid-row: 1 !important; }
          .dashboardGrid.hasFocus.focus-vault .section-watch{ grid-column: 3 !important; grid-row: 2 !important; }
          .dashboardGrid.hasFocus.focus-vault .section-ai{ grid-column: 3 !important; grid-row: 3 !important; }

          .dashboardGrid.hasFocus.focus-watchlist .section-compare{ grid-column: 3 !important; grid-row: 1 !important; }
          .dashboardGrid.hasFocus.focus-watchlist .section-grid{ grid-column: 3 !important; grid-row: 2 !important; }
          .dashboardGrid.hasFocus.focus-watchlist .section-ai{ grid-column: 3 !important; grid-row: 3 !important; }

          .dashboardGrid.hasFocus.focus-ai .section-compare{ grid-column: 3 !important; grid-row: 1 !important; }
          .dashboardGrid.hasFocus.focus-ai .section-grid{ grid-column: 3 !important; grid-row: 2 !important; }
          .dashboardGrid.hasFocus.focus-ai .section-watch{ grid-column: 3 !important; grid-row: 3 !important; }

          /* Make the inactive cards visually about 50% more compact. */
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardHead{
            gap: 4px !important;
            margin-bottom: 5px !important;
            align-items: flex-start !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardTitle{
            font-size: 11px !important;
            line-height: 1.05 !important;
            letter-spacing: 0 !important;
            max-width: 86px !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardActions{
            gap: 3px !important;
            transform: scale(.82) !important;
            transform-origin: top right !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardBody{
            gap: 5px !important;
            overflow: hidden !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .chip,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btn,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnGhost,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnPill,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pill,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .legendItem{
            min-height: 22px !important;
            height: 22px !important;
            padding: 2px 5px !important;
            border-radius: 8px !important;
            font-size: 8px !important;
            line-height: 1 !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .muted,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .tiny,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .text-xs,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .hint{
            font-size: 8px !important;
            line-height: 1.15 !important;
          }

          /* Collapse dense inactive content so the right rail acts like navigation/monitoring tiles. */
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareGrid,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLayout,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridWrap,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiWrap{
            display: block !important;
          }
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareLive,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareChart,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLeft,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridRight,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridControls,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridOrders,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiSelect,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiOut,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchTable,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchScroll,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .ordersList,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .liveListBox,
          .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pairsScroll{
            max-height: 72px !important;
            overflow: hidden !important;
          }
        }


/* =========================================================
   Nexus desktop layout v93
   Goal:
   - keep left reserve area free for future modules
   - active panel uses the gained space
   - inactive panels form a compact right rail at the page edge
   ========================================================= */
@media (min-width: 981px){
  .main{
    width: 100vw !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 18px 14px 18px !important;
  }

  .dashboardGrid.hasFocus{
    width: 100% !important;
    height: 100% !important;
    display: grid !important;
    grid-template-columns: minmax(260px, 25vw) minmax(0, 1fr) 168px !important;
    grid-template-rows: repeat(3, minmax(0, 1fr)) !important;
    column-gap: 18px !important;
    row-gap: 14px !important;
    align-items: stretch !important;
    justify-items: stretch !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel.panelActive{
    grid-column: 2 !important;
    grid-row: 1 / 4 !important;
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    align-self: stretch !important;
    justify-self: stretch !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive){
    grid-column: 3 !important;
    width: 168px !important;
    max-width: 168px !important;
    min-width: 168px !important;
    height: 100% !important;
    min-height: 0 !important;
    align-self: stretch !important;
    justify-self: end !important;
    opacity: .9 !important;
    transform: none !important;
    padding: 8px !important;
    border-radius: 16px !important;
    overflow: hidden !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-grid,
  .dashboardGrid.hasFocus.focus-vault .section-compare,
  .dashboardGrid.hasFocus.focus-watchlist .section-compare,
  .dashboardGrid.hasFocus.focus-ai .section-compare{
    grid-column: 3 !important;
    grid-row: 1 !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-watch,
  .dashboardGrid.hasFocus.focus-vault .section-watch,
  .dashboardGrid.hasFocus.focus-watchlist .section-grid,
  .dashboardGrid.hasFocus.focus-ai .section-grid{
    grid-column: 3 !important;
    grid-row: 2 !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-ai,
  .dashboardGrid.hasFocus.focus-vault .section-ai,
  .dashboardGrid.hasFocus.focus-watchlist .section-ai,
  .dashboardGrid.hasFocus.focus-ai .section-watch{
    grid-column: 3 !important;
    grid-row: 3 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardHead{
    gap: 4px !important;
    margin-bottom: 6px !important;
    align-items: flex-start !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardTitle{
    font-size: 11px !important;
    line-height: 1.08 !important;
    max-width: 118px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardActions{
    gap: 3px !important;
    transform: scale(.82) !important;
    transform-origin: top right !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardBody,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .panelScroll{
    height: calc(100% - 30px) !important;
    max-height: none !important;
    min-height: 0 !important;
    overflow: hidden !important;
    gap: 5px !important;
    padding-right: 0 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .chip,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btn,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnGhost,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnPill,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pill,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .legendItem{
    min-height: 22px !important;
    height: 22px !important;
    padding: 2px 6px !important;
    border-radius: 8px !important;
    font-size: 8px !important;
    line-height: 1 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .input,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .select,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) input,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) select,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) textarea{
    font-size: 8px !important;
    min-height: 24px !important;
    padding: 4px 6px !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .muted,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .tiny,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .text-xs,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .hint,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .label{
    font-size: 8px !important;
    line-height: 1.18 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareGrid,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLayout,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridWrap,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiWrap{
    display: block !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareLive,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareChart,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLeft,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridRight,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridControls,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridOrders,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiSelect,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiOut,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchTable,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchScroll,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .ordersList,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .liveListBox,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pairsScroll{
    max-height: none !important;
    height: auto !important;
    overflow: hidden !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) canvas,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) svg{
    max-height: 58px !important;
  }
}

/* =========================================================
   Nexus desktop layout v94
   - left reserve is only as wide as the right compact rail
   - active panel expands left and dominates the workspace
   - right rail remains readable and not vertically squeezed
   - desktop only
   ========================================================= */
@media (min-width: 981px){
  .main{
    width: 100vw !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 18px 14px 18px !important;
  }

  .dashboardGrid.hasFocus{
    width: 100% !important;
    height: 100% !important;
    display: grid !important;
    grid-template-columns: clamp(190px, 13vw, 250px) minmax(0, 1fr) clamp(210px, 13vw, 250px) !important;
    grid-template-rows: repeat(3, minmax(0, 1fr)) !important;
    column-gap: 18px !important;
    row-gap: 14px !important;
    align-items: stretch !important;
    justify-items: stretch !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel.panelActive{
    grid-column: 2 !important;
    grid-row: 1 / 4 !important;
    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    align-self: stretch !important;
    justify-self: stretch !important;
    opacity: 1 !important;
    transform: none !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive){
    grid-column: 3 !important;
    width: 100% !important;
    max-width: 250px !important;
    min-width: 210px !important;
    height: 100% !important;
    min-height: 0 !important;
    align-self: stretch !important;
    justify-self: stretch !important;
    opacity: .92 !important;
    transform: none !important;
    padding: 10px !important;
    border-radius: 16px !important;
    overflow: hidden !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-grid,
  .dashboardGrid.hasFocus.focus-vault .section-compare,
  .dashboardGrid.hasFocus.focus-watchlist .section-compare,
  .dashboardGrid.hasFocus.focus-ai .section-compare{
    grid-column: 3 !important;
    grid-row: 1 !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-watch,
  .dashboardGrid.hasFocus.focus-vault .section-watch,
  .dashboardGrid.hasFocus.focus-watchlist .section-grid,
  .dashboardGrid.hasFocus.focus-ai .section-grid{
    grid-column: 3 !important;
    grid-row: 2 !important;
  }

  .dashboardGrid.hasFocus.focus-compare .section-ai,
  .dashboardGrid.hasFocus.focus-vault .section-ai,
  .dashboardGrid.hasFocus.focus-watchlist .section-ai,
  .dashboardGrid.hasFocus.focus-ai .section-watch{
    grid-column: 3 !important;
    grid-row: 3 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardHead{
    gap: 6px !important;
    margin-bottom: 8px !important;
    align-items: flex-start !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardTitle{
    font-size: 12px !important;
    line-height: 1.12 !important;
    max-width: 165px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardActions{
    gap: 4px !important;
    transform: scale(.88) !important;
    transform-origin: top right !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .cardBody,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .panelScroll{
    height: calc(100% - 34px) !important;
    max-height: none !important;
    min-height: 0 !important;
    overflow: hidden !important;
    gap: 6px !important;
    padding-right: 0 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .chip,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btn,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnGhost,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .btnPill,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pill,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .legendItem{
    min-height: 24px !important;
    height: 24px !important;
    padding: 3px 7px !important;
    border-radius: 9px !important;
    font-size: 9px !important;
    line-height: 1 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .input,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .select,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) input,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) select,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) textarea{
    font-size: 9px !important;
    min-height: 26px !important;
    padding: 5px 7px !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .muted,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .tiny,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .text-xs,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .hint,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .label{
    font-size: 9px !important;
    line-height: 1.22 !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareGrid,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLayout,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridWrap,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiWrap{
    display: block !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareLive,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .compareChart,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridLeft,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridRight,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridControls,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .gridOrders,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiSelect,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .aiOut,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchTable,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .watchScroll,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .ordersList,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .liveListBox,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) .pairsScroll{
    max-height: none !important;
    height: auto !important;
    overflow: hidden !important;
  }

  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) canvas,
  .dashboardGrid.hasFocus .dashboardPanel:not(.panelActive) svg{
    max-height: 66px !important;
  }
}


      `}



</style>
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <AppInner />

      <div className="nexus-footer-left">
        <div className="nexus-footer-copy">© 2026 Nexus Analyt</div>

        <button
          type="button"
          className="nexus-disclaimer-btn"
          onClick={() => setShowDisclaimer(true)}
        >
          Disclaimer
        </button>

        <div className="nexus-footer-ai">AI-assisted infrastructure</div>
      </div>

      {showDisclaimer && (
        <div
          className="nexus-disclaimer-overlay"
          onClick={() => setShowDisclaimer(false)}
        >
          <div
            className="nexus-disclaimer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nexus-disclaimer-title">DISCLAIMER</div>

            <div className="nexus-disclaimer-content">
              <h3>EN</h3>
              <p>
                Nexus Analyt provides AI-assisted analytics, market intelligence
                and research tools only. No financial advice is provided.
                Cryptocurrency trading involves risk and users are fully
                responsible for their own decisions. No profits are guaranteed.
              </p>

              <h3>DE</h3>
              <p>
                Nexus Analyt stellt ausschliesslich KI-gestützte Analyse-, Markt-
                und Research-Tools bereit. Es handelt sich nicht um
                Finanzberatung. Der Handel mit Kryptowährungen ist risikoreich.
                Nutzer handeln eigenverantwortlich. Gewinne werden nicht
                garantiert.
              </p>
            </div>

            <button
              type="button"
              className="nexus-disclaimer-close"
              onClick={() => setShowDisclaimer(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// -------------------------
// Nexus Movement Quality Filter v2 (UI Layer)
// -------------------------
function getMovementQualityUi(score) {
  const n = Number(score || 0);
  if (n >= 75) return { label: "HIGH QUALITY", color: "#16c784", border: "rgba(22,199,132,.35)" };
  if (n >= 55) return { label: "MEDIUM", color: "#f5b300", border: "rgba(245,179,0,.35)" };
  return { label: "WEAK", color: "#ea3943", border: "rgba(234,57,67,.35)" };
}
