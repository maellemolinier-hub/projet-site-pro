declare module "node-record-lpcm16" {
  import type { Readable } from "node:stream";

  interface RecordOptions {
    sampleRate?: number;
    channels?: number;
    threshold?: number;
    recorder?: "rec" | "sox" | "arecord";
    device?: string | null;
    audioType?: string;
  }

  interface Recording {
    stream(): Readable;
    pause(): void;
    resume(): void;
    stop(): void;
  }

  function record(options?: RecordOptions): Recording;

  const recorder: { record: typeof record };
  export default recorder;
}
