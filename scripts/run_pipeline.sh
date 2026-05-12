#!/usr/bin/env bash
# Master pipeline runner - runs all steps sequentially
# Run from project root: bash scripts/run_pipeline.sh
# Or individual steps: bash scripts/run_pipeline.sh --step 3

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

STEP_START=1
STEP_END=7

while [[ $# -gt 0 ]]; do
  case $1 in
    --step) STEP_START=$2; STEP_END=$2; shift 2 ;;
    --from) STEP_START=$2; shift 2 ;;
    --to)   STEP_END=$2;   shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

run_step() {
  local step=$1 script=$2 label=$3
  if [ "$step" -ge "$STEP_START" ] && [ "$step" -le "$STEP_END" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " STEP $step: $label"
    echo " $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    local log="$LOG_DIR/step${step}.log"
    if [[ "$script" == *.R ]]; then
      Rscript "$script" 2>&1 | tee "$log"
    else
      bash "$script" 2>&1 | tee "$log"
    fi
    echo " Step $step complete. Log: $log"
  fi
}

echo "======================================================"
echo " RNA-seq Pipeline: GSE122709 Stroke vs. Control"
echo " Running steps $STEP_START through $STEP_END"
echo "======================================================"

# Step 0: Environment setup (manual, not auto-run by default)
# bash scripts/00_setup_environment.sh

run_step 1 "scripts/01_download_data.sh"    "Data Download (SRA → FASTQ)"
run_step 2 "scripts/02_quality_control.sh"  "Quality Control (FastQC + MultiQC)"
run_step 3 "scripts/03_alignment.sh"        "Alignment (HISAT2 → BAM)"
run_step 4 "scripts/04_quantification.sh"   "Quantification (featureCounts)"
run_step 5 "scripts/05_deseq2_analysis.R"   "Differential Expression (DESeq2)"
run_step 6 "scripts/06_enrichment_analysis.R" "Functional Enrichment (GO + KEGG)"
run_step 7 "scripts/07_visualization_report.R" "Summary Visualizations"

echo ""
echo "======================================================"
echo " Pipeline complete!"
echo " Results: $PROJECT_DIR/results/"
echo " Logs:    $LOG_DIR/"
echo "======================================================"
