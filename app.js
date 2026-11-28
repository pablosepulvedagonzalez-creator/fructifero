(function () {
'use strict';
const { TIENDA, FORMATOS, CATEGORIAS, PRODUCTOS, precioDe, nombreLinea, calcularPedido, textoEnvio } = FRUCTIFERO;

const $ = (sel) => document.querySelector(sel);
const dinero = (n) => '$' + Math.round(n).toLocaleString('es-CL');
const normal = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const CLAVE = 'fructifero-carrito-v2';
const ORDEN_FORMATOS = Object.keys(FORMATOS);

// ---------- Estado ----------
let carrito = cargar();   // { 'mani-confitado|3|1kg': 2 }
const eleccion = {};      // { productoId: { v: 0, f: '1kg' } }

function cargar() {
  try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { return {}; }
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch { /* sin almacenamiento */ }
}
function lineas() {
  return Object.entries(carrito).map(([k, cantidad]) => {
    const [producto, v, formato] = k.split('|');
    return { producto, variante: Number(v), formato, cantidad };
  }).filter((l) => {
    const p = PRODUCTOS.find((x) => x.id === l.producto);
    return p && !p.consultar && precioDe(p, l.variante, l.formato) != null;
  });
}
const formatosDe = (p, vi) => ORDEN_FORMATOS.filter((f) => p.variantes[vi] && p.variantes[vi].precios[f] != null);

// ---------- Utilidad para crear elementos ----------
function el(tag, attrs = {}, ...hijos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  hijos.flat().forEach((h) => h != null && h !== false && e.append(h));
  return e;
}
function svg(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
const ICONO_MAS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const ICONO_WSP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/></svg>';

// ---------- Datos de la tienda en la página ----------
function rellenarTienda() {
  const valores = {
    envioGratis: dinero(TIENDA.envioGratisDesde),
    retiro: TIENDA.retiro,
    zonaDespacho: TIENDA.zonaDespacho,
    plazoEntrega: TIENDA.plazoEntrega,
    instagram: 'Instagram: ' + TIENDA.instagram
  };
  document.querySelectorAll('[data-tienda]').forEach((e) => {
    const k = e.dataset.tienda;
    if (k === 'correoLink') { e.href = 'mailto:' + TIENDA.correo; e.textContent = TIENDA.correo; }
    else if (k === 'whatsappLink') { e.href = 'https://wa.me/' + TIENDA.whatsapp; }
    else if (k === 'instagramLink') { e.href = 'https://www.instagram.com/' + TIENDA.instagram.replace(/^@/, '') + '/'; e.textContent = 'Instagram ' + TIENDA.instagram; }
    else if (k in valores) e.textContent = valores[k];
  });
  $('#anio').textContent = new Date().getFullYear();
  const wsp = $('#wsp-flotante');
  const ig = $('#ig-flotante');
  if (ig) { ig.href = 'https://www.instagram.com/' + TIENDA.instagram.replace(/^@/, '') + '/'; ig.title = 'Instagram ' + TIENDA.instagram; }
  if (wsp) wsp.href = 'https://wa.me/' + TIENDA.whatsapp + '?text=' + encodeURIComponent('Hola Fructífero, tengo una consulta.');
}

// ---------- Botón "Agregar" con confirmación ----------
function botonAgregar(texto, alAgregar, clase = 'btn btn-primario btn-bloque') {
  const etiqueta = el('span', {}, texto);
  const b = el('button', { type: 'button', class: clase }, svg(ICONO_MAS), etiqueta);
  b.addEventListener('click', () => {
    alAgregar();
    b.classList.add('btn-agregado');
    etiqueta.textContent = 'Agregado';
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.classList.remove('btn-agregado'); etiqueta.textContent = texto; }, 1500);
  });
  return b;
}

// ---------- Tarjetas ----------
const tarjetas = []; // { p, nodo, textoBusqueda, select }

function crearTarjeta(p) {
  eleccion[p.id] = { v: 0, f: formatosDe(p, 0)[0] };

  const fuente = () => (p.variantes[eleccion[p.id].v] || {}).imagen || p.imagen;
  let imagen, foto = null;
  if (fuente()) {
    foto = el('img', { src: fuente(), alt: p.nombre, loading: 'lazy', width: '320', height: '320' });
    imagen = el('div', { class: 'producto-img foto-fondo' }, foto);
  } else {
    imagen = el('div', { class: 'producto-img sin-foto', style: 'background:#EDE4D3' },
      svg('<svg width="40" height="40" viewBox="0 0 34 34" aria-hidden="true"><path d="M17,5 C25,9 26,20 23,25 C21,28 13,28 11,25 C8,20 9,9 17,5Z" fill="#C47A2C"/><path d="M17,9 C16,15 16,20 17,26" stroke="#23402F" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'),
      el('span', {}, p.nombre));
  }
  if (p.etiqueta) imagen.append(el('span', { class: 'etiqueta' }, p.etiqueta));

  const precio = el('span', { class: 'precio' });
  const pills = el('div', { class: 'formatos', role: 'group', 'aria-label': 'Formato de ' + p.nombre });
  let select = null;

  const pintar = () => {
    const { v, f } = eleccion[p.id];
    if (foto) {
      const src = fuente();
      if (foto.getAttribute('src') !== src) foto.src = src;
      foto.alt = p.variantes.length > 1 ? p.nombre + ' ' + p.variantes[v].nombre : p.nombre;
    }
    if (p.consultar) { precio.textContent = 'Consultar'; return; }
    precio.textContent = dinero(precioDe(p, v, f));
    const disp = formatosDe(p, v);
    if (disp.length === 1) {
      pills.replaceChildren(disp[0] === 'unico' ? '' : el('span', { class: 'formato-unico' }, 'Formato ' + FORMATOS[disp[0]]));
      return;
    }
    pills.replaceChildren(...disp.map((fid) => el('button', {
      type: 'button', class: 'pill', 'aria-pressed': String(fid === f),
      onclick: () => { eleccion[p.id].f = fid; pintar(); }
    }, FORMATOS[fid])));
  };

  const cuerpo = el('div', { class: 'producto-cuerpo' },
    el('div', { class: 'producto-fila' }, el('h3', {}, p.nombre), precio),
    el('p', {}, p.descripcion));

  if (p.variantes.length > 1) {
    const id = 'sel-' + p.id;
    select = el('select', { id, onchange: (e) => {
      const v = Number(e.target.value);
      const disp = formatosDe(p, v);
      eleccion[p.id] = { v, f: disp.includes(eleccion[p.id].f) ? eleccion[p.id].f : disp[0] };
      pintar();
    } }, p.variantes.map((va, i) => el('option', { value: String(i) }, va.nombre)));
    cuerpo.append(el('label', { class: 'selector', for: id }, (p.variante || 'Variedad') + ' (' + p.variantes.length + ' opciones)', select));
  }

  if (p.consultar) {
    const b = el('a', { class: 'btn btn-wsp btn-bloque', target: '_blank', rel: 'noopener', href: '#' }, svg(ICONO_WSP), 'Consultar precio por WhatsApp');
    b.addEventListener('click', () => {
      const v = p.variantes[eleccion[p.id].v];
      b.href = 'https://wa.me/' + TIENDA.whatsapp + '?text=' + encodeURIComponent('Hola Fructífero, quiero consultar precio y disponibilidad de ' + p.nombre + (v ? ' sabor ' + v.nombre : '') + '.');
    });
    cuerpo.append(b);
  } else {
    cuerpo.append(pills, botonAgregar('Agregar al carrito', () => agregar(p, eleccion[p.id].v, eleccion[p.id].f)));
  }

  pintar();
  const nodo = el('article', { class: 'producto' }, imagen, cuerpo);
  tarjetas.push({ p, nodo, select, pintar, texto: normal(p.nombre + ' ' + p.variantes.map((v) => v.nombre).join(' ')) });
  return nodo;
}

// ---------- Tarjetas compactas (productos de una variedad) ----------
const filas = []; // { nodo, texto }

function crearFila(p) {
  const f = formatosDe(p, 0)[0];
  const v = p.variantes[0];
  const nodo = el('article', { class: 'mini' },
    el('div', { class: 'mini-img' }, el('img', { src: v.imagen || '', alt: p.nombre, loading: 'lazy', width: '320', height: '320' })),
    el('div', { class: 'mini-cuerpo' },
      el('h4', {}, p.nombre),
      el('div', { class: 'mini-precio' }, el('strong', {}, dinero(precioDe(p, 0, f))), el('span', {}, FORMATOS[f])),
      botonAgregar('Agregar', () => agregar(p, 0, f), 'btn btn-primario btn-bloque btn-chico')));
  filas.push({ nodo, texto: normal(p.nombre) });
  return nodo;
}

// ---------- Catálogo ----------
const secciones = []; // { nodo, tarjetas: [], filas: [] }

function pintarCatalogo() {
  const nav = $('#cat-nav');
  const cont = $('#catalogo');
  CATEGORIAS.forEach((c) => {
    const prods = PRODUCTOS.filter((p) => p.categoria === c.id);
    if (!prods.length) return;
    const deTarjeta = prods.filter((p) => p.tipo === 'tarjeta');
    const deLista = prods.filter((p) => p.tipo !== 'tarjeta');
    const opciones = prods.reduce((s, p) => s + p.variantes.length, 0);

    nav.append(el('a', { href: '#cat-' + c.id }, c.nombre));

    const sec = el('section', { class: 'categoria', id: 'cat-' + c.id, 'aria-labelledby': 'tit-' + c.id },
      el('div', { class: 'categoria-cabeza' },
        el('div', {}, el('h3', { id: 'tit-' + c.id }, c.nombre), el('p', {}, c.descripcion)),
        el('span', { class: 'categoria-cuenta' }, opciones + (opciones === 1 ? ' producto' : ' productos'))));

    const t0 = tarjetas.length, f0 = filas.length;
    const grilla = deTarjeta.length ? el('div', { class: 'grilla' }, deTarjeta.map(crearTarjeta)) : null;
    const lista = deLista.length ? el('div', { class: 'lista' },
      deTarjeta.length ? el('h4', { class: 'lista-titulo' }, 'Más productos de esta sección') : null,
      el('div', { class: 'minis' }, deLista.map(crearFila))) : null;
    if (grilla && lista && deTarjeta.length === 1) sec.append(el('div', { class: 'duo' }, grilla, lista));
    else { if (grilla) sec.append(grilla); if (lista) sec.append(lista); }
    cont.append(sec);
    secciones.push({ nodo: sec, lista: sec.querySelector('.lista'), tarjetas: tarjetas.slice(t0), filas: filas.slice(f0) });
  });
}

function buscar(q) {
  const n = normal(q.trim());
  let total = 0;
  secciones.forEach((s) => {
    let vis = 0;
    s.tarjetas.forEach((t) => {
      const ok = !n || t.texto.includes(n);
      t.nodo.hidden = !ok;
      if (ok) vis++;
      if (ok && n && t.select && !normal(t.p.nombre).includes(n)) {
        const i = t.p.variantes.findIndex((v) => normal(v.nombre).includes(n));
        if (i >= 0 && i !== eleccion[t.p.id].v) { t.select.value = String(i); t.select.dispatchEvent(new Event('change')); }
      }
    });
    let visF = 0;
    s.filas.forEach((f) => { const ok = !n || f.texto.includes(n); f.nodo.hidden = !ok; if (ok) visF++; });
    if (s.lista) s.lista.hidden = visF === 0;
    s.nodo.hidden = vis + visF === 0;
    total += vis + visF;
  });
  $('#sin-resultados').hidden = total > 0;
}

// ---------- Carrito ----------
let avisoTimer;
function agregar(p, v, f) {
  const k = p.id + '|' + v + '|' + f;
  carrito[k] = Math.min(99, (carrito[k] || 0) + 1);
  guardar();
  pintarCarrito();
  $('#aviso-texto').textContent = nombreLinea(p, v, f) + ' agregado';
  $('#aviso').hidden = false;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => { $('#aviso').hidden = true; }, 2600);
}

