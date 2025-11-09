from app.core.invest_engine import simulate_investment
from app.core.models import FeeParams, InvestParams, ScheduleParams, TaxParams


def test_simulate_investment_basic():
    p = InvestParams(
        initial_mxn=0.0,
        monthly_mxn=1000.0,
        annual_return_pct=10.0,
        annual_inflation_pct=4.0,
        horizon_years=5,
        fees=FeeParams(),
        taxes=TaxParams(),
        schedule=ScheduleParams(),
    )
    r = simulate_investment(p)
    assert len(r.rows) == 5
    assert r.nominal_final > r.total_contrib
