"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PublicWallGuidelinesModalProps {
  onAccepted?: () => void;
}

export function PublicWallGuidelinesModal({
  onAccepted,
}: PublicWallGuidelinesModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("public_wall_guidelines");

    if (!accepted) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptGuidelines = () => {
    localStorage.setItem("public_wall_guidelines", "accepted");
    setShow(false);
    onAccepted?.();
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, delay: 0.1 }}
        className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="space-y-5">
          {/* Header */}
          <div>
            <div className="mb-3 text-3xl">🌱</div>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Before you post
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              This is a public space where anyone can see what you write.
              Please help us keep it creative, respectful, and welcoming.
            </p>
          </div>

          {/* Guidelines */}
          <div className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <p>🚫 No violence, threats, or encouragement of harm.</p>
            <p>🚫 No hate speech or attacks against people or groups.</p>
            <p>🚫 No sexual or sexually explicit content.</p>
            <p>🚫 No harassment, bullying, or personal attacks.</p>
            <p>🚫 No dangerous, illegal, or intentionally harmful content.</p>
          </div>

          {/* Notice */}
          <div className="rounded-lg bg-zinc-100 p-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Notes that violate these guidelines may be removed.
          </div>

          {/* Action */}
          <button
            onClick={acceptGuidelines}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            I understand — let's create
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
