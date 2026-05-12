#!/usr/bin/env bash
# Step 2: Quality control with FastQC and MultiQC
# Memory: ~1-2GB | Runtime: ~20-40 min for 10 samples
# Run: bash scripts/02_quality_control.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAW_DIR="$PROJECT_DIR/data/raw"
QC_DIR="$PROJECT_DIR/data/qc"
THREADS=4   # FastQC threads; safe for 16GB RAM

mkdir -p "$QC_DIR/fastqc_raw"

echo "=== Running FastQC on all raw FASTQ files ==="

# Collect all FASTQ files
FASTQ_FILES=$(find "$RAW_DIR" -name "*.fastq.gz" | sort)
FILE_COUNT=$(echo "$FASTQ_FILES" | wc -l)
echo "    Found $FILE_COUNT FASTQ files"

# Run FastQC (2 files at a time to stay within RAM)
echo "$FASTQ_FILES" | xargs -P 2 -I{} fastqc \
    --outdir "$QC_DIR/fastqc_raw" \
    --threads 2 \
    --quiet \
    {}

echo "=== Aggregating QC reports with MultiQC ==="
multiqc \
    "$QC_DIR/fastqc_raw" \
    --outdir "$QC_DIR" \
    --filename "multiqc_raw_report" \
    --title "GSE122709 Raw Read QC" \
    --force

echo ""
echo "=== QC complete ==="
echo "    Open: $QC_DIR/multiqc_raw_report.html"
echo ""
echo "=== QC Checklist (review MultiQC report) ==="
echo "    [ ] Per-base sequence quality > Q30 for majority of bases"
echo "    [ ] Per-sequence quality scores: peak above Q30"
echo "    [ ] Adapter content: low (<5%) - if high, trimming needed"
echo "    [ ] Sequence duplication: moderate duplication OK for RNA-seq"
echo "    [ ] GC content: ~50% expected for human RNA-seq"
echo ""
echo "    NOTE: HiSeq X Ten data is typically high quality."
echo "    Trimming with Trimmomatic/Trim Galore is optional if QC is good."