function cambiar(k, cantidad) {
  if (cantidad <= 0) delete carrito[k]; else carrito[k] = Math.min(99, cantidad);
  guardar();
  pintarCarrito();
}

function pintarCarrito() {
  const ls = lineas();
  const pedido = ls.length ? calcularPedido(ls) : null;
  const cuenta = ls.reduce((s, l) => s + l.cantidad, 0);
  $('#contador').textContent = cuenta;
  $('#abrir-carrito').setAttribute('aria-label', 'Abrir carrito, ' + cuenta + ' productos');

  $('#vacio').hidden = ls.length > 0;
  const cont = $('#lineas');
  cont.replaceChildren();
  ls.forEach((l) => {
    const p = PRODUCTOS.find((x) => x.id === l.producto);
    const k = l.producto + '|' + l.variante + '|' + l.formato;
    const unit = precioDe(p, l.variante, l.formato);
    const sub = (p.variantes.length > 1 ? p.variantes[l.variante].nombre + ' · ' : '') + FORMATOS[l.formato];
    const img = (p.variantes[l.variante] || {}).imagen || p.imagen;
    const miniatura = img
      ? el('div', { class: 'linea-img', style: 'background:#fff' }, el('img', { src: img, alt: '' }))
      : el('div', { class: 'linea-img', style: 'background:#EDE4D3' }, svg('<svg width="26" height="26" viewBox="0 0 34 34" aria-hidden="true"><path d="M17,5 C25,9 26,20 23,25 C21,28 13,28 11,25 C8,20 9,9 17,5Z" fill="#C47A2C"/></svg>'));
    cont.append(el('div', { class: 'linea' },
      miniatura,
      el('div', { class: 'linea-info' },
        el('strong', {}, p.nombre),
        el('small', {}, sub + ' · ' + dinero(unit) + ' c/u'),
        el('div', { class: 'cantidad' },
          el('button', { type: 'button', class: 'redondo', 'aria-label': 'Quitar uno', onclick: () => cambiar(k, l.cantidad - 1) }, '−'),
          el('span', {}, String(l.cantidad)),
          el('button', { type: 'button', class: 'redondo', 'aria-label': 'Agregar uno', onclick: () => cambiar(k, l.cantidad + 1) }, '+'))),
      el('div', { class: 'linea-total' },
        el('span', {}, dinero(unit * l.cantidad)),
        el('button', { type: 'button', onclick: () => cambiar(k, 0) }, 'Eliminar'))
    ));
  });

  $('#pie').hidden = !pedido;
  if (!pedido) { mostrarPaso('carrito'); return; }
  const faltan = Math.max(0, TIENDA.envioGratisDesde - pedido.subtotal);
  const ent = entregaElegida();
  const mostrarProgreso = $('#paso-datos').hidden || (ent.tipo === 'despacho' && ent.zona === 'rm');
  $('#progreso').hidden = faltan === 0 || !mostrarProgreso;
  $('#faltan').textContent = dinero(faltan);
  $('#barra').style.width = Math.min(100, Math.round(pedido.subtotal / TIENDA.envioGratisDesde * 100)) + '%';
  $('#subtotal').textContent = dinero(pedido.subtotal);
  $('#envio').textContent = textoEnvio(pedido.subtotal, $('#paso-datos').hidden ? null : entregaElegida());
  $('#total').textContent = dinero(pedido.total);
  actualizarBotonPago();
}

