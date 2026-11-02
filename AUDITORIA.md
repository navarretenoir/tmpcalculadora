# Auditoría de la calculadora de dosificación de tiendatumundopet.cl (2026-11-02)

**Qué se revisó:** el código de la sección «Calculadora de dosificación» (`tmp-calculadora.js`, el JSON `calc-datos` embebido en la portada y el tema Shopify «DEV calculadora autoadministrable») y los **169 productos** que carga, contra la ficha de cada uno (`/products/<handle>.js`) y el catálogo completo (723 productos).

## 1. La fórmula del código es correcta
- Envases = ⌈litros ÷ rendimiento⌉ · Costo = envases × precio · Por 1.000 L = precio ÷ rendimiento × 1.000 · «Te alcanza» = rendimiento ÷ litros. Matemáticamente bien, ordena por costo por 1.000 L (comparación justa).
- Tope de 30 envases y 60 dosis; los precios del JSON **coinciden 169/169** con el catálogo de hoy.

## 2. Los datos: 169 productos
| Resultado | Productos |
|---|---:|
| Rendimiento = tamaño del envase ÷ dosis (aritmética coherente) | 157 de 159 verificables |
| Dosis **confirmada con el texto de la ficha** (±15 %) | 108 |
| Dosis **sin texto de dosis en la ficha** (no se puede contrastar; hay que mirar la etiqueta del proveedor) | 53 |
| **Con error o dudosos** | 8 (detalle abajo) |
| Sin dosis cargada (solo rinde N litros: sales, canutillos, resinas, removedor de fosfato) | 7 |

### Errores y dudas (corregidos en TMP Calculadora)
| Producto | La tienda dice | La ficha / la cuenta dice | Corrección |
|---|---|---|---|
| **Aquasana Prodac 100 ml** | rinde **25.000 L** | 10 ml por 500 L ⇒ 100 ml = **5.000 L** (25.000 es el valor del envase de 500 ml, copiado) | 5.000 L — **error ×5 a favor del envase** |
| **Fritzzyme Monster 360 946 ml y 473 ml** | 17.974 L / 8.987 L (5 ml/95 L) | la ficha dice «rendimiento 35.948 L / 17.974 L» | se usa el de la ficha (2,5 ml/95 L) — **la tienda subestima la mitad** |
| **Parashield 118 ml** | 2,5 ml / 95 L ⇒ 4.484 L | ficha: 5 ml por 100 L (agua dulce) ⇒ 2.360 L; la mitad solo en arrecife | 5 ml/100 L — **la tienda sobreestima ~×1,9** |
| **Stress Defense F 250 ml** | 2.000 L | «250 ml rinde 1.900 litros» | 1.900 L (−5 %) |
| **eSHa2000 20 ml** | rinde 800 L pero dosis «1 ml/100 L» (⇒ 2.000 L) | la ficha no trae dosis | **por confirmar** (se contradice a sí mismo) |
| **Fosfo 250/500 ml (PO4)** | 10 ml / 100 L | la ficha: 10 ml por 500 L *suben* el PO4 0,1 mg/L (no es una dosis fija) | **por confirmar** (depende de la medición) |
| FritzPond Algae Clean Out 473/946 ml | 2,5 ml/114 L | ficha: 5 ml por 227 L ✔ (la ficha además trae «6 gotas por 40 L», que no cuadra con 20 gotas/ml) | correcto |

## 3. Fallas de diseño de la calculadora (no de la cuenta)
1. **El filtro «¿Qué necesitas?» casi no sirve:** 128 de 169 productos (76 %) no tienen familia asignada; solo 41 aparecen en categorías. (TMP Calculadora las asigna por nombre.)
2. **Tratamientos de varios días se calculan como una sola dosis** (Fixick, Parashield, CopperSafe, Levamicil…): «te alcanza para N dosis» sobreestima cuántas veces se puede tratar.
3. **Baños (DIP) y similares** (Fritz Bug Out: 2 ml por *galón de agua del recipiente*) no dependen de los litros del acuario; la calculadora los trata como si sí.
4. **Mitad de dosis en arrecife/invertebrados** (varias fichas) no se contempla.
5. Los **datos de rendimiento los carga una persona** (la propia página dice «todavía tienen que validarse producto por producto»): 53 productos no tienen la dosis escrita en la ficha, así que no son verificables sin la etiqueta del proveedor.
6. **30 productos con dosis en la ficha están fuera de la calculadora** (listado en `datos/gap-calculadora.json`): Fritz pH Higher/Lower, eSHa (Exit, Gastropex, Oodinex, Trimarin, Gastrobac, ALX), Reconstitute Ro, Vitachem, Bactrox, Green Cyano Rx, CoralMax, entre otros.
7. La colección tiene 172 productos y el JSON trae 169 (3 sin rendimiento).
8. Todo el catálogo figura «disponible» (723/723): el JSON público no distingue sin-stock.

## 4. El catálogo
723 productos · 30 marcas · Agua y salud 242 · Alimentos 209 · Equipamiento 150 · Sustratos y plantas 79 · Otras mascotas 34 · sin tipo 9. Precio mínimo $1.990, mediana $17.500, máximo $645.500. Lista completa: `PRODUCTOS.md` / `PRODUCTOS.csv`.

## 5. Look & feel de la tienda (base de TMP Calculadora)
Paleta **abismo `#052C2B` / petróleo `#046059` / agua `#EDF4F2`**, acento **ámbar `#FFC424`** (botones), lima `#DBE571` (etiquetas); tipografías **Archivo** (texto) e **IBM Plex Mono** (cifras y datos); esquinas de 4–8 px, etiquetas en mayúscula pequeña con espaciado, secciones oscuras con tarjetas translúcidas y tablas con cifras monoespaciadas. Logo: pez poligonal amarillo/naranja + «tu mundo pet» en petróleo.
