# Differential Gene Expression Analysis — Acute Ischemic Stroke
## DATA_SCI_8110 | GSE122709 | PBMC RNA-seq

---

## System Requirements Assessment (Windows 11, 16GB RAM)

### What fits on your machine ✅
| Component | Requirement | Your Machine |
|---|---|---|
| HISAT2 alignment | ~8–10 GB RAM | 16 GB ✅ (tight but feasible) |
| DESeq2 (R) | ~3–5 GB RAM | 16 GB ✅ |
| featureCounts | ~2–4 GB RAM | 16 GB ✅ |
| FastQC / MultiQC | <1 GB RAM | 16 GB ✅ |
| HISAT2 GRCh38 index | ~8 GB disk | depends on disk ✅ |
| 10 FASTQ samples | ~40–80 GB disk | need to verify free space |
| 10 BAM files | ~20–30 GB disk | need to verify free space |
| Reference + GTF | ~5 GB disk | ✅ |

### Critical constraints on 16 GB RAM
- **HISAT2 uses ~8 GB just to load the genome index** — process samples one at a time (scripts already do this)
- Close all other applications (browsers, etc.) during alignment (Step 3)
- Do NOT run STAR aligner — it requires ~30 GB RAM (not feasible)
- Disk space needed: **~150 GB total** — use an external SSD if C: drive is limited

### What you need installed first (Windows side)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) with Ubuntu 22.04
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html) inside WSL2
- At least **150 GB free disk space** (preferably on SSD)

---

## Project Structure

```
Genomics_project/
├── config/
│   └── samples.txt              # SRA accessions + condition labels
├── data/
│   ├── raw/                     # Downloaded FASTQ files (~40-80 GB)
│   ├── qc/                      # FastQC HTML reports + MultiQC summary
│   ├── aligned/                 # Sorted, indexed BAM files (~25 GB)
│   ├── counts/                  # featureCounts output + count matrix
│   └── reference/               # GRCh38 HISAT2 index + GENCODE GTF
├── scripts/
│   ├── 00_setup_environment.sh  # One-time: install tools, download reference
│   ├── 01_download_data.sh      # SRA download → FASTQ (2-6 hrs)
│   ├── 02_quality_control.sh    # FastQC + MultiQC (~30 min)
│   ├── 03_alignment.sh          # HISAT2 alignment (~5-10 hrs total)
│   ├── 04_quantification.sh     # featureCounts count matrix (~30 min)
│   ├── 05_deseq2_analysis.R     # DESeq2 DGE + PCA/volcano/heatmap
│   ├── 06_enrichment_analysis.R # GO + KEGG + GSEA enrichment
│   ├── 07_visualization_report.R # MA plot, summary figures, session info
│   └── run_pipeline.sh          # Master runner (run all or specific steps)
├── results/
│   ├── deseq2/                  # DEG tables (all, up, down)
│   ├── enrichment/              # GO/KEGG/GSEA result tables
│   └── figures/                 # All publication-quality plots
├── logs/                        # Step-by-step log files
└── report/                      # Final narrative report
```

---

## Quick Start

### 1. Install WSL2 (run in Windows PowerShell as Admin)
```powershell
wsl --install -d Ubuntu-22.04
# Restart when prompted, then set your Linux username/password
```

### 2. Install Miniconda inside WSL2
```bash
# Inside WSL2 terminal:
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh -b -p $HOME/miniconda3
echo 'export PATH="$HOME/miniconda3/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
conda init bash && source ~/.bashrc
```

### 3. Navigate to project (WSL2 mounts Windows drives at /mnt/)
```bash
cd /mnt/c/Users/Desktop/Genomics_project
```

### 4. Run setup (one-time — installs all tools, downloads genome)
```bash
bash scripts/00_setup_environment.sh
conda activate rnaseq_stroke
```

### 5. Run the full pipeline
```bash
bash scripts/run_pipeline.sh
```

### Or run individual steps
```bash
bash scripts/run_pipeline.sh --step 3    # run only alignment
bash scripts/run_pipeline.sh --from 5   # run steps 5 through 7
```

