"""
PDF Report Generator
Generates pathology analysis reports with predictions, heatmaps, and charts.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
)
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')


# Color scheme
TEAL = colors.Color(0.08, 0.72, 0.65)
CHARCOAL = colors.Color(0.06, 0.07, 0.08)
CREAM = colors.Color(0.98, 0.98, 0.97)


async def generate_pathology_report(analysis: Dict[str, Any]) -> bytes:
    """
    Generate a PDF pathology report for an analysis.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=TEAL,
        spaceAfter=12,
        alignment=TA_CENTER,
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=CHARCOAL,
        spaceBefore=12,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=CHARCOAL,
        leading=14,
    )

    story = []

    # Header
    story.append(Paragraph("Mega", title_style))
    story.append(Paragraph("AI Pathology Analysis Report", styles['Heading2']))
    story.append(Spacer(1, 12))

    # Metadata table
    meta_data = [
        ["Report Generated", datetime.now().strftime("%Y-%m-%d %H:%M")],
        ["Slide ID", analysis.get("id", "N/A")],
        ["Analysis Type", analysis.get("task", "N/A").replace("_", " ").title()],
        ["Slide File", analysis.get("slides", {}).get("filename", "N/A")],
        ["Model Version", analysis.get("model_version", "N/A")],
    ]

    meta_table = Table(meta_data, colWidths=[2*inch, 4*inch])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
        ('TEXTCOLOR', (1, 0), (1, -1), CHARCOAL),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Results section
    results = analysis.get("results", {})
    story.append(Paragraph("Analysis Results", heading_style))

    if "predictions" in results:
        # Subtype predictions
        story.append(Paragraph("Cancer Subtype Predictions", styles['Heading3']))

        pred_data = [["Subtype", "Confidence"]]
        for pred in results["predictions"][:5]:
            pred_data.append([
                pred["label"],
                f"{pred['score']:.1f}%"
            ])

        pred_table = Table(pred_data, colWidths=[4*inch, 1.5*inch])
        pred_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), TEAL),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(pred_table)
        story.append(Spacer(1, 12))

        # Generate prediction chart
        chart_buffer = generate_prediction_chart(results["predictions"])
        if chart_buffer:
            story.append(Image(chart_buffer, width=5*inch, height=3*inch))
            story.append(Spacer(1, 12))

    if "mutation_scores" in results:
        # Mutation predictions
        story.append(Paragraph("Mutation Likelihood Scores", styles['Heading3']))

        mut_data = [["Gene", "Likelihood"]]
        for gene, score in sorted(
            results["mutation_scores"].items(),
            key=lambda x: x[1],
            reverse=True
        ):
            mut_data.append([gene, f"{score*100:.1f}%"])

        mut_table = Table(mut_data, colWidths=[1.5*inch, 1.5*inch])
        mut_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), TEAL),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(mut_table)
        story.append(Spacer(1, 12))

    # Confidence summary
    confidence = results.get("confidence", 0)
    story.append(Paragraph("Confidence Assessment", heading_style))

    conf_text = f"""
    The overall confidence of this analysis is <b>{confidence:.1f}%</b>.
    """
    if confidence >= 90:
        conf_text += " This indicates a high-confidence prediction with strong model agreement."
    elif confidence >= 70:
        conf_text += " This indicates a moderate-confidence prediction. Clinical correlation is recommended."
    else:
        conf_text += " This indicates a lower-confidence prediction. Additional testing or expert review is advised."

    story.append(Paragraph(conf_text, body_style))
    story.append(Spacer(1, 20))

    # Disclaimer
    story.append(Paragraph("Disclaimer", heading_style))
    disclaimer = """
    This report is generated by an AI system and should be used as a decision support tool only.
    Results should be validated by a qualified pathologist. This analysis does not constitute
    a diagnosis and should be interpreted in the context of clinical findings and other
    diagnostic information.
    """
    story.append(Paragraph(disclaimer, body_style))

    # Footer
    story.append(Spacer(1, 30))
    story.append(Paragraph(
        f"Generated by Mega • {datetime.now().strftime('%Y-%m-%d')}",
        ParagraphStyle('Footer', fontSize=8, textColor=colors.gray, alignment=TA_CENTER)
    ))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_prediction_chart(predictions: list) -> Optional[io.BytesIO]:
    """Generate a bar chart of predictions."""
    if not predictions:
        return None

    fig, ax = plt.subplots(figsize=(8, 4))

    labels = [p["label"] for p in predictions[:5]]
    scores = [p["score"] for p in predictions[:5]]

    colors_list = ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A']

    bars = ax.barh(range(len(labels)), scores, color=colors_list)
    ax.set_yticks(range(len(labels)))
    ax.set_yticklabels(labels)
    ax.set_xlabel('Confidence (%)')
    ax.set_xlim(0, 100)

    # Add score labels
    for i, (bar, score) in enumerate(zip(bars, scores)):
        ax.text(score + 1, i, f'{score:.1f}%', va='center', fontsize=9)

    plt.tight_layout()

    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plt.close()

    return buffer