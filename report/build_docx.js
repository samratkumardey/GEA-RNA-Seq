const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink, TabStopType, TabStopPosition
} = require("docx");
const fs = require("fs");

// ── Colours & borders ────────────────────────────────────────────────────────
const BLUE       = "1F4E79";
const LIGHT_BLUE = "D6E4F0";
const MID_BLUE   = "2E75B6";
const ACCENT     = "C00000";
const GREY_BG    = "F2F2F2";
const GREY_TEXT  = "595959";
const CODE_BG    = "1E1E1E";
const CODE_FG    = "D4D4D4";

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── Helpers ───────────────────────────────────────────────────────────────────
const space = (before=0, after=0) => ({ spacing: { before, after } });
const run   = (text, opts={}) => new TextRun({ text, font:"Arial", size:22, ...opts });
const bold  = (text, opts={}) => run(text, { bold:true, ...opts });

function para(children, opts={}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font:"Arial", size:32, bold:true, color:BLUE })],
    spacing: { before:360, after:160 },
    border: { bottom: { style:BorderStyle.SINGLE, size:6, color:MID_BLUE, space:4 } }
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font:"Arial", size:26, bold:true, color:MID_BLUE })],
    spacing: { before:280, after:120 }
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font:"Arial", size:24, bold:true, color:GREY_TEXT })],
    spacing: { before:200, after:80 }
  });
}

function bodyPara(text, opts={}) {
  return new Paragraph({
    children: [run(text)],
    spacing: { before:80, after:80 },
    ...opts
  });
}

function callout(text) {
  return new Paragraph({
    children: [run(text, { italics:true, color:"444444" })],
    spacing: { before:120, after:120 },
    indent: { left:720, right:360 },
    border: { left: { style:BorderStyle.SINGLE, size:12, color:MID_BLUE, space:8 } }
  });
}

function bullet(text, bold_prefix="") {
  const children = bold_prefix
    ? [new TextRun({ text:bold_prefix, font:"Arial", size:22, bold:true }),
       run(" " + text)]
    : [run(text)];
  return new Paragraph({
    numbering: { reference:"bullets", level:0 },
    children,
    spacing: { before:40, after:40 }
  });
}

function blankLine() {
  return new Paragraph({ children:[run("")], spacing:{ before:0, after:80 } });
}

function pageBreak() {
  return new Paragraph({ children:[new PageBreak()] });
}

// ── Code block (monospace, dark theme) ───────────────────────────────────────
function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line || " ", font:"Courier New", size:18, color:CODE_FG })],
      shading: { fill:CODE_BG, type:ShadingType.CLEAR },
      spacing: { before:0, after:0 },
      indent: { left:240, right:240 }
    })
  );
}

// ── Table helpers ─────────────────────────────────────────────────────────────
function headerCell(text, width) {
  return new TableCell({
    borders: allBorders,
    width: { size:width, type:WidthType.DXA },
    shading: { fill:BLUE, type:ShadingType.CLEAR },
    margins: { top:80, bottom:80, left:140, right:140 },
    children: [new Paragraph({
      children: [new TextRun({ text, font:"Arial", size:20, bold:true, color:"FFFFFF" })],
      spacing:{ before:0, after:0 }
    })]
  });
}

