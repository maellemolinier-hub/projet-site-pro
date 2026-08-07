"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoSectionProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** YouTube/Vimeo embed URL or self-hosted (Mux) URL. Leave empty to show the placeholder teaser. */
  videoUrl?: string;
  posterAlt?: string;
  className?: string;
}

export function VideoSection({
  eyebrow = "En vidéo",
  title,
  subtitle,
  videoUrl,
  className = "",
}: VideoSectionProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={`py-24 bg-white ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">
            {eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 border border-gray-100">
          {videoUrl && playing ? (
            <iframe
              src={videoUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <button
              onClick={() => videoUrl && setPlaying(true)}
              disabled={!videoUrl}
              className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex flex-col items-center justify-center gap-4 group disabled:cursor-default"
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 30% 30%, #7c96f8 0%, transparent 50%),
                                   radial-gradient(circle at 70% 70%, #fb923c 0%, transparent 50%)`,
                }}
              />
              <div className="relative w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 group-enabled:group-hover:scale-105 transition-all">
                <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
              </div>
              <p className="relative text-white/70 text-sm">
                {videoUrl ? "Voir la vidéo" : "Vidéo de présentation à venir"}
              </p>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
