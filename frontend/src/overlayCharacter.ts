import type { PlayMotionResult } from "./live2d/MotionPlayer";

/** Overlay handle for Live2D Kurisu. */
export type OverlayCharacterHandle = {
  playMotion: (group: string) => PlayMotionResult;
  hitTest: (clientX: number, clientY: number) => boolean;
  setSleeping: (sleeping: boolean) => void;
  prepareSpeech: () => Promise<void>;
  playSpeech: (url: string) => Promise<void>;
  stopSpeech: () => void;
};
