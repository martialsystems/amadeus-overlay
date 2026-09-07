import { useEffect, useRef, useState } from "react";
import Live2DCharacter from "./components/Live2DCharacter";
import MahoPuppet from "./components/MahoPuppet";
import ZzzLayer from "./components/ZzzLayer";
import { OVERLAY_CHARACTER } from "./character";
import { sendInteraction } from "./api";
import { startOverlayPointer } from "./overlayPointer";
import { useKurisuSleep } from "./useKurisuSleep";
import { interactions } from "./interactions";
import type { OverlayCharacterHandle } from "./overlayCharacter";
import type { InteractionName } from "./interactions";

export default function App() {
  const [busy, setBusy] = useState(false);
  const characterRef = useRef<OverlayCharacterHandle>(null);
  const { sleeping, noteActivity } = useKurisuSleep(characterRef);

  useEffect(() => {
    return startOverlayPointer({
      hitTest: (x, y) => characterRef.current?.hitTest(x, y) ?? false,
      onActivity: noteActivity,
    });
  }, [noteActivity]);

  async function handleInteraction(name: InteractionName) {
    if (busy) return;
    noteActivity();

    const interaction = interactions[name];
    const result = characterRef.current?.playMotion(interaction.motion) ?? "not-ready";
    if (result !== "started") return;

    if (OVERLAY_CHARACTER === "maho") return;

    const speechReady = characterRef.current?.prepareSpeech().then(
      () => true,
      () => false,
    );
    setBusy(true);

    try {
      const reply = await sendInteraction(interaction.backendId);
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
        {OVERLAY_CHARACTER === "maho" ? (
          <MahoPuppet ref={characterRef} onBusyChange={setBusy} />
        ) : (
          <Live2DCharacter
            ref={characterRef}
            onSpeechError={(message) => console.error(message)}
          />
        )}
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
