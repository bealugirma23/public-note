import { useState, useRef, useEffect } from "react";
import { NodeProps, Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { STICKY_COLORS, colorKeys } from "../constants/colors";

export function DraftStickyNode({
  id,
  data,
}: NodeProps<Node<{ onPost: (id: string, content: string, color: string, name: string) => Promise<void>; onCancel: (id: string) => void; color?: string }>>) {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState(data.color || "amber");
  const [saving, setSaving] = useState(false);
  const bg = STICKY_COLORS[color];
  const draftRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draftRef.current) {
      draftRef.current.style.height = "auto";
      draftRef.current.style.height = `${draftRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handlePost = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await data.onPost(id, content, color, name);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      style={{ backgroundColor: bg }}
      className="relative w-56 min-h-[200px] p-4 shadow-2xl rounded-sm flex flex-col text-black z-50 border-2 border-black/10 cursor-default font-excalifont"
    >
      <div className="text-xs font-semibold mb-2 opacity-50 uppercase tracking-widest font-sans">
        New Thought
      </div>
      <textarea
        ref={draftRef}
        className="w-full bg-transparent placeholder-black/30 resize-none text-[1.1rem] outline-none font-medium leading-relaxed overflow-hidden"
        placeholder="Type something..."
        maxLength={180}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={saving}
        autoFocus
      />
      <div className="mt-4 flex flex-col gap-3 font-sans">
        <input
          type="text"
          placeholder="Enter your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          className="w-full placeholder:font-excalifont placeholder-black/40 text-xs font-semibold px-2 py-1.5 rounded outline-none border-b border-black/10 focus:border-black/30 transition-colors"
          maxLength={30}
        />
        <div className="flex gap-1.5 justify-center">
          {colorKeys.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border border-black/20 ${
                color === c ? "ring-2 ring-black scale-110" : ""
              }`}
              style={{ backgroundColor: STICKY_COLORS[c] }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs font-bold items-center mt-2">
          <button
            onClick={() => data.onCancel(id)}
            disabled={saving}
            className="text-black/50 hover:text-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={saving}
            className="bg-black text-white px-3 py-1.5 rounded shadow-sm hover:scale-105 transition-transform"
          >
            {saving ? "Locating..." : "Stick it"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
