import locale

try:
    locale.setlocale(locale.LC_ALL, "")
except locale.Error:
    locale.setlocale(locale.LC_ALL, "C")


def fmt_currency(mx: float) -> str:
    """Formato consistente MXN con separador de miles y dos decimales usando locale del sistema."""
    try:
        value = float(mx)
    except (TypeError, ValueError):
        value = 0.0
    formatted = locale.format_string("%0.2f", value, grouping=True)
    conv = locale.localeconv()
    if not conv.get("thousands_sep"):
        formatted = f"{value:,.2f}"
    return f"MXN {formatted}"
