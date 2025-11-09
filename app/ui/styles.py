from typing import Dict

from PySide6.QtCore import Qt

# Brand palette
# Primario: #2F6EF8
# Acento claro: #5A8CFA
# Fondo claro: #F5F7FE
# Fondo oscuro: #0F1B3A
# Texto claro (dark theme): #E9ECF5
# Texto oscuro (light theme): #1E2430

INPUT_HEIGHT = 44
BTN_HEIGHT = 52
BASE_FONT = 'Inter, "Segoe UI", Arial, sans-serif'
DEFAULT_THEME = "dark"

BASE_CSS = """
* { font-size: 15px; }
QPushButton { padding: 10px 22px; border-radius: 10px; }
QLabel#title { font-size: 26px; font-weight: 700; }
QGroupBox::title { font-size: 16px; }
QHeaderView::section { padding: 10px 18px; font-size: 14px; }
"""

_PALETTES: Dict[str, Dict[str, str]] = {
    "light": {
        "base_bg": "#F5F7FE",
        "panel": "#FFFFFF",
        "border": "#D6DBE8",
        "text": "#1E2430",
        "subtle": "#5C657A",
        "accent": "#2F6EF8",
        "accent_hover": "#275ADA",
        "button_text": "#FFFFFF",
        "disabled_bg": "#E3E6F1",
        "section": "#EFF2FB",
        "table_alt": "rgba(30,36,48,0.04)",
        "focus_shadow": "rgba(47,110,248,0.35)",
    },
    "dark": {
        "base_bg": "#0F1B3A",
        "panel": "#141F47",
        "border": "#23325C",
        "text": "#E9ECF5",
        "subtle": "#AAB3D1",
        "accent": "#2F6EF8",
        "accent_hover": "#3F7DFF",
        "button_text": "#FFFFFF",
        "disabled_bg": "#1F2D58",
        "section": "#17264F",
        "table_alt": "rgba(233,236,245,0.06)",
        "focus_shadow": "rgba(47,110,248,0.45)",
    },
}

_CVD_SAFE_PALETTE: Dict[str, Dict[str, str]] = {
    "light": {
        "base_bg": "#F8F9FC",
        "panel": "#FFFFFF",
        "border": "#B9C2D5",
        "text": "#222631",
        "subtle": "#4B5468",
        "accent": "#005DFF",
        "accent_hover": "#0044C7",
        "button_text": "#FFFFFF",
        "disabled_bg": "#D0D8E8",
        "section": "#E9EEF8",
        "table_alt": "rgba(0,114,178,0.08)",
        "focus_shadow": "rgba(0,93,255,0.38)",
    },
    "dark": {
        "base_bg": "#0E1424",
        "panel": "#16223A",
        "border": "#25385A",
        "text": "#F3F5FB",
        "subtle": "#C3CADB",
        "accent": "#3F8CFF",
        "accent_hover": "#1F6FE8",
        "button_text": "#FFFFFF",
        "disabled_bg": "#1F3352",
        "section": "#1C2E4B",
        "table_alt": "rgba(0,114,178,0.10)",
        "focus_shadow": "rgba(63,140,255,0.55)",
    },
}

_OKABE_ITO_ACCENTS = [
    "#0072B2",
    "#009E73",
    "#D55E00",
    "#CC79A7",
    "#E69F00",
    "#56B4E9",
]

_STANDARD_ACCENTS = [
    "#2F6EF8",
    "#28C76F",
    "#FF4D4F",
    "#845EF7",
    "#F5A524",
    "#20C997",
]

_PATTERN_STYLES = [
    Qt.Dense4Pattern,
    Qt.Dense5Pattern,
    Qt.BDiagPattern,
    Qt.Dense6Pattern,
    Qt.CrossPattern,
    Qt.Dense7Pattern,
]


