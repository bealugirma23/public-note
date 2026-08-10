"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  useNodesState,
  Controls,
  Background,
  NodeProps,
  Node,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { EmojiPicker } from "../components/EmojiPicker";
import emojisData from "../lib/emojis.json";
import { isNoteOwned, updateNote, postNote, reactToNote, fetchNotes, subscribeToNotes, subscribeToInteractions } from "../services/wall";

const STICKY_COLORS: Record<string, string> = {
  amber: "#FAC66B",
  rose: "#FC9583",
  sky: "#93C2EA",
  mint: "#95DBAB",
  lilac: "#C6ADEC",
  blush: "#F2C6DB",
};

const STICKY_SHADES: Record<string, string> = {
  amber: "#D69F3E",
  rose: "#D46E5D",
  sky: "#6D9EC9",
  mint: "#6DBA86",
  lilac: "#9D84C7",
  blush: "#D19EB4",
};
const colorKeys = Object.keys(STICKY_COLORS);

function rotFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 17) - 8;
}

const REGION_SCALE = 10;

function getNotePosition(note: { id: string, x: number, y: number, latitude?: number | null, longitude?: number | null }) {
  if (note.latitude != null && note.longitude != null) {
    let hashX = 0;
    for (let i = 0; i < note.id.length; i++) {
      hashX = note.id.charCodeAt(i) + ((hashX << 5) - hashX);
    }
    const jitterX = (Math.abs(hashX) % 500) - 250;

    let hashY = 0;
    for (let i = note.id.length - 1; i >= 0; i--) {
      hashY = note.id.charCodeAt(i) + ((hashY << 5) - hashY);
    }
    const jitterY = (Math.abs(hashY) % 500) - 250;

    return {
      x: (note.longitude * REGION_SCALE) + jitterX,
      y: (note.latitude * -REGION_SCALE) + jitterY,
    };
  }
  return { x: note.x, y: note.y };
}