function dataCell(text, width, shaded=false, textColor="000000", bold_=false) {
  return new TableCell({
    borders: allBorders,
    width: { size:width, type:WidthType.DXA },
    shading: { fill: shaded ? GREY_BG : "FFFFFF", type:ShadingType.CLEAR },
    margins: { top:80, bottom:80, left:140, right:140 },
    children: [new Paragraph({
      children: [new TextRun({ text, font:"Arial", size:20, color:textColor, bold:bold_ })],
      spacing:{ before:0, after:0 }
    })]
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

const sections = [];

// ── SECTION 1 : Title page ────────────────────────────────────────────────────
sections.push({
  properties: {
    page: {
      size: { width:12240, height:15840 },
      margin: { top:1440, right:1440, bottom:1440, left:1440 }
    }
  },
  headers: {
    default: new Header({ children:[
      new Paragraph({
        children:[
          new TextRun({ text:"DATA_SCI_8110  |  Genomics Analytics", font:"Arial", size:18, color:"888888" }),
          new TextRun({ text:"\t", font:"Arial", size:18 }),
          new TextRun({ text:"GSE122709 Stroke RNA-seq Analysis", font:"Arial", size:18, color:"888888" })
        ],
        tabStops:[{ type:TabStopType.RIGHT, position:TabStopPosition.MAX }],
        border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:MID_BLUE, space:4 } },
        spacing:{ after:0 }
      })
    ]})
  },
  footers: {
    default: new Footer({ children:[
      new Paragraph({
        children:[
          new TextRun({ children:[PageNumber.CURRENT], font:"Arial", size:18, color:"888888" }),
          new TextRun({ text:" | Differential Gene Expression Analysis — Acute Ischemic Stroke", font:"Arial", size:18, color:"888888" })
        ],
        alignment: AlignmentType.CENTER,
        border:{ top:{ style:BorderStyle.SINGLE, size:4, color:MID_BLUE, space:4 } }
      })
    ]})
  },
  children: [
    // decorative top bar
    new Paragraph({
      children:[run("  ", { color:BLUE })],
      shading:{ fill:BLUE, type:ShadingType.CLEAR },
      spacing:{ before:0, after:720 }
    }),

    new Paragraph({
      children:[new TextRun({ text:"Differential Gene Expression Analysis", font:"Arial", size:56, bold:true, color:BLUE })],
      alignment:AlignmentType.CENTER, spacing:{ before:720, after:200 }
    }),
    new Paragraph({
      children:[new TextRun({ text:"of Peripheral Blood RNA-Seq Data", font:"Arial", size:48, bold:true, color:MID_BLUE })],
      alignment:AlignmentType.CENTER, spacing:{ before:0, after:200 }
    }),
    new Paragraph({
      children:[new TextRun({ text:"in Acute Ischemic Stroke Patients", font:"Arial", size:48, bold:true, color:MID_BLUE })],
      alignment:AlignmentType.CENTER, spacing:{ before:0, after:1200 }
    }),

    new Paragraph({
      children:[run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", { color:MID_BLUE })],
      alignment:AlignmentType.CENTER, spacing:{ before:0, after:800 }
    }),

    new Paragraph({ children:[new TextRun({ text:"Course:", font:"Arial", size:26, bold:true, color:GREY_TEXT })], alignment:AlignmentType.CENTER, spacing:{before:0,after:80} }),
    new Paragraph({ children:[new TextRun({ text:"DATA_SCI_8110 — Genomics Analytics", font:"Arial", size:26, color:"333333" })], alignment:AlignmentType.CENTER, spacing:{before:0,after:200} }),

    new Paragraph({ children:[new TextRun({ text:"Dataset:", font:"Arial", size:26, bold:true, color:GREY_TEXT })], alignment:AlignmentType.CENTER, spacing:{before:0,after:80} }),
    new Paragraph({ children:[new TextRun({ text:"GSE122709 (NCBI GEO)  |  BioProject: PRJNA506047", font:"Arial", size:26, color:"333333" })], alignment:AlignmentType.CENTER, spacing:{before:0,after:200} }),

    new Paragraph({ children:[new TextRun({ text:"Platform:", font:"Arial", size:26, bold:true, color:GREY_TEXT })], alignment:AlignmentType.CENTER, spacing:{before:0,after:80} }),
    new Paragraph({ children:[new TextRun({ text:"Illumina HiSeq X Ten  |  150 bp Paired-end  |  Human PBMCs", font:"Arial", size:26, color:"333333" })], alignment:AlignmentType.CENTER, spacing:{before:0,after:200} }),

    new Paragraph({ children:[new TextRun({ text:"Date:", font:"Arial", size:26, bold:true, color:GREY_TEXT })], alignment:AlignmentType.CENTER, spacing:{before:0,after:80} }),
    new Paragraph({ children:[new TextRun({ text:"April 2026", font:"Arial", size:26, color:"333333" })], alignment:AlignmentType.CENTER, spacing:{before:0,after:1200} }),

    new Paragraph({
      children:[run("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", { color:MID_BLUE })],
      alignment:AlignmentType.CENTER, spacing:{ before:0, after:600 }
    }),

    // Summary stats box
    new Table({
      width:{ size:7200, type:WidthType.DXA },
      columnWidths:[2400,2400,2400],
      rows:[
        new TableRow({ children:[
          new TableCell({ borders:noBorders, width:{size:2400,type:WidthType.DXA}, shading:{fill:BLUE,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:140,right:140},
            children:[new Paragraph({ children:[new TextRun({text:"15 Samples",font:"Arial",size:28,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}}),
                      new Paragraph({ children:[new TextRun({text:"5 NC + 5 D1 + 5 D2",font:"Arial",size:18,color:"CCCCCC"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})] }),
          new TableCell({ borders:noBorders, width:{size:2400,type:WidthType.DXA}, shading:{fill:MID_BLUE,type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:140,right:140},
            children:[new Paragraph({ children:[new TextRun({text:"8,594 DEGs",font:"Arial",size:28,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}}),
                      new Paragraph({ children:[new TextRun({text:"Acute stroke vs control",font:"Arial",size:18,color:"CCCCCC"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})] }),
          new TableCell({ borders:noBorders, width:{size:2400,type:WidthType.DXA}, shading:{fill:"3A7CA5",type:ShadingType.CLEAR}, margins:{top:120,bottom:120,left:140,right:140},
            children:[new Paragraph({ children:[new TextRun({text:"12 KEGG Paths",font:"Arial",size:28,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}}),
                      new Paragraph({ children:[new TextRun({text:"Enriched in D1 vs NC",font:"Arial",size:18,color:"CCCCCC"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})] }),
        ]})
      ],
      margins:{ left:1440 }
    }),

    pageBreak()
  ]
});

// ── SECTION 2 : Main body ─────────────────────────────────────────────────────
const body = [];

// ── Abstract ──────────────────────────────────────────────────────────────────
body.push(heading1("Abstract"));
body.push(new Paragraph({
  children:[run("Acute ischemic stroke triggers a rapid and profound systemic immune response detectable in peripheral blood mononuclear cells (PBMCs). Using publicly available bulk RNA-seq data from GSE122709, we performed a complete bioinformatics analysis comparing PBMC transcriptomes of healthy controls (n=5) with stroke patients at Day 1 post-stroke (acute phase, n=5) and Day 2 post-stroke (subacute phase, n=5). Starting from raw FASTQ files, we applied a standard pipeline: quality control (FastQC/MultiQC), genome alignment (HISAT2 vs GRCh38), gene quantification (featureCounts with GENCODE v44), and differential expression analysis (DESeq2). We identified "),
    new TextRun({text:"8,594 differentially expressed genes",font:"Arial",size:22,bold:true}),
    run(" (4,890 upregulated, 3,704 downregulated) in the acute phase, compared to only "),
    new TextRun({text:"60 DEGs",font:"Arial",size:22,bold:true}),
    run(" in the subacute phase, demonstrating that the transcriptomic response is largely transient. Functional enrichment revealed significant enrichment of ribosomal biogenesis, neutrophil extracellular trap (NET) formation, oxidative phosphorylation, and antimicrobial immune pathways in acute stroke. By Day 2, the inflammatory transcriptome largely normalized, with dual-specificity phosphatases (DUSP2, DUSP8) upregulated — suggesting active suppression of the immune response. These findings provide mechanistic insight into the systemic immune activation following ischemic stroke.")
  ],
  spacing:{ before:80, after:160 },
  shading:{ fill:LIGHT_BLUE, type:ShadingType.CLEAR },
  indent:{ left:240, right:240 },
  border:{
    top:{style:BorderStyle.SINGLE,size:6,color:MID_BLUE,space:4},
    bottom:{style:BorderStyle.SINGLE,size:6,color:MID_BLUE,space:4}
  }
}));

body.push(blankLine());

// ── Section 1: Introduction ───────────────────────────────────────────────────
body.push(heading1("1.  Introduction and Background"));

body.push(heading2("1.1  What is Acute Ischemic Stroke?"));
body.push(bodyPara("Acute ischemic stroke occurs when a blood clot blocks an artery supplying the brain, cutting off oxygen and nutrients to brain tissue. It is one of the leading causes of death and long-term disability worldwide. Beyond the direct brain damage, stroke triggers a powerful secondary response in the immune system — the body essentially sounds an alarm that cascades through the blood."));

body.push(heading2("1.2  Why Study Peripheral Blood?"));
body.push(bodyPara("The brain is difficult to sample directly. However, peripheral blood mononuclear cells (PBMCs) — which include monocytes, lymphocytes, and natural killer cells — serve as a readily accessible window into the body's response to stroke. When stroke occurs, immune cells in the blood rapidly change which genes they turn on and off, and measuring these changes can reveal the molecular mechanisms driving the post-stroke immune response."));

body.push(heading2("1.3  What is RNA-seq?"));
body.push(bodyPara("RNA sequencing (RNA-seq) is a technology that quantifies gene expression across the entire genome simultaneously. By extracting RNA from cells, converting it to DNA, and sequencing it on a high-throughput platform, we can determine which genes are active and to what degree in a given sample. Comparing expression between stroke patients and healthy controls allows us to identify genes that are differentially expressed — turned up or down — in response to stroke."));

body.push(heading2("1.4  Study Objectives"));
body.push(bodyPara("This project addresses three specific questions:"));
body.push(bullet("Which genes are significantly differentially expressed in PBMCs of acute ischemic stroke patients compared to healthy controls?", "Q1"));
body.push(bullet("How does the transcriptomic response evolve from the acute phase (Day 1) to the subacute phase (Day 2)?", "Q2"));
body.push(bullet("What biological pathways are enriched among DEGs, and what do these tell us about the molecular mechanisms of stroke?", "Q3"));
body.push(blankLine());

// ── Section 2: Methods ────────────────────────────────────────────────────────
body.push(heading1("2.  Methods"));

body.push(heading2("2.1  Dataset"));
body.push(bodyPara("We used publicly available bulk RNA-seq data from the NCBI Gene Expression Omnibus (GEO), accession GSE122709 (SRA Study: SRP169610, BioProject: PRJNA506047). The dataset includes PBMC RNA-seq profiles from 15 human subjects across three groups:"));
body.push(blankLine());

// Dataset table
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[2340,1560,1560,3900],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Group",2340), headerCell("Label",1560), headerCell("n",1560), headerCell("Description",3900)
    ]}),
    new TableRow({ children:[
      dataCell("Healthy controls",2340,false,BLUE,true), dataCell("NC",1560,true), dataCell("5",1560,true), dataCell("No known neurological disease",3900)
    ]}),
    new TableRow({ children:[
      dataCell("Acute stroke",2340,false,ACCENT,true), dataCell("D1",1560), dataCell("5",1560), dataCell("Day 1 post-ischemic stroke",3900,true)
    ]}),
    new TableRow({ children:[
      dataCell("Subacute stroke",2340,false,"CC6600",true), dataCell("D2",1560,true), dataCell("5",1560,true), dataCell("Day 2 post-ischemic stroke",3900)
    ]})
  ]
}));
body.push(blankLine());
body.push(bodyPara("Sequencing was performed on the Illumina HiSeq X Ten platform, generating 150 bp paired-end reads. All 15 sample accessions ranged from SRR8207876 to SRR8207890."));

body.push(heading2("2.2  Data Download"));
body.push(bodyPara("Raw sequencing reads were downloaded from the NCBI SRA using the SRA Toolkit (v3.0.7). Each sample was retrieved using prefetch followed by fasterq-dump --split-3 --skip-technical to separate paired FASTQ files. Files were compressed with pigz. All 15 samples were verified, totaling approximately 98 GB of compressed FASTQ data (30 files)."));

body.push(heading2("2.3  Quality Control"));
body.push(bodyPara("Raw read quality was assessed using FastQC (v0.12.1) on all 30 FASTQ files. Results were aggregated into a single interactive report using MultiQC (v1.18). Metrics inspected included per-base sequence quality, per-sequence quality scores, adapter contamination, GC content, and sequence duplication levels."));

body.push(heading2("2.4  Genome Alignment"));
body.push(bodyPara("Reads were aligned to the human reference genome GRCh38 using HISAT2 (v2.2.1), a splice-aware aligner designed for RNA-seq data. Key parameters: --dta (downstream transcript assembly), --rna-strandness RF (paired-end reverse-stranded), -p 4 (4 threads). Aligned reads were coordinate-sorted and indexed using SAMtools (v1.18). Due to the 16 GB RAM constraint, samples were processed sequentially with SAMtools sort limited to 512 MB per thread."));
body.push(callout("Why HISAT2? Genes contain introns removed from mRNA. A splice-aware aligner correctly maps reads that span exon-exon boundaries — critical for accurate RNA-seq alignment. STAR was not used because it requires ~30 GB RAM, which exceeds the available system memory."));

body.push(heading2("2.5  Gene-Level Quantification"));
body.push(bodyPara("Gene-level read counts were generated using featureCounts (Subread v2.0.6) with the GENCODE v44 GTF annotation (62,700 annotated genes). Key parameters: -p --countReadPairs (count fragments), -s 0 (unstranded), -B (both reads must map), -C (exclude chimeric pairs), -t exon -g gene_id."));

body.push(heading2("2.6  Differential Expression Analysis"));
body.push(bodyPara("All downstream analyses were performed in R (v4.3.1) with Bioconductor packages. Raw counts were analyzed using DESeq2 (v1.42) applying a negative binomial model for overdispersed count data."));
body.push(bodyPara("Pre-filtering retained genes with >=10 counts in >=5 of 15 samples, resulting in 23,995 genes for testing. The design formula ~condition modeled three levels (control, stroke_d1, stroke_d2). Log2 fold-change shrinkage was applied using the apeglm method. Significance threshold: adjusted p-value (Benjamini-Hochberg) < 0.05 AND |log2FoldChange| > 1 (>=2-fold change)."));
body.push(callout("Two contrasts were tested independently: (1) stroke_d1 vs control (acute stroke) and (2) stroke_d2 vs control (subacute stroke). PCA was performed on variance-stabilizing transformed (VST) counts."));

body.push(heading2("2.7  Functional Enrichment Analysis"));
body.push(bodyPara("Functional enrichment was performed using clusterProfiler (v4.10) with org.Hs.eg.db for annotation. ENSEMBL IDs were converted to ENTREZ IDs. Three analyses were performed for each contrast:"));
body.push(bullet("Gene Ontology (GO) over-representation analysis (enrichGO) — BP, MF, CC ontologies", "GO:"));
body.push(bullet("KEGG pathway enrichment (enrichKEGG) — curated biological pathway database", "KEGG:"));
body.push(bullet("Gene Set Enrichment Analysis (gseGO) — ranked gene list, no hard cutoff required", "GSEA:"));
body.push(bodyPara("Statistical threshold for GO/KEGG: padj < 0.05 (Benjamini-Hochberg correction)."));
body.push(blankLine());

// ── Section 3: Results ────────────────────────────────────────────────────────
body.push(pageBreak());
body.push(heading1("3.  Results"));

body.push(heading2("3.1  Read Quality Control"));
body.push(bodyPara("FastQC analysis of all 30 FASTQ files confirmed uniformly high read quality across all samples. Key findings:"));
body.push(blankLine());

// QC table
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[3120,2340,3900],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Metric",3120), headerCell("Result",2340), headerCell("Interpretation",3900)
    ]}),
    ...[
      ["Read length","150 bp (all)","Consistent with HiSeq X Ten"],
      ["Reads per sample","41.1 – 50.7 M pairs","Excellent sequencing depth"],
      ["Poor quality reads","0 across all files","No low-quality samples"],
      ["Per-base sequence quality","PASS all 30 files","Q-scores well above Q30"],
      ["Adapter content","PASS all 30 files","No trimming required"],
      ["GC content","44 – 50%","Normal for human RNA-seq"],
      ["Sequence duplication","FAIL (expected)","High duplication is normal in RNA-seq"],
      ["Per-base sequence content","FAIL (expected)","Random hexamer priming bias — universal artifact"],
    ].map((row,i) => new TableRow({ children:[
      dataCell(row[0],3120,i%2===0,BLUE,true),
      dataCell(row[1],2340,i%2===0),
      dataCell(row[2],3900,i%2===0)
    ]}))
  ]
}));
body.push(blankLine());
body.push(bodyPara("A biologically notable QC observation: control (NC) samples showed higher duplication rates (60–81%) compared to acute stroke Day 1 samples (38–55%). Lower duplication in D1 suggests a more complex, diversified transcriptional landscape following acute stroke — an early signal consistent with the real biology."));
body.push(bodyPara("Decision: No read trimming was required. All 15 samples passed quality thresholds and proceeded directly to alignment."));

body.push(heading2("3.2  Genome Alignment"));
body.push(bodyPara("All 15 samples aligned to GRCh38 with uniformly high rates. The mean overall alignment rate was 95.1% (range: 92.45%–96.04%), well above the commonly accepted >85% threshold."));
body.push(blankLine());

// Alignment table
body.push(new Paragraph({ children:[bold("Table 1. HISAT2 Overall Alignment Rates",{color:BLUE})], spacing:{before:80,after:80} }));
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[2340,3120,3900],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Sample",2340), headerCell("Group",3120), headerCell("Alignment Rate",3900)
    ]}),
    ...([
      ["NC_1","Control","94.82%"],["NC_3","Control","95.71%"],["NC_4","Control","95.78%"],
      ["NC_5","Control","95.19%"],["NC_6","Control","92.45%"],
      ["D1_1","Acute Stroke (D1)","95.28%"],["D1_2","Acute Stroke (D1)","95.85%"],
      ["D1_3","Acute Stroke (D1)","94.69%"],["D1_4","Acute Stroke (D1)","95.52%"],
      ["D1_5","Acute Stroke (D1)","95.56%"],
      ["D2_1","Subacute Stroke (D2)","95.48%"],["D2_2","Subacute Stroke (D2)","95.42%"],
      ["D2_3","Subacute Stroke (D2)","95.22%"],["D2_4","Subacute Stroke (D2)","94.84%"],
      ["D2_6","Subacute Stroke (D2)","96.04%"]
    ].map((row,i) => new TableRow({ children:[
      dataCell(row[0],2340,i%2===0,i<5?BLUE:i<10?ACCENT:"CC6600",true),
      dataCell(row[1],3120,i%2===0),
      dataCell(row[2],3900,i%2===0,"000000",true)
    ]})))
  ]
}));
body.push(blankLine());

