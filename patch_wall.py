import re

with open("app/wall/wall-client.tsx", "r") as f:
    content = f.read()

# 1. Insert getNotePosition function after rotFromId
rot_func = """function rotFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 17) - 8;
}"""

get_pos_func = """

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
"""

content = content.replace(rot_func, rot_func + get_pos_func)

# 2. Replace position in loadData
content = content.replace("position: { x: n.x, y: n.y },", "position: getNotePosition(n),")

# 3. Replace position in subscribeToNotes
content = content.replace("position: { x: note.x, y: note.y },", "position: getNotePosition(note),")

# 4. Replace position logic in getCurrentPosition
geo_old = """                const x = lng * 30;
                const y = lat * -30;

                try {
                  const savedNote = await postNote(content, color, x, y, lat, lng, "Anon");

                  setNodes((nds) => [
                    ...nds.filter(n => n.id !== id),
                    {
                      id: savedNote.id,
                      type: "sticky",
                      position: { x: savedNote.x, y: savedNote.y },
                      data: {
                        ...savedNote,
                        rotation: rotFromId(savedNote.id),
                        likes: 0,
                        dislikes: 0,
                        claps: 0,
                      },
                    }
                  ]);

                  setCenter(x, y, { duration: 800, zoom: 1 });"""

geo_new = """                const x = lng * REGION_SCALE;
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
                        claps: 0,
                      },
                    }
                  ]);

                  setCenter(newPosition.x, newPosition.y, { duration: 800, zoom: 1 });"""

content = content.replace(geo_old, geo_new)

with open("app/wall/wall-client.tsx", "w") as f:
    f.write(content)

