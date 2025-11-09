from PySide6.QtCore import Qt
from PySide6.QtGui import QCursor, QDoubleValidator
from PySide6.QtWidgets import (
    QApplication,
    QWidget,
    QVBoxLayout,
    QGridLayout,
    QFormLayout,
    QDoubleSpinBox,
    QSpinBox,
    QPushButton,
    QLabel,
    QLineEdit,
    QAbstractSpinBox,
    QToolButton,
    QToolTip,
    QHBoxLayout,
    QMessageBox,
    QWidget as QtWidget,
)

from app.core.formatters import fmt_currency
from app.core.settings import settings
from app.ui.styles import DEFAULT_THEME, apply_theme
from app.widgets.card import Card
from app.widgets.utils import make_big
from app.windows.results import ResultsDialog


HELP_TEXTS = {
    "initial": "<b>Monto inicial</b><br>Capital &uacute;nico que aportas al comenzar para detonar el inter&eacute;s compuesto.",
    "monthly": "<b>Aporte mensual</b><br>Cantidad fija que agregar&aacute;s cada mes para seguir creciendo el portafolio.",
    "yield": "<b>Rendimiento anual</b><br>Tasa nominal estimada antes de comisiones e impuestos.",
    "inflation": "<b>Inflaci&oacute;n anual</b><br>Proyecci&oacute;n del aumento de precios usada para calcular el valor real.",
    "horizon": "<b>Horizonte</b><br>N&uacute;mero de a&ntilde;os que mantendr&aacute;s el plan activo y las aportaciones recurrentes.",
    "iva": "<b>IVA sobre comisiones</b><br>Impuesto al Valor Agregado cargado sobre las comisiones del intermediario.",
    "isr": "<b>ISR sobre ganancia</b><br>Impuesto Sobre la Renta retenido a las utilidades obtenidas.",
    "custody": "<b>Cuota fija de custodia</b><br>Cargo mensual por resguardar y administrar tus activos (tipo TER/administraci&oacute;n).",
    "spread": "<b>Market spread de salida</b><br>Diferencia entre precio de compra y venta al liquidar tu posici&oacute;n.",
}


class HelpBadge(QToolButton):
    def __init__(self, tooltip_html: str):
        super().__init__()
        self._tooltip_html = tooltip_html
        self.setText("?")
        self.setCursor(Qt.PointingHandCursor)
        self.setFixedSize(20, 20)
        self.setStyleSheet(
            """
            QToolButton {
                background-color: rgba(45, 127, 249, 0.15);
                color: #2D7FF9;
                border: none;
                border-radius: 10px;
                font-weight: 700;
            }
            QToolButton:hover {
                background-color: rgba(45, 127, 249, 0.25);
            }
            """
        )

    def _show_tip(self):
        QToolTip.showText(QCursor.pos(), self._tooltip_html, self)

    def enterEvent(self, event):
        self._show_tip()
        super().enterEvent(event)

    def leaveEvent(self, event):
        QToolTip.hideText()
        super().leaveEvent(event)

    def mousePressEvent(self, event):
        self._show_tip()
        super().mousePressEvent(event)


def help_badge(texto: str) -> QToolButton:
    return HelpBadge(texto)


def labeled(texto: str, ayuda: str) -> QtWidget:
    container = QtWidget()
    layout = QHBoxLayout(container)
    layout.setContentsMargins(0, 0, 0, 0)
    layout.setSpacing(6)
    label = QLabel(texto)
    layout.addWidget(label)
    layout.addWidget(help_badge(ayuda))
    layout.addStretch()
    return container


class MoneyLineEdit(QLineEdit):
    def __init__(self):
        super().__init__()
        self._validator = QDoubleValidator(0.0, 1e12, 2, self)
        self._validator.setNotation(QDoubleValidator.StandardNotation)
        self._validator_attached = True
        self.setValidator(self._validator)
        self.setPlaceholderText("MXN 0.00")
        self.setClearButtonEnabled(True)
        self.setAlignment(Qt.AlignRight)
        self.editingFinished.connect(self._format_text)
        self._detach_validator()

    def focusInEvent(self, event):
        self._attach_validator()
        text = self.text().strip()
        if text:
            value = self._parse(text)
            if value is not None:
                self.blockSignals(True)
                self.setText(f"{value:.2f}")
                self.blockSignals(False)
                self.selectAll()
        super().focusInEvent(event)

    def focusOutEvent(self, event):
        super().focusOutEvent(event)
        self._format_text()

    def value(self) -> float:
        parsed = self._parse(self.text())
        return parsed if parsed is not None else 0.0

    def setValue(self, value: float) -> None:
        value = max(0.0, float(value))
        self._attach_validator()
        self.blockSignals(True)
        self.setText(f"{value:.2f}")
        self.blockSignals(False)
        self._format_text()

    def _format_text(self):
        value = self._parse(self.text())
        if value is None:
            value = 0.0
        formatted = fmt_currency(value)
        self.blockSignals(True)
        self.setText(formatted)
        self.blockSignals(False)
        self._detach_validator()

    def _parse(self, text: str):
        cleaned = (
            text.replace("MXN", "")
            .replace("$", "")
            .replace(",", "")
            .strip()
        )
        if cleaned in {"", "."}:
            return 0.0
        try:
            return max(0.0, float(cleaned))
        except ValueError:
            return None

    def _detach_validator(self):
        if self._validator_attached:
            self.setValidator(None)
            self._validator_attached = False

    def _attach_validator(self):
        if not self._validator_attached:
            self.setValidator(self._validator)
            self._validator_attached = True