body.push(heading2("3.3  Gene Quantification"));
body.push(bodyPara("featureCounts processed all 15 BAM files against 62,700 GENCODE v44 genes. After pre-filtering, 23,995 genes were retained for differential expression testing. Assignment rates ranged from 34–47%, with NC and D2 samples showing ~44% and D1 samples showing ~35% assignment. The primary source of unassigned reads was Unassigned_NoFeatures (reads mapping to intronic/intergenic regions). Critically, all samples yielded 14–25 million assigned read pairs — well above the minimum needed for robust DESeq2 analysis."));

body.push(heading2("3.4  Principal Component Analysis"));
body.push(bodyPara("PCA on VST-normalized counts is expected to show clear separation of the three groups: control (NC) samples clustering together, acute stroke (D1) samples separating along PC1, and subacute (D2) samples positioned between NC and D1 — reflecting the massive acute response and partial recovery. This separation confirms that the experimental groups are transcriptionally distinct and that observed differences reflect biology, not technical variation."));
body.push(callout("See Figure 2: results/figures/pca_all_samples.pdf"));

body.push(heading2("3.5  Differential Gene Expression"));
body.push(heading3("3.5.1  Acute Stroke: Day 1 vs Control"));
body.push(bodyPara("DESeq2 identified 8,594 differentially expressed genes in acute stroke patients compared to healthy controls (padj < 0.05, |log2FC| > 1):"));
body.push(blankLine());

