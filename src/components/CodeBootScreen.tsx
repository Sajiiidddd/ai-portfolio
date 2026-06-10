"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const codeLines = [
  "import tensorflow as tf",
  "import torch",
  "def main():",
  "    print('Hello, Projects!')",
  "for epoch in range(10):",
  "    loss = model.train_step(data)",
  "    if loss < 0.01:",
  "        break",
  "# Running data pipeline...",
  "try:",
  "    result = run_experiment()",
  "except Exception as e:",
  "    print('Error:', e)",
  "Traceback (most recent call last):",
  "  File 'main.py', line 42, in <module>",
  "    model.fit(X, y)",
  "ZeroDivisionError: division by zero",
  "# TODO: Fix this bug before demo",
  "def launch_rocket():",
  "    print('Launching...')",
  "[INFO] Compiling project...",
  "[INFO] Downloading dependencies...",
  "[INFO] Running tests...",
  "[SUCCESS] All tests passed!",
  "[INFO] Deploying to Vercel...",
  "[SUCCESS] Build complete!",
  "# Welcome to the Projects Terminal",
  "import antigravity",
  "if __name__ == '__main__':",
  "    main()",
  "...",
];

export default function CodeBootScreen({ onFinish }: { onFinish: () => void }) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setVisibleLines((lines) => [...lines, codeLines[idx]]);
      idx++;
      if (idx === codeLines.length) {
        clearInterval(interval);
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setDone(true);
          setTimeout(onFinish, 600);
        }, 1400); // 1.4s loading
      }
    }, 110); // ~3.3s total
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95"
          style={{ fontFamily: 'Fira Mono, monospace', letterSpacing: 0.2 }}
        >
          <div className="w-full max-w-2xl mx-auto p-6 rounded-xl bg-black/80 border border-violet-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{background: 'repeating-linear-gradient(0deg,transparent,transparent 29px,#a78bfa0a 30px)'}} />
            <div className="text-xs md:text-sm text-green-400/90 leading-relaxed min-h-[320px] select-none">
              {visibleLines.map((line, i) => (
                <div key={i} className="whitespace-pre animate-pulse-fast">
                  {line}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 mt-2 text-cyan-300 animate-pulse">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#22d3ee" strokeWidth="2" opacity="0.5"/><path d="M12 4a8 8 0 0 1 8 8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/></svg>
                  Loading Projects...
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-4 text-violet-400/60 text-[10px] tracking-widest">PROJECTS TERMINAL</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
