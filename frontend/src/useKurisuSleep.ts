import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Live2DCharacterHandle } from "./components/Live2DCharacter";
import { startSleepTimer } from "./sleepTimer";

/** 45s idle sleep for the overlay and for original Amadeus WebUI trees. */
export function useKurisuSleep(
  characterRef: RefObject<Live2DCharacterHandle | null>,
) {
  const [sleeping, setSleeping] = useState(false);
  const sleepRef = useRef<ReturnType<typeof startSleepTimer> | null>(null);

  useEffect(() => {
    const timer = startSleepTimer({
      onSleep() {
        setSleeping(true);
        characterRef.current?.setSleeping(true);
      },
      onWake() {
        setSleeping(false);
        characterRef.current?.setSleeping(false);
      },
    });
    sleepRef.current = timer;
    return () => {
      timer.stop();
      sleepRef.current = null;
    };
  }, [characterRef]);

  const noteActivity = useCallback(() => {
    sleepRef.current?.poke();
  }, []);

  return { sleeping, noteActivity };
}
