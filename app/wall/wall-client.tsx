"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { RealtimeCursors } from "@/components/realtime-cursors";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicWallGuidelinesModal } from "@/components/shared/OnboardingRule";
import { WallCanvas } from "@/features/wall/components/WallCanvas";

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
      <PublicWallGuidelinesModal />
    </div>
  );
}
