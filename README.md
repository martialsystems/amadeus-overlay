# sg-overlay

Desktop overlay for Steins;Gate Live2D characters. Kurisu is the first one: always-on-top, clickable, no chat panel.

Forked from [reflectors02/Amadeus-Project](https://github.com/reflectors02/Amadeus-Project) with the original author's OK, then published as its own tree so more characters can land here.

## What it does

- Transparent Electron window over the desktop
- Head-pat and special-touch clicks, with English lines cloned from `backend/assets/reference_audio/kurisu10s.wav`
- After 45 seconds idle: eyes close and `z`s float off the head. A click wakes her.
- Flask on `http://127.0.0.1:5050` serves reaction audio
- Vite renderer on `http://127.0.0.1:5173`

Click the figure to play a reaction. Drag to move the window. Empty pixels click through. Right-click, or SG Overlay → Quit, to close.

Japanese masters of the reaction WAVs stay in `backend/assets/reaction_audio/ja/`. Re-bake English with:

```bash
backend/.venv-xtts/bin/python backend/scripts/bake_english_voice.py
```

## License

Software in this repository is MIT. See [LICENSE](LICENSE). Cubism SDK, Live2D assets, and voice files keep their own terms. See [NOTICE](NOTICE).

Sleep idle for the original Amadeus WebUI: [contrib/sleep-idle/README.md](contrib/sleep-idle/README.md).

## One-time setup (macOS)

```bash
git clone https://github.com/martialsystems/sg-overlay.git
cd sg-overlay
git lfs install
git lfs pull
python3.12 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements-no-ai.txt
cd frontend && npm install && cd ..
chmod +x start_local.command
```

## Start

```bash
./start_local.command
```

or:

```bash
backend/.venv/bin/python scripts/launcher.py --no-ai
```

Needs Node, Python 3.12, and Git LFS. Conda, OpenRouter, and GPT-SoVITS are not required for this overlay path.

## Layout

```text
sg-overlay/
├── backend/          Flask, reaction audio, English bake script
├── frontend/         Live2D overlay renderer and Electron shell
├── contrib/sleep-idle/   drop-in for original Amadeus
├── scripts/launcher.py
└── start_local.command
```

## Changelog

- Standalone sg-overlay (2026-09-07): published as its own MIT repo. Sleep idle drop-in under `contrib/sleep-idle/` for original Amadeus trees.
- Idle sleep and English cloned voice (2026-09-07): after 45 seconds without a click she sleeps. Click reactions use English WAVs cloned from `kurisu10s.wav`.
- Desktop overlay, no chat (2026-09-07): conversation UI replaced with a transparent always-on-top window.
- Local no-AI launch (2026-09-07): Flask plus renderer start without Conda, OpenRouter, or GPT-SoVITS.
