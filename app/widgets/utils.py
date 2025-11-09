from PySide6.QtGui import QFont
from PySide6.QtWidgets import QSizePolicy, QWidget


def make_big(w: QWidget, min_h: int = 48, font_pt: int = 16):
    f = w.font() if w.font().pointSize() > 0 else QFont()
    f.setPointSize(font_pt)
    w.setFont(f)
    w.setMinimumHeight(min_h)
    w.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    return w
