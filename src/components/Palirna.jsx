import { useEffect, useRef, useState } from 'react'
import { Phone } from 'lucide-react'

const PALIRNA = { name: 'Josef Vojkůvka', phone: '+420 733 531 233' }

// Kurzorové „kukátko“: přes základní fotku kotle se maskou (radiální gradient
// kreslený do canvasu) odhaluje druhý obrázek — průřez, co se děje uvnitř.
// Na dotykových zařízeních (bez kurzoru) putuje reflektor po kotli podle scrollu.

// Rozměr zdrojových obrázků a změřené zarovnání průřezu vůči základu
// (průřez je ~2 % větší a posunutý — kompenzuje se transformací za běhu).
const IMG_W = 1672
const IMG_H = 941
const ALIGN = { dx: 56, dy: -4, scale: 0.98 }

function RevealLayer({ image, cursorX, cursorY }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [imgReady, setImgReady] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setImgReady(true)
    img.src = image
    imgRef.current = img
  }, [image])

  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      const w = parent.offsetWidth
      const h = parent.offsetHeight
      // Změna rozměru maže canvas — resize jen když se velikost opravdu změnila
      if (canvas.width === w && canvas.height === h) return
      canvas.width = w
      canvas.height = h
      setSize({ w, h })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Kreslí se přímo do viditelného canvasu (obrázek + gradient přes
  // destination-in) — žádná CSS maska z data URL, tudíž žádné problikávání
  // při rychlém pohybu kurzoru.
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !canvas.width || !img || !img.complete || !img.naturalWidth) return
    const ctx = canvas.getContext('2d')
    const { width: w, height: h } = canvas

    ctx.clearRect(0, 0, w, h)

    const radius = Math.min(260, w * 0.32)
    if (cursorX < -radius || cursorY < -radius) return

    // Cover mapování + kompenzace zarovnání (scale kolem středu, pak posun)
    const coverScale = Math.max(w / IMG_W, h / IMG_H)
    const drawScale = coverScale * ALIGN.scale
    const drawW = IMG_W * drawScale
    const drawH = IMG_H * drawScale
    const dx = (w - drawW) / 2 + ALIGN.dx * coverScale
    const dy = (h - drawH) / 2 + ALIGN.dy * coverScale

    ctx.save()
    ctx.drawImage(img, dx, dy, drawW, drawH)

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, radius)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }, [cursorX, cursorY, imgReady, size])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    />
  )
}

export default function Palirna() {
  const sectionRef = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const loopRef = useRef(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const isTouch =
      window.matchMedia('(hover: none), (pointer: coarse)').matches || 'ontouchstart' in window

    const handleMove = (e) => {
      const rect = section.getBoundingClientRect()
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      if (smooth.current.x < -500) {
        smooth.current = { ...mouse.current }
        setCursorPos({ ...mouse.current })
      }
    }

    // Mobil: reflektor sjíždí po kotli shora dolů podle průchodu sekce viewportem
    const handleScroll = () => {
      const rect = section.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
      mouse.current = {
        x: rect.width / 2,
        y: rect.height * (0.08 + progress * 0.84),
      }
      if (smooth.current.x < -500) {
        smooth.current = { ...mouse.current }
        setCursorPos({ ...mouse.current })
      }
    }

    if (isTouch) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('touchmove', handleScroll, { passive: true })
      handleScroll()
    } else {
      section.addEventListener('pointermove', handleMove)
    }

    // setInterval místo requestAnimationFrame — rAF se zastaví v tabu na pozadí
    const loop = () => {
      const dx = mouse.current.x - smooth.current.x
      const dy = mouse.current.y - smooth.current.y
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return
      smooth.current.x += dx * 0.12
      smooth.current.y += dy * 0.12
      setCursorPos({ x: smooth.current.x, y: smooth.current.y })
    }
    loopRef.current = setInterval(loop, 1000 / 60)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      section.removeEventListener('pointermove', handleMove)
      clearInterval(loopRef.current)
    }
  }, [])

  return (
    <section
      id="palirna"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-[#0d0a07]"
      style={{ height: '100svh' }}
    >
      <div
        className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(media/palirna-base.jpg)' }}
      />

      <RevealLayer image="media/palirna-reveal.jpg" cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <div className="pointer-events-none absolute inset-x-0 top-[12%] z-50 flex flex-col items-center px-5 text-center">
        <h2 className="leading-[0.95] text-wheat">
          <span
            className="block font-instrument-serif text-4xl italic sm:text-6xl md:text-7xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            Nahlédněte
          </span>
          <span
            className="-mt-1 block font-instrument-serif text-4xl sm:text-6xl md:text-7xl"
            style={{ letterSpacing: '-0.03em' }}
          >
            do naší palírny
          </span>
          <span className="mt-4 block font-sans text-xs uppercase tracking-[0.3em] text-wheat/50 sm:text-sm">
            Pěstitelská palírna
          </span>
        </h2>
      </div>

      <div className="absolute bottom-14 left-10 z-50 hidden max-w-[280px] sm:block md:left-14">
        <p className="font-sans text-sm font-light leading-relaxed text-wheat/80">
          Pěstitelská palírna — pálíme z vašeho ovoce. Přivezete kvas, my se postaráme
          o zbytek: pomalá destilace v měděném kotli, postaru a s citem. Posviťte si kurzorem
          na kotel a uvidíte, co se děje uvnitř.
        </p>
      </div>

      <div className="absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[280px] sm:gap-5 md:right-14">
        <div>
          <p className="font-sans text-xs uppercase tracking-widest text-wheat/40">
            Kontakt na palírnu
          </p>
          <p className="mt-2 font-instrument-serif text-xl text-wheat sm:text-2xl">
            {PALIRNA.name}
          </p>
          <p className="font-sans text-sm text-wheat/70">{PALIRNA.phone}</p>
        </div>
        <a
          href={`tel:${PALIRNA.phone.replace(/\s/g, '')}`}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-grain px-7 py-3 font-sans text-sm font-medium text-soil transition-all hover:scale-[1.03] hover:bg-wheat active:scale-95"
        >
          <Phone size={16} />
          Zavolat do palírny
        </a>
      </div>
    </section>
  )
}
