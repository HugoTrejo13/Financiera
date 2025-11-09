from __future__ import annotations

from typing import Dict, List

from PySide6.QtCharts import (
    QBarCategoryAxis,
    QBarSeries,
    QBarSet,
    QChart,
    QChartView,
    QValueAxis,
)
from PySide6.QtCore import QEasingCurve, QMargins, QPropertyAnimation, Qt, Signal, QTimer
from PySide6.QtGui import QBrush, QCloseEvent, QColor, QCursor, QPainter, QPen
from PySide6.QtWidgets import (
    QApplication,
    QDialog,
    QDialogButtonBox,
    QFileDialog,
    QFrame,
    QGraphicsOpacityEffect,
    QHeaderView,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSplitter,
    QSizePolicy,
    QStyle,
    QTableWidget,
    QTableWidgetItem,
    QToolButton,
    QToolTip,
    QVBoxLayout,
)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
import matplotlib.pyplot as plt
from matplotlib.figure import Figure

from app.core.formatters import fmt_currency
from app.core.settings import settings
from app.ui.styles import DEFAULT_THEME, apply_theme, chart_colors, chart_patterns, ui_palette


class BaseResultsDialog(QDialog):
    table_headers: List[str] = []
    table_fields: List[str] = []
    currency_fields: set[str] = set()
    align_right_fields: set[str] = set()
    currency_prefix: str = "MXN "
    export_dialog_title: str = "Exportar CSV"
    export_default_filename: str = "resultados.csv"
    closed = Signal()

    def __init__(self, title: str, parent=None, *, show_chart: bool = True):
        super().__init__(parent)
        self.setWindowTitle(title)
        self.setWindowFlag(Qt.Window, True)
        self.setWindowFlag(Qt.WindowCloseButtonHint, True)
        self.setModal(True)
        self.setWindowModality(Qt.ApplicationModal)
        self.setAttribute(Qt.WA_DeleteOnClose, True)
        self.setMinimumSize(1024, 640)
        self.resize(1200, 720)
        self.setSizeGripEnabled(True)

        self._effect = QGraphicsOpacityEffect(self)
        self.setGraphicsEffect(self._effect)
        self._effect.setOpacity(0.0)
        self._animations: List[QPropertyAnimation] = []
        self._closing = False

        self._chart: QChart | None = None
        self.chartView: QChartView | None = None
        self._series: QBarSeries | None = None
        self._axis_x: QBarCategoryAxis | None = None
        self._axis_y: QValueAxis | None = None
        self._chart_categories: List[str] = []
        self._chart_values: List[float] = []

        outer = QVBoxLayout(self)
        outer.setContentsMargins(20, 20, 20, 20)
        outer.setSpacing(12)

        frame = QFrame()
        frame.setObjectName("resultsFrame")
        container = QVBoxLayout(frame)
        container.setContentsMargins(20, 20, 20, 20)
        container.setSpacing(14)
        outer.addWidget(frame)

        title_bar = QHBoxLayout()
        title_bar.setContentsMargins(0, 0, 0, 0)
        title_bar.setSpacing(10)
        self.lblTitle = QLabel(title)
        title_font = self.lblTitle.font()
        title_font.setPointSize(18)
        title_font.setBold(True)
        self.lblTitle.setFont(title_font)
        self.lblTitle.setProperty("role", "title")
        title_bar.addWidget(self.lblTitle)
        title_bar.addStretch(1)
        self.btnClose = QToolButton(self)
        self.btnClose.setAutoRaise(True)
        self.btnClose.setCursor(QCursor(Qt.PointingHandCursor))
        self.btnClose.setIcon(self.style().standardIcon(QStyle.SP_TitleBarCloseButton))
        self.btnClose.setToolTip(self.tr("Cerrar"))
        self.btnClose.clicked.connect(self.accept)
        title_bar.addWidget(self.btnClose)
        container.addLayout(title_bar)

        self.summary_layout = QVBoxLayout()
        self.summary_layout.setContentsMargins(0, 0, 0, 0)
        self.summary_layout.setSpacing(4)
        container.addLayout(self.summary_layout)

        self.split = QSplitter(Qt.Vertical)
        self.split.setChildrenCollapsible(False)
        container.addWidget(self.split, 1)

        self.table = QTableWidget(0, 0, self)
        self.table.setAlternatingRowColors(True)
        self.table.setWordWrap(False)
        self.table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        header_view = self.table.horizontalHeader()
        header_view.setSectionResizeMode(QHeaderView.Stretch)
        header_view.setMinimumSectionSize(120)
        vertical_header = self.table.verticalHeader()
        vertical_header.setSectionResizeMode(QHeaderView.Fixed)
        vertical_header.setDefaultSectionSize(36)
        vertical_header.setVisible(False)
        self.split.addWidget(self.table)
        self.tableView = self.table
        self.tbl = self.table  # alias for backwards compatibility
        self.tableView.setAlternatingRowColors(True)
        self.tableView.setSortingEnabled(False)
        self.tableView.setMinimumHeight(260)

        self.chartFrame = QFrame()
        self.chartLayout = QVBoxLayout(self.chartFrame)
        self.chartLayout.setContentsMargins(0, 0, 0, 0)
        self.chartLayout.setSpacing(0)
        self.chartFrame.setMinimumHeight(320)
        self.chartFrame.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.split.addWidget(self.chartFrame)
        self.split.setStretchFactor(0, 3)
        self.split.setStretchFactor(1, 2)
        self.split.setSizes([460, 320])

        if not show_chart:
            self.chartFrame.hide()
            self.split.setSizes([1, 0])

        button_row = QHBoxLayout()
        button_row.addStretch(1)
        self.btn_export = QPushButton("Exportar CSV")
        self.btn_export.setMinimumWidth(180)
        self.btn_export.setFixedHeight(40)
        self.btn_export.setProperty("class", "btn-primary")
        self.btn_export.clicked.connect(self._export_csv)
        button_row.addWidget(self.btn_export)
        container.addLayout(button_row)

        self.buttonBox = QDialogButtonBox(QDialogButtonBox.Close, self)
        self.buttonBox.rejected.connect(self.reject)
        outer.addWidget(self.buttonBox)

        self._frame = frame
        self._container = container

        self.resize_for_content()

    def populate_table(self, rows: List[Dict[str, object]]):
        if not self.table_headers or not self.table_fields:
            raise ValueError("table_headers and table_fields must be defined before calling populate_table")

        self.tbl.clear()
        self.tbl.setColumnCount(len(self.table_headers))
        self.tbl.setHorizontalHeaderLabels(self.table_headers)
        self.tbl.setRowCount(len(rows))

        align_right = Qt.AlignRight | Qt.AlignVCenter
        for r, row in enumerate(rows):
            for c, field in enumerate(self.table_fields):
                value = row.get(field, "")
                text = self._format_cell(field, value, c)
                item = QTableWidgetItem(text)
                item.setFlags(item.flags() & ~Qt.ItemIsEditable)
                if field in self.align_right_fields:
                    item.setTextAlignment(align_right)
                self.tbl.setItem(r, c, item)

        header_view = self.tbl.horizontalHeader()
        header_view.setSectionResizeMode(QHeaderView.Stretch)

        self.resize_for_content()

    def _format_cell(self, field: str, value: object, column: int) -> str:
        if isinstance(value, (int, float)) and field in self.currency_fields:
            return f"{self.currency_prefix}{value:,.2f}"
        if value is None:
            return ""
        return str(value)

    def showEvent(self, event):
        self._effect.setOpacity(0.0)
        super().showEvent(event)
        self._animate_open()

    def closeEvent(self, event: QCloseEvent) -> None:
        for animation in list(self._animations):
            animation.stop()
            animation.deleteLater()
        self._animations.clear()
        self._closing = False
        QToolTip.hideText()
        self.deleteLater()
        event.accept()
        self.closed.emit()
        super().closeEvent(event)

    def accept(self):
        if not self._animate_close(lambda: super().accept()):
            super().accept()

    def reject(self):
        if not self._animate_close(lambda: super().reject()):
            super().reject()

    def keyPressEvent(self, event):
        if event.key() == Qt.Key_Escape:
            self.reject()
            return
        super().keyPressEvent(event)

    def resize_for_content(self):
        screen = QApplication.primaryScreen()
        if screen is None:
            return
        available = screen.availableGeometry()
        width = min(
            max(self.width(), int(available.width() * 0.75)),
            available.width() - 120,
        )
        height = min(
            max(self.height(), int(available.height() * 0.75)),
            available.height() - 120,
        )
        self.resize(width, height)

    def exec(self) -> int:
        self._effect.setOpacity(0.0)
        return super().exec()

    def _animate_open(self):
        animation = QPropertyAnimation(self._effect, b"opacity", self)
        animation.setDuration(240)
        animation.setStartValue(0.0)
        animation.setEndValue(1.0)
        animation.setEasingCurve(QEasingCurve.InOutQuad)
        animation.finished.connect(lambda: self._remove_animation(animation))
        animation.start()
        self._animations.append(animation)

    def _animate_close(self, callback) -> bool:
        if self._closing:
            return True
        self._closing = True
        animation = QPropertyAnimation(self._effect, b"opacity", self)
        animation.setDuration(220)
        animation.setStartValue(self._effect.opacity())
        animation.setEndValue(0.0)
        animation.setEasingCurve(QEasingCurve.InOutQuad)

        def _finalize():
            QToolTip.hideText()
            callback()
            self._closing = False
            self._remove_animation(animation)

        animation.finished.connect(_finalize)
        animation.start()
        self._animations.append(animation)
        return True

    def _remove_animation(self, animation: QPropertyAnimation):
        if animation in self._animations:
            self._animations.remove(animation)
        animation.deleteLater()

    def _export_csv(self):
        path, _ = QFileDialog.getSaveFileName(
            self, self.export_dialog_title, self.export_default_filename, "CSV (*.csv)"
        )
        if not path:
            return

        headers = [self.tbl.horizontalHeaderItem(i).text() for i in range(self.tbl.columnCount())]
        import csv

        with open(path, "w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(headers)
            for row in range(self.tbl.rowCount()):
                writer.writerow(
                    [
                        self.tbl.item(row, col).text() if self.tbl.item(row, col) else ""
                        for col in range(self.tbl.columnCount())
                    ]
                )



class ResultsDialog(QDialog):
    closed = Signal()

    def __init__(
        self,
        title: str | None = None,
        resumen: Dict[str, float] | None = None,
        parent=None,
        *,
        table=None,
        kpis: Dict[str, float] | None = None,
    ):
        super().__init__(parent)
        self.setObjectName("resultsDialog")
        self.setWindowTitle(title or self.tr("Resultados de inversi?n"))
        self.setModal(True)
        self.setWindowFlag(Qt.WindowCloseButtonHint, True)
        self.setAttribute(Qt.WA_DeleteOnClose, True)
        self.setWindowModality(Qt.ApplicationModal)
        self.setSizeGripEnabled(True)
        self._first_show = True

        main = QVBoxLayout()
        main.setContentsMargins(16, 16, 16, 16)
        main.setSpacing(12)
        self.setLayout(main)

        header = QHBoxLayout()
        self.lbl_gain = QLabel("")
        self.lbl_tax = QLabel("")
        self.lbl_real = QLabel("")
        for lbl in (self.lbl_gain, self.lbl_tax, self.lbl_real):
            lbl.setWordWrap(True)
            header.addWidget(lbl)
        header.addStretch()
        main.addLayout(header)

        self._columns = [
            ("Años", "anio"),
            ("Saldo total final", "saldo"),
            ("Aporte acumulado", "aporte"),
            ("Ganancia (antes de ISR)", "ganancia"),
            ("Impuestos", "impuestos"),
            ("Valor real", "real"),
        ]

        self.table = QTableWidget(0, len(self._columns), self)
        self.table.setObjectName("resultsTable")
        self.table.setAlternatingRowColors(True)
        self.table.setSortingEnabled(False)
        self.table.setWordWrap(False)
        self.table.verticalHeader().setVisible(False)
        header_view = self.table.horizontalHeader()
        header_view.setSectionResizeMode(QHeaderView.Stretch)
        self.table.setHorizontalHeaderLabels([title for title, _ in self._columns])
        self.table.setStyleSheet(
            """
            QTableWidget { background-color:#0f1b37; alternate-background-color:#132246;
                           color:#EAF1FF; gridline-color:#20315b; }
            QHeaderView::section { background:#101b33; color:#EAF1FF; border:none; padding:6px; }
            QTableWidget::item:selected { background:#1f3a6d; color:#EAF1FF; }
            """
        )
        main.addWidget(self.table, 1)

        self.figure = Figure(figsize=(6, 2.4), facecolor="#0f1b37")
        self.canvas = FigureCanvas(self.figure)
        self.canvas.setMinimumHeight(260)
        self.ax = self.figure.add_subplot(111, facecolor="#0f1b37")
        main.addWidget(self.canvas, 1)

        self.button_box = QDialogButtonBox(QDialogButtonBox.Close)
        self.button_box.rejected.connect(self.reject)
        main.addWidget(self.button_box)

        if table is not None:
            self._populate_table(table)

        if kpis is None and resumen is not None:
            kpis = {
                "ganancia": resumen.get("ganancia", 0.0),
                "ganancia_bruta": resumen.get("ganancia_bruta", resumen.get("ganancia", 0.0)),
                "ganancia_fmt": fmt_currency(resumen.get("ganancia", 0.0)),
                "impuestos": resumen.get("impuestos", 0.0),
                "impuestos_fmt": fmt_currency(resumen.get("impuestos", 0.0)),
                "valor_real": resumen.get("valor_real", 0.0),
                "valor_real_fmt": fmt_currency(resumen.get("valor_real", 0.0)),
                "aportes": resumen.get("aportes", 0.0),
                "aportes_totales": resumen.get("aportes_totales", resumen.get("aportes", 0.0)),
            }

        if kpis is not None:
            self._set_kpis(kpis)
            self._plot_bars(kpis)

        self.canvas.draw()
        parent_w = parent.width() if parent and hasattr(parent, 'width') else 1200
        parent_h = parent.height() if parent and hasattr(parent, 'height') else 800
        self.resize(int(parent_w * 0.82), int(parent_h * 0.75))
        self.setStyleSheet(
            """
            QDialog#resultsDialog { background: #0f1b37; }
            QDialog#resultsDialog QTableWidget,
            QDialog#resultsDialog QTableView,
            QDialog#resultsDialog QHeaderView::section {
                color: #EAF1FF;
                background-color: rgba(255,255,255,0.04);
            }
            """
        )

    # KPI "Ganancia" = ganancia neta (después de ISR final).
    # Tabla/Gráfica usan "Ganancia (antes de ISR)" = ganancia bruta (previo a ISR).
    def _set_kpis(self, data: Dict[str, float | str]):
        self.lbl_gain.setText(
            f"{self.tr('Ganancia')}: {data.get('ganancia_fmt') or fmt_currency(data.get('ganancia', 0.0))}"
        )
        self.lbl_tax.setText(
            f"{self.tr('Impuestos')}: {data.get('impuestos_fmt') or fmt_currency(data.get('impuestos', 0.0))}"
        )
        self.lbl_real.setText(
            f"{self.tr('Valor real')}: {data.get('valor_real_fmt') or fmt_currency(data.get('valor_real', 0.0))}"
        )

    def _populate_table(self, table_data):
        if table_data is None:
            return

        if hasattr(table_data, "to_dict"):
            records = table_data.to_dict("records")
        elif isinstance(table_data, list):
            records = table_data
        else:
            return

        self.table.clearContents()
        self.table.setRowCount(len(records))
        self.table.setColumnCount(len(self._columns))
        self.table.setHorizontalHeaderLabels([title for title, _ in self._columns])

        for row_idx, record in enumerate(records):
            for col_idx, (_, field) in enumerate(self._columns):
                value = record.get(field, "")
                item_text = self._fmt_cell(col_idx, value)
                self.table.setItem(row_idx, col_idx, QTableWidgetItem(item_text))

        self.table.resizeColumnsToContents()

    def _plot_bars(self, kpis: Dict[str, float]):
        self.ax.clear()
        labels = ["Aportes", "Ganancia (antes de ISR)", "Impuestos"]
        aportes_total = int(round(float(kpis.get("aportes_totales", kpis.get("aportes", 0.0)))))
        ganancia_bruta = int(round(float(kpis.get("ganancia_bruta", kpis.get("ganancia", 0.0)))))
        impuestos_total = int(round(float(kpis.get("impuestos", 0.0))))
        valores = [aportes_total, ganancia_bruta, impuestos_total]
        colors = ["#4c8dff", "#2ecc71", "#e74c3c"]
        self.ax.set_facecolor("#0f1b37")
        self.figure.patch.set_facecolor("#0f1b37")
        bars = self.ax.bar(labels, valores, color=colors, edgecolor="#0b132b", alpha=1.0)
        for spine in self.ax.spines.values():
            spine.set_color("#cfe2ff")
        self.ax.tick_params(colors="#cfe2ff")
        self.ax.set_ylabel("MXN", color="#cfe2ff")
        self.ax.yaxis.grid(True, color="#22335e", linewidth=0.6, alpha=0.7)
        for bar, value in zip(bars, valores):
            self.ax.text(
                bar.get_x() + bar.get_width() / 2,
                value,
                f"MXN {value:,}".replace(",", ","),
                ha="center",
                va="bottom",
                color="#eaf1ff",
                fontsize=9,
            )
        self.canvas.draw_idle()

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

    def showEvent(self, event):
        super().showEvent(event)
        if getattr(self, "_first_show", False):
            QTimer.singleShot(0, self._polish_and_update)

    def _polish_and_update(self):
        if hasattr(self, "table"):
            try:
                self.table.resizeColumnsToContents()
                self.table.resizeRowsToContents()
                self.table.viewport().update()
            except Exception:
                pass
        self.repaint()
        self._first_show = False

    def populate_table(self, rows: List[Dict[str, object]]):
        self._populate_table(rows)

    def resize_for_content(self):
        self.adjustSize()

    def closeEvent(self, event: QCloseEvent) -> None:
        try:
            if hasattr(self, 'canvas') and self.canvas:
                fig = self.canvas.figure
                fig.clf()
                try:
                    plt.close(fig)
                except Exception:
                    pass
        except Exception:
            pass
        super().closeEvent(event)
        self.closed.emit()

    def keyPressEvent(self, event):
        if event.key() == Qt.Key_Escape:
            self.reject()
            return
        super().keyPressEvent(event)