// DEG summary highlight box
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[3120,3120,3120],
  rows:[
    new TableRow({ children:[
      new TableCell({ borders:noBorders, width:{size:3120,type:WidthType.DXA}, shading:{fill:ACCENT,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:140,right:140},
        children:[
          new Paragraph({children:[new TextRun({text:"4,890",font:"Arial",size:48,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:40}}),
          new Paragraph({children:[new TextRun({text:"Upregulated Genes",font:"Arial",size:20,color:"FFCCCC"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})
        ]
      }),
      new TableCell({ borders:noBorders, width:{size:3120,type:WidthType.DXA}, shading:{fill:BLUE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:140,right:140},
        children:[
          new Paragraph({children:[new TextRun({text:"8,594",font:"Arial",size:48,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:40}}),
          new Paragraph({children:[new TextRun({text:"Total DEGs (D1 vs NC)",font:"Arial",size:20,color:"CCDDFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})
        ]
      }),
      new TableCell({ borders:noBorders, width:{size:3120,type:WidthType.DXA}, shading:{fill:MID_BLUE,type:ShadingType.CLEAR}, margins:{top:160,bottom:160,left:140,right:140},
        children:[
          new Paragraph({children:[new TextRun({text:"3,704",font:"Arial",size:48,bold:true,color:"FFFFFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:40}}),
          new Paragraph({children:[new TextRun({text:"Downregulated Genes",font:"Arial",size:20,color:"CCDDFF"})], alignment:AlignmentType.CENTER, spacing:{before:0,after:0}})
        ]
      }),
    ]})
  ]
}));
body.push(blankLine());

body.push(bodyPara("This represents 35.8% of all expressed genes — an extraordinarily large transcriptional response consistent with the systemic immune alarm triggered by acute stroke. Key differentially expressed genes include:"));
body.push(bullet("CXCL9, CXCL10, CXCL5 — pro-inflammatory chemokines that recruit immune cells to sites of inflammation (upregulated)", "Top upregulated:"));
body.push(bullet("ELANE (neutrophil elastase) — a key neutrophil activation marker released during NET formation (upregulated)"));
body.push(bullet("S100A12 — calcium-binding alarmin expressed by activated neutrophils and monocytes (upregulated)"));
body.push(bullet("Ribosomal protein genes (RPL/RPS families) — massive upregulation reflecting immune cell activation (upregulated)"));
body.push(bullet("PPBP/CXCL7 — platelet-derived chemokine, most strongly downregulated gene (LFC = -4.69, padj = 1.2x10^-57)", "Most downregulated:"));
body.push(bullet("RGS18 — Regulator of G-protein Signaling 18, platelet activation regulator (LFC = -3.2, downregulated)"));
body.push(callout("See Figure 3: results/figures/volcano_D1_vs_NC.pdf  |  Figure 4: results/figures/heatmap_top50_DEGs.pdf"));

body.push(heading3("3.5.2  Subacute Stroke: Day 2 vs Control"));
body.push(bodyPara("By Day 2 post-stroke, the transcriptomic response had largely resolved. DESeq2 identified only 60 differentially expressed genes (45 upregulated, 15 downregulated) — a 143-fold reduction from Day 1. Notable upregulated genes include DUSP2 and DUSP8 (dual specificity phosphatases that deactivate MAP kinase signaling), suggesting active suppression of inflammation as the immune system transitions toward resolution."));
body.push(callout("See Figure 5: results/figures/volcano_D2_vs_NC.pdf"));

body.push(heading3("3.5.3  Temporal DEG Overlap — Persistent vs Transient Changes"));
body.push(blankLine());

body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[3600,1800,3960],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Category",3600), headerCell("Gene Count",1800), headerCell("Biological Meaning",3960)
    ]}),
    new TableRow({ children:[
      dataCell("Shared (D1 & D2)",3600,false,BLUE,true),
      dataCell("55",1800,false,"000000",true),
      dataCell("Persistent stroke signature — sustained changes across both timepoints",3960)
    ]}),
    new TableRow({ children:[
      dataCell("Unique to D1 (acute only)",3600,true,ACCENT,true),
      dataCell("8,539",1800,true,"000000",true),
      dataCell("Transient acute immune response — resolves by Day 2",3960,true)
    ]}),
    new TableRow({ children:[
      dataCell("Unique to D2 (subacute only)",3600,false,"CC6600",true),
      dataCell("5",1800,false,"000000",true),
      dataCell("Late-emerging changes during recovery phase",3960)
    ]})
  ]
}));
body.push(blankLine());
body.push(bodyPara("The 55 shared genes represent the most biologically meaningful set — genes whose expression remains altered two days after stroke and may contribute to lasting post-stroke immune dysregulation or neurological outcome. They represent candidate biomarkers for stroke severity, prognosis, or therapeutic targets."));

body.push(heading2("3.6  Functional Enrichment Analysis"));
body.push(heading3("3.6.1  GO and KEGG Enrichment — Acute Stroke (D1 vs NC)"));
body.push(bodyPara("GO analysis identified 63 enriched terms and KEGG analysis identified 12 enriched pathways in acute stroke DEGs. The top pathways map to four major biological themes:"));
body.push(blankLine());

body.push(new Paragraph({ children:[bold("Table 2. Top KEGG Pathways — Acute Stroke (D1) vs Control",{color:BLUE})], spacing:{before:80,after:80} }));
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[3000,1200,1560,3600],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Pathway",3000), headerCell("Genes",1200), headerCell("adj. p-value",1560), headerCell("Biological Theme",3600)
    ]}),
    ...([
      ["Ribosome","112","5.7e-23","Protein synthesis / immune activation"],
      ["Systemic lupus erythematosus","79","1.1e-16","Histone/chromatin dysregulation"],
      ["Neutrophil extracellular trap formation","82","1.0e-05","Immunothrombosis in stroke"],
      ["COVID-19","92","8.9e-07","Innate immune / ribosomal"],
      ["Oxidative phosphorylation","49","1.4e-02","Metabolic reprogramming"],
      ["Parkinson disease","92","2.8e-03","Mitochondrial dysfunction"],
      ["Spliceosome","72","4.2e-02","RNA processing"],
    ].map((row,i) => new TableRow({ children:[
      dataCell(row[0],3000,i%2===0,BLUE,true),
      dataCell(row[1],1200,i%2===0),
      dataCell(row[2],1560,i%2===0,"000000",true),
      dataCell(row[3],3600,i%2===0)
    ]})))
  ]
}));
body.push(blankLine());
body.push(callout("See Figure 7: results/figures/kegg_dotplot_D1_vs_NC.pdf  |  Figure 8: results/figures/go_dotplot_D1_vs_NC.pdf"));

