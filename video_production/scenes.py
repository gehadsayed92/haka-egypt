"""
Cilantro Egypt — Executive MBR Video
Scene generators: each function returns a saved PNG path (1920×1080).
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
from matplotlib import font_manager
from PIL import Image, ImageDraw, ImageFont

from data import (
    GREEN, GOLD, GREY, WHITE, BLACK, LIGHT,
    REPORT_PERIOD, COMPANY_NAME, SUBTITLE,
    MONTHS, REVENUE, GROSS_PROFIT, BRANCHES,
    PRODUCT_MIX, TRAFFIC, OPEX, KPI_SCORECARD,
)

OUT = os.path.join(os.path.dirname(__file__), "output", "scenes")
os.makedirs(OUT, exist_ok=True)

W, H = 1920, 1080
DPI  = 100
FW, FH = W / DPI, H / DPI   # figure size in inches

# ── Shared style helpers ───────────────────────────────────────────────────────

def apply_base_style():
    plt.rcParams.update({
        "figure.facecolor":   WHITE,
        "axes.facecolor":     WHITE,
        "axes.edgecolor":     "#DDDDDD",
        "axes.spines.top":    False,
        "axes.spines.right":  False,
        "axes.spines.left":   False,
        "axes.spines.bottom": True,
        "axes.grid":          True,
        "axes.grid.axis":     "y",
        "grid.color":         "#EEEEEE",
        "grid.linewidth":     0.8,
        "font.family":        "DejaVu Sans",
        "font.size":          13,
        "text.color":         BLACK,
        "xtick.color":        BLACK,
        "ytick.color":        BLACK,
        "xtick.bottom":       False,
        "ytick.left":         False,
    })


def add_header(fig, title, subtitle=""):
    """Top-left title block + right-side company branding."""
    fig.text(0.04, 0.93, title, fontsize=26, fontweight="bold", color=BLACK,
             transform=fig.transFigure, va="top")
    if subtitle:
        fig.text(0.04, 0.88, subtitle, fontsize=14, color=GREY,
                 transform=fig.transFigure, va="top")
    # right brand tag
    fig.text(0.96, 0.96, COMPANY_NAME, fontsize=14, color=GREEN,
             fontweight="bold", ha="right", transform=fig.transFigure, va="top")
    fig.text(0.96, 0.92, REPORT_PERIOD, fontsize=12, color=GREY,
             ha="right", transform=fig.transFigure, va="top")
    # divider line
    line = plt.Line2D([0.04, 0.96], [0.865, 0.865],
                      transform=fig.transFigure, color="#DDDDDD", linewidth=1)
    fig.add_artist(line)


def add_legend(ax, labels, colors, loc="upper right"):
    handles = [mpatches.Patch(color=c, label=l) for c, l in zip(colors, labels)]
    ax.legend(handles=handles, loc=loc, frameon=False, fontsize=12,
              handlelength=1.2, handleheight=0.9)


def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=DPI, bbox_inches="tight", facecolor=WHITE)
    plt.close(fig)
    return path


# ── Scene 1 — Title Card ──────────────────────────────────────────────────────

def scene_01_title():
    img = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    # Green accent bar (left edge)
    draw.rectangle([0, 0, 12, H], fill=GREEN)

    # Centre content
    cx = W // 2

    # Company wordmark box
    draw.rectangle([cx - 260, 300, cx + 260, 400],
                   fill=GREEN, outline=GREEN)

    # Try to load a system font; fall back to default
    try:
        font_xl  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_lg  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_md  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      34)
        font_sm  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      26)
    except Exception:
        font_xl = font_lg = font_md = font_sm = ImageFont.load_default()

    # Company name inside green box
    draw.text((cx, 350), COMPANY_NAME, font=font_lg, fill=WHITE, anchor="mm")

    # Report title
    draw.text((cx, 490), SUBTITLE, font=font_xl, fill=BLACK, anchor="mm")

    # Period
    draw.text((cx, 600), REPORT_PERIOD, font=font_md, fill=GREY, anchor="mm")

    # Tagline
    draw.text((cx, 680),
              "Prepared for the Office of the Chairman & CEO",
              font=font_sm, fill=GREY, anchor="mm")

    # Bottom rule
    draw.rectangle([80, 750, W - 80, 753], fill=GREEN)

    # Bottom footnote
    draw.text((cx, 790),
              "STRICTLY CONFIDENTIAL  |  Internal Use Only",
              font=font_sm, fill=GREY, anchor="mm")

    path = os.path.join(OUT, "scene_01_title.png")
    img.save(path, dpi=(DPI, DPI))
    return path


# ── Scene 2 — Revenue Performance ────────────────────────────────────────────

def scene_02_revenue():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Revenue Performance", f"6-Month Trend  |  EGP Millions  |  {REPORT_PERIOD}")

    ax = fig.add_axes([0.06, 0.12, 0.56, 0.68])

    x     = np.arange(len(MONTHS))
    width = 0.26

    b1 = ax.bar(x - width, REVENUE["ly"],     width, color=GREY,  label="LY",     alpha=0.85, zorder=3)
    b2 = ax.bar(x,          REVENUE["budget"], width, color=GOLD,  label="Budget", alpha=0.85, zorder=3)
    b3 = ax.bar(x + width,  REVENUE["actual"], width, color=GREEN, label="Actual", alpha=0.95, zorder=3)

    ax.set_xticks(x)
    ax.set_xticklabels(MONTHS, fontsize=13)
    ax.set_ylabel("EGP Millions", fontsize=12, color=GREY)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"{v:.0f}"))

    # value labels on Actual bars
    for bar in b3:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                f"{bar.get_height():.1f}", ha="center", va="bottom",
                fontsize=11, fontweight="bold", color=GREEN)

    add_legend(ax, ["LY", "Budget", "Actual"], [GREY, GOLD, GREEN])
    ax.set_ylim(0, max(REVENUE["actual"]) * 1.22)

    # ── KPI sidebar ──────────────────────────────────────────────────────────
    latest_act = REVENUE["actual"][-1]
    latest_bgt = REVENUE["budget"][-1]
    latest_ly  = REVENUE["ly"][-1]
    vs_bgt = (latest_act - latest_bgt) / latest_bgt * 100
    vs_ly  = (latest_act - latest_ly)  / latest_ly  * 100

    kpis = [
        ("Feb Actual",   f"EGP {latest_act:.1f}M",     BLACK),
        ("vs Budget",    f"{vs_bgt:+.1f}%",            GREEN if vs_bgt >= 0 else "#CC3333"),
        ("vs LY",        f"{vs_ly:+.1f}%",             GREEN if vs_ly  >= 0 else "#CC3333"),
        ("YTD Actual",   f"EGP {sum(REVENUE['actual']):.1f}M",  BLACK),
        ("YTD vs Bgt",
         f"{(sum(REVENUE['actual'])-sum(REVENUE['budget']))/sum(REVENUE['budget'])*100:+.1f}%",
         GREEN),
    ]
    by = 0.78
    for label, value, color in kpis:
        fig.text(0.69, by, label, fontsize=12, color=GREY)
        fig.text(0.69, by - 0.04, value, fontsize=19, fontweight="bold", color=color)
        by -= 0.13

    path = save(fig, "scene_02_revenue.png")
    return path


# ── Scene 3 — Gross Profit & Margin ──────────────────────────────────────────

def scene_03_gross_profit():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Gross Profit & Margin", f"6-Month Trend  |  EGP Millions  |  {REPORT_PERIOD}")

    ax1 = fig.add_axes([0.06, 0.12, 0.56, 0.68])
    ax2 = ax1.twinx()

    x     = np.arange(len(MONTHS))
    width = 0.26

    ax1.bar(x - width, GROSS_PROFIT["ly"],     width, color=GREY,  alpha=0.85, label="GP LY",     zorder=3)
    ax1.bar(x,          GROSS_PROFIT["budget"], width, color=GOLD,  alpha=0.85, label="GP Budget", zorder=3)
    b3 = ax1.bar(x + width, GROSS_PROFIT["actual"], width, color=GREEN, alpha=0.95, label="GP Actual", zorder=3)

    ax2.plot(x + width, GROSS_PROFIT["gp_pct_actual"], color=GREEN,
             marker="o", linewidth=2.5, markersize=7, label="GP% Actual", zorder=5)
    ax2.plot(x + width, GROSS_PROFIT["gp_pct_budget"], color=GOLD,
             marker="s", linewidth=1.5, markersize=6, linestyle="--", label="GP% Budget", zorder=4)

    for bar in b3:
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.15,
                 f"{bar.get_height():.1f}", ha="center", va="bottom",
                 fontsize=11, fontweight="bold", color=GREEN)

    ax1.set_xticks(x)
    ax1.set_xticklabels(MONTHS, fontsize=13)
    ax1.set_ylabel("EGP Millions", fontsize=12, color=GREY)
    ax2.set_ylabel("GP Margin %", fontsize=12, color=GREY)
    ax2.set_ylim(38, 45)
    ax2.spines["right"].set_visible(True)
    ax2.spines["right"].set_color("#DDDDDD")
    ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"{v:.0f}%"))
    ax1.set_ylim(0, max(GROSS_PROFIT["actual"]) * 1.3)

    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, loc="upper left", frameon=False, fontsize=11)

    # sidebar
    gp_act = GROSS_PROFIT["actual"][-1]
    gp_bgt = GROSS_PROFIT["budget"][-1]
    gp_pct = GROSS_PROFIT["gp_pct_actual"][-1]
    vs_bgt = (gp_act - gp_bgt) / gp_bgt * 100

    kpis = [
        ("Feb GP Actual",  f"EGP {gp_act:.1f}M", BLACK),
        ("vs Budget",      f"{vs_bgt:+.1f}%",    GREEN if vs_bgt >= 0 else "#CC3333"),
        ("GP Margin",      f"{gp_pct:.1f}%",      BLACK),
        ("Budget Margin",  f"{GROSS_PROFIT['gp_pct_budget'][-1]:.1f}%", GOLD),
    ]
    by = 0.78
    for label, value, color in kpis:
        fig.text(0.69, by, label, fontsize=12, color=GREY)
        fig.text(0.69, by - 0.04, value, fontsize=19, fontweight="bold", color=color)
        by -= 0.14

    return save(fig, "scene_03_gross_profit.png")


# ── Scene 4 — Branch Performance ─────────────────────────────────────────────

def scene_04_branches():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Branch Performance", f"Revenue by Location  |  EGP Millions  |  {REPORT_PERIOD}")

    ax = fig.add_axes([0.06, 0.10, 0.70, 0.70])

    names  = BRANCHES["names"]
    act    = BRANCHES["actual"]
    bgt    = BRANCHES["budget"]
    ly     = BRANCHES["ly"]
    y      = np.arange(len(names))
    height = 0.26

    ax.barh(y - height, ly,  height, color=GREY,  alpha=0.85, label="LY")
    ax.barh(y,           bgt, height, color=GOLD,  alpha=0.85, label="Budget")
    ax.barh(y + height,  act, height, color=GREEN, alpha=0.95, label="Actual")

    for i, (a, b) in enumerate(zip(act, bgt)):
        delta = (a - b) / b * 100
        color = GREEN if delta >= 0 else "#CC3333"
        ax.text(a + 0.06, y[i] + height, f"{delta:+.1f}%",
                va="center", fontsize=11, color=color, fontweight="bold")

    ax.set_yticks(y)
    ax.set_yticklabels(names, fontsize=13)
    ax.set_xlabel("EGP Millions", fontsize=12, color=GREY)
    ax.invert_yaxis()
    ax.set_xlim(0, max(act) * 1.35)
    ax.grid(axis="x")
    ax.grid(axis="y", visible=False)
    ax.spines["bottom"].set_visible(True)
    ax.spines["left"].set_visible(False)
    add_legend(ax, ["LY", "Budget", "Actual"], [GREY, GOLD, GREEN], loc="lower right")

    return save(fig, "scene_04_branches.png")


# ── Scene 5 — Product Mix ─────────────────────────────────────────────────────

def scene_05_product_mix():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Product Mix", f"Revenue Contribution by Category  |  {REPORT_PERIOD}")

    # Donut chart
    ax = fig.add_axes([0.08, 0.12, 0.44, 0.70])

    labels  = PRODUCT_MIX["labels"]
    values  = PRODUCT_MIX["values"]
    colors  = PRODUCT_MIX["colors"]
    explode = [0.03] * len(labels)

    wedges, texts, autotexts = ax.pie(
        values, labels=None, colors=colors, explode=explode,
        autopct="%1.0f%%", startangle=90, pctdistance=0.78,
        wedgeprops={"linewidth": 1.5, "edgecolor": WHITE},
    )
    for at in autotexts:
        at.set_fontsize(13)
        at.set_fontweight("bold")
        at.set_color(WHITE)

    # Centre hole
    centre_circle = plt.Circle((0, 0), 0.52, color=WHITE)
    ax.add_patch(centre_circle)
    ax.text(0, 0.06, "Revenue", ha="center", va="center",
            fontsize=13, color=GREY)
    ax.text(0, -0.10, "Mix", ha="center", va="center",
            fontsize=13, color=GREY)

    # Legend
    handles = [mpatches.Patch(color=c, label=f"{l}  {v}%")
               for c, l, v in zip(colors, labels, values)]
    ax.legend(handles=handles, loc="lower center",
              bbox_to_anchor=(0.5, -0.12), ncol=2,
              frameon=False, fontsize=12)

    # Bar chart alongside
    ax2 = fig.add_axes([0.58, 0.20, 0.32, 0.55])
    y   = np.arange(len(labels))
    ax2.barh(y, values, color=colors, alpha=0.9)
    ax2.set_yticks(y)
    ax2.set_yticklabels(labels, fontsize=12)
    ax2.set_xlabel("% of Revenue", fontsize=11, color=GREY)
    ax2.invert_yaxis()
    ax2.set_xlim(0, max(values) * 1.3)
    ax2.spines["bottom"].set_visible(True)
    ax2.spines["left"].set_visible(False)
    ax2.grid(axis="x")
    ax2.grid(axis="y", visible=False)
    for i, v in enumerate(values):
        ax2.text(v + 0.5, i, f"{v}%", va="center", fontsize=12,
                 fontweight="bold", color=colors[i])

    return save(fig, "scene_05_product_mix.png")


# ── Scene 6 — Customer Traffic & Avg Ticket ──────────────────────────────────

def scene_06_traffic():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Customer Traffic & Average Ticket",
               f"Monthly Trend  |  {REPORT_PERIOD}")

    ax1 = fig.add_axes([0.07, 0.12, 0.56, 0.68])
    ax2 = ax1.twinx()

    x = np.arange(len(MONTHS))

    bars = ax1.bar(x, TRAFFIC["transactions"], color=GREEN, alpha=0.7,
                   label="Transactions", zorder=3, width=0.5)
    line = ax2.plot(x, TRAFFIC["avg_ticket"], color=GOLD, marker="o",
                    linewidth=2.5, markersize=8, label="Avg Ticket (EGP)", zorder=5)

    for bar in bars:
        ax1.text(bar.get_x() + bar.get_width() / 2,
                 bar.get_height() + 800,
                 f"{int(bar.get_height()):,}",
                 ha="center", va="bottom", fontsize=10.5,
                 fontweight="bold", color=GREEN)

    for xi, yi in zip(x, TRAFFIC["avg_ticket"]):
        ax2.text(xi, yi + 0.8, f"EGP {yi}", ha="center",
                 va="bottom", fontsize=10.5, color=GOLD, fontweight="bold")

    ax1.set_xticks(x)
    ax1.set_xticklabels(MONTHS, fontsize=13)
    ax1.set_ylabel("Transactions", fontsize=12, color=GREY)
    ax2.set_ylabel("Avg Ticket (EGP)", fontsize=12, color=GREY)
    ax2.spines["right"].set_visible(True)
    ax2.spines["right"].set_color("#DDDDDD")
    ax1.set_ylim(0, max(TRAFFIC["transactions"]) * 1.2)
    ax2.set_ylim(260, 280)

    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, loc="upper left", frameon=False, fontsize=12)

    # sidebar
    trx = TRAFFIC["transactions"][-1]
    tkt = TRAFFIC["avg_ticket"][-1]
    kpis = [
        ("Feb Transactions", f"{trx:,}",    BLACK),
        ("vs Prior Month",
         f"{(trx - TRAFFIC['transactions'][-2]) / TRAFFIC['transactions'][-2] * 100:+.1f}%",
         GREEN),
        ("Avg Ticket",  f"EGP {tkt}",      BLACK),
        ("vs Prior Month",
         f"{(tkt - TRAFFIC['avg_ticket'][-2]) / TRAFFIC['avg_ticket'][-2] * 100:+.1f}%",
         GREY),
    ]
    by = 0.78
    for label, value, color in kpis:
        fig.text(0.70, by, label, fontsize=12, color=GREY)
        fig.text(0.70, by - 0.04, value, fontsize=19, fontweight="bold", color=color)
        by -= 0.14

    return save(fig, "scene_06_traffic.png")


# ── Scene 7 — Operating Cost Structure ────────────────────────────────────────

def scene_07_opex():
    apply_base_style()
    fig = plt.figure(figsize=(FW, FH))
    add_header(fig, "Operating Cost Structure",
               f"% of Revenue  |  {REPORT_PERIOD}")

    ax = fig.add_axes([0.07, 0.10, 0.58, 0.68])

    cats   = OPEX["categories"]
    actual = OPEX["actual"]
    budget = OPEX["budget"]
    y      = np.arange(len(cats))
    width  = 0.32

    ax.barh(y - width / 2, budget, width, color=GOLD,  alpha=0.85, label="Budget")
    ax.barh(y + width / 2, actual, width, color=GREEN, alpha=0.95, label="Actual")

    for i, (a, b) in enumerate(zip(actual, budget)):
        delta = a - b
        color = "#CC3333" if delta > 0 else GREEN
        ax.text(a + 0.3, y[i] + width / 2,
                f"{delta:+.1f} pp",
                va="center", fontsize=11, color=color, fontweight="bold")

    ax.set_yticks(y)
    ax.set_yticklabels(cats, fontsize=13)
    ax.set_xlabel("% of Revenue", fontsize=12, color=GREY)
    ax.invert_yaxis()
    ax.set_xlim(0, max(actual) * 1.25)
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda v, _: f"{v:.0f}%"))
    ax.grid(axis="x")
    ax.grid(axis="y", visible=False)
    ax.spines["left"].set_visible(False)
    add_legend(ax, ["Budget", "Actual"], [GOLD, GREEN], loc="lower right")

    # Waterfall summary right side
    total_act = sum(actual)
    total_bgt = sum(budget)
    fig.text(0.72, 0.76, "Total Cost",   fontsize=12, color=GREY)
    fig.text(0.72, 0.72, f"{total_act:.1f}% of Rev", fontsize=19,
             fontweight="bold", color=BLACK)
    fig.text(0.72, 0.64, "vs Budget",   fontsize=12, color=GREY)
    delta_total = total_act - total_bgt
    color = "#CC3333" if delta_total > 0 else GREEN
    fig.text(0.72, 0.60, f"{delta_total:+.1f} pp", fontsize=19,
             fontweight="bold", color=color)
    fig.text(0.72, 0.52, "Implied GP%", fontsize=12, color=GREY)
    fig.text(0.72, 0.48, f"{100 - total_act:.1f}%", fontsize=19,
             fontweight="bold", color=GREEN)

    return save(fig, "scene_07_opex.png")


# ── Scene 8 — KPI Scorecard ───────────────────────────────────────────────────

def scene_08_scorecard():
    img  = Image.new("RGB", (W, H), WHITE)
    draw = ImageDraw.Draw(img)

    try:
        font_hdr  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_sub  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      28)
        font_cell = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      24)
        font_val  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
        font_ico  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",      30)
    except Exception:
        font_hdr = font_sub = font_cell = font_val = font_ico = ImageFont.load_default()

    # Header
    draw.rectangle([0, 0, 12, H], fill=GREEN)
    draw.text((80, 60),  "Executive KPI Scorecard", font=font_hdr, fill=BLACK)
    draw.text((80, 130), f"{REPORT_PERIOD}  |  {COMPANY_NAME}", font=font_sub, fill=GREY)
    draw.rectangle([80, 175, W - 80, 178], fill="#DDDDDD")

    # Brand
    draw.text((W - 80, 80), COMPANY_NAME, font=font_sub, fill=GREEN,
              anchor="ra")

    # Table header
    col_x = [80, 380, 640, 880, 1160, 1500]
    headers = ["KPI", "Feb Actual", "vs Budget", "vs LY", "Status"]
    row_y = 210
    draw.rectangle([col_x[0] - 10, row_y - 8,
                    W - 80,        row_y + 48], fill=GREEN)
    for i, h in enumerate(headers):
        draw.text((col_x[i], row_y + 10), h, font=font_val, fill=WHITE)

    row_y += 70
    for idx, row in enumerate(KPI_SCORECARD):
        bg = LIGHT if idx % 2 == 0 else WHITE
        draw.rectangle([col_x[0] - 10, row_y - 8,
                        W - 80,        row_y + 48], fill=bg)

        kpi, actual, vs_bgt, vs_ly, status = row
        draw.text((col_x[0], row_y + 8), kpi,     font=font_cell, fill=BLACK)
        draw.text((col_x[1], row_y + 8), actual,  font=font_val,  fill=BLACK)

        bgt_color = (45, 106, 79) if "+" in vs_bgt else (180, 40, 40)
        draw.text((col_x[2], row_y + 8), vs_bgt,  font=font_val,  fill=bgt_color)

        ly_color  = (45, 106, 79) if "+" in vs_ly  else (180, 40, 40)
        draw.text((col_x[3], row_y + 8), vs_ly,   font=font_val,  fill=ly_color)

        s_color   = (45, 106, 79) if status == "✓" else (140, 140, 0)
        draw.text((col_x[4], row_y + 8), status,  font=font_ico,  fill=s_color)

        row_y += 64

    # Footer
    draw.rectangle([80, row_y + 20, W - 80, row_y + 23], fill="#DDDDDD")
    draw.text((W // 2, row_y + 50),
              "Data sourced from internal MBR systems  |  Confidential",
              font=font_sub, fill=GREY, anchor="mm")

    path = os.path.join(OUT, "scene_08_scorecard.png")
    img.save(path, dpi=(DPI, DPI))
    return path


# ── Generate all ──────────────────────────────────────────────────────────────

def generate_all():
    scenes = [
        ("01", scene_01_title),
        ("02", scene_02_revenue),
        ("03", scene_03_gross_profit),
        ("04", scene_04_branches),
        ("05", scene_05_product_mix),
        ("06", scene_06_traffic),
        ("07", scene_07_opex),
        ("08", scene_08_scorecard),
    ]
    paths = []
    for num, fn in scenes:
        print(f"  Rendering scene {num}…", end=" ", flush=True)
        p = fn()
        paths.append(p)
        print("done")
    return paths


if __name__ == "__main__":
    generate_all()
