from PySide6.QtCore import QObject, Signal


class Settings(QObject):
    """
    Configuracion centralizada de daltonismo y lenguaje.
    """

    changed = Signal(bool, str)  # daltonismo, language

    def __init__(self) -> None:
        super().__init__()
        self._daltonismo = False
        self._language = "es_MX"

    @property
    def daltonismo(self) -> bool:
        return self._daltonismo

    @property
    def language(self) -> str:
        return self._language

    def set_daltonismo(self, value: bool) -> None:
        value = bool(value)
        if value != self._daltonismo:
            self._daltonismo = value
            self._emit()

    def set_language(self, value: str) -> None:
        if value and value != self._language:
            self._language = value
            self._emit()

    def _emit(self) -> None:
        self.changed.emit(self._daltonismo, self._language)


settings = Settings()
