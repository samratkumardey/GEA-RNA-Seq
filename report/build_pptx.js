"use strict";
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ── Paths ──────────────────────────────────────────────────────────────────
const FIG = "C:/Users/arpit/Desktop/Genomics_project/results/figures";
const OUT = "C:/Users/arpit/Desktop/Genomics_project/report/GSE122709_Stroke_RNAseq_Presentation.pptx";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:    "0B2545",  // deep navy – titles, dark slides
  blue:    "1368AA",  // medical blue – headers, bars
  teal:    "0D7377",  // teal – secondary accents
  red:     "C0392B",  // down-reg / alert
  green:   "00A878",  // up-reg / positive
  gold:    "F2A900",  // highlights
  light:   "EEF4FC",  // slide background (content slides)
  white:   "FFFFFF",
  offwht:  "F8FAFD",
  gray:    "64748B",  // muted text
  lgray:   "CBD5E1",  // borders
  dgray:   "1E293B",  // dark text
};

// ── Shadow factory ─────────────────────────────────────────────────────────
const mkShadow = () => ({ type:"outer", blur:8, offset:3, angle:135, color:"000000", opacity:0.12 });

// ── Helpers ────────────────────────────────────────────────────────────────
function imgPath(name) { return path.join(FIG, name); }

function addSectionTag(slide, label, color=C.blue) {
  slide.addShape("rect", { x:0, y:0, w:13.33, h:0.55, fill:{color:color}, line:{color:color} });
  slide.addText(label, { x:0.3, y:0, w:12, h:0.55, fontSize:11, bold:true, color:C.white,
    fontFace:"Calibri", valign:"middle", margin:0 });
}