def _palette(theme: str, daltonismo: bool) -> Dict[str, str]:
    """
    Construye una paleta mínima pero suficiente para el CSS.
    Si ya hay constantes como DEFAULT_THEME/BASE_CSS/BASE_FONT, no las toques.
    Esta paleta cubre las llaves más usadas por el CSS base.
    """
    base = {
        "text": "#EAF1FF",
        "muted": "#9BA3B4",
        "bg": "#0f1b37",
        "card": "#121e3d",
        "border": "rgba(255,255,255,0.08)",
        "accent": "#3d7cff",
        "accent_hover": "#316cf0",
    }

    if str(theme).lower() in ("light", "claro"):
        base.update({
            "text": "#112236",
            "muted": "#4B5563",
            "bg": "#f7f8fb",
            "card": "#ffffff",
            "border": "rgba(0,0,0,0.08)",
            "accent": "#2b63ff",
            "accent_hover": "#204fe0",
        })

    if daltonismo:
        base.update({
            "text": "#0A0A0A",
            "bg": "#FFFFFF",
            "card": "#F4F7FF",
            "border": "rgba(0,0,0,0.15)",
            "accent": "#0000EE",
            "accent_hover": "#0000BB",
        })

    return base


HERO_CSS = """
QMainWindow#mainWindow {
    /* color de respaldo si no se carga la imagen */
    background-color: #0f1b37;

    /* imagen + overlay oscuro para que el texto siempre sea legible */
    background-image: linear-gradient(180deg, rgba(7,12,27,0.65), rgba(7,12,27,0.65)),
                      url("assets/icons/Imagenes/images/home_bg.jpg");
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-size: cover;
}

/* Card central del inicio */
#heroCard {
    background: rgba(18, 30, 61, 0.82);
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    min-width: 680px;
    max-width: 820px;
}

/* Título “Calculadora financiera” */
QLabel#heroTitle {
    color: #EAF1FF;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.2px;
}

/* CTA principal */
QPushButton#ctaPrimary {
    background: #3d7cff;
    color: #ffffff;
    border-radius: 10px;
    padding: 10px 22px;
    font-weight: 600;
    border: none;
}
QPushButton#ctaPrimary:hover { background: #316cf0; }
QPushButton#ctaPrimary:pressed { background: #285ad1; }
#heroCard QPushButton {
    padding: 8px 14px;
    border-radius: 8px;
}
"""


def stylesheet(theme: str, daltonismo: bool) -> str:
    pal = _palette(theme, daltonismo)

    css = BASE_CSS + f"""
* {{
    font-family: {BASE_FONT};
    color: {pal['text']};
}}

#heroSubtitle {{
    font-size: 14px;
    color: #C7D2F0;
}}

#primaryCta {{
    padding: 10px 18px;
    border-radius: 10px;
    font-weight: 600;
}}

#primaryCta:hover {{
    filter: brightness(1.05);
}}

#heroCard QPushButton {{
    padding: 8px 14px;
    border-radius: 8px;
}}
"""

    FORM_CSS = """
/* Campos “enabled” en tema oscuro */
QLineEdit, QDoubleSpinBox, QSpinBox, QComboBox {
    background: #162646;
    color: #EAF1FF;
    border: 1px solid #28406d;
    border-radius: 8px;
    padding: 6px 10px;
}
QLineEdit:focus, QDoubleSpinBox:focus, QSpinBox:focus, QComboBox:focus {
    border-color: #3d7cff;
}
QToolTip {
    color: #EAF1FF;
    background-color: #0f1b37;
    border: 1px solid #28406d;
    border-radius: 6px;
    padding: 6px 8px;
}
/* Botones primarios */
QPushButton {
    background: #3d7cff;
    color: #ffffff;
    border-radius: 8px;
    padding: 8px 16px;
    border: none;
}
QPushButton:hover { background: #316cf0; }
QPushButton:pressed { background: #285ad1; }
/* Tab widget limpio */
QTabBar::tab {
    background: #12213f;
    color: #cfe1ff;
    padding: 8px 14px;
    border-radius: 6px 6px 0 0;
    margin-right: 4px;
}
QTabBar::tab:selected { background: #1a2b4a; color: #ffffff; }
QTabWidget::pane {
    border-top: 2px solid #1a2b4a;
}
"""

    css += FORM_CSS
    css += HERO_CSS
    return css


def apply_theme(app, theme: str = DEFAULT_THEME, daltonismo: bool = False) -> None:
    if app is None:
        return
    app.setStyleSheet(stylesheet(theme, daltonismo))


def chart_colors(daltonismo: bool) -> list[str]:
    return _OKABE_ITO_ACCENTS if daltonismo else _STANDARD_ACCENTS


def chart_patterns() -> list[Qt.BrushStyle]:
    return _PATTERN_STYLES.copy()


def ui_palette(theme: str = DEFAULT_THEME, daltonismo: bool = False) -> Dict[str, str]:
    return _palette(theme, daltonismo).copy()
