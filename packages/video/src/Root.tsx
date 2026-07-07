import React from "react";
import { Composition } from "remotion";
import {
  RapportVideo,
  rapportVideoSchema,
  RAPPORT_VIDEO_FPS,
  RAPPORT_VIDEO_DURATION,
  RAPPORT_VIDEO_WIDTH,
  RAPPORT_VIDEO_HEIGHT,
} from "./compositions/RapportVideo";
import {
  VlogClip,
  vlogClipSchema,
  VLOG_CLIP_FPS,
  VLOG_CLIP_DURATION,
  VLOG_CLIP_WIDTH,
  VLOG_CLIP_HEIGHT,
} from "./compositions/VlogClip";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RapportVideo"
        component={RapportVideo}
        durationInFrames={RAPPORT_VIDEO_DURATION}
        fps={RAPPORT_VIDEO_FPS}
        width={RAPPORT_VIDEO_WIDTH}
        height={RAPPORT_VIDEO_HEIGHT}
        schema={rapportVideoSchema}
        defaultProps={{
          title: "Marché Lyon 6e",
          zone: "Lyon 6e (69006)",
          propertyType: "Appartements",
          periodLabel: "12 derniers mois",
          pricePerSqm: 5240,
          trendPercent: 4.2,
          agentName: "Camille Dupont",
          agencyName: "ImmoExpert",
        }}
      />
      <Composition
        id="VlogClip"
        component={VlogClip}
        durationInFrames={VLOG_CLIP_DURATION}
        fps={VLOG_CLIP_FPS}
        width={VLOG_CLIP_WIDTH}
        height={VLOG_CLIP_HEIGHT}
        schema={vlogClipSchema}
        defaultProps={{
          title: "Visite d'un T3 rénové dans le Vieux Lyon",
          category: "Visite",
          description:
            "On vous emmène découvrir un appartement rénové avec vue sur les toits, et on décrypte son estimation avec les données du marché local.",
          durationLabel: "8 min",
          date: "7 juillet 2026",
          tags: ["visite", "lyon", "estimation"],
        }}
      />
    </>
  );
};
