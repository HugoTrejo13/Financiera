from math import pow
from typing import List

from .models import DebtParams, DebtResult, DebtRow


def simulate_debt(p: DebtParams) -> DebtResult:
    r = p.cat_annual_pct / 100.0 / 12.0
    n = p.months
    P = p.principal_mxn
    if r > 0:
        cuota = P * (r) / (1 - pow(1 + r, -n))
    else:
        cuota = P / n

    balance = P
    rows: List[DebtRow] = []
    acc_int = 0.0
    for m in range(1, n + 1):
        interes = balance * r
        capital = cuota - interes
        fees_ins = p.monthly_fee_mxn + p.monthly_insurance_mxn
        pago = cuota + fees_ins
        balance = max(0.0, balance - capital)
        acc_int += interes
        real_def = pago / pow(1 + p.inflation_annual_pct / 100.0, (m / 12.0))
        rows.append(DebtRow(m, pago, interes, capital, fees_ins, balance, acc_int, real_def))

    total_pagado = sum(rw.payment for rw in rows)
    return DebtResult(rows, total_pagado, acc_int, sum(rw.real_deflated for rw in rows), len(rows))
