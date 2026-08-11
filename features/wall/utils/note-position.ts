import { REGION_SCALE } from "../constants/wall";

export function rotFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 17) - 8;
}

export function getNotePosition(note: {
  id: string;
  x: number;
  y: number;
  latitude?: number | null;
  longitude?: number | null;
}) {
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
      x: note.longitude * REGION_SCALE + jitterX,
      y: note.latitude * -REGION_SCALE + jitterY,
    };
  }
  return { x: note.x, y: note.y };
}
