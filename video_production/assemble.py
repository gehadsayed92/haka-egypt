"""
Cilantro Egypt — Executive MBR Video
Assembly module: combines scene PNGs + voiceover MP3s into MP4 clips,
then concatenates into a single final video using MoviePy.
"""

import os
import sys
import subprocess
from pathlib import Path

import numpy as np
from moviepy import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    CompositeAudioClip,
    AudioArrayClip,
)
from moviepy.video.fx import FadeIn, FadeOut

# ── Locate bundled ffmpeg from imageio_ffmpeg ─────────────────────────────────
try:
    from imageio_ffmpeg import get_ffmpeg_exe
    FFMPEG = get_ffmpeg_exe()
    os.environ["IMAGEIO_FFMPEG_EXE"] = FFMPEG
except Exception:
    FFMPEG = "ffmpeg"

BASE   = os.path.dirname(__file__)
SCENES = os.path.join(BASE, "output", "scenes")
AUDIO  = os.path.join(BASE, "output", "audio")
CLIPS  = os.path.join(BASE, "output", "clips")
FINAL  = os.path.join(BASE, "output")
os.makedirs(CLIPS, exist_ok=True)

# Minimum screen time per scene (seconds) — extended if VO is longer
MIN_DURATIONS = {
    "01": 22, "02": 42, "03": 42, "04": 40,
    "05": 38, "06": 38, "07": 38, "08": 34,
}

FADE_DURATION  = 0.3   # seconds — subtle fade in/out
VIDEO_FPS      = 24
MUSIC_VOLUME   = 0.06  # very low background track


def make_silent_music(duration: float, sample_rate: int = 44100) -> AudioArrayClip:
    """Generate a very quiet synthetic pad (low-amplitude pink-ish noise)."""
    n   = int(duration * sample_rate)
    t   = np.linspace(0, duration, n)
    # Soft pad: mix of slow sine waves at low amplitude
    pad = (
        0.3 * np.sin(2 * np.pi * 55  * t)   # bass
      + 0.2 * np.sin(2 * np.pi * 110 * t)   # low mid
      + 0.1 * np.sin(2 * np.pi * 220 * t)   # mid
    )
    # Gentle fade-in and out
    fade = min(3, duration / 4)
    samples_fade = int(fade * sample_rate)
    env = np.ones(n)
    env[:samples_fade]  = np.linspace(0, 1, samples_fade)
    env[-samples_fade:] = np.linspace(1, 0, samples_fade)
    pad *= env * MUSIC_VOLUME
    stereo = np.stack([pad, pad], axis=1).astype(np.float32)
    return AudioArrayClip(stereo, fps=sample_rate)


def build_scene_clip(scene_id: str) -> str:
    img_path = os.path.join(SCENES, f"scene_{scene_id}_*.png")
    # Find matching file
    matched = sorted(Path(SCENES).glob(f"scene_{scene_id}_*.png"))
    if not matched:
        raise FileNotFoundError(f"No image found for scene {scene_id}")
    img_path = str(matched[0])

    vo_path  = os.path.join(AUDIO, f"vo_{scene_id}.mp3")
    out_path = os.path.join(CLIPS, f"clip_{scene_id}.mp4")

    # Load voiceover
    vo   = AudioFileClip(vo_path)
    dur  = max(MIN_DURATIONS.get(scene_id, 35), vo.duration + 1.5)

    # Build music bed for this duration
    music = make_silent_music(dur)
    music = music.with_volume_scaled(1.0)  # already scaled in generation

    # Composite audio: VO + music
    combined_audio = CompositeAudioClip([
        vo.with_start(1.0),      # 1s lead-in before VO starts
        music,
    ])

    # Image clip with fade effects (MoviePy v2 API)
    clip = (
        ImageClip(img_path)
        .with_duration(dur)
        .with_fps(VIDEO_FPS)
        .with_audio(combined_audio)
        .with_effects([FadeIn(FADE_DURATION), FadeOut(FADE_DURATION)])
    )

    clip.write_videofile(
        out_path,
        fps=VIDEO_FPS,
        codec="libx264",
        audio_codec="aac",
        logger=None,
        ffmpeg_params=["-crf", "20", "-preset", "fast"],
    )
    clip.close()
    vo.close()
    return out_path


def build_final_video(clip_paths: list[str]) -> str:
    out_path = os.path.join(FINAL, "cilantro_executive_video.mp4")
    clips    = [ImageClip(c) if c.endswith(".png") else __import__("moviepy").VideoFileClip(c)
                for c in clip_paths]

    # Re-open as VideoFileClip
    from moviepy import VideoFileClip
    vclips = [VideoFileClip(p) for p in clip_paths]

    final = concatenate_videoclips(vclips, method="compose")
    final.write_videofile(
        out_path,
        fps=VIDEO_FPS,
        codec="libx264",
        audio_codec="aac",
        logger=None,
        ffmpeg_params=["-crf", "20", "-preset", "fast"],
    )
    final.close()
    for c in vclips:
        c.close()
    return out_path


def assemble():
    scene_ids = ["01", "02", "03", "04", "05", "06", "07", "08"]
    clip_paths = []
    for sid in scene_ids:
        print(f"  Assembling scene {sid}…", end=" ", flush=True)
        path = build_scene_clip(sid)
        clip_paths.append(path)
        print("done")

    print("  Concatenating final video…", end=" ", flush=True)
    final = build_final_video(clip_paths)
    print("done")
    return final, clip_paths


if __name__ == "__main__":
    assemble()
