import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { z } from "zod";
import { GradientBackground } from "../components/GradientBackground";
import { Logo } from "../components/Logo";
import { theme, fontFamily } from "../theme";

export const rapportVideoSchema = z.object({
  title: z.string(),
  zone: z.string(),
  propertyType: z.string(),
  periodLabel: z.string(),
  pricePerSqm: z.number(),
  trendPercent: z.number(),
  agentName: z.string().optional(),
  agencyName: z.string().optional(),
});

export type RapportVideoProps = z.infer<typeof rapportVideoSchema>;

export const RAPPORT_VIDEO_FPS = 30;
export const RAPPORT_VIDEO_DURATION = 360;
export const RAPPORT_VIDEO_WIDTH = 1080;
export const RAPPORT_VIDEO_HEIGHT = 1920;

const Fade: React.FC<{
  children: React.ReactNode;
  inDuration?: number;
}> = ({ children, inDuration = 20 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, inDuration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [0, inDuration], [24, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};

const IntroScene: React.FC<Pick<RapportVideoProps, "title" | "zone">> = ({
  title,
  zone,
}) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
      textAlign: "center",
      gap: 32,
    }}
  >
    <Fade>
      <Logo size={30} />
    </Fade>
    <Fade inDuration={30}>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
    </Fade>
    <Fade inDuration={40}>
      <div
        style={{
          fontFamily,
          color: theme.brand200,
          fontSize: 34,
          fontWeight: 600,
        }}
      >
        {zone}
      </div>
    </Fade>
  </AbsoluteFill>
);

const DetailScene: React.FC<
  Pick<RapportVideoProps, "propertyType" | "periodLabel">
> = ({ propertyType, periodLabel }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    }}
  >
    <Fade>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 28,
          fontWeight: 500,
          opacity: 0.75,
        }}
      >
        Analyse de marché
      </div>
    </Fade>
    <Fade inDuration={30}>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 52,
          fontWeight: 700,
        }}
      >
        {propertyType}
      </div>
    </Fade>
    <Fade inDuration={40}>
      <div
        style={{
          fontFamily,
          color: theme.accent500,
          fontSize: 30,
          fontWeight: 600,
        }}
      >
        {periodLabel}
      </div>
    </Fade>
  </AbsoluteFill>
);

const PriceScene: React.FC<
  Pick<RapportVideoProps, "pricePerSqm" | "trendPercent">
> = ({ pricePerSqm, trendPercent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14 } });
  const progress = interpolate(frame, [0, fps * 1.2], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const animatedPrice = Math.round(pricePerSqm * progress);
  const isPositive = trendPercent >= 0;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            fontFamily,
            color: theme.brand200,
            fontSize: 30,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Prix moyen au m²
        </div>
        <div
          style={{
            fontFamily,
            color: theme.white,
            fontSize: 128,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          {animatedPrice.toLocaleString("fr-FR")} €
        </div>
        <div
          style={{
            fontFamily,
            marginTop: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 32,
            fontWeight: 700,
            color: isPositive ? "#4ade80" : "#f87171",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 999,
            padding: "10px 28px",
          }}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(trendPercent).toFixed(1)}%
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene: React.FC<
  Pick<RapportVideoProps, "agentName" | "agencyName">
> = ({ agentName, agencyName }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      textAlign: "center",
      padding: 80,
    }}
  >
    <Fade>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 44,
          fontWeight: 800,
        }}
      >
        Rapport complet disponible
      </div>
    </Fade>
    {(agentName || agencyName) && (
      <Fade inDuration={30}>
        <div
          style={{
            fontFamily,
            color: theme.brand200,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          {[agentName, agencyName].filter(Boolean).join(" · ")}
        </div>
      </Fade>
    )}
    <Fade inDuration={40}>
      <Logo size={22} />
    </Fade>
  </AbsoluteFill>
);

export const RapportVideo: React.FC<RapportVideoProps> = (props) => {
  return (
    <GradientBackground>
      <Sequence durationInFrames={80}>
        <IntroScene title={props.title} zone={props.zone} />
      </Sequence>
      <Sequence from={80} durationInFrames={90}>
        <DetailScene
          propertyType={props.propertyType}
          periodLabel={props.periodLabel}
        />
      </Sequence>
      <Sequence from={170} durationInFrames={110}>
        <PriceScene
          pricePerSqm={props.pricePerSqm}
          trendPercent={props.trendPercent}
        />
      </Sequence>
      <Sequence from={280} durationInFrames={80}>
        <OutroScene
          agentName={props.agentName}
          agencyName={props.agencyName}
        />
      </Sequence>
    </GradientBackground>
  );
};
