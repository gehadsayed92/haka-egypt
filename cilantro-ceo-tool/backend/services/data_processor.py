"""
Cilantro CEO Tool - Data Processor

Handles CSV/Excel file uploads and normalizes data into the database.
This is the PRIMARY data ingestion path — designed to work without any APIs.

Supported upload formats:
1. Sales data:    store_name, date, revenue, transactions, avg_ticket
2. Cost data:     store_name, date, category, amount, description
3. Cash position: date, balance, inflows, outflows, notes
"""

import csv
import io
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from models import (
    Store,
    DailySales,
    Cost,
    CashPosition,
    CostCategory,
    UploadResult,
)


class DataProcessor:
    """Processes CSV uploads and writes normalized data to the database."""

    def __init__(self, db: Session):
        self.db = db

    def process_sales_csv(self, file_content: str) -> UploadResult:
        """
        Import daily sales data from CSV.

        Expected columns: store_name, date, revenue, transactions, avg_ticket
        Date format: YYYY-MM-DD
        """
        errors = []
        warnings = []
        rows_imported = 0

        reader = csv.DictReader(io.StringIO(file_content))

        # Validate headers
        required = {"store_name", "date", "revenue"}
        if not required.issubset(set(reader.fieldnames or [])):
            return UploadResult(
                status="error",
                rows_imported=0,
                errors=[f"Missing required columns. Need: {required}. Got: {reader.fieldnames}"],
            )

        for i, row in enumerate(reader, start=2):  # start=2 for human-readable line numbers
            try:
                store = self._get_or_create_store(
                    row["store_name"].strip(),
                    row.get("location", "").strip() or "Unknown",
                )
                sale_date = datetime.strptime(row["date"].strip(), "%Y-%m-%d").date()
                revenue = float(row["revenue"].strip())
                transactions = int(row.get("transactions", "0").strip() or "0")
                avg_ticket = float(row.get("avg_ticket", "0").strip() or "0")

                if revenue < 0:
                    warnings.append(f"Row {i}: Negative revenue ({revenue}) — imported as-is.")

                # Upsert: update if same store+date exists
                existing = (
                    self.db.query(DailySales)
                    .filter(
                        DailySales.store_id == store.id,
                        DailySales.date == sale_date,
                    )
                    .first()
                )

                if existing:
                    existing.revenue = revenue
                    existing.transactions = transactions
                    existing.avg_ticket = avg_ticket
                    warnings.append(f"Row {i}: Updated existing record for {store.name} on {sale_date}.")
                else:
                    self.db.add(
                        DailySales(
                            store_id=store.id,
                            date=sale_date,
                            revenue=revenue,
                            transactions=transactions,
                            avg_ticket=avg_ticket,
                        )
                    )

                rows_imported += 1

            except (ValueError, KeyError) as e:
                errors.append(f"Row {i}: {str(e)}")

        self.db.commit()

        return UploadResult(
            status="success" if not errors else "partial",
            rows_imported=rows_imported,
            errors=errors,
            warnings=warnings,
        )

    def process_costs_csv(self, file_content: str) -> UploadResult:
        """
        Import cost data from CSV.

        Expected columns: store_name, date, category, amount, description
        category must be one of: cogs, labor, rent, utilities, marketing, other
        """
        errors = []
        warnings = []
        rows_imported = 0

        reader = csv.DictReader(io.StringIO(file_content))

        required = {"store_name", "date", "category", "amount"}
        if not required.issubset(set(reader.fieldnames or [])):
            return UploadResult(
                status="error",
                rows_imported=0,
                errors=[f"Missing required columns. Need: {required}. Got: {reader.fieldnames}"],
            )

        valid_categories = {c.value for c in CostCategory}

        for i, row in enumerate(reader, start=2):
            try:
                store = self._get_or_create_store(
                    row["store_name"].strip(),
                    row.get("location", "").strip() or "Unknown",
                )
                cost_date = datetime.strptime(row["date"].strip(), "%Y-%m-%d").date()
                category_str = row["category"].strip().lower()

                if category_str not in valid_categories:
                    errors.append(
                        f"Row {i}: Invalid category '{category_str}'. "
                        f"Must be one of: {valid_categories}"
                    )
                    continue

                amount = float(row["amount"].strip())
                description = row.get("description", "").strip() or None

                self.db.add(
                    Cost(
                        store_id=store.id,
                        date=cost_date,
                        category=CostCategory(category_str),
                        amount=amount,
                        description=description,
                    )
                )
                rows_imported += 1

            except (ValueError, KeyError) as e:
                errors.append(f"Row {i}: {str(e)}")

        self.db.commit()

        return UploadResult(
            status="success" if not errors else "partial",
            rows_imported=rows_imported,
            errors=errors,
            warnings=warnings,
        )

    def process_cash_csv(self, file_content: str) -> UploadResult:
        """
        Import cash position data from CSV.

        Expected columns: date, balance, inflows, outflows, notes
        """
        errors = []
        warnings = []
        rows_imported = 0

        reader = csv.DictReader(io.StringIO(file_content))

        required = {"date", "balance"}
        if not required.issubset(set(reader.fieldnames or [])):
            return UploadResult(
                status="error",
                rows_imported=0,
                errors=[f"Missing required columns. Need: {required}. Got: {reader.fieldnames}"],
            )

        for i, row in enumerate(reader, start=2):
            try:
                cash_date = datetime.strptime(row["date"].strip(), "%Y-%m-%d").date()
                balance = float(row["balance"].strip())
                inflows = float(row.get("inflows", "0").strip() or "0")
                outflows = float(row.get("outflows", "0").strip() or "0")
                notes = row.get("notes", "").strip() or None

                # Upsert: one record per date
                existing = (
                    self.db.query(CashPosition)
                    .filter(CashPosition.date == cash_date)
                    .first()
                )

                if existing:
                    existing.balance = balance
                    existing.inflows = inflows
                    existing.outflows = outflows
                    existing.notes = notes
                    warnings.append(f"Row {i}: Updated cash position for {cash_date}.")
                else:
                    self.db.add(
                        CashPosition(
                            date=cash_date,
                            balance=balance,
                            inflows=inflows,
                            outflows=outflows,
                            notes=notes,
                        )
                    )

                rows_imported += 1

            except (ValueError, KeyError) as e:
                errors.append(f"Row {i}: {str(e)}")

        self.db.commit()

        return UploadResult(
            status="success" if not errors else "partial",
            rows_imported=rows_imported,
            errors=errors,
            warnings=warnings,
        )

    def _get_or_create_store(self, name: str, location: str) -> Store:
        """Find existing store by name or create a new one."""
        store = self.db.query(Store).filter(Store.name == name).first()
        if not store:
            store = Store(name=name, location=location)
            self.db.add(store)
            self.db.flush()  # Get the ID without committing
        return store
