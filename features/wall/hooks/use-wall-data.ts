import { useEffect, useState } from "react";
import { useNodesState, Node } from "@xyflow/react";
import { fetchNotes, subscribeToNotes, subscribeToInteractions } from "../services/wall.service";
import { getNotePosition, rotFromId } from "../utils/note-position";

export function useWallData() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [mounted, setMounted] = useState(false);

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
        setNodes((nds) =>
          nds.map((n) => (n.id === note.id ? { ...n, data: { ...n.data, ...note } } : n))
        );
      },
      (id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
      }
    );

    const intSub = subscribeToInteractions((interaction) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === interaction.note_id) {
            const type = interaction.type;
            const oldType = interaction.old_type;

            if (type === "like" || type === "dislike") {
              const key = `${type}s`;
              return {
                ...n,
                data: {
                  ...n.data,
                  [key]: Math.max(0, ((n.data[key] as number) || 0) + (interaction.action === "INSERT" ? 1 : -1)),
                },
              };
            } else {
              const currentEmojis = { ...(n.data.emojis as Record<string, number>) || {} };
              
              if (interaction.action === "INSERT") {
                currentEmojis[type] = (currentEmojis[type] || 0) + 1;
              } else if (interaction.action === "DELETE") {
                currentEmojis[type] = Math.max(0, (currentEmojis[type] || 0) - 1);
              } else if (interaction.action === "UPDATE") {
                if (oldType && oldType !== type) {
                  currentEmojis[oldType] = Math.max(0, (currentEmojis[oldType] || 0) - 1);
                }
                currentEmojis[type] = (currentEmojis[type] || 0) + 1;
              }

              return {
                ...n,
                data: {
                  ...n.data,
                  emojis: currentEmojis,
                },
              };
            }
          }
          return n;
        })
      );
    });

    return () => {
      active = false;
      sub.unsubscribe();
      intSub.unsubscribe();
    };
  }, [setNodes]);

  return { nodes, setNodes, onNodesChange, mounted };
}
