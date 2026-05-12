#!/usr/bin/env bash
# Step 1: Download FASTQ files from NCBI SRA for GSE122709
# Memory: <1GB | Disk: ~40-80GB (10 samples)
# Runtime: 2-6 hrs depending on internet speed
# Run: bash scripts/01_download_data.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAMPLES_FILE="$PROJECT_DIR/config/samples.txt"
RAW_DIR="$PROJECT_DIR/data/raw"
THREADS=4   # fasterq-dump threads; keep <=4 on 16GB RAM

mkdir -p "$RAW_DIR"

# Configure SRA cache to project directory to avoid filling C: drive
vdb-config --root -s /repository/user/main/public/root="$RAW_DIR/sra_cache"

SAMPLE_COUNT=$(grep -v '^#' "$SAMPLES_FILE" | grep -c .)
echo "=== Downloading $SAMPLE_COUNT SRA samples for GSE122709 ==="
echo "    Processing one sample at a time to manage disk and RAM usage."

grep -v '^#' "$SAMPLES_FILE" | while read -r SRR CONDITION SAMPLE_NAME; do
    echo ""
    echo "--- Downloading: $SRR ($SAMPLE_NAME / $CONDITION) ---"

    SAMPLE_DIR="$RAW_DIR/$SAMPLE_NAME"
    mkdir -p "$SAMPLE_DIR"

    # Skip if already downloaded
    if ls "$SAMPLE_DIR"/${SRR}*.fastq.gz 2>/dev/null | grep -q .; then
        echo "  Already exists, skipping."
        continue
    fi

    # prefetch: download SRA archive (~1-4GB per sample)
    echo "  Prefetching SRA archive..."
    prefetch --max-size 50G --output-directory "$SAMPLE_DIR" "$SRR"

    # fasterq-dump: convert SRA to FASTQ (uses temp space ~3x FASTQ size)
    echo "  Converting to FASTQ..."
    fasterq-dump \
        --outdir "$SAMPLE_DIR" \
        --temp "$SAMPLE_DIR/tmp" \
        --threads "$THREADS" \
        --split-3 \
        --skip-technical \
        "$SAMPLE_DIR/$SRR/$SRR.sra"

    # Compress to save disk (pigz = parallel gzip)
    echo "  Compressing FASTQ files..."
    pigz -p "$THREADS" "$SAMPLE_DIR"/${SRR}*.fastq

    # Clean up SRA archive to reclaim disk space
    rm -rf "$SAMPLE_DIR/$SRR" "$SAMPLE_DIR/tmp"

    echo "  Done: $SAMPLE_NAME"
done

echo ""
echo "=== All downloads complete ==="
echo "    FASTQ files in: $RAW_DIR"
ls -lh "$RAW_DIR"/*/*.fastq.gz 2>/dev/null | awk '{print $5, $9}'
