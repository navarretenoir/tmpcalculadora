/* TMP Calculadora — calculadora de dosificación de Tu Mundo Pet. Sin red: los datos viajan en datos/productos.js. */
(function () {
  "use strict";
  var P = window.TMP_PRODUCTOS || [], $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var TIENDA = "https://www.tiendatumundopet.cl/products/", LIM = 12, mostrar = LIM;
  var num = function (n, d) { return Number(n).toLocaleString("es-CL", { maximumFractionDigits: d == null ? 0 : d }); };
  var clp = function (n) { return "$" + Math.round(n).toLocaleString("es-CL"); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var sinTilde = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var LS = { get: function () { try { return JSON.parse(localStorage.getItem("tmpcalc.v1") || "{}"); } catch (e) { return {}; } }, set: function (o) { try { localStorage.setItem("tmpcalc.v1", JSON.stringify(o)); } catch (e) {} } };
  var EST = { ficha: ["ok", "Dosis verificada con la ficha"], sinficha: ["mid", "Dosis informada por la tienda"], corregido: ["warn", "Corregida según la ficha"], porconfirmar: ["bad", "Dosis por confirmar"] };

  /* ---------- cálculo (una función pura por producto) ---------- */
  function evaluar(p, L) {
    var envases = Math.ceil(L / p.r), porL = p.p / p.r;
    return { p: p, envases: envases, total: envases * p.p, costoApp: porL * L, por1000: porL * 1000, aplic: p.r / L, dosis: (p.ml != null) ? p.ml * L : null };
  }
  function cantidad(x) {
    if (x.dosis == null) return null;
    var u = x.p.u, v = x.dosis, t = (v < 10 ? num(v, 1) : num(v, 0)) + " " + u, eq = [];
    if (u === "ml") { if (v <= 10) eq.push("≈ " + num(v * 20, 0) + " gotas"); if (v >= 2.5) eq.push("≈ " + num(v / 5, 1) + " cucharaditas"); }
    return { t: t, eq: eq.join(" · ") };
  }

  /* ---------- filtros y pintado ---------- */
  function litros() { var v = parseFloat(String($("#litros").value).replace(",", ".")); return v > 0 ? v : 0; }
  function llenarFam() {
    var c = {}; P.forEach(function (p) { c[p.fam] = (c[p.fam] || 0) + 1; });
    $("#fam").innerHTML = '<option value="">Todas las categorías (' + P.length + ")</option>" + Object.keys(c).sort(function (a, b) { return c[b] - c[a] || a.localeCompare(b, "es"); }).map(function (k) { return '<option value="' + esc(k) + '">' + esc(k) + " (" + c[k] + ")</option>"; }).join("");
  }
  function calcular(reset) {
    if (reset) mostrar = LIM;
    var L = litros(), ag = $("#agua").value, fam = $("#fam").value, q = sinTilde($("#q").value.trim()), ord = $("#orden").value;
    LS.set({ litros: L, agua: ag, fam: fam, orden: ord });
    if (!L) { $("#resumen").innerHTML = "Escribe los litros de tu acuario para empezar."; $("#lista").innerHTML = ""; $("#mas").hidden = true; return; }
    var rows = P.filter(function (p) { return (!ag || p.agua === ag) && (!fam || p.fam === fam) && (!q || sinTilde(p.n + " " + p.vend).indexOf(q) >= 0); }).map(function (p) { return evaluar(p, L); }).filter(function (x) { return x.envases <= 30; });
    var conf = rows.filter(function (x) { return x.p.est !== "porconfirmar"; }), pend = rows.filter(function (x) { return x.p.est === "porconfirmar"; });
    var cmp = { costo: function (a, b) { return a.por1000 - b.por1000; }, dosis: function (a, b) { return (a.dosis == null) - (b.dosis == null) || a.dosis - b.dosis; }, rinde: function (a, b) { return b.p.r - a.p.r; }, nombre: function (a, b) { return a.p.n.localeCompare(b.p.n, "es"); } }[ord];
    conf.sort(cmp); rows = conf.concat(pend);
    $("#resumen").innerHTML = rows.length ? "Para <b>" + num(L, L % 1 ? 1 : 0) + " L</b> encontramos <b>" + rows.length + "</b> producto" + (rows.length > 1 ? "s" : "") + (ord === "costo" ? ", del más económico por aplicación al más caro." : ".") : "";
    if (!rows.length) { $("#lista").innerHTML = '<div class="vacio">No encontramos productos con esos filtros. Prueba con «Todas» en el tipo de agua o borra la búsqueda.</div>'; $("#mas").hidden = true; return; }
    $("#lista").innerHTML = rows.slice(0, mostrar).map(function (x, i) { return tarjeta(x, i === 0 && ord === "costo" && rows.length > 1 && x.p.est !== "porconfirmar", L); }).join("");
    $("#mas").hidden = rows.length <= mostrar; $("#mas").textContent = "Ver más productos (" + (rows.length - mostrar) + ")";
  }
  function tarjeta(x, mejor, L) {
    var p = x.p, e = EST[p.est], c = cantidad(x), dosisTxt = p.d ? p.d.replace(" / ", " por cada ") : "—";
    var aplic = x.aplic >= 1 ? "para " + num(Math.floor(x.aplic)) + (Math.floor(x.aplic) > 1 ? " aplicaciones" : " aplicación") : x.envases + " envases";
    var datos = (c ? '<div class="dato clave"><small>Para tu acuario</small><b>' + esc(c.t) + "</b>" + (c.eq ? "<i>" + esc(c.eq) + "</i>" : "") + "</div>" : '<div class="dato"><small>Dosis</small><b>' + esc(p.est === "porconfirmar" ? "Ver ficha" : "—") + "</b></div>") +
      '<div class="dato"><small>Etiqueta</small><b>' + esc(dosisTxt) + '</b></div><div class="dato"><small>Rinde</small><b>' + num(p.r, p.r % 1 ? 1 : 0) + ' L</b><i>' + aplic + '</i></div>' +
      '<div class="dato"><small>Costo</small><b>' + clp(x.total) + '</b><i>' + x.envases + " envase" + (x.envases > 1 ? "s" : "") + " · esta aplicación " + clp(x.costoApp) + "</i></div>";
    return '<article class="card' + (mejor ? " mejor" : "") + '"><img src="' + esc(p.img) + '" alt="" loading="lazy"><div><h3 class="nom">' + esc(p.n) + (mejor ? '<span class="etq">mejor costo por litro</span>' : "") + '</h3><p class="vend">' + esc(p.vend) + '</p><div class="datos">' + datos + '</div><div class="pie"><span class="tag ' + e[0] + '">' + e[1] + "</span>" + (p.disp ? "" : '<span class="tag stock">Sin stock</span>') + '<a class="link" href="' + TIENDA + encodeURIComponent(p.h) + '" target="_blank" rel="noopener">Ver en la tienda →</a></div>' +
      (p.nota ? '<div class="nota-c">' + esc(p.nota) + "</div>" : "") + (p.ficha ? '<details class="det"><summary>Qué dice la ficha</summary><p>' + esc(p.ficha) + "</p></details>" : "") + "</div></article>";
  }

  /* ---------- medidas del acuario ---------- */
  function medidas() {
    var l = +$("#mL").value, a = +$("#mA").value, h = +$("#mH").value, f = $("#mDesc").checked ? 0.9 : 1;
    if (l > 0 && a > 0 && h > 0) { var v = Math.round(l * a * h / 1000 * f * 10) / 10; $("#mRes").textContent = num(l) + " × " + num(a) + " × " + num(h) + " cm" + (f < 1 ? " − 10 %" : "") + " = " + num(v, 1) + " litros"; $("#litros").value = v; calcular(true); } else $("#mRes").textContent = "";
  }

  /* ---------- conversiones ---------- */
  function enlazar(a, b, k, d) { var A = $(a), B = $(b), me = false; A.addEventListener("input", function () { if (me) return; var v = parseFloat(A.value.replace(",", ".")); me = true; B.value = isNaN(v) ? "" : String(Math.round(v * k * 1000) / 1000); me = false; }); B.addEventListener("input", function () { if (me) return; var v = parseFloat(B.value.replace(",", ".")); me = true; A.value = isNaN(v) ? "" : String(Math.round(v / k * 1000) / 1000); me = false; }); }
  function regla() { var x = +$("#rX").value, y = +$("#rY").value, z = +$("#rZ").value; $("#rRes").textContent = x > 0 && y > 0 && z > 0 ? num(x / y * z, x / y * z < 10 ? 2 : 1) + " ml" : "—"; }

  /* ---------- vistas ---------- */
  function ir(v) { $$(".vista").forEach(function (s) { s.hidden = s.id !== "v-" + v; }); $$("[data-v]").forEach(function (b) { if (b.dataset.v === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); }); window.scrollTo(0, 0); }
  function iniciar() {
    var g = LS.get(); llenarFam();
    if (g.litros) $("#litros").value = g.litros; if (g.agua) $("#agua").value = g.agua; if (g.fam) $("#fam").value = g.fam; if (g.orden) $("#orden").value = g.orden;
    $("#fecha").textContent = $("#fecha2").textContent = (function () { var f = String(window.TMP_FECHA || "").split("-"); return f.length === 3 ? new Date(+f[0], +f[1] - 1, +f[2]) : new Date(); })().toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
    var c = { ficha: 0, sinficha: 0, corregido: 0, porconfirmar: 0 }; P.forEach(function (p) { c[p.est]++; });
    $("#nTot").textContent = P.length; $("#nOk").textContent = c.ficha; $("#nSin").textContent = c.sinficha; $("#nCor").textContent = c.corregido; $("#nPor").textContent = c.porconfirmar;
    ["#litros", "#q"].forEach(function (s) { $(s).addEventListener("input", function () { calcular(true); }); });
    ["#agua", "#fam", "#orden"].forEach(function (s) { $(s).addEventListener("change", function () { calcular(true); }); });
    ["#mL", "#mA", "#mH"].forEach(function (s) { $(s).addEventListener("input", medidas); }); $("#mDesc").addEventListener("change", medidas);
    $("#mas").addEventListener("click", function () { mostrar += LIM; calcular(false); });
    enlazar("#cG", "#cL", 3.78541); enlazar("#cM", "#cD", 20); ["#rX", "#rY", "#rZ"].forEach(function (s) { $(s).addEventListener("input", regla); });
    $$("[data-v]").forEach(function (b) { b.addEventListener("click", function () { ir(b.dataset.v); }); });
    calcular(true);
  }
  iniciar();
})();
