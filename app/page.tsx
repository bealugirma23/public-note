import WallClient from "./wall/wall-client";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f0f0f0] dark:bg-[#000000]">
      <WallClient />
    </div>
  );
}
