import { useState, useRef, useEffect, useMemo } from "react";
import { NodeProps, Node } from "@xyflow/react";
import { motion } from "framer-motion";
import { STICKY_COLORS, STICKY_SHADES } from "../constants/colors";
import { rotFromId } from "../utils/note-position";
import { timeAgo } from "@/lib/utils/time-ago";
import { isNoteOwned, updateNote, reactToNote } from "../services/wall.service";
import { EmojiPicker } from "@/components/shared/EmojiPicker";
import emojisData from "@/lib/emojis.json";

export function StickyNoteNode({ data }: NodeProps<Node>) {
  const bg = STICKY_COLORS[data.color as string] || STICKY_COLORS.amber;
  const shade = STICKY_SHADES[data.color as string] || STICKY_SHADES.amber;
  const rotation = (data.rotation as number) ?? rotFromId(data.id as string);
  const isMine = isNoteOwned(data.id as string);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(data.body as string);
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const defaultEmojiIds = useMemo(() => {
    let hash = 0;
    const id = data.id as string;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const allEmojiIds = Object.keys(emojisData);
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = Math.abs(hash + i * 12345) % allEmojiIds.length;
      result.push(allEmojiIds[index]);
    }
    return result;
  }, [data.id]);

  const emojiCounts = (data.emojis as Record<string, number>) || {};
  const emojisToRender = new Set([...defaultEmojiIds]);
  Object.entries(emojiCounts).forEach(([emojiId, count]) => {
    if (count > 0) {
      emojisToRender.add(emojiId);
    }
  });

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.style.height = "auto";
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [editBody, isEditing]);

  const handleSave = async () => {
    if (editBody === data.body) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateNote(data.id as string, editBody);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleReaction = async (type: string) => {
    try {
      await reactToNote(data.id as string, type);
    } catch (e: unknown) {
      const err = e as Error;
      console.error("Already reacted or failed", err);
      if (err.message?.includes("Failed to fetch") || err.message?.includes("unreachable")) {
        alert("Edge Function unreachable. Running local mock update for testing!");
      }
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ rotate: `${rotation}deg`, backgroundColor: bg }}
      className="relative w-48 min-h-[160px] hover:scale-102 transition-transform p-4 shadow-md rounded-sm flex flex-col text-black cursor-pointer active:cursor-grabbing group font-excalifont"
    >
      {isMine && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/50 hover:bg-white/80 rounded px-2 py-1 text-xs font-semibold transition-opacity font-sans shadow-sm"
        >
          Edit
        </button>
      )}

      {isEditing ? (
        <div className="flex-1 flex flex-col">
          <textarea
            ref={editRef}
            className="w-full bg-black/10 p-1 rounded resize-none text-[1.1rem] outline-none leading-relaxed overflow-hidden"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            disabled={saving}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 bg-black text-white text-xs py-1 rounded font-sans"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="flex-1 text-[1.1rem] font-medium whitespace-pre-wrap leading-relaxed">
          {editBody}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 font-sans opacity-90">
        <div className="flex gap-1.5 items-center text-xs opacity-75 font-semibold" style={{ color: shade }}>
          <span>{data.created_at ? timeAgo(data.created_at as string) : "just now"}</span>
          <span>•</span>
          <span className="truncate">{String(data.name || "Anonymous")}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center mt-1">
          {Array.from(emojisToRender).map((emojiId) => {
            const emojiInfo = (emojisData as Record<string, { path: string, name: string }>)[emojiId];
            if (!emojiInfo) return null;
            const count = emojiCounts[emojiId] || 0;
            return (
              <button
                key={emojiId}
                onClick={() => handleReaction(emojiId)}
                className={`hover:scale-110 transition-transform flex gap-1 items-center text-xs px-1.5 rounded py-0.5 ${count > 0 ? "bg-black/10" : "bg-black/5 hover:bg-black/10"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={emojiInfo.path} alt={emojiInfo.name} className="w-[16px] h-[16px] object-contain" />
                <span className="font-bold" style={{ color: shade }}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="ml-auto flex">
            <EmojiPicker color={shade} onSelect={(emojiId) => handleReaction(emojiId)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
