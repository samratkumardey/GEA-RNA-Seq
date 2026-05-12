#!/usr/bin/env bash
# Step 3: Align reads to GRCh38 with HISAT2, sort/index BAMs with SAMtools
# Memory: ~8GB for HISAT2 index + ~2GB working = ~10GB total
# CRITICAL: Process one sample at a time on 16GB machine
# Runtime: ~30-60 min per sample; ~5-10 hrs total
# Run: bash scripts/03_alignment.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SAMPLES_FILE="$PROJECT_DIR/config/samples.txt"
RAW_DIR="$PROJECT_DIR/data/raw"
ALIGNED_DIR="$PROJECT_DIR/data/aligned"
INDEX_DIR="$PROJECT_DIR/data/reference/grch38/genome"   # HISAT2 index prefix
THREADS=4        # HISAT2 threads
SORT_THREADS=2   # samtools sort threads (keep low to save RAM)
SORT_MEM=512M    # memory per sort thread: 2 threads × 512M = 1GB total for sorting

mkdir -p "$ALIGNED_DIR"

# Verify index exists
if [ ! -f "${INDEX_DIR}.1.ht2" ]; then
    echo "ERROR: HISAT2 index not found at $INDEX_DIR"
    echo "       Run 00_setup_environment.sh first."
    exit 1
fi

echo "=== HISAT2 Alignment to GRCh38 ==="
echo "    Index: $INDEX_DIR"
echo "    RAM usage: ~10GB (HISAT2 index ~8GB + overhead)"
echo "    Processing samples SEQUENTIALLY to manage 16GB RAM"

grep -v '^#' "$SAMPLES_FILE" | while read -r SRR CONDITION SAMPLE_NAME; do
    echo ""
    echo "--- Aligning: $SAMPLE_NAME ($CONDITION) ---"

    SAMPLE_RAW="$RAW_DIR/$SAMPLE_NAME"
    BAM_OUT="$ALIGNED_DIR/${SAMPLE_NAME}.sorted.bam"

    # Skip if BAM already exists and is indexed
    if [ -f "${BAM_OUT}.bai" ]; then
        echo "  BAM already exists and indexed, skipping."
        continue
    fi

    # Detect paired-end vs single-end
    R1=$(ls "$SAMPLE_RAW"/${SRR}_1.fastq.gz 2>/dev/null || ls "$SAMPLE_RAW"/${SRR}.fastq.gz 2>/dev/null || true)
    R2=$(ls "$SAMPLE_RAW"/${SRR}_2.fastq.gz 2>/dev/null || true)

    if [ -n "$R2" ] && [ -f "$R2" ]; then
        echo "  Mode: Paired-end"
        HISAT2_INPUT="-1 $R1 -2 $R2"
    else
        echo "  Mode: Single-end"
        HISAT2_INPUT="-U $R1"
    fi

    echo "  Running HISAT2..."
    hisat2 \
        -x "$INDEX_DIR" \
        $HISAT2_INPUT \
        --threads "$THREADS" \
        --dta \
        --rna-strandness RF \
        --summary-file "$ALIGNED_DIR/${SAMPLE_NAME}.hisat2_summary.txt" \
        --new-summary \
        2>"$ALIGNED_DIR/${SAMPLE_NAME}.hisat2.log" \
    | samtools sort \
        -@ "$SORT_THREADS" \
        -m "$SORT_MEM" \
        -o "$BAM_OUT" \
        -

    echo "  Indexing BAM..."
    samtools index -@ "$SORT_THREADS" "$BAM_OUT"

    echo "  Flagstat..."
    samtools flagstat "$BAM_OUT" > "$ALIGNED_DIR/${SAMPLE_NAME}.flagstat.txt"

    # Print alignment rate from summary
    ALIGN_RATE=$(grep "overall alignment rate" "$ALIGNED_DIR/${SAMPLE_NAME}.hisat2.log" || true)
    echo "  $ALIGN_RATE"
    echo "  Done: $SAMPLE_NAME"
done

echo ""
echo "=== Alignment complete ==="
echo "    BAM files: $ALIGNED_DIR"
echo ""
echo "=== Alignment Rate Summary ==="
for LOG in "$ALIGNED_DIR"/*.hisat2.log; do
    SAMPLE=$(basename "$LOG" .hisat2.log)
    RATE=$(grep "overall alignment rate" "$LOG" 2>/dev/null || echo "N/A")
    echo "    $SAMPLE: $RATE"
done
echo ""
echo "    Expected: >85% overall alignment rate for human PBMC data"
