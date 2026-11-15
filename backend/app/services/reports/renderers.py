"""Render a report (title + text sections) to PDF / DOCX / XLSX / CSV.

Generated spreadsheets/CSV are protected against formula injection: any cell
beginning with = + - @ (or a control char) is prefixed with a quote so it is
treated as text, not an executable formula.
"""

from __future__ import annotations

import csv
import io

MIME = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "csv": "text/csv",
}


def _sanitize_cell(value: object) -> str:
    text = "" if value is None else str(value)
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + text
    return text


def render(title: str, sections: list[dict], fmt: str) -> tuple[bytes, str]:
    fmt = fmt.lower()
    if fmt == "pdf":
        return _pdf(title, sections), MIME["pdf"]
    if fmt == "docx":
        return _docx(title, sections), MIME["docx"]
    if fmt == "xlsx":
        return _xlsx(title, sections), MIME["xlsx"]
    if fmt == "csv":
        return _csv(title, sections), MIME["csv"]
    raise ValueError(f"Unsupported report format: {fmt}")


def _pdf(title: str, sections: list[dict]) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=title)
    styles = getSampleStyleSheet()
    flow = [Paragraph(title, styles["Title"]), Spacer(1, 16)]
    for section in sections:
        heading = str(section.get("heading", ""))
        body = str(section.get("body", ""))
        if heading:
            flow.append(Paragraph(heading, styles["Heading2"]))
        for para in body.split("\n"):
            if para.strip():
                flow.append(Paragraph(para, styles["BodyText"]))
        flow.append(Spacer(1, 12))
    doc.build(flow)
    return buf.getvalue()


def _docx(title: str, sections: list[dict]) -> bytes:
    import docx

    document = docx.Document()
    document.add_heading(title, level=0)
    for section in sections:
        heading = str(section.get("heading", ""))
        body = str(section.get("body", ""))
        if heading:
            document.add_heading(heading, level=1)
        if body:
            document.add_paragraph(body)
    buf = io.BytesIO()
    document.save(buf)
    return buf.getvalue()


def _xlsx(title: str, sections: list[dict]) -> bytes:
    from openpyxl import Workbook
    from openpyxl.styles import Font

    wb = Workbook()
    ws = wb.active
    ws.title = "Report"
    ws["A1"] = _sanitize_cell(title)
    ws["A1"].font = Font(bold=True, size=14)
    row = 3
    for section in sections:
        ws.cell(row=row, column=1, value=_sanitize_cell(section.get("heading", ""))).font = Font(bold=True)
        row += 1
        for line in str(section.get("body", "")).split("\n"):
            ws.cell(row=row, column=1, value=_sanitize_cell(line))
            row += 1
        row += 1
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def _csv(title: str, sections: list[dict]) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([_sanitize_cell(title)])
    writer.writerow([])
    for section in sections:
        writer.writerow([_sanitize_cell(section.get("heading", ""))])
        for line in str(section.get("body", "")).split("\n"):
            writer.writerow([_sanitize_cell(line)])
        writer.writerow([])
    return buf.getvalue().encode("utf-8")
