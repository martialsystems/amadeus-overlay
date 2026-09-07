import { useEffect, useRef, useState } from "react";
import Live2DCharacter from "./components/Live2DCharacter";
import ZzzLayer from "./components/ZzzLayer";
import { sendInteraction, type VoiceId } from "./api";
import { startOverlayPointer } from "./overlayPointer";
import { useKurisuSleep } from "./useKurisuSleep";
import { interactions } from "./interactions";
import type { OverlayCharacterHandle } from "./overlayCharacter";
import type { InteractionName } from "./interactions";

export default function App() {
  const [busy, setBusy] = useState(false);
  const [voice, setVoice] = useState<VoiceId>("en");
  const voiceRef = useRef<VoiceId>("en");
  const characterRef = useRef<OverlayCharacterHandle>(null);
  const { sleeping, noteActivity } = useKurisuSleep(characterRef);
  voiceRef.current = voice;

  useEffect(() => {
    return startOverlayPointer({
      hitTest: (x, y) => characterRef.current?.hitTest(x, y) ?? false,
      onActivity: noteActivity,
    });
  }, [noteActivity]);

  useEffect(() => {
    const overlay = window.overlay;
    if (!overlay?.getVoice) return;
    void overlay.getVoice().then((next) => {
      if (next === "en" || next === "ja") setVoice(next);
    });
    return overlay.onVoiceChanged?.((next) => {
      if (next === "en" || next === "ja") setVoice(next);
    });
  }, []);

  async function handleInteraction(name: InteractionName) {
    if (busy) return;
    noteActivity();

    const interaction = interactions[name];
    const result = characterRef.current?.playMotion(interaction.motion) ?? "not-ready";
    if (result !== "started") return;

    const speechReady = characterRef.current?.prepareSpeech().then(
      () => true,
      () => false,
    );
    setBusy(true);

    try {
      const reply = await sendInteraction(interaction.backendId, voiceRef.current);
      if (reply.speechUrl && await speechReady) {
        await characterRef.current?.playSpeech(reply.speechUrl);
      }
    } catch (error) {
      console.error("Interaction failed:", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="overlay">
      <div className="character-viewport">
        <Live2DCharacter
          ref={characterRef}
          onSpeechError={(message) => console.error(message)}
        />
        {sleeping ? <ZzzLayer /> : null}

        {(Object.keys(interactions) as InteractionName[]).map((name) => {
          const interaction = interactions[name];
          return (
            <button
              key={name}
              type="button"
              className="touch-button"
              style={interaction.position}
              aria-label={interaction.label}
              disabled={busy}
              onClick={() => void handleInteraction(name)}
            >
              {interaction.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}
