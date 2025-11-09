from math import pow
from typing import List

from .models import InvestParams, InvestResult, YearRow


def simulate_investment(p: InvestParams) -> InvestResult:
    r_m = pow(1 + p.annual_return_pct / 100.0, 1 / 12) - 1
    balance = p.initial_mxn
    contrib_accum = p.initial_mxn
    net_gain_accum = 0.0
    fees_accum = 0.0
    taxes_accum = 0.0
    rows: List[YearRow] = []

    contrib = p.monthly_mxn
    months_total = p.horizon_years * 12

    for m in range(1, months_total + 1):
        if p.schedule.begin_or_end == "begin":
            balance += contrib
            contrib_accum += contrib

        gain = balance * r_m
        balance += gain
        net_gain_accum += gain

        if p.schedule.begin_or_end == "end":
            balance += contrib
            contrib_accum += contrib

        # Aportes crecientes (cada 12 meses)
        if (m % 12) == 0 and p.schedule.contrib_growth_pct:
            contrib *= (1 + p.schedule.contrib_growth_pct / 100.0)

        if (m % 12) == 0:
            years = m // 12
            real_value = balance / pow(1 + p.annual_inflation_pct / 100.0, years)
            rows.append(
                YearRow(
                    year=years,
                    final_balance=balance,
                    contrib_accum=contrib_accum,
                    net_gain_accum=net_gain_accum,
                    real_value=real_value,
                    fees_accum=fees_accum,
                    taxes_accum=taxes_accum,
                )
            )

    return InvestResult(
        rows=rows,
        nominal_final=rows[-1].final_balance if rows else balance,
        total_contrib=contrib_accum,
        net_gain=net_gain_accum - fees_accum - taxes_accum,
        real_value_final=rows[-1].real_value if rows else balance,
    )