class InvestmentPlan(QWidget):
    def __init__(self, lang: str = "es_MX"):
        super().__init__()
        self.lang = lang

        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(24)

        title = QLabel("Plan de inversion")
        title.setProperty("role", "title")
        title.setAlignment(Qt.AlignHCenter)
        layout.addWidget(title)

        card_params = Card("Parametros de inversion")
        params_form = QFormLayout()
        params_form.setContentsMargins(0, 0, 0, 0)
        params_form.setSpacing(16)
        card_params.content_layout.addLayout(params_form)

        card_costos = Card("Friccion e impuestos (MX)")
        costos_form = QFormLayout()
        costos_form.setContentsMargins(0, 0, 0, 0)
        costos_form.setSpacing(16)
        card_costos.content_layout.addLayout(costos_form)

        card_avanz = Card("Costos avanzados")
        avanz_form = QFormLayout()
        avanz_form.setContentsMargins(0, 0, 0, 0)
        avanz_form.setSpacing(16)
        card_avanz.content_layout.addLayout(avanz_form)

        card_resumen = Card("Resumen")
        resumen_box = card_resumen.content_layout
        resumen_box.setSpacing(16)

        self.inicial = make_big(MoneyLineEdit())

        self.mensual = make_big(MoneyLineEdit())
        self.mensual.setValue(1000.0)

        self.rend_anual = make_big(QDoubleSpinBox())
        self.rend_anual.setSuffix(" %")
        self.rend_anual.setDecimals(2)
        self.rend_anual.setRange(0, 100)
        self.rend_anual.setValue(10.0)

        self.inflacion = make_big(QDoubleSpinBox())
        self.inflacion.setSuffix(" %")
        self.inflacion.setDecimals(2)
        self.inflacion.setRange(0, 100)
        self.inflacion.setValue(4.0)

        self.horiz = make_big(QSpinBox())
        self.horiz.setRange(1, 60)
        self.horiz.setValue(5)
        self.horiz.setSuffix(" anios")
        self.horiz.setButtonSymbols(QAbstractSpinBox.NoButtons)
        self.horiz.setSuffix(" anios")
        self.horiz.setButtonSymbols(QAbstractSpinBox.NoButtons)

        params_form.addRow(labeled("Monto inicial (MXN)", HELP_TEXTS["initial"]), self.inicial)
        params_form.addRow(labeled("Aporte mensual (MXN)", HELP_TEXTS["monthly"]), self.mensual)
        params_form.addRow(labeled("Rendimiento anual (%)", HELP_TEXTS["yield"]), self.rend_anual)
        params_form.addRow(labeled("Inflacion anual (%)", HELP_TEXTS["inflation"]), self.inflacion)
        params_form.addRow(labeled("Horizonte (anios)", HELP_TEXTS["horizon"]), self.horiz)

        self.iva_comis = make_big(QDoubleSpinBox())
        self.iva_comis.setSuffix(" %")
        self.iva_comis.setRange(0, 100)
        self.iva_comis.setValue(16.0)

        self.isr = make_big(QDoubleSpinBox())
        self.isr.setSuffix(" %")
        self.isr.setRange(0, 100)
        self.isr.setValue(10.0)

        costos_form.addRow(labeled("IVA sobre comisiones (%)", HELP_TEXTS["iva"]), self.iva_comis)
        costos_form.addRow(labeled("ISR sobre ganancia (%)", HELP_TEXTS["isr"]), self.isr)

        self.custodia = make_big(QDoubleSpinBox())
        self.custodia.setPrefix("MXN ")
        self.custodia.setMinimum(0.0)
        self.custodia.setMaximum(1e6)
        self.custodia.setDecimals(2)

        self.spread = make_big(QDoubleSpinBox())
        self.spread.setSuffix(" %")
        self.spread.setRange(0, 100)
        self.spread.setDecimals(2)

        avanz_form.addRow(labeled("Cuota fija de custodia (MXN/mes)", HELP_TEXTS["custody"]), self.custodia)
        avanz_form.addRow(labeled("Market spread de salida (%)", HELP_TEXTS["spread"]), self.spread)

        self.lbl_nominal = QLabel("Valor final (nominal): --")
        self.lbl_nominal.setStyleSheet("font-size: 16px; font-weight: 700;")
        self.lbl_total = QLabel("Aportes totales: --")
        self.lbl_ganancia = QLabel("Ganancia generada: --")
        self.lbl_real = QLabel("Valor ajustado por inflacion: --")
        self.btn_calc = QPushButton("Calcular")
        self.btn_calc.setMinimumHeight(48)
        self.btn_calc.setProperty("class", "btn-primary")
        self.btn_calc.setAccessibleName("Calcular resultados de inversion")
        self.btn_calc.clicked.connect(self._open_results)
        resumen_box.addWidget(self.lbl_nominal)
        resumen_box.addWidget(self.lbl_total)
        resumen_box.addWidget(self.lbl_ganancia)
        resumen_box.addWidget(self.lbl_real)
        resumen_box.addWidget(self.btn_calc)

        grid = QGridLayout()
        grid.setContentsMargins(0, 0, 0, 0)
        grid.setHorizontalSpacing(24)
        grid.setVerticalSpacing(24)
        grid.addWidget(card_params, 0, 0)
        grid.addWidget(card_costos, 0, 1)
        grid.addWidget(card_avanz, 1, 0)
        grid.addWidget(card_resumen, 1, 1)
        layout.addLayout(grid)

        settings.changed.connect(self._on_settings_changed)
        self._apply_theme()
        self._results_dlg: ResultsDialog | None = None

    def _apply_theme(self):
        apply_theme(QApplication.instance(), DEFAULT_THEME, settings.daltonismo)

    def _on_settings_changed(self, daltonismo: bool, language: str):
        self._apply_theme()
        self.lang = language

    def _open_results(self):
        if self.mensual.value() <= 0:
            QMessageBox.warning(self, "Dato invalido", "El aporte mensual debe ser mayor a cero.")
            return
        if self.horiz.value() < 1:
            QMessageBox.warning(self, "Dato invalido", "El horizonte debe ser al menos 1 anio.")
            return
        if not (0 <= self.iva_comis.value() <= 100) or not (0 <= self.isr.value() <= 100):
            QMessageBox.warning(self, "Dato invalido", "IVA e ISR deben estar entre 0 y 100%.")
            return

        inicial = self.inicial.value()
        mensual = self.mensual.value()
        tasa_anual = self.rend_anual.value() / 100.0
        inflacion = self.inflacion.value() / 100.0
        horizonte = self.horiz.value()
        tasa_isr = self.isr.value() / 100.0

        saldo = inicial
        aporte_acum = 0.0
        table_rows = []

        for year in range(1, horizonte + 1):
            for _ in range(12):
                saldo += mensual
                aporte_acum += mensual
                saldo *= (1 + tasa_anual / 12)

            gan_bruta = max(0.0, saldo - aporte_acum - inicial)
            real = saldo / ((1 + inflacion) ** year)
            table_rows.append(
                {
                    "anio": year,
                    "saldo": saldo,
                    "aporte": aporte_acum,
                    "ganancia": gan_bruta,
                    "impuestos": 0.0,
                    "real": real,
                }
            )

        ganancia_total = max(0.0, saldo - aporte_acum - inicial)
        isr_total = ganancia_total * tasa_isr
        saldo -= isr_total
        if table_rows:
            table_rows[-1]["impuestos"] = isr_total
            table_rows[-1]["saldo"] = saldo
            table_rows[-1]["real"] = saldo / ((1 + inflacion) ** horizonte)

        ganancia_neta = max(0.0, ganancia_total - isr_total)

        self.lbl_nominal.setText(f"Valor final (nominal):  {fmt_currency(saldo)}")
        self.lbl_total.setText(f"Aportes totales:      {fmt_currency(aporte_acum)}")
        self.lbl_ganancia.setText(f"Ganancia generada:    {fmt_currency(ganancia_neta)}")
        real_final = saldo / ((1 + inflacion) ** horizonte)
        self.lbl_real.setText(f"Valor ajustado por inflacion:  {fmt_currency(real_final)}")

        resumen = {
            "ganancia": ganancia_neta,
            "ganancia_bruta": ganancia_total,
            "impuestos": isr_total,
            "valor_real": real_final,
            "aportes": aporte_acum,
            "aportes_totales": aporte_acum,
        }
        parent_window = self.window() if self.window() is not None else self
        if self._results_dlg:
            try:
                self._results_dlg.close()
            except Exception:
                pass
            self._results_dlg = None

        self._results_dlg = ResultsDialog("Resultados de inversion", resumen, parent_window)
        self._results_dlg.setWindowModality(Qt.ApplicationModal)
        self._results_dlg.populate_table(table_rows)
        self._results_dlg.resize_for_content()
        self._results_dlg.closed.connect(lambda: setattr(self, "_results_dlg", None))
        self._results_dlg.exec()
