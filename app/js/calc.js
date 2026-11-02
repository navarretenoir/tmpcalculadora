/* TMP Calculadora — lógica pura (sin DOM): cálculo, formatos y filtros. La usan la app y la ventana flotante de Tu Mundo Pet. */
(function (root) {
  "use strict";
  var EST = { ficha: ["ok", "Dosis verificada con la ficha"], sinficha: ["mid", "Dosis informada por la tienda"], corregido: ["warn", "Corregida según la ficha"], porconfirmar: ["bad", "Dosis por confirmar"] };
  var num = function (n, d) { return Number(n).toLocaleString("es-CL", { maximumFractionDigits: d == null ? 0 : d }); };
  var clp = function (n) { return "$" + Math.round(n).toLocaleString("es-CL"); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var sinTilde = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };

  /** Una aplicación del producto `p` en un volumen de `L` litros. */
  function evaluar(p, L) {
    var envases = Math.ceil(L / p.r), porL = p.p / p.r;
    return { p: p, envases: envases, total: envases * p.p, costoApp: porL * L, por1000: porL * 1000, aplic: p.r / L, dosis: (p.ml != null) ? p.ml * L : null };
  }
  /** Cantidad a usar con equivalencias en gotas (≤ 10 ml) y cucharaditas (≥ 2,5 ml). */
  function cantidad(x) {
    if (x.dosis == null) return null;
    var u = x.p.u, v = x.dosis, eq = [];
    if (u === "ml") { if (v <= 10) eq.push("≈ " + num(v * 20, 0) + " gotas"); if (v >= 2.5) eq.push("≈ " + num(v / 5, 1) + " cucharaditas"); }
    return { t: (v < 10 ? num(v, 1) : num(v, 0)) + " " + u, eq: eq.join(" · ") };
  }
  var ORDEN = {
    costo: function (a, b) { return a.por1000 - b.por1000; },
    dosis: function (a, b) { return (a.dosis == null) - (b.dosis == null) || a.dosis - b.dosis; },
    rinde: function (a, b) { return b.p.r - a.p.r; },
    nombre: function (a, b) { return a.p.n.localeCompare(b.p.n, "es"); }
  };
  /** Filtra, calcula y ordena. Los «por confirmar» van al final; se omiten los que necesitan más de 30 envases. */
  function filtrar(P, f, L) {
    var q = sinTilde(f.q || "").trim(), rows = P.filter(function (p) { return (!f.agua || p.agua === f.agua) && (!f.fam || p.fam === f.fam) && (!q || sinTilde(p.n + " " + p.vend).indexOf(q) >= 0); })
      .map(function (p) { return evaluar(p, L); }).filter(function (x) { return x.envases <= 30; });
    var ok = rows.filter(function (x) { return x.p.est !== "porconfirmar"; }).sort(ORDEN[f.orden] || ORDEN.costo), pend = rows.filter(function (x) { return x.p.est === "porconfirmar"; });
    return ok.concat(pend);
  }
  function familias(P) { var c = {}; P.forEach(function (p) { c[p.fam] = (c[p.fam] || 0) + 1; }); return Object.keys(c).sort(function (a, b) { return c[b] - c[a] || a.localeCompare(b, "es"); }).map(function (k) { return [k, c[k]]; }); }
  /** Litros a partir de las medidas en cm; `desc` descuenta ~10 % por sustrato y decoración. */
  function volumen(l, a, h, desc) { return (l > 0 && a > 0 && h > 0) ? Math.round(l * a * h / 1000 * (desc ? 0.9 : 1) * 10) / 10 : 0; }
  function aplicaciones(x) { return x.aplic >= 1 ? "para " + num(Math.floor(x.aplic)) + (Math.floor(x.aplic) > 1 ? " aplicaciones" : " aplicación") : x.envases + " envases"; }

  var API = { EST: EST, num: num, clp: clp, esc: esc, sinTilde: sinTilde, evaluar: evaluar, cantidad: cantidad, filtrar: filtrar, familias: familias, volumen: volumen, aplicaciones: aplicaciones };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else root.TMPCalc = API;
})(typeof window !== "undefined" ? window : globalThis);
