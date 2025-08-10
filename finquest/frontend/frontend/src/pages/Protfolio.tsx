"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Currency formatter
const fmt = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

type Trade = {
  _id: string;
  symbol: string;
  side: "BUY" | "SELL";
  price: number;
  qty: number;
  createdAt?: string;
};

type Position = {
  symbol: string;
  boughtQty: number;
  boughtAmt: number;
  soldQty: number;
  soldAmt: number;
  positionQty: number;
  avgCost: number;
  realizedPnL: number;
};

function computePositions(trades: Trade[]): Record<string, Position> {
  const bySymbol: Record<string, Position> = {};
  const sorted = [...trades].sort(
    (a, b) =>
      (a.createdAt ? new Date(a.createdAt).getTime() : 0) -
      (b.createdAt ? new Date(b.createdAt).getTime() : 0)
  );

  const lots: Record<string, { qty: number; price: number }[]> = {};

  for (const t of sorted) {
    const s = t.symbol.toUpperCase();
    if (!bySymbol[s]) {
      bySymbol[s] = {
        symbol: s,
        boughtQty: 0,
        boughtAmt: 0,
        soldQty: 0,
        soldAmt: 0,
        positionQty: 0,
        avgCost: 0,
        realizedPnL: 0,
      };
      lots[s] = [];
    }
    const p = bySymbol[s];

    if (t.side === "BUY") {
      p.boughtQty += t.qty;
      p.boughtAmt += t.qty * t.price;
      p.positionQty += t.qty;
      lots[s].push({ qty: t.qty, price: t.price });

      const totalCost = lots[s].reduce((acc, lot) => acc + lot.qty * lot.price, 0);
      const totalQty = lots[s].reduce((acc, lot) => acc + lot.qty, 0);
      p.avgCost = totalQty > 0 ? totalCost / totalQty : 0;
    } else {
      // SELL
      p.soldQty += t.qty;
      p.soldAmt += t.qty * t.price;

      let remaining = t.qty;
      while (remaining > 0 && lots[s].length > 0) {
        const lot = lots[s][0];
        const used = Math.min(lot.qty, remaining);
        p.realizedPnL += (t.price - lot.price) * used;
        lot.qty -= used;
        remaining -= used;
        if (lot.qty <= 0) lots[s].shift();
      }
      if (remaining > 0) {
        lots[s].unshift({ qty: -remaining, price: t.price });
      }

      p.positionQty = lots[s].reduce((acc, lot) => acc + lot.qty, 0);
      const totalCost = lots[s].reduce((acc, lot) => acc + lot.qty * lot.price, 0);
      const totalQty = p.positionQty;
      p.avgCost = totalQty !== 0 ? totalCost / totalQty : 0;
    }
  }
  return bySymbol;
}

// Hook to poll live prices
function useLivePrices(symbols: string[]) {
  return useQuery({
    queryKey: ["quotes", symbols.sort().join(",")],
    queryFn: async () => {
      const out: Record<string, number> = {};
      for (const s of symbols) {
        try {
          const res = await fetch(
            `https://api.twelvedata.com/price?symbol=${encodeURIComponent(s)}&apikey=demo`
          );
          const json = await res.json();
          const price = Number(json?.price);
          if (Number.isFinite(price)) out[s] = price;
        } catch {
          // ignore failures
        }
      }
      return out;
    },
    enabled: symbols.length > 0,
    refetchInterval: 10_000,
    staleTime: 9_000,
  });
}

