#!/usr/bin/env bash
# Step 4: Gene-level quantification with featureCounts (Subread package)
# Memory: ~2-4GB | Runtime: ~15-30 min for all 10 samples simultaneously
# Run: bash scripts/04_quantification.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALIGNED_DIR="$PROJECT_DIR/data/aligned"
COUNTS_DIR="$PROJECT_DIR/data/counts"
GTF="$PROJECT_DIR/data/reference/gencode.v44.annotation.gtf"
THREADS=4

mkdir -p "$COUNTS_DIR"

# Verify GTF exists
if [ ! -f "$GTF" ]; then
    echo "ERROR: GTF not found at $GTF"
    echo "       Run 00_setup_environment.sh first."
    exit 1
fi

# Collect all sorted BAM files in sample order
BAM_FILES=$(grep -v '^#' "$PROJECT_DIR/config/samples.txt" | \
    awk -v dir="$ALIGNED_DIR" '{print dir"/"$3".sorted.bam"}' | tr '\n' ' ')

# Extract sample names for column headers
SAMPLE_NAMES=$(grep -v '^#' "$PROJECT_DIR/config/samples.txt" | awk '{print $3}' | tr '\n' '\t')

echo "=== featureCounts: Gene-level quantification ==="
echo "    GTF: $GTF"
echo "    BAMs: all 10 samples processed in one run"
echo "    Strandedness: -s 2 (reverse-stranded, typical for dUTP/TruSeq libraries)"
echo ""

# Run featureCounts
# -p: paired-end counting (use if paired-end; remove if single-end)
# -s 2: reverse-stranded (confirm with RSeQC infer_experiment.py if unsure)
# -B: both reads of a pair must map
# -C: chimeric pairs excluded
featureCounts \
    -T "$THREADS" \
    -a "$GTF" \
    -o "$COUNTS_DIR/raw_counts.txt" \
    -g gene_id \
    -t exon \
    -p \
    --countReadPairs \
    -B \
    -C \
    -s 0 \
    --verbose \
    $BAM_FILES \
    2>&1 | tee "$COUNTS_DIR/featureCounts.log"

echo ""
echo "=== Formatting count matrix ==="

# Create clean count matrix: gene_id + sample columns (strip BAM paths from headers)
python3 - <<'PYEOF'
import pandas as pd
import os

counts_file = "data/counts/raw_counts.txt"
output_file = "data/counts/count_matrix.csv"

df = pd.read_csv(counts_file, sep='\t', comment='#')

# Rename BAM path columns to sample names
col_map = {}
for col in df.columns[6:]:
    sample = os.path.basename(col).replace('.sorted.bam', '')
    col_map[col] = sample

df = df.rename(columns=col_map)

# Keep only Geneid and sample count columns
id_cols = ['Geneid', 'Chr', 'Start', 'End', 'Strand', 'Length']
sample_cols = [c for c in df.columns if c not in id_cols]

count_matrix = df[['Geneid'] + sample_cols].copy()
count_matrix.to_csv(output_file, index=False)
print(f"Count matrix saved: {output_file}")
print(f"Shape: {count_matrix.shape} (genes x samples+1)")
print(f"\nSample columns: {sample_cols}")
print(f"\nFirst few rows:")
print(count_matrix.head(3).to_string())
PYEOF

echo ""
echo "=== Quantification summary ==="
grep "Successfully assigned" "$COUNTS_DIR/featureCounts.log" | tail -5
echo ""
echo "    Files:"
echo "    - $COUNTS_DIR/raw_counts.txt  (featureCounts native format)"
echo "    - $COUNTS_DIR/count_matrix.csv (clean matrix for DESeq2)"
echo ""
echo "    Expected: >60% of reads assigned to features"
echo "    If low: check strandedness (-s 0/1/2) or library type"
