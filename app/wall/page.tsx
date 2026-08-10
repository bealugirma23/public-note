import WallClient from "./wall-client";

export default function WallPage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f8f8f8] dark:bg-[#1a1a1a]">
      <WallClient />
    </div>
  );
}
