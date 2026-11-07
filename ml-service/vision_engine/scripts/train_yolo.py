"""
vision_engine/scripts/train_yolo.py
────────────────────────────────────
Launch YOLOv8n training on CPU.

Usage (from project root, with .venv active):
  # Full 50-epoch training
  python vision_engine/scripts/train_yolo.py

  # 3-epoch smoke test
  python vision_engine/scripts/train_yolo.py --smoke

  # Custom config
  python vision_engine/scripts/train_yolo.py --config path/to/other.yaml

  # Validate config + dataset without training
  python vision_engine/scripts/train_yolo.py --smoke --dry-run
"""

import argparse
import sys
import time
from pathlib import Path

import torch
import yaml

# ─── Paths ───────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CFG  = PROJECT_ROOT / "vision_engine" / "configs" / "train_cpu.yaml"
SMOKE_CFG    = PROJECT_ROOT / "vision_engine" / "configs" / "train_smoke.yaml"


def load_cfg(cfg_path: Path) -> dict:
    with open(cfg_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def resolve_model_path(model_str: str) -> str:
    """Return absolute path to model weights if the file exists locally.
    Raises SystemExit if the resolved path does not exist, preventing
    Ultralytics from silently downloading weights from the internet."""
    p = Path(model_str)
    # If already absolute and exists, use directly
    if p.is_absolute():
        if not p.exists():
            sys.exit(f"[ERROR] Local model not found: {p}")
        return str(p)
    # Try relative to PROJECT_ROOT
    candidate = PROJECT_ROOT / p
    if candidate.exists():
        return str(candidate)
    # Try common sub-dirs
    for subdir in ("vision_engine/models", "models"):
        candidate = PROJECT_ROOT / subdir / p.name
        if candidate.exists():
            return str(candidate)
    sys.exit(
        f"[ERROR] Model weights '{model_str}' not found locally.\n"
        f"  Searched: {PROJECT_ROOT / p}\n"
        f"  Place yolov8n.pt in vision_engine/models/ and try again.\n"
        f"  Do NOT remove this check — it prevents accidental downloads."
    )


def verify_dataset(data_yaml: str) -> None:
    """Check data.yaml exists and split image dirs are non-empty."""
    p = Path(data_yaml)
    if not p.exists():
        sys.exit(f"[ERROR] data.yaml not found: {p}")
    with open(p, "r", encoding="utf-8") as f:
        d = yaml.safe_load(f)
    for split_key in ("train", "val", "test"):
        split_path = Path(d.get(split_key, ""))
        if not split_path.exists():
            sys.exit(f"[ERROR] {split_key} path not found: {split_path}")
        n = sum(1 for _ in split_path.iterdir())
        print(f"  [{split_key}] {n:,} images at {split_path}")


def main():
    parser = argparse.ArgumentParser(description="YOLOv8n CPU training launcher")
    parser.add_argument("--config", type=Path, default=None,
                        help="Path to training YAML config (default: train_cpu.yaml)")
    parser.add_argument("--smoke", action="store_true",
                        help="Use smoke-test config (3 epochs, imgsz=320, batch=4)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Validate config and dataset without starting training")
    args = parser.parse_args()

    # Resolve which config to use
    if args.config is not None:
        cfg_path = args.config
    elif args.smoke:
        cfg_path = SMOKE_CFG
    else:
        cfg_path = DEFAULT_CFG

    if not cfg_path.exists():
        sys.exit(f"[ERROR] Config not found: {cfg_path}")

    # ── Torch / device info ──────────────────────────────────────────────────
    print("=" * 60)
    print("  vision_engine -- YOLO CPU Training Launcher")
    print("=" * 60)
    print(f"  PyTorch  : {torch.__version__}")
    print(f"  CUDA     : {'available' if torch.cuda.is_available() else 'NOT available (CPU-only, as expected)'}")
    print(f"  Device   : cpu")
    print(f"  Config   : {cfg_path}")
    print(f"  Mode     : {'SMOKE TEST (3 ep)' if args.smoke else 'FULL TRAINING'}")
    print()

    # ── Load config ──────────────────────────────────────────────────────────
    cfg = load_cfg(cfg_path)
    print("Config loaded:")
    for k, v in cfg.items():
        print(f"  {k}: {v}")
    print()

    # ── Dataset verification ─────────────────────────────────────────────────
    print("Verifying dataset paths...")
    verify_dataset(cfg["data"])
    print()

    # ── Resolve and verify model path ────────────────────────────────────────
    model_path = resolve_model_path(cfg.get("model", "yolov8n.pt"))
    print(f"  Model weights (local): {model_path}")
    print(f"  File size            : {Path(model_path).stat().st_size / 1e6:.1f} MB")
    print()

    # ── Output directory preview ─────────────────────────────────────────────
    run_project = cfg.get("project", str(PROJECT_ROOT / "vision_engine" / "outputs" / "runs"))
    run_name    = cfg.get("name", "yolov8n_circuit_cpu")
    out_dir     = Path(run_project) / run_name
    # Ultralytics auto-increments if dir exists (e.g. name2, name3)
    suffix = ""
    idx = 2
    candidate = out_dir
    while candidate.exists():
        candidate = Path(run_project) / f"{run_name}{idx}"
        suffix = str(idx)
        idx += 1
    print(f"  Output directory will be:")
    print(f"    {candidate}")
    print()

    if args.dry_run:
        print("[DRY RUN] All checks passed. No training started.")
        print(f"  Command to start smoke test:")
        print(f"    python vision_engine/scripts/train_yolo.py --smoke")
        return

    # ── Import and run YOLO ──────────────────────────────────────────────────
    try:
        from ultralytics import YOLO
    except ImportError:
        sys.exit("[ERROR] ultralytics not installed. Run: pip install ultralytics")

    print("Loading model from local weights...")
    model = YOLO(model_path)

    print("Starting training...\n")
    t0 = time.time()

    results = model.train(
        data        = cfg["data"],
        epochs      = cfg.get("epochs", 50),
        batch       = cfg.get("batch", 8),
        imgsz       = cfg.get("imgsz", 640),
        workers     = cfg.get("workers", 2),
        patience    = cfg.get("patience", 10),
        save_period = cfg.get("save_period", 5),
        optimizer   = cfg.get("optimizer", "SGD"),
        lr0         = cfg.get("lr0", 0.01),
        lrf         = cfg.get("lrf", 0.01),
        momentum    = cfg.get("momentum", 0.937),
        weight_decay= cfg.get("weight_decay", 0.0005),
        warmup_epochs=cfg.get("warmup_epochs", 3.0),
        hsv_h       = cfg.get("hsv_h", 0.015),
        hsv_s       = cfg.get("hsv_s", 0.7),
        hsv_v       = cfg.get("hsv_v", 0.4),
        fliplr      = cfg.get("fliplr", 0.5),
        mosaic      = cfg.get("mosaic", 1.0),
        device      = "cpu",
        project     = cfg.get("project", str(PROJECT_ROOT / "vision_engine" / "outputs" / "runs")),
        name        = cfg.get("name", "yolov8n_circuit_cpu"),
        val         = cfg.get("val", True),
        plots       = cfg.get("plots", True),
    )

    elapsed = time.time() - t0
    h, m, s = int(elapsed//3600), int((elapsed%3600)//60), int(elapsed%60)
    print(f"\nTraining complete in {h}h {m}m {s}s.")
    print(f"Results saved to  : {results.save_dir}")
    print(f"Best weights      : {Path(results.save_dir) / 'weights' / 'best.pt'}")
    print(f"Last weights      : {Path(results.save_dir) / 'weights' / 'last.pt'}")


if __name__ == "__main__":
    main()
