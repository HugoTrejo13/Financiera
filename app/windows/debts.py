from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QFormLayout,
    QDoubleSpinBox,
    QSpinBox,
    QPushButton,
    QLabel,
    QAbstractSpinBox,
    QMessageBox,
)

from app.core.settings import settings
from app.ui.styles import DEFAULT_THEME, apply_theme
from app.core.formatters import fmt_currency
from app.widgets.card import Card
from app.widgets.utils import make_big
from app.windows.debt_results import DebtResultsDialog


class Debts(QWidget):
    def __init__(self, lang: str = "es_MX"):
        super().__init__()
        self.lang = lang

        root = QVBoxLayout(self)
        root.setContentsMargins(32, 32, 32, 24)
        root.setSpacing(20)
        root.setAlignment(Qt.AlignTop)

        header = QLabel("Deudas")
        header.setProperty("role", "title")
        root.addWidget(header)

        card = Card("Parametros del credito")
        card.content_layout.setContentsMargins(20, 16, 20, 16)
        card.content_layout.setSpacing(12)
        form = QFormLayout()
        form.setContentsMargins(0, 0, 0, 0)
        form.setSpacing(12)
        card.content_layout.addLayout(form)

        self.costo = make_big(QDoubleSpinBox())
        self.costo.setPrefix("MXN ")
        self.costo.setMinimum(0.0)
        self.costo.setMaximum(1e12)
        self.costo.setDecimals(2)
        self.costo.setButtonSymbols(QAbstractSpinBox.NoButtons)
        self.costo.setStyleSheet("min-height: 48px;")
        self.costo.setValue(30000)

        self.cat = make_big(QDoubleSpinBox())
        self.cat.setSuffix(" %")
        self.cat.setRange(0, 300)
        self.cat.setValue(33.0)

        self.meses = make_big(QSpinBox())
        self.meses.setRange(1, 360)
        self.meses.setValue(12)
        self.meses.setSuffix(" meses")
        self.meses.setButtonSymbols(QAbstractSpinBox.NoButtons)

        form.addRow("Costo del producto (MXN)", self.costo)
        form.addRow("CAT anual (%)", self.cat)
        form.addRow("Plazo (meses)", self.meses)

        self.btn = QPushButton("Calcular amortizacion")
        self.btn.setMinimumHeight(48)
        self.btn.setProperty("class", "btn-primary")
        self.btn.setAccessibleName("Calcular amortizacion")
        self.btn.clicked.connect(self._calc)

        root.addWidget(card)
        root.addWidget(self.btn)

        settings.changed.connect(self._on_settings_changed)
        self._apply_theme()
        self._debt_results_dlg: DebtResultsDialog | None = None

    def _apply_theme(self):
        apply_theme(QApplication.instance(), DEFAULT_THEME, settings.daltonismo)

    def _on_settings_changed(self, daltonismo: bool, language: str):
        self._apply_theme()
        self.lang = language

    def _calc(self):
        if self.costo.value() <= 0:
            QMessageBox.warning(self, "Dato invalido", "El costo debe ser mayor a cero.")
            return
        if self.meses.value() < 1:
            QMessageBox.warning(self, "Dato invalido", "El plazo debe ser al menos 1 mes.")
            return
        if not (0 <= self.cat.value() <= 100):
            QMessageBox.warning(self, "Dato invalido", "El CAT debe estar entre 0 y 100%.")
            return

        principal = self.costo.value()
        months = self.meses.value()
        rate = (self.cat.value() / 100.0) / 12.0

        pago = principal / months if rate <= 0 else principal * (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1)

        table_rows = []
        saldo = principal
        intereses = 0.0

        for month in range(1, months + 1):
            interes = saldo * rate
            capital = pago - interes
            saldo = max(0.0, saldo - capital)
            intereses += interes
            table_rows.append(
                {
                    "mes": month,
                    "pago": pago,
                    "interes": interes,
                    "capital": capital,
                    "saldo": saldo,
                }
            )

        totales = {"total_pago": pago * months, "intereses": intereses, "meses": months}
        parent_window = self.window() if self.window() is not None else self
        if self._debt_results_dlg:
            try:
                self._debt_results_dlg.close()
            except Exception:
                pass
            self._debt_results_dlg = None

        self._debt_results_dlg = DebtResultsDialog("Amortizacion del credito", totales, parent_window)
        self._debt_results_dlg.setWindowModality(Qt.ApplicationModal)
        self._debt_results_dlg.populate_table(table_rows)
        self._debt_results_dlg.resize_for_content()
        self._debt_results_dlg.closed.connect(lambda: setattr(self, "_debt_results_dlg", None))
        self._debt_results_dlg.open()
