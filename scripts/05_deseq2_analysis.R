# Step 5: Differential Gene Expression Analysis with DESeq2
# 3-group design: control (NC) vs stroke_d1 (acute) vs stroke_d2 (subacute)
# Primary comparison:   NC vs D1 (acute stroke)   <- matches course outline
# Secondary comparison: NC vs D2 (subacute stroke) <- longitudinal bonus
# Memory: ~4-6GB | Runtime: ~20-30 min
# Run: Rscript scripts/05_deseq2_analysis.R

suppressPackageStartupMessages({
  library(DESeq2)
  library(dplyr)
  library(readr)
  library(ggplot2)
  library(pheatmap)
  library(ggrepel)
  library(RColorBrewer)
})

set.seed(42)

# ── Paths ──────────────────────────────────────────────────────────────────────
project_dir <- "."
counts_file  <- file.path(project_dir, "data/counts/count_matrix.csv")
samples_file <- file.path(project_dir, "config/samples.txt")
results_dir  <- file.path(project_dir, "results/deseq2")
figures_dir  <- file.path(project_dir, "results/figures")
dir.create(results_dir, showWarnings = FALSE, recursive = TRUE)
dir.create(figures_dir, showWarnings = FALSE, recursive = TRUE)

cat("=== DESeq2 Differential Expression Analysis ===\n")
cat("    Dataset: GSE122709 (5 NC + 5 D1 + 5 D2 = 15 samples)\n\n")

# ── Load data ──────────────────────────────────────────────────────────────────
count_df  <- read_csv(counts_file, show_col_types = FALSE)
count_mat <- as.matrix(count_df[, -1])
rownames(count_mat) <- sub("\\.\\d+$", "", count_df$Geneid)  # strip GENCODE version

samples_raw <- read.table(samples_file, comment.char = "#", header = FALSE,
                          col.names = c("srr", "condition", "sample_name"))

col_data <- data.frame(
  sample_name = samples_raw$sample_name,
  condition   = factor(samples_raw$condition,
                       levels = c("control", "stroke_d1", "stroke_d2")),
  row.names   = samples_raw$sample_name
)

count_mat <- count_mat[, col_data$sample_name]

cat(sprintf("  Genes: %d | Samples: %d\n", nrow(count_mat), ncol(count_mat)))
cat(sprintf("  Groups: %s\n\n",
  paste(names(table(col_data$condition)), table(col_data$condition),
        sep = "=", collapse = ", ")))

# ── Pre-filter ────────────────────────────────────────────────────────────────
keep <- rowSums(count_mat >= 10) >= 5  # expressed in at least 5 of 15 samples
count_mat <- count_mat[keep, ]
cat(sprintf("  After filter (>=10 counts in >=5 samples): %d genes\n\n", nrow(count_mat)))

# ── Build DESeq2 object ───────────────────────────────────────────────────────
dds <- DESeqDataSetFromMatrix(
  countData = count_mat,
  colData   = col_data,
  design    = ~ condition        # one factor, three levels
)
dds <- DESeq(dds)

# Save dds for Step 7
saveRDS(dds, file.path(results_dir, "dds_object.rds"))

# ── Helper: extract + shrink + save results ───────────────────────────────────
run_contrast <- function(dds, name, coef, label) {
  cat(sprintf("--- Contrast: %s ---\n", label))

  res <- results(dds, name = coef, alpha = 0.05)
  res_shrunk <- lfcShrink(dds, coef = coef, type = "apeglm", res = res, quiet = TRUE)

  res_df <- as.data.frame(res_shrunk) %>%
    tibble::rownames_to_column("gene_id") %>%
    arrange(padj) %>%
    mutate(
      comparison = label,
      significance = case_when(
        padj < 0.05 & log2FoldChange >  1 ~ "Upregulated",
        padj < 0.05 & log2FoldChange < -1 ~ "Downregulated",
        TRUE                               ~ "Not significant"
      )
    )

  write_csv(res_df, file.path(results_dir, sprintf("deseq2_%s_all.csv", name)))
  write_csv(filter(res_df, significance == "Upregulated"),
            file.path(results_dir, sprintf("deseq2_%s_up.csv", name)))
  write_csv(filter(res_df, significance == "Downregulated"),
            file.path(results_dir, sprintf("deseq2_%s_down.csv", name)))

  n_up   <- sum(res_df$significance == "Upregulated",   na.rm = TRUE)
  n_down <- sum(res_df$significance == "Downregulated", na.rm = TRUE)
  cat(sprintf("  Upregulated: %d | Downregulated: %d\n\n", n_up, n_down))
  invisible(res_df)
}

# ── Run both contrasts ────────────────────────────────────────────────────────
res_d1 <- run_contrast(dds, "NC_vs_D1", "condition_stroke_d1_vs_control",
                       "stroke_d1 vs control (ACUTE)")
res_d2 <- run_contrast(dds, "NC_vs_D2", "condition_stroke_d2_vs_control",
                       "stroke_d2 vs control (SUBACUTE)")

# ── PCA plot (all 15 samples) ─────────────────────────────────────────────────
cat("Generating PCA plot (15 samples, 3 groups)...\n")
vsd <- vst(dds, blind = TRUE)

pca_data <- plotPCA(vsd, intgroup = "condition", returnData = TRUE)
pct_var  <- round(100 * attr(pca_data, "percentVar"))

group_colors <- c(control = "#2166AC", stroke_d1 = "#D6604D", stroke_d2 = "#F4A582")
group_labels <- c(control = "Control (NC)", stroke_d1 = "Stroke Day 1",
                  stroke_d2 = "Stroke Day 2")

