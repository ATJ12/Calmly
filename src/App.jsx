import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Home, History as HistoryIcon, HelpCircle } from "lucide-react";

const MOODS = [
  { id: "happy",   label: "Happy",   emoji: "😊", color: "bg-emerald-100 text-emerald-900", value: 4,
    support: "Love that energy! Want to keep the good vibes going?" },
  { id: "okay",    label: "Okay",    emoji: "😐", color: "bg-sky-100 text-sky-900",        value: 3,
    support: "Feeling neutral is totally fine. Let's do a tiny recharge." },
  { id: "sad",     label: "Sad",     emoji: "😢", color: "bg-blue-100 text-blue-900",       value: 2,
    support: "It's okay to feel low. You're not alone. Want something gentle?" },
  { id: "angry",   label: "Angry",   emoji: "😡", color: "bg-orange-100 text-orange-900",   value: 1,
    support: "That sounds tough. Let's release some tension safely." },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "bg-purple-100 text-purple-900",   value: 1.5,
    support: "Anxiety can feel heavy. Let's try a calm, steady exercise." },
];

const QUOTES = [
  "You are stronger than you think.",
  "One step at a time is still progress.",
  "This feeling is temporary. You are not.",
  "Breathe. You’ve done hard things before.",
  "You deserve rest, kindness, and patience.",
  "Small wins count. Today counts.",
];

const EXERCISES = [
  { id: "breathing", label: "Breathing" },
  { id: "grounding", label: "5-4-3-2-1 Grounding" },
  { id: "meditation", label: "Mini Meditation" },
  { id: "quote", label: "Affirmation" },
];

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | support | exercise | closing | history
  const [mood, setMood] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useLocalStorage("calmly_history", []);

  const startSupport = (m) => {
    setMood(m);
    setScreen("support");
  };

  const onPickExercise = (exId) => {
    setExercise(exId);
    setScreen("exercise");
  };

  const completeSession = () => {
    if (mood) {
      const entry = {
        ts: new Date().toISOString(),
        mood: mood.id,
        value: mood.value,
        note: note?.trim() || null,
      };
      setHistory([entry, ...history].slice(0, 60));
    }
    setNote("");
    setExercise(null);
    setScreen("home");
    setMood(null);
  };

  const chartData = useMemo(
    () =>
      [...history]
        .slice()
        .reverse()
        .map((h, i) => ({
          idx: i + 1,
          value: h.value,
          label: new Date(h.ts).toLocaleDateString(),
        })),
    [history]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
        <header className="p-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Calmly</h1>
            <div className="flex items-center gap-2">
              <button
                title="Home"
                onClick={() => setScreen("home")}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                title="History"
                onClick={() => setScreen("history")}
                className="p-2 rounded-xl hover:bg-slate-100"
              >
                <HistoryIcon className="h-5 w-5" />
              </button>
              <button
                title="Urgent help"
                onClick={() =>
                  window.open(
                    "https://www.google.com/search?q=mental+health+hotline+Tunisia",
                    "_blank"
                  )
                }
                className="px-3 py-2 rounded-2xl border text-sm hover:bg-slate-50 inline-flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Urgent help
              </button>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            A gentle place to check in, breathe, and feel a little better. Not medical advice.
          </p>
        </header>
        <hr className="border-slate-200" />

        <main className="p-6">
          {screen === "home" && <HomeScreen onPickMood={startSupport} />}

          {screen === "support" && (
            <SupportScreen
              mood={mood}
              onChoose={onPickExercise}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "exercise" && (
            <ExerciseScreen
              mood={mood}
              exercise={exercise}
              onFinish={() => setScreen("closing")}
            />
          )}

          {screen === "closing" && (
            <ClosingScreen
              note={note}
              setNote={setNote}
              onDone={completeSession}
            />
          )}

          {screen === "history" && <HistoryScreen history={history} />}
        </main>

        <hr className="border-slate-200" />
        <footer className="flex items-center justify-between text-xs text-slate-500 p-4">
          <span>
            If you are in danger or considering self-harm, please seek emergency help immediately.
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> Be kind to yourself
          </span>
        </footer>
      </div>
    </div>
  );
}

