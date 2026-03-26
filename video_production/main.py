#!/usr/bin/env python3
"""
Cilantro Egypt — Executive MBR Video Producer
=============================================
Usage:
    python main.py            # full pipeline
    python main.py --scenes   # render scenes only
    python main.py --vo       # voiceovers only
    python main.py --assemble # assemble (requires scenes + vo)
"""

import sys
import time
import os

# Ensure bundled ffmpeg is used
try:
    from imageio_ffmpeg import get_ffmpeg_exe
    os.environ["IMAGEIO_FFMPEG_EXE"] = get_ffmpeg_exe()
except Exception:
    pass


def banner(msg: str):
    print(f"\n{'─' * 60}")
    print(f"  {msg}")
    print(f"{'─' * 60}")


def run_scenes():
    banner("STEP 1 — Rendering Scenes (1920×1080 PNGs)")
    from scenes import generate_all
    paths = generate_all()
    print(f"\n  ✓ {len(paths)} scenes rendered to output/scenes/")
    return paths


def run_voiceovers():
    banner("STEP 2 — Generating Voiceovers (gTTS MP3)")
    from voiceover import generate_voiceovers
    paths = generate_voiceovers()
    print(f"\n  ✓ {len(paths)} audio files written to output/audio/")
    return paths


def run_assembly():
    banner("STEP 3 — Assembling Video (MoviePy + FFmpeg)")
    from assemble import assemble
    final, clips = assemble()
    print(f"\n  ✓ {len(clips)} scene clips written to output/clips/")
    print(f"  ✓ Final video: {final}")
    return final, clips


def main():
    args = set(sys.argv[1:])
    t0   = time.time()

    do_scenes   = "--scenes"   in args or not args
    do_vo       = "--vo"       in args or not args
    do_assemble = "--assemble" in args or not args

    print("\n" + "=" * 60)
    print("  Cilantro Egypt — Executive MBR Video Producer")
    print("=" * 60)

    if do_scenes:
        run_scenes()
    if do_vo:
        run_voiceovers()
    if do_assemble:
        final, _ = run_assembly()

    elapsed = time.time() - t0
    banner(f"COMPLETE  ({elapsed:.0f}s)")
    if do_assemble:
        size_mb = os.path.getsize(final) / 1_048_576
        print(f"  Output : {final}")
        print(f"  Size   : {size_mb:.1f} MB")
    print()


if __name__ == "__main__":
    main()
