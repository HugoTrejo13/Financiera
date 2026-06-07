import sys
import pathlib
root_dir = pathlib.Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from PySide6.QtCore import QEasingCurve, QPoint, QSize, Qt, QPropertyAnimation
from PySide6.QtGui import QAction
from PySide6.QtWidgets import QApplication, QGraphicsOpacityEffect, QMainWindow, QStackedWidget, QTabWidget, QToolBar

from app.core.settings import settings
from app.core.i18n import tr
from app.ui.styles import DEFAULT_THEME, apply_theme
from app.windows.debts import Debts
from app.windows.home import HomeScreen
from app.windows.investment_plan import InvestmentPlan


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setObjectName("mainWindow")
        self.setWindowTitle("Nueva Financiera")

        self._lang = settings.language
        self.app_ref = QApplication.instance()
        self._animations = []

        self.stack = QStackedWidget()
        self.setCentralWidget(self.stack)

        self.home = HomeScreen()
        self.home.start_requested.connect(lambda: self._open_tabs(0))

        self.stack.addWidget(self.home)
        self._ensure_effect(self.home).setOpacity(1.0)
        self.stack.setCurrentWidget(self.home)

        self.tabs_view = None

        self._build_menu()
        self._setup_shortcuts()
        self.resize(1200, 800)

        settings.changed.connect(self._on_settings_changed)
        self._apply_theme(settings.daltonismo)

    def _build_menu(self):
        toolbar = QToolBar("Acciones", self)
        toolbar.setMovable(False)
        toolbar.setIconSize(QSize(28, 28))
        toolbar.setStyleSheet(
            """
            QToolBar { padding: 8px 12px; }
            QToolBar QToolButton {
                min-height: 36px;
                font-size: 16px;
                font-weight: 700;
                padding: 6px 18px;
                border-radius: 10px;
            }
            """
        )
        self.addToolBar(Qt.TopToolBarArea, toolbar)

        self.act_home = QAction("← Inicio", self)
        self.act_home.setShortcut("Ctrl+I")
        self.act_home.triggered.connect(self._go_home)
        toolbar.addAction(self.act_home)
        self.addAction(self.act_home)

    def _setup_shortcuts(self):
        self.act_plan = QAction("Ir a Plan de inversión", self)
        self.act_plan.setShortcut("Ctrl+P")
        self.act_plan.triggered.connect(lambda: self._open_tabs(0))
        self.addAction(self.act_plan)

        self.act_debts = QAction("Ir a Deudas", self)
        self.act_debts.setShortcut("Ctrl+D")
        self.act_debts.triggered.connect(lambda: self._open_tabs(1))
        self.addAction(self.act_debts)

        self.act_toggle_daltonismo = QAction("Alternar modo daltonismo", self)
        self.act_toggle_daltonismo.setShortcut("F9")
        self.act_toggle_daltonismo.triggered.connect(self._toggle_daltonismo)
        self.addAction(self.act_toggle_daltonismo)

    def _apply_theme(self, daltonismo: bool):
        theme = DEFAULT_THEME
        if self.app_ref is not None:
            self.app_ref.setProperty("theme", theme)
            self.app_ref.setProperty("daltonismo", daltonismo)
        apply_theme(self.app_ref, theme, daltonismo)

    def _on_settings_changed(self, daltonismo: bool, language: str):
        self._lang = language
        self._apply_theme(daltonismo)

    def fade_in(self, widget, ms: int = 300):
        effect = self._ensure_effect(widget)
        animation = QPropertyAnimation(effect, b"opacity", self)
        animation.setDuration(ms)
        animation.setStartValue(effect.opacity())
        animation.setEndValue(1.0)
        animation.setEasingCurve(QEasingCurve.InOutQuad)
        animation.finished.connect(lambda: self._cleanup_animation(animation))
        animation.start()
        self._animations.append(animation)
        return animation

    def fade_out(self, widget, ms: int = 300, finished=None):
        effect = self._ensure_effect(widget)
        animation = QPropertyAnimation(effect, b"opacity", self)
        animation.setDuration(ms)
        animation.setStartValue(effect.opacity())
        animation.setEndValue(0.0)
        animation.setEasingCurve(QEasingCurve.InOutQuad)
        if finished is not None:
            animation.finished.connect(finished)
        animation.finished.connect(lambda: self._cleanup_animation(animation))
        animation.start()
        self._animations.append(animation)
        return animation

    def slide_to(self, next_index: int, direction: str = "left", duration: int = 300):
        if not (0 <= next_index < self.stack.count()):
            return
        if next_index == self.stack.currentIndex():
            return
        offset = self.stack.frameRect().width()
        if direction == "right":
            offset = -offset
        start_pos = self.stack.pos()
        end_pos = start_pos - QPoint(offset, 0)

        def restore_position():
            self.stack.move(start_pos)
            self.stack.setCurrentIndex(next_index)
            target = self.stack.currentWidget()
            effect = self._ensure_effect(target)
            effect.setOpacity(0.0)
            self.fade_in(target, duration)

        animation = QPropertyAnimation(self.stack, b"pos", self)
        animation.setDuration(duration)
        animation.setStartValue(start_pos)
        animation.setEndValue(end_pos)
        animation.setEasingCurve(QEasingCurve.InOutCubic)
        animation.finished.connect(restore_position)
        animation.finished.connect(lambda: self._cleanup_animation(animation))
        animation.start()
        self._animations.append(animation)
        current_widget = self.stack.currentWidget()
        self.fade_out(current_widget, duration)

    def _transition_to(self, target):
        current = self.stack.currentWidget()
        if current is target or target is None:
            return

        target_index = self.stack.indexOf(target)
        if target_index == -1:
            return
        current_index = self.stack.currentIndex()
        direction = "left" if target_index > current_index else "right"
        self.slide_to(target_index, direction=direction)

    def _ensure_effect(self, widget):
        effect = widget.graphicsEffect()
        if not isinstance(effect, QGraphicsOpacityEffect):
            effect = QGraphicsOpacityEffect(widget)
            effect.setOpacity(1.0)
            widget.setGraphicsEffect(effect)
        return effect

    def _cleanup_animation(self, animation):
        if animation in self._animations:
            self._animations.remove(animation)

    def _toggle_daltonismo(self):
        settings.set_daltonismo(not settings.daltonismo)

    def _go_home(self):
        self._transition_to(self.home)

    def _open_tabs(self, tab_index: int | None = None):
        if self.tabs_view is None:
            tabs = QTabWidget()
            tabs.setDocumentMode(True)
            tabs.setTabPosition(QTabWidget.North)
            tabs.addTab(InvestmentPlan(lang=settings.language), tr("tab_plan"))
            tabs.addTab(Debts(lang=settings.language), tr("tab_debt"))
            self.tabs_view = tabs
            self.stack.addWidget(self.tabs_view)
            self._ensure_effect(self.tabs_view).setOpacity(0.0)
        if tab_index is not None and 0 <= tab_index < self.tabs_view.count():
            self.tabs_view.setCurrentIndex(tab_index)
        self._transition_to(self.tabs_view)


def run():
    app = QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    import os

    try:
        run()
    except ImportError:
        venv_py = root_dir / ".venv" / "bin" / "python"
        if venv_py.exists() and sys.executable != str(venv_py):
            os.execv(str(venv_py), [str(venv_py)] + sys.argv)
        raise