function HomeScreen({ onPickMood }) {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4">How are you feeling today?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onPickMood(m)}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 ${m.color} hover:opacity-90 transition`}
          >
            <span className="text-3xl leading-none">{m.emoji}</span>
            <span className="mt-2 text-sm font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SupportScreen({ mood, onChoose, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm underline mb-3">← Back</button>
      <div className="rounded-2xl p-4 bg-slate-50 border mb-5">
        <p className="text-slate-700">
          <span className="text-2xl mr-2 align-middle">{mood?.emoji}</span>
          <span className="align-middle">{mood?.support}</span>
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {EXERCISES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onChoose(ex.id)}
            className="rounded-2xl border p-4 hover:bg-slate-50 text-left"
          >
            <div className="font-medium">{ex.label}</div>
            <div className="text-sm text-slate-500">
              {ex.id === "breathing" && "1-minute guided breathing"}
              {ex.id === "grounding" && "5-4-3-2-1 sensory grounding"}
              {ex.id === "meditation" && "2-minute mini meditation"}
              {ex.id === "quote" && "Get an affirmation"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ExerciseScreen({ mood, exercise, onFinish }) {
  if (exercise === "breathing") return <Breathing onFinish={onFinish} />;
  if (exercise === "grounding") return <Grounding onFinish={onFinish} />;
  if (exercise === "meditation") return <Meditation onFinish={onFinish} />;
  if (exercise === "quote") return <Affirmation onFinish={onFinish} mood={mood} />;
  return null;
}

function Breathing({ onFinish }) {
  const [phase, setPhase] = useState("Inhale"); // Inhale / Hold / Exhale
  const [seconds, setSeconds] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => {
    // countdown
    timerRef.current = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const seq = ["Inhale", "Hold", "Exhale", "Hold"];
    let i = 0;
    const cycle = setInterval(() => {
      i = (i + 1) % seq.length;
      setPhase(seq[i]);
    }, 4000); // change every 4s
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (seconds === 0) onFinish();
  }, [seconds, onFinish]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-medium mb-2">Breathing Exercise</h3>
      <p className="text-slate-500 mb-6">Follow the expanding circle. {seconds}s left</p>

      <div className="h-64 flex items-center justify-center mb-6">
        <motion.div
          key={phase}
          animate={{ scale: phase === "Inhale" ? 1.2 : phase === "Exhale" ? 0.8 : 1.0, opacity: 1 }}
          initial={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 border"
        />
      </div>
      <div className="text-xl font-semibold mb-6">{phase}</div>

      <button onClick={onFinish} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
        Finish early
      </button>
    </div>
  );
}

function Grounding({ onFinish }) {
  const steps = [
    "Name 5 things you can SEE.",
    "Name 4 things you can TOUCH.",
    "Name 3 things you can HEAR.",
    "Name 2 things you can SMELL.",
    "Name 1 thing you can TASTE.",
  ];
  const [i, setI] = useState(0);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">5-4-3-2-1 Grounding</h3>
      <p className="text-slate-500 mb-6">Look around and follow each step.</p>

      <div className="rounded-2xl border p-5 bg-slate-50 mb-4 min-h-[100px]">
        <p className="text-slate-700">{steps[i]}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
          className="px-4 py-2 rounded-xl border disabled:opacity-50 hover:bg-slate-50"
        >
          Back
        </button>
        {i < steps.length - 1 ? (
          <button
            onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}
            className="px-4 py-2 rounded-xl border hover:bg-slate-50"
          >
            Next
          </button>
        ) : (
          <button onClick={onFinish} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}

function Meditation({ onFinish }) {
  const [seconds, setSeconds] = useState(120);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (seconds === 0) onFinish();
  }, [seconds, onFinish]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Mini Meditation</h3>
      <p className="text-slate-500 mb-6">Sit comfortably. Relax your shoulders. {seconds}s left</p>
      <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-6">
        <li>Close your eyes gently. Notice your breath.</li>
        <li>Inhale slowly through the nose. Exhale softly through the mouth.</li>
        <li>Let thoughts pass like clouds. Keep returning to the breath.</li>
        <li>On each exhale, release a little tension in your body.</li>
      </ul>
      <button onClick={onFinish} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
        Finish early
      </button>
    </div>
  );
}

function Affirmation({ onFinish, mood }) {
  const [quote] = useState(() => {
    const pool = [...QUOTES];
    // Slight bias: if sad/anxious/angry, prefer gentler quotes (all are gentle here)
    return pool[Math.floor(Math.random() * pool.length)];
  });
  return (
    <div className="text-center">
      <h3 className="text-lg font-medium mb-2">Affirmation</h3>
      <blockquote className="text-2xl leading-relaxed p-6 bg-gradient-to-br from-sky-50 to-emerald-50 rounded-2xl border">
        “{quote}”
      </blockquote>
      <button onClick={onFinish} className="mt-6 px-4 py-2 rounded-xl border hover:bg-slate-50">
        Continue
      </button>
    </div>
  );
}

function ClosingScreen({ note, setNote, onDone }) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">How do you feel now?</h3>
      <p className="text-slate-500 mb-4">
        Optional: add a short note about what helped or how you feel.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g., The breathing helped me calm down."
        className="w-full min-h-[110px] rounded-2xl border p-3 outline-none focus:ring-2 focus:ring-sky-200"
      />
      <div className="mt-4 flex justify-end">
        <button onClick={onDone} className="px-4 py-2 rounded-xl border hover:bg-slate-50">
          Save & Finish
        </button>
      </div>
    </div>
  );
}

function HistoryScreen({ history }) {
  const data = [...history].slice(0, 20).reverse().map((h, i) => ({
    idx: i + 1,
    value: h.value,
    label: new Date(h.ts).toLocaleDateString(),
    note: h.note || "",
  }));

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Mood History</h3>
      {data.length === 0 ? (
        <p className="text-slate-500">No entries yet. Do a quick session and it will show up here.</p>
      ) : (
        <>
          <div className="w-full h-56 rounded-2xl border p-3 bg-white mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="idx" tickFormatter={(i) => data[i - 1]?.label || i} />
                <YAxis domain={[0.5, 4.5]} ticks={[1, 1.5, 2, 3, 4]} />
                <Tooltip formatter={(v, n, p) => [`${v}`, `Entry ${p.payload.idx}`]} />
                <Line type="monotone" dataKey="value" dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {data.map((d, i) => (
              <li key={i} className="rounded-xl border p-3 bg-slate-50">
                <div className="text-sm text-slate-600">
                  <span className="font-medium">#{d.idx}</span> — {d.label} — mood value: {d.value}
                </div>
                {d.note && <div className="text-slate-700 mt-1">{d.note}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
