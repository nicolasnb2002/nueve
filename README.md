# Nueve

Cómo saber si una estrategia funciona de verdad o solo parece, y cómo operar cripto spot sin regalar plata en costos. Veintidós conceptos en once días, dos por día, para estudiar en el navegador. Pensado para estudiantes y para cualquiera que arranque de cero: cada concepto trae una intro «en criollo», hay un glosario, y los días 10 y 11 son práctica de cripto (libro de órdenes, comisiones, slippage, custodia y apalancamiento).

Contenido educativo. No es asesoramiento financiero ni recomendación de inversión.

**Para estudiar:** https://nicolasnb2002.github.io/nueve/

No hay cuentas. El avance queda guardado en el navegador. Hace falta acertar 3 de 4 en cada cuestionario.

## Cómo abrirla en local

```bash
npm install
npm run dev
```

El sitio público se genera con `npm run build:pages` y se sirve desde la raíz del repositorio.

## Números verificados

Todo número de los días 10 y 11 y del glosario se recalcula con:

```bash
python3 scripts/verify_examples.py
```

Las tarifas de Binance salen de https://www.binance.info/en-BH/fee (consultada el 10/10/2026). Las tarifas cambian: revisalas antes de usarlas.

## Publicar

`npm run build:pages` y copiar `dist/client/` (index.html, assets/, __grok/, sw.js) a la raíz, más `index.html` como `404.html`.