function mostrarPaso(paso) {
  const datos = paso === 'datos';
  $('#paso-carrito').hidden = datos;
  $('#paso-datos').hidden = !datos;
  $('#continuar').hidden = datos;
  $('#confirmar').hidden = !datos;
  $('#volver').hidden = !datos;
  $('#carrito-titulo').textContent = datos ? 'Datos de entrega' : 'Tu carrito';
  if (datos) actualizarEntrega(); else pintarEnvioCarrito();
  $('#error').hidden = true;
}

// ---------- Datos de transferencia ----------
const CUENTAS = [].concat(TIENDA.transferencia || []);
const T = CUENTAS.length > 0;
const textoCuenta = (c) => [
  'Titular: ' + c.titular, 'RUT: ' + c.rut, 'Banco: ' + c.banco,
  'Tipo de cuenta: ' + c.tipo, 'N° de cuenta: ' + c.numero, 'Correo: ' + c.correo
].join('\n');
function pintarBanco() {
  if (!T) return;
  $('#copiar-banco').hidden = true;
  $('#banco-lista').replaceChildren(...CUENTAS.map((c) => {
    const boton = el('button', { type: 'button', class: 'btn btn-borde btn-chico' }, 'Copiar datos ' + c.banco);
    boton.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(textoCuenta(c)); boton.textContent = 'Datos copiados'; }
      catch { boton.textContent = 'Selecciona y copia los datos'; }
      setTimeout(() => { boton.textContent = 'Copiar datos ' + c.banco; }, 2000);
    });
    return el('div', { class: 'cuenta' },
      el('p', { class: 'cuenta-banco' }, c.banco + ' · ' + c.tipo),
      el('dl', {}, [['Titular', c.titular], ['RUT', c.rut], ['N° de cuenta', c.numero], ['Correo', c.correo]]
        .map(([k, v]) => el('div', {}, el('dt', {}, k), el('dd', {}, v)))),
      boton);
  }));
}

