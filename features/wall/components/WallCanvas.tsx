import { useCallback } from "react";
import { ReactFlow, Background, BackgroundVariant, Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { useWallData } from "../hooks/use-wall-data";
import { StickyNoteNode } from "./StickyNoteNode";
import { DraftStickyNode } from "./DraftStickyNode";
import { REGION_SCALE } from "../constants/wall";
import { postNote } from "../services/wall.service";
import { getNotePosition, rotFromId } from "../utils/note-position";
import { AddSticker } from "@/components/shared/AddSticker";

const nodeTypes = {
  sticky: StickyNoteNode,
  draft: DraftStickyNode,
};

export function WallCanvas() {
  const { nodes, setNodes, onNodesChange, mounted } = useWallData();
  const { screenToFlowPosition, setCenter } = useReactFlow();

  const handleAddDraft = useCallback(
    (color: string) => {
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
          onPost: async (id: string, content: string, color: string, name: string) => {
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
                    const savedNote = await postNote(
                      content,
                      color,
                      x,
                      y,
                      lat,
                      lng,
                      name || "Anonymous"
                    );
                    const newPosition = getNotePosition(savedNote);

                    setNodes((nds) => [
                      ...nds.filter((n) => n.id !== id),
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
                      },
                    ]);

                    setCenter(newPosition.x, newPosition.y, { duration: 800, zoom: 1 });
                  } catch (e) {
                    console.error(e);
                    alert("Failed to post note (Ensure Supabase is running!)");
                  }
                  resolve();
                },
                () => {
                  alert("We need your location to place the note on the canvas!");
                  resolve();
                }
              );
            });
          },
        },
      };

      setNodes((nds) => [...nds, newDraft]);
    },
    [screenToFlowPosition, setCenter, setNodes]
  );

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
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          style={{ opacity: 0.4, zIndex: -1 }}
          color="#ccc"
        />
      </ReactFlow>

      <AddSticker onClick={handleAddDraft} />
    </>
  );
}
