"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");

    if (!consent) {
      setTimeout(() => setShow(true), 0);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              🍪 Cookie preferences
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              We use cookies and Google Analytics to cluster notes based on
              regions and understand how the platform is being used. Do you
              accept?
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={decline}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              Decline
            </button>

            <button
              onClick={accept}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
