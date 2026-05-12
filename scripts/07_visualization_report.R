# Step 7: Summary visualizations and session info for reproducibility
# Run: Rscript scripts/07_visualization_report.R

suppressPackageStartupMessages({
  library(DESeq2)
  library(ggplot2)
  library(dplyr)
  library(readr)
  library(pheatmap)
  library(RColorBrewer)
  library(ggrepel)
})

project_dir <- "."
figures_dir <- file.path(project_dir, "results/figures")
dir.create(figures_dir, showWarnings = FALSE, recursive = TRUE)

cat("=== Generating Summary Visualizations ===\n\n")

# ── 1. Dispersion estimate plot (from DESeq2 dds object) ──────────────────────
# Load saved dds if available, otherwise skip
dds_file <- file.path(project_dir, "results/deseq2/dds_object.rds")
if (file.exists(dds_file)) {
  dds <- readRDS(dds_file)
  pdf(file.path(figures_dir, "dispersion_plot.pdf"), width = 7, height = 5)
  plotDispEsts(dds, main = "Dispersion Estimates (DESeq2)")
  dev.off()
  cat("  Dispersion plot saved.\n")
}

# ── 2. MA Plot ────────────────────────────────────────────────────────────────
res_df <- tryCatch(
  read_csv(file.path(project_dir, "results/deseq2/deseq2_results_all.csv"),
           show_col_types = FALSE),
  error = function(e) NULL
)

if (!is.null(res_df)) {
  p_ma <- ggplot(res_df %>% filter(!is.na(padj)),
                 aes(x = log10(baseMean + 1), y = log2FoldChange,
                     color = (padj < 0.05 & abs(log2FoldChange) > 1))) +
    geom_point(alpha = 0.4, size = 0.8) +
    scale_color_manual(values = c("FALSE" = "grey70", "TRUE" = "#D6604D"),
                       labels = c("Not sig.", "Sig. DEG"),
                       name   = NULL) +
    geom_hline(yintercept = 0, linetype = "solid", color = "black") +
    geom_hline(yintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
    labs(title    = "MA Plot: Stroke vs. Healthy Controls",
         subtitle = "Red: padj<0.05 & |LFC|>1",
         x        = "log10(Mean Normalized Count + 1)",
         y        = "Log2 Fold Change") +
    theme_bw(base_size = 13)

  ggsave(file.path(figures_dir, "ma_plot.pdf"), p_ma, width = 7, height = 5.5)
  ggsave(file.path(figures_dir, "ma_plot.png"), p_ma, width = 7, height = 5.5, dpi = 300)
  cat("  MA plot saved.\n")

  # ── 3. Top DEG Bar Chart ──────────────────────────────────────────────────
  top_degs <- res_df %>%
    filter(!is.na(padj) & padj < 0.05 & abs(log2FoldChange) > 1) %>%
    slice_min(padj, n = 30) %>%
    mutate(direction = ifelse(log2FoldChange > 0, "Up in stroke", "Down in stroke"),
           gene_id   = factor(gene_id, levels = gene_id[order(log2FoldChange)]))

  p_bar <- ggplot(top_degs, aes(x = gene_id, y = log2FoldChange, fill = direction)) +
    geom_col() +
    scale_fill_manual(values = c("Up in stroke" = "#D6604D", "Down in stroke" = "#2166AC")) +
    coord_flip() +
    labs(title    = "Top 30 DEGs by Adjusted p-value",
         subtitle = "Stroke vs. Healthy Controls",
         x        = NULL,
         y        = "Log2 Fold Change",
         fill     = NULL) +
    theme_bw(base_size = 11) +
    theme(legend.position = "bottom")

  ggsave(file.path(figures_dir, "top30_degs_barplot.pdf"), p_bar, width = 7, height = 10)
  ggsave(file.path(figures_dir, "top30_degs_barplot.png"), p_bar, width = 7, height = 10, dpi = 300)
  cat("  Top DEG bar chart saved.\n")
}

# ── 4. Session Info for Reproducibility ──────────────────────────────────────
cat("\n=== Session Information (for report Methods section) ===\n")
sink(file.path(project_dir, "results/session_info.txt"))
cat("RNA-seq Analysis Pipeline - Session Info\n")
cat("Date:", format(Sys.time()), "\n\n")
sessionInfo()
sink()
cat("  Session info saved to: results/session_info.txt\n")

cat("\n=== All visualizations complete ===\n")
cat("    Figure files in: results/figures/\n")
cat("    - pca_plot.pdf/png\n")
cat("    - volcano_plot.pdf/png\n")
cat("    - ma_plot.pdf/png\n")
cat("    - heatmap_top50_DEGs.pdf\n")
cat("    - top30_degs_barplot.pdf/png\n")
cat("    - go_dotplot.pdf/png\n")
cat("    - kegg_dotplot.pdf/png\n")
cat("    - gsea_ridgeplot.pdf\n")
cat("    - gsea_enrichplot_01-03.pdf\n")
