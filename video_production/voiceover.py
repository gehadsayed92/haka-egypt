"""
Cilantro Egypt — Executive MBR Video
Voiceover module: generates MP3 per scene using gTTS.
"""

import os
import subprocess
import tempfile

OUT = os.path.join(os.path.dirname(__file__), "output", "audio")
os.makedirs(OUT, exist_ok=True)

try:
    from imageio_ffmpeg import get_ffmpeg_exe as _get_ffmpeg
    _FFMPEG = _get_ffmpeg()
except Exception:
    _FFMPEG = "ffmpeg"

# ── Scripts ───────────────────────────────────────────────────────────────────

SCRIPTS = {
    "01": (
        "Good morning. This presentation covers Cilantro Egypt's performance "
        "for February 2026, prepared for the Chairman and Chief Executive Officer. "
        "We will walk through revenue, gross profit, branch performance, product mix, "
        "customer traffic, operating costs, and close with our executive scorecard."
    ),
    "02": (
        "Revenue for February reached 26.3 million Egyptian pounds — "
        "5.2 percent above budget, and nearly 16 percent ahead of last year. "
        "The six-month trend shows consistent outperformance against both budget "
        "and the prior year, with December being the strongest month at 28.1 million. "
        "Year-to-date, we have accumulated 142.3 million pounds, "
        "3.8 percent ahead of plan."
    ),
    "03": (
        "Gross profit in February was 10.9 million pounds, with a margin of 41.6 percent — "
        "slightly below our 42 percent budget target, but 50 basis points higher than last year. "
        "The margin compression versus budget is driven by a modest increase in raw material costs, "
        "which we are actively managing through supplier renegotiations. "
        "The overall GP trajectory remains healthy and on an upward path."
    ),
    "04": (
        "Looking at branch performance, City Stars leads the portfolio at 3.4 million pounds, "
        "followed by Maadi and New Cairo. "
        "All eight branches reported revenue above both budget and last year. "
        "City Stars, Maadi, and New Cairo each delivered over 3 percent outperformance versus plan. "
        "Nasr City, our newest location, is tracking in line with ramp-up projections."
    ),
    "05": (
        "Hot beverages remain our core category at 38 percent of revenue, "
        "followed by cold beverages at 27 percent and food items at 22 percent. "
        "Desserts and cakes contribute 10 percent. "
        "Retail and merchandise accounts for the remaining 3 percent. "
        "The food and cold beverage categories continue to grow share "
        "as part of our daypart diversification strategy."
    ),
    "06": (
        "Customer transactions in February reached 96,800 — "
        "2.7 percent above budget and 14.6 percent higher than last year. "
        "The average ticket held steady at 272 Egyptian pounds, "
        "reflecting stable pricing and consistent upsell execution. "
        "Transaction growth is the primary driver of our revenue outperformance."
    ),
    "07": (
        "Our total cost structure stands at 94.4 percent of revenue in February. "
        "Cost of goods sold at 58.4 percent is 40 basis points below budget — "
        "a positive indicator. "
        "Labor at 16.2 percent is 30 basis points above plan due to higher traffic volumes. "
        "Rent and utilities remain in line. "
        "The implied gross profit of 41.6 percent is within our target range."
    ),
    "08": (
        "To summarise. Cilantro Egypt delivered a strong February performance. "
        "Revenue beat budget by 5.2 percent. Gross profit exceeded plan by 4.1 percent. "
        "Customer transactions grew 14.6 percent year-on-year. "
        "The business is on track to achieve full-year targets. "
        "Key focus areas for March include margin recovery through procurement efficiency, "
        "and accelerating food attachment rates across all branches. "
        "Thank you."
    ),
}


def generate_voiceovers():
    """Generate MP3 voiceovers using espeak-ng (offline, no network required)."""
    paths = {}
    for scene_id, script in SCRIPTS.items():
        mp3_path = os.path.join(OUT, f"vo_{scene_id}.mp3")
        print(f"  Generating voiceover {scene_id}…", end=" ", flush=True)

        # espeak-ng → WAV → MP3 via ffmpeg
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wav_path = tmp.name

        try:
            subprocess.run(
                ["espeak-ng",
                 "-v", "en-us",       # US English voice
                 "-s", "145",          # words per minute (slower = clearer)
                 "-p", "42",           # pitch
                 "-a", "160",          # amplitude
                 "-w", wav_path,
                 script],
                check=True,
                capture_output=True,
            )
            subprocess.run(
                [_FFMPEG, "-y",
                 "-i", wav_path,
                 "-codec:a", "libmp3lame",
                 "-b:a", "128k",
                 mp3_path],
                check=True,
                capture_output=True,
            )
        finally:
            if os.path.exists(wav_path):
                os.unlink(wav_path)

        paths[scene_id] = mp3_path
        print("done")
    return paths


if __name__ == "__main__":
    generate_voiceovers()
