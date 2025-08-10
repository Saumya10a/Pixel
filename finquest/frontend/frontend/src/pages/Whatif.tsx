"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from "recharts"
import { toast } from "sonner"

// Configure your default symbols list
const STOCK_LIST = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"]

// Currency formatter
const fmt = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" })

type Trade = {
  _id: string
  symbol: string
  side: "BUY" | "SELL"
  price: number
  qty: number
  createdAt?: string
}

type Bar = {
  time: string // "HH:MM"
  datetime: string // full TS
  close: number
}

// Fetch intraday series for a symbol; polls every 10s
function useTimeSeries(symbol: string, interval = "5min", outputsize = 200) {
  return useQuery({
    queryKey: ["time-series", symbol, interval, outputsize],
    queryFn: async () => {
      try {
        // Using TwelveData demo key by default. Replace 'demo' with your key if needed.
        const res = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
            symbol,
          )}&interval=${interval}&outputsize=${outputsize}&apikey=demo`,
        )
        const json = await res.json()
        if (json?.status === "error" || !Array.isArray(json?.values)) {
          throw new Error(json?.message || "No data")
        }
        const values = json.values.reverse() as any[]
        const bars: Bar[] = values.map((v) => ({
          time: String(v.datetime).slice(11, 16),
          datetime: v.datetime,
          close: Number.parseFloat(v.close),
        }))
        return bars
      } catch (err: any) {
        throw new Error(err?.message || "Failed to load series")
      }
    },
    refetchInterval: 10_000,
    staleTime: 9_000,
  })
}

// Helper to find closest bar index to a trade timestamp
function closestIndexByTime(bars: Bar[], ts: string | undefined) {
  if (!ts || bars.length === 0) return Math.max(0, bars.length - 1)
  const t = new Date(ts).getTime()
  let bestIdx = 0
  let bestDiff = Number.POSITIVE_INFINITY
  for (let i = 0; i < bars.length; i++) {
    const bt = new Date(bars[i].datetime).getTime()
    const d = Math.abs(bt - t)
    if (d < bestDiff) {
      bestDiff = d
      bestIdx = i
    }
  }
  return bestIdx
}

export default function WhatIf() {
  useEffect(() => {
    document.title = "Finquest — What if?"
  }, [])

  const [symbol, setSymbol] = useState(STOCK_LIST[0])
  const [qty, setQty] = useState<number | "">(10)
  const [side, setSide] = useState<"BUY" | "SELL">("BUY")
  const [shift, setShift] = useState(0) // intervals delta; +later, -earlier

  // Load user trades
  const { data: tradesRes } = useQuery({ queryKey: ["trades"], queryFn: () => api.trades(), staleTime: 5_000 })
  const trades: Trade[] = useMemo(
    () => (tradesRes?.data ?? []).filter((t: Trade) => t.symbol?.toUpperCase() === symbol),
    [tradesRes?.data, symbol],
  )
  // Baseline trade: most recent for symbol (if any)
  const baselineTrade = trades[0] as Trade | undefined

  // Intraday series
  const { data: series = [], isLoading, isError, error } = useTimeSeries(symbol)

  // Decide baseline index and defaults
  const baselineIndex = useMemo(() => {
    if (baselineTrade) return closestIndexByTime(series, baselineTrade.createdAt)
    // fallback to a recent bar if no trades
    return Math.max(0, series.length - 20)
  }, [series, baselineTrade])

  const usedQty = typeof qty === "number" && qty > 0 ? qty : baselineTrade?.qty || 10
  const usedSide: "BUY" | "SELL" = baselineTrade?.side || side

  // Shifted index: clamp within bounds
  const shiftedIndex = useMemo(
    () => Math.max(0, Math.min(series.length - 1, baselineIndex + shift)),
    [series.length, baselineIndex, shift],
  )

  // Exit index: using latest bar (you can extend this with an exit slider)
  const exitIndex = Math.max(0, series.length - 1)

  // Extract prices
  const entryActual = series[baselineIndex]?.close ?? 0
  const entryShifted = series[shiftedIndex]?.close ?? 0
  const exitPrice = series[exitIndex]?.close ?? 0

  // P/L calculation
  function pnl(entry: number, exit: number, side: "BUY" | "SELL", q: number) {
    return side === "BUY" ? (exit - entry) * q : (entry - exit) * q
  }
  const pnlActual = pnl(entryActual, exitPrice, usedSide, usedQty)
  const pnlHypo = pnl(entryShifted, exitPrice, usedSide, usedQty)
  const pnlDelta = pnlHypo - pnlActual

  // Time labels
  const entryActualTime = series[baselineIndex]?.datetime || "—"
  const entryHypoTime = series[shiftedIndex]?.datetime || "—"
  const exitTime = series[exitIndex]?.datetime || "—"

  useEffect(() => {
    if (isError) toast.error((error as any)?.message || "Failed loading data")
  }, [isError, error])

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">What if?</h1>
          <p className="text-muted-foreground">
            Simulate P/L if your entry was earlier or later. Uses live intraday data.
          </p>
        </div>

        {/* Summary cards */}
        <div className="glass rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm min-w-[280px]">
          <div>
            <p className="text-muted-foreground">Actual P/L</p>
            <p className={`font-semibold ${pnlActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt.format(pnlActual)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Hypothetical P/L</p>
            <p className={`font-semibold ${pnlHypo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt.format(pnlHypo)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-muted-foreground">Δ vs Actual</p>
            <p className={`font-semibold ${pnlDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt.format(pnlDelta)}
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="glass p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Symbol
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            >
              {STOCK_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Side
            <select
              value={usedSide}
              onChange={(e) => setSide(e.target.value as "BUY" | "SELL")}
              className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              disabled={!!baselineTrade}
              title={baselineTrade ? "Derived from your baseline trade" : "Pick BUY or SELL"}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </label>
          <label className="text-sm">
            Quantity
            <input
              value={usedQty}
              onChange={(e) => setQty(Number(e.target.value) || "")}
              className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              type="number"
              min={1}
              step={1}
              disabled={!!baselineTrade}
              title={baselineTrade ? "Derived from your baseline trade" : "Enter quantity"}
            />
          </label>
          <label className="text-sm">
            Shift (× 5min)
            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
              className="mt-3 w-full"
            />
            <span className="text-xs text-muted-foreground">Shift: {shift > 0 ? `+${shift}` : shift} intervals</span>
          </label>
        </div>

        <div className="text-sm">
          <div className="glass p-3 rounded-lg">
            <p className="font-medium">Reference</p>
            {baselineTrade ? (
              <ul className="mt-2 space-y-1">
                <li>
                  Baseline trade: {baselineTrade.side} {baselineTrade.qty} {baselineTrade.symbol} @{" "}
                  {fmt.format(baselineTrade.price)}
                </li>
                <li>Closest bar: {entryActualTime.replace("T", " ").replace(".000Z", "")}</li>
                <li>Hypo entry: {entryHypoTime.replace("T", " ").replace(".000Z", "")}</li>
                <li>Exit at: {exitTime.replace("T", " ").replace(".000Z", "")}</li>
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2">
                No trades for {symbol}. Using recent bars with BUY 10 as baseline. Adjust controls to simulate timing.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{symbol} — Intraday (5min)</h2>
          <p className="text-sm text-muted-foreground">Live data, refreshes every 10s</p>
        </div>
        <div className="h-72">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading chart…</div>
          ) : series.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#1f77b4" dot={false} name="Price" />
                {/* Baseline entry marker */}
                {series[baselineIndex] ? (
                  <ReferenceLine
                    x={series[baselineIndex].time}
                    stroke="#10b981"
                    strokeWidth={2}
                    label={{ value: "Baseline", position: "insideTopLeft", fill: "#10b981" }}
                  />
                ) : null}
                {/* Hypo entry marker */}
                {series[shiftedIndex] ? (
                  <ReferenceLine
                    x={series[shiftedIndex].time}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    label={{ value: "Hypo", position: "insideTopRight", fill: "#f59e0b" }}
                  />
                ) : null}
                {/* Exit marker (latest) */}
                {series[exitIndex] ? (
                  <ReferenceLine
                    x={series[exitIndex].time}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    label={{ value: "Exit", position: "top", fill: "#64748b" }}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-6 px-4 py-3 border-b border-border/40 text-sm font-medium">
          <div>Scenario</div>
          <div className="text-right">Entry Time</div>
          <div className="text-right">Entry</div>
          <div className="text-right">Exit Time</div>
          <div className="text-right">Exit</div>
          <div className="text-right">P/L</div>
        </div>
        <ul>
          <li className="grid grid-cols-6 px-4 py-3 border-b border-border/40 items-center text-sm">
            <div className="font-semibold">Actual</div>
            <div className="text-right">{entryActualTime.replace("T", " ").replace(".000Z", "")}</div>
            <div className="text-right">{fmt.format(entryActual)}</div>
            <div className="text-right">{exitTime.replace("T", " ").replace(".000Z", "")}</div>
            <div className="text-right">{fmt.format(exitPrice)}</div>
            <div className={`text-right ${pnlActual >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt.format(pnlActual)}
            </div>
          </li>
          <li className="grid grid-cols-6 px-4 py-3 items-center text-sm">
            <div className="font-semibold">Hypothetical</div>
            <div className="text-right">{entryHypoTime.replace("T", " ").replace(".000Z", "")}</div>
            <div className="text-right">{fmt.format(entryShifted)}</div>
            <div className="text-right">{exitTime.replace("T", " ").replace(".000Z", "")}</div>
            <div className="text-right">{fmt.format(exitPrice)}</div>
            <div className={`text-right ${pnlHypo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {fmt.format(pnlHypo)}
            </div>
          </li>
        </ul>

        <div className="px-4 py-3 border-t border-border/40 text-sm flex items-center justify-between">
          <span className="text-muted-foreground">Difference (Hypo − Actual)</span>
          <span className={`font-semibold ${pnlDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {fmt.format(pnlDelta)}
          </span>
        </div>
      </section>

      {/* Quick tips */}
      <section className="text-xs text-muted-foreground">
        <p>
          Tip: The shift slider moves your entry earlier (−) or later (+) by 5‑minute intervals. Adjust symbol to
          explore different instruments. Baseline side/quantity come from your most recent trade for the symbol (if
          available), otherwise you can set them.
        </p>
      </section>
    </div>
  )
}
