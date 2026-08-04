import { useEffect, useRef, useState } from 'react'
import { Phone } from 'lucide-react'

const PALIRNA = { name: 'Josef Vojkůvka', phone: '+420 733 531 233' }

// Kurzorové „kukátko“: přes základní fotku kotle se maskou (radiální gradient
// kreslený do canvasu) odhaluje druhý obrázek — průřez, co se děje uvnitř.
// Na dotykových zařízeních (bez kurzoru) putuje reflektor po kotli podle scrollu.

// Sekce je vysoká 100svh a fotka se roztahuje přes cover — na širokém displeji
// sedí záběr na šířku, na mobilu by se z něj ale vyřízl jen úzký svislý pruh
// a kotel by zůstal mimo obraz. Pro úzké displeje proto existuje vlastní
// záběr na výšku. Průřez v obou párech vznikl jako úprava základního snímku,
// takže sedí 1:1 — žádná kompenzace posunu není potřeba. Kdyby se obrázky
// někdy vyměnily za nesouhlasný pár, dá se doladit přes ALIGN.
// `fit` říká, jak se záběr mapuje do sekce. Na šířku se roztahuje přes cover.
// Na mobilu se ale kotel přes cover natáhl přes celou výšku displeje a nadpis
// i kontakt pak ležely přímo na něm.
//
// Na úzkých displejích se proto fotka zmenšuje na výšku ('inset') a nad ní
// i pod ní se drží volný pruh pro text. Nejde to navázat na šířku: poměr
// snímku je 0,558, takže při přizpůsobení šířce vyjde fotka nižší než sekce
// jen na dost vysokých displejích. Na širším telefonu s adresním řádkem
// Safari (kolem 430 × 745) by byla naopak vyšší a místo by nezbylo vůbec.
// Odečtením pevné rezervy od výšky sekce je mezera zaručená vždy.
//
// Fotka je pak užší než displej, ale postranní plochu vyplní rozostřená
// kopie pod ní, takže je to vidět jako záměrné orámování.
const PORTRAIT_INSET = 260

// Kraje snímku se vytrácejí do rozostřené kopie pod ním. Rozsahy jsou volené
// tak, aby vytrácení skončilo dřív, než začne kotel — ten musí zůstat ostrý.
const FADE_Y = 'linear-gradient(to bottom, transparent 0%, #000 13%, #000 87%, transparent 100%)'
const FADE_X = 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)'
const SOURCES = {
  wide: {
    base: 'media/palirna-base.jpg',
    reveal: 'media/palirna-reveal.jpg',
    w: 2000,
    h: 1116,
    fit: 'cover',
  },
  portrait: {
    base: 'media/palirna-base-mobil.jpg',
    reveal: 'media/palirna-reveal-mobil.jpg',
    w: 1120,
    h: 2006,
    fit: 'inset',
  },
}
const PORTRAIT_QUERY = '(max-width: 767px)'
const ALIGN = { dx: 0, dy: 0, scale: 1 }

function useSource() {
  const [portrait, setPortrait] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PORTRAIT_QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT_QUERY)
    const onChange = (e) => setPortrait(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return portrait ? SOURCES.portrait : SOURCES.wide
}

function RevealLayer({ image, imgW, imgH, cursorX, cursorY }) {
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

    // Kurzor chodí v souřadnicích celé sekce, ale canvas může ležet uvnitř
    // menší karty uprostřed — proto se jeho posun odečte. Na širokém displeji
    // canvas sekci vyplňuje, takže vyjdou nuly a nic se nemění.
    const canvasRect = canvas.getBoundingClientRect()
    const sectionRect = canvas.closest('section').getBoundingClientRect()
    const cx = cursorX - (canvasRect.left - sectionRect.left)
    const cy = cursorY - (canvasRect.top - sectionRect.top)

    const radius = Math.min(260, w * 0.32)
    if (cx < -radius || cy < -radius) return

    // Mapování musí sedět 1:1 s background-size fotky pod canvasem, jinak by
    // průřez v kukátku neseděl na kotel.
    const coverScale = Math.max(w / imgW, h / imgH)
    const drawScale = coverScale * ALIGN.scale
    const drawW = imgW * drawScale
    const drawH = imgH * drawScale
    const dx = (w - drawW) / 2 + ALIGN.dx * coverScale
    const dy = (h - drawH) / 2 + ALIGN.dy * coverScale

    ctx.save()
    ctx.drawImage(img, dx, dy, drawW, drawH)

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
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
  }, [cursorX, cursorY, imgReady, size, imgW, imgH])

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
  const source = useSource()

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
      {/* Na mobilu se fotka přizpůsobuje šířce, takže nad ní a pod ní zbývá
          pruh. Kdyby prosvítalo holé pozadí sekce, byla by na okraji snímku
          vidět hrana — proto pod ním leží rozostřená kopie přes celou plochu.
          Zvětšení o 10 % odřízne měkké okraje, které blur vytvoří. */}
      {source.fit === 'inset' && (
        <div
          aria-hidden
          className="absolute inset-0 z-0 scale-110 bg-cover bg-center bg-no-repeat blur-2xl brightness-[0.45]"
          style={{ backgroundImage: `url(${source.base})` }}
        />
      )}

      {source.fit === 'inset' ? (
        // Snímek se ke krajům měkce vytrácí do rozostřené kopie pod sebou,
        // takže nemá viditelnou hranu. Ostrá hrana by tady vadila — nadpis
        // i kontakt přes ni procházejí a působilo by to jako chyba.
        <div
          className="absolute left-1/2 z-10 -translate-x-1/2 overflow-hidden"
          style={{
            top: PORTRAIT_INSET / 2,
            bottom: PORTRAIT_INSET / 2,
            aspectRatio: `${source.w} / ${source.h}`,
            maskImage: FADE_Y,
            WebkitMaskImage: FADE_Y,
          }}
        >
          {/* Druhý přechod je ve vnořeném prvku — masky se tak složí přes sebe
              bez mask-composite, které Safari zapisuje jinak než Chrome. */}
          <div
            className="absolute inset-0"
            style={{ maskImage: FADE_X, WebkitMaskImage: FADE_X }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${source.base})` }}
            />
            <RevealLayer
              image={source.reveal}
              imgW={source.w}
              imgH={source.h}
              cursorX={cursorPos.x}
              cursorY={cursorPos.y}
            />
          </div>
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${source.base})` }}
          />
          <RevealLayer
            image={source.reveal}
            imgW={source.w}
            imgH={source.h}
            cursorX={cursorPos.x}
            cursorY={cursorPos.y}
          />
        </>
      )}

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
