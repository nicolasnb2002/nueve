import type { Concept } from "@/data/types";

/**
 * Días 10 y 11: operar cripto spot sin regalar plata.
 * Todo número de este archivo lo recalcula scripts/verify_examples.py.
 * Tarifas: https://www.binance.info/en-BH/fee (página oficial de tarifas de Binance),
 * consultada el 10/10/2026. binance.com/en/fee/trading no se pudo leer ese día (pide verificación anti-bot).
 */
export const FEE_SOURCE = {
  url: "https://www.binance.info/en-BH/fee",
  retrieved: "10/10/2026",
};

export const part3: Concept[] = [
  {
    id: "19",
    n: 19,
    day: 10,
    title: "Libro de órdenes y spread",
    minutes: 35,
    promise: "Leer quién quiere comprar, quién quiere vender, y cuánto cuesta cruzar de un lado al otro.",
    line: "El precio de la pantalla es un promedio. Vos operás en el bid o en el ask.",
    blocks: [
      {
        kind: "note",
        text: "En criollo: el libro de órdenes es una lista de carteles. De un lado, «compro a tanto» (bids). Del otro, «vendo a tanto» (asks). El precio que ves en grande es un punto en el medio, y nadie te vende ahí.",
      },
      {
        kind: "p",
        text: "Cada fila del libro es un precio y una cantidad. El bid más alto es lo máximo que alguien paga ahora. El ask más bajo es lo mínimo a lo que alguien vende ahora. La distancia entre los dos es el spread. El precio medio (mid) es el promedio de esos dos, y es el que suelen mostrar los gráficos.",
      },
      {
        kind: "example",
        title: "Un libro chico, par XYZ/USDT (inventado)",
        rows: [
          { k: "Asks (venden)", v: "100,40 × 10 · 100,20 × 6 · 100,10 × 4" },
          { k: "Bids (compran)", v: "99,90 × 5 · 99,80 × 8 · 99,50 × 10" },
          { k: "Spread", v: "100,10 − 99,90 = 0,20 USDT" },
          { k: "Mid", v: "(100,10 + 99,90) / 2 = 100,00" },
          { k: "Spread relativo", v: "0,20 / 100,00 = 0,20 % = 20 bps" },
          { k: "Medio spread", v: "10 bps: lo que pagás contra el mid cada vez que cruzás" },
        ],
        note: "1 bp (punto básico) = 0,01 %. Los números son de juguete, para hacer la cuenta a mano.",
      },
      {
        kind: "p",
        text: "Si comprás al toque y vendés al toque, pagás el spread entero en el ida y vuelta: entrás en el ask y salís en el bid. Ese costo no aparece en la factura de comisiones, pero está. Un par líquido tiene spreads de una fracción de bp; uno chico puede tener decenas.",
      },
      {
        kind: "p",
        text: "La profundidad es cuánto hay en cada nivel. Un spread angosto con muy poca cantidad en el primer nivel engaña: apenas comprás un poco más, empezás a comerte los niveles de atrás. Eso es el slippage, del día 11.",
      },
      { kind: "figure", id: "book" },
    ],
    questions: [
      {
        q: "En el libro de ejemplo, ¿cuál es el spread relativo al mid?",
        options: ["0,02 %", "0,20 % (20 bps)", "2 %", "0,10 %"],
        answer: 1,
        why: "0,20 / 100,00 = 0,20 %, o sea 20 bps. El medio spread (10 bps) es lo que pagás contra el mid en una sola punta.",
      },
      {
        q: "Querés comprar ya mismo, sin esperar. ¿A qué precio arrancás?",
        options: ["Al mid, 100,00", "Al mejor bid, 99,90", "Al mejor ask, 100,10", "Al último precio operado, sea cual sea"],
        answer: 2,
        why: "Comprar al toque es aceptar el cartel de alguien que vende: el ask más bajo.",
      },
      {
        q: "Comprás y vendés al instante, sin comisiones. Contra el mid, ¿cuánto perdiste en el ida y vuelta?",
        options: ["Nada", "10 bps", "20 bps: el spread entero", "40 bps"],
        answer: 2,
        why: "Entrás 10 bps arriba del mid y salís 10 bps abajo: 20 bps, aunque el mid no se haya movido.",
      },
      {
        q: "Un par tiene spread de 1 bp pero solo 0,1 unidades en el primer nivel. Querés 50 unidades.",
        options: [
          "Pagás 1 bp, el spread manda",
          "Vas a comerte niveles más caros: mirá la profundidad, no solo el spread",
          "No se puede comprar más de lo que hay en el primer nivel",
          "El exchange te da el mid",
        ],
        answer: 1,
        why: "El spread describe la primera fila. Una orden grande recorre el libro hacia atrás.",
      },
    ],
  },
  {
    id: "20",
    n: 20,
    day: 10,
    title: "Maker, taker y la comisión real",
    minutes: 40,
    promise: "Calcular a mano cuánto te cobra Binance spot, con y sin descuento en BNB, y cuánto se come por mes.",
    line: "La comisión chica, repetida, es la que más cobra.",
    blocks: [
      {
        kind: "note",
        text: "En criollo: si tu orden queda esperando en el libro y alguien la toma, sos maker (pusiste el cartel). Si tu orden toma un cartel que ya estaba, sos taker. El exchange cobra un porcentaje de lo que operás en cada caso.",
      },
      {
        kind: "p",
        text: "Tarifa spot publicada por Binance para el usuario regular (volumen de 30 días menor a 1.000.000 USD), consultada el 10/10/2026 en https://www.binance.info/en-BH/fee: maker 0,100 % y taker 0,100 % en pares USDT (los pares USDC tienen otra tarifa). Pagando la comisión con BNB hay 25 % de descuento: 0,075 % y 0,075 %. Los niveles VIP bajan la tasa pero piden volumen y saldo en BNB que una cuenta chica no tiene. Las tarifas cambian: antes de usar estos números, volvé a mirar la página oficial.",
      },
      {
        kind: "formula",
        text: "comisión = monto operado × tasa      tasa con BNB = tasa × (1 − 0,25)",
      },
      {
        kind: "example",
        title: "Una compra de 1.000 USDT",
        rows: [
          { k: "Taker, sin BNB", v: "1.000 × 0,100 % = 1,00 USDT" },
          { k: "Taker, con BNB", v: "1.000 × 0,075 % = 0,75 USDT" },
          { k: "En BNB", v: "0,75 / 600 = 0,00125 BNB (si el BNB valiera 600 USDT; precio inventado)" },
          { k: "Ida y vuelta", v: "2,00 USDT (0,20 %) sin BNB · 1,50 USDT (0,15 %) con BNB" },
        ],
      },
      {
        kind: "p",
        text: "¿En qué moneda se cobra? Sin el descuento activado, la comisión sale del activo que recibís. Comprás 0,01 BTC: te llegan 0,01 × (1 − 0,001) = 0,00999 BTC. Con el descuento activado y saldo en BNB, se descuenta BNB y recibís el BTC entero.",
      },
      {
        kind: "p",
        text: "Para el usuario regular, maker y taker pagan la misma tasa. La diferencia está en el spread: el taker lo cruza, el maker no (pero puede quedarse sin ejecutar). Contra el mid del libro del concepto anterior, un ida y vuelta taker+taker cuesta 10 + 10 bps de medio spread más 10 + 10 bps de comisión: 40 bps. Con BNB, 35 bps. Maker en las dos puntas, si se llenan las dos: pagás 20 bps de comisión (15 con BNB) pero cobrás el spread, así que contra el mid quedás cerca de 0 bps, siempre que el precio no se haya movido en contra mientras esperabas.",
      },
      {
        kind: "example",
        title: "Ejercicio: lo que se come la frecuencia",
        rows: [
          { k: "Cuenta", v: "500 USDT, 20 idas y vueltas por mes, todo taker" },
          { k: "Sin BNB", v: "20 × 2 × 500 × 0,100 % = 20 USDT por mes, el 4 % de la cuenta" },
          { k: "Con BNB", v: "15 USDT por mes, el 3 %" },
          { k: "Doce meses de 4 %", v: "1 − 0,96¹² = 38,7 % de la cuenta en comisiones, sin contar spread" },
        ],
        note: "Para empatar, la estrategia tiene que ganar eso antes de ganar algo.",
      },
      { kind: "figure", id: "fees" },
    ],
    questions: [
      {
        q: "Usuario regular, sin BNB. Comprás 1.000 USDT como taker. Comisión:",
        options: ["0,10 USDT", "1,00 USDT", "0,75 USDT", "10 USDT"],
        answer: 1,
        why: "1.000 × 0,100 % = 1,00 USDT. Con BNB serían 0,75.",
      },
      {
        q: "Con el descuento de BNB, la tasa taker regular queda en",
        options: ["0,025 %", "0,075 %", "0,090 %", "0,100 %: el descuento es solo maker"],
        answer: 1,
        why: "0,100 % × (1 − 0,25) = 0,075 %, para maker y para taker.",
      },
      {
        q: "500 USDT, 20 idas y vueltas por mes, taker sin BNB. Comisiones del mes:",
        options: ["2 USDT", "10 USDT", "20 USDT (4 % de la cuenta)", "40 USDT"],
        answer: 2,
        why: "20 × 2 × 500 × 0,001 = 20 USDT. Son 40 operaciones de 500, no 20.",
      },
      {
        q: "Compraste 0,01 BTC sin descuento BNB activado. ¿Cuánto BTC recibís?",
        options: ["0,01", "0,00999", "0,0099", "0,00925"],
        answer: 1,
        why: "La comisión de 0,1 % sale del activo recibido: 0,01 × 0,999 = 0,00999.",
      },
    ],
  },
  {
    id: "21",
    n: 21,
    day: 11,
    title: "Slippage: orden límite vs orden de mercado",
    minutes: 35,
    promise: "Calcular el precio promedio que te toca de verdad, y elegir entre certeza de ejecución y certeza de precio.",
    line: "Mercado te garantiza que entrás. Límite te garantiza a cuánto.",
    blocks: [
      {
        kind: "note",
        text: "En criollo: una orden de mercado dice «dame la cantidad, al precio que haya». Una orden límite dice «a este precio o mejor, y si no, espero». El slippage es la diferencia entre el precio que mirabas y el que te tocó.",
      },
      {
        kind: "p",
        text: "Una orden de mercado barre el libro desde el mejor nivel hacia atrás hasta completar la cantidad. Tu precio es el promedio ponderado de los niveles que comiste. Cuanto más grande la orden y más flaco el libro, más lejos queda ese promedio del precio de pantalla.",
      },
      {
        kind: "example",
        title: "Compra de mercado de 8 unidades (libro del día 10)",
        rows: [
          { k: "Nivel 1", v: "4 × 100,10 = 400,40" },
          { k: "Nivel 2", v: "4 × 100,20 = 400,80" },
          { k: "Total y promedio", v: "801,20 USDT · 801,20 / 8 = 100,15" },
          { k: "Slippage", v: "5,0 bps contra el mejor ask · 15 bps contra el mid" },
          { k: "Más comisión", v: "taker 0,100 %: 0,8012 USDT · con BNB: 0,6009 USDT" },
        ],
      },
      {
        kind: "example",
        title: "Ejercicio: venta de mercado de 15 unidades",
        rows: [
          { k: "Niveles", v: "5 × 99,90 + 8 × 99,80 + 2 × 99,50" },
          { k: "Total", v: "1.496,90 USDT" },
          { k: "Promedio", v: "99,79" },
          { k: "Contra el mid", v: "21 bps abajo, antes de comisión" },
        ],
      },
      {
        kind: "p",
        text: "La orden límite te protege del precio, no del tiempo. Una compra límite de 8 a 100,10 llena las 4 unidades que hay ahí y deja las otras 4 esperando. Si el precio se va para arriba, te quedás afuera con media posición. Si queda en el libro y alguien la toma, sos maker y no pagás spread.",
      },
      {
        kind: "ul",
        items: [
          "Mercado: entrás seguro, el precio es el que salga. Pagás spread y slippage.",
          "Límite: precio seguro, la ejecución no. Podés llenarte en parte o nada.",
          "En un backtest, suponer que todas tus órdenes límite se llenan al precio exacto es un sesgo: se llenan justo cuando el precio pasa por ahí, y a veces porque el mercado se te vino en contra.",
        ],
      },
      { kind: "figure", id: "slip" },
    ],
    questions: [
      {
        q: "Compra de mercado de 8 en el libro de ejemplo. Precio promedio:",
        options: ["100,10", "100,15", "100,20", "100,00"],
        answer: 1,
        why: "(4 × 100,10 + 4 × 100,20) / 8 = 801,20 / 8 = 100,15.",
      },
      {
        q: "Venta de mercado de 15. ¿Cuántos bps abajo del mid queda el promedio?",
        options: ["10 bps", "15 bps", "21 bps", "50 bps"],
        answer: 2,
        why: "Total 1.496,90, promedio 99,79. (100,00 − 99,79) / 100,00 ≈ 21 bps.",
      },
      {
        q: "Ponés una compra límite de 8 a 100,10 y el precio sube a 101. ¿Qué pasó probablemente?",
        options: [
          "Te llenaron las 8 a 100,10",
          "Te llenaron 4 y las otras 4 siguen esperando abajo del precio",
          "El exchange te llenó a 101",
          "La orden se convirtió en orden de mercado",
        ],
        answer: 1,
        why: "En 100,10 había 4. Lo demás queda en el libro a tu precio, que el mercado ya dejó atrás.",
      },
      {
        q: "En un backtest, ¿qué supuesto sobre órdenes límite infla el resultado?",
        options: [
          "Que pagan comisión",
          "Que se llenan siempre, completas, al precio límite",
          "Que a veces no se llenan",
          "Que se ejecutan en t+1",
        ],
        answer: 1,
        why: "En la vida real se llenan en parte o no se llenan, y más seguido cuando el precio va en tu contra.",
      },
    ],
  },
  {
    id: "22",
    n: 22,
    day: 11,
    title: "Custodia, riesgo de exchange y apalancamiento",
    minutes: 40,
    promise: "Saber dónde están tus monedas, y hacer la cuenta de liquidación antes de tocar el apalancamiento.",
    line: "Con apalancamiento no necesitás equivocarte por mucho, solo por un rato.",
    blocks: [
      {
        kind: "note",
        text: "En criollo: si tus monedas están en un exchange, lo que tenés es una promesa del exchange. Y apalancarte es operar con plata prestada: una caída chica alcanza para que te cierren la posición y pierdas tu parte.",
      },
      {
        kind: "h",
        text: "Custodia",
      },
      {
        kind: "ul",
        items: [
          "En el exchange (custodia de terceros): cómodo para operar, pero dependés de que el exchange sea solvente, no congele retiros y no lo hackeen. Pasó varias veces en la historia de cripto.",
          "Billetera propia (autocustodia): vos guardás la clave. Si la perdés, no hay soporte que la recupere.",
          "Práctica común: en el exchange solo lo que estás operando. Activá 2FA, lista blanca de direcciones de retiro, y nunca compartas claves ni frases semilla. Ninguna clave de API necesita permiso de retiro para operar.",
        ],
      },
      {
        kind: "h",
        text: "La cuenta de la liquidación",
      },
      {
        kind: "p",
        text: "Con apalancamiento L, ponés un margen M y controlás una posición de M × L. Una caída del precio de 1/L ya se come todo el margen. El exchange te liquida un poco antes, porque exige un margen de mantenimiento. Modelo simplificado (largo, margen aislado, mantenimiento de 0,5 %; las reglas reales de cada exchange varían por tamaño y activo):",
      },
      {
        kind: "formula",
        text: "caída hasta la liquidación ≈ 1/L − margen de mantenimiento",
      },
      {
        kind: "example",
        title: "¿Cuánto tiene que caer para que te liquiden?",
        rows: [
          { k: "2x", v: "49,5 %" },
          { k: "5x", v: "19,5 %" },
          { k: "10x", v: "9,5 %" },
          { k: "20x", v: "4,5 %" },
          { k: "50x", v: "1,5 %" },
        ],
        note: "Movimientos diarios de varios por ciento son comunes en cripto. A 20x o 50x, una mala tarde alcanza.",
      },
      {
        kind: "p",
        text: "Las comisiones también se apalancan: se cobran sobre la posición, no sobre tu margen. 100 USDT a 10x es una posición de 1.000. Un ida y vuelta taker sin BNB cuesta 2 USDT: el 2 % de tu margen, por cada entrada y salida.",
      },
      {
        kind: "p",
        text: "Y las pérdidas no son simétricas. Para recuperar una caída de 10 % necesitás ganar 11 %; de 50 %, 100 %; de 90 %, 900 %. Una cuenta chica tiene poco margen para absorber errores, y la liquidación es un error que no se recupera: la posición se cerró en el peor punto. Por eso, para una cuenta chica que está aprendiendo, la regla es spot y sin apalancamiento.",
      },
      {
        kind: "example",
        title: "Ejercicio",
        rows: [
          { k: "Dato", v: "200 USDT de margen, largo a 10x, el precio cae 5 %" },
          { k: "Pérdida", v: "200 × 10 × 5 % = 100 USDT, la mitad de la cuenta" },
          { k: "Si cae 9,5 %", v: "liquidado: perdés el margen entero (o casi: lo que queda suele irse en la comisión de liquidación)" },
        ],
      },
      { kind: "figure", id: "liq" },
    ],
    questions: [
      {
        q: "Largo a 10x, mantenimiento 0,5 % (modelo simple). ¿Qué caída te liquida?",
        options: ["50 %", "10,5 %", "9,5 %", "0,5 %"],
        answer: 2,
        why: "1/10 − 0,5 % = 9,5 %. Sin el mantenimiento serían 10 %.",
      },
      {
        q: "200 USDT a 10x y el precio cae 5 %. Perdés",
        options: ["10 USDT", "50 USDT", "100 USDT", "200 USDT"],
        answer: 2,
        why: "La posición es 2.000 USDT. 5 % de 2.000 = 100 USDT, la mitad de tu margen.",
      },
      {
        q: "Perdiste 50 % de la cuenta. Para volver al punto de partida necesitás ganar",
        options: ["50 %", "75 %", "100 %", "150 %"],
        answer: 2,
        why: "De 100 a 50 y de 50 a 100: hay que duplicar, +100 %.",
      },
      {
        q: "¿Cuál de estas prácticas reduce el riesgo de custodia?",
        options: [
          "Dejar todo en un solo exchange para tenerlo a mano",
          "Una clave de API con permiso de retiro, por las dudas",
          "En el exchange solo lo que operás, 2FA y lista blanca de retiros",
          "Compartir la frase semilla con soporte si te la piden",
        ],
        answer: 2,
        why: "Menos saldo expuesto y menos formas de sacarlo. Soporte legítimo nunca pide tu frase semilla.",
      },
    ],
  },
];