function pintarEnvioCarrito() {
  const ls = lineas();
  const p = ls.length ? calcularPedido(ls) : null;
  if (p) $('#envio').textContent = textoEnvio(p.subtotal, null);
}
function entregaElegida() {
  const f = new FormData($('#paso-datos'));
  return { tipo: f.get('entrega') || 'despacho', zona: f.get('zona') || 'rm' };
}
function actualizarEntrega() {
  const e = entregaElegida();
  $('#campos-despacho').hidden = e.tipo !== 'despacho';
  $('#etq-comuna').textContent = e.zona === 'region' ? 'Comuna y región' : 'Comuna';
  const ls = lineas();
  const p = ls.length ? calcularPedido(ls) : null;
  let nota = '';
  if (e.tipo === 'retiro') nota = 'Retiro gratis en ' + TIENDA.retiro + '. Te escribiremos por WhatsApp para coordinar el día y la dirección.';
  else if (e.zona === 'region') nota = 'Envío a regiones por pagar: el costo lo pagas a la empresa de transporte al recibir.';
  else if (p && p.subtotal >= TIENDA.envioGratisDesde) nota = '¡Tu envío en la Región Metropolitana es gratis!';
  else nota = 'Bajo ' + dinero(TIENDA.envioGratisDesde) + ' el envío es por pagar al recibir. Si prefieres, elige retiro gratis en ' + TIENDA.retiro + '.';
  $('#nota-envio').textContent = nota;
  if (p) {
    $('#envio').textContent = textoEnvio(p.subtotal, e);
    const faltan = Math.max(0, TIENDA.envioGratisDesde - p.subtotal);
    $('#progreso').hidden = faltan === 0 || !(e.tipo === 'despacho' && e.zona === 'rm');
  }
}

