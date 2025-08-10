"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function AnimatedNumber({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let f = 0;
    const target = value;
    const id = setInterval(() => {
      f += Math.ceil(target / 30);
      if (f >= target) {
        f = target;
        clearInterval(id);
      }
      setN(f);
    }, 30);
    return () => clearInterval(id);
  }, [value]);
  return <span>{n}</span>;
}

export default function Profile() {
  const fileInputRef = useRef(null);
  const [localAvatar, setLocalAvatar] = useState(() => {
    return localStorage.getItem("userAvatar") || "";
  });

  useEffect(() => {
    document.title = "Finquest — Profile";
  }, []);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => api.me() });
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: () => api.myStats() });

  const badges = useMemo(() => stats?.data?.badges ?? [], [stats?.data?.badges]);

  const avatarSrc =
    localAvatar || me?.data?.avatarUrl || "/placeholder.svg?height=64&width=64";

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      if (typeof base64 === "string") {
        setLocalAvatar(base64);
        localStorage.setItem("userAvatar", base64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <section className="glass p-6 flex items-center gap-4">
        <div
          onClick={handleAvatarClick}
          className="cursor-pointer relative group"
        >
          <img
            src={avatarSrc}
            alt="User avatar"
            className="h-16 w-16 rounded-full object-cover glow-ring"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs rounded-full transition">
            Change
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div>
          <h1 className="text-2xl font-bold">
            {me?.data?.name ? `Hey, ${me.data.name}` : "Hey there"}
          </h1>
          <p className="text-muted-foreground">Rank glow: Emerald • Gold</p>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-4 text-center">
          <p className="text-sm text-muted-foreground">XP</p>
          <p className="text-2xl font-semibold">
            <AnimatedNumber value={stats?.data?.xp ?? 0} />
          </p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-2xl font-semibold">
            <AnimatedNumber value={stats?.data?.streak ?? 0} />
          </p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-sm text-muted-foreground">Badges</p>
          <p className="text-2xl font-semibold">
            <AnimatedNumber value={badges.length} />
          </p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-sm text-muted-foreground">Rank</p>
          <p className="text-2xl font-semibold">
            Top {stats?.data?.rankPercent ?? 100}%
          </p>
        </div>
      </section>

      {/* Badges showcase */}
      <section className="glass p-6">
        <h2 className="text-xl font-semibold mb-4">Badges</h2>
        {badges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete lessons to unlock badges. Your achievements will appear here in real time.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {badges.map((b) => (
              <div
                key={b}
                className="glass p-4 text-center rounded-xl border border-border/40 hover:glow-ring"
                title={b}
              >
                <p className="font-medium">{b}</p>
                <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-2 text-sm">
          {(stats?.data?.activities ?? []).map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0"
            >
              <span>{a.text}</span>
              <span className="text-muted-foreground">
                {a.xpDelta ? `+${a.xpDelta} XP` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
