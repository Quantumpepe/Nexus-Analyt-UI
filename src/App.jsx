import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { Alchemy, Network, Utils } from "alchemy-sdk";

import "./App.css";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").trim();
const ALCHEMY_KEY = (import.meta.env.VITE_ALCHEMY_KEY ?? "").trim();
const TREASURY_ADDRESS = (import.meta.env.VITE_TREASURY_ADDRESS ?? "").trim();

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
  return url.replace(/\/v2\/[^/?#]+/i, "/v2/****");
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
const PALETTE10 = ["#2ecc71", "#3498db", "#f1c40f", "#9b59b6", "#e67e22", "#e74c3c", "#1abc9c", "#ec407a", "#bdc3c7", "#f39c12"];

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


// ------------------------
// CoinGecko price helpers (Wallet total value)
// ------------------------
const CG = {
  nativeIds: { ETH: "ethereum", POL: "polygon-pos", BNB: "binancecoin" },
  platforms: { ETH: "ethereum", POL: "polygon-pos", BNB: "binance-smart-chain" },
};

async function cgFetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  return res.json();
}

async function fetchNativeUsdPrices(chains = []) {
  const ids = Array.from(new Set((chains || []).map((c) => CG.nativeIds[c]).filter(Boolean)));
  if (!ids.length) return {};
  const qs = new URLSearchParams({ ids: ids.join(","), vs_currencies: "usd" }).toString();
  const url = `https://api.coingecko.com/api/v3/simple/price?${qs}`;
  const json = await cgFetchJson(url);
  const out = {};
  for (const c of chains || []) {
    const id = CG.nativeIds[c];
    const px = id ? Number(json?.[id]?.usd) : NaN;
    if (Number.isFinite(px)) out[c] = px;
  }
  return out;
}

async function fetchTokenUsdPrices(chainKey, addresses = []) {
  const platform = CG.platforms[chainKey];
  const addrs = Array.from(new Set((addresses || []).map((a) => String(a || "").toLowerCase()).filter(Boolean)));
  if (!platform || !addrs.length) return {};
  // CoinGecko allows many addresses; keep it safe-ish.
  const qs = new URLSearchParams({ contract_addresses: addrs.join(","), vs_currencies: "usd" }).toString();
  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?${qs}`;
  const json = await cgFetchJson(url);
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

async function api(path, { method = "GET", token, body } = {}) {
  // Backend auth note:
  // Your Flask backend currently returns 401 for /api/policy and /api/grid/* when
  // the request lacks the expected auth context. Depending on your backend setup,
  // this may be cookie-session based (needs credentials: "include") or token based.
  // We support both:
  //   1) Always include cookies.
  //   2) If a token is provided, send it as a Bearer token.
  //   3) If the backend rejects Bearer tokens (401), retry once without the Bearer
  //      header (so public/cookie-only endpoints still work).

  const makeHeaders = (withBearer) => {
    const headers = { "Content-Type": "application/json" };
    if (withBearer && token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const doFetch = async (withBearer) => {
    return fetch(`${API_BASE}${path}`, {
      method,
      headers: makeHeaders(withBearer),
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  // First try with Bearer (if provided).
  let res = await doFetch(true);

  // If backend rejects Bearer but would accept cookie/public, retry once without it.
  if (res.status === 401 && token) {
    res = await doFetch(false);
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
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
async function _ensureEthMainnet() {
  if (!window?.ethereum?.request) throw new Error("No injected wallet found (MetaMask).");
  const chainHex = await window.ethereum.request({ method: "eth_chainId" });
  if (String(chainHex).toLowerCase() === "0x1") return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }],
    });
  } catch (e) {
    throw new Error("Please switch your wallet to Ethereum Mainnet.");
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
  { key: "3Y", label: "3Y" },
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
  if (timeframe === "1D") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" });
}

// ------------------------
// SVG chart with y-scale + x labels
// ------------------------
function SvgChart({ chart, height = 320, highlightSym, onHoverSym, indexMode, timeframe, colorForSym, lineClassForSym }) {
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
          const isHi = !highlightSym || highlightSym === sym;
          const opacity = highlightSym ? (isHi ? 0.95 : 0.18) : 0.90;
          const strokeWidth = highlightSym ? (isHi ? 3.2 : 2.2) : 3.0;

          return (
            <path
              key={sym}
              d={d}
              className={`chartLine ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`}
              style={{ opacity, strokeWidth, stroke: (colorForSym ? colorForSym(sym) : PALETTE10[idx % 10]) }}
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
          const svgX = (px / rect.width) * w;

          // Map mouse X onto plot area (between padL and w-padR)
          const clamped = Math.max(padL, Math.min(svgX, w - padR));
          const frac = (clamped - padL) / (w - padL - padR);
          const i = clampIdx(Math.round(frac * (n - 1)));
          setHoverIdx(i);
        }}
        onMouseLeave={() => setHoverIdx(null)}
      />

      {hoverIdx !== null && (
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            background: "rgba(7,24,22,.92)",
            border: "1px solid rgba(210,220,230,.18)",
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
                opacity: highlightSym && highlightSym !== sym ? 0.55 : 1,
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

function Legend({ symbols, highlightSym, setHighlightSym, colorForSym, lineClassForSym }) {
  return (
    <div className="chartLegend">
      {symbols.map((sym, idx) => {
        const active = !highlightSym || highlightSym === sym;
        return (
          <button
            key={sym}
            className={`legendItem ${active ? "active" : ""}`}
            onClick={() => setHighlightSym((v) => (v === sym ? null : sym))}
            title="Click to highlight"
          >
            <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE10[idx % 10]) }} />
            <span className="legendSym">{sym}</span>
          </button>
        );
      })}
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
          <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE10[idx % 10]) }} />
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
      title="Click to highlight in overlay"
    >
      <div className="sparkTop">
        <span className={`legendDot ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ backgroundColor: (colorForSym ? colorForSym(sym) : PALETTE10[idx % 10]) }} />
        <span className="sparkSym">{sym}</span>
        <span className="sparkVal mono">{hovered && deltaPct != null ? fmtPct(deltaPct) : lastTxt}</span>
      </div>
      <svg className="sparkSvg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <path d={d} className={`chartLine ${lineClassForSym ? lineClassForSym(sym) : `line${(idx % 10) + 1}`}`} style={{ opacity: 0.95, strokeWidth: 2.8, stroke: (colorForSym ? colorForSym(sym) : PALETTE10[idx % 10]) }} />
      </svg>
      <div className="sparkFoot muted tiny">{indexMode ? "Index 100" : "Price"} · 30D</div>
    </button>
  );
}


// ------------------------
// Best pairs
// ------------------------
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
  
  const [watchErr, setWatchErr] = useState("");
