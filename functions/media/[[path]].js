// Cloudflare Pages Function: dopočítává HTTP Range requesty pro videa.
//
// Asset server Cloudflare Pages na hlavičku Range odpoví celým souborem
// s kódem 200 a bez Accept-Ranges. Safari kvůli tomu video vůbec nepřehraje
// a Chrome ho neumí přetáčet (readyState spadne zpět na 1), což rozbíjí
// hero sekci, kde se video scrubuje podle scrollu. Tahle funkce sedí před
// /media/* a pro videa Range obslouží sama; obrázky propouští beze změny.

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i

export async function onRequest({ request, env }) {
  const url = new URL(request.url)

  // Obrázky a všechno ostatní jde rovnou z asset serveru — nemá smysl je
  // tahat přes funkci.
  if (!VIDEO_EXT.test(url.pathname)) {
    return env.ASSETS.fetch(request)
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    })
  }

  // Asset server umí jen celý soubor, tak si o něj řekneme bez Range.
  // Query string (?v=2 pro obejití cache) je potřeba odříznout, jinak
  // by se soubor nenašel.
  const assetUrl = new URL(url.toString())
  assetUrl.search = ''
  const assetRequest = new Request(assetUrl.toString(), { method: 'GET' })
  const asset = await env.ASSETS.fetch(assetRequest)

  if (!asset.ok) return asset

  const body = await asset.arrayBuffer()
  const total = body.byteLength

  const headers = new Headers()
  headers.set('content-type', asset.headers.get('content-type') || 'video/mp4')
  headers.set('accept-ranges', 'bytes')
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  const etag = asset.headers.get('etag')
  if (etag) headers.set('etag', etag)

  const range = request.headers.get('range')

  if (!range) {
    headers.set('content-length', String(total))
    return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers })
  }

  // Podporujeme jednoduchý tvar "bytes=start-end"; víc rozsahů naráz
  // prohlížeče u videa neposílají.
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
  if (!match) {
    headers.set('content-length', String(total))
    return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers })
  }

  const [, rawStart, rawEnd] = match
  let start
  let end

  if (rawStart === '') {
    // "bytes=-500" = posledních 500 bajtů
    const suffix = Number(rawEnd)
    if (!suffix) return unsatisfiable(total, headers)
    start = Math.max(total - suffix, 0)
    end = total - 1
  } else {
    start = Number(rawStart)
    end = rawEnd === '' ? total - 1 : Math.min(Number(rawEnd), total - 1)
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return unsatisfiable(total, headers)
  }

  headers.set('content-range', `bytes ${start}-${end}/${total}`)
  headers.set('content-length', String(end - start + 1))

  return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), {
    status: 206,
    headers,
  })
}

function unsatisfiable(total, headers) {
  headers.set('content-range', `bytes */${total}`)
  headers.delete('content-length')
  return new Response(null, { status: 416, headers })
}
