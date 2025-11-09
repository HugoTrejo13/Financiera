from PySide6.QtWidgets import QFrame, QLabel, QVBoxLayout


class Card(QFrame):
    """
    Contenedor visual reutilizable con título y estilo consistente.
    """

    def __init__(self, title: str = "", parent=None):
        super().__init__(parent)
        self.setProperty("class", "card")

        self._container = QVBoxLayout(self)
        self._container.setContentsMargins(18, 18, 18, 18)
        self._container.setSpacing(12)

        if title:
            header = QLabel(title)
            header.setProperty("role", "card-title")
            self._container.addWidget(header)

        self._content_layout = QVBoxLayout()
        self._content_layout.setContentsMargins(0, 0, 0, 0)
        self._content_layout.setSpacing(8)
        self._container.addLayout(self._content_layout)

    @property
    def content_layout(self) -> QVBoxLayout:
        return self._content_layout
