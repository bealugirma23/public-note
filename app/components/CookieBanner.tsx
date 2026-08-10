"use client";

import { useState, useEffect } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 shadow-lg z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        We use cookies and Google Analytics to cluster notes based on regions and track usage. Do you accept?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShow(false)}
          className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}