const [errorMsg, setErrorMsg] = useState("");


  // Privy (Auth + embedded wallet). IMPORTANT: We do NOT trigger MetaMask here.
  // External wallets must be optional and only enabled explicitly elsewhere.
  const { authenticated, login, logout, getAccessToken } = usePrivy();
  const { wallets: privyWallets } = useWallets();

  // auth
  const [token, setToken] = useLocalStorageState("nexus_token", "");
  const [wallet, setWallet] = useLocalStorageState("nexus_wallet", "");
  // Trading policy is UI-only for now (no Vault/Allowance yet).
  // Keep it local to avoid backend auth/CORS coupling during early UX work.
  const [policy, setPolicy] = useState({ trading_enabled: false });
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Alchemy balances (native per chain, optionally tokens later)
  const [balLoading, setBalLoading] = useState(false);
  const [balError, setBalError] = useState("");
  const [balByChain, setBalByChain] = useState({}); // { ETH: { native: "0.0" }, ... }
  const [balActiveChain, setBalActiveChain] = useState("ETH");

  // Wallet USD valuation (CoinGecko). Includes native + stables + user-added tokens (when priced).
  const [walletUsd, setWalletUsd] = useState({ total: null, byChain: {}, unpriced: 0, ts: null });
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
    const addr = String(tokenAddress || "").toLowerCase();
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

  const CHAIN_ID = { ETH: 1, POL: 137, BNB: 56 };

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
    const c = String(chain || "BNB").toUpperCase();
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
  // This keeps the app working without any MetaMask flow.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!authenticated) {
        setWallet("");
        setToken("");
        setPolicy(null);
        return;
      }

      // Prefer the embedded wallet address from Privy (avoid external wallets).
      const embedded =
        privyWallets?.find((w) =>
          ["privy", "embedded"].includes(String(w?.walletClientType || "").toLowerCase()) ||
          String(w?.connectorType || "").toLowerCase() === "embedded"
        ) ||
        privyWallets?.[0];

      const addr = String(embedded?.address || "").toLowerCase();
      if (!cancelled && addr) setWallet(addr);

      // Privy access token (JWT). Your backend should verify this.
      // If backend doesn't use it yet, keeping it here is harmless.
      try {
        const t = (await getAccessToken?.()) || "";
        if (!cancelled) setToken(t);
      } catch {
        if (!cancelled) setToken("");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, privyWallets?.length]);

  const connectWallet = async () => {
    // Connect = Privy login only (email/embedded). Never trigger MetaMask here.
    try {
      await login();
    } catch (e) {
      setErrorMsg(String(e?.message || e || "Login failed"));
    }
  };

  const disconnectWallet = async () => {
    try {
      await logout();
      setWalletModalOpen(false);
    } catch (e) {
      setErrorMsg(String(e?.message || e || "Logout failed"));
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
      const baseChains = ["ETH", "POL", "BNB"];

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

          const chains = ["ETH", "POL", "BNB"].filter((c) => out?.[c]);
          const nativePx = await fetchNativeUsdPrices(chains);

          // Token prices (user-added tokens only; stables assumed $1)
          const tokenPxByChain = {};
          for (const c of chains) {
            const custom = out?.[c]?.custom || [];
            const addrs = custom.map((t) => t?.address).filter(Boolean);
            tokenPxByChain[c] = addrs.length ? await fetchTokenUsdPrices(c, addrs) : {};
          }

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
            const st = row?.stables || {};
            let stableVal = 0;
            for (const k of Object.keys(st || {})) {
              const b = Number(st?.[k]);
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
  const [watchItems, setWatchItems] = useLocalStorageState("nexus_watch_items", [
    { symbol: "BTC", mode: "market" },
    { symbol: "ETH", mode: "market" },
    { symbol: "POL", mode: "market" },
  ]);
  const [watchRows, setWatchRows] = useState([]);
  const [compareSet, setCompareSet] = useLocalStorageState("nexus_compare_set", ["BTC", "ETH", "POL"]);
  const compareSymbols = useMemo(() => {
    const uniq = [];
    for (const s of compareSet || []) {
      const sym = String(s || "").toUpperCase().trim();
      if (sym && !uniq.includes(sym)) uniq.push(sym);
    }
    return uniq.slice(0, 10);
  }, [compareSet]);

  // -------- Fixed color slots (10), stable per coin --------
  // Rule: coin keeps its color while selected; when removed, its slot becomes free for the next new coin.
  const colorSlotsRef = useRef(new Map()); // sym -> slot index (0..9)
  const freeSlotsRef = useRef(new Set(PALETTE10.map((_, i) => i)));

  const ensureColorSlot = (sym) => {
    const S = String(sym || "").toUpperCase();
    if (!S) return 0;
    const m = colorSlotsRef.current;
    if (m.has(S)) return m.get(S);
    const free = freeSlotsRef.current;
    const next = free.values().next().value;
    const idx = next !== undefined ? next : (m.size % PALETTE10.length);
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

  const colorForSym = (sym) => PALETTE10[ensureColorSlot(sym) % PALETTE10.length];
  const lineClassForSym = (sym) => `line${(ensureColorSlot(sym) % PALETTE10.length) + 1}`;


  // compare/chart
  const [timeframe, setTimeframe] = useState("30D");
  const PAIR_EXPLAIN_TF = "30D";

  // Access (NFT / Code) - UI only (stored locally). Later we can wire this to backend verification.
  // Access (NFT / Code) — backend driven (status + redeem)
  const [access, setAccess] = useState(null); // { active, until, source, tier, note }
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessTab, setAccessTab] = useState("redeem"); // 'redeem' | 'nft' | 'subscribe' | 'subscribe'

  const [redeemCode, setRedeemCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemMsg, setRedeemMsg] = useState("");

  const [nftBusy, setNftBusy] = useState(false);
  const [nftMsg, setNftMsg] = useState("");

  // Subscribe (USDC/USDT on ETH)
  const [subPlan, setSubPlan] = useState("silver"); // silver=$10 (ETH/BNB/POL) | gold=$25 (full app)
  const [subToken, setSubToken] = useState("USDC"); // USDC | USDT
  const [subBusy, setSubBusy] = useState(false);
  const [subMsg, setSubMsg] = useState("");

  const refreshAccess = useCallback(async () => {
    if (!wallet) {
      setAccess(null);
      return;
    }
    try {
      const res = await api(`/api/access/status?addr=${encodeURIComponent(wallet)}`);
      setAccess(res || null);
    } catch (e) {
      console.warn("access/status failed", e);
      // keep previous state
    }
  }, [wallet, api]);

  useEffect(() => {
    refreshAccess();
  }, [refreshAccess]);

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

  const activateNft = useCallback(async () => {
    if (!wallet) {
      setNftMsg("Wallet nicht verbunden.");
      return;
    }
    setNftBusy(true);
    setNftMsg("");
    try {
      // backend decides which NFT/contract to check; keep payload minimal
      const res = await api("/api/nft/activate", {
        method: "POST",
        body: { addr: wallet },
      });
      if (res?.ok === false) throw new Error(res?.error || "NFT activate failed");
      setNftMsg(res?.message || "NFT geprüft / aktiviert.");
      await refreshAccess();
    } catch (e) {
      setNftMsg(e?.message || "NFT Aktivierung noch nicht verfügbar.");
    } finally {
      setNftBusy(false);
    }
  }, [wallet, api, refreshAccess]);


  const subscribePay = useCallback(async () => {
    if (!wallet) {
      setSubMsg("Wallet nicht verbunden.");
      return;
    }
    if (!TREASURY_ADDRESS) {
      setSubMsg("Treasury-Adresse fehlt (VITE_TREASURY_ADDRESS).");
      return;
    }

    setSubBusy(true);
    setSubMsg("");
    try {
      // ETH only (chainId 1)
      await _ensureEthMainnet();

      const specs = TOKEN_WHITELIST.ETH || [];
      const spec = specs.find((t) => t.symbol === subToken);
      if (!spec?.address) throw new Error("Token not supported.");

      const priceUsd = subPlan === "gold" ? 25 : 10;
      const amountUnits = BigInt(priceUsd) * (10n ** BigInt(spec.decimals || 6));

      const data = _erc20TransferData(TREASURY_ADDRESS, amountUnits);

      const txHash = await window.ethereum.request({
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

      // Ask backend to verify on-chain payment + activate plan
      const res = await api("/api/access/subscribe/verify", {
        method: "POST",
        body: { chain_id: 1, tx_hash: txHash, plan: subPlan },
      });

      setSubMsg(res?.already_verified ? "Payment already verified. Access updated." : "Payment verified. Access activated.");
      setAccessModalOpen(false);
      await refreshAccess();
    } catch (e) {
      setSubMsg(e?.message || "Payment failed.");
    } finally {
      setSubBusy(false);
    }
  }, [wallet, subPlan, subToken, api, refreshAccess]);

  // Best-pair explain (click -> modal)
  const [selectedPair, setSelectedPair] = useState(null); // e.g. { pair:"BTC/ETH", score, corr }
  const [aiExplainLoading, setAiExplainLoading] = useState(false);
  const [aiExplainText, setAiExplainText] = useState("");
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

  function openPairExplain(p) {
    setSelectedPair(p);
    setAiExplainText("");
    setAiExplainLoading(false);

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
      const series = r?.series || {};
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

      // backend series format: [{t:..., v:...}, ...] OR already-numeric arrays
      const first = (firstPt && typeof firstPt === "object") ? Number(firstPt.v) : Number(firstPt);
      const last = (lastPt && typeof lastPt === "object") ? Number(lastPt.v) : Number(lastPt);

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
    // Optional AI: keep it local for now (no backend/web). Fast + cheap.
    if (!selectedPair) return;
    setAiExplainLoading(true);
    try {
      const [a, b] = _pairSyms(selectedPair.pair);
      const ra = _retPctForExplain(a);
      const rb = _retPctForExplain(b);
      const spread = (Number.isFinite(ra) && Number.isFinite(rb)) ? (ra - rb) : null;
      const corr = selectedPair?.corr;

      const bullets = [];
      if (Number.isFinite(ra) && Number.isFinite(rb)) {
        bullets.push(`${a} moved ${_fmtPctLocal(ra)} while ${b} moved ${_fmtPctLocal(rb)} over $PAIR_EXPLAIN_TF.`);
        bullets.push(`Performance spread is ${_fmtPctLocal(spread)} (A minus B).`);
      } else {
        bullets.push("Not enough data to compute reliable performance spread for this range.");
      }
      if (typeof corr === "number") {
        bullets.push(`Correlation is ${(corr >= 0 ? "+" : "") + corr.toFixed(2)} (higher means they often move together).`);
      }
      bullets.push("Grid idea: consider selling the outperformer and accumulating the underperformer (reversion bet) — only if you accept trend risk.");
      bullets.push("Risk: if a strong trend continues, grids can bleed. Use small budget, wider steps, and stop rules.");
      setAiExplainText("• " + bullets.join("\n• "));
    } catch (e) {
      setAiExplainText("AI commentary failed.");
    } finally {
      setAiExplainLoading(false);
    }
  }
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareSeries, setCompareSeries] = useState({});
  const [indexMode, setIndexMode] = useState(true);
  const [viewMode, setViewMode] = useState("overlay"); // overlay | grid
  const [highlightSym, setHighlightSym] = useState(null);

  const chartRaw = useMemo(() => buildUnifiedChart(compareSeries), [compareSeries]);
  const bestPairsTop = useMemo(() => computeBestPairs(chartRaw, 30).slice(0, 10), [chartRaw]);

  // grid (manual)
  const [gridItem, setGridItem] = useState("BTC");
  // Grid coin source: wallet holdings only (native + stables + user-added tokens).
  // This avoids showing market/watchlist items that cannot be traded from the wallet.
  const gridWalletCoins = useMemo(() => {
    const chain = String(balActiveChain || "ETH").toUpperCase();
    const row = balByChain?.[chain] || {};
    const out = [];

    // native coin of the active chain (ETH / POL / BNB)
    out.push(chain);

    // stables present on this chain (USDC/USDT etc.)
    const st = row?.stables || {};
    for (const k of Object.keys(st)) out.push(String(k).toUpperCase());

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
    if (!gridWalletCoins.length) return;
    const cur = String(gridItem || "").toUpperCase();
    if (!cur || !gridWalletCoins.includes(cur)) {
      setGridItem(gridWalletCoins[0]);
    }
  }, [gridWalletCoins, gridItem]);


  const [gridMode, setGridMode] = useState("SAFE");
  const [gridInvestUsd, setGridInvestUsd] = useState(250);
  const [gridMeta, setGridMeta] = useState({ tick: null, price: null });
  const [gridOrders, setGridOrders] = useState([]);
  const [manualSide, setManualSide] = useState("BUY");
  const [manualPrice, setManualPrice] = useState("");
  const [manualBuyMode, setManualBuyMode] = useState("USD"); // USD | QTY (only used for BUY)
  const [manualUsd, setManualUsd] = useState("");
  const [gridQuickStepsStr, setGridQuickStepsStr] = useState("0.5, 1, 2");
  const gridQuickSteps = useMemo(() => {
    const arr = (gridQuickStepsStr || "")
      .split(/[,\s]+/)
      .map((s) => parseFloat(s))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 8);
    return arr.length ? arr : [0.5, 1, 2];
  }, [gridQuickStepsStr]);
  const [manualQty, setManualQty] = useState("");

  // AI
  const [aiSelected, setAiSelected] = useLocalStorageState("nexus_ai_selected", []);
  const [aiKind, setAiKind] = useState("analysis");
  const [aiProfile, setAiProfile] = useState("balanced");
const [aiQuestion, setAiQuestion] = useState("");
  
  const [aiFollowUp, setAiFollowUp] = useState(true);
  const [aiHistory, setAiHistory] = useState([]); // [{role:"user"|"assistant", content:string}]
const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  // watch snapshot polling
  const inflightWatch = useRef(false);
  const fetchWatchSnapshot = async () => {
    if (inflightWatch.current) return;
    inflightWatch.current = true;
    try {
      const r = await api("/api/watchlist/snapshot", { method: "POST", body: { items: watchItems } });
      setWatchRows(r?.results || []);
      if ((r?.results || []).length) {
        const symUp = String(gridItem || "").toUpperCase();
        const exists = (r.results || []).some((x) => String(x.symbol || "").toUpperCase() === symUp);
        if (!exists) setGridItem(String(r.results[0].symbol || "BTC").toUpperCase());
      }
    } catch (e) {
      setErrorMsg(`Watchlist: ${e.message}`);
    } finally {
      inflightWatch.current = false;
    }
  };

  useEffect(() => {
    fetchWatchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useInterval(fetchWatchSnapshot, 120000, true);

  // compare fetch (batched /api/compare)
  const inflightCompare = useRef(false);
  const fetchCompare = async () => {
    if (inflightCompare.current) return;

    if (!compareSymbols.length) {
      setCompareSeries({});
      return;
    }
    inflightCompare.current = true;
    setCompareLoading(true);
    try {
      const batches = [];

      for (let i = 0; i < compareSymbols.length; i += 8) {
        const chunk = compareSymbols.slice(i, i + 8);
        const qs = new URLSearchParams({
          symbols: chunk.join(","),
          range: timeframe,
        }).toString();
        if (i > 0) await sleep(120);
        const r = await api(`/api/compare?${qs}`, { method: "GET" });
        batches.push(r);
      }

      const merged = mergeCompareBatches(batches);
      setCompareSeries(merged.series || {});
    } catch (e) {
      setErrorMsg(`Compare: ${e.message}`);
    } finally {
      inflightCompare.current = false;
      setCompareLoading(false);
    }
  };

  useEffect(() => {
    fetchCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, compareSymbols.join("|")]);

  useInterval(fetchCompare, 120000, compareSymbols.length > 0);

  // policy (UI-only for now)
  function setTradingEnabled(enabled) {
    setErrorMsg("");
    setPolicy((p) => ({ ...(p || {}), trading_enabled: !!enabled }));
  }

  // grid
  const fetchGridOrders = async () => {
    if (!token || !gridItem) return;
    try {
      const qs = new URLSearchParams({ item: gridItem }).toString();
      const r = await api(`/api/grid/orders?${qs}`, { method: "GET", token });
      const orders = r?.orders || r?.data?.orders || [];
      setGridOrders(Array.isArray(orders) ? orders : []);
      const tick = r?.tick ?? r?.data?.tick ?? null;
      const price = r?.price ?? r?.data?.price ?? null;
      setGridMeta({ tick, price });
    } catch (e) {
      setErrorMsg((m) => (m ? m : `Grid orders: ${e.message}`));
    }
  };

  async function gridStart() {
    setErrorMsg("");
    try {
      const body = { item: gridItem, mode: gridMode, order_mode: "MANUAL", invest_usd: Number(gridInvestUsd) || 0 };
      const r = await api("/api/grid/start", { method: "POST", token: token || undefined, body });
      setGridMeta({ tick: r?.tick ?? null, price: r?.price ?? null });
      setGridOrders(r?.orders || []);
      fetchGridOrders();
    } catch (e) {
      setErrorMsg(`Grid start: ${e.message}`);
    }
  }

  async function gridStop() {
    setErrorMsg("");
    try {
      const r = await api("/api/grid/stop", { method: "POST", token: token || undefined, body: { item: gridItem } });
      setGridMeta({ tick: r?.tick ?? null, price: r?.price ?? null });
      setGridOrders(r?.orders || []);
    } catch (e) {
      setErrorMsg(`Grid stop: ${e.message}`);
    }
  }

  async function addManualOrder() {
    setErrorMsg("");
    if (!token) return setErrorMsg("Connect wallet first.");
    if (!policy?.trading_enabled) return setErrorMsg("Trading is OFF. Enable trading first.");
    try {
      const price = Number(manualPrice);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Invalid price.");

      const body = { item: gridItem, side: manualSide, price };

      if (manualSide === "BUY") {
        if (manualBuyMode === "USD") {
          const usd = manualUsd === "" ? undefined : Number(manualUsd);
          if (usd === undefined || !Number.isFinite(usd) || usd <= 0) throw new Error("Invalid USD amount.");
          body.usd = usd;
        } else {
          const qty = manualQty === "" ? undefined : Number(manualQty);
          if (qty === undefined || !Number.isFinite(qty) || qty <= 0) throw new Error("Invalid qty.");
          body.qty = qty;
        }
      } else {
        // SELL always by qty
        const qty = manualQty === "" ? undefined : Number(manualQty);
        if (qty === undefined || !Number.isFinite(qty) || qty <= 0) throw new Error("Invalid qty.");
        body.qty = qty;
      }

      const r = await api("/api/grid/manual/add", { method: "POST", token, body });
      setGridOrders(r?.orders || []);
      setGridMeta({ tick: r?.tick ?? null, price: r?.price ?? null });
      fetchGridOrders();
    } catch (e) {
      setErrorMsg(`Manual add: ${e.message}`);
    }
  }

  useInterval(fetchGridOrders, 15000, !!token && !!gridItem);

  const gridLiveFallback = useMemo(() => {
    const row = (watchRows || []).find((r) => String(r.symbol || "").toUpperCase() === String(gridItem || "").toUpperCase());
    return row?.price ?? null;
  }, [watchRows, gridItem]);
  const shownGridPrice = gridMeta.price ?? gridLiveFallback ?? null;

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


  // watchlist actions
  function toggleCompare(sym) {
    const S = String(sym || "").toUpperCase();
    if (!S) return;
    setCompareSet((prev) => {
      const arr = Array.isArray(prev) ? prev.slice() : [];
      const has = arr.includes(S);
      if (has) return arr.filter((x) => x !== S);
      if (arr.length >= 10) return arr;
      arr.push(S);
      return arr;
    });
  }

  const [addOpen, setAddOpen] = useState(false);
  const [addSymbol, setAddSymbol] = useState("");
  const [addIsToken, setAddIsToken] = useState(false);
  const [addContract, setAddContract] = useState("");
  const [addChain, setAddChain] = useState("eth");

  async function submitAdd() {
  const sym = String(addSymbol || "").trim().toUpperCase();
  if (!sym) return;

  const item = addIsToken
    ? { symbol: sym, mode: "dex", contract: String(addContract || "").trim(), chain: String(addChain || "").trim() }
    : { symbol: sym, mode: "market" };

  if (item.mode === "dex" && !item.contract) {
    return setErrorMsg("Contract address required for token.");
  }

  // Build next items array deterministically so we can refresh immediately.
  const prev = Array.isArray(watchItems) ? watchItems : [];
  const key = `${item.mode}|${item.symbol}|${item.contract || ""}`.toLowerCase();
  const exists = prev.some(
    (x) => `${x.mode || "market"}|${String(x.symbol || "")}|${String(x.contract || "")}`.toLowerCase() === key
  );

  const nextItems = exists ? prev : [...prev, item];

  // Optimistic update
  setWatchItems(nextItems);

  // close/reset modal
  setAddOpen(false);
  setAddSymbol("");
  setAddIsToken(false);
  setAddContract("");
  setAddChain("eth");

  // Persist + refresh rows immediately so user doesn't have to press Refresh
  try {
    const data = await api("/api/watchlist/snapshot", {
      method: "POST",
      body: { items: nextItems },
    });
    if (data?.rows) setWatchRows(data.rows);
    if (data?.coins) setCompareCoins(data.coins);
    if (data?.symbols) setCompareSymbols(data.symbols);
    if (data?.cached != null) setWatchCached(Boolean(data.cached));
    setWatchErr("");
  } catch (e) {
    setWatchErr(String(e?.message || e));
  }
}

  function removeWatchItemByKey({ symbol, mode = "market", tokenAddress = "" }) {
  const sym = String(symbol || "").toUpperCase();
  const m = String(mode || "market").toLowerCase();
  const addr = String(tokenAddress || "").toLowerCase();

  // Build next "items" array (the true source of truth we send to backend)
  const nextItems = (watchItems || []).filter((x) => {
    if (!x) return false;
    const xs = String(x.symbol || "").toUpperCase();
    const xm = String(x.mode || "market").toLowerCase();
    const xa = String(x.tokenAddress || "").toLowerCase();
    return !(xs === sym && xm === m && xa === addr);
  });

  // Optimistic UI update (so it disappears immediately)
  setWatchItems(nextItems);
  setWatchRows((prev) =>
    (prev || []).filter((r) => {
      if (!r) return false;
      const rs = String(r.symbol || "").toUpperCase();
      const rm = String(r.mode || "market").toLowerCase();
      const ra = String(r.tokenAddress || "").toLowerCase();
      return !(rs === sym && rm === m && ra === addr);
    })
  );

  // Keep compare selection consistent (avoid "ghost" selections)
  setCompareSet((prev) => {
    const p = Array.isArray(prev) ? prev : [];
    return p.filter((s) => String(s || "").toUpperCase() !== sym);
  });

  // Persist: ask backend to recompute snapshot for the new items list
  // (This makes sure the item doesn't come back on next poll.)
  (async () => {
    try {
      const data = await api("/api/watchlist/snapshot", {
        method: "POST",
        body: { items: nextItems },
      });

      if (data?.rows) setWatchRows(data.rows);
      if (data?.coins) setCompareCoins(data.coins);
      if (data?.symbols) setCompareSymbols(data.symbols);
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
    const bullets = entries.map(([sym, st]) => {
      const ch = st?.changePct;
      const vol = st?.volPct;
      const mdd = st?.maxDDPct;
      const last = st?.last;
      const first = st?.first;
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
    const q = (aiQuestion || "").trim();

    // Require at least 1 coin context from AI selection or Compare selection
    const syms = (aiSelected && aiSelected.length ? aiSelected : compareSymbols).slice(0, 6);
    if (!syms.length) return setErrorMsg("Select at least 1 coin in Compare (or AI).");
    const qFinal = q || (aiKind === "Signals"
      ? `Give ${aiProfile} trading signals and key levels based on the selected timeframe.`
      : `Provide a ${aiProfile} ${aiKind.toLowerCase()} based on the selected timeframe, and summarize key trends, risks, and actionable takeaways.`);


    setAiLoading(true);
    try {
      // Chart timeframe is the source of truth for Pro mode.
      const tf = String(timeframe || "").toUpperCase();

      // Build per-coin stats from the SAME series used by the chart (selected timeframe)
      const statsForSym = (sym) => {
        const pts = ((compareSeries && compareSeries[sym]) || []).slice().sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
        const vals = pts.map(p => p && Number.isFinite(p.v) ? p.v : null).filter(v => v != null);
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
          const dd = peak ? (v / peak) - 1 : 0; // negative
          if (dd < maxDD) maxDD = dd;
        }
        const min = Math.min(...vals);
        const max = Math.max(...vals);

        return { first, last, changePct, volPct, maxDDPct: maxDD * 100, min, max, points: vals.length };
      };

      const seriesStats = {};
      for (const s of syms) {
        const st = statsForSym(s);
        if (st) seriesStats[s] = st;
      }

      const statsText = Object.entries(seriesStats)
        .map(([s, st]) => `${s}: change=${(st.changePct ?? 0).toFixed(2)}%, vol=${(st.volPct ?? 0).toFixed(2)}%, maxDD=${(st.maxDDPct ?? 0).toFixed(2)}%, range=[${st.min}, ${st.max}], points=${st.points}`)
        .join("\\n");


      // Keep short history for follow-ups (optional)
      const trimmedHist = (aiHistory || []).slice(-10);
      const historyText = trimmedHist
        .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
        .join("\n");

      const header =
        `Timeframe: ${tf} (use ONLY this timeframe's series stats below; do NOT talk about 24h unless Timeframe is 1D/24H).\n` +
        `Coins: ${syms.join(", ")}\n` +
        (statsText ? `Series stats (${tf}):\n${statsText}\n` : "");

      const questionText =
        aiFollowUp && historyText ? `${header}${historyText}\nUser: ${qFinal}` : `${header}User: ${qFinal}`;

      const body = {
        kind: aiKind,
        symbols: syms,
        profile: aiProfile,
        question: questionText,
        timeframe: tf,
        index_mode: !!indexMode,
        history: aiFollowUp ? trimmedHist : [],
        series_stats: seriesStats,
      };

      const r = await api("/api/ai/run", { method: "POST", token: token || undefined, body });

      let text =
        r?.answer ??
        r?.output ??
        r?.text ??
        r?.message ??
        (typeof r === "string" ? r : "");

      if (!text) text = "No AI response.";
      text = String(text).replace(/\\n/g, "\n");
      text = normalizeAiOutput(text, tf, q, seriesStats);
      setAiOutput(text);

      // Update history (only when follow-up enabled)
      if (aiFollowUp) {
        setAiHistory((prev) => {
          const next = [...(prev || []), { role: "user", content: qFinal }, { role: "assistant", content: text }];
          return next.slice(-10);
        });
  }
    } catch (e) {
      setErrorMsg(`AI: ${e.message}`);
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
    return compareSymbols.map((sym) => ({ sym, row: bySym.get(sym) || null }));
  }, [watchRows, compareSymbols]);

  return (
    <div className="app">
      
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
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 10px;
            padding-bottom: 10px;
          }
          header.topbar .brand {
            flex: 1 1 240px;
            min-width: 220px;
          }
          header.topbar .walletBox {
            flex: 1 1 100%;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            gap: 8px;
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
            <div className="brandSub">Compare + Grid + Watchlist + AI</div>
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
              {wallet ? `Wallet: ${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "Wallet not connected"}
            </button>

            {/* External connect is EXPLICIT: only this button may open MetaMask */}
            <button
              type="button"
              className="btn"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (wallet) disconnectWallet();
                else connectWallet();
              }}
            >
              {wallet ? "Disconnect" : "Connect"}
            </button>
          </div>

          

          {/* Access (Redeem / NFT) */}
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
                  setAccessTab("nft");
                  setNftMsg("");
                  setAccessModalOpen(true);
                }}
                title="Activate NFT"
              >
                Activate NFT
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
                {access?.active ? (
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
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                style={{
                  position: "fixed",
                  top: 78,
                  right: 24,
                  width: 380,
                  maxWidth: "calc(100vw - 24px)",
                  background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                  border: "1px solid rgba(255,255,255,0.08)",
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
                  Redeem a permanent code, or activate access via NFT.
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
                ) : accessTab === "nft" ? (
                  <div>
                    <div className="hint">Check connected wallet for a valid access NFT:</div>
                    <div className="row" style={{ gap: 8, marginTop: 8 }}>
                      <button className="btn" disabled={nftBusy} onClick={activateNft}>
                        {nftBusy ? "..." : "Check / Activate"}
                      </button>
                    </div>
                    {nftMsg ? <div className="hint" style={{ marginTop: 8 }}>{nftMsg}</div> : null}
                  </div>
                ) : (
                  <div>
                    <div className="hint" style={{ marginBottom: 8 }}>
                      Subscribe with USDC/USDT on <b>Ethereum</b> (ETH mainnet).
                    </div>

                    <div className="hint" style={{ marginBottom: 8, opacity: 0.9 }}>
                      <b>Basic</b> ($10/mo): ETH, BNB, POL · <b>Pro</b> ($25/mo): Full app
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <button
                        type="button"
                        className={`pill ${subPlan === "silver" ? "active" : ""}`} style={{ color: "#fff", background: subPlan === "silver" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                        onClick={() => setSubPlan("silver")}
                      >
                        Basic $10
                      </button>
                      <button
                        type="button"
                        className={`pill ${subPlan === "gold" ? "active" : ""}`} style={{ color: "#fff", background: subPlan === "gold" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                        onClick={() => setSubPlan("gold")}
                      >
                        Pro $25
                      </button>
                      <div style={{ flex: 1 }} />
                      <button
                        type="button"
                        className={`pill ${subToken === "USDC" ? "active" : ""}`} style={{ color: "#fff", background: subToken === "USDC" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                        onClick={() => setSubToken("USDC")}
                      >
                        USDC
                      </button>
                      <button
                        type="button"
                        className={`pill ${subToken === "USDT" ? "active" : ""}`} style={{ color: "#fff", background: subToken === "USDT" ? "rgba(57,217,138,0.22)" : "rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}
                        onClick={() => setSubToken("USDT")}
                      >
                        USDT
                      </button>
                    </div>

                    <div className="hint" style={{ marginBottom: 8, opacity: 0.9 }}>
                      Selected: <b>{subPlan === "gold" ? "Pro $25" : "Basic $10"}</b> · <b>{subToken}</b>
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
                      Note: You must have enough {subToken} for the plan amount plus ETH gas.
                    </div>
                  </div>
                )}

                <div className="hint" style={{ marginTop: 14 }}>
                  Status: {access?.active ? "ACTIVE" : "OFF"}
                  {access?.source ? ` • via ${access.source}` : ""}
                  {access?.tier ? ` • ${access.tier}` : ""}
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
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                position: "absolute",
                top: 52,
                right: 0,
                width: 340,
                background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))",
                border: "1px solid rgba(255,255,255,0.08)",
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
                <div><b>Address</b></div>
                <div>{wallet || "Not connected"}</div>
              </div>

              <div className="hr" style={{ margin: "12px 0" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div className="cardTitle" style={{ margin: 0, fontSize: 14 }}>Balances</div>

                  {/* Active chain for wallet + grid */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {["ETH", "POL", "BNB"].map((c) => {
                      const active = (balActiveChain || "ETH") === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBalActiveChain(c)}
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
                    })}</div>

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
                {["ETH", "POL", "BNB"].map((c) => {
                  const row = balByChain?.[c] || {};
                  const nativeLabel = c; // ETH / POL / BNB
                  return (
                    <div
                      key={c}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "10px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div style={{ fontWeight: 800 }}>{c}</div>
                        <div style={{ fontVariantNumeric: "tabular-nums" }}>
                          {nativeLabel}: {row.native ?? "—"}
                        </div>
                      </div>

                      
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
                            <div className="muted">{sym}</div>
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
                                  {t.symbol}
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
            </div>


          {/* Add token modal (saved per wallet; unlimited). */}
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
                border: "1px solid rgba(255,255,255,0.10)",
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
                      {addTokenChain === "ETH"
                        ? "Ethereum"
                        : addTokenChain === "POL"
                        ? "Polygon"
                        : "BNB Chain"}
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
                    <div style={{ maxHeight: 220, overflow: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
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

          <div className="walletRow">
            <div className={`pill ${policy?.trading_enabled ? "good" : "bad"}`}>Trading: {policy?.trading_enabled ? "ON" : "OFF"}</div>
            <button className="btnGhost" onClick={() => setTradingEnabled(true)} disabled={!token}>Enable</button>
            <button className="btnGhost" onClick={() => setTradingEnabled(false)} disabled={!token}>Disable</button>

            <InfoButton title="Wallet & Trading">
              <Help showClose dismissable
                de={
                  <>
                    <p><b>Connect</b> verbindet deine Wallet (Sign-In) und holt ein Session-Token.</p>
                    <p><b>Trading ON/OFF</b> schaltet das Platzieren von echten Manual-Orders frei (Policy).</p>
                  </>
                }
                en={
                  <>
                    <p><b>Connect</b> signs in with your wallet and obtains a session token.</p>
                    <p><b>Trading ON/OFF</b> enables real manual order placement (policy gate).</p>
                  </>
                }
              />
            </InfoButton>
          </div>
        </div>
      



</header>

      <main className="main mobileStack">
        {/* Compare */}
        <section className="card section-compare">
          <div className="cardHead">
            <div className="cardTitle">Compare (max 10)</div>
            <div className="cardActions">
              {TIMEFRAMES.map((tf) => {
                const disabled = !!tf.intraday;
                return (
                  <button
                    key={tf.key}
                    className={`chip ${timeframe === tf.key ? "active" : ""}`}
                    onClick={() => setTimeframe(tf.key)}
                    disabled={disabled}
                    title={disabled ? "Needs backend intraday endpoint" : ""}
                  >
                    {tf.label}
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
                      <p><b>Was ist das?</b> Vergleich von bis zu 10 Coins aus der Watchlist-Compare-Auswahl.</p>
                      <p><b>Index 100</b> normalisiert alle Coins (Start=100) — besser bei vielen Coins.</p>
                      <p><b>Overlay</b>: alle Coins im selben Chart. <b>Grid</b>: jeder Coin als Mini-Chart (besser bei 10 Coins).</p>
                          <p><b>Legende</b>: Farbe → Coin. Klick = Highlight (ein Coin isolieren).</p>
                    </>
                  }
                  en={
                    <>
                      <p><b>What is this?</b> Compare up to 10 coins selected via Watchlist → Compare.</p>
                      <p><b>Index 100</b> normalizes all coins (start=100) — best for many lines.</p>
                      <p><b>Overlay</b>: all coins in one chart. <b>Grid</b>: one mini-chart per coin (best for 10 coins).</p>
                          <p><b>Legend</b>: color → coin. Click to highlight one coin.</p>
                    </>
                  }
                />
              </InfoButton>
            </div>
          </div>

          <div className="compareGrid">
            {/* Live list */}
            <div className="compareLive">
              <div className="label">Live Prices (USD)</div>
              <div className="muted tiny">All compare coins (max 10)</div>

              <div className="liveListBox">
                {liveList.map(({ sym, row }) => (
                  <div key={sym} className="liveRow">
                    <div className="liveLeft">
                      <div className="coinLogo small">{sym.slice(0, 1)}</div>
                      <div className="liveMeta">
                        <div className="liveSym">{sym}</div>
                        <div className="muted tiny">{row?.source || "—"}</div>
                      </div>
                    </div>

                    <div className="liveRight">
                      <div className="mono livePx">{fmtUsd(row?.price)}</div>
                      <div className={`mono tiny ${Number(row?.change24h) >= 0 ? "txtGood" : "txtBad"}`}>{fmtPct(row?.change24h)}</div>
                    </div>
                  </div>
                ))}
                {!liveList.length ? <div className="muted">Select coins in Watchlist (Compare checkbox).</div> : null}
              </div>
            </div>

            {/* Chart */}
            <div className="compareChart">
              <div className="chartHeader">
                <div className="label">Diagramm (auto scale)</div>
                <div className="muted tiny">{compareLoading ? "Loading…" : `${compareSymbols.length} selected`}</div>
              </div>

              {viewMode === "overlay" ? (
              <>
                <SvgChart chart={chartRaw} height={320} highlightSym={highlightSym} onHoverSym={() => {}} indexMode={indexMode} timeframe={timeframe} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
                <div style={{ marginTop: 10 }}>
                  <Legend symbols={compareSymbols} highlightSym={highlightSym} setHighlightSym={setHighlightSym} colorForSym={colorForSym} lineClassForSym={lineClassForSym} />
                </div>
              </>
            ) : (
              <div className="sparkGridWrap">
                <div className="sparkGrid">
                  {compareSymbols.map((sym, idx) => (
                    <SmallSpark
                      key={sym}
                      sym={sym}
                      idx={idx}
                      chart={chartRaw}
                      indexMode={indexMode}
                      timeframe={timeframe}
                      active={highlightSym === sym}
                      onClick={() => setHighlightSym((v) => (v === sym ? null : sym))}
                      colorForSym={colorForSym}
                      lineClassForSym={lineClassForSym}
                    />
                  ))}
                </div>
                <div className="muted tiny" style={{ marginTop: 8 }}>
                  Tip: Use <b>Overlay</b> for correlation. Use <b>Grid</b> for 10 coins (clear view).
                </div>
              </div>
            )}

                            <div className="pairsBox">
                <div className="pairsHead">
                  <div className="label">Best pairs (data fit)</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className="muted tiny">Based on correlation (index)</div>
                    <InfoButton title="Best pairs">
                      <Help showClose dismissable
                        de={
                            <>
                              <p>
                                Diese Liste zeigt Krypto-Paare mit ähnlichem oder unterschiedlichem
                                Verlauf im gewählten Zeitraum (Letzte 30 Tage).
                             </p>
                             <ul>
                               <li><b>Hoher Score</b> → sehr ähnlich (Pairs-Trading / Hedge)</li>
                               <li><b>Niedriger Score</b> → wenig ähnlich (Diversifikation)</li>
                            </ul>
                            <p>
                             👉 <b>Klicke auf ein Pair</b>, um Details zu sehen:
                             Performance, tägliche Moves, Spread und Erklärung.
                           </p>
                           <p>
                             Nutze diese Infos, um stärkere vs. schwächere Assets zu erkennen –
                             hilfreich für Grid-, Rebalance- oder Mean-Reversion-Ideen.
                           </p>
                         </>
                        }

                        en={
                            <>
                              <p>
                                This list shows crypto pairs with similar or different price behavior
                                in the selected period (last 30 days).
                             </p>
                             <ul>
                               <li><b>High score</b> → very similar (pairs trading / hedge)</li>
                               <li><b>Low score</b> → less similar (diversification)</li>
                            </ul>
                            <p>
                             👉 <b>Click on a pair</b> to see detailed insights:
                             performance, daily moves, spread and explanation.
                           </p>
                           <p>
                             Use this information to identify stronger vs. weaker assets –
                             useful for grid, rebalance or mean-reversion strategies.
                           </p>
                         </>
                        }

                      />
                    </InfoButton>
                  </div>
                </div>

                <div className="pairsScroll">
                  {bestPairsTop.length ? (
                    bestPairsTop.map((p, i) => (
                      <div key={p.pair} className="pairRow" style={{ gap: 12, cursor: "pointer" }} onClick={() => openPairExplain(p)}>
                        <span className="muted" style={{ width: 30, textAlign: "right" }}>#{i + 1}</span>
                        <span className="pairName" style={{ flex: 1 }}>{p.pair}</span>
                        <span className="pill silver">Score {p.score}</span>
                        <span className="pill">{(p.corr >= 0 ? "+" : "") + p.corr.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="muted">Not enough chart data yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>


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
                              <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, overflow: "hidden" }}>
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
                        <div className="label">What it means (grid)</div>
                        {winner ? (
                          <div className="muted">
                            <b>{winner}</b> outperformed <b>{loser}</b> over 30D. With a relatively high correlation, this can be a
                            good mean‑reversion/grid candidate. Typical idea: sell some of the outperformer and accumulate the underperformer
                            (only if you accept trend risk).
                          </div>
                        ) : (
                          <div className="muted">Not enough data for a reliable explanation yet.</div>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div className="label">AI commentary (optional)</div>
                    <button className="btnGhost" onClick={runAiExplain} disabled={aiExplainLoading}>
                      {aiExplainLoading ? "Thinking…" : "Run AI"}
                    </button>
                  </div>
                  {aiExplainText ? (
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
        <section className="card section-grid">
          <div className="cardHead">
            <div className="cardTitle">Grid Trader</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <span className="pill silver">Tick: {gridMeta.tick ?? "—"}</span>
              <span className="pill silver">Price: {shownGridPrice ? fmtUsd(shownGridPrice) : "—"}</span>
              <InfoButton title="Grid Trader – Info">
                <Help showClose dismissable
                  de={
                    <>
                      <p><b>Grid Trader</b> platziert mehrere BUY- und SELL-Orders für den gewählten Coin.</p>
                      <p>Du definierst ein <b>maximales USD-Budget (USDC / USDT)</b>. Dieses Budget ist ein <b>globales Limit</b> für den gesamten Grid.</p>
                      <p>Das Budget gilt <b>nicht pro Order</b>, sondern für alle Orders zusammen.</p>
                      <p><b>BUY</b>-Orders kaufen Tokens, <b>SELL</b>-Orders verkaufen bereits gekaufte Tokens.</p>
                      <p><b>SAFE</b>: weniger Orders, geringeres Risiko.<br/>
                         <b>AGGRESSIVE</b>: mehr Orders, schnelleres Budget-Nutzen.</p>
                      <p><b>Manuelle Orders</b> sind einzelne Orders und nicht Teil der Grid-Strategie.</p>
                      <p>BUY kann per <b>USD</b> oder per <b>Token-Menge</b> erfolgen.</p>
                    </>
                  }
                  en={
                    <>
                      <p><b>Grid Trader</b> places multiple BUY and SELL orders for the selected coin.</p>
                      <p>You define a <b>maximum USD budget (USDC / USDT)</b>. This budget is a <b>global limit</b> for the entire grid.</p>
                      <p>The budget is <b>not per order</b>, but shared across all orders.</p>
                      <p><b>BUY</b> orders acquire tokens, <b>SELL</b> orders sell already acquired tokens.</p>
                      <p><b>SAFE</b>: fewer orders, lower risk.<br/>
                         <b>AGGRESSIVE</b>: more orders, faster budget usage.</p>
                      <p><b>Manual orders</b> are single orders and not part of the grid strategy.</p>
                      <p>BUY orders can be placed by <b>USD</b> or by <b>token quantity</b>.</p>
                    </>
                  }
                />
              </InfoButton>
            </div>
          </div>

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
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Mode
                  <InfoButton title="Grid Mode: SAFE vs AGGRESSIVE">
                    <Help showClose dismissable
                      de={
                        <>
                          <p><b>SAFE</b>: Größere Abstände zwischen Grid-Levels, weniger Orders, mehr Puffer gegen Volatilität.</p>
                          <p><b>AGGRESSIVE</b>: Kleinere Abstände, mehr Orders, höhere Reaktionsfrequenz – höheres Risiko.</p>
                          <p><b>Hinweis:</b> Beide Modi sind <b>MANUAL</b>. Keine automatischen Orders.</p>
                        </>
                      }
                      en={
                        <>
                          <p><b>SAFE</b>: Wider grid spacing, fewer orders, more buffer against volatility.</p>
                          <p><b>AGGRESSIVE</b>: Tighter spacing, more orders, faster reaction – higher risk.</p>
                          <p><b>Note:</b> Both modes are <b>MANUAL</b>. No automatic order placement.</p>
                        </>
                      }
                    />
                  </InfoButton>
                </label>
                <select value={gridMode} onChange={(e) => setGridMode(e.target.value)}>
                  <option value="SAFE">SAFE</option>
                  <option value="AGGRESSIVE">AGGRESSIVE</option>
                </select>
              </div>


              <div className="formRow">
                <label>Budget (USD)</label>
                <input value={gridInvestUsd} onChange={(e) => setGridInvestUsd(e.target.value)} placeholder="250" />
              </div>

              <div className="btnRow">
                <button className="btn" onClick={gridStart}>Start</button>
                <button className="btnDanger" onClick={gridStop}>Stop</button>
              </div>

              <div className="divider" />

              <div className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Manual order
                <InfoButton title="Manual Order">
                  <Help showClose dismissable
                    de={<><p><b>Price</b> ist Limit-Preis. <b>Qty</b> optional.</p></>}
                    en={<><p><b>Price</b> is your limit price. <b>Qty</b> is optional.</p></>}
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


              <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: -4, marginBottom: 10 }}>
                <div className="muted" style={{ fontSize: 12 }}>Quick steps %:</div>
                <select
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setGridQuickStepsStr(v);
                    e.target.value = "";
                  }}
                  style={{ maxWidth: 200 }}
                >
                  <option value="">Presets…</option>
                  <option value="0.25, 0.5, 1">Fast (0.25 / 0.5 / 1)</option>
                  <option value="0.5, 1, 2">Standard (0.5 / 1 / 2)</option>
                  <option value="1, 2, 3">Wide (1 / 2 / 3)</option>
                  <option value="2, 3, 5">Very wide (2 / 3 / 5)</option>
                </select>
                <input
                  value={gridQuickStepsStr}
                  onChange={(e) => setGridQuickStepsStr(e.target.value)}
                  placeholder="e.g. 0.5, 1, 2"
                  style={{ maxWidth: 240 }}
                />
                <div className="muted" style={{ fontSize: 12 }}>comma separated</div>
              </div>

              <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
                <button className="btnGhost" type="button" onClick={setManualPriceFromMarket} disabled={!shownGridPrice} title="Set price to current market">
                  Market
                </button>

                {manualSide === "BUY" ? (
                  <>
                    {gridQuickSteps.map((p) => (
                      <button
                        key={p}
                        className="btnGhost"
                        type="button"
                        onClick={() => nudgeManualPricePct(-p)}
                        disabled={!shownGridPrice}
                        title={`Set BUY limit ${p}% below market`}
                        style={{ padding: "6px 10px" }}
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
                        className="btnGhost"
                        type="button"
                        onClick={() => nudgeManualPricePct(p)}
                        disabled={!shownGridPrice}
                        title={`Set SELL limit ${p}% above market`}
                        style={{ padding: "6px 10px" }}
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
                    <select value={manualBuyMode} onChange={(e) => setManualBuyMode(e.target.value)}>
                      <option value="USD">USD</option>
                      <option value="QTY">Token qty</option>
                    </select>
                  </div>

                  {manualBuyMode === "USD" ? (
                    <div className="formRow">
                      <label>Spend (USD)</label>
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

              <button className="btn" onClick={addManualOrder} disabled={!token || !policy?.trading_enabled}>Add Order</button>

              {!token && <div className="muted tiny">Connect wallet to place orders.</div>}
              {token && !policy?.trading_enabled && <div className="muted tiny">Enable trading (policy) to place orders.</div>}
            </div>

            <div className="gridOrders">
              <div className="ordersHead">
                <div className="label">Orders</div>
                <span className="pill silver">{gridOrders.length} orders</span>
              </div>

              {gridOrders.length ? (
                <div className="ordersList" style={{ maxHeight: 260, overflowY: "auto", paddingRight: 4 }}>
                  {gridOrders.map((o) => (
                    <div key={o.id || `${o.side}-${o.price}-${o.created_ts}`} className="orderRow">
                      <span className={`pill ${o.side === "BUY" ? "good" : "bad"}`}>{o.side}</span>
                      <span className="orderPx">{fmtUsd(o.price)}</span>
                      <span className="muted">{o.qty ? `qty ${o.qty}` : ""}</span>
                      <span className="pill silver">{o.status || "OPEN"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted">No orders yet. Press Start then Add Order.</div>
              )}
            </div>
          </div>
        </section>

        {/* Watchlist */}
        <section className="card section-watch">
          <div className="cardHead">
            <div className="cardTitle">Watchlist</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <button className="btn" onClick={() => setAddOpen(true)}>+ Add</button>
              <button className="btnGhost" onClick={fetchWatchSnapshot}>Refresh</button>
              <InfoButton title="Watchlist">
                <Help showClose dismissable
                  de={<><p><b>Compare</b> Checkbox steuert die Compare-Auswahl (max 10).</p><p><b>Token</b> braucht eine Contract-Address.</p><p><b>Refresh</b>: Nach dem Hinzufügen eines neuen Coins/Tokens einmal drücken, damit Preis/Volumen nachgeladen werden.</p></>}
                  en={<><p><b>Compare</b> checkbox controls the compare set (max 10).</p><p><b>Token</b> requires a contract address.</p><p><b>Refresh</b>: After adding a new coin/token, press once so price/volume can be fetched.</p></>}
                />
              </InfoButton>
            </div>
          </div>

          <div className="watchTable">
            <div className="watchHead watchStickyHead">
              <div>Compare</div>
              <div>Coin</div>
              <div className="right">Price</div>
              <div className="right">24h</div>
              <div className="right">Vol</div>
              <div className="right">Source</div>
              <div className="right"> </div>
            </div>

            <div className="watchScroll">
              {watchRows.map((r, idx) => {
                const sym = String(r.symbol || "").toUpperCase();
                const checked = compareSymbols.includes(sym);
                return (
                  <div key={`${sym}-${idx}`} className="watchRow">
                    <div>
                      <input type="checkbox" checked={checked} onChange={() => toggleCompare(sym)} disabled={!checked && compareSymbols.length >= 10} />
                    </div>
                    <div className="watchCoin">
                      <div className="coinLogo small">{sym.slice(0, 1)}</div>
                      <div>
                        <div className="watchSym">{sym}</div>
                        <div className="muted tiny">{r.mode === "dex" ? "Token" : "Market"}{r.chain ? ` · ${r.chain}` : ""}</div>
                      </div>
                    </div>
                    <div className="right mono">{fmtUsd(r.price)}</div>
                    <div className={`right mono ${Number(r.change24h) >= 0 ? "txtGood" : "txtBad"}`}>{fmtPct(r.change24h)}</div>
                    <div className="right mono">{fmtUsd(r.volume24h)}</div>
                    <div className="right muted">{r.source || "—"}</div>
                    <div className="right"><button className="iconBtn" onClick={() => removeWatchItemByKey({ symbol: sym, mode: r.mode || "market", contract: r.contract || r.id || "" })} title="Remove">×</button></div>
                  </div>
                );
              })}
              {!watchRows.length ? <div className="muted" style={{ padding: 10 }}>No watchlist data yet.</div> : null}
            </div>
          </div>

          <div className="muted tiny">Compare selection is the single source of truth (max 10).</div>
        </section>

        {/* AI */}
        <section className="card section-ai">
          <div className="cardHead">
            <div className="cardTitle">AI Analyst</div>
            <div className="cardActions" style={{ alignItems: "center" }}>
              <span className="pill silver">{aiSelected.length}/6 selected</span>
              <InfoButton title="AI Analyst">
                <Help showClose dismissable
                  de={<><p>Maximal <b>6 Coins</b> pro Analyse.</p><p>Coins kommen aus der Compare-Auswahl.</p></>}
                  en={<><p>Maximum <b>6 coins</b> per analysis.</p><p>Coins are taken from the Compare selection.</p></>}
                />
              </InfoButton>
            </div>
          </div>

          <div className="aiWrap">
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
<div className="formRow">
                <label>Question (optional)</label>
                <input value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Ask the analyst..." />
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label className="muted" style={{ display: "inline-flex", gap: 8, alignItems: "center", userSelect: "none" }}>
                  <input type="checkbox" checked={aiFollowUp} onChange={(e) => setAiFollowUp(e.target.checked)} />
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

              <button className="btn" onClick={runAi} disabled={aiLoading}>{aiLoading ? "Running…" : "Run"}</button>
            </div>

            <div className="aiOut">
              <div className="label">Output</div>
              <div className="aiPanel">{aiOutput ? <div className="aiText" style={{ whiteSpace: "pre-wrap" }}>{aiOutput}</div> : <div className="muted">No output yet.</div>}</div>
            </div>
          </div>
        </section>
      </main>

      {errorMsg ? (
        <div style={{ width: "min(1200px, calc(100% - 24px))", margin: "0 auto 18px" }}>
          <div className="error">{errorMsg}</div>
        </div>
      ) : null}

      {/* Add modal */}


      {/* Wallet panel is rendered in the header (top-right dropdown). */}


            {addOpen && (
        <div className="modalBackdrop" onClick={() => setAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(180deg, rgba(10,32,28,1), rgba(7,24,22,1))" }}>
            <div className="modalHead">
              <div className="cardTitle">Add Coin / Token</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <InfoButton title="Add Coin / Token">
                  <Help showClose dismissable
                    de={<><p><b>Coin</b> (Market) braucht nur Symbol (z.B. ETH).</p><p><b>Token</b> braucht Contract Address.</p></>}
                    en={<><p><b>Coin</b> (market) only needs a symbol (e.g., ETH).</p><p><b>Token</b> requires a contract address.</p></>}
                  />
                </InfoButton>
                <button className="iconBtn" onClick={() => setAddOpen(false)}>×</button>
              </div>
            </div>

            <div className="formRow">
              <label>Symbol</label>
              <input value={addSymbol} onChange={(e) => setAddSymbol(e.target.value)} placeholder="e.g. ETH" />
            </div>

            <div className="formRow">
              <label>Type</label>
              <select value={addIsToken ? "token" : "coin"} onChange={(e) => setAddIsToken(e.target.value === "token")}>
                <option value="coin">Market coin (BTC, ETH...)</option>
                <option value="token">Token (contract)</option>
              </select>
            </div>

            {addIsToken && (
              <>
                <div className="formRow">
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Contract
                    <InfoButton title="Contract Address">
                      <Help showClose dismissable
                        de={<><p><b>Pflicht</b> für Tokens. Beispiel: 0x…</p></>}
                        en={<><p><b>Required</b> for tokens. Example: 0x…</p></>}
                      />
                    </InfoButton>
                  </label>
                  <input value={addContract} onChange={(e) => setAddContract(e.target.value)} placeholder="0x..." />
                </div>

                <div className="formRow">
                  <label>Chain</label>
                  <select value={addChain} onChange={(e) => setAddChain(e.target.value)}>
                    <option value="eth">ETH</option>
                    <option value="bsc">BSC</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="base">Base</option>
                  </select>
                </div>
              </>
            )}

            <div className="btnRow">
              <button className="btn" onClick={submitAdd}>Add</button>
              <button className="btnGhost" onClick={() => setAddOpen(false)}>Cancel</button>
            </div>

            <div className="muted tiny">Cache-first: coins in backend cache appear instantly; new ones are fetched.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------
// App (provider wrapper)
// ------------------------
export default function App() {
  // NOTE: PrivyProvider is mounted in src/main.jsx (single provider).
  return <AppInner />;
}
