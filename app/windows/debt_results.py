from __future__ import annotations

from typing import Dict

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication, QFileDialog, QLabel, QHeaderView, QTableWidgetItem

from app.core.formatters import fmt_currency
from app.core.settings import settings
from app.ui.styles import DEFAULT_THEME, apply_theme, ui_palette
from app.windows.results import BaseResultsDialog


class DebtResultsDialog(BaseResultsDialog):
    table_headers = ["Mes", "Pago", "Interés", "Capital", "Saldo"]
    table_fields = ["mes", "pago", "interes", "capital", "saldo"]
    currency_fields = {"pago", "interes", "capital", "saldo"}
    align_right_fields = {"pago", "interes", "capital", "saldo"}
    export_default_filename = "amortizacion.csv"

    def __init__(self, title: str, totales: Dict[str, float], parent=None):
        super().__init__(title, parent, show_chart=False)

        dialog_title = self.tr("Amortización del crédito")
        self.setWindowTitle(dialog_title)
        self.lblTitle.setText(dialog_title)
        self.setWindowFlag(Qt.Window, True)
        self.setWindowFlag(Qt.WindowCloseButtonHint, True)
        self.setAttribute(Qt.WA_DeleteOnClose, True)
        self.setWindowModality(Qt.ApplicationModal)
        self.setMinimumSize(1024, 640)
        self.resize(1200, 720)
        header = self.tableView.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.Stretch)
        self.tableView.setStyleSheet(
            """
            QTableWidget { background-color:#0f1b37; alternate-background-color:#132246;
                           color:#EAF1FF; gridline-color:#20315b; }
            QHeaderView::section { background:#101b33; color:#EAF1FF; border:none; padding:6px; }
            QTableWidget::item:selected { background:#1f3a6d; color:#EAF1FF; }
            """
        )
        self.chartFrame.setMinimumHeight(320)

        self._settings = settings

        resumen = QLabel(
            f"Total pagado: <b>{fmt_currency(totales.get('total_pago', 0))}</b>  |  "
            f"Intereses: <b style='color:#ff4d4f;'>{fmt_currency(totales.get('intereses', 0))}</b>  |  "
            f"Plazo: {int(totales.get('meses', 0))} meses"
        )
        resumen.setWordWrap(True)
        self.summary_layout.addWidget(resumen)

        self.btn_export.setAccessibleName("Exportar amortizacion a CSV")

        self._settings.changed.connect(self._on_settings_changed)
        self._on_settings_changed(self._settings.daltonismo, self._settings.language)

    def populate_table(self, rows: list[dict]):
        if not rows:
            self.tableView.setRowCount(0)
            return

        self.tableView.clearContents()
        self.tableView.setRowCount(len(rows))
        self.tableView.setColumnCount(len(self.table_headers))
        self.tableView.setHorizontalHeaderLabels(self.table_headers)

        for r, row in enumerate(rows):
            for c, field in enumerate(self.table_fields):
                value = row.get(field, "")
                item = QTableWidgetItem(self._fmt_cell(c, value))
                item.setFlags(item.flags() & ~Qt.ItemIsEditable)
                self.tableView.setItem(r, c, item)

    def _export_csv(self):
        path, _ = QFileDialog.getSaveFileName(
            self,
            self.export_dialog_title,
            self.export_default_filename,
            "CSV (*.csv)",
        )
        if not path:
            return

        headers = [self.tableView.horizontalHeaderItem(i).text() for i in range(self.tableView.columnCount())]
        import csv

        with open(path, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(headers)
            for row in range(self.tableView.rowCount()):
                writer.writerow(
                    [
                        self._fmt_cell(col, self.tableView.item(row, col).text())
                        if self.tableView.item(row, col)
                        else ""
                        for col in range(self.tableView.columnCount())
                    ]
                )

    def _fmt_cell(self, col_idx: int, value) -> str:
        if value in ("", None):
            return ""
        try:
            number = float(value)
        except (TypeError, ValueError):
            return str(value)
        rounded = int(round(number))
        if col_idx == 0:
            return str(rounded)
        return f"MXN {rounded:,}".replace(",", ",")

    def _on_settings_changed(self, daltonismo: bool, language: str):
        apply_theme(QApplication.instance(), DEFAULT_THEME, daltonismo)
        palette = ui_palette(DEFAULT_THEME, daltonismo)
        bg = palette.get("panel", "#16223A")
        border = palette.get("border", "#25385A")
        self._frame.setStyleSheet(
            f"QFrame#resultsFrame {{ background: {bg}; border: 1px solid {border}; border-radius: 16px; }}"
        )
