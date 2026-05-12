#!/usr/bin/env bash
# Setup: install all tools via Conda inside WSL2
# Prerequisites: WSL2 (Ubuntu 22.04) + Miniconda installed
# Run once: bash scripts/00_setup_environment.sh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_NAME="rnaseq_stroke"

echo "=== Creating conda environment: $ENV_NAME ==="
conda create -y -n "$ENV_NAME" -c conda-forge -c bioconda \
    python=3.10 \
    sra-tools=3.0.7 \
    fastqc=0.12.1 \
    multiqc=1.18 \
    hisat2=2.2.1 \
    samtools=1.18 \
    subread=2.0.6 \
    entrez-direct \
    pigz \
    r-base=4.3.1 \
    bioconductor-deseq2 \
    bioconductor-clusterprofiler \
    bioconductor-enrichplot \
    bioconductor-org.hs.eg.db \
    r-ggplot2 \
    r-pheatmap \
    r-ggrepel \
    r-dplyr \
    r-readr \
    r-rcolorbrewer

echo ""
echo "=== Downloading HISAT2 pre-built human genome index (GRCh38) ==="
echo "    This saves ~2hrs of index building and avoids 32GB RAM requirement."
echo "    Index file is ~8GB compressed. Ensure ~20GB free disk space."
echo ""
REFERENCE_DIR="$PROJECT_DIR/data/reference"
mkdir -p "$REFERENCE_DIR"

# Pre-built index from HISAT2 project (genome_snp_tran includes SNPs + transcripts)
INDEX_URL="https://genome-idx.s3.amazonaws.com/hisat/grch38_genome.tar.gz"
echo "Downloading HISAT2 GRCh38 genome index..."
wget -c "$INDEX_URL" -P "$REFERENCE_DIR/"
tar -xzf "$REFERENCE_DIR/grch38_genome.tar.gz" -C "$REFERENCE_DIR/"
echo "HISAT2 index ready at: $REFERENCE_DIR/grch38/"

echo ""
echo "=== Downloading GENCODE v44 GTF annotation ==="
GTF_URL="https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_44/gencode.v44.annotation.gtf.gz"
wget -c "$GTF_URL" -P "$REFERENCE_DIR/"
pigz -d "$REFERENCE_DIR/gencode.v44.annotation.gtf.gz"
echo "GTF ready at: $REFERENCE_DIR/gencode.v44.annotation.gtf"

echo ""
echo "=== Setup complete. Activate environment with: ==="
echo "    conda activate $ENV_NAME"
