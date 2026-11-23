// ============================================================
//  FRUCTÍFERO — CONFIGURACIÓN DE LA TIENDA
//  Único archivo que necesitas editar: datos de contacto, envío,
//  productos, sabores y precios. Lo usan la página Y el cobro con
//  Mercado Pago, así que los precios de aquí son los que se cobran.
//  Precios en pesos chilenos, sin puntos.
// ============================================================

var FRUCTIFERO = (function () {

const TIENDA = {
  nombre: 'Fructífero',

  // WhatsApp para pedidos por transferencia y consultas.
  // Solo números, con código de país. Ej: '56912345678'
  whatsapp: '56964493032',
  correo: 'jorge.rivero.bugue@gmail.com',

  // Cuentas para pagos por transferencia (se muestran solo al elegir "Transferencia").
  // Puedes dejar una o varias: el cliente elige cuál usar.
  transferencia: [
    {
      titular: 'Jorge Ignacio Rivero Bugueño',
      rut: '19.841.227-9',
      banco: 'Mercado Pago',
      tipo: 'Cuenta Vista',
      numero: '1038651550',
      correo: 'jorge.rivero.bugue@gmail.com'
    },
    {
      titular: 'Jorge Ignacio Rivero Bugueño',
      rut: '19.841.227-9',
      banco: 'Banco Santander',
      tipo: 'Cuenta Vista',
      numero: '007058084020',
      correo: 'jorge.rivero.bugue@gmail.com'
    }
  ],
  instagram: '@fructifero.exe',

  zonaDespacho: 'la Región Metropolitana',
  plazoEntrega: '2 días hábiles',
  retiro: 'Huechuraba',   // comuna donde se puede retirar gratis

  // Envío: gratis en la Región Metropolitana desde este monto.
  // Bajo ese monto y a regiones, el envío es por pagar (lo paga el cliente al recibir).
  envioGratisDesde: 50000
};

// Nombres de los formatos que aparecen en la página.
const FORMATOS = {
  '1kg': '1 kg',
  '5kg': '5 kg',
  'unico': 'Precio único',
  'bolsa1kg': 'Bolsa o caja de 1 kg',
  '250g': '250 g',
  '350g': '350 g',
  '20u': '20 unidades',
  '200u': '200 unidades'
};

// Secciones de la tienda, en el orden en que se muestran.
const CATEGORIAS = [
  { id: 'confitados', nombre: 'Maní confitado', descripcion: 'Nuestro producto estrella: maní confitado en más de 50 sabores, además de almendras y semillas confitadas.' },
  { id: 'tostados', nombre: 'Maní tostado y japonés', descripcion: 'Maní tostado natural, salado o con sabores, y maní japonés crujiente.' },
  { id: 'chocolate', nombre: 'Bañados en chocolate', descripcion: 'Maní, frutos secos, café y soufflé cubiertos de chocolate.' },
  { id: 'frutos', nombre: 'Frutos secos, semillas y mixes', descripcion: 'Nueces, almendras, castañas, pistachos, pasas, semillas y mezclas listas para disfrutar.' },
  { id: 'dulces', nombre: 'Gomitas y dulces', descripcion: 'Gomitas Nicoland, Docile, regaliz y clásicos para compartir.' }
];

// Atajos para escribir menos
const kg = (p1, p5) => (p5 ? { '1kg': p1, '5kg': p5 } : { '1kg': p1 });
const slug = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Fotos: carpeta imagenes/productos/. Cada sabor o producto busca su foto por nombre.
const foto = (nombre) => 'imagenes/productos/' + nombre + '.jpg';
const sabores = (prefijo, lista, p1, p5) => lista.map((nombre) => ({ nombre, precios: kg(p1, p5), imagen: foto(prefijo + '-' + slug(nombre)) }));
const conFoto = (prefijo, lista) => lista.map((v) => ({ ...v, imagen: foto(prefijo + '-' + slug(v.nombre)) }));

// tipo 'tarjeta' = tarjeta con foto y selector de sabor/variedad
// tipo 'lista'   = fila en la lista de precios de su sección
// consultar: true = sin precio publicado, se consulta por WhatsApp
// ajuste: 'cubrir' = la foto llena todo el recuadro (si no, se muestra completa sobre fondo blanco)
const PRODUCTOS = [
  // ---------- MANÍ CONFITADO ----------
  {
    id: 'mani-confitado', categoria: 'confitados', tipo: 'tarjeta', etiqueta: '55 sabores',
    nombre: 'Maní confitado', imagen: 'imagenes/mani-confitado.jpg', ajuste: 'cubrir', variante: 'Sabor',
    descripcion: 'Crujiente, dulce y en el sabor que más te guste. Ideal para cumpleaños, eventos y para vender.',
    variantes: sabores('mani-confitado', [
      'Mix 33 sabores', 'Natural', 'Cookies & cream', 'Cereza', 'Guayaba', 'Miel', 'Con sésamo', 'Color rojo',
      'Naranja', 'Menta', 'Plátano', 'Piña', 'Mora', 'Guinda', 'Frambuesa', 'Damasco', 'Arándano', 'Arándano azul',
      'Cappuccino', 'Chirimoya', 'Chirimoya alegre', 'Maracuyá', 'Frutilla', 'Mango', 'Vainilla', 'Toffee',
      'Piña colada', 'Selva negra', 'Coco', 'Coco y menta', 'Moca', 'Sandía', 'Manzana', 'Limón', 'Limón piña',
      'Whisky', 'Melón tuna', 'Coca-Cola', 'Chocolate', 'Chocolate menta', 'Torta tres leches', 'Pisco sour',
      'Piscola', 'Ron blanco', 'Cola de mono', 'Mora crema', 'Durazno', 'Kiwi', 'Pan de Pascua', 'Papaya',
      'Lúcuma', 'Leche condensada', 'Leche con plátano', 'Suspiro limeño', 'Pistacho'
    ], 7500, 19000)
  },
  { id: 'mani-garrapinado', categoria: 'confitados', tipo: 'lista', nombre: 'Maní garrapiñado', variantes: [{ nombre: 'Maní garrapiñado', precios: kg(8500) }] },
  { id: 'almendras-confitadas-colores', categoria: 'confitados', tipo: 'lista', nombre: 'Almendras confitadas de colores', variantes: [{ nombre: 'Almendras confitadas de colores', precios: kg(13000) }] },
  { id: 'almendras-confitadas-estilo-mani', categoria: 'confitados', tipo: 'lista', nombre: 'Almendras confitadas estilo maní confitado', variantes: [{ nombre: 'Almendras confitadas estilo maní confitado', precios: kg(12000) }] },
  { id: 'semillas-zapallo-confitadas', categoria: 'confitados', tipo: 'lista', nombre: 'Semillas de zapallo confitadas', variantes: [{ nombre: 'Semillas de zapallo confitadas', precios: kg(8900) }] },
  { id: 'semillas-maravilla-confitadas', categoria: 'confitados', tipo: 'lista', nombre: 'Semillas de maravilla confitadas', variantes: [{ nombre: 'Semillas de maravilla confitadas', precios: kg(9500) }] },

  // ---------- MANÍ TOSTADO Y JAPONÉS ----------
  {
    id: 'mani-tostado', categoria: 'tostados', tipo: 'tarjeta', etiqueta: '12 variedades',
    nombre: 'Maní tostado', imagen: 'imagenes/mani-tostado.jpg', variante: 'Variedad',
    descripcion: 'Tostado en su punto: natural, salado, con pasas o con sabores para el aperitivo.',
    variantes: sabores('mani-tostado', [
      'Salado', 'Natural sin sal', 'Con pasas (mix) sin sal', 'Con pasas (mix) salado', 'Con cutícula',
      'Merkén', 'Ciboulette', 'Jamón serrano', 'Orégano', 'Queso', 'Habanero', 'Pebre'
    ], 7500, 20000)
  },
  {
    id: 'mani-japones', categoria: 'tostados', tipo: 'tarjeta', consultar: true,
    nombre: 'Maní japonés', imagen: '', variante: 'Sabor',
    descripcion: 'Crujiente maní japonés marca Crokissimo y saborizados Deleite. Precio por confirmar: consúltanos por WhatsApp.',
    variantes: [
      'Salado (Crokissimo)', 'Pimentón (Crokissimo)', 'Ciboulette (Crokissimo)', 'Merkén (Deleite)',
      'Jamón serrano (Deleite)', 'Habanero', 'Queso', 'Barbecue'
    ].map((nombre) => ({ nombre, precios: {}, imagen: foto('mani-japones-' + slug(nombre)) }))
  },
  { id: 'mani-con-vaina', categoria: 'tostados', tipo: 'lista', nombre: 'Maní con vaina (con cáscara)', variantes: [{ nombre: 'Maní con vaina (con cáscara)', precios: kg(9500) }] },

  // ---------- BAÑADOS EN CHOCOLATE ----------
  {
    id: 'banados-chocolate', categoria: 'chocolate', tipo: 'tarjeta', etiqueta: '15 variedades',
    nombre: 'Bañados en chocolate', imagen: 'imagenes/banados-chocolate.jpg', variante: 'Variedad',
    descripcion: 'Maní, pasas, almendras, avellanas, café y más, con una capa generosa de chocolate.',
    variantes: conFoto('chocolate', [
      { nombre: 'Maní bañado en chocolate (Tifany)', precios: kg(8500, 35000) },
      { nombre: 'Maní bañado en chocolate blanco', precios: kg(8200, 30000) },
      { nombre: 'Mix maní choco blanco y negro', precios: kg(8200, 30000) },
      { nombre: 'Maní choco naranja', precios: kg(8200, 30000) },
      { nombre: 'Maní choco frambuesa', precios: kg(8200, 30000) },
      { nombre: 'Maní choco plátano', precios: kg(8200, 30000) },
      { nombre: 'Maní choco coco', precios: kg(8200, 30000) },
      { nombre: 'Maní choco menta', precios: kg(8200, 30000) },
      { nombre: 'Maní choco frutos del bosque', precios: kg(8200, 30000) },
      { nombre: 'Pasas bañadas en chocolate', precios: kg(8500, 33500) },
      { nombre: 'Avellanas bañadas en chocolate', precios: kg(17500, 75000) },
      { nombre: 'Almendras bañadas en chocolate', precios: kg(19000) },
      { nombre: 'Cranberries bañados en chocolate', precios: kg(20000) },
      { nombre: 'Granos de café bañados en chocolate', precios: kg(20000) },
      { nombre: 'Coco bañado en chocolate (redondo)', precios: kg(19000) }
    ])
  },
  {
    id: 'souffle-chocolate', categoria: 'chocolate', tipo: 'tarjeta',
    nombre: 'Soufflé y minicholitos', imagen: 'imagenes/minicholitos.jpg', variante: 'Variedad',
    descripcion: 'Soufflé crujiente bañado en chocolate, en bolitas clásicas o minicholitos.',
    variantes: conFoto('chocolate', [
      { nombre: 'Soufflé bañado en chocolate (Cholitos)', precios: kg(7200, 26000) },
      { nombre: 'Soufflé bañado en chocolate blanco y negro', precios: kg(7200, 26000) },
      { nombre: 'Minicholitos blanco y negro', precios: kg(7200, 28000) }
    ])
  },

  // ---------- FRUTOS SECOS, SEMILLAS Y MIXES (1 kg) ----------
  ...[
    ['nueces-mariposa', 'Nueces mariposa amarilla', 15000],
    ['almendras', 'Almendras naturales', 19000],
    ['caju', 'Castañas de cajú naturales', 16000],
    ['pistachos', 'Pistachos', 26000],
    ['avellanas', 'Avellanas europeas peladas tostadas', 20000],
    ['mambo-mix', 'Mambo mix (cranberries, cajú, almendra, nuez, pasas, maravilla, zapallo, plátano, coco)', 25000],
    ['mix-frutos-secos', 'Mix frutos secos (nuez, almendra, maní, pasas)', 10000],
    ['mix-especial', 'Mix especial (maní, pasas, coco laminado, frutos cubitos)', 10000],
    ['pasas-negras', 'Pasas negras', 9000],
    ['pasas-rubias', 'Pasas rubias', 10500],
    ['pasas-extra-rubias', 'Pasas extra rubias', 10900],
    ['banana-chips', 'Banana chips', 12000],
    ['bayas-goji', 'Bayas de goji', 20000],
    ['semillas-zapallo', 'Semillas de zapallo naturales', 13000],
    ['chia', 'Chía', 12000],
    ['linaza', 'Linaza', 9500],
    ['quinoa', 'Quinoa', 9800],
    ['flor-jamaica', 'Flor de Jamaica', 20000],
    ['maiz-curagua', 'Maíz curagua para cabritas', 4200]
  ].map(([id, nombre, precio]) => ({ id, categoria: 'frutos', tipo: 'lista', nombre, variantes: [{ nombre, precios: kg(precio) }] })),

  // ---------- GOMITAS Y DULCES ----------
  {
    id: 'gomitas-nicoland', categoria: 'dulces', tipo: 'tarjeta',
    nombre: 'Gomitas Nicoland', imagen: 'imagenes/gomitas-nicoland.jpg',
    descripcion: 'Variedad de gomitas Nicoland en sus formas y sabores más populares.',
    variantes: [{ nombre: 'Gomitas Nicoland', precios: { bolsa1kg: 10500 } }]
  },
  {
    id: 'gomitas-docile', categoria: 'dulces', tipo: 'tarjeta',
    nombre: 'Gomitas Docile', imagen: 'imagenes/gomitas-docile.jpg',
    descripcion: 'Gomitas Docile: frutillas, ositos, dientes, gusanos y muchas más.',
    variantes: [{ nombre: 'Gomitas Docile', precios: { bolsa1kg: 12500 } }]
  },
  {
    id: 'gomitas-regaliz', categoria: 'dulces', tipo: 'tarjeta',
    nombre: 'Gomitas regaliz', imagen: 'imagenes/gomitas-regaliz.jpg',
    descripcion: 'Cintas y tiras de regaliz ácido, en colores y sabores surtidos.',
    variantes: [{ nombre: 'Gomitas regaliz', precios: { bolsa1kg: 15000 } }]
  },
  { id: 'gomones', categoria: 'dulces', tipo: 'lista', nombre: 'Gomones', variantes: [{ nombre: 'Gomones', precios: kg(7000) }] },
  { id: 'guaguitas', categoria: 'dulces', tipo: 'lista', nombre: 'Guaguitas', variantes: [{ nombre: 'Guaguitas', precios: kg(9000) }] },
  { id: 'cherry-sour', categoria: 'dulces', tipo: 'lista', nombre: 'Cherry sour', variantes: [{ nombre: 'Cherry sour', precios: kg(9500) }] },
  { id: 'polulos', categoria: 'dulces', tipo: 'lista', nombre: 'Polulos', variantes: [{ nombre: 'Polulos', precios: { '350g': 4000 } }] },
  { id: 'manjar', categoria: 'dulces', tipo: 'lista', nombre: 'Manjar', variantes: [{ nombre: 'Manjar', precios: { '250g': 4500 } }] },
  { id: 'chupones-manjar', categoria: 'dulces', tipo: 'lista', nombre: 'Chupones de manjar', variantes: [{ nombre: 'Chupones de manjar', precios: { '20u': 18000 } }] },
  { id: 'chicles', categoria: 'dulces', tipo: 'lista', nombre: 'Frasco de chicles', variantes: [{ nombre: 'Frasco de chicles', precios: { '200u': 20000 } }] }
];

// Productos de una sola variedad: su foto es imagenes/productos/<id>.jpg
PRODUCTOS.forEach((p) => {
  if (p.variantes.length === 1 && !p.variantes[0].imagen) p.variantes[0].imagen = foto(p.id);
});

// ---- No necesitas editar nada debajo de esta línea ----

function precioDe(producto, varianteIdx, formatoId) {
  const v = producto && producto.variantes[varianteIdx];
  if (!v || v.precios[formatoId] == null) return null;
  return v.precios[formatoId];
}

function nombreLinea(producto, varianteIdx, formatoId) {
  const v = producto.variantes[varianteIdx];
  const base = producto.variantes.length > 1 ? producto.nombre + ' · ' + v.nombre : producto.nombre;
  return formatoId === 'unico' ? base : base + ' (' + (FORMATOS[formatoId] || formatoId) + ')';
}

// lineas: [{ producto, variante, formato, cantidad }]. Devuelve null si algo no es válido.
function calcularPedido(lineas) {
  if (!Array.isArray(lineas) || lineas.length === 0 || lineas.length > 60) return null;
  const items = [];
  let subtotal = 0;
  for (const l of lineas) {
    const p = PRODUCTOS.find((x) => x.id === l.producto);
    const vi = Number(l.variante);
    const q = Number(l.cantidad);
    if (!p || p.consultar || !Number.isInteger(vi) || !Number.isInteger(q) || q < 1 || q > 99) return null;
    const unit = precioDe(p, vi, l.formato);
    if (unit == null) return null;
    subtotal += unit * q;
    items.push({ id: p.id + '-' + vi + '-' + l.formato, nombre: nombreLinea(p, vi, l.formato), cantidad: q, precio: unit });
  }
  // La tienda no cobra el envío: es gratis o por pagar al recibir.
  return { items, subtotal, envio: 0, total: subtotal };
}

// entrega: { tipo: 'despacho' | 'retiro', zona: 'rm' | 'region' }
function textoEnvio(subtotal, entrega) {
  if (entrega && entrega.tipo === 'retiro') return 'Gratis (retiro en ' + TIENDA.retiro + ')';
  if (entrega && entrega.zona === 'region') return 'Por pagar al recibir';
  if (subtotal >= TIENDA.envioGratisDesde) return entrega ? 'Gratis' : 'Gratis en la RM';
  return entrega ? 'Por pagar al recibir' : 'Por pagar o retiro gratis';
}

return { TIENDA, FORMATOS, CATEGORIAS, PRODUCTOS, slug, precioDe, nombreLinea, calcularPedido, textoEnvio };
})();
