STRINGS = {
    "welcome_title": "Bienvenido a Nueva Financiera",
    "welcome_msg": "Simulador educativo de inversiones y deudas.",
    "btn_start": "Iniciar a invertir",
    "tab_plan": "Plan de inversion",
    "tab_debt": "Deudas",
    "theme_contrast": "Daltonismo",
    "lang_es_mx": "Español (MX)",
}


def tr(key: str) -> str:
    return STRINGS.get(key, key)
