# Step 6: Functional enrichment — GO + KEGG + GSEA
# Runs for both contrasts: NC vs D1 (acute) and NC vs D2 (subacute)
# Memory: ~3-5GB | Runtime: ~15-25 min
# Run: Rscript scripts/06_enrichment_analysis.R

suppressPackageStartupMessages({
  library(clusterProfiler)
  library(org.Hs.eg.db)
  library(enrichplot)
  library(ggplot2)
  library(dplyr)
  library(readr)
})

set.seed(42)

project_dir <- "."
results_dir <- file.path(project_dir, "results/deseq2")
enrich_dir  <- file.path(project_dir, "results/enrichment")
figures_dir <- file.path(project_dir, "results/figures")
dir.create(enrich_dir,  showWarnings = FALSE, recursive = TRUE)
dir.create(figures_dir, showWarnings = FALSE, recursive = TRUE)

cat("=== Functional Enrichment Analysis ===\n")
cat("    Contrasts: NC vs D1 (acute) | NC vs D2 (subacute)\n\n")

# ── Helper: ENSEMBL → ENTREZ conversion ───────────────────────────────────────
to_entrez <- function(res_df) {
  bitr(res_df$gene_id, fromType = "ENSEMBL",
       toType = c("ENTREZID", "SYMBOL"), OrgDb = org.Hs.eg.db, drop = TRUE) %>%
    inner_join(res_df, by = c("ENSEMBL" = "gene_id"))
}

# ── Helper: run GO + KEGG + GSEA for one contrast ─────────────────────────────
run_enrichment <- function(res_df, tag, label) {
  cat(sprintf("--- %s ---\n", label))

  ann <- to_entrez(res_df)
  background <- unique(ann$ENTREZID)

  sig <- ann %>% filter(!is.na(padj) & padj < 0.05 & abs(log2FoldChange) > 1)
  sig_entrez <- unique(sig$ENTREZID)
  cat(sprintf("  Sig DEGs for enrichment: %d\n", length(sig_entrez)))

  # ── GO enrichment ──────────────────────────────────────────────────────────
  go <- enrichGO(gene = sig_entrez, universe = background, OrgDb = org.Hs.eg.db,
                 ont = "ALL", pAdjustMethod = "BH",
                 pvalueCutoff = 0.05, qvalueCutoff = 0.2, readable = TRUE)
  go_df <- as.data.frame(go)
  write_csv(go_df, file.path(enrich_dir, sprintf("go_%s.csv", tag)))
  cat(sprintf("  GO terms: %d\n", nrow(go_df)))

  if (nrow(go_df) > 0) {
    p <- dotplot(go, showCategory = 15, split = "ONTOLOGY") +
      facet_grid(ONTOLOGY ~ ., scales = "free") +
      labs(title = sprintf("GO Enrichment — %s", label)) +
      theme_bw(base_size = 10)
    ggsave(file.path(figures_dir, sprintf("go_dotplot_%s.pdf", tag)), p, width = 10, height = 11)
    ggsave(file.path(figures_dir, sprintf("go_dotplot_%s.png", tag)), p, width = 10, height = 11, dpi = 300)

    go_sim <- pairwise_termsim(go)
    p_emap <- emapplot(go_sim, showCategory = 25) +
      labs(title = sprintf("GO Network — %s", label))
    ggsave(file.path(figures_dir, sprintf("go_emapplot_%s.pdf", tag)), p_emap, width = 10, height = 10)
  }

  # ── KEGG enrichment ────────────────────────────────────────────────────────
  kegg <- enrichKEGG(gene = sig_entrez, universe = background, organism = "hsa",
                     pAdjustMethod = "BH", pvalueCutoff = 0.05, qvalueCutoff = 0.2)
  kegg_df <- as.data.frame(kegg)
  write_csv(kegg_df, file.path(enrich_dir, sprintf("kegg_%s.csv", tag)))
  cat(sprintf("  KEGG pathways: %d\n", nrow(kegg_df)))

  if (nrow(kegg_df) > 0) {
    p <- dotplot(kegg, showCategory = 20) +
      labs(title = sprintf("KEGG Pathways — %s", label)) +
      theme_bw(base_size = 11)
    ggsave(file.path(figures_dir, sprintf("kegg_dotplot_%s.pdf", tag)), p, width = 9, height = 8)
    ggsave(file.path(figures_dir, sprintf("kegg_dotplot_%s.png", tag)), p, width = 9, height = 8, dpi = 300)
  }

  # ── GSEA (GO-BP ranked) ───────────────────────────────────────────────────
  ranked <- ann %>%
    filter(!is.na(pvalue) & !is.na(log2FoldChange)) %>%
    mutate(score = sign(log2FoldChange) * (-log10(pvalue))) %>%
    group_by(ENTREZID) %>% slice_max(abs(score), n = 1) %>% ungroup() %>%
    arrange(desc(score))
  gene_list <- setNames(ranked$score, ranked$ENTREZID)

  gsea <- gseGO(geneList = gene_list, OrgDb = org.Hs.eg.db, ont = "BP",
                minGSSize = 10, maxGSSize = 500, pvalueCutoff = 0.05, verbose = FALSE)
  gsea_df <- as.data.frame(gsea)
  write_csv(gsea_df, file.path(enrich_dir, sprintf("gsea_%s.csv", tag)))
  cat(sprintf("  GSEA GO-BP terms: %d\n\n", nrow(gsea_df)))

  if (nrow(gsea_df) > 0) {
    p_ridge <- ridgeplot(gsea, showCategory = 20) +
      labs(title = sprintf("GSEA Ridgeplot — %s", label)) +
      theme_bw(base_size = 10)
    ggsave(file.path(figures_dir, sprintf("gsea_ridgeplot_%s.pdf", tag)), p_ridge, width = 11, height = 9)

    for (i in 1:min(3, nrow(gsea_df))) {
      p_ep <- gseaplot2(gsea, geneSetID = i, title = gsea_df$Description[i])
      ggsave(file.path(figures_dir, sprintf("gsea_enrichplot_%s_%02d.pdf", tag, i)),
             p_ep, width = 8, height = 5)
    }
  }

  invisible(list(go = go_df, kegg = kegg_df, gsea = gsea_df))
}

