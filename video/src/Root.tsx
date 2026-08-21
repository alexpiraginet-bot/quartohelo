import React from "react";
import { Composition } from "remotion";
import { Demo, duracaoTotal } from "./Demo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="guia"
    component={Demo}
    durationInFrames={duracaoTotal()}
    fps={30}
    width={1280}
    height={720}
  />
);
