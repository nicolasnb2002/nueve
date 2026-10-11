import type { Concept } from "@/data/types";

export const part1: Concept[] = [
  {
    id: "01",
    n: 1,
    day: 1,
    title: "Distribución de retornos y volatilidad",
    minutes: 45,
    promise:
      "Leer media, desvío, asimetría y curtosis como la forma de la curva, no como adorno de un reporte.",
    line: "Un Sharpe sin la forma de la distribución es un resumen incompleto.",
    blocks: [
      {
        kind: "p",
        text: "De la facultad ya tenés el retorno, la media y la varianza. El salto es este: casi todo el edificio de un backtest —el Sharpe, el vol targeting, el p-valor— trata a esa curva como si fuera una campana. Los mercados no lo son. Antes de creer un número de performance tenés que saber qué forma lo pagó.",
      },
      {
        kind: "h",
        text: "Cuatro lecturas, no una",
      },
      {
        kind: "p",
        text: "La media es el centro. Una estrategia puede tener una media linda y aun así ser una mala apuesta si el daño vive en un solo mes. La volatilidad es el desvío estándar de los retornos. Anualizar un desvío mensual, si los retornos fueran independientes, es multiplicar por √12, no por 12. Anualizar un desvío diario es multiplicar por √252. Esa raíz es una traducción, no una ley: con colas gordas y rachas, el año no se comporta como doce meses independientes pegados.",
      },
      {
        kind: "formula",
        text: "σ_anual ≈ σ_período × √k\n\nk = 12 si el período es un mes, 252 si es un día de mercado.",
      },
      {
        kind: "p",
        text: "La asimetría (skew) dice qué cola es más larga. Negativa: la izquierda, la que duele. Positiva: la derecha, la de los pocos aciertos grandes. En la literatura de futuros, el momentum de series de tiempo suele cargar asimetría positiva (muchas pérdidas chicas, pocas ganancias grandes) y el carry o el short de volatilidad suelen cargar la negativa. Es un hecho estilizado, no una garantía de la fase 3.",
      },
      {
        kind: "p",
        text: "La curtosis mide cuánta masa hay en las colas, no en qué dirección. Una normal tiene curtosis 3. Los retornos de mercado suelen estar bastante por encima. Un día de «seis sigma» bajo una normal es un evento de museo. Bajo una curtosis de 8 es un martes posible. Por eso un modelo que solo usa media y varianza se queda corto justo donde se pierde el dinero.",
      },
      {
        kind: "example",
        title: "Cinco meses, a mano",
        rows: [
          { k: "Retornos", v: "+2, +1, 0, +3, −8" },
          { k: "Media", v: "(2+1+0+3−8) / 5 = −0,4" },
          { k: "Lo que esconde", v: "Cuatro meses verdes y un −8 que se lleva la historia" },
        ],
        note: "Si solo mirás la media, el mes que importa ya desapareció. La volatilidad lo va a inflar, pero tampoco te dice que el daño fue para un solo lado. Eso es la asimetría.",
      },
      {
        kind: "note",
        text: "En el veredicto: el Deflated Sharpe no mira solo la altura del Sharpe. El denominador crece cuando la asimetría trabaja en contra y cuando las colas están gordas. La forma es parte del filtro, no un anexo.",
      },
      { kind: "figure", id: "dist" },
    ],
    questions: [
      {
        q: "Un desvío mensual de 2% se anualiza, bajo el supuesto iid, como",
        options: [
          "2% × 12 = 24%",
          "2% × √12 ≈ 6,9%",
          "2% / √12 ≈ 0,6%",
          "2%, porque la volatilidad no se anualiza",
        ],
        answer: 1,
        why: "El tiempo entra bajo raíz. Multiplicar por 12 confunde varianza con desvío: la varianza sí escala con el tiempo, el desvío con su raíz.",
      },
      {
        q: "Asimetría negativa significa",
        options: [
          "Que la media es negativa",
          "Que la volatilidad es baja",
          "Que la cola izquierda es más larga que la derecha",
          "Que la curtosis es exactamente 3",
        ],
        answer: 2,
        why: "La media puede ser positiva y la asimetría negativa: es el caso típico de una estrategia que gana seguido y de vez en cuando entrega un golpe grande.",
      },
      {
        q: "¿Qué curtosis tiene una distribución normal?",
        options: ["0", "1", "3", "12"],
        answer: 2,
        why: "Curtosis 3 es la normal (exceso de curtosis 0). Por encima de 3, las colas están más gordas que la campana. Ojo: algunos softwares reportan el exceso, no la curtosis cruda.",
      },
      {
        q: "Dos estrategias tienen la misma media y el mismo desvío. Una tiene asimetría −1,5 y la otra 0. ¿Cuál desconfía más un filtro que mira la forma de la distribución?",
        options: [
          "Ninguna: el Sharpe ya las resume",
          "La de asimetría 0, porque es «demasiado normal»",
          "La de asimetría −1,5, porque la cola izquierda hace menos creíble el mismo Sharpe",
          "La de asimetría −1,5 solo si la media es negativa",
        ],
        answer: 2,
        why: "En el DSR la asimetría entra al denominador. Un Sharpe armado con cola izquierda fea no vale lo mismo que uno simétrico, aunque el cociente media/desvío coincida.",
      },
    ],
  },
  {
    id: "02",
    n: 2,
    day: 1,
    title: "Drawdown y MaxDD",
    minutes: 40,
    promise: "Medir la herida desde el pico, y separar la profundidad del tiempo que tardó en cerrar.",
    line: "El MaxDD se mide desde el pico, y el tiempo bajo el agua no está en el Sharpe.",
    blocks: [
      {
        kind: "p",
        text: "El drawdown no es «el peor mes» ni «cuánto caíste desde que empezaste». Es cuánto está la curva por debajo de su propio máximo hasta ese momento. El máximo drawdown, MaxDD, es la peor de esas caídas relativas.",
      },
      {
        kind: "formula",
        text: "DD(t) = ( pico(t) − equity(t) ) / pico(t)\n\nMaxDD = el máximo de DD(t) en toda la muestra",
      },
      {
        kind: "p",
        text: "Hay dos relojes distintos. La profundidad es ese porcentaje. La duración es cuántos períodos van del pico al valle, y la recuperación es cuántos más hacen falta para que la curva vuelva a ese mismo pico —no al capital inicial. Podés estar arriba del punto de partida y, aun así, adentro de un drawdown.",
      },
      {
        kind: "example",
        title: "A mano, sin gráfico",
        rows: [
          { k: "Camino", v: "100 → 130 → 91 → 130" },
          { k: "Error típico", v: "(100 − 91) / 100 = 9%" },
          { k: "MaxDD", v: "(130 − 91) / 130 = 30%" },
          { k: "Recuperación", v: "Cuando vuelve a 130, no cuando vuelve a 100" },
        ],
        note: "El 9% es la pérdida contra el origen. El 30% es lo que viviste si entraste cerca del pico, que es lo que le pasa a casi cualquiera que llega tarde a una curva.",
      },
      {
        kind: "p",
        text: "El Sharpe no contiene este número. Dos curvas con el mismo Sharpe pueden tener un MaxDD tolerable o uno que no se puede holdear. En un libro con volatilidad objetivo alta —el 40% por instrumento del diseño— un MaxDD profundo no es una sorpresa matemática: es la pregunta de si el edge, si existe, es operable por un humano. Reportar el retorno sin el MaxDD y sin el tiempo bajo el agua es contar solo la mitad.",
      },
      {
        kind: "note",
        text: "En el veredicto: «PASA histórico» no dice que la caída sea chica. Dice que la regla, con su drawdown incluido, sobrevivió el filtro. Si el MaxDD no se puede aguantar, el problema es de tamaño, y el tamaño se congela antes, no después de ver la herida.",
      },
      { kind: "figure", id: "dd" },
    ],
    questions: [
      {
        q: "La curva hace 100 → 130 → 91. ¿Cuál es el drawdown en 91?",
        options: ["9%", "30%", "39 puntos, sin dividir", "70%"],
        answer: 1,
        why: "El pico es 130, no 100. (130 − 91) / 130 = 0,30. Medir contra el origen esconde la caída que importa.",
      },
      {
        q: "Estás en 110, el pico fue 140 y arrancaste en 100. ¿Seguís en drawdown?",
        options: [
          "No, porque estás arriba del capital inicial",
          "No, porque el último mes fue positivo",
          "Sí, porque todavía no recuperaste el pico de 140",
          "Solo si el Sharpe es negativo",
        ],
        answer: 2,
        why: "El drawdown se cierra cuando la curva hace un nuevo máximo respecto de ese pico. Estar en verde contra el inicio no alcanza.",
      },
      {
        q: "¿Qué NO está dentro del Sharpe?",
        options: [
          "La relación entre media y volatilidad",
          "El tiempo que la curva tarda en recuperar un pico",
          "Una penalización implícita si la volatilidad sube y la media no",
          "La escala: un Sharpe no tiene unidad de dinero",
        ],
        answer: 1,
        why: "El Sharpe comprime media y desvío. Dos caminos con los mismos retornos reordenados pueden tener Sharpes parecidos y recuperaciones muy distintas. La duración del drawdown es otra estadística.",
      },
      {
        q: "MaxDD es",
        options: [
          "El peor retorno de un período",
          "La peor caída relativa desde el pico vigente",
          "La suma de todos los meses negativos",
          "El drawdown promedio",
        ],
        answer: 1,
        why: "Es un máximo de caídas pico-a-valle, en porcentaje del pico. Ni el peor mes ni la suma de los rojos.",
      },
    ],
  },
  {
    id: "03",
    n: 3,
    day: 2,
    title: "Backtest y sus sesgos",
    minutes: 50,
    promise: "Nombrar tres maneras concretas en que una curva linda usa información que no tenías.",
    line: "Look-ahead, supervivencia y ejecutar en la misma barra fabrican un edge que no podías mandar al mercado.",
    blocks: [
      {
        kind: "p",
        text: "Un backtest es una simulación de decisiones. Cada decisión tiene una hora. El sesgo aparece cuando la simulación usa, a esa hora, algo que en la vida real todavía no existía, o cuando el universo de mercados ya fue elegido por el futuro.",
      },
      {
        kind: "h",
        text: "Look-ahead",
      },
      {
        kind: "p",
        text: "Look-ahead es usar datos del futuro sin querer. El caso grosero es operar el cierre de hoy con una señal que necesita ese mismo cierre. Los casos finos duelen más: estandarizar un z-score con la media y el desvío de toda la muestra; usar la volatilidad realizada del año completo para el tamaño de enero; tomar un dato macro ya revisado, no el que se publicó ese día; elegir el calendario de rolls con el contrato que «terminó siendo» el líquido. Si el número no estaba en el disco a la hora de la orden, no entra en la señal.",
      },
      {
        kind: "h",
        text: "Sesgo de supervivencia",
      },
      {
        kind: "p",
        text: "Es definir el universo al final. En acciones es clásico: solo quedan las que no quebraron. En futuros los contratos vencen igual, así que el sesgo no es «el marzo expiró». El sesgo es armar la lista de mercados con los que hoy son líquidos e interesantes, y borrar los que existían, se secaron o perdieron dinero hasta desaparecer del radar. También es supervivencia quedarte, después de mirar, solo con los parámetros que «sobrevivieron».",
      },
      {
        kind: "h",
        text: "Ejecución en t+1",
      },
      {
        kind: "p",
        text: "La convención honesta por defecto: la señal se calcula con información hasta el cierre de t, y la orden se ejecuta en t+1 (el open, o el close siguiente, congelado de antemano). Llenar en el cierre de t supone que operaste el precio que fabricó la señal, cuando ese precio recién existe al terminar la barra. Sin un modelo intradiario de verdad, t+1 es la regla. Se nombra porque es la diferencia entre una curva que se puede discutir y una que ya se mintió.",
      },
      {
        kind: "example",
        title: "La misma señal, dos relojes",
        rows: [
          { k: "Señal", v: "signo del retorno de la barra" },
          { k: "Trampa", v: "Ese signo opera esa misma barra: cobrás siempre el valor absoluto" },
          { k: "Honesto", v: "El signo de ayer opera el retorno de hoy" },
          { k: "Qué pasa", v: "La trampa parece un edge enorme. El t+1, sobre ruido, da una curva chata" },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: ningún DSR arregla un look-ahead. El filtro asume que el Sharpe que le entregás es el de una regla ejecutable. Si la ejecución es en la misma barra, el «PASA» habla de una estrategia que no existió.",
      },
      { kind: "figure", id: "leak" },
    ],
    questions: [
      {
        q: "¿Cuál de estas es look-ahead?",
        options: [
          "Usar el cierre de t para operar el cierre de t+1",
          "Estimar la volatilidad con los 63 días anteriores a t",
          "Normalizar la señal de 2012 con la media y el desvío de 2000–2024",
          "Descontar un costo fijo por operación",
        ],
        answer: 2,
        why: "La media de toda la muestra incluye años que en 2012 no habían ocurrido. Las otras tres respetan el reloj.",
      },
      {
        q: "En futuros, el sesgo de supervivencia aparece sobre todo cuando",
        options: [
          "Un contrato vence y lo rolás al siguiente",
          "Armás el universo con los mercados que hoy son líquidos, olvidando los que se secaron",
          "Operás en t+1",
          "El precio back-adjusted se vuelve negativo",
        ],
        answer: 1,
        why: "Que el contrato venza es mecánica, no sesgo. El sesgo es elegir la lista de mercados —o de parámetros— con información de quién sobrevivió.",
      },
      {
        q: "«Ejecución en t+1» quiere decir",
        options: [
          "Operar dos veces",
          "La señal de t recién se manda al mercado en la barra siguiente",
          "Usar el dato de mañana y dividirlo por dos",
          "Esperar un día para calcular el Sharpe",
        ],
        answer: 1,
        why: "Es un lag de ejecución. Evita llenar la orden al precio que generó la señal.",
      },
      {
        q: "Una señal igual al signo del retorno de hoy, llenada al cierre de hoy,",
        options: [
          "Es momentum clásico y se puede operar",
          "Gana el valor absoluto del retorno: no es una estrategia, es una trampa",
          "Es conservadora, porque espera al cierre",
          "Equivale a un holdout",
        ],
        answer: 1,
        why: "signo(r) × r = |r|. Siempre positivo. El gráfico de abajo lo muestra al lado de la versión con el signo de ayer.",
      },
    ],
  },
  {
    id: "04",
    n: 4,
    day: 2,
    title: "In-sample, validación y holdout",
    minutes: 40,
    promise: "Explicar por qué se parten los datos, y por qué un holdout ya mirado no se puede devolver.",
    line: "El holdout que miraste y después corregiste dejó de ser holdout.",
    blocks: [
      {
        kind: "p",
        text: "Si la misma muestra elige la regla y además la califica, la nota es un folleto. Por eso se parte el tiempo. Los nombres importan menos que lo que cada tramo tiene permitido hacerte.",
      },
      {
        kind: "ul",
        items: [
          "In-sample: donde diseñás. Mirás el gráfico, cambiás de opinión, tirás variantes. Está contaminado por tus ojos. Sirve para construir la hipótesis, no para firmarla.",
          "Validación: un tramo para elegir entre pocas alternativas que ya estaban escritas (lookback 6 contra 12, por ejemplo). Sigue siendo un intento. No es virgen.",
          "Holdout: se toca una vez, al final, con la regla congelada. Una sola lectura.",
        ],
      },
      {
        kind: "p",
        text: "El accidente más común no es olvidarse de partir. Es partir, mirar el holdout, que no guste, y volver al in-sample a «ajustar un detalle». En ese momento el holdout se convierte en validación y te quedaste sin muestra intacta. No se puede des-ver. La reparación no es prometer que la próxima vas a ser más cuidadoso sobre los mismos años. La reparación es un tramo de datos que todavía no existen —el forward— o admitir que el número ya es in-sample.",
      },
      {
        kind: "p",
        text: "Una validación tampoco es gratis. Elegir el ganador entre cinco lookbacks es una búsqueda de tamaño cinco. Ese cinco entra al ledger de intentos. «Solo miré la validación para elegir» es exactamente la definición de un trial.",
      },
      {
        kind: "example",
        title: "El día que el holdout muere",
        rows: [
          { k: "Lunes", v: "Regla congelada. Holdout todavía cerrado." },
          { k: "Martes", v: "Lo abrís. El Sharpe cae a 0,2." },
          { k: "Miércoles", v: "Pasás el lookback de 12 a 9 «porque tiene más sentido»." },
          { k: "Estado", v: "El miércoles ya no tenés holdout. Tenés un segundo in-sample." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: «PASA histórico» solo puede apoyarse en una lectura que no haya reescrito la regla. Si el holdout se gastó, lo honesto es no usar esa frase.",
      },
      { kind: "figure", id: "splits" },
    ],
    questions: [
      {
        q: "¿Para qué se separan in-sample y holdout?",
        options: [
          "Para duplicar la cantidad de datos",
          "Para que la muestra que pone la nota no sea la misma que eligió la regla",
          "Porque el holdout siempre tiene más volatilidad",
          "Para poder reoptimizar dos veces",
        ],
        answer: 1,
        why: "La separación es una defensa contra calificarte con el mismo examen que usaste para estudiar. No crea información nueva.",
      },
      {
        q: "Elegís el lookback ganador en la muestra de validación. Eso",
        options: [
          "No cuenta como intento, porque no es el holdout",
          "Cuenta como intento: la validación también se gasta",
          "Convierte el in-sample en forward",
          "Anula la necesidad de un ledger",
        ],
        answer: 1,
        why: "Cada elección informada por un resultado es un trial. La validación existe para gastar pocos, no para gastar cero.",
      },
      {
        q: "Mirás el holdout, no te cierra, y cambiás un parámetro. ¿Qué pasó?",
        options: [
          "El holdout sigue virgen si el cambio es chico",
          "El holdout se gastó: ahora es parte del diseño",
          "El p-valor baja automáticamente",
          "Alcanza con no volver a graficarlo",
        ],
        answer: 1,
        why: "No se des-ve. A partir del cambio, ese tramo participó de la elección. Un holdout mirado y luego corregido no vale como confirmación.",
      },
      {
        q: "¿Qué número sí podrías reportar como holdout?",
        options: [
          "El mejor de tres lecturas del mismo tramo final",
          "La única lectura de una regla hasheada antes de abrir ese tramo",
          "El Sharpe in-sample, porque es más largo",
          "El promedio entre in-sample y holdout",
        ],
        answer: 1,
        why: "Una lectura, una regla congelada antes de abrir. Promediar o elegir el mejor de varias lecturas es otra búsqueda.",
      },
    ],
  },
  {
    id: "05",
    n: 5,
    day: 3,
    title: "Walk-forward",
    minutes: 40,
    promise: "Contar una prueba que avanza período a período sin dejar que el futuro elija el parámetro.",
    line: "En walk-forward, la ventana que califica no participa de la elección de la regla.",
    blocks: [
      {
        kind: "p",
        text: "El holdout es un solo corte. El walk-forward es el mismo principio, repetido: elegís la regla solo con datos hasta T, la dejás congelada, y la calificás en el tramo que viene. Después corrés la ventana. Cada pedazo de test es, para esa decisión, futuro.",
      },
      {
        kind: "p",
        text: "«Sin reoptimizar mirando el futuro» es literal. El lookback que opera en el mes de test tiene que haber sido elegido antes de ese mes. Reestimar una volatilidad lenta con datos pasados está bien: es parte de la regla, y el estimador no ve el test. Elegir, al ver el test, que 9 meses quedaba más lindo que 12, no está bien. Eso es look-ahead con pasos extra.",
      },
      {
        kind: "p",
        text: "Walk-forward no es un permiso para probar cuarenta lookbacks adentro de cada ventana y quedarte con el ganador. Si lo hacés, el snooping vuelve, solo que en fetas. Lo que se reporta es la costura de los tramos de test, no el ajuste que se veía bien dentro de cada entrenamiento.",
      },
      {
        kind: "example",
        title: "Una ventana que sí se puede defender",
        rows: [
          { k: "Train", v: "Años 1 a 5. Ahí se fija el parámetro." },
          { k: "Test", v: "Año 6. El parámetro ya está escrito." },
          { k: "Siguiente", v: "Train 1 a 6, test año 7. El año 6 recién ahora puede entrar al diseño." },
          { k: "Se reporta", v: "La concatenación de los años de test, con costos y con t+1" },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: un walk-forward honesto es de lo que puede estar hecho un «PASA histórico». Si cada ventana reeligió el parámetro mirando su propio test, el pase es de una regla que conocía el futuro en cada paso.",
      },
      { kind: "figure", id: "wfa" },
    ],
    questions: [
      {
        q: "En un walk-forward bien hecho, el mes de test",
        options: [
          "Se usa para desempatar el lookback",
          "No participa de la elección del parámetro que se le aplica",
          "Se promedia con el train para ganar datos",
          "Se puede reabrir si el resultado es feo",
        ],
        answer: 1,
        why: "Esa es la definición operativa. El test califica una regla que ya estaba cerrada.",
      },
      {
        q: "¿Cuál de estas reestimaciones es legítima dentro de la regla?",
        options: [
          "La volatilidad de los últimos 63 días, solo con datos anteriores a la orden",
          "El lookback que mejor Sharpe tuvo en el mes que estás calificando",
          "El universo de mercados elegido al final de la muestra",
          "Un costo que bajás después de ver que si no, no pasa",
        ],
        answer: 0,
        why: "Reestimar un insumo con información pasada es la regla. Reelegir el parámetro con el resultado del test es mirar el futuro.",
      },
      {
        q: "Probás 40 lookbacks en cada ventana y operás el ganador en el test de esa misma ventana. Eso es",
        options: [
          "Walk-forward estándar",
          "Más honesto que un holdout, porque hay muchas ventanas",
          "Snooping rebanado: el test está eligiendo",
          "Un forward test",
        ],
        answer: 2,
        why: "La cantidad de ventanas no lava la selección. Si el ganador se decide con datos del tramo que después se reporta, el tramo no era test.",
      },
      {
        q: "¿Qué curva es el resultado?",
        options: [
          "La del entrenamiento, que es más larga",
          "La costura de los tramos de test",
          "La mejor ventana suelta",
          "El promedio del train y del test",
        ],
        answer: 1,
        why: "El train existe para decidir. El número que se discute es el de los períodos que no votaron.",
      },
    ],
  },
  {
    id: "06",
    n: 6,
    day: 3,
    title: "Overfitting y data snooping",
    minutes: 45,
    promise: "Ver por qué una búsqueda de 300 variantes fabrica un ganador aunque ninguna tenga edge.",
    line: "Probar 300 variantes y publicar la mejor es otra estrategia: el máximo de una búsqueda.",
    blocks: [
      {
        kind: "p",
        text: "Overfitting es memoria de accidentes. La regla se ajustó al ruido de esa muestra: un umbral, un filtro, un mes que se excluye «porque fue atípico». Cuanta más libertad tiene la regla, más accidentes puede memorizar. Fuera de esa muestra, la memoria no sirve.",
      },
      {
        kind: "p",
        text: "Data snooping es el overfitting de la búsqueda, aunque cada regla sea simple. Probar 300 variantes y quedarte con la mejor es un modelo cuyo parámetro oculto es el operador máximo. El Sharpe que ves no es el Sharpe de una estrategia. Es el Sharpe del ganador de un concurso. Sobre ruido puro, ese ganador igual tiene un Sharpe, y ese Sharpe no se replica.",
      },
      {
        kind: "p",
        text: "El síntoma clásico es una isla: 11 meses funciona, 10 y 12 no. El ruido se ve así, como un pico solo. También se ve como un in-sample precioso que se apaga en cuanto la ventana se mueve, o como una regla que solo existe en un mercado después de haber mirado treinta. «Pero cada variante era sensata» no alcanza. La sensatez que se decide después de ver el ranking ya usó el ranking.",
      },
      {
        kind: "example",
        title: "El concurso vacío",
        rows: [
          { k: "Verdad", v: "Ninguna variante tiene edge. Retornos de ruido." },
          { k: "Lo que hacés", v: "Calculás 300 Sharpes y guardás el mayor." },
          { k: "Lo que sentís", v: "Encontraste algo: el ganador «da» 1." },
          { k: "Lo que es", v: "El máximo de 300 estimaciones ruidosas. Mañana, con datos nuevos, vuelve hacia cero." },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: por esto el ledger existe. Sin N, el filtro no sabe si le estás mostrando una idea o el ganador de un concurso. Trescientas variantes no se vuelven una por haber borrado las otras 299.",
      },
      { kind: "figure", id: "snoop" },
    ],
    questions: [
      {
        q: "Data snooping es",
        options: [
          "Usar datos demasiado viejos",
          "Quedarte con el mejor resultado de una búsqueda y tratarlo como si fuera un único intento",
          "Operar en t+1",
          "Partir la muestra en tres",
        ],
        answer: 1,
        why: "El sesgo está en el máximo no declarado. La estrategia que reportás no es la ganadora: es «la ganadora de N», y ese N es parte del modelo.",
      },
      {
        q: "¿Por qué 300 variantes simples igual fabrican un ganador falso?",
        options: [
          "Porque 300 es más que los años de datos",
          "Porque el máximo de muchas estimaciones ruidosas se aleja de cero aunque cada una tenga esperanza cero",
          "Porque el Sharpe anual no se puede calcular tantas veces",
          "Porque la curtosis baja con cada intento",
        ],
        answer: 1,
        why: "Aunque cada Sharpe tenga media cero, el máximo no la tiene. Crece con el logaritmo de N. La simplicidad de cada regla no cancela el concurso.",
      },
      {
        q: "Un lookback de 11 meses luce y los de 10 y 12 no. Eso huele a",
        options: [
          "Una isla de ruido",
          "Una prueba de robustez",
          "Un walk-forward",
          "Un forward ya cumplido",
        ],
        answer: 0,
        why: "Un edge de verdad suele degradarse suave si movés el parámetro un poco. Un pico aislado es la forma típica del accidente.",
      },
      {
        q: "Tirás 299 variantes «que no iban en serio» y publicás una. El N de esa publicación es",
        options: ["1", "299", "300", "0, porque no las guardaste"],
        answer: 2,
        why: "El ledger cuenta los intentos que pudieron cambiar lo que reportás, sobre todo los que tiraste. No guardarlos no los borra: los esconde.",
      },
    ],
  },
  {
    id: "07",
    n: 7,
    day: 4,
    title: "Hipótesis nula y p-valor",
    minutes: 45,
    promise: "Leer «p = 0,008» como una frecuencia bajo la nula, no como la probabilidad de tener razón.",
    line: "p = 0,008 no es la probabilidad de que la idea sea cierta.",
    blocks: [
      {
        kind: "p",
        text: "La hipótesis nula es la frase que dice que el efecto no está. En este oficio, casi siempre: el Sharpe verdadero es cero, o la señal no tiene timing sobre el retorno que viene. El test no demuestra la estrategia. Pregunta otra cosa: si la nula fuera cierta, ¿este resultado sería raro?",
      },
      {
        kind: "p",
        text: "p = 0,008 quiere decir: bajo la nula, y bajo los supuestos del test, un resultado tan extremo o más aparece el 0,8% de las veces. No quiere decir que haya un 99,2% de probabilidad de que la estrategia funcione. Esa inversión es el error que el número invita y que no permite.",
      },
      {
        kind: "ul",
        items: [
          "No es el tamaño del edge. Una media diminuta en una muestra enorme puede tener un p chiquito. Un Sharpe escandaloso en 14 meses puede tener un p mediocre.",
          "Asume un solo test, decidido antes. Si hubo una búsqueda, el p de la ganadora está inflado: es demasiado chico, demasiado optimista.",
          "Asume el modelo de los retornos. Colas gordas, retornos superpuestos y varianza que cambia hacen que el p de manual mienta.",
          "«Significativo» es un umbral que elegiste (muchas veces 0,05), no una propiedad del mercado.",
        ],
      },
      {
        kind: "example",
        title: "La frase, traducida",
        rows: [
          { k: "Escuchás", v: "p = 0,008, así que está casi probado" },
          { k: "Decís", v: "Si no hubiera edge y el test fuera el correcto y el único, esto pasa 8 de cada 1.000 veces" },
          { k: "No decís", v: "Hay un 99,2% de chance de que sea real" },
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: un p lindo sobre la ganadora de una búsqueda no alcanza para «PASA». Un método serio no se apoya en el p crudo. Lo reemplaza, en el centro, por un filtro que sabe cuántas veces preguntaste.",
      },
      { kind: "figure", id: "pval" },
    ],
    questions: [
      {
        q: "p = 0,008 se lee",
        options: [
          "Hay un 0,8% de probabilidad de que la estrategia sea falsa",
          "Hay un 99,2% de probabilidad de que la estrategia sea verdadera",
          "Si la nula es cierta y los supuestos se cumplen, un resultado así de extremo ocurre el 0,8% de las veces",
          "El Sharpe es 0,008",
        ],
        answer: 2,
        why: "El p es una frecuencia bajo la nula. No es la probabilidad posterior de que la idea sea cierta. Para eso haría falta un prior, y el p no lo trae.",
      },
      {
        q: "Un p chico garantiza un edge grande.",
        options: [
          "Sí, por definición de p-valor",
          "No: el p mezcla tamaño del efecto y cantidad de datos",
          "Solo si es bilateral",
          "Solo en futuros",
        ],
        answer: 1,
        why: "Con muchos años, un Sharpe económicamente irrelevante puede ser «significativo». El p no sustituye a la magnitud ni a los costos.",
      },
      {
        q: "El p de manual asume, entre otras cosas,",
        options: [
          "Que ya descontaste los 300 intentos",
          "Que este fue el único test, especificado de antemano",
          "Que el MaxDD es menor al 10%",
          "Que la curtosis es 12",
        ],
        answer: 1,
        why: "Múltiples pruebas rompen esa lectura. El p de la mejor de muchas no es el p que el manual calcula como si hubieras mirado una sola.",
      },
      {
        q: "«Significativo al 5%» es",
        options: [
          "Un hecho de mercado",
          "Un umbral elegido para decidir, no una ley natural",
          "Lo mismo que un Sharpe de 0,05",
          "La definición de DSR",
        ],
        answer: 1,
        why: "0,05 es una convención. Cambiarla a 0,01 o exigir un DSR de 0,95 es otra convención, que hay que congelar antes de mirar, no después.",
      },
    ],
  },
  {
    id: "08",
    n: 8,
    day: 4,
    title: "Permutación, sign-flip y bootstrap",
    minutes: 55,
    promise: "Saber qué pregunta hace cada máquina, y no usar un intervalo como si fuera una nula.",
    line: "Permutar y el sign-flip arman mundos sin edge. El bootstrap mide incertidumbre, no la nula.",
    blocks: [
      {
        kind: "p",
        text: "Cuando la normal no te convence, se fabrica la distribución a mano, reusando los datos. El error es tratar tres procedimientos distintos como «el test robusto». Cada uno contesta una pregunta diferente.",
      },
      {
        kind: "h",
        text: "Permutación: ¿el timing importa?",
      },
      {
        kind: "p",
        text: "Tenés una señal decidida antes del retorno, y un retorno de mercado. El PnL es señal por retorno. Bajo la nula de que la señal no tiene timing, cualquier apareamiento es igual de válido. Entonces mezclás el orden: los retornos y las señales siguen siendo los mismos, pero se rompe el calendario. Recalculás el Sharpe miles de veces. Si el Sharpe real es raro en esa nube, el alineamiento traía información. Eso es un mercado sin edge de timing.",
      },
      {
        kind: "h",
        text: "Sign-flip: ¿la media se distingue de cero?",
      },
      {
        kind: "p",
        text: "Multiplicás cada retorno de la estrategia por un +1 o un −1 al azar. Las magnitudes se quedan —un golpe sigue siendo un golpe— y la dirección se borra. Sirve para preguntar si el promedio es solo una racha de signos. Flips independientes también destruyen la autocorrelación; un flip por bloques conserva los racimos de volatilidad. Tenés que saber cuál de las dos nulas estás usando.",
      },
      {
        kind: "h",
        text: "Bootstrap: ¿cuánto ruido tiene mi estimación?",
      },
      {
        kind: "p",
        text: "Remuestreás los retornos observados, idealmente en bloques, con reposición. Te queda un intervalo del Sharpe: qué tan movediza es la estimación. El centro de esa nube sigue siendo tu Sharpe, no cero. No armaste un mundo sin edge. Usar un intervalo bootstrap como si fuera un p-valor contra «no hay nada» es un error de categoría.",
      },
      {
        kind: "example",
        title: "Tres preguntas",
        rows: [
          { k: "Permutar", v: "¿Este calendario entre señal y mercado es especial?" },
          { k: "Sign-flip", v: "¿Esta serie de PnL tiene media distinta de cero?" },
          { k: "Bootstrap", v: "¿Entre qué valores se mueve mi Sharpe si reuso esta misma serie?" },
        ],
        note: "Un p empírico —«solo el 1% de los sign-flips me supera»— sigue asumiendo que esta era la única estrategia que miraste.",
      },
      {
        kind: "note",
        text: "En el veredicto: estos tests pueden ser el motor del banco de pruebas. No reemplazan al conteo de intentos. Un sign-flip impecable sobre la ganadora de 300 sigue siendo la ganadora de 300.",
      },
      { kind: "figure", id: "nulls" },
    ],
    questions: [
      {
        q: "Querés saber si el timing de la señal importa, no solo si el PnL promedio es positivo. ¿Qué armás?",
        options: [
          "Un bootstrap del Sharpe",
          "Una permutación que rompe el apareamiento señal–retorno",
          "El MaxDD",
          "Una anualización por √12",
        ],
        answer: 1,
        why: "La permutación destruye el calendario y conserva las dos series. Esa es la nula de «no hay timing».",
      },
      {
        q: "El bootstrap de tu Sharpe",
        options: [
          "Centra la nube en cero, como una nula sin edge",
          "Centra la nube en el Sharpe observado: mide incertidumbre, no la nula",
          "Descuenta automáticamente N",
          "Es lo mismo que un sign-flip",
        ],
        answer: 1,
        why: "Remuestreás lo que viste. Si lo que viste tiene media positiva, los remuestreos también la tienen en el centro. No es un mundo contrafáctico sin edge.",
      },
      {
        q: "El sign-flip conserva las magnitudes y aleatoriza los signos. Pregunta",
        options: [
          "Si la volatilidad es constante",
          "Si la media del PnL se distingue de una dirección al azar",
          "Si el holdout está virgen",
          "Cuál contrato está en backwardation",
        ],
        answer: 1,
        why: "Es una nula de media cero que no necesita suponer normalidad. No contesta, por sí sola, si el mérito fue el timing o un drift.",
      },
      {
        q: "Tu Sharpe real queda por encima del 99% de los sign-flips. Eso",
        options: [
          "Cierra el caso, aunque hayas probado 300 reglas",
          "Es un p empírico para este único test; la búsqueda, si la hubo, sigue sin descontar",
          "Equivale a un forward test",
          "Demuestra que el bootstrap daría el mismo número",
        ],
        answer: 1,
        why: "La máquina puede estar bien y la inferencia igual estar rota, si el resultado que le diste ya es el máximo de una búsqueda no declarada.",
      },
    ],
  },
  {
    id: "09",
    n: 9,
    day: 5,
    title: "Múltiples pruebas y N de trials",
    minutes: 40,
    promise: "Contar cada intento que pudo haber cambiado la decisión, incluidos los que tiraste.",
    line: "El ledger cuenta los intentos tirados, no solo los que llegaron al informe.",
    blocks: [
      {
        kind: "p",
        text: "Cada vez que un número de performance pudo cambiar lo que hacés, eso fue un trial. Incluye los que no te gustaron. Sobre todo los que no te gustaron: son la razón por la que el que publicás está sesgado hacia arriba.",
      },
      {
        kind: "p",
        text: "N es el largo del ledger, no el largo de la shortlist «en serio». Si corrés 20 tests independientes al 5% y nada tiene edge, la chance de que al menos uno pase igual es 1 − 0,95^20, cerca de 64%. Esperás alrededor de un falso pase. El p de ese afortunado se ve idéntico al p de un edge.",
      },
      {
        kind: "formula",
        text: "P(algún falso pase) = 1 − (1 − α)^N\n\nCon α = 0,05 y N = 20 → cerca de 0,64.",
      },
      {
        kind: "p",
        text: "Bonferroni es la versión brusca: usá 0,05 / N. Es simple y conservador cuando los tests no son independientes. El filtro central de este recorrido no es ese corte duro: es el Deflated Sharpe, que sube el obstáculo de forma continua con N. Pero el DSR come el N que le des. Un intento fallido que no anotaste vuelve al DSR más optimista que la búsqueda real.",
      },
      {
        kind: "ul",
        items: [
          "Cuenta: otro lookback, un mercado que sacaste después de verlo, un costo que reintentaste, «un filtro más».",
          "No cuenta: un bugfix que no cambia la regla, un typo en una etiqueta.",
          "Zona gris: los gráficos que te quedaste mirando. El investigador honesto los anota.",
        ],
      },
      {
        kind: "note",
        text: "En el veredicto: sin ledger, «PASA» no sabe contra qué se está comparando. El pre-registro existe para que N sea aburrido y completo, que es exactamente lo que tiene que ser.",
      },
      { kind: "figure", id: "ledger" },
    ],
    questions: [
      {
        q: "Con 20 tests independientes y un umbral del 5%, si nada tiene edge, la probabilidad de al menos un falso pase es",
        options: ["5%", "20%", "Cerca de 64%", "Cero, si cada regla es simple"],
        answer: 2,
        why: "1 − 0,95^20 ≈ 0,64. La familia de tests, no cada test suelto, es la que miente.",
      },
      {
        q: "N, para el filtro, es",
        options: [
          "La cantidad de estrategias que llegaron al PDF",
          "La cantidad de intentos que pudieron cambiar la decisión, tirados incluidos",
          "Los años de datos",
          "El número de contratos del universo",
        ],
        answer: 1,
        why: "El sesgo de selección lo producen los intentos descartados. Un ledger que solo lista las finalistas subestima N y afloja el filtro.",
      },
      {
        q: "Bonferroni al 5% con N = 20 exige, por test, un p menor que",
        options: ["0,05", "0,01", "0,0025", "0,20"],
        answer: 2,
        why: "0,05 / 20 = 0,0025. Es un corte tosco y útil para sentir el tamaño de la corrección. El DSR hace un trabajo más fino con el mismo N.",
      },
      {
        q: "¿Qué no suma un trial?",
        options: [
          "Probar la misma señal sin costos, después de ver que con costos no pasa",
          "Corregir un bug que no cambia ni la señal ni los números",
          "Sacar un mercado del universo después de ver su curva",
          "Testear lookback 6, 9 y 12",
        ],
        answer: 1,
        why: "Un arreglo que no mueve la regla no es una variante. Cambiar costos, universo o parámetros después de ver sí lo es.",
      },
    ],
  },
];
