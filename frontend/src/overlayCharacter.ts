import type { PlayMotionResult } from "./live2d/MotionPlayer";

/** Shared overlay handle for Live2D Kurisu and the Maho mesh puppet. */
export type OverlayCharacterHandle = {
  playMotion: (group: string) => PlayMotionResult;
  hitTest: (clientX: number, clientY: number) => boolean;
  setSleeping: (sleeping: boolean) => void;
  prepareSpeech: () => Promise<void>;
  playSpeech: (url: string) => Promise<void>;
  stopSpeech: () => void;
};
