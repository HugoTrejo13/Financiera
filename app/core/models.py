from dataclasses import dataclass
from typing import List


@dataclass
class FeeParams:
    deposit_fee_pct: float = 0.0
    buy_sell_pct: float = 0.0
    admin_annual_pct: float = 0.0
    vat_on_fees_pct: float = 16.0
    spread_in_pct: float = 0.0
    spread_out_pct: float = 0.0
    platform_fixed_mxn: float = 0.0


@dataclass
class TaxParams:
    gain_isr_pct: float = 10.0


@dataclass
class ScheduleParams:
    freq: str = "monthly"          # monthly | quincenal | anual
    begin_or_end: str = "begin"    # begin | end
    months_with_extra: List[int] = None
    months_without: List[int] = None
    extra_amount_mxn: float = 0.0
    contrib_growth_pct: float = 0.0


@dataclass
class InvestParams:
    initial_mxn: float
    monthly_mxn: float
    annual_return_pct: float
    annual_inflation_pct: float
    horizon_years: int
    fees: FeeParams
    taxes: TaxParams
    schedule: ScheduleParams


@dataclass
class YearRow:
    year: int
    final_balance: float
    contrib_accum: float
    net_gain_accum: float
    real_value: float
    fees_accum: float
    taxes_accum: float


@dataclass
class InvestResult:
    rows: List[YearRow]
    nominal_final: float
    total_contrib: float
    net_gain: float
    real_value_final: float


# ---- Deuda ----
@dataclass
class DebtParams:
    title: str
    principal_mxn: float
    cat_annual_pct: float
    months: int
    monthly_fee_mxn: float = 0.0
    monthly_insurance_mxn: float = 0.0
    extra_months: List[int] = None
    extra_amount_mxn: float = 0.0
    inflation_annual_pct: float = 0.0


@dataclass
class DebtRow:
    month: int
    payment: float
    interest: float
    capital: float
    fees_ins: float
    balance: float
    interest_accum: float
    real_deflated: float


@dataclass
class DebtResult:
    rows: List[DebtRow]
    total_paid: float
    total_interest: float
    real_cost_today: float
    months_spent: int