export default function Portfolio() {
  useEffect(() => {
    document.title = "Finquest — Portfolio";
  }, []);

  const { data: tradesRes, isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: () => api.trades(),
    staleTime: 5_000,
  });
  const trades: Trade[] = tradesRes?.data ?? [];

  const positions = useMemo(() => computePositions(trades), [trades]);
  const symbols = useMemo(() => Object.keys(positions), [positions]);
  const { data: quotes = {} } = useLivePrices(symbols);

  const rows = symbols.map((sym) => {
    const p = positions[sym];
    const last = quotes[sym] ?? null;
    const unrealized = last !== null && p.positionQty !== 0 ? (last - p.avgCost) * p.positionQty : 0;
    const totalPnL = p.realizedPnL + unrealized;
    return { ...p, last, unrealized, totalPnL };
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.cost += r.positionQty > 0 ? r.avgCost * r.positionQty : 0;
      acc.unrealized += r.unrealized;
      acc.realized += r.realizedPnL;
      acc.value += (r.last ?? 0) * r.positionQty;
      return acc;
    },
    { cost: 0, value: 0, realized: 0, unrealized: 0 }
  );

  // Create time-series data for portfolio value over time (simplified):
  const portfolioHistory = useMemo(() => {
    if (trades.length === 0) return [];

    // Group trades by date (yyyy-mm-dd)
    const grouped: Record<string, Trade[]> = {};
    for (const t of trades) {
      if (!t.createdAt) continue;
      const d = new Date(t.createdAt).toISOString().slice(0, 10);
      grouped[d] = grouped[d] || [];
      grouped[d].push(t);
    }

    const sortedDates = Object.keys(grouped).sort();

    const history: { date: string; value: number }[] = [];
    let cumulativeTrades: Trade[] = [];

    for (const date of sortedDates) {
      cumulativeTrades = [...cumulativeTrades, ...grouped[date]];
      const pos = computePositions(cumulativeTrades);
      const syms = Object.keys(pos);
      // Use last prices if available, else avgCost as fallback
      let totalVal = 0;
      for (const s of syms) {
        const p = pos[s];
        const lastPrice = quotes[s] ?? p.avgCost ?? 0;
        totalVal += (p.positionQty ?? 0) * lastPrice;
      }
      history.push({ date, value: totalVal });
    }
    return history;
  }, [trades, quotes]);

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Portfolio</h1>
          <p className="text-muted-foreground">Real-time positions, P/L, and activity</p>
        </div>
        <div className="glass rounded-xl p-4 grid grid-cols-2 gap-4 text-sm min-w-[260px]">
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-semibold">{fmt.format(totals.value)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost</p>
            <p className="font-semibold">{fmt.format(totals.cost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Unrealized P/L</p>
            <p
              className={`font-semibold ${
                totals.unrealized >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {fmt.format(totals.unrealized)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Realized P/L</p>
            <p
              className={`font-semibold ${
                totals.realized >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {fmt.format(totals.realized)}
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Value Over Time Chart */}
      <section className="glass rounded-xl p-4">
        <h2 className="font-semibold mb-4">Portfolio Value Over Time</h2>
        {portfolioHistory.length === 0 ? (
          <p className="text-muted-foreground">No historical data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={portfolioHistory} margin={{ right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={20} />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(v) => fmt.format(v)}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => fmt.format(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                name="Portfolio Value"
              />
              {/* Checkpoints as vertical lines */}
              {portfolioHistory.map(({ date }) => (
                <line
                  key={date}
                  x1={date}
                  y1={0}
                  x2={date}
                  y2="100%"
                  stroke="#82ca9d"
                  strokeDasharray="3 3"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-8 gap-0 px-4 py-3 border-b border-border/40 text-sm font-medium">
          <div>Symbol</div>
          <div className="text-right">Bought</div>
          <div className="text-right">Sold</div>
          <div className="text-right">Position</div>
          <div className="text-right">Avg Cost</div>
          <div className="text-right">Last</div>
          <div className="text-right">Unrealized</div>
          <div className="text-right">Total P/L</div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading portfolio…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No trades yet. Place your first trade to build a portfolio.
          </div>
        ) : (
          <ul>
            {rows.map((r) => (
              <motion.li
                key={r.symbol}
                className="grid grid-cols-8 px-4 py-3 border-b border-border/40 last:border-0 items-center text-sm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="font-semibold">{r.symbol}</div>
                <div className="text-right">
                  {r.boughtQty} @ {fmt.format(r.boughtQty ? r.boughtAmt / r.boughtQty : 0)}
                </div>
                <div className="text-right">
                  {r.soldQty} @ {fmt.format(r.soldQty ? r.soldAmt / r.soldQty : 0)}
                </div>
                <div className="text-right">{r.positionQty}</div>
                <div className="text-right">{fmt.format(r.avgCost || 0)}</div>
                <div className="text-right">{r.last != null ? fmt.format(r.last) : "—"}</div>
                <div
                  className={`text-right ${
                    r.unrealized >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {fmt.format(r.unrealized)}
                </div>
                <div
                  className={`text-right ${
                    r.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {fmt.format(r.totalPnL)}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass p-4">
        <h3 className="font-semibold mb-3">Recent Trades</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-sm text-muted-foreground">
          {trades.slice(0, 12).map((t) => (
            <div key={t._id} className="glass px-3 py-2 rounded">
              {t.symbol} {t.side} • {t.qty} @ {fmt.format(t.price)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