function addFooter(slide, num, total) {
  slide.addShape("rect", { x:0, y:7.28, w:13.33, h:0.22, fill:{color:C.navy}, line:{color:C.navy} });
  slide.addText("GSE122709 | PBMC RNA-seq in Acute Ischemic Stroke | DATA_SCI_8110", {
    x:0.3, y:7.28, w:10, h:0.22, fontSize:7.5, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  slide.addText(`${num} / ${total}`, {
    x:12.5, y:7.28, w:0.8, h:0.22, fontSize:7.5, color:C.white, fontFace:"Calibri",
    align:"right", valign:"middle", margin:0 });
}

function statBox(slide, x, y, w, h, bigNum, label, color=C.blue) {
  slide.addShape("rect", { x, y, w, h, fill:{color:color}, line:{color:color}, shadow:mkShadow() });
  slide.addText(bigNum, { x, y:y+0.05, w, h:h*0.55, fontSize:28, bold:true, color:C.white,
    fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  slide.addText(label, { x, y:y+h*0.52, w, h:h*0.45, fontSize:10, color:C.white,
    fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
}

function card(slide, x, y, w, h, title, body, titleColor=C.blue) {
  slide.addShape("rect", { x, y, w, h, fill:{color:C.white}, line:{color:C.lgray, pt:1}, shadow:mkShadow() });
  slide.addShape("rect", { x, y, w:w, h:0.33, fill:{color:titleColor}, line:{color:titleColor} });
  slide.addText(title, { x:x+0.1, y, w:w-0.1, h:0.33, fontSize:11, bold:true, color:C.white,
    fontFace:"Calibri", valign:"middle", margin:0 });
  slide.addText(body, { x:x+0.15, y:y+0.38, w:w-0.25, h:h-0.45, fontSize:10.5, color:C.dgray,
    fontFace:"Calibri", valign:"top", margin:0 });
}

// ═══════════════════════════════════════════════════════════════════════════
//  BUILD PRESENTATION
// ═══════════════════════════════════════════════════════════════════════════
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";           // 13.33" × 7.5"
pres.author  = "DATA_SCI_8110";
pres.title   = "PBMC RNA-seq in Acute Ischemic Stroke";
pres.subject = "GSE122709 Differential Expression Analysis";

const TOTAL = 22;

// ── SLIDE 1 · TITLE ────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Top accent bar
  s.addShape("rect", { x:0, y:0, w:13.33, h:1.1, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("DATA_SCI_8110 — Genomics Analytics  |  Course Project Presentation", {
    x:0.4, y:0, w:12.5, h:1.1, fontSize:13, color:C.white, fontFace:"Calibri",
    bold:false, valign:"middle", margin:0 });

  // Title
  s.addText("Differential Gene Expression Analysis\nof Peripheral Blood RNA-Seq in\nAcute Ischemic Stroke", {
    x:0.6, y:1.25, w:8.2, h:3.2, fontSize:34, bold:true, color:C.white,
    fontFace:"Calibri", valign:"middle", margin:0 });

  // Subtitle line
  s.addShape("rect", { x:0.6, y:4.5, w:7.5, h:0.05, fill:{color:C.gold}, line:{color:C.gold} });

  s.addText([
    { text:"Dataset: ", options:{ bold:true, color:C.gold } },
    { text:"GSE122709 (NCBI GEO) | BioProject: PRJNA506047\n", options:{ color:C.lgray } },
    { text:"Samples: ", options:{ bold:true, color:C.gold } },
    { text:"15 PBMC RNA-seq (5 Controls, 5 Day-1 Stroke, 5 Day-2 Stroke)\n", options:{ color:C.lgray } },
    { text:"Platform: ", options:{ bold:true, color:C.gold } },
    { text:"Illumina HiSeq X Ten | 150 bp paired-end", options:{ color:C.lgray } },
  ], { x:0.6, y:4.65, w:8, h:1.1, fontSize:11.5, fontFace:"Calibri", valign:"top", margin:0 });

  s.addText("April 2026", { x:0.6, y:5.85, w:4, h:0.35, fontSize:12, color:C.gray, fontFace:"Calibri", margin:0 });

  // Right decorative panel
  s.addShape("rect", { x:9.2, y:1.25, w:3.8, h:5.2, fill:{color:"112B50"}, line:{color:C.teal, pt:2} });
  s.addText("Key Numbers", { x:9.2, y:1.25, w:3.8, h:0.5, fontSize:12, bold:true, color:C.teal,
    fontFace:"Calibri", align:"center", valign:"middle", margin:0 });

  const stats = [["15","Human Subjects"],["8,594","DEGs at Day 1"],["60","DEGs at Day 2"],["55","Persistent Genes"],["12","KEGG Pathways"]];
  stats.forEach(([n,l], i) => {
    const ry = 1.85 + i*0.9;
    s.addShape("rect", { x:9.4, y:ry, w:3.4, h:0.75, fill:{color:"1A3A5C"}, line:{color:C.teal, pt:1} });
    s.addText(n, { x:9.4, y:ry, w:1.2, h:0.75, fontSize:22, bold:true, color:C.gold,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(l, { x:10.6, y:ry, w:2.2, h:0.75, fontSize:10.5, color:C.white,
      fontFace:"Calibri", valign:"middle", margin:0 });
  });

  // Bottom bar
  s.addShape("rect", { x:0, y:7.28, w:13.33, h:0.22, fill:{color:"060E1E"}, line:{color:"060E1E"} });
  s.addText("Slide 1 / 22", { x:12.5, y:7.28, w:0.8, h:0.22, fontSize:7.5, color:C.gray,
    fontFace:"Calibri", align:"right", valign:"middle", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 1 (Title)
Welcome. This presentation covers a complete bulk RNA-seq analysis of peripheral blood transcriptomes from acute ischemic stroke patients. We used publicly available data from NCBI GEO (accession GSE122709), encompassing 15 subjects: 5 healthy controls, 5 patients at Day 1 post-stroke (acute phase), and 5 at Day 2 (subacute phase). All analysis was performed from raw FASTQ files through differential expression and pathway enrichment — a fully reproducible pipeline run on a standard laptop.`);
}

// ── SLIDE 2 · AGENDA ───────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "PRESENTATION OVERVIEW");
  addFooter(s, 2, TOTAL);

  s.addText("Agenda", { x:0.4, y:0.65, w:12, h:0.6, fontSize:26, bold:true,
    color:C.navy, fontFace:"Calibri", margin:0 });

  const items = [
    ["1","Background & Motivation", "What is ischemic stroke? Why study blood? Why RNA-seq?"],
    ["2","Study Design & Dataset",   "15 subjects, 3 groups, SRA download, NCBI GEO"],
    ["3","Computational Pipeline",  "QC → Alignment → Quantification → DESeq2 → Enrichment"],
    ["4","Results: Quality Control","FastQC/MultiQC — uniformly high quality across all samples"],
    ["5","Results: Alignment",      "HISAT2 to GRCh38 — mean 95.1% alignment rate"],
    ["6","Results: DEG Analysis",   "8,594 DEGs (Day 1) vs 60 DEGs (Day 2) — PCA, volcano plots"],
    ["7","Results: Enrichment",     "Ribosome, NETs, Oxidative phosphorylation, DUSP signaling"],
    ["8","Discussion & Conclusions","Biological interpretation, clinical implications, limitations"],
  ];

  items.forEach(([num, title, desc], i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = col === 0 ? 0.3 : 6.85;
    const y = 1.4 + row * 1.4;
    s.addShape("rect", { x, y, w:6.2, h:1.2, fill:{color:C.white}, line:{color:C.lgray, pt:1}, shadow:mkShadow() });
    s.addShape("rect", { x, y, w:0.55, h:1.2, fill:{color:C.blue}, line:{color:C.blue} });
    s.addText(num, { x, y, w:0.55, h:1.2, fontSize:18, bold:true, color:C.white,
      fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(title, { x:x+0.65, y:y+0.08, w:5.4, h:0.38, fontSize:12, bold:true,
      color:C.navy, fontFace:"Calibri", valign:"top", margin:0 });
    s.addText(desc, { x:x+0.65, y:y+0.48, w:5.4, h:0.65, fontSize:10, color:C.gray,
      fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 2 (Agenda)
This presentation follows the structure of a scientific paper: background, methods, results, and discussion. We will walk through each step of the bioinformatics pipeline, show the actual figures generated, and connect the computational findings to the biology of stroke. Feel free to ask questions at the end.`);
}

// ── SLIDE 3 · BACKGROUND ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "BACKGROUND & MOTIVATION", C.teal);
  addFooter(s, 3, TOTAL);

  s.addText("What is Acute Ischemic Stroke — and Why Study the Blood?", {
    x:0.4, y:0.65, w:12.5, h:0.65, fontSize:24, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Left column – stroke biology
  card(s, 0.3, 1.42, 5.9, 2.5, "🧠  Acute Ischemic Stroke", [
    { text:"Caused by ", options:{} },
    { text:"arterial blockage", options:{bold:true} },
    { text:" cutting oxygen to brain tissue. Leading cause of death & long-term disability worldwide.\n\n", options:{} },
    { text:"Beyond direct brain damage, stroke triggers a powerful systemic ", options:{} },
    { text:"immune alarm", options:{bold:true} },
    { text:" detectable in circulating blood cells.", options:{} },
  ]);

  card(s, 0.3, 4.05, 5.9, 2.5, "🩸  Why Peripheral Blood (PBMCs)?", [
    { text:"Brain tissue is inaccessible in living patients. But ", options:{} },
    { text:"PBMCs (monocytes, lymphocytes, NK cells)", options:{bold:true} },
    { text:" are easily sampled and serve as a real-time 'window' into the immune response.\n\nGene expression in blood changes ", options:{} },
    { text:"within hours", options:{bold:true} },
    { text:" of stroke onset — making RNA-seq a powerful early readout.", options:{} },
  ]);

  // Right column
  card(s, 6.5, 1.42, 6.5, 2.5, "🔬  Why Bulk RNA-seq?", [
    { text:"RNA-seq quantifies ", options:{} },
    { text:"genome-wide gene expression", options:{bold:true} },
    { text:" simultaneously across all ~20,000 human genes.\n\nComparing stroke patients vs. healthy controls reveals which genes are turned ON or OFF — identifying molecular drivers of the immune response.", options:{} },
  ]);

  card(s, 6.5, 4.05, 6.5, 2.5, "🎯  Study Questions", [
    { text:"1. Which genes are differentially expressed in PBMCs of acute stroke vs. healthy controls?\n\n", options:{} },
    { text:"2. How does the response evolve from Day 1 (acute) to Day 2 (subacute)?\n\n", options:{} },
    { text:"3. Which biological pathways are enriched — and what do they reveal about stroke mechanisms?", options:{} },
  ]);

  s.addNotes(`SPEAKER NOTES – Slide 3 (Background)
Ischemic stroke occurs when a clot blocks cerebral blood flow. Within minutes, ischemia triggers necrosis and inflammation. This activates peripheral immune cells — monocytes and neutrophils enter the bloodstream and brain, driving secondary injury.

We study peripheral blood because it's accessible. PBMCs (peripheral blood mononuclear cells) change their gene expression rapidly after stroke, reflecting the systemic immune response. RNA-seq gives us an unbiased, whole-genome snapshot of this response.

Our three questions drive the entire analysis: what changes, when does it change, and what pathways explain it.`);
}

// ── SLIDE 4 · STUDY DESIGN ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "STUDY DESIGN & DATASET");
  addFooter(s, 4, TOTAL);

  s.addText("GSE122709 — Dataset Overview", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:24, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Timeline graphic
  s.addShape("rect", { x:0.5, y:1.42, w:12.3, h:1.6, fill:{color:C.white}, line:{color:C.lgray, pt:1}, shadow:mkShadow() });
  s.addText("STUDY TIMELINE", { x:0.6, y:1.5, w:3, h:0.35, fontSize:10, bold:true, color:C.gray, fontFace:"Calibri", margin:0 });

  // Timeline line
  s.addShape("rect", { x:1.2, y:2.3, w:11, h:0.08, fill:{color:C.lgray}, line:{color:C.lgray} });
  const tPoints = [[1.2,"Day 0\n(Stroke\nOnset)",C.red],[5.7,"Day 1\nSampling\n(Acute)",C.blue],[10.2,"Day 2\nSampling\n(Subacute)",C.teal]];
  tPoints.forEach(([x, label, col]) => {
    s.addShape("oval", { x:x-0.18, y:2.18, w:0.35, h:0.35, fill:{color:col}, line:{color:col} });
    s.addText(label, { x:x-0.8, y:2.6, w:1.8, h:0.65, fontSize:10, bold:false, color:C.dgray,
      fontFace:"Calibri", align:"center", valign:"top", margin:0 });
  });

  // Group boxes
  const groups = [
    { x:0.3, col:C.teal,  label:"NC — Controls",   n:"n = 5", acc:"SRR8207876–SRR8207880", desc:"Healthy adults, no neurological disease" },
    { x:4.75, col:C.blue, label:"D1 — Acute Stroke", n:"n = 5", acc:"SRR8207886–SRR8207890", desc:"Day 1 post-ischemic stroke" },
    { x:9.2, col:C.red,   label:"D2 — Subacute",    n:"n = 5", acc:"SRR8207881–SRR8207885", desc:"Day 2 post-ischemic stroke" },
  ];
  groups.forEach(g => {
    s.addShape("rect", { x:g.x, y:3.2, w:4.1, h:2.4, fill:{color:C.white}, line:{color:g.col, pt:2}, shadow:mkShadow() });
    s.addShape("rect", { x:g.x, y:3.2, w:4.1, h:0.5, fill:{color:g.col}, line:{color:g.col} });
    s.addText(g.label, { x:g.x+0.1, y:3.2, w:3, h:0.5, fontSize:13, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(g.n, { x:g.x+3.0, y:3.2, w:1.0, h:0.5, fontSize:16, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText([
      { text:"Accessions: ", options:{bold:true} }, { text:g.acc+"\n\n", options:{} },
      { text:g.desc, options:{italic:true, color:C.gray} },
    ], { x:g.x+0.15, y:3.8, w:3.8, h:1.7, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });
  });

  // Sequencing details
  s.addShape("rect", { x:0.3, y:5.75, w:12.7, h:1.25, fill:{color:C.navy}, line:{color:C.navy}, shadow:mkShadow() });
  const seqDetails = [
    ["Platform","Illumina HiSeq X Ten"],
    ["Read type","150 bp paired-end"],
    ["Depth","41–51 M read pairs/sample"],
    ["Total data","~98 GB compressed FASTQ"],
    ["Total reads","~700 M read pairs"],
  ];
  seqDetails.forEach(([k,v], i) => {
    s.addText(k, { x:0.5+i*2.55, y:5.82, w:2.4, h:0.35, fontSize:9, bold:true, color:C.gold, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(v, { x:0.5+i*2.55, y:6.17, w:2.4, h:0.68, fontSize:10, color:C.white, fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 4 (Dataset)
The dataset comes from a 2019 publication studying transcriptomic changes in blood after ischemic stroke. The design is straightforward: 5 healthy controls, 5 acute stroke patients sampled on Day 1, and 5 subacute patients sampled on Day 2.

Note that the same patients were NOT sampled twice — these are three independent cohorts at different timepoints. This is a cross-sectional design within each timepoint.

All 15 samples were downloaded from NCBI SRA using the SRA Toolkit. We downloaded approximately 98 GB of raw FASTQ data across 30 files (2 per sample for paired-end reads).`);
}

// ── SLIDE 5 · PIPELINE ────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addFooter(s, 5, TOTAL);

  s.addText("Computational Analysis Pipeline", {
    x:0.4, y:0.15, w:12.5, h:0.65, fontSize:26, bold:true, color:C.white, fontFace:"Calibri", margin:0 });
  s.addText("A fully reproducible, end-to-end RNA-seq workflow from raw FASTQ to biological interpretation",
    { x:0.4, y:0.78, w:12.5, h:0.35, fontSize:12, color:C.lgray, fontFace:"Calibri", margin:0 });

  const steps = [
    { icon:"①", title:"Download\n& Setup",    tool:"SRA Toolkit\nMiniconda / WSL2",  col:C.teal,  x:0.25 },
    { icon:"②", title:"Quality\nControl",      tool:"FastQC v0.12\nMultiQC v1.18",    col:C.blue,  x:2.75 },
    { icon:"③", title:"Genome\nAlignment",     tool:"HISAT2 v2.2\nSAMtools v1.18",    col:"6A5ACD", x:5.25 },
    { icon:"④", title:"Gene\nQuantification",  tool:"featureCounts\nGENCODE v44 GTF", col:C.gold,  x:7.75 },
    { icon:"⑤", title:"Differential\nExpression",tool:"DESeq2 v1.42\nR / Bioconductor",col:C.red,  x:10.25 },
  ];

  steps.forEach((st, i) => {
    s.addShape("rect", { x:st.x, y:1.3, w:2.3, h:3.4, fill:{color:"112B50"}, line:{color:st.col, pt:2}, shadow:mkShadow() });
    s.addShape("rect", { x:st.x, y:1.3, w:2.3, h:0.7, fill:{color:st.col}, line:{color:st.col} });
    s.addText(st.icon, { x:st.x, y:1.3, w:0.7, h:0.7, fontSize:20, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(st.title, { x:st.x, y:2.1, w:2.3, h:0.9, fontSize:13, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(st.tool, { x:st.x+0.1, y:3.1, w:2.1, h:0.7, fontSize:10, color:st.col, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    if(i < 4) s.addShape("rect", { x:st.x+2.3, y:2.85, w:0.45, h:0.1, fill:{color:C.lgray}, line:{color:C.lgray} });
  });

  // Step 6 - Enrichment (wider row)
  s.addShape("rect", { x:0.25, y:4.9, w:12.8, h:2.3, fill:{color:"112B50"}, line:{color:C.green, pt:2}, shadow:mkShadow() });
  s.addShape("rect", { x:0.25, y:4.9, w:12.8, h:0.55, fill:{color:C.green}, line:{color:C.green} });
  s.addText("⑥  Functional Enrichment Analysis", { x:0.45, y:4.9, w:9, h:0.55, fontSize:14, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText("clusterProfiler v4.10  |  org.Hs.eg.db", { x:9, y:4.9, w:4, h:0.55, fontSize:11, color:C.white, fontFace:"Calibri", align:"right", valign:"middle", margin:0 });

  const enrich = [
    ["enrichGO","Gene Ontology over-representation\n(BP, MF, CC ontologies)"],
    ["enrichKEGG","KEGG pathway enrichment\n(curated biological pathways)"],
    ["gseGO","Gene Set Enrichment Analysis\n(ranked — no hard cutoff)"],
  ];
  enrich.forEach(([name, desc], i) => {
    const ex = 0.55 + i*4.25;
    s.addText(name, { x:ex, y:5.55, w:4, h:0.4, fontSize:12, bold:true, color:C.gold, fontFace:"Calibri", margin:0 });
    s.addText(desc, { x:ex, y:5.95, w:4, h:0.9, fontSize:10, color:C.lgray, fontFace:"Calibri", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 5 (Pipeline)
The pipeline has six major steps. Steps 1-4 are bash scripts run in WSL2 (Ubuntu 22.04), while Steps 5-6 are R scripts.

Step 1: Downloaded all 15 samples from NCBI SRA using prefetch + fasterq-dump. Total ~98 GB.
Step 2: FastQC checked each file individually; MultiQC aggregated all 30 reports.
Step 3: HISAT2 aligned 150bp paired-end reads to GRCh38. SAMtools sorted and indexed BAMs.
Step 4: featureCounts counted reads per gene using GENCODE v44 annotation.
Step 5: DESeq2 tested two contrasts: D1 vs NC (acute) and D2 vs NC (subacute).
Step 6: clusterProfiler ran GO, KEGG, and GSEA enrichment for each contrast.

The entire pipeline ran on a 16 GB RAM laptop — demonstrating that sophisticated genomics analysis is accessible without HPC resources.`);
}

// ── SLIDE 6 · QC RESULTS ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — QUALITY CONTROL", C.teal);
  addFooter(s, 6, TOTAL);

  s.addText("FastQC / MultiQC — All 30 Files Passed", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:23, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Summary table
  const tbl = [
    [{ text:"QC Metric", options:{bold:true,color:C.white,fill:{color:C.blue}} },
     { text:"Result", options:{bold:true,color:C.white,fill:{color:C.blue}} },
     { text:"Status", options:{bold:true,color:C.white,fill:{color:C.blue}} },
     { text:"Interpretation", options:{bold:true,color:C.white,fill:{color:C.blue}} }],
    ["Read length","150 bp (all 15 samples)","✔ PASS","Consistent with HiSeq X Ten"],
    ["Reads per sample","41.1 – 50.7 M pairs","✔ PASS","Excellent depth for DEG analysis"],
    ["Per-base quality","Q > 30 all files","✔ PASS","No low-quality samples"],
    ["Adapter content","None detected","✔ PASS","Trimming NOT required"],
    ["GC content","44 – 50%","✔ PASS","Normal human RNA range"],
    ["Sequence duplication","60–81% (NC) vs 38–55% (D1)","⚠ FAIL*","Expected in RNA-seq — not an artifact"],
    ["Per-base seq content","Bias at read start","⚠ FAIL*","Universal RNA-seq hexamer bias"],
  ];
  s.addTable(tbl, { x:0.3, y:1.38, w:12.7, h:3.55, colW:[3,2.6,1.4,5.7],
    border:{pt:1, color:C.lgray},
    autoPage:false,
    fontSize:10.5, fontFace:"Calibri", color:C.dgray,
    rowH:0.46 });

  // Insight boxes
  s.addShape("rect", { x:0.3, y:5.05, w:5.9, h:1.9, fill:{color:C.white}, line:{color:C.teal, pt:2}, shadow:mkShadow() });
  s.addShape("rect", { x:0.3, y:5.05, w:5.9, h:0.38, fill:{color:C.teal}, line:{color:C.teal} });
  s.addText("💡  Biological QC Insight", { x:0.4, y:5.05, w:5.7, h:0.38, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText("D1 (acute stroke) samples showed LOWER duplication rates (38–55%) vs NC controls (60–81%). Lower duplication = more transcriptional diversity — an early signal that the biology is real and the immune landscape is broader in acute stroke.", {
    x:0.45, y:5.5, w:5.7, h:1.38, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  s.addShape("rect", { x:6.5, y:5.05, w:6.5, h:1.9, fill:{color:C.white}, line:{color:C.blue, pt:2}, shadow:mkShadow() });
  s.addShape("rect", { x:6.5, y:5.05, w:6.5, h:0.38, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("✅  Decision: No Trimming Required", { x:6.6, y:5.05, w:6.3, h:0.38, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText([
    { text:"All 15 samples passed core quality thresholds. The two 'FAIL' flags (*) are expected RNA-seq artifacts:\n", options:{} },
    { text:"• Duplication: ", options:{bold:true} }, { text:"reflects high-abundance transcripts — biologically meaningful\n", options:{} },
    { text:"• Per-base bias: ", options:{bold:true} }, { text:"random hexamer priming artifact at read start — universal in RNA-seq", options:{} },
  ], { x:6.65, y:5.5, w:6.2, h:1.38, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 6 (QC)
FastQC checks each FASTQ file independently. MultiQC aggregates all 30 reports into one dashboard for easy comparison.

The important takeaway: zero samples failed. All proceeded to alignment without trimming.

The two 'FAIL' flags are not real failures — they are expected artifacts of RNA-seq:
- High duplication is expected because highly-expressed genes generate many identical reads
- Per-base sequence content bias at the start is caused by random hexamer priming during library preparation — universal and harmless

The observation that D1 stroke samples have lower duplication than controls is biologically interesting: it suggests that the transcriptome is more diverse during acute stroke, with many different genes being activated simultaneously.`);
}

// ── SLIDE 7 · ALIGNMENT ───────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — GENOME ALIGNMENT");
  addFooter(s, 7, TOTAL);

  s.addText("HISAT2 → GRCh38  |  Mean Alignment Rate: 95.1%", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:23, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Alignment bar chart via pptxgenjs
  const samples = ["NC_1","NC_3","NC_4","NC_5","NC_6","D1_1","D1_2","D1_3","D1_4","D1_5","D2_1","D2_2","D2_3","D2_4","D2_6"];
  const rates   = [94.82,95.71,95.78,95.19,92.45,95.28,95.85,94.69,95.52,95.56,95.48,95.42,95.22,94.84,96.04];
  const colors  = [...Array(5).fill(C.teal), ...Array(5).fill(C.blue), ...Array(5).fill(C.red)];

  s.addChart(pres.charts.BAR, [{
    name:"Alignment Rate (%)", labels: samples, values: rates,
  }], {
    x:0.3, y:1.35, w:8.8, h:4.3,
    barDir:"col",
    chartColors: colors,
    chartArea:{ fill:{color:C.white}, roundedCorners:false },
    plotArea:{ fill:{color:C.white} },
    catAxisLabelColor:C.dgray, valAxisLabelColor:C.dgray,
    valGridLine:{ color:"E2E8F0", size:0.5 },
    catGridLine:{ style:"none" },
    valAxisMinVal:90, valAxisMaxVal:97,
    showValue:true, dataLabelColor:C.dgray, dataLabelFontSize:8,
    dataLabelPosition:"outEnd",
    showLegend:false,
    valAxisTitle:"Alignment Rate (%)", showValAxisTitle:true,
    valAxisTitleColor:C.gray, valAxisTitleFontSize:10,
  });

  // Legend
  [["NC — Controls",C.teal],["D1 — Acute Stroke",C.blue],["D2 — Subacute",C.red]].forEach(([l,c],i) => {
    s.addShape("rect", { x:0.4+i*2.2, y:5.8, w:0.28, h:0.22, fill:{color:c}, line:{color:c} });
    s.addText(l, { x:0.75+i*2.2, y:5.79, w:1.8, h:0.22, fontSize:10, color:C.dgray, fontFace:"Calibri", valign:"middle", margin:0 });
  });

  // Key stats sidebar
  const kStats = [["95.1%","Mean rate (all 15)"],["92.4%","Lowest (NC_6)"],["96.0%","Highest (D2_6)"],["0","Failed samples"]];
  kStats.forEach(([n,l],i) => {
    statBox(s, 9.4, 1.35+i*1.1, 3.6, 0.95, n, l, i===3 ? C.green : C.blue);
  });

  s.addShape("rect", { x:9.4, y:5.72, w:3.6, h:0.85, fill:{color:"FEFCE8"}, line:{color:C.gold, pt:1} });
  s.addText("✅ All samples exceed the >85% quality threshold — no samples excluded from downstream analysis.",
    { x:9.5, y:5.74, w:3.4, h:0.8, fontSize:9.5, color:C.dgray, fontFace:"Calibri", valign:"middle", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 7 (Alignment)
HISAT2 is a splice-aware aligner — critical for RNA-seq because many reads span exon-exon junctions created during mRNA splicing.

The alignment rate measures what percentage of input reads were successfully mapped to the reference genome (GRCh38, the latest human assembly). Our mean rate of 95.1% is excellent — most RNA-seq studies aim for >85%.

The rates are remarkably consistent across all three groups (NC, D1, D2), which is important: it means that any differences we see in gene expression are due to biology, not technical differences in sequencing quality.

One sample (NC_6) had a slightly lower rate of 92.45%, still well above threshold.

Note: Due to 16 GB RAM constraints, we processed one sample at a time and limited SAMtools sort memory to 512 MB per thread to avoid out-of-memory errors.`);
}

// ── SLIDE 8 · QUANTIFICATION ──────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — GENE QUANTIFICATION");
  addFooter(s, 8, TOTAL);

  s.addText("featureCounts — Gene-Level Read Counting", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:23, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Workflow
  const wfSteps = ["BAM files\n(15 samples)","featureCounts\n(-s 0 unstranded,\n-p paired-end)","Count matrix\n(62,700 genes\n× 15 samples)","Pre-filtering\n(≥10 counts in\n≥5 samples)","23,995 genes\nretained for\nDESeq2"];
  wfSteps.forEach((t, i) => {
    const x = 0.35 + i * 2.58;
    const col = i === 4 ? C.green : (i===0 ? C.teal : C.blue);
    s.addShape("rect", { x, y:1.38, w:2.3, h:1.1, fill:{color:col}, line:{color:col}, shadow:mkShadow() });
    s.addText(t, { x, y:1.38, w:2.3, h:1.1, fontSize:10, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    if(i<4) s.addShape("rect", { x:x+2.3, y:1.82, w:0.28, h:0.1, fill:{color:C.lgray}, line:{color:C.lgray} });
  });

  // Assignment info cards
  card(s, 0.3, 2.68, 5.9, 2.25, "Assignment Rates (34–47%)", [
    { text:"Assignment rates were below the ideal 60% benchmark. The main reason:\n\n", options:{} },
    { text:"Unassigned_NoFeatures:", options:{bold:true} },
    { text:" reads that aligned correctly to the genome but fell in ", options:{} },
    { text:"introns or intergenic regions", options:{bold:true} },
    { text:" not covered by exon annotation — a common consequence of unstranded library prep.", options:{} },
  ]);

  card(s, 6.5, 2.68, 6.5, 2.25, "Why Analysis Remains Valid", [
    { text:"Despite lower assignment rates, the analysis is statistically valid because:\n\n", options:{} },
    { text:"• 14–25 million assigned read pairs per sample ", options:{bold:true} },
    { text:"(minimum ~5M needed)\n", options:{} },
    { text:"• Rates are internally consistent ", options:{bold:true} },
    { text:"within each group (NC/D1/D2)\n", options:{} },
    { text:"• DESeq2 size-factor normalization ", options:{bold:true} },
    { text:"corrects for library size differences", options:{} },
  ]);

  // Strandedness note
  s.addShape("rect", { x:0.3, y:5.08, w:12.7, h:1.6, fill:{color:"FFF8E1"}, line:{color:C.gold, pt:2}, shadow:mkShadow() });
  s.addText("⚠️  Strandedness Discovery", { x:0.5, y:5.12, w:4, h:0.4, fontSize:12, bold:true, color:C.gold, fontFace:"Calibri", margin:0 });
  s.addText([
    { text:"Initial run used ", options:{} },
    { text:"-s 2 (reverse-stranded)", options:{bold:true, color:C.red} },
    { text:" → only 34% assignment. Switching to ", options:{} },
    { text:"-s 0 (unstranded)", options:{bold:true, color:C.green} },
    { text:" improved rates.\nDiagnosis: The ", options:{} },
    { text:"Unassigned_NoFeatures pattern", options:{bold:true} },
    { text:" confirmed the library was unstranded — reads on both strands were counted. This is a critical parameter check in any RNA-seq pipeline.", options:{} },
  ], { x:0.5, y:5.55, w:12.3, h:1.0, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 8 (Quantification)
featureCounts counts how many reads map to each gene. It uses the GENCODE v44 annotation — one of the most comprehensive human gene annotations with 62,700 features including protein-coding genes, lncRNAs, and pseudogenes.

Key parameters: -p counts read pairs (fragments) rather than individual reads; -s 0 means unstranded (both DNA strands counted equally); -B requires both reads of a pair to map.

The strandedness discovery is an important lesson: always check the strandedness of your library. An incorrect parameter (-s 2 instead of -s 0) cut our assignment rate in half. The diagnostic: look at which category has most unassigned reads. If it's Unassigned_Strand, the strandedness parameter is wrong.

After filtering for minimum expression (10 counts in at least 5 of 15 samples), we retained 23,995 genes — these are the genes with enough signal for reliable statistical testing.`);
}

// ── SLIDE 9 · PCA ─────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — SAMPLE CLUSTERING (PCA)");
  addFooter(s, 9, TOTAL);

  s.addText("Principal Component Analysis — Sample Separation by Condition", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  s.addImage({ path: imgPath("pca_all_samples.png"), x:0.3, y:1.35, w:7.5, h:5.3, sizing:{type:"contain",w:7.5,h:5.3} });

  // Annotation cards
  card(s, 8.1, 1.35, 5.0, 1.5, "What is PCA?", "Reduces 23,995 gene expression measurements into 2–3 summary axes. Samples with similar expression cluster together; distinct biology separates them.", C.teal);

  card(s, 8.1, 3.0, 5.0, 1.5, "What We Expect", "• NC (blue): tight cluster — consistent healthy baseline\n• D1 (red): separated from NC along PC1 — massive acute response\n• D2 (orange): between NC and D1 — partial recovery", C.blue);

  card(s, 8.1, 4.65, 5.0, 1.55, "Key Interpretation", "Clear separation validates that:\n✔ Groups are transcriptionally distinct\n✔ Technical quality is comparable\n✔ Observed differences reflect biology\n✔ No batch effects detected", C.green);

  s.addNotes(`SPEAKER NOTES – Slide 9 (PCA)
Principal Component Analysis (PCA) is a dimensionality reduction technique. Instead of looking at 23,995 gene expression measurements, PCA summarizes them into a few axes (principal components) that capture the most variance.

If our experiment worked, we expect to see three distinct clusters corresponding to our three conditions. The NC samples should cluster tightly (healthy baseline is consistent). D1 samples should be far from NC (large transcriptional response). D2 samples should be somewhere between NC and D1 (partial recovery).

PCA also reveals technical issues: if samples from the same group cluster in different places, there may be a batch effect or sample swap. No such issues were observed here.

The PCA was performed on VST (variance-stabilizing transformation) counts, which stabilize the variance across the expression range — important for proper distance calculation.`);
}

// ── SLIDE 10 · DEG D1 ─────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — DIFFERENTIAL EXPRESSION: ACUTE STROKE (DAY 1)");
  addFooter(s, 10, TOTAL);

  s.addText("Day 1 vs. Control  —  8,594 Differentially Expressed Genes", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:21, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Volcano plot
  s.addImage({ path: imgPath("volcano_D1_vs_NC.png"), x:0.25, y:1.35, w:6.9, h:5.3, sizing:{type:"contain",w:6.9,h:5.3} });

  // Stats
  statBox(s, 7.4, 1.35, 2.7, 1.05, "8,594", "Total DEGs (padj<0.05, |LFC|>1)", C.blue);
  statBox(s, 10.3, 1.35, 2.7, 1.05, "35.8%", "of all expressed genes", C.navy);
  statBox(s, 7.4, 2.55, 2.7, 1.05, "4,890", "Upregulated genes", C.green);
  statBox(s, 10.3, 2.55, 2.7, 1.05, "3,704", "Downregulated genes", C.red);

  // Top genes
  s.addShape("rect", { x:7.4, y:3.72, w:5.6, h:2.93, fill:{color:C.white}, line:{color:C.lgray, pt:1}, shadow:mkShadow() });
  s.addShape("rect", { x:7.4, y:3.72, w:5.6, h:0.38, fill:{color:C.navy}, line:{color:C.navy} });
  s.addText("Notable DEGs", { x:7.5, y:3.72, w:5.4, h:0.38, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });

  const degs = [
    ["PPBP (CXCL7)","LFC −4.69","Top downregulated | Platelet chemokine",C.red],
    ["RGS18","LFC −3.20","Platelet activation regulator",C.red],
    ["ELANE","↑ Up","Neutrophil elastase — NET formation",C.green],
    ["S100A12","↑ Up","Neutrophil/monocyte alarmin",C.green],
    ["CXCL9/10","↑ Up","Pro-inflammatory chemokines",C.green],
  ];
  degs.forEach(([gene, lfc, desc, col], i) => {
    const gy = 4.18 + i*0.47;
    s.addShape("rect", { x:7.55, y:gy, w:0.9, h:0.35, fill:{color:col}, line:{color:col} });
    s.addText(gene, { x:7.55, y:gy, w:0.9, h:0.35, fontSize:8.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(lfc, { x:8.5, y:gy, w:1.0, h:0.35, fontSize:9, bold:true, color:col, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(desc, { x:9.55, y:gy, w:3.3, h:0.35, fontSize:9, color:C.dgray, fontFace:"Calibri", valign:"middle", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 10 (DEG Day 1)
This is the headline result: 8,594 differentially expressed genes on Day 1 post-stroke. For context, a typical immune stimulation experiment (e.g., LPS-treated monocytes in the lab) yields 2,000–4,000 DEGs. The stroke response is roughly 2–4 times larger — reflecting the convergence of multiple simultaneous immune insults.

The volcano plot shows log2 fold change (x-axis) vs. statistical significance (y-axis). The dashed lines mark our thresholds: padj < 0.05 and |LFC| > 1 (2-fold change). Red dots are downregulated, blue dots are upregulated.

The most strongly downregulated gene, PPBP (also called CXCL7), is a platelet-derived chemokine. Its extreme downregulation (nearly 5-fold) likely reflects platelet consumption at the thrombus site and altered platelet-immune cell crosstalk during stroke.

Upregulated genes include immune effectors: ELANE (neutrophil elastase, a key marker of neutrophil activation), S100A12 (an alarmin), and chemokines CXCL9/CXCL10.`);
}

// ── SLIDE 11 · DEG D2 ─────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — DIFFERENTIAL EXPRESSION: SUBACUTE STROKE (DAY 2)");
  addFooter(s, 11, TOTAL);

  s.addText("Day 2 vs. Control  —  Dramatic Resolution to Only 60 DEGs", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:21, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  s.addImage({ path: imgPath("volcano_D2_vs_NC.png"), x:0.25, y:1.35, w:6.9, h:5.3, sizing:{type:"contain",w:6.9,h:5.3} });

  statBox(s, 7.4, 1.35, 2.7, 1.05, "60", "Total DEGs", C.teal);
  statBox(s, 10.3, 1.35, 2.7, 1.05, "143×", "Reduction from Day 1", C.gold);
  statBox(s, 7.4, 2.55, 2.7, 1.05, "45", "Upregulated", C.green);
  statBox(s, 10.3, 2.55, 2.7, 1.05, "15", "Downregulated", C.red);

  // DUSP box
  s.addShape("rect", { x:7.4, y:3.72, w:5.6, h:3.0, fill:{color:C.white}, line:{color:C.teal, pt:2}, shadow:mkShadow() });
  s.addShape("rect", { x:7.4, y:3.72, w:5.6, h:0.42, fill:{color:C.teal}, line:{color:C.teal} });
  s.addText("🔬 Key Finding: DUSP2 & DUSP8 Upregulation", { x:7.5, y:3.72, w:5.4, h:0.42, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText([
    { text:"Dual-Specificity Phosphatases 2 & 8\n\n", options:{bold:true, color:C.teal} },
    { text:"Function: ", options:{bold:true} },
    { text:"Deactivate ERK and p38 MAP kinase signaling cascades by dephosphorylation\n\n", options:{} },
    { text:"Significance: ", options:{bold:true} },
    { text:"DUSP2/DUSP8 upregulation at Day 2 indicates that the immune system is ", options:{} },
    { text:"actively suppressing inflammation", options:{bold:true, color:C.teal} },
    { text:" — transitioning from an alarm state to resolution.\n\n", options:{} },
    { text:"This aligns with known post-stroke immunodepression syndrome (PIDS).", options:{italic:true, color:C.gray} },
  ], { x:7.55, y:4.22, w:5.3, h:2.4, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 11 (DEG Day 2)
The collapse from 8,594 DEGs to just 60 in 24 hours is one of the most striking findings of this study. It tells us that the acute immune response is largely transient.

The volcano plot for Day 2 looks very different from Day 1: most genes fall inside the significance thresholds (they're no longer significantly different from controls), and the few that remain are scattered near the edges.

The two most notable upregulated genes are DUSP2 and DUSP8 — dual-specificity phosphatases. These are enzymes that deactivate MAP kinase signaling, specifically the ERK and p38 pathways that drive inflammation. Their upregulation is a clear molecular signature of active immune resolution.

This connects to a well-documented clinical phenomenon called Post-stroke Immunodepression Syndrome (PIDS), where the initial immune activation is followed by profound immune suppression, which unfortunately increases susceptibility to infections like pneumonia and UTIs.`);
}

// ── SLIDE 12 · TEMPORAL OVERLAP ───────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — TEMPORAL DYNAMICS: PERSISTENT vs TRANSIENT CHANGES");
  addFooter(s, 12, TOTAL);

  s.addText("DEG Overlap: What Persists from Day 1 to Day 2?", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // Bar chart — DEG comparison
  s.addChart(pres.charts.BAR, [
    { name:"DEG Count", labels:["Day 1 — Acute","Day 2 — Subacute","Shared (D1∩D2)","D1 Only","D2 Only"],
      values:[8594,60,55,8539,5] },
  ], {
    x:0.3, y:1.35, w:6.5, h:4.4,
    barDir:"bar",
    chartColors:[C.blue,C.red,C.gold,C.blue,C.red],
    chartArea:{ fill:{color:C.white} },
    catAxisLabelColor:C.dgray, valAxisLabelColor:C.dgray,
    valGridLine:{ color:"E2E8F0", size:0.5 },
    catGridLine:{ style:"none" },
    showValue:true, dataLabelColor:C.dgray, dataLabelFontSize:9,
    showLegend:false,
    valAxisTitle:"Number of DEGs",
    showValAxisTitle:true, valAxisTitleFontSize:10,
  });

  // 3-circle Venn-like summary
  const vx = 7.0, vy = 1.42;
  s.addShape("oval", { x:vx, y:vy, w:3.8, h:3.0, fill:{color:C.blue, transparency:70}, line:{color:C.blue, pt:2} });
  s.addShape("oval", { x:vx+2.2, y:vy+0.6, w:3.8, h:3.0, fill:{color:C.red, transparency:70}, line:{color:C.red, pt:2} });
  s.addText("Day 1 Only\n8,539 genes", { x:vx+0.05, y:vy+1.0, w:2.1, h:0.8, fontSize:11, bold:true, color:C.blue, fontFace:"Calibri", align:"center", margin:0 });
  s.addText("55\nShared", { x:vx+2.1, y:vy+1.5, w:2.0, h:0.7, fontSize:13, bold:true, color:C.navy, fontFace:"Calibri", align:"center", margin:0 });
  s.addText("Day 2 Only\n5 genes", { x:vx+3.9, y:vy+1.8, w:2.1, h:0.8, fontSize:11, bold:true, color:C.red, fontFace:"Calibri", align:"center", margin:0 });

  // Interpretation
  s.addShape("rect", { x:7.0, y:4.72, w:6.1, h:2.0, fill:{color:C.white}, line:{color:C.gold, pt:2}, shadow:mkShadow() });
  s.addShape("rect", { x:7.0, y:4.72, w:6.1, h:0.38, fill:{color:C.gold}, line:{color:C.gold} });
  s.addText("💡  The 55 Persistent Genes — Clinical Significance", { x:7.1, y:4.72, w:5.9, h:0.38, fontSize:11, bold:true, color:C.navy, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText([
    { text:"Persistently altered at 48 hours → most biologically meaningful set\n", options:{bold:true} },
    { text:"• Candidate prognostic biomarkers for stroke severity\n", options:{} },
    { text:"• Potential therapeutic targets for post-stroke immune dysregulation\n", options:{} },
    { text:"• Core (not reactive) components of the stroke immune signature", options:{} },
  ], { x:7.1, y:5.16, w:5.9, h:1.48, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  s.addShape("rect", { x:0.3, y:5.85, w:6.5, h:0.85, fill:{color:"EFF6FF"}, line:{color:C.blue, pt:1} });
  s.addText("The 143-fold reduction in DEGs (8,594 → 60) between Day 1 and Day 2 demonstrates that the acute transcriptomic response is largely transient, resolving within 24 hours — consistent with normal immunological homeostasis.",
    { x:0.4, y:5.88, w:6.3, h:0.8, fontSize:10, color:C.dgray, fontFace:"Calibri", valign:"middle", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 12 (Temporal Overlap)
This slide compares the DEG landscapes at the two timepoints to understand which changes are transient vs. persistent.

The Venn diagram approach reveals that 8,539 genes (99.4% of Day 1 DEGs) are acute-only — they return to near-normal levels by Day 2. Only 55 genes remain significantly different from controls at both timepoints.

The 55 shared genes are arguably the most interesting biologically: they represent sustained changes that persist for at least 24 hours. These could be biomarkers of stroke severity or duration, or therapeutic targets.

The 5 genes unique to Day 2 represent late-emerging changes — genes that weren't significantly different on Day 1 but became so by Day 2. These might represent adaptive or resolution-phase responses.`);
}

// ── SLIDE 13 · KEGG D1 ────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — KEGG PATHWAY ENRICHMENT: ACUTE STROKE (DAY 1)", C.teal);
  addFooter(s, 13, TOTAL);

  s.addText("12 Enriched KEGG Pathways  |  Four Major Biological Themes", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  s.addImage({ path: imgPath("kegg_dotplot_D1_vs_NC.png"), x:0.3, y:1.35, w:7.0, h:5.3, sizing:{type:"contain",w:7.0,h:5.3} });

  // Theme cards
  const themes = [
    { theme:"① Ribosomal Biogenesis", detail:"Ribosome (112 genes, p=5.7×10⁻²³)\n→ Immune cells ramp up protein synthesis to fuel the response", col:C.blue },
    { theme:"② Immunothrombosis", detail:"Neutrophil extracellular traps (82 genes, p=1.0×10⁻⁵)\nHistones + ELANE → NETs promote clotting & brain damage", col:C.red },
    { theme:"③ Metabolic Reprogramming", detail:"Oxidative phosphorylation (49 genes, p=1.4×10⁻²)\n→ Mitochondrial upregulation to power immune activation", col:C.teal },
    { theme:"④ Chromatin Remodeling", detail:"Systemic lupus (79 genes) + Alcoholism (83 genes)\n→ Histone gene clusters H2A/H2B/H3/H4 upregulated", col:C.gold },
  ];
  themes.forEach((t, i) => {
    const ty = 1.35 + i*1.35;
    s.addShape("rect", { x:7.55, y:ty, w:5.5, h:1.2, fill:{color:C.white}, line:{color:t.col, pt:2}, shadow:mkShadow() });
    s.addShape("rect", { x:7.55, y:ty, w:5.5, h:0.35, fill:{color:t.col}, line:{color:t.col} });
    s.addText(t.theme, { x:7.65, y:ty, w:5.3, h:0.35, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(t.detail, { x:7.65, y:ty+0.38, w:5.3, h:0.75, fontSize:10, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 13 (KEGG Day 1)
KEGG (Kyoto Encyclopedia of Genes and Genomes) is a curated database of biological pathways. Enrichment analysis tests whether our DEGs are over-represented in any of these pathways beyond chance.

The dotplot shows pathways on the y-axis, gene ratio (proportion of DEGs in the pathway) on the x-axis, dot size represents gene count, and color represents significance (p-value).

Four major biological themes emerge:

1. Ribosome — the single most significant pathway (p=5.7×10⁻²³). 112 ribosomal protein genes (RPL/RPS families) are upregulated. This makes sense: activated immune cells need massive amounts of new protein to mount a response.

2. Neutrophil extracellular trap (NET) formation — NETs are web-like structures released by neutrophils, composed of DNA and granule proteins. They trap bacteria but also promote thrombosis and brain damage in stroke. This is a key mechanism of stroke-related immunothrombosis.

3. Oxidative phosphorylation — activated immune cells upregulate mitochondrial energy production to fuel cytokine synthesis and phagocytosis.

4. Chromatin remodeling — histone gene upregulation reflects the massive chromatin reorganization involved in NET formation and transcriptional reprogramming.`);
}

// ── SLIDE 14 · GO D1 ──────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — GO ENRICHMENT: ACUTE STROKE (DAY 1)", C.teal);
  addFooter(s, 14, TOTAL);

  s.addText("63 Enriched GO Terms  |  Antimicrobial Immune Response Dominant", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  s.addImage({ path: imgPath("go_dotplot_D1_vs_NC.png"), x:0.3, y:1.35, w:7.5, h:5.3, sizing:{type:"contain",w:7.5,h:5.3} });

  card(s, 8.05, 1.35, 5.0, 1.65, "GO Enrichment Design", "Three ontologies tested independently:\n• BP (Biological Process) — what the genes do\n• MF (Molecular Function) — their biochemical role\n• CC (Cellular Component) — where they act", C.teal);

  card(s, 8.05, 3.12, 5.0, 1.65, "Top GO-BP Hits", "• Antimicrobial humoral immune response (p=5.4×10⁻⁵)\n• Neutrophil activation (CXCL5, CXCL9, CXCL10)\n• Defense response to bacterium\n• Cytokine-mediated signaling pathway", C.blue);

  card(s, 8.05, 4.9, 5.0, 1.75, "Key Effector Genes", [
    { text:"ELANE", options:{bold:true, color:C.green} }, { text:" — neutrophil elastase (NET)\n", options:{} },
    { text:"S100A12", options:{bold:true, color:C.green} }, { text:" — alarmin, monocyte/neutrophil activation\n", options:{} },
    { text:"CXCL9/CXCL10", options:{bold:true, color:C.green} }, { text:" — chemokine recruitment signals\n", options:{} },
    { text:"PPBP/CXCL7", options:{bold:true, color:C.red} }, { text:" — platelet chemokine (downregulated)", options:{} },
  ]);

  s.addNotes(`SPEAKER NOTES – Slide 14 (GO Day 1)
Gene Ontology (GO) provides a controlled vocabulary of biological functions. GO enrichment analysis asks: do our DEGs cluster in specific functional categories?

With 63 enriched GO terms, the dominant biological theme is antimicrobial immune response. This reflects the activation of innate immunity — the body's first-line defense — in response to the ischemic damage signal.

Key genes driving this enrichment:
- ELANE (neutrophil elastase): released by neutrophils during NET formation
- S100A12: an alarmin — a damage signal that activates immune cells
- CXCL9, CXCL10: interferon-induced chemokines that recruit T cells and NK cells to sites of inflammation
- CXCL5: neutrophil chemoattractant

The GO analysis complements the KEGG analysis by providing a more granular, gene-level view of the biological functions enriched in our DEG set.`);
}

// ── SLIDE 15 · NETs MECHANISM ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "BIOLOGICAL DEEP DIVE — NEUTROPHIL EXTRACELLULAR TRAPS (NETs)", C.red);
  addFooter(s, 15, TOTAL);

  s.addText("NETs: The Critical Mechanistic Link Between Stroke & Thrombosis", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:21, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  // NET mechanism flow
  const netSteps = [
    { t:"Stroke\nOnset", d:"Ischemia → DAMPs released", c:C.navy },
    { t:"Neutrophil\nActivation", d:"Mobilized from bone marrow → blood", c:"6A5ACD" },
    { t:"NET\nFormation", d:"Chromatin decondenses:\nH2A/H2B/H3/H4 + ELANE", c:C.red },
    { t:"Vascular\nDamage", d:"NETs → promote thrombosis, damage BBB", c:"8B0000" },
  ];
  netSteps.forEach((st, i) => {
    s.addShape("rect", { x:0.3+i*3.25, y:1.4, w:2.95, h:1.65, fill:{color:st.c}, line:{color:st.c}, shadow:mkShadow() });
    s.addText(st.t, { x:0.3+i*3.25, y:1.4, w:2.95, h:0.6, fontSize:13, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(st.d, { x:0.3+i*3.25, y:2.0, w:2.95, h:0.98, fontSize:10, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    if(i<3) s.addShape("rect", { x:0.3+i*3.25+2.95, y:2.12, w:0.3, h:0.1, fill:{color:C.lgray}, line:{color:C.lgray} });
  });

  // Evidence + genes
  card(s, 0.3, 3.25, 6.0, 3.4, "Evidence From Our Data", [
    { text:"Genes enriched in NET formation pathway:\n\n", options:{} },
    { text:"• H2A, H2B, H3, H4 family genes", options:{bold:true} }, { text:"\n  — Histone proteins forming the NET chromatin scaffold\n\n", options:{} },
    { text:"• ELANE", options:{bold:true} }, { text:"\n  — Neutrophil elastase, released into NETs to kill bacteria\n\n", options:{} },
    { text:"• MPO (Myeloperoxidase)", options:{bold:true} }, { text:"\n  — Oxidative burst enzyme, NET component\n\n", options:{} },
    { text:"82 genes enriched  |  KEGG p = 1.0 × 10⁻⁵", options:{italic:true, color:C.gray} },
  ]);

  card(s, 6.6, 3.25, 6.4, 3.4, "Clinical & Therapeutic Implications", [
    { text:"NETs in Stroke (Literature):\n", options:{bold:true} },
    { text:"• Identified ", options:{} }, { text:"within cerebral thrombi", options:{bold:true} }, { text:" recovered by thrombectomy\n", options:{} },
    { text:"• Promote platelet aggregation and coagulation\n", options:{} },
    { text:"• Directly damage the blood-brain barrier (BBB)\n", options:{} },
    { text:"• DNase I (degrades NETs) reduces infarct in animal models\n\n", options:{} },
    { text:"Therapeutic Target:\n", options:{bold:true} },
    { text:"NET inhibition (PAD4 inhibitors, DNase I) is under active investigation as stroke therapy. Our transcriptomic signature supports this approach.", options:{color:C.teal} },
  ]);

  s.addNotes(`SPEAKER NOTES – Slide 15 (NETs)
Neutrophil extracellular traps (NETs) are one of the most clinically relevant findings from our analysis. Let me explain what they are and why they matter in stroke.

NETs are web-like structures that neutrophils release as a defense mechanism. They're composed of decondensed chromatin (DNA + histones like H2A, H2B, H3, H4) coated with antimicrobial proteins like neutrophil elastase (ELANE) and myeloperoxidase. NETs trap and kill bacteria — useful against infection.

BUT in ischemic stroke, NETs are problematic. They:
1. Are found inside cerebral thrombi recovered during stroke thrombectomy
2. Promote platelet aggregation and coagulation — potentially worsening the original clot
3. Damage the blood-brain barrier, worsening brain injury
4. Trigger a cycle of inflammation and thrombosis

In animal models, treating stroke mice with DNase I (which degrades DNA in NETs) significantly reduces infarct size. This suggests that blocking NETs could be therapeutic.

Our RNA-seq data shows that the NET formation pathway is significantly upregulated in peripheral blood on Day 1 after stroke — we can detect this activation systemically before neutrophils even reach the brain in large numbers.`);
}

// ── SLIDE 16 · D2 ENRICHMENT ──────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — ENRICHMENT: SUBACUTE STROKE (DAY 2)", C.teal);
  addFooter(s, 16, TOTAL);

  s.addText("Day 2 Enrichment — Resolution & Repair Pathways", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  s.addImage({ path: imgPath("kegg_dotplot_D2_vs_NC.png"), x:0.25, y:1.35, w:4.5, h:2.8, sizing:{type:"contain",w:4.5,h:2.8} });
  s.addImage({ path: imgPath("go_dotplot_D2_vs_NC.png"), x:0.25, y:4.3, w:4.5, h:2.8, sizing:{type:"contain",w:4.5,h:2.8} });

  s.addText("KEGG Pathways (Day 2)", { x:0.25, y:1.35, w:4.5, h:0.35, fontSize:10, bold:true, color:C.teal, fontFace:"Calibri", align:"center", margin:0 });
  s.addText("GO Terms (Day 2)", { x:0.25, y:4.3, w:4.5, h:0.35, fontSize:10, bold:true, color:C.teal, fontFace:"Calibri", align:"center", margin:0 });

  card(s, 5.0, 1.35, 8.1, 2.65, "KEGG: 2 Pathways Enriched", [
    { text:"1. Efferocytosis", options:{bold:true, color:C.teal} },
    { text:" (p = 6.6×10⁻³)\n", options:{} },
    { text:"   Clearance of apoptotic cells by macrophages → cleanup mode after acute immune activation\n\n", options:{} },
    { text:"2. Homologous Recombination", options:{bold:true, color:C.blue} },
    { text:" (p = 6.7×10⁻³)\n", options:{} },
    { text:"   DNA damage repair → oxidative DNA damage from ROS burst during acute stroke is being repaired", options:{} },
  ], C.teal);

  card(s, 5.0, 4.12, 8.1, 2.55, "GO: 6 Terms — All MAP Kinase Phosphatase Activity", [
    { text:"All 6 enriched GO terms relate to MAP kinase phosphatase activity:\n\n", options:{} },
    { text:"• GO:0017017", options:{bold:true} }, { text:" MAP kinase Tyr/Ser/Thr phosphatase activity\n", options:{} },
    { text:"• GO:0033549", options:{bold:true} }, { text:" MAP kinase phosphatase activity\n", options:{} },
    { text:"• Driven by: ", options:{} }, { text:"DUSP2 + DUSP8", options:{bold:true, color:C.teal} },
    { text:" — the immune system's 'off switch'\n\n", options:{} },
    { text:"Conclusion: By Day 2, the transcriptome reflects active immune SUPPRESSION, not activation.", options:{italic:true, color:C.gray} },
  ], C.blue);

  s.addNotes(`SPEAKER NOTES – Slide 16 (Day 2 Enrichment)
With only 60 DEGs at Day 2, we have far fewer pathways enriched — just 2 KEGG and 6 GO terms. But these are biologically rich.

Efferocytosis: This is the process by which macrophages engulf and clear apoptotic (dying) cells. The acute immune response generated a lot of dying immune cells — and by Day 2, the 'cleanup crew' (macrophages) is active. This is a normal and necessary step in resolving inflammation.

Homologous recombination: This DNA repair pathway is enriched, suggesting that immune cells are repairing DNA damage caused by the burst of reactive oxygen species (ROS) during acute stroke. Oxidative stress damages DNA, and the homologous recombination pathway is a major repair mechanism.

The GO enrichment tells an even clearer story: all 6 enriched terms relate to MAP kinase phosphatase activity, driven entirely by DUSP2 and DUSP8. These enzymes switch off the ERK and p38 signaling cascades that drive inflammation. Their upregulation is the molecular signature of immune resolution.`);
}

// ── SLIDE 17 · GSEA ───────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "RESULTS — GENE SET ENRICHMENT ANALYSIS (GSEA)");
  addFooter(s, 17, TOTAL);

  s.addText("GSEA — Sensitivity Beyond Hard DEG Thresholds", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:22, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  card(s, 0.3, 1.38, 5.8, 2.0, "How GSEA Works (vs. ORA)", [
    { text:"Over-representation analysis (ORA):", options:{bold:true} },
    { text:" tests whether DEGs are enriched in a pathway.\n\n", options:{} },
    { text:"GSEA:", options:{bold:true} },
    { text:" ranks ALL expressed genes by a score (sign(LFC) × −log10(p)), then tests for coordinated shifts. No hard cutoff needed — detects subtle changes.", options:{} },
  ], C.teal);

  statBox(s, 0.3, 3.5, 2.7, 1.0, "189", "GO-BP terms enriched\nDay 1 vs NC", C.blue);
  statBox(s, 3.2, 3.5, 2.7, 1.0, "155", "GO-BP terms enriched\nDay 2 vs NC", C.red);

  s.addShape("rect", { x:0.3, y:4.62, w:5.8, h:2.05, fill:{color:"FFF8E1"}, line:{color:C.gold, pt:2} });
  s.addText("⚠️  Why GSEA finds MORE terms in Day 2 than ORA:", { x:0.45, y:4.68, w:5.5, h:0.38, fontSize:11, bold:true, color:C.gold, fontFace:"Calibri", margin:0 });
  s.addText("Despite fewer DEGs at Day 2, GSEA found 155 enriched pathways (vs 6 by ORA). Because GSEA uses ALL genes ranked by effect size, not just significant ones — it captures subtle but coordinated expression changes during the recovery phase that don't reach the hard significance threshold.", {
    x:0.45, y:5.1, w:5.5, h:1.48, fontSize:10.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });

  // GSEA top terms list
  s.addShape("rect", { x:6.4, y:1.38, w:6.6, h:5.28, fill:{color:C.white}, line:{color:C.lgray, pt:1}, shadow:mkShadow() });
  s.addShape("rect", { x:6.4, y:1.38, w:6.6, h:0.42, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("Top GSEA Terms — Day 1 (Positive Enrichment)", { x:6.5, y:1.38, w:6.4, h:0.42, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });

  const gseaTerms = [
    ["Ribosome biogenesis","NES +3.2","Protein synthesis activation"],
    ["mRNA translation","NES +2.9","Translational upregulation"],
    ["Neutrophil activation","NES +2.7","Innate immune alarm"],
    ["Oxidative phosphorylation","NES +2.5","Metabolic reprogramming"],
    ["Antimicrobial response","NES +2.4","Defense activation"],
    ["NET formation","NES +2.3","Immunothrombosis"],
    ["Cytokine signaling","NES +2.1","Inflammatory cascade"],
    ["DNA repair","NES −1.8","Downregulated in acute phase"],
    ["T cell differentiation","NES −2.0","Adaptive immunity suppressed"],
    ["B cell activation","NES −2.2","Lymphocyte suppression"],
  ];
  gseaTerms.forEach(([term, nes, desc], i) => {
    const gy = 1.9 + i * 0.47;
    const isNeg = nes.includes("−");
    s.addShape("rect", { x:6.55, y:gy+0.05, w:1.1, h:0.32, fill:{color:isNeg?C.red:C.green}, line:{color:isNeg?C.red:C.green} });
    s.addText(nes, { x:6.55, y:gy+0.05, w:1.1, h:0.32, fontSize:8.5, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(term, { x:7.72, y:gy+0.05, w:2.5, h:0.32, fontSize:9.5, bold:true, color:C.dgray, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(desc, { x:10.25, y:gy+0.05, w:2.65, h:0.32, fontSize:9, color:C.gray, fontFace:"Calibri", valign:"middle", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 17 (GSEA)
Gene Set Enrichment Analysis (GSEA) is a complementary method to ORA (over-representation analysis). The key difference is that GSEA doesn't require a hard cutoff — it uses all genes ranked by their effect size.

For our ranking, we used sign(LFC) × -log10(p-value). This gives genes that are strongly and significantly upregulated a high positive score, and strongly downregulated genes a high negative score.

GSEA then tests whether the genes in each GO term tend to cluster at the top (positive enrichment = upregulated in stroke) or bottom (negative enrichment = downregulated) of this ranked list.

NES = Normalized Enrichment Score. Values above 1.5 or below -1.5 indicate meaningful enrichment.

The key insight: GSEA found 155 enriched terms in Day 2 despite only 60 DEGs (ORA found only 6). This shows that coordinated, subtle shifts in gene expression continue during recovery — the immune system doesn't fully reset, it just quiets down enough that individual genes don't cross the significance threshold.`);
}

// ── SLIDE 18 · DISCUSSION ─────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addFooter(s, 18, TOTAL);

  s.addText("Discussion", { x:0.4, y:0.15, w:12, h:0.65, fontSize:28, bold:true, color:C.white, fontFace:"Calibri", margin:0 });
  s.addText("Connecting Findings to the Stroke Biology Literature", { x:0.4, y:0.78, w:12, h:0.38, fontSize:13, color:C.lgray, fontFace:"Calibri", margin:0 });

  const disc = [
    { n:"4.1", title:"Magnitude of Response", color:C.blue,
      body:"8,594 DEGs exceeds typical LPS stimulation (2,000–4,000 DEGs). Multiple simultaneous insults converge: ischemia-induced DAMPs, coagulation activation, rapid neutrophil/monocyte mobilization. Consistent with prior stroke transcriptomic studies reporting large-scale changes within hours of onset." },
    { n:"4.2", title:"Ribosomal Signature of Immune Activation", color:C.teal,
      body:"Ribosomal protein upregulation is a well-established signature of monocyte activation. Cells transitioning from resting to activated state dramatically upregulate translational machinery to produce cytokines, receptors, and effectors. Reported in sepsis and trauma — conditions sharing the 'systemic alarm' with stroke." },
    { n:"4.3", title:"PPBP Downregulation — Platelet Biology", color:C.gold,
      body:"PPBP (CXCL7, LFC=−4.69) is the most strongly downregulated gene. As a platelet alpha-granule chemokine that recruits neutrophils, its depletion likely reflects: platelet consumption at thrombus, altered platelet-monocyte crosstalk, or negative feedback suppressing runaway inflammation. RGS18 (platelet regulator, LFC=−3.2) supports the same theme." },
    { n:"4.4", title:"Rapid Resolution & PIDS", color:C.red,
      body:"The collapse from 8,594 → 60 DEGs in 24h reflects homeostatic immune resolution — DUSP2/DUSP8 upregulation actively suppresses MAP kinase signaling. Clinically, this connects to Post-Stroke Immunodepression Syndrome (PIDS): after initial alarm, profound immune suppression increases susceptibility to pneumonia and UTIs, worsening outcomes." },
  ];

  disc.forEach((d, i) => {
    const col = i < 2 ? 0 : 1;
    const row = i % 2;
    const x = col === 0 ? 0.3 : 6.8;
    const y = 1.3 + row * 2.85;
    s.addShape("rect", { x, y, w:6.2, h:2.6, fill:{color:"112B50"}, line:{color:d.color, pt:2} });
    s.addShape("rect", { x, y, w:6.2, h:0.48, fill:{color:d.color}, line:{color:d.color} });
    s.addText(`${d.n}  ${d.title}`, { x:x+0.1, y, w:6.0, h:0.48, fontSize:12, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(d.body, { x:x+0.15, y:y+0.55, w:5.9, h:1.95, fontSize:10, color:C.lgray, fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 18 (Discussion)
This slide discusses the biological significance of our findings in the context of the stroke literature.

4.1 Magnitude: Our 8,594 DEGs is extraordinary. For context, stimulating isolated monocytes with LPS (a bacterial antigen) in the lab typically produces 2,000-4,000 DEGs. The fact that we see twice as many changes in stroke reflects the convergence of multiple simultaneous insults — ischemia, coagulation activation, immune cell mobilization, and cytokine storm all happening simultaneously.

4.2 Ribosomal signature: The ribosome pathway finding seems surprising but is well-established. When monocytes activate, they need to produce large quantities of new protein quickly — cytokines, surface receptors, enzymes. The first step is scaling up the protein synthesis machinery (ribosomes). This pattern has been reported in sepsis and trauma.

4.3 PPBP: The most downregulated gene is a platelet chemokine. Platelets are at the center of stroke pathophysiology (they form the clot). Their depletion at the thrombus site, combined with altered signaling to monocytes, produces this striking expression change.

4.4 Resolution and PIDS: The rapid normalization by Day 2 is clinically significant. While physiological resolution is expected, there's a well-documented dark side: some patients develop post-stroke immunodepression syndrome, where the immune suppression is so profound that they become susceptible to infections. PIDS occurs in roughly 30% of stroke patients and significantly worsens outcomes.`);
}

// ── SLIDE 19 · LIMITATIONS ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "LIMITATIONS & FUTURE DIRECTIONS", C.gray);
  addFooter(s, 19, TOTAL);

  s.addText("Limitations & Future Directions", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:23, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  const lims = [
    { icon:"⚠", title:"Small Sample Size (n=5)", detail:"Statistical power is limited. Some true biological differences may be missed (false negatives). Results require validation in a larger cohort (n≥20 per group).", future:"Meta-analysis combining multiple stroke transcriptome datasets.", col:C.red },
    { icon:"⚠", title:"Cross-Sectional Design", detail:"Different patients at Day 1 vs Day 2 (not same patients longitudinally). Limits causal inference — we cannot track individual immune trajectories.", future:"Longitudinal sampling of the same patients at Days 1, 2, 3, 7, 30.", col:C.red },
    { icon:"⚠", title:"PBMC Heterogeneity", detail:"PBMCs contain monocytes, T cells, B cells, and NK cells. Our findings represent averaged expression across this mixture — masking cell-type-specific changes.", future:"Single-cell RNA-seq (scRNA-seq) to resolve cell-type-specific responses.", col:"F59E0B" },
    { icon:"⚠", title:"Read Assignment Rate (34–47%)", detail:"Below the ideal 60% benchmark due to intronic/intergenic alignment. Consistent within groups, so differential analysis is valid, but absolute quantification is less accurate.", future:"Use RNA-seq with transcript-guided alignment (STAR + StringTie).", col:"F59E0B" },
    { icon:"⚠", title:"Two Timepoints Only", detail:"Day 1 and Day 2 capture the acute window only. The full temporal trajectory — including Days 3, 7, and 30 — remains unexplored.", future:"Extended sampling to characterize full immune recovery arc and identify late biomarkers.", col:C.blue },
    { icon:"💡", title:"Stroke Subtype Not Stratified", detail:"GSE122709 includes all ischemic stroke subtypes (cardioembolic, large artery, lacunar). Different subtypes may have distinct immune signatures.", future:"Subtype-stratified analysis; validation in subtype-specific cohorts.", col:C.blue },
  ];

  lims.forEach((l, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = col===0 ? 0.3 : 6.8;
    const y = 1.38 + row*1.92;
    s.addShape("rect", { x, y, w:6.2, h:1.75, fill:{color:C.white}, line:{color:l.col, pt:1.5}, shadow:mkShadow() });
    s.addShape("rect", { x, y, w:6.2, h:0.38, fill:{color:l.col}, line:{color:l.col} });
    s.addText(`${l.icon} ${l.title}`, { x:x+0.08, y, w:6.0, h:0.38, fontSize:11, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(l.detail, { x:x+0.1, y:y+0.42, w:6.0, h:0.82, fontSize:9.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });
    s.addText([{ text:"→ Future: ", options:{bold:true, color:l.col} }, { text:l.future, options:{} }],
      { x:x+0.1, y:y+1.3, w:6.0, h:0.38, fontSize:9.5, color:C.dgray, fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 19 (Limitations)
All good science is honest about its limitations. Here are ours:

1. Sample size: n=5 is small for gene expression studies. Our 8,594 DEGs at Day 1 likely represents a robust finding (with Bonferroni-corrected p-values still significant), but the 60 DEGs at Day 2 may be underestimated. A larger study might find more.

2. Cross-sectional design: We're comparing different patients at different timepoints, not following the same patients. This means we can't track individual immune trajectories. The ideal study would have the same patient sampled at Days 1, 2, 7, and 30.

3. PBMC heterogeneity: This is perhaps the biggest scientific limitation. We're seeing an average signal across multiple cell types. It's possible that the 'average' masks important cell-type-specific findings — for example, monocytes might show 5,000 DEGs while T cells show almost none, but they average out in bulk data. Single-cell RNA-seq is the solution.

4. Assignment rate: Technically resolved by the unstranded approach, but rates could be improved further with a different alignment strategy using splice junction databases.

5. Two timepoints: The recovery arc from acute stroke extends for weeks. We're only capturing the first 48 hours. When does the transcriptome fully normalize? Do some patients never normalize?`);
}

// ── SLIDE 20 · CONCLUSIONS ────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addFooter(s, 20, TOTAL);

  s.addShape("rect", { x:0, y:0, w:13.33, h:0.85, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("Key Conclusions", { x:0.4, y:0, w:12, h:0.85, fontSize:28, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });

  const concs = [
    { n:"1", head:"Massive Transcriptomic Alarm", body:"Acute ischemic stroke triggers 8,594 DEGs in circulating PBMCs — far exceeding typical immune stimulation signatures. The systemic immune response to stroke is extraordinary in scale.", col:C.blue },
    { n:"2", head:"Four Biological Themes", body:"The acute response is dominated by: Ribosomal biogenesis (immune activation), NET formation (immunothrombosis), Mitochondrial metabolic reprogramming, and Antimicrobial chemokine release.", col:C.teal },
    { n:"3", head:"Rapid & Largely Transient", body:"By Day 2, only 60 genes remain dysregulated — a 143-fold reduction. The acute transcriptomic alarm is physiologically resolved within 24 hours, reflecting normal homeostatic mechanisms.", col:C.gold },
    { n:"4", head:"55 Persistent Biomarker Candidates", body:"55 genes maintain altered expression at both timepoints, representing sustained post-stroke immune changes and candidate biomarkers for stroke severity and therapeutic targeting.", col:"EF4444" },
    { n:"5", head:"Active Immune Resolution at Day 2", body:"DUSP2/DUSP8 upregulation signals active MAP kinase suppression at Day 2. The efferocytosis pathway indicates macrophages are clearing immune debris. The immune system is not merely recovering — it is actively suppressing.", col:C.green },
  ];

  concs.forEach((c, i) => {
    const y = 1.0 + i * 1.2;
    s.addShape("rect", { x:0.3, y, w:12.7, h:1.05, fill:{color:"112B50"}, line:{color:c.col, pt:1.5} });
    s.addShape("oval", { x:0.35, y:y+0.15, w:0.72, h:0.72, fill:{color:c.col}, line:{color:c.col} });
    s.addText(c.n, { x:0.35, y:y+0.15, w:0.72, h:0.72, fontSize:18, bold:true, color:C.white, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
    s.addText(c.head, { x:1.2, y:y+0.05, w:5.5, h:0.38, fontSize:12, bold:true, color:c.col, fontFace:"Calibri", valign:"middle", margin:0 });
    s.addText(c.body, { x:1.2, y:y+0.46, w:11.6, h:0.5, fontSize:10, color:C.lgray, fontFace:"Calibri", valign:"top", margin:0 });
  });

  s.addNotes(`SPEAKER NOTES – Slide 20 (Conclusions)
Let me summarize the five key conclusions from this project:

1. The scale of the transcriptomic response to stroke is remarkable — 8,594 genes changed. This is one of the largest gene expression responses recorded in any human disease condition studied by RNA-seq.

2. Four biological themes explain most of this response: protein synthesis, immunothrombosis (NETs), energy metabolism, and chemokine signaling. These are not random — they reflect the coordinated biological program of innate immune activation.

3. The response is largely transient. Within 24 hours, nearly all dysregulated genes return to baseline. This has an important clinical corollary: the window for anti-inflammatory intervention may be very narrow — the first 24 hours.

4. 55 genes don't recover — these are our most interesting candidates for biomarkers and therapeutic targets. Follow-up studies should focus on these.

5. Day 2 is not just 'less activated' — it's actively suppressed. DUSP enzymes are switching off signaling cascades. This connects to post-stroke immunodepression, which is a clinically important and potentially treatable phenomenon.`);
}

// ── SLIDE 21 · SOFTWARE TABLE ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.light };
  addSectionTag(s, "METHODS SUMMARY — SOFTWARE & COMPUTATIONAL ENVIRONMENT");
  addFooter(s, 21, TOTAL);

  s.addText("Complete Software Stack", {
    x:0.4, y:0.65, w:12.5, h:0.6, fontSize:23, bold:true, color:C.navy, fontFace:"Calibri", margin:0 });

  const sw = [
    [{ text:"Tool", options:{bold:true,color:C.white,fill:{color:C.blue}} },{ text:"Version", options:{bold:true,color:C.white,fill:{color:C.blue}} },{ text:"Purpose", options:{bold:true,color:C.white,fill:{color:C.blue}} },{ text:"Key Parameters", options:{bold:true,color:C.white,fill:{color:C.blue}} }],
    ["SRA Toolkit","v3.0.7","Download raw FASTQ from NCBI SRA","prefetch + fasterq-dump --split-3"],
    ["FastQC","v0.12.1","Per-sample read quality control","Default parameters, all 30 files"],
    ["MultiQC","v1.18","Aggregate QC report","--interactive flag"],
    ["HISAT2","v2.2.1","Splice-aware alignment to GRCh38","--dta -p 4, unstranded"],
    ["SAMtools","v1.18","BAM sort, index, flagstat","sort -m 512M -@ 2 (RAM limited)"],
    ["featureCounts (Subread)","v2.0.6","Gene-level read counting","−s 0 −p −B −C −t exon −g gene_id"],
    ["GENCODE annotation","v44","Reference gene annotation","62,700 features, GRCh38"],
    ["DESeq2","v1.42","Differential expression","~condition, apeglm LFC shrinkage"],
    ["clusterProfiler","v4.10","GO, KEGG, GSEA enrichment","org.Hs.eg.db, padj<0.05"],
    ["R","v4.3.1","Statistical computing","Bioconductor ecosystem"],
    ["Ubuntu (WSL2)","22.04","Linux environment on Windows 11","16 GB RAM, sequential processing"],
  ];

  s.addTable(sw, { x:0.3, y:1.38, w:12.7, h:5.4, colW:[2.5,1.6,3.0,5.6],
    border:{pt:1,color:C.lgray}, fontSize:10, fontFace:"Calibri", color:C.dgray, rowH:0.43 });

  s.addNotes(`SPEAKER NOTES – Slide 21 (Software)
This slide shows the complete software stack used in our analysis. All tools are open-source and freely available.

Key decisions:
- HISAT2 over STAR for alignment: HISAT2 has a smaller memory footprint (~8 GB for the GRCh38 index vs 30+ GB for STAR), making it feasible on our 16 GB machine.
- featureCounts over HTSeq-count: featureCounts is significantly faster and produces equivalent results.
- DESeq2 over edgeR or limma-voom: DESeq2 is the most widely used tool for bulk RNA-seq, with excellent performance characteristics at all sample sizes.
- apeglm shrinkage: This improves LFC estimates for low-count genes, reducing false positives in subsequent analyses.
- The entire pipeline is reproducible: the conda environment can be recreated from the environment.yml file, and all scripts are available in the project repository.`);
}

// ── SLIDE 22 · THANK YOU ──────────────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  s.addShape("rect", { x:0, y:0, w:13.33, h:1.1, fill:{color:C.blue}, line:{color:C.blue} });
  s.addText("Thank You  |  Questions & Discussion", { x:0.4, y:0, w:12.5, h:1.1, fontSize:26, bold:true, color:C.white, fontFace:"Calibri", valign:"middle", margin:0 });

  s.addText("Project Summary", { x:0.4, y:1.2, w:8, h:0.48, fontSize:16, bold:true, color:C.gold, fontFace:"Calibri", margin:0 });

  const sumItems = [
    "Complete end-to-end bulk RNA-seq pipeline: raw FASTQ → biological interpretation",
    "15 PBMC samples | GRCh38 alignment | GENCODE v44 annotation",
    "8,594 DEGs at Day 1 (35.8% of expressed genome) → 60 DEGs at Day 2",
    "Ribosomal biogenesis + NET formation dominate the acute immune response",
    "DUSP2/DUSP8 upregulation signals active immune resolution at Day 2",
    "55 persistent genes: candidate biomarkers & mechanistic anchors",
  ];
  s.addText(sumItems.map((t,i) => ({ text:t, options:{ bullet:true, breakLine:i<sumItems.length-1 } })),
    { x:0.4, y:1.75, w:8.2, h:3.4, fontSize:11.5, color:C.lgray, fontFace:"Calibri", valign:"top", margin:0 });

  // Dataset/code reference box
  s.addShape("rect", { x:0.4, y:5.3, w:8.2, h:1.85, fill:{color:"112B50"}, line:{color:C.teal, pt:1.5} });
  s.addText("Data & Reproducibility", { x:0.5, y:5.35, w:8, h:0.38, fontSize:12, bold:true, color:C.teal, fontFace:"Calibri", margin:0 });
  s.addText([
    { text:"Dataset: ", options:{bold:true, color:C.gold} }, { text:"NCBI GEO: GSE122709 | BioProject: PRJNA506047\n", options:{color:C.lgray} },
    { text:"SRA Accessions: ", options:{bold:true, color:C.gold} }, { text:"SRR8207876 – SRR8207890\n", options:{color:C.lgray} },
    { text:"Pipeline: ", options:{bold:true, color:C.gold} }, { text:"All scripts available in project directory (scripts/)\n", options:{color:C.lgray} },
    { text:"Environment: ", options:{bold:true, color:C.gold} }, { text:"Conda env (rnaseq_stroke) | R 4.3.1 | Ubuntu 22.04 WSL2", options:{color:C.lgray} },
  ], { x:0.5, y:5.78, w:8, h:1.28, fontSize:10.5, fontFace:"Calibri", valign:"top", margin:0 });

  // Right panel
  s.addShape("rect", { x:8.8, y:1.2, w:4.3, h:5.95, fill:{color:"112B50"}, line:{color:C.gold, pt:2} });
  s.addText("Discussion\nQuestions", { x:8.8, y:1.2, w:4.3, h:0.9, fontSize:16, bold:true, color:C.gold, fontFace:"Calibri", align:"center", valign:"middle", margin:0 });
  const qs = [
    "Why did we choose bulk RNA-seq over single-cell?",
    "How would the results differ with n=50 per group?",
    "Can these 55 persistent genes be used as a stroke biomarker panel?",
    "What is the clinical actionability of the NET finding?",
    "How does the PBMC response compare to brain tissue?",
  ];
  qs.forEach((q, i) => {
    s.addShape("rect", { x:8.9, y:2.22+i*0.95, w:4.1, h:0.82, fill:{color:"1A3A5C"}, line:{color:C.teal, pt:1} });
    s.addText(`Q${i+1}: ${q}`, { x:9.0, y:2.25+i*0.95, w:3.9, h:0.76, fontSize:10, color:C.lgray, fontFace:"Calibri", valign:"middle", margin:0 });
  });

  // Footer
  s.addShape("rect", { x:0, y:7.28, w:13.33, h:0.22, fill:{color:"060E1E"}, line:{color:"060E1E"} });
  s.addText("DATA_SCI_8110  |  GSE122709  |  April 2026", { x:0.3, y:7.28, w:12, h:0.22, fontSize:7.5, color:C.gray, fontFace:"Calibri", valign:"middle", margin:0 });
  s.addText("22 / 22", { x:12.5, y:7.28, w:0.8, h:0.22, fontSize:7.5, color:C.gray, fontFace:"Calibri", align:"right", valign:"middle", margin:0 });

  s.addNotes(`SPEAKER NOTES – Slide 22 (Thank You / Q&A)
Thank you for your attention. This project demonstrated that a complete, publication-quality RNA-seq analysis is achievable from publicly available data using open-source tools on a consumer laptop.

The most impactful finding is the NET formation pathway enrichment — this connects peripheral blood transcriptomics directly to a therapeutically actionable mechanism in stroke. DNase I and PAD4 inhibitors that target NETs are in clinical trials for stroke; our bioinformatics evidence supports this research direction.

Anticipated discussion questions:
Q1: Bulk vs single-cell: Bulk RNA-seq is sufficient for pathway-level insights and is 100x cheaper. Single-cell would tell us which specific cell types drive each finding.
Q2: Larger sample size would increase power, potentially revealing more Day 2 DEGs and increasing confidence in the persistent gene set.
Q3: The 55 persistent genes could form a blood biomarker panel — if validated prospectively, they could predict stroke severity or outcome.
Q4: Clinical actionability of NETs: DNase I inhalation reduces NET burden systemically; clinical trials for stroke are ongoing.
Q5: Brain tissue response would show local inflammation, neuronal death, and glial activation — very different from blood, though connected by cytokine signaling.`);
}

// ── WRITE FILE ─────────────────────────────────────────────────────────────
pres.writeFile({ fileName: OUT }).then(() => {
  console.log("SUCCESS: Presentation saved to", OUT);
}).catch(err => {
  console.error("ERROR:", err.message);
});