function actualizarBotonPago() {
  const ls = lineas();
  const pedido = ls.length ? calcularPedido(ls) : null;
  const medio = new FormData($('#paso-datos')).get('pago');
  $('#datos-banco').hidden = !(medio === 'transferencia' && T);
  const total = pedido ? ' · ' + dinero(pedido.total) : '';
  const etiquetas = { transferencia: 'Enviar pedido por WhatsApp', debito: 'Pagar con débito', credito: 'Pagar con crédito' };
  $('#confirmar').textContent = (etiquetas[medio] || 'Pagar con Mercado Pago') + total;
}

let ultimoFoco;
function abrir() {
  ultimoFoco = document.activeElement;
  $('#aviso').hidden = true;
  $('#carrito').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#carrito .carrito-cabeza button').focus();
}
function cerrar() {
  $('#carrito').hidden = true;
  document.body.style.overflow = '';
  if (ultimoFoco) ultimoFoco.focus();
}

// ---------- Envío del pedido ----------
function error(msg) { const e = $('#error'); e.textContent = msg; e.hidden = !msg; }

async function enviar(ev) {
  ev.preventDefault();
  const d = Object.fromEntries(new FormData($('#paso-datos')));
  const ent = entregaElegida();
  const requeridos = ent.tipo === 'despacho' ? ['nombre', 'correo', 'telefono', 'direccion', 'comuna'] : ['nombre', 'correo', 'telefono'];
  for (const k of ['nombre', 'correo', 'telefono', 'direccion', 'comuna']) d[k] = (d[k] || '').trim();
  for (const k of requeridos) if (!d[k]) return error('Completa todos los campos para continuar.');
  d.entrega = ent.tipo; d.zona = ent.zona;
  const envioTxt = textoEnvio(calcularPedido(lineas()) ? calcularPedido(lineas()).subtotal : 0, ent);
  const entregaTxt = ent.tipo === 'retiro' ? 'Retiro en ' + TIENDA.retiro
    : 'Despacho a ' + d.direccion + ', ' + d.comuna + (ent.zona === 'region' ? ' (regiones)' : ' (RM)');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo)) return error('Revisa tu correo electrónico.');
  error('');

  const ls = lineas();
  const pedido = calcularPedido(ls);
  if (!pedido) return error('Tu carrito tiene un problema. Vuelve a agregar los productos.');

  if (d.pago === 'transferencia') {
    const texto = [
      'Hola Fructífero, quiero hacer este pedido (pago por transferencia):',
      '',
      ...pedido.items.map((i) => '• ' + i.cantidad + ' x ' + i.nombre + ' — ' + dinero(i.precio * i.cantidad)),
      '',
      'Subtotal: ' + dinero(pedido.subtotal),
      'Envío: ' + envioTxt,
      'Total productos: ' + dinero(pedido.total),
      '',
      'Nombre: ' + d.nombre,
      'Correo: ' + d.correo,
      'Teléfono: ' + d.telefono,
      'Entrega: ' + entregaTxt
    ].join('\n');
    window.open('https://wa.me/' + TIENDA.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    carrito = {}; guardar(); pintarCarrito(); cerrar();
    location.href = 'gracias.html?estado=transferencia';
    return;
  }

  const boton = $('#confirmar');
  boton.disabled = true;
  boton.textContent = 'Conectando con Mercado Pago…';
  try {
    const r = await fetch('/api/crear-pago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineas: ls, cliente: d })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.url) throw new Error(data.error || 'No pudimos iniciar el pago.');
    location.href = data.url;
  } catch (e) {
    error(e.message + ' Si el problema sigue, elige transferencia o escríbenos.');
    boton.disabled = false;
    actualizarBotonPago();
  }
}

// ---------- Inicio ----------
rellenarTienda();
pintarBanco();
pintarCatalogo();
pintarCarrito();
mostrarPaso('carrito');

let busquedaTimer;
$('#buscar').addEventListener('input', (e) => { clearTimeout(busquedaTimer); busquedaTimer = setTimeout(() => buscar(e.target.value), 120); });
$('#abrir-carrito').addEventListener('click', abrir);
$('#aviso-ver').addEventListener('click', abrir);
document.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', cerrar));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#carrito').hidden) cerrar(); });
$('#continuar').addEventListener('click', () => { mostrarPaso('datos'); $('#paso-datos input').focus(); });
$('#volver').addEventListener('click', () => mostrarPaso('carrito'));
$('#paso-datos').addEventListener('change', () => { actualizarBotonPago(); actualizarEntrega(); });
$('#paso-datos').addEventListener('submit', enviar);

})();
