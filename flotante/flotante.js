/* TMP Calculadora flotante — botón persistente + ventana adaptativa con la calculadora de dosificación, para la app de Tu Mundo Pet.
 * Lo inyecta el anfitrión de cada plataforma (WebView2, Android WebView, WebKitGTK, WKWebView) en las páginas de tiendatumundopet.cl.
 * Todo vive en un shadow root: no depende de ni altera el CSS de la tienda. Sin red: los datos van dentro de este archivo.
 * Desarrollado por Javiera Navarrete para Tu Mundo Pet. GPL-3.0-or-later. */
(function () {
  "use strict";
  if (window.__tmpCalcFlot || window !== window.top) return;
  if (!/(^|\.)tiendatumundopet\.cl$/.test(location.hostname)) return;
  if (/\/checkouts?\//.test(location.pathname)) return;               // nunca sobre el pago
  window.__tmpCalcFlot = true;

  /*@@CALC@@*/
  var C = window.TMPCalc; try { delete window.TMPCalc; } catch (e) { window.TMPCalc = undefined; }
  var P = /*@@DATOS@@*/;
  var CSS = /*@@CSS@@*/;
  var FECHA = /*@@FECHA@@*/;

  var ICONO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c3.7 4.7 6.5 7.8 6.5 11.6a6.5 6.5 0 0 1-13 0C5.5 10.3 8.3 7.2 12 2.5zm-2.6 11.2a.9.9 0 0 0-.9 1.1 3.6 3.6 0 0 0 2.6 2.6.9.9 0 0 0 .4-1.8 1.8 1.8 0 0 1-1.2-1.2.9.9 0 0 0-.9-.7z"/></svg>';
  var LS = { get: function () { try { return JSON.parse(localStorage.getItem("tmpcalc.flot.v1") || "{}"); } catch (e) { return {}; } }, set: function (o) { try { localStorage.setItem("tmpcalc.flot.v1", JSON.stringify(o)); } catch (e) {} } };
  var SS = { get: function (k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  var esc = C.esc, num = C.num, clp = C.clp, LIM = 10, mostrar = LIM, abierto = false, maxim = false, pos = SS.get("tmpcalc.pos"), anclado = "abajo";
  var host, root, $, fab, panel, vel, cab;

  function ancla() {
    var xs = document.querySelectorAll('header a.icono-btn[title="Asesoría"], header a[href="/blogs/guias"].icono-btn'), i;
    for (i = 0; i < xs.length; i++) { var r = xs[i].getBoundingClientRect(); if (r.width > 0 && r.height > 0) return xs[i]; }
    return null;
  }
  function posicionar() {
    var a = ancla(), full = 190;
    if (a) {
      var r = a.getBoundingClientRect(), bus = document.querySelector('header form[action*="search"], header .buscador, header input[type=search]'), fin = 0;
      if (bus) { var br = (bus.closest("form") || bus).getBoundingClientRect(); if (br.width) fin = br.right; }
      fab.classList.toggle("compacto", r.left - fin < full + 28);
      fab.setAttribute("aria-label", "TMP Calculadora");
      var w = fab.offsetWidth || full;
      fab.style.left = Math.max(8, r.left - w - 12) + "px"; fab.style.top = Math.max(8, r.top + (r.height - 44) / 2) + "px"; fab.style.right = "auto"; fab.style.bottom = "auto"; anclado = "arriba";
    } else {                                                           // móvil o página sin cabecera: abajo a la derecha, sobre el botón de WhatsApp
      fab.classList.remove("compacto"); fab.style.left = "auto"; fab.style.top = "auto"; fab.style.right = "16px"; fab.style.bottom = "calc(156px + env(safe-area-inset-bottom, 0px))"; anclado = "abajo";
    }
    if (abierto) distribuir();
  }
  var rafP = 0; function programar() { if (!rafP) rafP = requestAnimationFrame(function () { rafP = 0; posicionar(); }); }

  /* ---------- ventana adaptativa: hoja inferior en pantallas angostas, ventana flotante en las demás ---------- */
  function esHoja() { return window.innerWidth <= 640; }
  function distribuir() {
    $("#raiz").classList.toggle("hoja-modo", esHoja());
    var s = panel.style; ["left", "top", "right", "bottom", "width", "height"].forEach(function (k) { s[k] = ""; });
    if (esHoja()) return;
    var vw = window.innerWidth, vh = window.innerHeight, w = maxim ? Math.min(vw - 32, 980) : Math.min(vw - 32, Math.max(400, Math.min(520, vw * 0.34))), h, x, y, fr = fab.getBoundingClientRect();
    if (maxim) { h = vh - 32; x = (vw - w) / 2; y = 16; }
    else if (pos) { w = Math.min(w, vw - 16); x = Math.min(Math.max(8, pos.x), vw - w - 8); y = Math.min(Math.max(8, pos.y), vh - 160); h = Math.min(820, vh - y - 12); }
    else if (anclado === "arriba") { y = fr.bottom + 10; x = vw - w - 16; h = Math.min(820, vh - y - 14); }
    else { h = Math.min(820, fr.top - 24); y = fr.top - 10 - h; x = vw - w - 16; }
    h = Math.max(Math.min(h, vh - 16), Math.min(360, vh - 16)); if (y + h > vh - 8) y = Math.max(8, vh - h - 8);
    s.left = x + "px"; s.top = y + "px"; s.width = w + "px"; s.height = h + "px";
  }
  function abrir() {
    if (abierto) return; abierto = true; distribuir(); panel.classList.add("on"); vel.classList.add("on"); fab.setAttribute("aria-expanded", "true");
    var t = $(".tit b"); if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
  }
  function cerrar(devolverFoco) {
    if (!abierto) return; abierto = false; panel.classList.remove("on"); vel.classList.remove("on"); fab.setAttribute("aria-expanded", "false"); panel.style.transform = ""; if (devolverFoco !== false) fab.focus({ preventScroll: true });
  }
  function alternar() { abierto ? cerrar() : abrir(); }

  /* ---------- arrastre (ventana) y deslizar hacia abajo (hoja) ---------- */
  function arrastre() {
    var d = null;
    cab.addEventListener("pointerdown", function (e) {
      if (e.button > 0 || e.target.closest("button")) return; var r = panel.getBoundingClientRect();
      d = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top, y0: e.clientY, hoja: esHoja() }; cab.setPointerCapture(e.pointerId); cab.classList.add("arr"); panel.style.transition = "none";
    });
    cab.addEventListener("pointermove", function (e) {
      if (!d || e.pointerId !== d.id) return;
      if (d.hoja) { panel.style.transform = "translateY(" + Math.max(0, e.clientY - d.y0) + "px)"; return; }
      var w = panel.offsetWidth, h = panel.offsetHeight; pos = { x: Math.min(Math.max(8, e.clientX - d.dx), window.innerWidth - w - 8), y: Math.min(Math.max(8, e.clientY - d.dy), window.innerHeight - 80) };
      panel.style.left = pos.x + "px"; panel.style.top = pos.y + "px"; panel.style.height = Math.min(h, window.innerHeight - pos.y - 8) + "px"; maxim = false;
    });
    function fin(e) {
      if (!d || e.pointerId !== d.id) return; var hoja = d.hoja, dy = e.clientY - d.y0; d = null; cab.classList.remove("arr"); panel.style.transition = "";
      if (hoja) { if (dy > 110) cerrar(); else panel.style.transform = ""; } else { SS.set("tmpcalc.pos", pos); }
    }
    cab.addEventListener("pointerup", fin); cab.addEventListener("pointercancel", fin);
  }

  /* ---------- interfaz ---------- */
  var MARCA = '<div class="raiz" id="raiz">' +
    '<button class="fab" id="fab" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="panel">' + ICONO + '<span class="fab-t">TMP Calculadora</span></button>' +
    '<div class="vel" id="vel"></div>' +
    '<section class="panel" id="panel" role="dialog" aria-label="TMP Calculadora, calculadora de dosificación">' +
      '<header class="cab" id="cab"><div class="asa"><i></i></div><div class="tit">' + ICONO + '<b>TMP Calculadora</b><small>dosificación</small></div>' +
      '<div class="acc"><button class="ib max" id="max" type="button" aria-label="Ampliar o reducir la ventana" title="Ampliar"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
      '<button class="ib" id="cerrar" type="button" aria-label="Cerrar la calculadora" title="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></header>' +
      '<nav class="tabs" role="tablist"><button role="tab" data-t="dosis" aria-selected="true">Dosis</button><button role="tab" data-t="conv" aria-selected="false">Conversiones</button><button role="tab" data-t="info" aria-selected="false">Cómo calcula</button></nav>' +
      '<div class="cuerpo" id="cuerpo">' + vistaDosis() + vistaConv() + vistaInfo() + '</div>' +
    '</section></div>';

  function vistaDosis() {
    return '<div data-v="dosis">' +
      '<div class="campos"><label class="fld"><span>Litros de tu acuario</span><input id="litros" type="number" inputmode="decimal" min="1" max="50000" value="120" enterkeyhint="done"></label>' +
      '<label class="fld"><span>Tipo de agua</span><select id="agua"><option value="">Todas</option><option value="dulce">Agua dulce</option><option value="marino">Agua marina</option><option value="estanque">Estanque o pileta</option></select></label>' +
      '<label class="fld"><span>¿Qué necesitas?</span><select id="fam"></select></label>' +
      '<label class="fld"><span>Buscar producto</span><input id="q" type="search" placeholder="Ej.: anticloro, Fritz" autocomplete="off"></label></div>' +
      '<details class="med"><summary>No sé los litros: calcular con las medidas</summary><div class="campos"><label class="fld"><span>Largo cm</span><input id="mL" type="number" inputmode="decimal" min="1"></label><label class="fld"><span>Ancho cm</span><input id="mA" type="number" inputmode="decimal" min="1"></label><label class="fld"><span>Alto agua cm</span><input id="mH" type="number" inputmode="decimal" min="1"></label></div>' +
      '<label class="chk"><input type="checkbox" id="mD" checked> Descontar ~10 % por sustrato y decoración</label><p class="mres" id="mR"></p></details>' +
      '<div class="res"><p class="resumen" id="resumen" aria-live="polite"></p><label class="fld"><span>Ordenar por</span><select id="orden"><option value="costo">Menor costo por aplicación</option><option value="dosis">Menor cantidad</option><option value="rinde">Mayor rendimiento</option><option value="nombre">Nombre</option></select></label></div>' +
      '<div class="lista" id="lista"></div><button class="mas" id="mas" type="button" hidden>Ver más</button>' +
      '<p class="aviso"><b>Importante.</b> Cantidades de referencia según la ficha de cada producto. Sigue siempre la etiqueta y consulta al equipo de la tienda ante dudas. Precios al ' + esc(FECHA) + '; pueden haber cambiado.</p></div>';
  }
  function vistaConv() {
    return '<div data-v="conv" hidden><div class="card2"><h3>Galones ⇄ litros</h3><div class="par"><label class="fld"><span>Galones (EE. UU.)</span><input id="cG" type="number" inputmode="decimal"></label><label class="fld"><span>Litros</span><input id="cL" type="number" inputmode="decimal"></label></div><p class="nt">1 galón estadounidense = 3,785 litros. Muchas etiquetas dosifican «por 10 galones» (≈ 38 L).</p></div>' +
      '<div class="card2"><h3>Mililitros y gotas</h3><div class="par"><label class="fld"><span>Mililitros</span><input id="cM" type="number" inputmode="decimal"></label><label class="fld"><span>Gotas</span><input id="cD" type="number" inputmode="decimal"></label></div><p class="nt">1 ml ≈ 20 gotas · 1 cucharadita = 5 ml · 1 cucharada = 15 ml.</p></div>' +
      '<div class="card2"><h3>Regla de tres para una dosis</h3><p class="nt" style="margin:0 0 8px">Si la etiqueta dice «X ml por cada Y litros»:</p><div class="par3"><label class="fld"><span>Dosis (ml)</span><input id="rX" type="number" inputmode="decimal" step="any"></label><label class="fld"><span>por cada (L)</span><input id="rY" type="number" inputmode="decimal" step="any"></label><label class="fld"><span>Tu acuario (L)</span><input id="rZ" type="number" inputmode="decimal" step="any"></label></div><p class="gran" id="rRes">—</p></div></div>';
  }
  function vistaInfo() {
    var c = { ficha: 0, sinficha: 0, corregido: 0, porconfirmar: 0 }; P.forEach(function (p) { c[p.est]++; });
    return '<div data-v="info" hidden><div class="card2"><h3>La cuenta</h3><ul><li>Cantidad = dosis ÷ litros de la etiqueta × tus litros.</li><li>Envases = tus litros ÷ rendimiento, hacia arriba.</li><li>Costo por aplicación = precio ÷ rendimiento × tus litros: la forma justa de comparar envases de distinto tamaño.</li></ul></div>' +
      '<div class="card2"><h3>Verificación de los ' + P.length + ' productos</h3><ul><li><span class="tag ok">Verificada</span> coincide con la ficha: <b>' + c.ficha + '</b></li><li><span class="tag mid">Informada por la tienda</span> la ficha no trae la dosis: <b>' + c.sinficha + '</b></li><li><span class="tag warn">Corregida</span> ajustada según la ficha: <b>' + c.corregido + '</b></li><li><span class="tag bad">Por confirmar</span> sin validar: <b>' + c.porconfirmar + '</b></li></ul></div>' +
      '<div class="card2"><h3>Lo que no considera</h3><ul><li>Tratamientos de varios días: se calcula una aplicación.</li><li>Baños de corales (DIP): se miden por el recipiente.</li><li>Mitad de dosis en arrecife o con invertebrados.</li><li>No reemplaza el consejo del equipo técnico de Tu Mundo Pet.</li></ul></div></div>';
  }

  function tarjeta(x, mejor) {
    var p = x.p, e = C.EST[p.est], q = C.cantidad(x), eti = p.d ? p.d.replace(" / ", " por cada ") : "—", href = "/products/" + encodeURIComponent(p.h);
    var datos = (q ? '<div class="dato clave"><small>Para tu acuario</small><b>' + esc(q.t) + "</b>" + (q.eq ? "<i>" + esc(q.eq) + "</i>" : "") + "</div>" : '<div class="dato clave"><small>Dosis</small><b>' + (p.est === "porconfirmar" ? "Ver ficha" : "—") + "</b></div>") +
      '<div class="dato"><small>Etiqueta</small><b>' + esc(eti) + '</b></div><div class="dato"><small>Rinde</small><b>' + num(p.r, p.r % 1 ? 1 : 0) + ' L</b><i>' + C.aplicaciones(x) + '</i></div>' +
      '<div class="dato"><small>Costo</small><b>' + clp(x.total) + '</b><i>' + x.envases + ' envase' + (x.envases > 1 ? "s" : "") + ' · aplicación ' + clp(x.costoApp) + '</i></div>';
    return '<article class="tarj' + (mejor ? " mejor" : "") + '"><a href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.img) + '" alt="" loading="lazy" decoding="async"></a><div><h4 class="nom"><a href="' + href + '">' + esc(p.n) + '</a>' + (mejor ? '<span class="etq">mejor costo</span>' : "") + '</h4><p class="vend">' + esc(p.vend) + '</p><div class="datos">' + datos + '</div>' +
      '<div class="pie"><span class="tag ' + e[0] + '">' + e[1] + '</span><a class="ver" href="' + href + '">Ver producto →</a></div>' + (p.nota ? '<div class="nota-c">' + esc(p.nota) + '</div>' : '') + (p.ficha ? '<details class="det"><summary>Qué dice la ficha</summary><p>' + esc(p.ficha) + '</p></details>' : '') + '</div></article>';
  }
  function litros() { var v = parseFloat(String($("#litros").value).replace(",", ".")); return v > 0 ? v : 0; }
  function calcular(reset) {
    if (reset) mostrar = LIM; var L = litros(), ag = $("#agua").value, fam = $("#fam").value, ord = $("#orden").value, q = $("#q").value; LS.set({ litros: L, agua: ag, fam: fam, orden: ord });
    if (!L) { $("#resumen").textContent = "Escribe los litros de tu acuario para empezar."; $("#lista").innerHTML = ""; $("#mas").hidden = true; return; }
    var rows = C.filtrar(P, { agua: ag, fam: fam, q: q, orden: ord }, L);
    $("#resumen").innerHTML = rows.length ? "Para <b>" + num(L, L % 1 ? 1 : 0) + " L</b>: <b>" + rows.length + "</b> producto" + (rows.length > 1 ? "s" : "") + (ord === "costo" ? ", del más conveniente al menos." : ".") : "";
    if (!rows.length) { $("#lista").innerHTML = '<div class="vacio">No hay productos con esos filtros. Prueba con «Todas» o borra la búsqueda.</div>'; $("#mas").hidden = true; return; }
    $("#lista").innerHTML = rows.slice(0, mostrar).map(function (x, i) { return tarjeta(x, i === 0 && ord === "costo" && rows.length > 1 && x.p.est !== "porconfirmar"); }).join("");
    $("#mas").hidden = rows.length <= mostrar; $("#mas").textContent = "Ver más (" + (rows.length - mostrar) + ")";
  }
  function medidas() { var l = +$("#mL").value, a = +$("#mA").value, h = +$("#mH").value, d = $("#mD").checked, v = C.volumen(l, a, h, d); if (v) { $("#mR").textContent = num(l) + " × " + num(a) + " × " + num(h) + " cm" + (d ? " − 10 %" : "") + " = " + num(v, 1) + " litros"; $("#litros").value = v; calcular(true); } else $("#mR").textContent = ""; }
  function enlazar(a, b, k) { var A = $(a), B = $(b), me = false; A.addEventListener("input", function () { if (me) return; var v = parseFloat(A.value.replace(",", ".")); me = true; B.value = isNaN(v) ? "" : String(Math.round(v * k * 1000) / 1000); me = false; }); B.addEventListener("input", function () { if (me) return; var v = parseFloat(B.value.replace(",", ".")); me = true; A.value = isNaN(v) ? "" : String(Math.round(v / k * 1000) / 1000); me = false; }); }
  function regla() { var x = +$("#rX").value, y = +$("#rY").value, z = +$("#rZ").value, r = x / y * z; $("#rRes").textContent = x > 0 && y > 0 && z > 0 ? num(r, r < 10 ? 2 : 1) + " ml" : "—"; }
  function pestana(t) {
    [].forEach.call(root.querySelectorAll(".tabs button"), function (b) { b.setAttribute("aria-selected", b.dataset.t === t ? "true" : "false"); });
    [].forEach.call(root.querySelectorAll("[data-v]"), function (v) { v.hidden = v.dataset.v !== t; }); $("#cuerpo").scrollTop = 0;
  }

  function montar() {
    host = document.createElement("div"); host.id = "tmp-calculadora-flotante"; host.setAttribute("data-tmp", "calculadora");
    ["display:block", "position:static", "width:0", "height:0", "margin:0", "padding:0", "border:0", "overflow:visible", "visibility:visible", "opacity:1", "transform:none"].forEach(function (d) { var k = d.split(":"); host.style.setProperty(k[0], k[1], "important"); });   // la tienda no puede ocultarlo con sus reglas
    document.documentElement.appendChild(host);
    root = host.attachShadow({ mode: "open" });
    try { var hoja = new CSSStyleSheet(); hoja.replaceSync(CSS); root.adoptedStyleSheets = [hoja]; } catch (e) { var st = document.createElement("style"); st.textContent = CSS; root.appendChild(st); }
    var cont = document.createElement("div"); cont.innerHTML = MARCA; root.appendChild(cont.firstChild);
    $ = function (s) { return root.querySelector(s); }; fab = $("#fab"); panel = $("#panel"); vel = $("#vel"); cab = $("#cab");
    var g = LS.get(); $("#fam").innerHTML = '<option value="">Todas las categorías (' + P.length + ')</option>' + C.familias(P).map(function (k) { return '<option value="' + esc(k[0]) + '">' + esc(k[0]) + " (" + k[1] + ")</option>"; }).join("");
    if (g.litros) $("#litros").value = g.litros; if (g.agua) $("#agua").value = g.agua; if (g.fam) $("#fam").value = g.fam; if (g.orden) $("#orden").value = g.orden;
    ["#litros", "#q"].forEach(function (s) { $(s).addEventListener("input", function () { calcular(true); }); }); ["#agua", "#fam", "#orden"].forEach(function (s) { $(s).addEventListener("change", function () { calcular(true); }); });
    ["#mL", "#mA", "#mH", "#mD"].forEach(function (s) { $(s).addEventListener("input", medidas); }); $("#mas").addEventListener("click", function () { mostrar += LIM; calcular(false); });
    enlazar("#cG", "#cL", 3.78541); enlazar("#cM", "#cD", 20); ["#rX", "#rY", "#rZ"].forEach(function (s) { $(s).addEventListener("input", regla); });
    [].forEach.call(root.querySelectorAll(".tabs button"), function (b) { b.addEventListener("click", function () { pestana(b.dataset.t); }); });
    fab.addEventListener("click", alternar); $("#cerrar").addEventListener("click", function () { cerrar(); }); vel.addEventListener("click", function () { cerrar(); });
    $("#max").addEventListener("click", function () { maxim = !maxim; if (maxim) pos = null; distribuir(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && abierto) { cerrar(); e.stopPropagation(); } }, true);
    root.addEventListener("keydown", function (e) { if (e.key === "Escape" && abierto) { cerrar(); e.stopPropagation(); } });
    arrastre(); calcular(true); posicionar();
    window.addEventListener("resize", programar, { passive: true }); window.addEventListener("scroll", programar, { passive: true }); window.addEventListener("orientationchange", programar);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", programar);
    if (window.ResizeObserver) { var hd = document.querySelector("header"); if (hd) new ResizeObserver(programar).observe(hd); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(programar);
    window.addEventListener("load", function () { posicionar(); setTimeout(posicionar, 600); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar, { once: true }); else montar();
})();
