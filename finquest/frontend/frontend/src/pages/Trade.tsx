"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Types for chart and trades
type StockChartBar = {
  time: string;
  close: number;
  vwap: number;
  upper: number;
  lower: number;
};
type Trade = {
  _id: string;
  symbol: string;
  price: number;
  side: "BUY" | "SELL";
  qty: number;
};

const STOCK_LIST = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];
const API_KEY = "731b0a7a1dee4a34b86f0f307d131b62"; // ← Your provided key

export default function Trade() {
  const [data, setData] = useState<StockChartBar[]>([]);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("10");
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState(STOCK_LIST[0]);

  // Load trades
  const { data: trades, isLoading: tradesLoading, refetch } = useQuery({
    queryKey: ["trades"],
    queryFn: () => api.trades(),
  });

  // Place trade mutation
  const { mutate: createTrade, isPending } = useMutation({
    mutationFn: (payload: {
      symbol: string;
      side: "BUY" | "SELL";
      price: number;
      qty: number;
    }) => api.createTrade(payload),
    onSuccess() {
      toast.success(`${side} ${qty} @ ${price} submitted`);
      refetch();
    },
    onError(e: any) {
      toast.error(e?.message || "Trade failed");
    },
  });

  useEffect(() => {
    document.title = "Finquest — Trade";
    fetchStockData(symbol);
  }, [symbol]);

  // Fetch stock chart
  const fetchStockData = async (sym: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
          sym
        )}&interval=5min&outputsize=100&apikey=${API_KEY}`
      );
      const json = await res.json();

      // Handle errors from API
      if (json.status === "error") {
        setLoading(false);
        toast.error(`API Error: ${json.message || "Unknown error"}`);
        setData([]);
        return;
      }

      if (!json.values || !Array.isArray(json.values) || json.values.length === 0) {
        setLoading(false);
        toast.error(`No stock data found for ${sym}`);
        setData([]);
        return;
      }

      const values = json.values.reverse();
      let cumulativePV = 0;
      let cumulativeVol = 0;
      const closes = values.map((v: any) => Number.parseFloat(v.close));
      const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
      const sd = Math.sqrt(
        closes.map((v) => Math.pow(v - mean, 2)).reduce((a, b) => a + b, 0) / closes.length
      );

      const chartData = values.map((item: any) => {
        const close = Number.parseFloat(item.close);
        const volume = Number.parseFloat(item.volume || "1");
        cumulativePV += close * volume;
        cumulativeVol += volume;
        const vwap = cumulativePV / cumulativeVol;
        return {
          time: item.datetime.slice(11, 16),
          close,
          vwap,
          upper: vwap + sd,
          lower: vwap - sd,
        };
      });

      setData(chartData);
      setPrice(values[values.length - 1].close); // latest price
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      toast.error(`Error fetching stock data: ${err.message || err}`);
      setData([]);
    }
  };

  const submit = () => {
    if (!price || !qty) return toast("Enter price and quantity");
    createTrade({
      symbol,
      side,
      price: Number(price),
      qty: Number(qty),
    });
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  const recentTrades: Trade[] = useMemo(
    () => trades?.data?.filter((t: Trade) => t.symbol === symbol).slice(0, 12) ?? [],
    [trades, symbol]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stock Selector */}
      <div className="lg:col-span-3 flex gap-3 mb-4 overflow-x-auto">
        {STOCK_LIST.map((s) => (
          <button
            key={s}
            onClick={() => setSymbol(s)}
            className={`px-4 py-2 rounded-lg ${
              s === symbol ? "bg-primary text-white" : "border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chart */}
      <section className="lg:col-span-2 glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{symbol} • 5min</h2>
          <p className="text-sm text-muted-foreground">Live intraday data</p>
        </div>
        <div className="h-72">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading chart...
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="time" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#1f77b4" dot={false} name="Price" />
                <Line type="monotone" dataKey="vwap" stroke="#ff7f0e" dot={false} name="VWAP" />
                <Line
                  type="monotone"
                  dataKey="upper"
                  stroke="#2ca02c"
                  strokeDasharray="5 5"
                  dot={false}
                  name="+1 Std Dev"
                />
                <Line
                  type="monotone"
                  dataKey="lower"
                  stroke="#2ca02c"
                  strokeDasharray="5 5"
                  dot={false}
                  name="-1 Std Dev"
                />
                <ReferenceLine
                  y={Number.parseFloat(price || "0")}
                  stroke="red"
                  strokeDasharray="3 3"
                  label="Prev Close"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Trade Form */}
      <section className="glass p-4 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSide("BUY")}
            className={`ripple-btn flex-1 rounded-lg px-3 py-2 ${
              side === "BUY" ? "bg-primary text-primary-foreground glow-ring" : "border"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("SELL")}
            className={`ripple-btn flex-1 rounded-lg px-3 py-2 ${
              side === "SELL" ? "bg-destructive text-destructive-foreground glow-ring" : "border"
            }`}
          >
            Sell
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Price
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={onEnter}
              className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="text-sm">
            Quantity
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={onEnter}
              className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={isPending}
            className="ripple-btn flex-1 rounded-lg px-4 py-2 bg-secondary text-secondary-foreground"
          >
            {isPending ? "Submitting..." : `Place ${side}`}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter in inputs to submit.</p>
          <section className="flex">
        <a
          href="/portfolio"
          className="ripple-btn rounded-lg px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View Portfolio
        </a>
        <a
          href="/whatif"
          className="ripple-btn rounded-lg px-4 py-2 mx-6 bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          What if?
        </a>
      </section>
      </section>
      

      {/* Recent Trades */}
      <section className="lg:col-span-3 glass p-4">
        <h3 className="font-semibold mb-2">Recent Trades</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-sm text-muted-foreground">
          {tradesLoading ? (
            <div className="col-span-full text-center">Loading trades…</div>
          ) : recentTrades.length === 0 ? (
            <div className="col-span-full text-center">No trades for {symbol}</div>
          ) : (
            recentTrades.map((t) => (
              <div
                key={t._id}
                className={`glass px-3 py-2 rounded ${
                  t.side === "BUY" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
                }`}
              >
                {t.symbol} {t.price} • {t.side} × {t.qty}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
