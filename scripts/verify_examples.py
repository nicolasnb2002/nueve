#!/usr/bin/env python3
"""Recalcula cada número de los días 10 y 11 (src/data/part3.ts) y del glosario.

Regla: todo ejemplo numérico y toda respuesta de ejercicio sale de código.
Cada valor se calcula acá, se formatea en castellano (coma decimal, punto de miles)
y se exige que ese texto exacto aparezca en el archivo de contenido.
Uso: python3 scripts/verify_examples.py   (sale con código 1 si algo no coincide)
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = (ROOT / "src/data/part3.ts").read_text(encoding="utf-8")
SRC += (ROOT / "src/data/glossary.ts").read_text(encoding="utf-8")

def es(x, d):
    s = f"{x:,.{d}f}".replace("-", "−")
    return s.replace(",", "_").replace(".", ",").replace("_", ".")

checks = []
def check(label, value, d, suffix=""):
    checks.append((label, es(value, d) + suffix))

# Tarifas Binance spot, usuario regular (fuente: binance.info/en-BH/fee, 2026-10-10)
TAKER = 0.001      # 0,100 %
MAKER = 0.001      # 0,100 %
BNB_OFF = 0.25
TAKER_BNB = TAKER * (1 - BNB_OFF)
check("taker con BNB %", TAKER_BNB * 100, 3, " %")

# Libro de ejemplo XYZ/USDT
asks = [(100.10, 4), (100.20, 6), (100.40, 10)]
bids = [(99.90, 5), (99.80, 8), (99.50, 10)]
best_ask, best_bid = asks[0][0], bids[0][0]
spread = best_ask - best_bid
mid = (best_ask + best_bid) / 2
check("spread", spread, 2)
check("mid", mid, 2)
check("spread % del mid", spread / mid * 100, 2, " %")
check("spread bps", spread / mid * 1e4, 0, " bps")
check("medio spread bps", spread / 2 / mid * 1e4, 0, " bps")

def sweep(levels, qty):
    cost, left = 0.0, qty
    for p, q in levels:
        take = min(q, left); cost += take * p; left -= take
        if left <= 0: break
    assert left <= 1e-12
    return cost, cost / qty

cost8, avg8 = sweep(asks, 8)
check("compra 8 total", cost8, 2)
check("compra 8 promedio", avg8, 2)
check("slip vs mejor ask bps", (avg8 - best_ask) / best_ask * 1e4, 1, " bps")
check("slip vs mid bps", (avg8 - mid) / mid * 1e4, 0, " bps")
check("fee taker sobre 801,20", cost8 * TAKER, 4)
check("fee taker BNB sobre 801,20", cost8 * TAKER_BNB, 4)

rev15, avg15 = sweep(bids, 15)
check("venta 15 total", rev15, 2)
check("venta 15 promedio", avg15, 2)
check("venta 15 slip vs mid bps", (mid - avg15) / mid * 1e4, 0, " bps")

# Comisión sobre 1.000 USDT
check("fee 1000 taker", 1000 * TAKER, 2)
check("fee 1000 BNB", 1000 * TAKER_BNB, 2)
check("ida y vuelta 1000", 2 * 1000 * TAKER, 2)
check("ida y vuelta 1000 BNB", 2 * 1000 * TAKER_BNB, 2)
check("ida y vuelta %", 2 * TAKER * 100, 2, " %")
check("ida y vuelta BNB %", 2 * TAKER_BNB * 100, 2, " %")
BNB_PRICE = 600  # precio hipotético, no de mercado
check("fee en BNB", 1000 * TAKER_BNB / BNB_PRICE, 5)
check("BTC recibido", 0.01 * (1 - TAKER), 5)

# Costo total ida y vuelta (spread + comisiones), en bps del mid
half = spread / 2 / mid * 1e4
check("taker+taker bps", 2 * half + 2 * TAKER * 1e4, 0, " bps")
check("taker+taker BNB bps", 2 * half + 2 * TAKER_BNB * 1e4, 0, " bps")
check("maker+maker comisión bps", 2 * MAKER * 1e4, 0, " bps de comisión")
check("maker+maker comisión BNB", 2 * MAKER * (1 - BNB_OFF) * 1e4, 0, " con BNB")
check("maker+maker neto vs mid bps", abs(2 * MAKER * 1e4 - 2 * half), 0, " bps, siempre")

# Ejercicio: 500 USDT, 20 idas y vueltas por mes
monthly = 20 * 2 * 500 * TAKER
monthly_bnb = 20 * 2 * 500 * TAKER_BNB
check("mensual USDT", monthly, 0, " USDT")
check("mensual %", monthly / 500 * 100, 0, " %")
check("mensual BNB USDT", monthly_bnb, 0, " USDT")
check("mensual BNB %", monthly_bnb / 500 * 100, 0, " %")
check("anual compuesto aprox % (12 meses de 4%)", (1 - (1 - 0.04) ** 12) * 100, 1, " %")

# Liquidación simplificada: caída = 1/L − mantenimiento
MM = 0.005
for L in (2, 5, 10, 20, 50):
    check(f"liq {L}x", (1 / L - MM) * 100, 1, " %")
check("posición 10x sobre 100", 100 * 10, 0)
check("fee ida y vuelta 10x sobre margen %", 2 * 100 * 10 * TAKER / 100 * 100, 0, " %")
# Ejercicio 200 USDT a 10x, caída 5 %
check("pérdida 200 a 10x con -5 %", 200 * 10 * 0.05, 0, " USDT")
# Recuperación tras pérdida
for loss in (0.10, 0.50, 0.90):
    check(f"recuperar -{loss:.0%}", (1 / (1 - loss) - 1) * 100, 0, " %")

# Glosario
check("retorno 100->110", (110 / 100 - 1) * 100, 0, " %")
check("drawdown 100->80", (80 / 100 - 1) * 100, 0, " %")
check("20 bps en %", 20 / 100, 2, " %")
check("caída que se come el margen a 10x", 1 / 10 * 100, 0, " %")

bad = 0
for label, s in checks:
    ok = s in SRC
    bad += not ok
    print(("OK   " if ok else "FALTA"), f"{label:45s} {s}")
print(f"\n{len(checks) - bad}/{len(checks)} números coinciden con el contenido.")
sys.exit(1 if bad else 0)