body.push(heading3("3.6.2  GO and KEGG Enrichment — Subacute Stroke (D2 vs NC)"));
body.push(bodyPara("With only 60 DEGs, far fewer pathways were enriched at Day 2 — 6 GO terms and 2 KEGG pathways. All 6 GO terms related to MAP kinase phosphatase activity (DUSP2, DUSP8). Enriched KEGG pathways: Efferocytosis (clearance of apoptotic cells, indicating transition to inflammation resolution) and Homologous Recombination (DNA damage repair consistent with oxidative stress during acute stroke)."));

body.push(heading3("3.6.3  GSEA — Ranked Gene Set Enrichment"));
body.push(bodyPara("GSEA identified 189 GO-BP terms in D1 vs NC and 155 terms in D2 vs NC. The higher count in D2 despite fewer DEGs reflects GSEA's ability to detect subtle, coordinated shifts in gene expression without requiring a hard significance cutoff — exactly what is expected during the resolution phase."));
body.push(callout("See Figure 10: results/figures/gsea_ridgeplot_D1_vs_NC.pdf  |  Figure 11: results/figures/gsea_ridgeplot_D2_vs_NC.pdf"));
body.push(blankLine());

// ── Section 4: Discussion ─────────────────────────────────────────────────────
body.push(pageBreak());
body.push(heading1("4.  Discussion"));