p_pca <- ggplot(pca_data, aes(x = PC1, y = PC2, color = condition, label = name)) +
  geom_point(size = 4, alpha = 0.85) +
  geom_text_repel(size = 3.2, max.overlaps = 20, show.legend = FALSE) +
  scale_color_manual(values = group_colors, labels = group_labels) +
  labs(
    title    = "PCA of VST-normalized counts - All 15 Samples",
    subtitle = "GSE122709: Control vs Acute (D1) vs Subacute (D2) Stroke",
    x = paste0("PC1 (", pct_var[1], "% variance)"),
    y = paste0("PC2 (", pct_var[2], "% variance)"),
    color = "Condition"
  ) +
  theme_bw(base_size = 13)

ggsave(file.path(figures_dir, "pca_all_samples.pdf"), p_pca, width = 8, height = 6)
ggsave(file.path(figures_dir, "pca_all_samples.png"), p_pca, width = 8, height = 6, dpi = 300)

# ── Volcano plots (one per contrast) ─────────────────────────────────────────
make_volcano <- function(res_df, title, filename) {
  top_genes <- res_df %>%
    filter(significance != "Not significant") %>%
    slice_min(padj, n = 15)

  p <- ggplot(res_df, aes(x = log2FoldChange, y = -log10(padj), color = significance)) +
    geom_point(alpha = 0.5, size = 1.0) +
    geom_text_repel(data = top_genes, aes(label = gene_id),
                    size = 2.6, max.overlaps = 20, show.legend = FALSE) +
    scale_color_manual(values = c(Upregulated = "#D6604D",
                                  Downregulated = "#2166AC",
                                  "Not significant" = "grey70")) +
    geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
    geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "grey40") +
    labs(title = title, subtitle = "padj < 0.05, |LFC| > 1",
         x = "Log2 Fold Change", y = "-log10(adjusted p-value)", color = NULL) +
    theme_bw(base_size = 12) + theme(legend.position = "top")

  ggsave(paste0(file.path(figures_dir, filename), ".pdf"), p, width = 7, height = 6)
  ggsave(paste0(file.path(figures_dir, filename), ".png"), p, width = 7, height = 6, dpi = 300)
}

cat("Generating volcano plots...\n")
make_volcano(res_d1, "Volcano: Acute Stroke (D1) vs Control", "volcano_D1_vs_NC")
make_volcano(res_d2, "Volcano: Subacute Stroke (D2) vs Control", "volcano_D2_vs_NC")

# ── Overlap: genes significant in BOTH timepoints ────────────────────────────
cat("Calculating DEG overlap between D1 and D2...\n")

sig_d1 <- filter(res_d1, significance != "Not significant")$gene_id
sig_d2 <- filter(res_d2, significance != "Not significant")$gene_id
shared  <- intersect(sig_d1, sig_d2)
only_d1 <- setdiff(sig_d1, sig_d2)
only_d2 <- setdiff(sig_d2, sig_d1)

cat(sprintf("  Shared DEGs (both timepoints): %d\n", length(shared)))
cat(sprintf("  Unique to D1 (acute only):     %d\n", length(only_d1)))
cat(sprintf("  Unique to D2 (subacute only):  %d\n\n", length(only_d2)))

overlap_df <- bind_rows(
  data.frame(gene_id = shared,  category = "Shared (D1 & D2)"),
  data.frame(gene_id = only_d1, category = "Acute only (D1)"),
  data.frame(gene_id = only_d2, category = "Subacute only (D2)")
)
write_csv(overlap_df, file.path(results_dir, "deseq2_DEG_overlap.csv"))

# ── Heatmap: top 50 DEGs (union of both contrasts, by padj) ──────────────────
cat("Generating heatmap (top 50 DEGs across both comparisons)...\n")

top50 <- bind_rows(res_d1, res_d2) %>%
  filter(significance != "Not significant") %>%
  group_by(gene_id) %>%
  slice_min(padj, n = 1) %>%
  ungroup() %>%
  slice_min(padj, n = 50) %>%
  pull(gene_id) %>% unique()

mat_heat <- assay(vsd)[intersect(top50, rownames(assay(vsd))), ]
mat_heat <- t(scale(t(mat_heat)))

ann_col <- data.frame(Condition = col_data$condition, row.names = rownames(col_data))
ann_colors <- list(Condition = group_colors)

pdf(file.path(figures_dir, "heatmap_top50_DEGs.pdf"), width = 9, height = 13)
pheatmap(
  mat_heat,
  annotation_col   = ann_col,
  annotation_colors = ann_colors,
  color            = colorRampPalette(rev(brewer.pal(9, "RdBu")))(100),
  cluster_rows     = TRUE, cluster_cols = TRUE,
  show_rownames    = TRUE, fontsize_row = 7,
  main = "Top 50 DEGs — Z-score of VST counts\nNC vs D1 (Acute) vs D2 (Subacute)"
)
dev.off()

cat("=== DESeq2 analysis complete ===\n")
cat("    results/deseq2/  deseq2_NC_vs_D1_all.csv\n")
cat("                     deseq2_NC_vs_D2_all.csv\n")
cat("                     deseq2_DEG_overlap.csv\n")
cat("    results/figures/ pca_all_samples, volcano_D1_vs_NC, volcano_D2_vs_NC\n")
cat("                     heatmap_top50_DEGs.pdf\n")
