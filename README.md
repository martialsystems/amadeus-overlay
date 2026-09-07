# amadeus-overlay

Kurisu sits on your desktop. Click her head or chest. She answers in English or Japanese.

<video src="docs/demo.mp4" controls playsinline title="Amadeus Overlay demo"></video>

Forked from [Amadeus](https://github.com/reflectors02/Amadeus-Project). MIT

## Use it

- Head: a small tilt, and a spoken line
- Chest: she gets mad, and a spoken line
- Drag: move the window
- 45 seconds with no click: eyes close, `z`s over her head
- Click again: she wakes
- Right-click her, or the Amadeus Overlay menu: English, Japanese, or Quit

English is the starting voice. The last choice is kept the next time you start.

Clicks go through empty space around her, so you can still use the apps underneath.

English lines are the cloned WAVs from `kurisu10s.wav`. Japanese lines are the original reaction recordings. Both sets are level-matched to that reference clip. English does not repeat a line until the rest of that click set has played.

## Run it

You need Node, Python 3.12, and Git LFS.

### macOS

```bash
git clone https://github.com/martialsystems/amadeus-overlay.git
cd amadeus-overlay
git lfs install
git lfs pull
python3.12 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-no-ai.txt
cd frontend && npm install && cd ..
chmod +x start_local.command
./start_local.command
```

Same start later: `./start_local.command`

### Windows

```bat
git clone https://github.com/martialsystems/amadeus-overlay.git
cd amadeus-overlay
git lfs install
git lfs pull
py -3.12 -m venv backend\.venv
backend\.venv\Scripts\python -m pip install -r backend\requirements-no-ai.txt
cd frontend
npm install
cd ..
start_local.bat
```

Same start later: double-click `start_local.bat` or `start_windows.bat`.

## Add sleep to original Amadeus

If you already run the original Amadeus chat app and only want the nap:

1. Copy `frontend/src/sleepTimer.ts`, `frontend/src/useKurisuSleep.ts`, and `frontend/src/components/ZzzLayer.tsx` into the same places in your Amadeus folder.
2. Paste `contrib/sleep-idle/zzz.css` at the bottom of `frontend/src/styles.css`.
3. From your Amadeus folder run `git apply path/to/amadeus-overlay/contrib/sleep-idle/kurisu-sleep.patch`
4. In `frontend/src/App.tsx`, import `ZzzLayer` and `useKurisuSleep`, call `useKurisuSleep(characterRef)`, run `noteActivity()` when the user clicks or sends a message, and render `{sleeping ? <ZzzLayer /> : null}` next to the character.

Wait 45 seconds with no input: eyes close and `z`s rise. Click or send a message: she wakes. Chat stays as it was.

Exact snippets: [contrib/sleep-idle/README.md](contrib/sleep-idle/README.md).

## Files

| Path | Role |
|------|------|
| `docs/demo.mp4` | Screen-recording demo |
| `frontend/` | Overlay window (Kurisu Live2D) |
| `backend/` | Click audio, English and Japanese |
| `contrib/sleep-idle/` | Sleep add-on for original Amadeus |
| `start_local.command` | Starts the overlay on a Mac |
| `start_local.bat` | Starts the overlay on Windows |
| [LICENSE](LICENSE) | MIT for our software |
| [NOTICE](NOTICE) | Cubism, model, and voice terms |

## Changelog