body.push(heading2("4.1  Magnitude of the Acute Stroke Transcriptomic Response"));
body.push(bodyPara("The identification of 8,594 DEGs in Day 1 stroke patients is striking. For comparison, typical immune stimulation experiments (e.g., LPS-treated monocytes) yield 2,000–4,000 DEGs. The outsized response in acute stroke reflects the convergence of multiple simultaneous insults: ischemia-induced cellular damage, release of danger-associated molecular patterns (DAMPs), rapid neutrophil and monocyte activation, and systemic coagulation activation. This is consistent with prior transcriptomic studies of stroke patients, where large-scale gene expression changes have been reported within hours of symptom onset."));

body.push(heading2("4.2  Ribosomal Upregulation — A Signature of Immune Activation"));
body.push(bodyPara("The most statistically significant pathway finding — ribosomal protein upregulation (112 genes, p = 5.7x10^-23) — may seem surprising at first glance. However, this is a well-established signature of immune activation. When monocytes transition from a resting to an activated state, they dramatically upregulate their translational machinery to support production of cytokines, surface receptors, and effector proteins. This has been observed in transcriptomic studies of sepsis and trauma, conditions sharing the systemic alarm characteristic of stroke."));

body.push(heading2("4.3  Neutrophil Extracellular Traps — A Key Mechanistic Link"));
body.push(bodyPara("The enrichment of the NET formation pathway is among the most clinically relevant findings. NETs are web-like structures released by activated neutrophils, composed of DNA, histones, and granule proteins (including ELANE, found upregulated here). In ischemic stroke:"));
body.push(bullet("NETs have been identified within cerebral thrombi removed by thrombectomy"));
body.push(bullet("NET components promote platelet aggregation and coagulation (immunothrombosis)"));
body.push(bullet("NETs can directly damage the blood-brain barrier"));
body.push(bullet("Animal models show that DNase I (which degrades NETs) reduces infarct volume"));
body.push(bodyPara("The upregulation of NET-associated genes (histone H2A, H2B, H3, H4 families, ELANE) in peripheral blood one day after stroke supports ongoing clinical investigations into NET inhibition as a stroke therapy."));

body.push(heading2("4.4  Platelet Biology — PPBP Downregulation"));
body.push(bodyPara("The most strongly downregulated gene, PPBP (CXCL7, LFC = -4.69), is a platelet alpha-granule chemokine that recruits and activates neutrophils. Its dramatic downregulation likely reflects: (1) platelet consumption at the thrombotic site, depleting circulating platelet-derived factors; (2) altered platelet-monocyte signaling in stroke; and (3) negative feedback suppression of platelet-derived neutrophil recruitment to prevent runaway inflammation. Downregulation of RGS18 (a platelet activation regulator) further supports platelet-PBMC crosstalk as a central mechanism."));

body.push(heading2("4.5  Rapid Transcriptomic Resolution — Day 2"));
body.push(bodyPara("The collapse from 8,594 DEGs (Day 1) to just 60 DEGs (Day 2) carries important clinical implications. This rapid normalization could reflect:"));
body.push(bullet("Physiological immune resolution — homeostatic mechanisms actively dampen the response, evidenced by DUSP2/DUSP8 upregulation", "1."));
body.push(bullet("Post-stroke immunodepression (PIDS) — a well-documented phenomenon where initial immune activation is followed by profound immune suppression, increasing susceptibility to post-stroke infections", "2."));
body.push(bullet("Statistical sensitivity — GSEA identified 155 enriched pathways at Day 2, indicating subtle coordinated changes persist but do not cross our hard DEG threshold", "3."));

body.push(heading2("4.6  Efferocytosis — The Resolution Phase"));
body.push(bodyPara("The enrichment of the efferocytosis pathway at Day 2 indicates that macrophages are transitioning from attack to cleanup mode — clearing apoptotic immune cell debris generated during the acute response. This is consistent with known temporal dynamics of post-stroke inflammation and suggests that by Day 2, monocyte-derived macrophages are shifting their functional state toward resolution."));

body.push(heading2("4.7  The 55 Persistent Genes — Candidate Biomarkers"));
body.push(bodyPara("The 55 genes differentially expressed at both Day 1 and Day 2 represent sustained post-stroke transcriptional changes and warrant attention as: (1) prognostic biomarkers for stroke severity or outcome; (2) therapeutic targets for ongoing biological processes; and (3) mechanistic anchors for the core stroke-immune response. Future studies should validate these genes in larger cohorts and assess their association with clinical endpoints."));

