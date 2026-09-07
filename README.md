# sg-overlay

Kurisu sits on your desktop. Click her and she talks. After a while she falls asleep.

Forked from [Amadeus](https://github.com/reflectors02/Amadeus-Project). MIT/open source

## Use it

- Head or chest: she plays a line
- Drag: move the window
- 45 seconds with no click: eyes close, `z`s over her head
- Click again: she wakes
- Right-click, or the SG Overlay menu, then Quit: close

Clicks go through empty space around her, so you can still use the apps underneath.

## Run it (macOS)

You need Node, Python 3.12, and Git LFS.

```bash
git clone https://github.com/martialsystems/sg-overlay.git
cd sg-overlay
git lfs install
git lfs pull
python3.12 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-no-ai.txt
cd frontend && npm install && cd ..
chmod +x start_local.command
./start_local.command
```

Same start later: `./start_local.command`

## Add sleep to original Amadeus

If you already run the original Amadeus chat app and only want the nap:

1. Copy `frontend/src/sleepTimer.ts`, `frontend/src/useKurisuSleep.ts`, and `frontend/src/components/ZzzLayer.tsx` into the same places in your Amadeus folder.
2. Paste `contrib/sleep-idle/zzz.css` at the bottom of `frontend/src/styles.css`.
3. From your Amadeus folder run `git apply path/to/sg-overlay/contrib/sleep-idle/kurisu-sleep.patch`
4. In `frontend/src/App.tsx`, import `ZzzLayer` and `useKurisuSleep`, call `useKurisuSleep(characterRef)`, run `noteActivity()` when the user clicks or sends a message, and render `{sleeping ? <ZzzLayer /> : null}` next to the character.

Wait 45 seconds with no input: eyes close and `z`s rise. Click or send a message: she wakes. Chat stays as it was.

Exact snippets: [contrib/sleep-idle/README.md](contrib/sleep-idle/README.md).

## Files

| Path | Role |
|------|------|
| `frontend/` | Live2D window and Electron shell |
| `backend/` | Click audio |
| `contrib/sleep-idle/` | Sleep add-on for original Amadeus |
| `start_local.command` | Starts the overlay |
| [LICENSE](LICENSE) | MIT for our software |
| [NOTICE](NOTICE) | Cubism, model, and voice terms |

## Changelog

- Standalone sg-overlay (2026-09-07): own MIT repo. Sleep add-on under `contrib/sleep-idle/` for original Amadeus.
- Idle sleep and English voice (2026-09-07): 45 second nap. Click lines in English from `kurisu10s.wav`.
- Desktop overlay (2026-09-07): character on the desktop instead of a chat page.
- Local launch (2026-09-07): run with Python 3.12 and Node.
