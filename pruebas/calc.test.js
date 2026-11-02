// node pruebas/calc.test.js — pruebas de la lógica de cálculo
const assert = require("assert"), C = require("../app/js/calc.js");
const P = [{ n: "Aquasana 500", vend: "Prodac", p: 17899, r: 25000, ml: 0.02, u: "ml", fam: "A", agua: "dulce", est: "ficha" },
           { n: "Fritz 3.75", vend: "Fritz", p: 79900, r: 141750, ml: 5 / 189, u: "ml", fam: "A", agua: "dulce", est: "ficha" },
           { n: "Fosfo", vend: "Po4", p: 11900, r: 2500, ml: null, u: "ml", fam: "B", agua: "dulce", est: "porconfirmar" },
           { n: "Marino X", vend: "Reef", p: 12500, r: 12500, ml: 0.02, u: "ml", fam: "C", agua: "marino", est: "sinficha" }];
let x = C.evaluar(P[0], 120);
assert.strictEqual(x.envases, 1); assert.ok(Math.abs(x.dosis - 2.4) < 1e-9); assert.ok(Math.abs(x.costoApp - 17899 / 25000 * 120) < 1e-6); assert.ok(Math.abs(x.por1000 - 715.96) < 0.01);
assert.strictEqual(C.cantidad(x).t, "2,4 ml"); assert.strictEqual(C.cantidad(x).eq, "≈ 48 gotas");
x = C.evaluar(P[0], 60000); assert.strictEqual(x.envases, 3);
assert.strictEqual(C.cantidad(C.evaluar(P[2], 100)), null);
let r = C.filtrar(P, { agua: "", fam: "", q: "", orden: "costo" }, 120); assert.strictEqual(r.length, 4); assert.strictEqual(r[r.length - 1].p.n, "Fosfo"); assert.strictEqual(r[0].p.n, "Fritz 3.75");
assert.strictEqual(C.filtrar(P, { agua: "marino" }, 120).length, 1); assert.strictEqual(C.filtrar(P, { q: "PRODAC" }, 120).length, 1); assert.strictEqual(C.filtrar(P, { q: "frítz" }, 120).length, 1);
assert.strictEqual(C.filtrar(P, { orden: "costo" }, 1e9).length, 0);   // > 30 envases se omite
assert.strictEqual(C.volumen(120, 40, 50, true), 216); assert.strictEqual(C.volumen(120, 40, 50, false), 240); assert.strictEqual(C.volumen(0, 40, 50, true), 0);
assert.strictEqual(C.esc('<a href="x">&\''), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
assert.strictEqual(C.aplicaciones(C.evaluar(P[0], 120)), "para 208 aplicaciones"); assert.strictEqual(C.aplicaciones(C.evaluar(P[0], 20000)), "para 1 aplicación");
console.log("OK: calc.js —", 17, "afirmaciones");