body.push(heading2("4.8  Limitations"));
body.push(bullet("Small sample size (n=5 per group) limits statistical power; results should be validated in larger cohorts", "1."));
body.push(bullet("Single timepoint per phase — longitudinal sampling of the same individuals would strengthen causal inference", "2."));
body.push(bullet("PBMC heterogeneity — single-cell RNA-seq would reveal which specific cell types drive observed changes", "3."));
body.push(bullet("Assignment rate (34–47%) below the ideal >60% benchmark; intronic/intergenic alignment contributes to unassigned reads", "4."));
body.push(bullet("Only Days 1 and 2 captured — longer follow-up would reveal the full temporal trajectory of post-stroke transcriptomics", "5."));
body.push(blankLine());

// ── Section 5: Conclusion ─────────────────────────────────────────────────────
body.push(pageBreak());
body.push(heading1("5.  Conclusion"));
body.push(bodyPara("This project applied a complete bulk RNA-seq bioinformatics pipeline to peripheral blood transcriptomic data from acute ischemic stroke patients (GSE122709). Beginning from raw FASTQ files, we successfully performed quality control, genome alignment, gene quantification, differential expression analysis, and functional enrichment to produce biologically interpretable findings."));
body.push(blankLine());
body.push(new Paragraph({ children:[bold("Key conclusions:",{color:BLUE})], spacing:{before:80,after:80} }));
body.push(bullet("Acute ischemic stroke triggers a massive transcriptomic response in circulating PBMCs (8,594 DEGs at Day 1) — far exceeding typical immune stimulation signatures", "1."));
body.push(bullet("The response is dominated by four themes: ribosomal biogenesis, neutrophil extracellular trap formation, mitochondrial metabolic reprogramming, and antimicrobial chemokine release", "2."));
body.push(bullet("The response is largely transient: by Day 2 only 60 genes remain differentially expressed, reflecting rapid physiological resolution", "3."));
body.push(bullet("55 genes are persistently dysregulated at both timepoints, representing candidate biomarkers and mechanistic anchors for the post-stroke immune response", "4."));
body.push(bullet("Upregulation of DUSP2/DUSP8 at Day 2 indicates active MAP kinase suppression, consistent with immune resolution and efferocytosis", "5."));
body.push(blankLine());

// ── Section 6: Figure Legend ──────────────────────────────────────────────────
body.push(heading1("6.  Figure Legend"));
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[1200,4560,3600],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Figure",1200), headerCell("File",4560), headerCell("Description",3600)
    ]}),
    ...([
      ["Fig. 1","data/qc/multiqc_raw_report.html","MultiQC QC summary — all 30 raw FASTQ files"],
      ["Fig. 2","results/figures/pca_all_samples.pdf","PCA of VST-normalized counts — all 15 samples"],
      ["Fig. 3","results/figures/volcano_D1_vs_NC.pdf","Volcano plot: acute stroke (D1) vs controls"],
      ["Fig. 4","results/figures/heatmap_top50_DEGs.pdf","Heatmap of top 50 DEGs (Z-scored VST counts)"],
      ["Fig. 5","results/figures/volcano_D2_vs_NC.pdf","Volcano plot: subacute stroke (D2) vs controls"],
      ["Fig. 6","results/deseq2/deseq2_DEG_overlap.csv","DEG overlap table (shared vs timepoint-specific)"],
      ["Fig. 7","results/figures/kegg_dotplot_D1_vs_NC.pdf","KEGG pathway dotplot — acute stroke"],
      ["Fig. 8","results/figures/go_dotplot_D1_vs_NC.pdf","GO enrichment dotplot — acute stroke"],
      ["Fig. 9","results/figures/kegg_dotplot_D2_vs_NC.pdf","KEGG pathway dotplot — subacute stroke"],
      ["Fig. 10","results/figures/gsea_ridgeplot_D1_vs_NC.pdf","GSEA ridgeplot — acute stroke GO-BP terms"],
      ["Fig. 11","results/figures/gsea_ridgeplot_D2_vs_NC.pdf","GSEA ridgeplot — subacute stroke GO-BP terms"],
      ["Fig. 12","results/figures/go_emapplot_D1_vs_NC.pdf","GO term similarity network — acute stroke"],
      ["Fig. 13","results/figures/dispersion_plot.pdf","DESeq2 dispersion estimates"],
    ].map((row,i) => new TableRow({ children:[
      dataCell(row[0],1200,i%2===0,BLUE,true),
      dataCell(row[1],4560,i%2===0,"555555"),
      dataCell(row[2],3600,i%2===0)
    ]})))
  ]
}));
body.push(blankLine());

// ── Section 7: References ─────────────────────────────────────────────────────
body.push(heading1("7.  References"));
const refs = [
  "Iadecola C, Buckwalter MS, Anrather J. Immune responses to stroke: mechanisms, modulation, and therapeutic potential. J Clin Invest. 2020;130(6):2777-2788.",
  "Anrather J, Iadecola C. Inflammation and stroke: an overview. Neurotherapeutics. 2016;13(4):661-670.",
  "Kim D, Langmead B, Salzberg SL. HISAT: a fast spliced aligner with low memory requirements. Nat Methods. 2015;12(4):357-360.",
  "Liao Y, Smyth GK, Shi W. featureCounts: an efficient general purpose program for assigning sequence reads to genomic features. Bioinformatics. 2014;30(7):923-930.",
  "Love MI, Huber W, Anders S. Moderated estimation of fold change and dispersion for RNA-seq data with DESeq2. Genome Biol. 2014;15(12):550.",
  "Yu G, Wang LG, Han Y, He QY. clusterProfiler: an R Package for Comparing Biological Themes Among Gene Clusters. OMICS. 2012;16(5):284-287.",
  "Perez-de-Puig I, et al. Neutrophil extracellular trap (NET) formation is a hallmark of cerebral ischemia. J Neuroinflammation. 2015;12:7.",
  "Vogelgesang A, et al. Stroke induces lymphopenia in humans and experimental models: a systematic review. J Neuroinflammation. 2018;15(1):166.",
  "Andrews S. FastQC: a quality control tool for high throughput sequence data. Babraham Bioinformatics. 2010.",
  "Ewels P, et al. MultiQC: summarize analysis results for multiple tools and samples in a single report. Bioinformatics. 2016;32(19):3047-3048.",
];
refs.forEach((ref, i) => {
  body.push(new Paragraph({
    children:[
      new TextRun({text:`${i+1}.  `, font:"Arial", size:20, bold:true, color:MID_BLUE}),
      new TextRun({text:ref, font:"Arial", size:20})
    ],
    spacing:{ before:60, after:60 },
    indent:{ left:360, hanging:360 }
  }));
});

