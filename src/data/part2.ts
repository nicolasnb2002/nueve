import type { Concept } from "@/data/types";

export const part2: Concept[] = [
  {
    id: "10",
    n: 10,
    day: 5,
    title: "Deflated Sharpe Ratio",
    minutes: 55,
    promise: "Leer el DSR como la probabilidad de superar el Sharpe que la búsqueda ya te regalaba.",
    line: "El DSR compara tu Sharpe contra el que la búsqueda ya te regalaba, y descuenta las colas.",
    blocks: [
      {
        kind: "p",
        text: "El Sharpe probabilístico (PSR), de Bailey y López de Prado, es la probabilidad de que el Sharpe verdadero supere un obstáculo, teniendo en cuenta el largo de la muestra, la asimetría y la curtosis. El obstáculo de siempre es cero: «¿esto está arriba de nada?». No pregunta si lo elegiste de una pila.",
      },
      {
        kind: "p",
        text: "El Deflated Sharpe Ratio es el mismo aparato con otro obstáculo. SR₀ es el Sharpe que esperás del mejor de N intentos sin habilidad. La pregunta pasa a ser: ¿mi ganador está por encima de lo que el ruido, después de N búsquedas, suele entregar?",
      },
      {
        kind: "formula",
        text: "SR y T van por período. Un Sharpe anual de 1 en datos mensuales es un Sharpe mensual de 1/√12, y T son meses, no años.\n\nSi N = 1, no hubo concurso: SR₀ = 0, y el DSR es el PSR contra cero.\n\nSi N > 1:\nSR₀ ≈ √(1/(T−1)) × [ (1−γ) Φ⁻¹(1−1/N) + γ Φ⁻¹(1−1/(N·e)) ]\n\nγ ≈ 0,577 (Euler–Mascheroni).\n\nDSR = Φ( (SR − SR₀) √(T−1) / √(1 − γ₃·SR + ((γ₄−1)/4)·SR²) )",
      },
      {
        kind: "p",
        text: "γ₃ es la asimetría y γ₄ la curtosis cruda (3 si es normal). El denominador se infla con colas gordas y cuando la asimetría juega en contra del Sharpe, así que el mismo punto estima una probabilidad peor. En datos mensuales ese efecto es más chico de lo que parece, porque el Sharpe del mes es el anual dividido √12 y entra al cuadrado. Se ve con claridad cuando el período es el año y de verdad hay un retorno por año. El número que sale es una probabilidad, no otro Sharpe. «DSR = 0,97» se lee: bajo estos supuestos, hay 97% de probabilidad de que el Sharpe verdadero supere el obstáculo de la selección. Una convención de casa es exigir algo como 0,95. Debajo, el test histórico no pasa, por más linda que sea la curva.",
      },
      {
        kind: "p",
        text: "Esta versión del obstáculo usa la varianza simple de un Sharpe sin habilidad, 1/(T−1). Si de verdad corriste los N y guardaste cada Sharpe, se puede usar la varianza entre trials: el número se mueve, la idea no. Mezclar unidades —un Sharpe anual adentro de una fórmula que espera el Sharpe del período— es la forma más común de mentirle a esta cuenta.",
      },
      {
        kind: "p",
        text: "Lo que el DSR no hace: no modela un costo que te olvidaste, un look-ahead que no viste, ni un holdout que ya espiaste. Corrige selección, no-normalidad y muestra finita. Basura adentro, un DSR muy preciso afuera.",
      },
      {
        kind: "example",
        title: "El mismo backtest, dos honestidades",
        rows: [
          { k: "Dejalo en", v: "Mensual, 10 años, Sharpe anual 1, asimetría 0, curtosis 3" },
          { k: "N = 1", v: "SR₀ = 0. Le preguntás a un único intento si le gana a cero." },
          { k: "N = 100", v: "El SR₀ anualizado sube y el DSR cae. La curva no cambió." },
          { k: "Lectura", v: "Cambió cuántas veces admitís que buscaste." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: este es el filtro central. Un pase es «PASA histórico» solo si el resto de la higiene es real: sin look-ahead, con costos, con N honesto, con la regla congelada. Nunca es «funciona».",
      },
      { kind: "figure", id: "dsr" },
    ],
    questions: [
      {
        q: "El DSR es",
        options: [
          "Un Sharpe anual descontado por la inflación",
          "Una probabilidad de que el Sharpe verdadero supere el obstáculo de selección SR₀",
          "El MaxDD dividido N",
          "El p-valor de un solo test, con otro nombre",
        ],
        answer: 1,
        why: "No es un Sharpe «corregido» que se lea como 0,4 en vez de 1. Es Φ(z): una probabilidad. El Sharpe corregido, si hace falta uno, es la distancia hasta SR₀.",
      },
      {
        q: "Subís N y no tocás el backtest. ¿Qué tiene que pasar?",
        options: [
          "El DSR sube, porque hay más evidencia",
          "SR₀ sube y el DSR baja o se queda: el obstáculo de la búsqueda creció",
          "Nada: N solo afecta a Bonferroni",
          "La curtosis baja",
        ],
        answer: 1,
        why: "N no agrega datos. Agrega admisión de búsqueda. El mejor de más intentos sin edge es más alto, y tu ganador tiene que superarlo.",
      },
      {
        q: "Tenés un Sharpe anual y datos mensuales. En la fórmula entra",
        options: [
          "El Sharpe anual, y T = años",
          "El Sharpe mensual (anual / √12), y T = cantidad de meses",
          "El Sharpe anual, y T = meses",
          "El Sharpe diario, siempre",
        ],
        answer: 1,
        why: "SR y T tienen que ser del mismo período. Mezclar el anual con un T en meses infla el estadístico y fabrica pases.",
      },
      {
        q: "¿Qué NO corrige el DSR?",
        options: [
          "Una búsqueda de muchas variantes, vía N",
          "Colas gordas y asimetría, vía el denominador",
          "Una muestra corta, vía √(T−1)",
          "Un look-ahead en la construcción de la señal",
        ],
        answer: 3,
        why: "El DSR cree el Sharpe que le das. Si ese Sharpe usó el futuro, la probabilidad es sobre una estrategia que no podías operar.",
      },
    ],
  },
  {
    id: "11",
    n: 11,
    day: 6,
    title: "Pre-registro y hashes",
    minutes: 35,
    promise: "Congelar la regla antes de ver el número, y poder probar que el texto no se movió.",
    line: "El hash congela la regla. No la vuelve verdadera.",
    blocks: [
      {
        kind: "p",
        text: "Pre-registrar es escribir la decisión entera antes del dato que la va a calificar: universo, señal, tamaño, costos, lag de ejecución, qué cuenta como trial, qué estadístico pasa, cuál es la ventana de holdout. Lo que mueve el número se escribe. La motivación en prosa puede quedarse en una nota.",
      },
      {
        kind: "p",
        text: "Un hash SHA-256 de ese texto es una huella. Cambiás una letra y la huella cambia. Si la huella queda publicada —o guardada fuera de tu alcance— antes de correr el test, no podés reescribir la regla en silencio después de un gráfico feo. El hash no es evidencia de edge. Es evidencia de que la hipótesis no se reajustó. Una mala idea hasheada sigue siendo una mala idea, y además es honesta.",
      },
      {
        kind: "p",
        text: "Si la regla tiene que cambiar, se escribe una versión nueva, con un hash nuevo, y el intento viejo se queda en el ledger. No se pisa. «Era el mismo espíritu» no es el mismo texto, y el filtro come textos, no espíritus.",
      },
      {
        kind: "example",
        title: "Qué se congela",
        rows: [
          { k: "Sí", v: "Señal, universo, vol target, costo, t+1, N, umbral del DSR, fechas del holdout" },
          { k: "No hace falta", v: "El párrafo de por qué el momentum existe" },
          { k: "Si lo cambiás", v: "Hash nuevo. Trial nuevo. El viejo no se borra." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: «PASA histórico» supone que la regla que pasó es la que estaba escrita. Sin freeze, el pase puede ser el de una regla que ya vio la respuesta.",
      },
      { kind: "figure", id: "hash" },
    ],
    questions: [
      {
        q: "El hash de la regla sirve para",
        options: [
          "Demostrar que la estrategia gana dinero",
          "Detectar si el texto de la regla cambió después de congelarlo",
          "Bajar el N del ledger",
          "Reemplazar al holdout",
        ],
        answer: 1,
        why: "Es una huella. Integridad del texto, no verdad económica. Un hash lindo sobre una regla con look-ahead sigue siendo look-ahead.",
      },
      {
        q: "Después de ver el holdout cambiás el costo de 2 bp a 1 bp y rehasheás pisando el hash viejo. Eso es",
        options: [
          "Un pre-registro correcto, porque el hash nuevo cierra",
          "Una versión nueva que además esconde el intento anterior",
          "Un forward test",
          "Irrelevante, porque 1 bp es más realista",
        ],
        answer: 1,
        why: "El hash nuevo documenta el texto nuevo. Pisar el viejo borra la prueba de que hubo otra regla. El intento anterior sigue contando en N.",
      },
      {
        q: "¿Qué tiene que estar dentro del texto congelado?",
        options: [
          "Solo el nombre de la estrategia",
          "Señal, tamaño, costos, lag, umbral y qué ventana no se puede tocar",
          "La biografía del autor",
          "El Sharpe que esperás, para que el test coincida",
        ],
        answer: 1,
        why: "Se congela todo lo que mueve el número o la decisión de pasar. El Sharpe esperado, si lo usás para elegir después, no se «congela»: se filtra.",
      },
      {
        q: "Una idea mala, hasheada a tiempo,",
        options: [
          "Pasa el DSR por estar pre-registrada",
          "Sigue siendo mala; el hash solo impide reescribirla cuando decepciona",
          "No necesita forward",
          "Cuenta como N = 0",
        ],
        answer: 1,
        why: "El pre-registro ordena la inferencia. No fabrica edge. El filtro todavía puede decir que no.",
      },
    ],
  },
  {
    id: "12",
    n: 12,
    day: 6,
    title: "Futuros continuos y roll",
    minutes: 50,
    promise: "No confundir el salto de contrato con un retorno, y ubicar el carry en la curva.",
    line: "El salto de precio en el roll no es un retorno, y el carry vive en esa curva.",
    blocks: [
      {
        kind: "p",
        text: "Un futuro vence. No podés sostener el marzo hasta julio y pretender que es una sola serie de precios. El contrato front cambia. Un precio «continuo» es una construcción, no un instrumento que hayas podido comprar de punta a punta.",
      },
      {
        kind: "p",
        text: "El día del roll el contrato nuevo suele tener otro precio. Ese gap no es un PnL. Si pegás los precios crudos, te anotás una ganancia o una pérdida fantasma. En el ejemplo de abajo: vendés marzo a 104 y comprás junio a 108. Ese día tu bolsillo no se movió +4. Se movió lo que haya hecho el marzo mientras lo tenías.",
      },
      {
        kind: "p",
        text: "El back-adjust por diferencia desplaza la serie para que no salte en el roll. Los cambios de la serie ajustada se parecen al PnL de ir rolando. Los niveles pueden volverse negativos y no son precios operables: no leas un «soporte en 200» sobre un gráfico back-adjusted como si fuera el contrato. El ajuste por razón reescala en vez de restar: evita precios negativos y aproxima continuidad en porcentaje. Son series distintas. Se elige una y se congela.",
      },
      {
        kind: "p",
        text: "En la facultad el futuro sale de F = S·e^((r+u−y)T). Si la curva está cara respecto del spot más tasas —contango, el diferido por encima del front— el long no cobra un dividendo: lo paga en el roll. Backwardation es el caso inverso, diferido más barato, carry positivo para el long. Una aproximación de manual: carry ≈ precio_front / precio_diferido − 1, anualizado por el tiempo entre ambos. Si el continuo ya está armado con los rolls reales, ese carry ya está adentro de los retornos. Sumarlo otra vez es contarlo dos veces.",
      },
      {
        kind: "example",
        title: "El gap que no es tuyo",
        rows: [
          { k: "Marzo", v: "100 → 104. Eso sí es PnL del long." },
          { k: "Junio, el mismo día", v: "Cotiza 108." },
          { k: "Empalme crudo", v: "104 → 108, un +3,8% que no cobraste." },
          { k: "Back-adjust", v: "Se corre la historia anterior +4 (o junio −4; elegí una y congelala), y el día del roll la serie no salta." },
          { k: "Carry del ejemplo", v: "108 contra 104 en el tramo: contango, carry negativo para el long." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: testear tendencia y carry necesita esta distinción. La tendencia se calcula sobre el retorno continuo. El carry se calcula con la pendiente que te acabás de negar a llamar «salto de precio».",
      },
      { kind: "figure", id: "roll" },
    ],
    questions: [
      {
        q: "El día del roll el contrato nuevo cotiza 4 puntos arriba del que vendés. Ese 4",
        options: [
          "Es PnL instantáneo del long",
          "No es un retorno: es la diferencia de nivel entre dos contratos",
          "Es el MaxDD",
          "Hay que sumarlo al Sharpe anual",
        ],
        answer: 1,
        why: "Vendés uno y comprás el otro. El bolsillo no recibe el gap. Un empalme crudo se lo atribuye igual.",
      },
      {
        q: "En una serie back-adjusted por diferencia, el nivel de precio",
        options: [
          "Es el precio al que podías operar en esa fecha",
          "Puede ser artificial, incluso negativo; lo usable es el cambio",
          "Siempre coincide con el spot",
          "Ya no incluye el roll, así que hay que sumar el carry aparte sí o sí",
        ],
        answer: 1,
        why: "El ajuste preserva los cambios que se parecen al PnL rolado, no los niveles. Y si el roll ya está en esos cambios, el carry no se vuelve a sumar.",
      },
      {
        q: "Contango (diferido más caro que el front) para quien está long y rolea implica",
        options: [
          "Carry positivo",
          "Carry negativo",
          "Look-ahead",
          "Volatilidad cero",
        ],
        answer: 1,
        why: "Rolás hacia un contrato más caro. La pendiente se paga. Backwardation es el caso en que el long cobra esa pendiente.",
      },
      {
        q: "Front a 100, diferido a un año a 106. Una aproximación del carry del long es",
        options: [
          "100/106 − 1 ≈ −5,7%",
          "106/100 − 1 ≈ +6%",
          "6 puntos de PnL seguro",
          "Cero, porque todavía no operaste",
        ],
        answer: 0,
        why: "carry ≈ F_cerca / F_lejos − 1. Si el lejano está arriba, el ratio es menor que 1 y el long tiene carry negativo. No es un PnL ya realizado: es la lectura de la pendiente.",
      },
    ],
  },
  {
    id: "13",
    n: 13,
    day: 7,
    title: "Tendencia y carry",
    minutes: 50,
    promise: "Separar dos ideas clásicas, y aceptar que en el mismo mercado pueden decir lo contrario.",
    line: "Tendencia es el signo de tu propio pasado. Carry es el signo de la pendiente. Pueden disentir.",
    blocks: [
      {
        kind: "p",
        text: "Son dos hipótesis, no un menú para mezclar hasta que el backtest sonría. Las dos tienen literatura y las dos pueden morir. El trabajo es entender qué apuesta cada una antes de mirar una variante concreta.",
      },
      {
        kind: "h",
        text: "Tendencia, time-series momentum",
      },
      {
        kind: "p",
        text: "La referencia de manual es Moskowitz, Ooi y Pedersen (2012): el signo del pasado de un instrumento predice su propio futuro, en futuros y a través de clases de activo. La versión de libro: mirar el retorno de los últimos 12 meses, long si ese retorno fue positivo, short si fue negativo. Algunas implementaciones saltean el último mes, una convención heredada del momentum cruzado (12−1); si se usa, va escrita en el pre-registro. Es time-series: cada mercado contra su historia, no contra los otros. Podés estar long en todos a la vez. No es el momentum cruzado de «compro ganadores y vendo perdedores del universo».",
      },
      {
        kind: "p",
        text: "Por qué podría existir, como hipótesis y no como prueba: capital lento, presión de hedgers, subreacción. Por qué podría dejar de existir: crowding, cambio de régimen, una implementación que opera demasiado seguido y se come el edge en costos. El patrón histórico no es una promesa.",
      },
      {
        kind: "h",
        text: "Carry",
      },
      {
        kind: "p",
        text: "En futuros el carry es el retorno de la pendiente, no «el dividend yield copiado al petróleo». La referencia amplia es Koijen, Moskowitz, Pedersen y Vrugt. Una versión time-series: cada instrumento con el signo de su propio carry. Long el que está en backwardation, short el que está en contango. La tendencia pide que el movimiento pasado persista. El carry pide que la curva te pague aunque el precio no vaya a ningún lado.",
      },
      {
        kind: "example",
        title: "El mismo mercado, dos signos",
        rows: [
          { k: "Precio", v: "+14% en 12 meses" },
          { k: "Tendencia", v: "Long" },
          { k: "Curva", v: "Front 80, contrato a un año 86" },
          { k: "Carry", v: "Contango → short" },
          { k: "Qué no hacés", v: "Promediarlos después de ver cuál ganó en 2014" },
        ],
        note: "Que disientan no es un bug. Es información. Si la regla de combinación no estaba escrita antes, combinarlos es un trial nuevo.",
      },
      {
        kind: "note",
        text: "En el veredicto: un test serio usa ideas congeladas con la misma higiene, no una historia que se edita hasta calzar. Un pase de la tendencia no es un pase del carry, ni al revés.",
      },
      { kind: "figure", id: "signals" },
    ],
    questions: [
      {
        q: "Time-series momentum, en la versión de manual,",
        options: [
          "Compra los mercados que más subieron respecto de los demás",
          "Opera cada mercado según el signo de su propio retorno pasado",
          "Solo opera long",
          "Usa el precio del diferido como señal",
        ],
        answer: 1,
        why: "Es contra la propia historia. El momentum cruzado es otra estrategia, con otro N si también la probás.",
      },
      {
        q: "En el momentum cruzado clásico (12−1), ¿para qué se saltea el mes más reciente?",
        options: [
          "Para tener look-ahead controlado",
          "Para no mezclar la señal de 12 meses con el rebote de muy corto plazo",
          "Porque ese mes no tiene volumen",
          "Para bajar el MaxDD a cero",
        ],
        answer: 1,
        why: "Es la convención del momentum cruzado (Jegadeesh-Titman; Asness, Moskowitz y Pedersen), por el reversal de corto plazo entre acciones. El TSMOM de Moskowitz, Ooi y Pedersen usa los 12 meses completos. Sea cual sea la elección, tiene que estar escrita antes, no elegida porque en tu muestra quedaba mejor.",
      },
      {
        q: "Front en 80 y el contrato a un año en 86. El carry del long es",
        options: ["Positivo, porque el precio «tiene espacio»", "Negativo: la curva está en contango", "Cero hasta el vencimiento", "Igual al retorno de 12 meses"],
        answer: 1,
        why: "El diferido está más caro. Quien rolea long paga esa pendiente. La tendencia puede ser long al mismo tiempo: son apuestas distintas.",
      },
      {
        q: "Tendencia long y carry short en el mismo mercado. Lo honesto es",
        options: [
          "Quedarte con el que haya ganado en la muestra y borrar el otro",
          "Dejar los dos signos, salvo que la regla de combinación ya estuviera congelada",
          "Promediarlos siempre, porque diversifica",
          "Invertir el carry, que es menos conocido",
        ],
        answer: 1,
        why: "El disenso es el dato. Elegir el ganador después de ver es snooping. Una combinación solo vale si estaba en el pre-registro.",
      },
    ],
  },
  {
    id: "14",
    n: 14,
    day: 7,
    title: "Vol targeting y tamaño de posición",
    minutes: 45,
    promise: "Ver por qué igualar la volatilidad iguala el voto de cada mercado, y qué no iguala.",
    line: "Igualar la volatilidad iguala el voto de cada mercado. 40% es un dial congelado, no una ley.",
    blocks: [
      {
        kind: "p",
        text: "El tamaño es la estrategia. Una señal sin tamaño es un relato. En futuros, un contrato de equity index y un contrato de una tasa quieta no son el mismo riesgo, ni de casualidad. Si asignás el mismo nocional, el mercado ruidoso se queda con el libro y el test deja de ser sobre la señal: es sobre quién grita más fuerte.",
      },
      {
        kind: "formula",
        text: "peso = σ_objetivo / σ_realizada\n\nEl peso es nocional sobre capital. Arriba de 1 es leverage, normal en futuros porque se integra margen, no el nocional entero.",
      },
      {
        kind: "p",
        text: "El 40% por instrumento, en este diseño, es un dial de investigación puesto a propósito alto: para que el edge, si existe, se vea en el test, y para que cada mercado tenga una voz parecida. No es un consejo de cartera ni una constante universal. Va escrito en el pre-registro. Cambiarlo después de ver el drawdown es un trial nuevo.",
      },
      {
        kind: "example",
        title: "Misma voz, distinto nocional",
        rows: [
          { k: "Equity index", v: "σ ≈ 16% → peso = 0,40 / 0,16 = 2,5" },
          { k: "Crudo", v: "σ ≈ 32% → peso = 0,40 / 0,32 = 1,25" },
          { k: "Riesgo de cada uno", v: "peso × σ = 40% en los dos" },
          { k: "Mismo nocional", v: "El crudo aporta el doble de riesgo. El test se vuelve un test de crudo." },
        ],
      },
      {
        kind: "p",
        text: "La volatilidad se estima solo con datos disponibles en t —una ventana pasada, por ejemplo 63 días—. La volatilidad de toda la muestra es un look-ahead silencioso. Y ojo con el segundo piso: igualar instrumentos no te capa el libro. Si diez mercados correlacionados están todos long, la vol del conjunto puede pasar el 40% con holgura. Un escalar a nivel libro es otra regla, y también se congela. No se «descubre» al final porque el gráfico quedó demasiado salvaje.",
      },
      {
        kind: "p",
        text: "El vol targeting además cambia la apuesta entre regímenes: después de un salto de volatilidad tenés menos posición. No es un envoltorio neutro. Es parte de la idea que estás testeando.",
      },
      {
        kind: "note",
        text: "En el veredicto: el pase es de la señal con este tamaño, no de la señal en abstracto. Otro target es otra estrategia, con otro drawdown y otro lugar en el ledger.",
      },
      { kind: "figure", id: "volt" },
    ],
    questions: [
      {
        q: "Un instrumento tiene volatilidad realizada de 16% y el objetivo es 40%. El peso es",
        options: ["0,40", "1", "2,5", "0,16"],
        answer: 2,
        why: "0,40 / 0,16 = 2,5 veces el capital en nocional. En futuros eso se sostiene con margen. El riesgo apuntado es 2,5 × 16% = 40%.",
      },
      {
        q: "¿Por qué no alcanza con el mismo nocional en cada mercado?",
        options: [
          "Porque los contratos no vencen el mismo día",
          "Porque el de mayor volatilidad se queda con el riesgo y el test deja de hablar de la señal",
          "Porque el nocional no se puede calcular en futuros",
          "Porque el DSR exige pesos enteros",
        ],
        answer: 1,
        why: "Igualar dólares no iguala riesgo. El vol targeting le da a cada instrumento un voto parecido.",
      },
      {
        q: "Usar la volatilidad de toda la muestra para el tamaño de 2012 es",
        options: [
          "Más estable, y por eso preferible",
          "Look-ahead: esa volatilidad incluye el futuro",
          "Obligatorio para el DSR",
          "Equivalente a un costo",
        ],
        answer: 1,
        why: "El tamaño de 2012 solo puede usar lo que ya había pasado. La ventana tiene que terminar antes de la orden.",
      },
      {
        q: "Diez mercados vol-targeteados al 40%, todos long y correlacionados. El libro",
        options: [
          "Queda en 40% sí o sí",
          "Puede quedar bien por encima de 40%: igualar instrumentos no capa el conjunto",
          "Queda en 4%",
          "Tiene MaxDD cero",
        ],
        answer: 1,
        why: "40% es por instrumento. La suma correlacionada es otro problema, y si la vas a escalar, esa regla también se pre-registra.",
      },
    ],
  },
  {
    id: "15",
    n: 15,
    day: 8,
    title: "Costos y turnover",
    minutes: 40,
    promise: "Convertir la cantidad de vueltas del libro en Sharpe que desaparece.",
    line: "El turnover convierte un edge bruto en otro. Al filtro entra el neto.",
    blocks: [
      {
        kind: "p",
        text: "Turnover es cuánto nocional operás por unidad de tiempo. Una señal mensual que da vuelta el libro puede andar por las 12 vueltas de un lado por año. Una señal diaria puede ir a cientos. El edge por operación se compara contra lo que cuesta cruzar: spread, comisión, slippage, y el costo del propio roll.",
      },
      {
        kind: "formula",
        text: "costo_anual ≈ vueltas de un lado × costo por vuelta\n\narrastre en Sharpe ≈ costo_anual / σ_del_libro\n\nSharpe neto ≈ Sharpe bruto − arrastre",
      },
      {
        kind: "p",
        text: "El mismo costo en dinero no es el mismo costo en Sharpe. Un 2% de drag sobre un libro al 40% de vol son 0,05 de Sharpe. Sobre un libro al 10% son 0,20. El vol target alto esconde costos en unidades de Sharpe: por eso se muestran las dos cosas, el drag en retorno y el drag en Sharpe. Lo que se presenta al filtro es el neto. Un pase bruto no es un pase.",
      },
      {
        kind: "example",
        title: "La misma idea, dos implementaciones",
        rows: [
          { k: "Bruto", v: "Sharpe 0,55. Vol del libro 40%." },
          { k: "Rápida", v: "200 vueltas, 4 bp. Costo = 8% . Arrastre = 0,08/0,40 = 0,20. Neto = 0,35." },
          { k: "Lenta", v: "12 vueltas, 1 bp. Costo = 0,12%. Arrastre ≈ 0,003. Neto ≈ 0,55." },
          { k: "Lectura", v: "No cambió la historia. Cambió cuántas veces pagás para contarla." },
        ],
        note: "En futuros grandes, 1 bp puede ser realista si no sos enorme. En cripto o en un commodity fino, 4 bp se quedan cortos y una señal charlatana se come el edge entero.",
      },
      {
        kind: "note",
        text: "En el veredicto: «PASA histórico» es sobre el neto de la implementación congelada. Bajar el costo después de ver que si no, no pasa, es otro trial —y suele ser una mentira.",
      },
      { kind: "figure", id: "cost" },
    ],
    questions: [
      {
        q: "Libro al 40% de vol, costo anual del 8% en retorno. El arrastre en Sharpe es",
        options: ["0,08", "0,20", "0,40", "8"],
        answer: 1,
        why: "0,08 / 0,40 = 0,20. El costo se traduce a Sharpe dividiendo por la volatilidad del libro, no restándolo directo del Sharpe.",
      },
      {
        q: "El mismo costo en retorno le pega más al Sharpe cuando",
        options: [
          "La volatilidad del libro es más baja",
          "La volatilidad del libro es más alta",
          "El MaxDD es cero",
          "N es 1",
        ],
        answer: 0,
        why: "El arrastre es costo / σ. A igual costo, un libro quieto pierde más Sharpe que uno ruidoso. Por eso un target alto puede disimular costos si solo mirás el Sharpe.",
      },
      {
        q: "¿Qué número enfrenta al DSR?",
        options: [
          "El Sharpe bruto, porque el costo es opinable",
          "El Sharpe neto de la implementación que estaba escrita",
          "El máximo entre bruto y neto",
          "El Sharpe del mejor mes",
        ],
        answer: 1,
        why: "El filtro opina sobre la estrategia que podías operar. Sin costos, es otra estrategia, más cara de lo que el informe admite.",
      },
      {
        q: "Una señal de tendencia lenta en un futuro líquido y la misma lógica operada todos los días con 5 bp",
        options: [
          "Tienen el mismo veredicto, porque la idea es la misma",
          "Pueden tener veredictos distintos: el turnover es parte de la estrategia",
          "La diaria siempre gana, porque hay más datos",
          "La lenta no se puede testear",
        ],
        answer: 1,
        why: "La idea económica no es la implementación. La cantidad de vueltas decide si queda algo después de pagar.",
      },
    ],
  },
  {
    id: "16",
    n: 16,
    day: 8,
    title: "Forward test en papel",
    minutes: 35,
    promise: "Ubicar el único tramo cuyo dato no existía cuando escribiste la regla.",
    line: "El forward es el único tramo cuyo dato no existía cuando escribiste la regla.",
    blocks: [
      {
        kind: "p",
        text: "Todo lo anterior es disciplina sobre un pasado que igual podés mirar. El forward es el tramo que no pudiste ajustar: desde el día en que la regla quedó congelada, hacia fechas que todavía no habían pasado.",
      },
      {
        kind: "p",
        text: "En papel quiere decir registrar, en tiempo real, la señal, el fill que correspondía en t+1, el costo y el PnL, sin mandar riesgo si es una prueba. No se edita la señal de ayer porque la barra de hoy quedó fea. No se «reconstruye» el forward el domingo a la noche con el gráfico ya completo: eso es un backtest con otro nombre.",
      },
      {
        kind: "p",
        text: "Lo que puede confirmar: que el proceso, en tiempo virgen, se parece a lo que el histórico decía. Lo que no puede: tres meses quietos no prueban un Sharpe de 0,6, ni lo matan. La potencia sigue valiendo. El punto es higiene, y acumular tiempo que no estaba en tus manos.",
      },
      {
        kind: "p",
        text: "El fracaso típico: el forward arranca, sale mal, se retoca la regla y se reinicia el reloj como si el tramo feo no hubiera ocurrido. Eso es un trial nuevo. La ventana fallida se queda en el ledger. El reloj solo vuelve a cero como un pre-registro nuevo, no como una amnesia.",
      },
      {
        kind: "note",
        text: "En el veredicto: acá se corta la frase. Histórico filtrado, forward todavía no vivido. «Funciona» sería una oración en futuro. Un informe honesto no la dice.",
      },
      { kind: "figure", id: "fwd" },
    ],
    questions: [
      {
        q: "Un forward test es distinto de un holdout porque",
        options: [
          "Usa más parámetros",
          "El dato del tramo no existía en el momento de congelar la regla",
          "No lleva costos",
          "Siempre dura un año",
        ],
        answer: 1,
        why: "El holdout ya estaba en el disco, aunque no lo miraras. El forward es tiempo que todavía no había sucedido. Esa es la diferencia de tiempo verbal.",
      },
      {
        q: "«En papel» implica",
        options: [
          "Imaginar el PnL al final del mes",
          "Registrar señal y fill de t+1 a medida que el tiempo ocurre",
          "Operar el doble de tamaño",
          "Saltear el ledger",
        ],
        answer: 1,
        why: "Es un log en tiempo real. Reconstruir el día con la barra ya cerrada y la señal «la que yo habría mandado» es demasiado fácil de editar.",
      },
      {
        q: "Tres meses de forward en contra",
        options: [
          "Refutan un Sharpe de 0,5",
          "No alcanzan para establecer ni para matar un Sharpe modesto; el tramo igual no se borra",
          "Obligan a cambiar el lookback",
          "Cuentan como N = 0 si no los publicás",
        ],
        answer: 1,
        why: "La potencia de tres meses es mínima. Lo que no es mínimo es la higiene: ese tramo ya se usó. Retocar y reiniciar es un intento nuevo, y el viejo queda.",
      },
      {
        q: "El forward sale feo, cambiás la regla y arrancás de nuevo sin anotar la ventana. Eso",
        options: [
          "Es el protocolo correcto de un paper test",
          "Gasta el tramo y esconde un trial",
          "Convierte el resultado en DSR = 1",
          "Es un control positivo",
        ],
        answer: 1,
        why: "El reloj no se olvida porque lo reinicies. La ventana fallida es evidencia, y el cambio de regla es otro renglón del ledger.",
      },
    ],
  },
  {
    id: "17",
    n: 17,
    day: 9,
    title: "Potencia estadística",
    minutes: 45,
    promise: "Estimar cuántos años hacen falta para que un Sharpe sea siquiera discutible.",
    line: "t ≈ Sharpe × √años. Siete años de cripto no alcanzan solos para un Sharpe modesto.",
    blocks: [
      {
        kind: "p",
        text: "La potencia es la probabilidad de ver el edge si de verdad está. Con poca historia, un Sharpe verdadero de 0,5 es casi invisible: vas a decir «acá no hay nada» muchas veces en las que sí hay, y un tramo corto con suerte igual puede gritar. Los dos errores viven en la muestra chica.",
      },
      {
        kind: "formula",
        text: "t ≈ Sharpe_anual × √años\n\nSale del t de la media. Como el Sharpe es media / vol, la vol se cancela y el tiempo queda bajo raíz. Asume retornos más o menos iid, y una sola estrategia escrita de antemano. No descuenta N, ni colas, ni costos. Es una regla, no un escudo.",
      },
      {
        kind: "p",
        text: "La memoria usa t ≈ 2, al lado del 1,96 de un test bilateral al 5%. No es un umbral mágico: es para no olvidar que el tiempo entra bajo raíz. Los años que hacen falta, si querés ese 2, son aproximadamente (2 / Sharpe)². Un Sharpe de 1 pide unos 4 años. Uno de 0,5 pide unos 16. Uno de 0,3 pide décadas.",
      },
      {
        kind: "example",
        title: "Por qué el cripto no alcanza solo",
        rows: [
          { k: "Regla", v: "√7 ≈ 2,65. Entonces t ≈ 2,65 × Sharpe." },
          { k: "Sharpe 0,7", v: "t ≈ 1,85. Ni siquiera un test ingenuo, único y normal, lo separa bien del ruido." },
          { k: "Sharpe 1", v: "t ≈ 2,65. Sugestivo para un único test. Frágil si hubo una búsqueda, y peor con colas de cripto." },
          { k: "Futuros", v: "La misma regla, sobre décadas, es el test histórico. El cripto puede motivar. No cierra la evidencia solo." },
        ],
        note: "La potencia corta para los dos lados. Fallar en 7 años un Sharpe chico no prueba que el edge sea cero. Pasar en 7 años tampoco prueba que sea real.",
      },
      {
        kind: "note",
        text: "En el veredicto: un «PASA histórico» sobre una muestra que no tiene potencia es un pase de ruido con buena prensa. Los futuros largos son lo que vuelve posible la frase. Igual no reemplazan al forward.",
      },
      { kind: "figure", id: "power" },
    ],
    questions: [
      {
        q: "Sharpe anual 0,8 durante 7 años. La regla rápida da un t de",
        options: ["0,8", "1,6", "Cerca de 2,1", "5,6"],
        answer: 2,
        why: "0,8 × √7 ≈ 0,8 × 2,65 ≈ 2,12. Recién ahí un test único y limpio empieza a despegarse del 5%.",
      },
      {
        q: "¿Cuántos años pide, en la regla del t ≈ 2, un Sharpe de 0,5?",
        options: ["2", "4", "8", "16"],
        answer: 3,
        why: "años ≈ (2 / 0,5)² = 16. Por eso una muestra de un ciclo no alcanza para edges modestos, que son los que de verdad existen cuando existen.",
      },
      {
        q: "No encontrás nada en 7 años para un Sharpe verdadero de 0,4. Eso",
        options: [
          "Prueba que el edge es cero",
          "Es poco potente: la ausencia de evidencia no es evidencia fuerte de ausencia",
          "Equivale a un DSR de 0,95",
          "Obliga a subir N",
        ],
        answer: 1,
        why: "t verdadero ≈ 0,4 × √7 ≈ 1,06. Vas a fallar en verlo la mayoría de las veces aunque esté. Un «no» corto es débil.",
      },
      {
        q: "¿Por qué el test histórico de la regla se apoya en futuros y no solo en 7 años de cripto?",
        options: [
          "Porque el cripto no tiene volatilidad",
          "Porque con un Sharpe modesto, 7 años no dan un t creíble, y las colas lo empeoran",
          "Porque los futuros no necesitan costos",
          "Porque el DSR solo acepta datos anteriores a 2010",
        ],
        answer: 1,
        why: "Siete años alcanzan para un Sharpe enorme y limpio, que es raro. Para el tamaño de edge que tiene sentido discutir, la raíz de 7 se queda corta. Décadas de futuros son el banco de prueba; el cripto, solo, no.",
      },
    ],
  },
  {
    id: "18",
    n: 18,
    day: 9,
    title: "Controles positivos y de falsos positivos",
    minutes: 50,
    promise: "No creerle a un banco de pruebas que no vio un edge plantado y que deja pasar al ruido.",
    line: "El banco tiene que ver el edge plantado y rechazar los que no tienen edge, antes de creerle al test de las reglas reales.",
    blocks: [
      {
        kind: "p",
        text: "Un arnés que nunca fue testeado firma PASS con un bug adentro, y lo firma con la misma cara con la que firmaría un edge. Antes de creerle a la tendencia o al carry, el motor se corre contra casos cuyo resultado ya conocés.",
      },
      {
        kind: "h",
        text: "Control positivo",
      },
      {
        kind: "p",
        text: "Le metés una estrategia con edge porque vos lo pusiste. Puede ser una serie sintética con drift, o una señal a la que dejás ver el retorno siguiente —un look-ahead a propósito—. El arnés tiene que detectarla. Si el edge plantado sale «no hay nada», tu estadístico, tus costos o tu código se están comiendo la señal. No se sigue.",
      },
      {
        kind: "h",
        text: "Control de falsos positivos",
      },
      {
        kind: "p",
        text: "Cincuenta estrategias sin edge: signos al azar, o señales desalineadas del mercado. El arnés no tiene que aprobar ninguna. Con un p < 0,05 pelado, algunas de las 50 van a pasar igual: es lo que el día 5 ya calculó. Eso significa que el botón, usado así, no hace el trabajo que creés. El filtro —N cableado, DSR, el ledger— es lo que tiene que llevar esos pases a esencialmente cero. Si un nulo igual pasa, la barra está floja o N no está conectado.",
      },
      {
        kind: "p",
        text: "El orden del test es este: controles primero, reglas pre-registradas después. Nunca al revés. Un DSR verde sobre la tendencia no significa nada si el mismo botón se pone verde sobre ruido.",
      },
      {
        kind: "example",
        title: "Lo que el widget tiene que mostrar",
        rows: [
          { k: "Plantada", v: "30 años, Sharpe verdadero cerca de 1, registrada como control (N = 1 para ella)." },
          { k: "Test ingenuo", v: "La plantada pasa, y algunas de las 50 también." },
          { k: "Filtro", v: "La plantada sigue pasando. Las 50, con N = 50, no." },
          { k: "Si no pasa eso", v: "No se testean las reglas reales. Se arregla el motor." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: el histórico se puede decir en voz alta cuando la higiene está, el filtro pasa, y el arnés demuestra que sabe ver un edge y rechazar los falsos. El forward sigue abierto. Por eso la frase es «PASA histórico, pendiente de forward», y nunca «funciona».",
      },
      { kind: "figure", id: "harness" },
    ],
    questions: [
      {
        q: "Un control positivo es",
        options: [
          "La mejor variante del in-sample",
          "Una estrategia con edge plantado a propósito, que el arnés está obligado a detectar",
          "Un forward de tres meses",
          "Un Sharpe negativo",
        ],
        answer: 1,
        why: "Si el motor no ve un edge que vos escondiste en los datos, no podés interpretar un «no pasa» sobre las reglas reales: capaz no ve nada.",
      },
      {
        q: "Cincuenta estrategias de ruido puro y un umbral p < 0,05. Lo esperable es",
        options: [
          "Que no pase ninguna, porque no tienen edge",
          "Que pasen algunas: alrededor de 0,05 × 50",
          "Que pasen las 50",
          "Que el DSR dé 1 en todas",
        ],
        answer: 1,
        why: "El 5% de los nulos cruza un 5%, por construcción. Un arnés que usa ese corte pelado va a aprobar suerte. Por eso el control existe.",
      },
      {
        q: "El control de falsos positivos falla si",
        options: [
          "La estrategia plantada es detectada",
          "Alguna estrategia sin edge aprueba el filtro que vas a usar en serio",
          "El MaxDD de la plantada es alto",
          "N está cableado y los nulos no pasan",
        ],
        answer: 1,
        why: "El filtro de producción tiene que dejar la tasa de falsos pases en esencialmente cero sobre el banco de ruido. Si un nulo pasa, la barra no sirve todavía.",
      },
      {
        q: "¿En qué orden se corre el test de las reglas reales?",
        options: [
          "Primero la tendencia, y si pasa se construye el arnés",
          "Primero los controles del motor, después las reglas pre-registradas",
          "Primero el forward, después el histórico",
          "El orden no importa si el DSR da 0,95",
        ],
        answer: 1,
        why: "Un verde sobre la idea real no se puede leer si no sabés que el mismo botón rechaza el ruido y detecta el edge plantado. Los controles van antes.",
      },
    ],
  },
];
