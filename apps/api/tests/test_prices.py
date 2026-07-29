"""
Tests for the /prices/trend endpoint.

Bug fixed: the SQL query used `(:months || ' months')::INTERVAL` where
:months is an integer. PostgreSQL's `||` (text concatenation) operator
does not accept an integer operand, so the query raised a 500 error at
runtime. The fix replaces it with `make_interval(months => :months)`,
which is type-safe and idiomatic.

These tests verify:
1. The SQL query string in the source uses make_interval (regression guard).
2. The months parameter is bounded (6..60).
3. The endpoint accepts valid parameters and returns the expected shape.
4. An empty result set returns an empty list (not 500).
"""

import ast
import pathlib

import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import AsyncMock, MagicMock

import sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from main import app  # noqa: E402
from core.database import get_db  # noqa: E402

PRICES_FILE = pathlib.Path(__file__).resolve().parent.parent / "routers" / "prices.py"


# ─── Helpers ──────────────────────────────────────────────────────────

def _extract_sql_from_source() -> str:
    """Read prices.py source and extract the raw SQL string from the
    get_price_trend function so we can assert on it without a DB."""
    source = PRICES_FILE.read_text()
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, ast.AsyncFunctionDef) and node.name == "get_price_trend":
            for child in ast.walk(node):
                if isinstance(child, ast.Constant) and isinstance(child.value, str):
                    if "saleDate" in child.value and "postalCode" in child.value:
                        return child.value
    raise RuntimeError("Could not find SQL query in get_price_trend source")


def _make_mock_db(rows):
    """Create a mock async DB session that returns the given rows."""
    mock_result = MagicMock()
    mock_result.fetchall.return_value = rows

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    async def _override():
        yield mock_session

    return _override


# ─── Tests: SQL regression guard ───────────────────────────────────────

class TestTrendSqlRegression:
    """Ensure the SQL in the source code uses make_interval, not the
    buggy `|| ' months'` concatenation."""

    def test_sql_uses_make_interval(self):
        sql = _extract_sql_from_source()
        assert "make_interval(months =>" in sql, (
            "Expected make_interval(months => :months) in the trend query, "
            "but it was not found. The integer-to-text cast bug may have regressed."
        )

    def test_sql_does_not_use_buggy_concatenation(self):
        sql = _extract_sql_from_source()
        assert "|| ' months'" not in sql, (
            "Found the buggy `|| ' months'` pattern in the trend query. "
            "This fails at runtime because :months is an integer, not text."
        )


# ─── Tests: endpoint behaviour with mocked DB ─────────────────────────

class TestTrendEndpoint:
    """Test the /prices/trend endpoint with a mocked database session."""

    @pytest.mark.asyncio
    async def test_trend_returns_list_of_months(self):
        """Valid request returns a list of {month, avg_price, transactions}."""
        mock_row = MagicMock()
        mock_row.month = "2025-01-01"
        mock_row.avg_price = 3200.0
        mock_row.transactions = 42

        app.dependency_overrides[get_db] = _make_mock_db([mock_row])
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.get("/prices/trend", params={"postal_code": "75001", "months": 24})

            assert resp.status_code == 200
            data = resp.json()
            assert isinstance(data, list)
            assert len(data) == 1
            assert data[0]["month"] == "2025-01"
            assert data[0]["avg_price"] == 3200.0
            assert data[0]["transactions"] == 42
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_trend_months_below_minimum_rejected(self):
        """months < 6 should be rejected by the Query(ge=6) validator."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/prices/trend", params={"postal_code": "75001", "months": 3})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_trend_months_above_maximum_rejected(self):
        """months > 60 should be rejected by the Query(le=60) validator."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/prices/trend", params={"postal_code": "75001", "months": 120})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_trend_missing_postal_code_rejected(self):
        """postal_code is required; omitting it should return 422."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/prices/trend", params={"months": 24})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_trend_empty_result(self):
        """When no data is found, an empty list should be returned (not 500)."""
        app.dependency_overrides[get_db] = _make_mock_db([])
        try:
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                resp = await client.get("/prices/trend", params={"postal_code": "00000", "months": 12})

            assert resp.status_code == 200
            assert resp.json() == []
        finally:
            app.dependency_overrides.clear()