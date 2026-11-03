#!/usr/bin/env python3
"""Generate responsive WebP variants for the heaviest bundled photos.

Originals in src/assets are NOT modified or deleted (gallery, lightbox, admin
and JSON-LD still reference them). Variants are written to
src/assets/optimized/<name>-<width>w.webp and wired up in
src/lib/responsive-images.ts. Re-run after adding or replacing a source photo:

    python3 scripts/optimize-images.py        # needs Pillow

Widths never exceed the source width (no upscaling).
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets"
OUT = SRC / "optimized"

DEFAULT = (480, 800, 1080)
JOBS = {
    # LCP image on mobile: phones are ~390 CSS px wide at 2-3x DPR.
    "entrance-banana-leaves.jpg": (480, 800, 1080, 1600),
    "pavilion-wide.jpg": DEFAULT,
    "craft-detail.jpg": DEFAULT,
    "culture-drums.jpg": DEFAULT,
    "garden-zebra-signpost.jpg": DEFAULT,
    "garden-umbrella-dining.jpg": DEFAULT,
    "feast-platter-mixed.jpg": DEFAULT,
    "sadza-greens-platter.jpg": DEFAULT,
    "pork-sizzler.jpg": (480,),
    "fire-nyama-choma.jpg": (480, 800),
    "grilled-ribs-on-grill.jpg": DEFAULT,
    "traditional-drink-pouring.webp": (1920,),  # landscape source cropped to 4:5 -> needs height
    # Shown at <=42vh (intro) / small footer mark.
    "logo-full.png": (512,),
    # Header mark is rendered at 32-40 CSS px.
    "logo-mark.png": (128,),
    # Faint (6% opacity) review-section watermark.
    "logo-mark-transparent.png": (320,),
    "chicken-on-grate-closeup-1600w.webp": (480, 800),
}
QUALITY = 74

OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob("*.webp"):
    old.unlink()  # regenerate cleanly so removed widths do not linger
for name, widths in JOBS.items():
    im = Image.open(SRC / name)
    stem = Path(name).stem
    has_alpha = im.mode in ("RGBA", "LA", "P")
    im = im.convert("RGBA" if has_alpha else "RGB")
    for w in widths:
        w = min(w, im.width)
        h = round(im.height * w / im.width)
        out = OUT / f"{stem}-{w}w.webp"
        im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
        print(f"{out.name:48} {w}x{h} {out.stat().st_size/1024:7.1f} KB (orig {(SRC/name).stat().st_size/1024:.0f} KB)")