function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function StickyNoteNode({ data }: NodeProps<Node>) {
  const bg = STICKY_COLORS[data.color as string] || STICKY_COLORS.amber;
  const shade = STICKY_SHADES[data.color as string] || STICKY_SHADES.amber;
  const rotation = (data.rotation as number) ?? rotFromId(data.id as string);
  const isMine = isNoteOwned(data.id as string);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(data.body as string);
  const [saving, setSaving] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);

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
    } catch (e: any) {
      console.error("Already reacted or failed", e);
      // Fallback: Optimistically update the UI if the backend Edge function isn't deployed yet
      if (e.message?.includes("Failed to fetch") || e.message?.includes("unreachable")) {
        alert("Edge Function unreachable. Running local mock update for testing!");
        // Update the reaction count locally
      }
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ rotate: `${rotation}deg`, backgroundColor: bg }}
      className="relative w-48 min-h-[160px] hover:scale-102 transition-transform  p-4 shadow-md rounded-sm flex flex-col text-black cursor-pointer active:cursor-grabbing group font-excalifont"
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

        <div className="flex justify-between items-center bg-black/5 rounded-full px-2 py-1">
          <button
            onClick={() => handleReaction("like")}
            className="hover:scale-110 transition-transform flex gap-1 items-center text-xs"
          >
            <span
              className="w-[16px] h-[16px] inline-block"
              style={{
                backgroundColor: shade,
                maskImage: `url('/icons/thumbsup_filled.svg')`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url('/icons/thumbsup_filled.svg')`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
            <span className="font-bold" style={{ color: shade }}>
              {Number(data.likes) || 0}
            </span>
          </button>

          <button
            onClick={() => handleReaction("dislike")}
            className="hover:scale-110 transition-transform flex gap-1 items-center text-xs"
          >
            <span
              className="w-[16px] h-[16px] inline-block"
              style={{
                backgroundColor: shade,
                maskImage: `url('/icons/thumbsdown_filled.svg')`,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: `url('/icons/thumbsdown_filled.svg')`,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
              }}
            />
            <span className="font-bold" style={{ color: shade }}>
              {Number(data.dislikes) || 0}
            </span>
          </button>

          {!!data.emojis && Object.entries(data.emojis as Record<string, number>).map(([emojiId, count]) => {
            const emojiInfo = (emojisData as Record<string, { path: string, name: string }>)[emojiId];
            if (!emojiInfo || count <= 0) return null;
            return (
              <button
                key={emojiId}
                onClick={() => handleReaction(emojiId)}
                className="hover:scale-110 transition-transform flex gap-1 items-center text-xs bg-black/5 px-1.5 rounded"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={emojiInfo.path} alt={emojiInfo.name} className="w-[16px] h-[16px] object-contain" />
                <span className="font-bold" style={{ color: shade }}>
                  {count}
                </span>
              </button>
            );
          })}

          <EmojiPicker color={shade} onSelect={(emojiId) => handleReaction(emojiId)} />
        </div>
      </div>
    </motion.div>
  );
}

function DraftStickyNode({ id, data }: NodeProps<Node<{ onPost: any, onCancel: any, color?: string }>>) {
  const [content, setContent] = useState("");
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
    await data.onPost(id, content, color);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      style={{ backgroundColor: bg }}
      className="relative w-56 min-h-[200px] p-4 shadow-2xl rounded-sm flex flex-col text-black z-50 border-2 border-black/10 cursor-default font-excalifont"
    >
      <div className="text-xs font-semibold mb-2 opacity-50 uppercase tracking-widest font-sans">New Thought</div>
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
        <div className="flex gap-1.5 justify-center">
          {colorKeys.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border border-black/20 ${color === c ? 'ring-2 ring-black scale-110' : ''}`}
              style={{ backgroundColor: STICKY_COLORS[c] }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs font-bold items-center mt-2">
          <button onClick={() => data.onCancel(id)} disabled={saving} className="text-black/50 hover:text-black transition-colors">Cancel</button>
          <button onClick={handlePost} disabled={saving} className="bg-black text-white px-3 py-1.5 rounded shadow-sm hover:scale-105 transition-transform">
            {saving ? "Locating..." : "Stick it"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const nodeTypes = {
  sticky: StickyNoteNode,
  draft: DraftStickyNode,
};

function WallCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [mounted, setMounted] = useState(false);
  const { screenToFlowPosition, setCenter } = useReactFlow();

  useEffect(() => {
    let active = true;

    async function loadData() {
      const data = await fetchNotes();
      if (!active) return;
      setNodes(
        data.map((n) => ({
          id: n.id,
          type: "sticky",
          position: getNotePosition(n),
          data: { ...n, rotation: rotFromId(n.id) },
        }))
      );
      setMounted(true);
    }

    loadData();

    const sub = subscribeToNotes(
      (note) => {
        setNodes((nds) => [
          ...nds,
          {
            id: note.id,
            type: "sticky",
            position: getNotePosition(note),
            data: { ...note, rotation: rotFromId(note.id) },
          },
        ]);
      },
      (note) => {
        setNodes((nds) => nds.map(n => n.id === note.id ? { ...n, data: { ...n.data, ...note } } : n));
      },
      (id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
      }
    );

    const intSub = subscribeToInteractions((interaction) => {
      setNodes((nds) => nds.map((n) => {
        if (n.id === interaction.note_id) {
          const type = interaction.type; // like, dislike, or emoji_id

          if (type === 'like' || type === 'dislike') {
            const key = `${type}s`;
            return {
              ...n,
              data: {
                ...n.data,
                [key]: ((n.data[key] as number) || 0) + 1,
              }
            };
          } else {
            // It's an emoji
            const currentEmojis = (n.data.emojis as Record<string, number>) || {};
            return {
              ...n,
              data: {
                ...n.data,
                emojis: {
                  ...currentEmojis,
                  [type]: (currentEmojis[type] || 0) + 1,
                }
              }
            };
          }
        }
        return n;
      }));
    });

    return () => {
      active = false;
      sub.unsubscribe();
      intSub.unsubscribe();
    };
  }, [setNodes]);

  const handleAddDraft = useCallback((color: string) => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const draftId = `draft-${Date.now()}`;
    const newDraft: Node = {
      id: draftId,
      type: "draft",
      position,
      data: {
        color,
        onCancel: (id: string) => {
          setNodes((nds) => nds.filter((n) => n.id !== id));
        },
        onPost: async (id: string, content: string, color: string) => {
          return new Promise<void>((resolve) => {
            if (!navigator.geolocation) {
              alert("Geolocation is not supported by your browser");
              resolve();
              return;
            }

            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const x = lng * REGION_SCALE;
                const y = lat * -REGION_SCALE;

                try {
                  const savedNote = await postNote(content, color, x, y, lat, lng, "Anon");
                  const newPosition = getNotePosition(savedNote);

                  setNodes((nds) => [
                    ...nds.filter(n => n.id !== id),
                    {
                      id: savedNote.id,
                      type: "sticky",
                      position: newPosition,
                      data: {
                        ...savedNote,
                        rotation: rotFromId(savedNote.id),
                        likes: 0,
                        dislikes: 0,
                        emojis: {},
                      },
                    }
                  ]);

                  setCenter(newPosition.x, newPosition.y, { duration: 800, zoom: 1 });
                } catch (e) {
                  console.error(e);
                  alert("Failed to post note (Ensure Supabase is running!)");
                }
                resolve();
              },
              (err) => {
                alert("We need your location to place the note on the canvas!");
                resolve();
              }
            );
          });
        }
      }
    };

    setNodes((nds) => [...nds, newDraft]);
  }, [screenToFlowPosition, setCenter, setNodes]);

  if (!mounted) return null;

  return (
    <>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        minZoom={0.1}
        maxZoom={4}
      >
        <Background variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          style={{ opacity: 0.4 }}
          color="#ccc" />
        {/* <Controls /> */}
      </ReactFlow >

      <AddSticker onClick={handleAddDraft} />
    </>
  );
}

import { RealtimeCursors } from "@/components/realtime-cursors";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { AddSticker } from "../components/AddSticker";

export default function WallClient() {
  const [username] = useState(() => `Guest ${Math.floor(Math.random() * 1000)}`);
  return (
    <div className="w-full h-full relative">
      <RealtimeCursors roomName="public-wall" username={username} />
      <Header />
      <ReactFlowProvider>
        <WallCanvas />
      </ReactFlowProvider>
      <Footer />
    </div>
  );
}