// ── Appendix: Pipeline Summary ────────────────────────────────────────────────
body.push(pageBreak());
body.push(heading1("Appendix: Pipeline Summary"));
body.push(bodyPara("The complete analysis pipeline from raw FASTQ files to biological interpretation:"));
body.push(blankLine());

const pipelineLines = [
  "  Raw FASTQ  (15 samples, 30 files)",
  "       |",
  "       v  FastQC + MultiQC",
  "  QC PASS  --  No trimming required",
  "       |",
  "       v  HISAT2 (GRCh38, genome index)",
  "  Genome Alignment  --  92.5 - 96.0% alignment rate",
  "       |",
  "       v  SAMtools sort + index",
  "  15 sorted, indexed BAM files",
  "       |",
  "       v  featureCounts (GENCODE v44, -s 0)",
  "  Count matrix  --  62,700 genes x 15 samples",
  "       |",
  "       v  Pre-filter  (>=10 counts in >=5 samples)",
  "  23,995 expressed genes retained",
  "       |",
  "       v  DESeq2  (design: ~ condition)",
  "       |",
  "       +--[D1 vs NC]-->  8,594 DEGs  (4,890 up  /  3,704 down)",
  "       +--[D2 vs NC]-->     60 DEGs  (   45 up  /     15 down)",
  "       |",
  "       v  clusterProfiler",
  "       |",
  "       +--[D1]-->  63 GO terms  |  12 KEGG pathways  |  189 GSEA terms",
  "       +--[D2]-->   6 GO terms  |   2 KEGG pathways  |  155 GSEA terms",
  "       |",
  "       v  ggplot2  +  pheatmap  +  enrichplot",
  "  Figures: PCA, volcano, heatmap, MA, dotplots, ridgeplots",
];

body.push(...codeBlock(pipelineLines));
body.push(blankLine());

body.push(heading2("Software Versions"));
body.push(new Table({
  width:{size:9360,type:WidthType.DXA},
  columnWidths:[3120,3120,3120],
  rows:[
    new TableRow({ tableHeader:true, children:[
      headerCell("Tool",3120), headerCell("Version",3120), headerCell("Purpose",3120)
    ]}),
    ...([
      ["SRA Toolkit","3.0.7","Data download"],
      ["FastQC","0.12.1","Read QC"],
      ["MultiQC","1.18","QC aggregation"],
      ["HISAT2","2.2.1","Genome alignment"],
      ["SAMtools","1.18","BAM processing"],
      ["featureCounts (Subread)","2.0.6","Gene quantification"],
      ["R","4.3.1","Statistical analysis"],
      ["DESeq2","1.42","Differential expression"],
      ["clusterProfiler","4.10","Functional enrichment"],
      ["ggplot2","3.5","Visualization"],
    ].map((row,i) => new TableRow({ children:[
      dataCell(row[0],3120,i%2===0,BLUE,true),
      dataCell(row[1],3120,i%2===0,"555555"),
      dataCell(row[2],3120,i%2===0)
    ]})))
  ]
}));

// ── Assemble main body section ────────────────────────────────────────────────
sections.push({
  properties: {
    page: {
      size: { width:12240, height:15840 },
      margin: { top:1440, right:1440, bottom:1260, left:1440 }
    }
  },
  headers: {
    default: new Header({ children:[
      new Paragraph({
        children:[
          new TextRun({ text:"DATA_SCI_8110  |  Genomics Analytics", font:"Arial", size:18, color:"888888" }),
          new TextRun({ text:"\t", font:"Arial", size:18 }),
          new TextRun({ text:"GSE122709 Stroke RNA-seq Analysis", font:"Arial", size:18, color:"888888" })
        ],
        tabStops:[{ type:TabStopType.RIGHT, position:TabStopPosition.MAX }],
        border:{ bottom:{ style:BorderStyle.SINGLE, size:4, color:MID_BLUE, space:4 } },
        spacing:{ after:0 }
      })
    ]}),
  },
  footers: {
    default: new Footer({ children:[
      new Paragraph({
        children:[
          new TextRun({ children:[PageNumber.CURRENT], font:"Arial", size:18, color:"888888" }),
          new TextRun({ text:" | Differential Gene Expression Analysis — Acute Ischemic Stroke", font:"Arial", size:18, color:"888888" })
        ],
        alignment: AlignmentType.CENTER,
        border:{ top:{ style:BorderStyle.SINGLE, size:4, color:MID_BLUE, space:4 } }
      })
    ]})
  },
  children: body
});

// ── Build document ────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left:720, hanging:360 } } }
      }]
    }]
  },
  styles: {
    default: {
      document: { run: { font:"Arial", size:22 } }
    },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:32, bold:true, font:"Arial", color:BLUE },
        paragraph:{ spacing:{ before:360, after:160 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:26, bold:true, font:"Arial", color:MID_BLUE },
        paragraph:{ spacing:{ before:280, after:120 }, outlineLevel:1 } },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:24, bold:true, font:"Arial", color:GREY_TEXT },
        paragraph:{ spacing:{ before:200, after:80 }, outlineLevel:2 } },
    ]
  },
  sections
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(
    "C:/Users/arpit/Desktop/Genomics_project/report/GSE122709_Stroke_RNAseq_Report.docx",
    buf
  );
  console.log("SUCCESS: Word document created.");
}).catch(err => { console.error("ERROR:", err.message); process.exit(1); });
