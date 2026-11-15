"""Safe, allowlisted dataset operations built on pandas.

Security model: user/AI input NEVER becomes code. Every operation is an
explicit, validated function. No eval/exec, no df.query with user strings,
no attribute access from input. Column names are validated against the
actual dataframe; operators and aggregations come from fixed allowlists.
"""

from __future__ import annotations

import io

import numpy as np
import pandas as pd

from app.core.exceptions import ValidationAppError

# Hard caps to protect memory on free-tier hosts.
MAX_ROWS = 50_000
PREVIEW_MAX = 100

FILTER_OPS = {"==", "!=", ">", "<", ">=", "<=", "contains"}
AGG_FUNCS = {"sum", "mean", "count", "min", "max", "median"}


def read_dataframe(
    data: bytes, file_type: str, sheet: str | None = None
) -> pd.DataFrame:
    """Parse uploaded bytes into a dataframe, capped at MAX_ROWS."""
    ft = file_type.lower()
    try:
        if ft == "csv":
            df = pd.read_csv(io.BytesIO(data), nrows=MAX_ROWS)
        elif ft in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(data), sheet_name=sheet or 0, nrows=MAX_ROWS)
        else:
            raise ValidationAppError(f"Unsupported dataset type: {file_type}")
    except ValidationAppError:
        raise
    except Exception as exc:  # malformed spreadsheet, bad encoding, etc.
        raise ValidationAppError(f"Could not read the file: {exc}") from exc
    if df.empty:
        raise ValidationAppError("The dataset has no rows.")
    return df


def sheet_names(data: bytes, file_type: str) -> list[str] | None:
    if file_type.lower() not in ("xlsx", "xls"):
        return None
    try:
        return pd.ExcelFile(io.BytesIO(data)).sheet_names
    except Exception:
        return None


def _jsonable(value):
    """Convert numpy/pandas scalars to JSON-safe Python values."""
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating,)):
        return None if np.isnan(value) else float(value)
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if pd.isna(value):
        return None
    return value


def metadata(df: pd.DataFrame) -> dict:
    """Column names, dtypes, row/column counts (stored at upload time)."""
    return {
        "row_count": int(len(df)),
        "column_count": int(df.shape[1]),
        "columns": [str(c) for c in df.columns],
        "dtypes": {str(c): str(df[c].dtype) for c in df.columns},
    }


def preview(df: pd.DataFrame, rows: int = 20) -> dict:
    rows = max(1, min(rows, PREVIEW_MAX))
    head = df.head(rows)
    return {
        "columns": [str(c) for c in df.columns],
        "rows": [[_jsonable(v) for v in row] for row in head.itertuples(index=False)],
    }


def stats(df: pd.DataFrame) -> dict:
    """Missing-value counts + descriptive statistics for numeric columns."""
    missing = {str(c): int(df[c].isna().sum()) for c in df.columns}
    numeric = df.select_dtypes(include="number")
    describe: dict[str, dict] = {}
    if not numeric.empty:
        desc = numeric.describe()
        for col in desc.columns:
            describe[str(col)] = {k: _jsonable(v) for k, v in desc[col].items()}
    return {
        "row_count": int(len(df)),
        "column_count": int(df.shape[1]),
        "missing": missing,
        "describe": describe,
        "numeric_columns": [str(c) for c in numeric.columns],
    }


def _require_column(df: pd.DataFrame, column: str) -> None:
    if column not in df.columns:
        raise ValidationAppError(f"Unknown column: {column}")


def filter_rows(df: pd.DataFrame, column: str, operator: str, value) -> pd.DataFrame:
    _require_column(df, column)
    if operator not in FILTER_OPS:
        raise ValidationAppError(f"Unsupported operator: {operator}")
    series = df[column]
    if operator == "==":
        return df[series == value]
    if operator == "!=":
        return df[series != value]
    if operator == "contains":
        return df[series.astype(str).str.contains(str(value), case=False, na=False)]
    # Numeric comparisons
    try:
        numeric_value = float(value)
    except (TypeError, ValueError) as exc:
        raise ValidationAppError("Comparison requires a numeric value.") from exc
    if operator == ">":
        return df[series > numeric_value]
    if operator == "<":
        return df[series < numeric_value]
    if operator == ">=":
        return df[series >= numeric_value]
    return df[series <= numeric_value]  # "<="


def aggregate(df: pd.DataFrame, group_by: str, metric: str, agg: str) -> dict:
    _require_column(df, group_by)
    _require_column(df, metric)
    if agg not in AGG_FUNCS:
        raise ValidationAppError(f"Unsupported aggregation: {agg}")
    grouped = df.groupby(group_by, dropna=False)[metric].agg(agg)
    grouped = grouped.sort_values(ascending=False).head(50)
    return {
        "labels": [_jsonable(i) for i in grouped.index.tolist()],
        "values": [_jsonable(v) for v in grouped.values.tolist()],
        "group_by": group_by,
        "metric": metric,
        "agg": agg,
    }


def value_counts(df: pd.DataFrame, column: str, top: int = 10) -> dict:
    _require_column(df, column)
    counts = df[column].value_counts(dropna=False).head(max(1, min(top, 50)))
    return {
        "labels": [_jsonable(i) for i in counts.index.tolist()],
        "values": [int(v) for v in counts.values.tolist()],
        "column": column,
    }


def run_operation(df: pd.DataFrame, operation: str, params: dict) -> dict:
    """Dispatch an allowlisted operation with validated parameters."""
    params = params or {}
    if operation == "preview":
        return preview(df, int(params.get("rows", 20)))
    if operation == "stats":
        return stats(df)
    if operation == "filter":
        filtered = filter_rows(
            df, params.get("column", ""), params.get("operator", ""), params.get("value")
        )
        return {"matched": int(len(filtered)), **preview(filtered, int(params.get("rows", 20)))}
    if operation == "aggregate":
        return aggregate(
            df, params.get("group_by", ""), params.get("metric", ""), params.get("agg", "sum")
        )
    if operation == "value_counts":
        return value_counts(df, params.get("column", ""), int(params.get("top", 10)))
    raise ValidationAppError(f"Unsupported operation: {operation}")


def ai_summary(df: pd.DataFrame, sample_rows: int = 5) -> str:
    """Compact text summary of the dataset to ground an AI answer."""
    meta = metadata(df)
    st = stats(df)
    lines = [
        f"Rows: {meta['row_count']}, Columns: {meta['column_count']}",
        "Columns and types: "
        + ", ".join(f"{c} ({meta['dtypes'][c]})" for c in meta["columns"]),
    ]
    if st["describe"]:
        lines.append("Numeric summary:")
        for col, d in st["describe"].items():
            lines.append(
                f"  {col}: mean={d.get('mean')}, min={d.get('min')}, max={d.get('max')}"
            )
    sample = preview(df, sample_rows)
    lines.append("Sample rows: " + str(sample["rows"]))
    return "\n".join(lines)
