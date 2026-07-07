import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  Easing,
} from "remotion";
import { z } from "zod";
import { GradientBackground } from "../components/GradientBackground";
import { Logo } from "../components/Logo";
import { TagPill } from "../components/TagPill";
import { theme, fontFamily } from "../theme";

export const vlogClipSchema = z.object({
  title: z.string(),
  category: z.string(),
  description: z.string(),
  durationLabel: z.string(),
  date: z.string(),
  tags: z.array(z.string()).default([]),
});

export type VlogClipProps = z.infer<typeof vlogClipSchema>;

export const VLOG_CLIP_FPS = 30;
export const VLOG_CLIP_DURATION = 240;
export const VLOG_CLIP_WIDTH = 1920;
export const VLOG_CLIP_HEIGHT = 1080;

const Fade: React.FC<{ children: React.ReactNode; inDuration?: number }> = ({
  children,
  inDuration = 20,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, inDuration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(frame, [0, inDuration], [-30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{ opacity, transform: `translateX(${translateX}px)` }}>
      {children}
    </div>
  );
};

const TitleCard: React.FC<VlogClipProps> = ({
  title,
  category,
  durationLabel,
  date,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      padding: "0 120px",
      gap: 20,
    }}
  >
    <Fade>
      <Logo size={26} />
    </Fade>
    <Fade inDuration={30}>
      <div
        style={{
          fontFamily,
          color: theme.accent500,
          fontSize: 26,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {category}
      </div>
    </Fade>
    <Fade inDuration={35}>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 1200,
        }}
      >
        {title}
      </div>
    </Fade>
    <Fade inDuration={45}>
      <div
        style={{
          fontFamily,
          color: theme.brand200,
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        {date} · {durationLabel}
      </div>
    </Fade>
  </AbsoluteFill>
);

const DescriptionCard: React.FC<VlogClipProps> = ({ description, tags }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      padding: "0 120px",
      gap: 32,
    }}
  >
    <Fade>
      <div
        style={{
          fontFamily,
          color: theme.white,
          fontSize: 42,
          fontWeight: 500,
          lineHeight: 1.4,
          maxWidth: 1300,
        }}
      >
        {description}
      </div>
    </Fade>
    <Fade inDuration={30}>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {tags.map((tag) => (
          <TagPill key={tag} label={tag} />
        ))}
      </div>
    </Fade>
  </AbsoluteFill>
);

export const VlogClip: React.FC<VlogClipProps> = (props) => {
  return (
    <GradientBackground>
      <Sequence durationInFrames={130}>
        <TitleCard {...props} />
      </Sequence>
      <Sequence from={130} durationInFrames={110}>
        <DescriptionCard {...props} />
      </Sequence>
    </GradientBackground>
  );
};
