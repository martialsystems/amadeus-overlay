export {};

declare global {
  interface Window {
    overlay?: {
      setClickThrough: (ignore: boolean) => void;
      moveBy: (dx: number, dy: number) => void;
      getVoice?: () => Promise<string>;
      setVoice?: (id: string) => void;
      onVoiceChanged?: (callback: (id: string) => void) => () => void;
      quit: () => void;
    };
  }
}
