from PySide6.QtCore import QSize, Qt, QPropertyAnimation, Signal
from PySide6.QtGui import QIcon, QStandardItemModel, QStandardItem
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QFrame,
    QGraphicsOpacityEffect,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSizePolicy,
    QSpacerItem,
    QVBoxLayout,
    QWidget,
)

from app.core.i18n import tr
from app.core.settings import settings
from app.ui.styles import DEFAULT_THEME, apply_theme


def help_icon(icon_path: str) -> QIcon:
    try:
        return QIcon(icon_path)
    except Exception:
        return QIcon()


class HomeScreen(QWidget):
    start_requested = Signal()

    def __init__(self):
        super().__init__()
        self.setObjectName("home")
        self.setMinimumSize(980, 680)

        self._settings = settings

        # --- controles persistentes
        self.cmb_idioma = QComboBox()
        self.cmb_idioma.setEditable(False)
        self.cmb_idioma.setIconSize(QSize(20, 14))
        model = QStandardItemModel(self.cmb_idioma)
        item_mx = QStandardItem(tr("lang_es_mx"))
        icon = help_icon("assets/icons/mx.png")  # TODO: coloca aqui tu imagen de bandera
        if not icon.isNull():
            item_mx.setIcon(icon)
        item_mx.setData("es_MX", Qt.UserRole)
        model.appendRow(item_mx)
        self.cmb_idioma.setModel(model)
        self.cmb_idioma.currentIndexChanged.connect(self._on_language_changed)

        self.btn_daltonismo = QPushButton(tr("theme_contrast"))
        self.btn_daltonismo.setCheckable(True)
        self.btn_daltonismo.clicked.connect(lambda checked: self._settings.set_daltonismo(checked))

        # compatibilidad con atributos previos
        self.lang_combo = self.cmb_idioma
        self._combo_lang = self.cmb_idioma
        self._btn_daltonismo = self.btn_daltonismo

        self.lbl_title = QLabel()
        self.lbl_subtitle = QLabel()
        self.btn_start = QPushButton(self.tr("Iniciar a invertir"))

        hero = self._build_home()

        fade_effect = QGraphicsOpacityEffect(hero)
        hero.setGraphicsEffect(fade_effect)
        anim = QPropertyAnimation(fade_effect, b"opacity", self)
        anim.setDuration(300)
        anim.setStartValue(0.0)
        anim.setEndValue(1.0)
        anim.start()
        self._fade_anim = anim

        # sincronizar con la configuracion actual
        self.cmb_idioma.setCurrentIndex(0)
        self._on_settings_changed(self._settings.daltonismo, self._settings.language)

        self._settings.changed.connect(self._on_settings_changed)
        self._apply_theme()

    def _build_home(self) -> QFrame:
        layout_root = QVBoxLayout(self)
        layout_root.setContentsMargins(32, 48, 32, 48)
        layout_root.setSpacing(24)
        layout_root.setAlignment(Qt.AlignHCenter | Qt.AlignTop)

        top = QHBoxLayout()
        top.addItem(QSpacerItem(20, 10, QSizePolicy.Expanding, QSizePolicy.Minimum))
        self.btn_daltonismo.setFixedHeight(40)
        self.lang_combo.setFixedHeight(40)
        top.addWidget(self.btn_daltonismo, 0, Qt.AlignRight)
        top.addSpacing(12)
        top.addWidget(self.lang_combo, 0, Qt.AlignRight)
        layout_root.addLayout(top)

        self.card = QFrame()
        self.card.setObjectName("heroCard")
        self.card.setFrameShape(QFrame.StyledPanel)
        self.card.setMinimumWidth(680)
        self.card.setMaximumWidth(860)
        self.card.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Fixed)

        card_layout = QVBoxLayout(self.card)
        card_layout.setContentsMargins(32, 28, 32, 28)
        card_layout.setSpacing(16)

        self.lbl_title.setText(self.tr("Calculadora financiera"))
        self.lbl_title.setObjectName("heroTitle")
        self.lbl_title.setAlignment(Qt.AlignHCenter)
        self.lbl_title.setWordWrap(True)
        card_layout.addWidget(self.lbl_title, 0, Qt.AlignHCenter)

        self.lbl_subtitle.setText(self.tr("Aprende a invertir y simular deudas con una interfaz clara."))
        self.lbl_subtitle.setObjectName("heroSubtitle")
        self.lbl_subtitle.setAlignment(Qt.AlignHCenter)
        self.lbl_subtitle.setWordWrap(True)
        card_layout.addWidget(self.lbl_subtitle, 0, Qt.AlignHCenter)

        card_layout.addSpacing(8)

        self.btn_start.setObjectName("ctaPrimary")
        self.btn_start.setFixedHeight(48)
        self.btn_start.setMinimumWidth(240)
        self.btn_start.setAccessibleName("Iniciar a invertir")
        self.btn_start.clicked.connect(self.start_requested.emit)
        card_layout.addWidget(self.btn_start, 0, Qt.AlignHCenter)

        layout_root.addWidget(self.card, 0, Qt.AlignHCenter)
        layout_root.addStretch(1)

        return self.card

    def _apply_theme(self):
        apply_theme(QApplication.instance(), DEFAULT_THEME, self._settings.daltonismo)

    def _on_language_changed(self, index: int):
        item = self.cmb_idioma.model().item(index)
        if item is not None:
            self._settings.set_language(item.data(Qt.UserRole))

    def _on_settings_changed(self, daltonismo: bool, language: str):
        self.btn_daltonismo.blockSignals(True)
        self.btn_daltonismo.setChecked(daltonismo)
        self.btn_daltonismo.blockSignals(False)

        self.cmb_idioma.blockSignals(True)
        for index in range(self.cmb_idioma.count()):
            item = self.cmb_idioma.model().item(index)
            if item and item.data(Qt.UserRole) == language:
                self.cmb_idioma.setCurrentIndex(index)
                break
        self.cmb_idioma.blockSignals(False)

        self._apply_theme()
