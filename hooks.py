"""MkDocs build hooks for QuantumEd.

Packages each top-level module folder under docs/ into a downloadable
zip (source markdown + local images/assets) so a learner can grab a
single module for offline use via the nav's download button.
"""

import zipfile
from pathlib import Path

NON_MODULE_DIRS = {"assets"}


def on_post_build(config, **kwargs):
    docs_dir = Path(config["docs_dir"])
    site_dir = Path(config["site_dir"])
    downloads_dir = site_dir / "downloads"
    downloads_dir.mkdir(parents=True, exist_ok=True)

    for module_dir in sorted(docs_dir.iterdir()):
        if not module_dir.is_dir():
            continue
        if module_dir.name in NON_MODULE_DIRS or module_dir.name.startswith("."):
            continue

        zip_path = downloads_dir / f"{module_dir.name}.zip"
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for file_path in module_dir.rglob("*"):
                if file_path.is_file():
                    zf.write(file_path, arcname=file_path.relative_to(docs_dir))
