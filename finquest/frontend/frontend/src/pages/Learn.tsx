"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Lesson = {
  id: string;
  title: string;
  description: string;
  keyTakeaways?: string[];
  progress: number;
};

type ProfileData = {
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
};

export default function Learn() {
  const [profile, setProfile] = useState<ProfileData>({
    xp: 0,
    level: 1,
    streak: 0,
    achievements: [],
  });

  useEffect(() => {
    document.title = "Finquest — Learn";
    // Simulating fetch profile
    api.profile?.().then((p: ProfileData) => setProfile(p));
    // api.me().then((p: ProfileData) => setProfile(p));

  }, []);

  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => api.lessons(),
  });

  const { mutateAsync: setProgress } = useMutation({
    mutationFn: (payload: { lessonId: string; percent: number }) =>
      api.setProgress(payload.lessonId, payload.percent),
    onSuccess() {
      toast.success("Progress updated");
    },
  });

  const runConfetti = useCallback(() => {
    const body = document.body;
    const colors = [
      `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--brand-gold")})`,
      `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--brand-emerald")})`,
    ];
    const dots = Array.from({ length: 24 }).map(() => {
      const d = document.createElement("div");
      Object.assign(d.style, {
        position: "fixed",
        left: Math.random() * window.innerWidth + "px",
        top: "-10px",
        width: `${6 + Math.random() * 6}px`,
        height: `${6 + Math.random() * 6}px`,
        borderRadius: "9999px",
        background: colors[Math.floor(Math.random() * colors.length)],
        zIndex: "9999",
      });
      body.appendChild(d);
      return d;
    });
    gsap.to(dots, {
      y: window.innerHeight + 40,
      x: "+=" + 100,
      duration: 1.2,
      ease: "power2.out",
      stagger: 0.02,
      onComplete: () => dots.forEach((d) => d.remove()),
    });
  }, []);

  const startQuiz = (lessonId: string) => {
    toast(`Starting quiz for lesson ${lessonId}...`);
    // Navigate to quiz or open modal here
  };

  const generateCertificate = (lessonTitle: string) => {
    toast.success(`Certificate generated for: ${lessonTitle}`);
    // If you want, integrate jspdf or similar to export actual PDF
  };

  return (
    <div className="space-y-8">
      {/* Profile / XP / Streak */}
      <section className="glass p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Level {profile.level}</h2>
          <p className="text-sm text-muted-foreground">
            {profile.xp} XP • {1500 - profile.xp} XP to Level {profile.level + 1}
          </p>
          <progress value={profile.xp % 1500} max={1500} className="w-40 mt-1" />
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">🔥 {profile.streak}-Day Streak</p>
          <p className="text-xs text-muted-foreground">Keep it going!</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.achievements.map((ach, i) => (
            <span key={i} className="px-2 py-1 bg-amber-200 rounded-full text-xs">
              {ach}
            </span>
          ))}
        </div>
      </section>

      {/* Header */}
      <section className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
          Your Financial Learning Journey
        </h1>
        <p className="text-muted-foreground">
          Bite-sized lessons. Real progress. Cinematic feedback.
        </p>
      </section>

      {/* Lessons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="glass p-6 h-40 animate-pulse rounded-xl" />
            ))
          : (lessons?.data as Lesson[] ?? []).map((l) => {
              const pct = l.progress ?? 0;
              const onPlus = async () => {
                const next = Math.min(100, pct + 15);
                const res = await setProgress({
                  lessonId: l.id,
                  percent: next,
                });
                if (res?.data?.xpAdded) {
                  runConfetti();
                  setProfile((p) => ({ ...p, xp: p.xp + res.data.xpAdded }));
                }
              };
              return (
                <motion.div
                  key={l.id}
                  whileHover={{ rotateX: 2, rotateY: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="glass p-6 rounded-xl flex flex-col justify-between shadow-lg"
                >
                  {/* Title / Progress */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{l.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{pct}%</span>
                      {pct === 100 && (
                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L9 8l-7 1 5 5-1 7 6-4 6 4-1-7 5-5-7-1-3-6z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-sm text-muted-foreground">{l.description}</p>

                  {/* Key Takeaways */}
                  {pct === 100 && l.keyTakeaways && (
                    <ul className="mt-3 text-xs text-muted-foreground list-disc list-inside">
                      {l.keyTakeaways.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {/* Progress */}
                  <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="ripple-btn rounded-lg px-4 py-2 bg-primary text-primary-foreground"
                      onClick={() => toast("Continuing lesson…")}
                    >
                      Continue
                    </button>
                    <button
                      className="ripple-btn rounded-lg px-4 py-2 border"
                      onClick={onPlus}
                      disabled={pct === 100}
                    >
                      Mark +15%
                    </button>
                    {pct === 100 && (
                      <>
                        <button
                          className="ripple-btn rounded-lg px-4 py-2 bg-accent text-white"
                          onClick={() => startQuiz(l.id)}
                        >
                          Take Quiz
                        </button>
                        <button
                          className="ripple-btn rounded-lg px-4 py-2 bg-emerald-600 text-white"
                          onClick={() => generateCertificate(l.title)}
                        >
                          📜 Certificate
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
      </section>
    </div>
  );
}