# ── Run enrichment for both contrasts ─────────────────────────────────────────
res_d1 <- read_csv(file.path(results_dir, "deseq2_NC_vs_D1_all.csv"), show_col_types = FALSE)
res_d2 <- read_csv(file.path(results_dir, "deseq2_NC_vs_D2_all.csv"), show_col_types = FALSE)

enrich_d1 <- run_enrichment(res_d1, "D1_vs_NC", "Acute Stroke D1 vs Control")
enrich_d2 <- run_enrichment(res_d2, "D2_vs_NC", "Subacute Stroke D2 vs Control")

# ── Comparison dotplot: shared GO-BP terms across both timepoints ──────────────
cat("Generating comparative dotplot (D1 vs D2 GO-BP overlap)...\n")

go_d1_df <- enrich_d1$go %>% filter(ONTOLOGY == "BP") %>%
  mutate(contrast = "Acute (D1)", GeneRatio_num = sapply(GeneRatio, function(x) eval(parse(text=x))))
go_d2_df <- enrich_d2$go %>% filter(ONTOLOGY == "BP") %>%
  mutate(contrast = "Subacute (D2)", GeneRatio_num = sapply(GeneRatio, function(x) eval(parse(text=x))))

shared_terms <- intersect(go_d1_df$Description, go_d2_df$Description)

if (length(shared_terms) >= 5) {
  combined <- bind_rows(
    go_d1_df %>% filter(Description %in% shared_terms),
    go_d2_df %>% filter(Description %in% shared_terms)
  ) %>%
    group_by(Description) %>%
    filter(min(p.adjust) < 0.05) %>%
    ungroup() %>%
    slice_min(p.adjust, n = 30, by = contrast)

  p_comp <- ggplot(combined,
                   aes(x = contrast, y = reorder(Description, -p.adjust),
                       size = GeneRatio_num, color = p.adjust)) +
    geom_point() +
    scale_color_gradient(low = "#D6604D", high = "#4393C3") +
    scale_size_continuous(range = c(2, 8)) +
    labs(title = "Shared GO-BP Terms: Acute vs Subacute Stroke",
         x = NULL, y = NULL,
         color = "Adj. p-value", size = "Gene Ratio") +
    theme_bw(base_size = 11) +
    theme(axis.text.y = element_text(size = 9))

  ggsave(file.path(figures_dir, "go_comparison_D1_vs_D2.pdf"), p_comp, width = 9, height = 10)
  ggsave(file.path(figures_dir, "go_comparison_D1_vs_D2.png"), p_comp, width = 9, height = 10, dpi = 300)
  cat(sprintf("  Shared GO-BP terms plotted: %d\n", length(shared_terms)))
}

cat("\n=== Enrichment analysis complete ===\n")
cat("    results/enrichment/\n")
cat("      go_D1_vs_NC.csv, go_D2_vs_NC.csv\n")
cat("      kegg_D1_vs_NC.csv, kegg_D2_vs_NC.csv\n")
cat("      gsea_D1_vs_NC.csv, gsea_D2_vs_NC.csv\n")
cat("    results/figures/\n")
cat("      go_dotplot_D1/D2, kegg_dotplot_D1/D2\n")
cat("      gsea_ridgeplot_D1/D2, go_comparison_D1_vs_D2\n")
