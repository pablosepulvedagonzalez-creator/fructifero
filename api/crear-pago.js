// Crea un pago en Mercado Pago (Checkout Pro) y devuelve el link de pago.
// Corre en el servidor (Vercel), así que tu clave secreta nunca llega al navegador.
// Los precios se recalculan aquí desde config.js: el cliente no puede alterarlos.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// config.js es el mismo archivo que usa la página; aquí se carga para recalcular precios.
const contexto = {};
vm.runInNewContext(fs.readFileSync(path.join(process.cwd(), 'config.js'), 'utf8'), contexto);
const { TIENDA, calcularPedido } = contexto.FRUCTIFERO;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Falta configurar MP_ACCESS_TOKEN en el servidor.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body) return res.status(400).json({ error: 'Pedido inválido.' });

  const pedido = calcularPedido(body.lineas);
  if (!pedido) return res.status(400).json({ error: 'Hay un producto o cantidad no válida en el carrito.' });

  const c = body.cliente || {};
  const limpio = (v, max) => String(v || '').trim().slice(0, max);
  const cliente = {
    nombre: limpio(c.nombre, 80),
    correo: limpio(c.correo, 120),
    telefono: limpio(c.telefono, 30),
    direccion: limpio(c.direccion, 160),
    comuna: limpio(c.comuna, 60),
    entrega: c.entrega === 'retiro' ? 'retiro' : 'despacho',
    zona: c.zona === 'region' ? 'region' : 'rm'
  };
  if (!cliente.nombre || !cliente.correo || (cliente.entrega === 'despacho' && (!cliente.direccion || !cliente.comuna))) {
    return res.status(400).json({ error: 'Faltan datos de entrega.' });
  }

  const sitio = (process.env.SITE_URL || ('https://' + req.headers.host)).replace(/\/$/, '');
  const pedidoId = 'FR-' + Date.now().toString(36).toUpperCase();

  const items = pedido.items.map((i) => ({
    id: i.id,
    title: i.nombre,
    quantity: i.cantidad,
    unit_price: i.precio,
    currency_id: 'CLP'
  }));

  const [nombre, ...resto] = cliente.nombre.split(' ');
  const preferencia = {
    items,
    payer: {
      name: nombre,
      surname: resto.join(' '),
      email: cliente.correo,
      address: { street_name: cliente.entrega === 'retiro' ? 'Retiro en ' + TIENDA.retiro : cliente.direccion + ', ' + cliente.comuna }
    },
    external_reference: pedidoId,
    statement_descriptor: TIENDA.nombre.toUpperCase().slice(0, 22),
    back_urls: {
      success: sitio + '/gracias.html?estado=aprobado&pedido=' + pedidoId,
      pending: sitio + '/gracias.html?estado=pendiente&pedido=' + pedidoId,
      failure: sitio + '/gracias.html?estado=rechazado&pedido=' + pedidoId
    },
    auto_return: 'approved',
    // Crédito: solo tarjetas de crédito (con las cuotas que ofrezca Mercado Pago).
    // Débito: solo débito y prepago, en 1 pago.
    payment_methods: body.cliente && body.cliente.pago === 'debito'
      ? { excluded_payment_types: [{ id: 'credit_card' }], installments: 1 }
      : { excluded_payment_types: [{ id: 'debit_card' }, { id: 'prepaid_card' }] },
    metadata: {
      pedido: pedidoId,
      telefono: cliente.telefono,
      entrega: cliente.entrega === 'retiro' ? 'Retiro en ' + TIENDA.retiro : (cliente.zona === 'region' ? 'Despacho a regiones (por pagar)' : 'Despacho RM'),
      direccion: cliente.direccion,
      comuna: cliente.comuna
    }
  };

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'X-Idempotency-Key': pedidoId
      },
      body: JSON.stringify(preferencia)
    });
    const data = await r.json();
    if (!r.ok || !data.init_point) {
      console.error('Mercado Pago respondió con error', r.status, data);
      return res.status(502).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo en unos minutos.' });
    }
    return res.status(200).json({ url: data.init_point, pedido: pedidoId, total: pedido.total });
  } catch (err) {
    console.error('Error conectando con Mercado Pago', err);
    return res.status(502).json({ error: 'No pudimos conectar con Mercado Pago. Intenta de nuevo.' });
  }
}
