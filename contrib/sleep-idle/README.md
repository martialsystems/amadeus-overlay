# Sleep idle for original Amadeus

Add 45-second idle sleep (closed eyes and `z`s off the head) to [reflectors02/Amadeus-Project](https://github.com/reflectors02/Amadeus-Project) without taking the overlay, Electron, or English voice work.

Tested against original `1545ff0`.

## Copy these files

From this repo into your Amadeus tree:

```text
frontend/src/sleepTimer.ts
frontend/src/useKurisuSleep.ts
frontend/src/components/ZzzLayer.tsx
```

Append `contrib/sleep-idle/zzz.css` to `frontend/src/styles.css`.

## Patch the Live2D engine

From your Amadeus root:

```bash
git apply path/to/sg-overlay/contrib/sleep-idle/kurisu-sleep.patch
```

That adds `setSleeping` on `KurisuModel`, `KurisuController`, and `Live2DCharacter`. If `git apply` fails, paste those three hunks by hand. They only close `ParamEyeROpen`; they do not add overlay hit-testing.

## Wire the chat App

In `frontend/src/App.tsx`:

```tsx
import ZzzLayer from "./components/ZzzLayer";
import { useKurisuSleep } from "./useKurisuSleep";
```

Inside `App`, next to `characterRef`:

```tsx
const { sleeping, noteActivity } = useKurisuSleep(characterRef);
```

Call `noteActivity()` at the start of `handleInteraction` and at the start of `submit` (any click or sent message should reset the 45s timer).

Inside `.character-viewport`, after `<Live2DCharacter ... />`:

```tsx
{sleeping ? <ZzzLayer /> : null}
```

`.character-viewport` must stay `position: relative` or `absolute` so the `z`s sit on the head.

## Check

Leave the WebUI idle for 45 seconds: eyes close and `z`s rise. Click the figure or send a message: she wakes. Chat, OpenRouter, and GPT-SoVITS stay as they were.