### R scripts can also be run from RStudio (Windows)
```r
# Open RStudio on Windows, set working directory to project root:
setwd("C:/Users/Desktop/Genomics_project")
source("scripts/05_deseq2_analysis.R")
source("scripts/06_enrichment_analysis.R")
source("scripts/07_visualization_report.R")
```
> Note: R/Bioconductor packages (DESeq2, clusterProfiler) can be installed
> on Windows directly via BiocManager — no WSL2 needed for Steps 5–7.

---

## Pipeline Steps

| Step | Script | Tool | Time Estimate | RAM |
|------|--------|------|---------------|-----|
| 0 | setup | conda, wget | 1–2 hrs | <2 GB |
| 1 | download | prefetch, fasterq-dump | 2–6 hrs | <2 GB |
| 2 | QC | FastQC, MultiQC | 20–40 min | <2 GB |
| 3 | alignment | HISAT2, SAMtools | 5–10 hrs | ~10 GB |
| 4 | quantification | featureCounts | 15–30 min | ~4 GB |
| 5 | DESeq2 | R/DESeq2 | 15–30 min | ~5 GB |
| 6 | enrichment | clusterProfiler | 10–20 min | ~4 GB |
| 7 | visualization | ggplot2, pheatmap | 5–10 min | ~2 GB |

**Total estimated runtime: 10–20 hours** (mostly download + alignment)

---

## Expected Outputs

### Results tables
- `results/deseq2/deseq2_results_all.csv` — all genes with LFC, padj, significance
- `results/deseq2/deseq2_upregulated.csv` — upregulated DEGs (stroke > control)
- `results/deseq2/deseq2_downregulated.csv` — downregulated DEGs
- `results/enrichment/go_enrichment_results.csv` — GO terms (BP/MF/CC)
- `results/enrichment/kegg_enrichment_results.csv` — KEGG pathways
- `results/enrichment/gsea_go_bp_results.csv` — GSEA ranked enrichment

### Figures
- `pca_plot.pdf/png` — sample separation by condition
- `volcano_plot.pdf/png` — LFC vs. significance
- `ma_plot.pdf/png` — mean expression vs. LFC
- `heatmap_top50_DEGs.pdf` — clustered Z-score heatmap
- `top30_degs_barplot.pdf/png` — ranked LFC bar chart
- `go_dotplot.pdf/png` — GO term enrichment dotplot
- `kegg_dotplot.pdf/png` — KEGG pathway dotplot
- `gsea_ridgeplot.pdf` — GSEA distribution ridgeplot
- `gsea_enrichplot_01-03.pdf` — individual GSEA enrichment plots

---

## Biological Context

**Dataset**: GSE122709 — 5 acute ischemic stroke patients vs 5 healthy controls  
**Cell type**: PBMCs (peripheral blood mononuclear cells)  
**Platform**: Illumina HiSeq X Ten  
**Expected findings**:
- Upregulated: inflammatory cytokines, neutrophil/monocyte activation markers
- Downregulated: lymphocyte function genes (immunosuppression post-stroke)
- Enriched pathways: IL-6/TNF signaling, coagulation, leukocyte migration, TLR signaling

---

## Troubleshooting

**HISAT2 runs out of memory during alignment**
- Close all other applications before running Step 3
- Reduce threads: change `THREADS=4` to `THREADS=2` in `03_alignment.sh`
- Use the basic (non-snp-tran) genome index: `grch38/genome` instead of `genome_snp_tran`

**fasterq-dump is slow**
- It is parallel by default; ensure SSD storage for temp files
- Set `THREADS=2` if system is struggling

**SRR accessions in samples.txt are wrong**
- Verify at: https://www.ncbi.nlm.nih.gov/sra?term=SRP167559
- Or run: `esearch -db sra -query GSE122709 | efetch -format runinfo > srr_info.csv`

**featureCounts assignment rate is low (<40%)**
- The strandedness setting `-s 2` may be wrong for this library
- Try `-s 0` (unstranded) or `-s 1` (forward-stranded) in `04_quantification.sh`
- Verify with: `infer_experiment.py` from RSeQC

**DESeq2 / clusterProfiler package not found in R**
```r
if (!require("BiocManager")) install.packages("BiocManager")
BiocManager::install(c("DESeq2", "clusterProfiler", "org.Hs.eg.db",
                        "enrichplot", "apeglm"))
install.packages(c("ggplot2", "pheatmap", "ggrepel", "dplyr", "readr", "RColorBrewer"))
```
