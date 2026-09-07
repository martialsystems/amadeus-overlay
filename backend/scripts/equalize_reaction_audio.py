#!/usr/bin/env python3
"""Match English and Japanese reaction WAVs to the Kurisu reference level."""

from __future__ import annotations

import math
import sys
import wave
from array import array
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REF_WAV = BACKEND_DIR / "assets" / "reference_audio" / "kurisu10s.wav"
AUDIO_DIR = BACKEND_DIR / "assets" / "reaction_audio"
JA_DIR = AUDIO_DIR / "ja"

GATE = 0.02
PEAK_LIMIT = 0.89
TOLERANCE_DB = 2.0


def load_wav(path: Path) -> tuple[int, int, int, list[float]]:
    with wave.open(str(path), "rb") as handle:
        channels, sample_width, rate, frames, _, _ = handle.getparams()
        raw = handle.readframes(frames)
    if sample_width == 2:
        samples = array("h")
        samples.frombytes(raw)
        scale = 32768.0
    else:
        raise ValueError(f"{path} must be 16-bit PCM, got sampwidth={sample_width}")
    floats = [sample / scale for sample in samples]
    return rate, channels, sample_width, floats


def write_wav(path: Path, rate: int, channels: int, floats: list[float]) -> None:
    pcm = array(
        "h",
        [max(-32767, min(32767, int(round(sample * 32767)))) for sample in floats],
    )
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(channels)
        handle.setsampwidth(2)
        handle.setframerate(rate)
        handle.writeframes(pcm.tobytes())


def _mono(floats: list[float], channels: int) -> list[float]:
    if channels == 1:
        return floats
    return [
        sum(floats[i : i + channels]) / channels
        for i in range(0, len(floats), channels)
    ]


def peak(floats: list[float]) -> float:
    return max((abs(sample) for sample in floats), default=0.0)


def active_rms(floats: list[float], channels: int) -> float:
    mono = _mono(floats, channels)
    top = peak(mono)
    gate = max(GATE, 0.2 * top)
    active = [sample for sample in mono if abs(sample) > gate]
    if not active:
        return 0.0
    return math.sqrt(sum(sample * sample for sample in active) / len(active))


def gain_for(floats: list[float], channels: int, target: float) -> float:
    current = active_rms(floats, channels)
    if current <= 1e-8 or target <= 1e-8:
        return 1.0
    gain = target / current
    top = peak(floats)
    if top * gain > PEAK_LIMIT and top > 1e-8:
        gain = PEAK_LIMIT / top
    return gain


def apply_gain(floats: list[float], gain: float) -> list[float]:
    return [sample * gain for sample in floats]


def reaction_wavs() -> list[Path]:
    files = sorted(AUDIO_DIR.glob("kurisu_*.wav"))
    files += sorted(JA_DIR.glob("kurisu_*.wav"))
    return files


def equalize(paths: list[Path] | None = None) -> dict[str, float]:
    if not REF_WAV.is_file():
        raise SystemExit(f"Missing speaker sample: {REF_WAV}")
    _, ref_ch, _, ref = load_wav(REF_WAV)
    target = active_rms(ref, ref_ch)
    if target <= 1e-8:
        raise SystemExit(f"Reference clip has no speech above gate: {REF_WAV}")
    report: dict[str, float] = {"target": target}
    for path in paths or reaction_wavs():
        rate, channels, _width, samples = load_wav(path)
        gain = gain_for(samples, channels, target)
        write_wav(path, rate, channels, apply_gain(samples, gain))
        report[str(path.relative_to(BACKEND_DIR))] = gain
    return report


def levels() -> list[tuple[Path, float]]:
    out: list[tuple[Path, float]] = []
    for path in reaction_wavs():
        _rate, channels, _width, samples = load_wav(path)
        out.append((path, active_rms(samples, channels)))
    return out


def assert_matched(tolerance_db: float = TOLERANCE_DB) -> None:
    _, ref_ch, _, ref = load_wav(REF_WAV)
    target = active_rms(ref, ref_ch)
    rows = levels()
    if len(rows) < 20:
        raise SystemExit(f"expected at least 20 reaction WAVs, got {len(rows)}")
    en = [rms for path, rms in rows if path.parent == AUDIO_DIR]
    ja = [rms for path, rms in rows if path.parent == JA_DIR]
    if not en or not ja:
        raise SystemExit("need both English and Japanese reaction WAVs")
    max_ratio = 10 ** (tolerance_db / 20)
    for path, rms in rows:
        if rms <= 1e-8:
            raise SystemExit(f"silent after equalize: {path}")
        ratio = max(rms / target, target / rms)
        if ratio > max_ratio:
            raise SystemExit(
                f"{path.name} active RMS {rms:.4f} is more than {tolerance_db} dB from target {target:.4f}"
            )
    mean_en = sum(en) / len(en)
    mean_ja = sum(ja) / len(ja)
    band = max(mean_en / mean_ja, mean_ja / mean_en)
    if band > max_ratio:
        raise SystemExit(
            f"English/Japanese mean active RMS {mean_en:.4f}/{mean_ja:.4f} differ by more than {tolerance_db} dB"
        )


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        assert_matched()
        print("[equalize] levels match the reference clip")
        return 0
    report = equalize()
    print(f"[equalize] target active RMS {report['target']:.4f} from {REF_WAV.name}")
    for name, gain in report.items():
        if name == "target":
            continue
        print(f"[equalize] {name}: gain {gain:.3f}")
    assert_matched()
    print("[equalize] English and Japanese match the reference level")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
