"""Safe dataset operations — pure pandas logic, offline."""

from __future__ import annotations

import pytest

from app.core.exceptions import ValidationAppError
from app.services.data_analysis import operations as ops

CSV = b"region,sales,units\nNorth,100,5\nSouth,200,8\nNorth,150,6\nWest,50,2\n"


def _df():
    return ops.read_dataframe(CSV, "csv")


def test_read_and_metadata():
    df = _df()
    meta = ops.metadata(df)
    assert meta["row_count"] == 4
    assert meta["column_count"] == 3
    assert meta["columns"] == ["region", "sales", "units"]


def test_read_rejects_empty():
    with pytest.raises(ValidationAppError):
        ops.read_dataframe(b"col1,col2\n", "csv")


def test_preview_limits_rows():
    out = ops.preview(_df(), rows=2)
    assert len(out["rows"]) == 2
    assert out["columns"] == ["region", "sales", "units"]


def test_stats_reports_missing_and_describe():
    st = ops.stats(_df())
    assert st["row_count"] == 4
    assert "sales" in st["numeric_columns"]
    assert st["describe"]["sales"]["max"] == 200


def test_filter_numeric():
    out = ops.run_operation(_df(), "filter", {"column": "sales", "operator": ">", "value": 120})
    assert out["matched"] == 2  # 200 and 150


def test_aggregate_groupby_sum():
    out = ops.run_operation(_df(), "aggregate", {"group_by": "region", "metric": "sales", "agg": "sum"})
    data = dict(zip(out["labels"], out["values"]))
    assert data["North"] == 250
    assert data["South"] == 200


def test_value_counts():
    out = ops.run_operation(_df(), "value_counts", {"column": "region"})
    counts = dict(zip(out["labels"], out["values"]))
    assert counts["North"] == 2


def test_unknown_column_rejected():
    with pytest.raises(ValidationAppError):
        ops.run_operation(_df(), "aggregate", {"group_by": "nope", "metric": "sales", "agg": "sum"})


def test_bad_operator_rejected():
    with pytest.raises(ValidationAppError):
        ops.run_operation(_df(), "filter", {"column": "sales", "operator": "DROP", "value": 1})


def test_bad_aggregation_rejected():
    with pytest.raises(ValidationAppError):
        ops.run_operation(_df(), "aggregate", {"group_by": "region", "metric": "sales", "agg": "eval"})


def test_unknown_operation_rejected():
    with pytest.raises(ValidationAppError):
        ops.run_operation(_df(), "exec", {})
