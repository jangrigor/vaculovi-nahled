import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Sprout, ChevronDown, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react'
import { GlowCard } from '@/components/ui/spotlight-card'

// Novou novinku stačí přidat jako objekt — zbytek kódu se nemění.
// Povinné: { id, image: 'media/nazev.jpg', date: '1. 8. 2026', title: '…', text: '…' }
// Volitelné pro delší článek: body (pole odstavců), photos (další fotky na šířku),
// poster (publicitní cedule), link, pdf (odkaz ke stažení).
const newsItems = [
  {
    id: 'mas-krnovsko-mulcovac',
    image: 'media/aktualita-mulcovac.jpg',
    // Fotka je na výšku — v kartě se ukáže celá, ne jen výřez.
    imageAspect: '3 / 4',
    date: '5. 10. 2026',
    title: 'Nový mulčovač a dílenský stůl s podporou EU',
    text:
      'Díky podpoře MAS Rozvoj Krnovska a programu LEADER jsme pořídili nový mulčovač s velkým bočním vyosením a nový dílenský pracovní stůl.',
    body: [
      'Projekt s názvem „Inovace zemědělské techniky – rodinná farma v Krásných Loučkách“ se stal součástí realizace Strategie komunitně vedeného místního rozvoje MAS Rozvoj Krnovska o.p.s. na období 2021–2027.',
      'Díky podpoře EU, v rámci intervence 52.77 LEADER Strategického plánu Společné zemědělské politiky, byl pořízen nový mulčovač s možností velkého bočního vyosení a nastavení pracovního úhlu, který umožňuje efektivní údržbu travních ploch, okrajů polí, příkopů a dalších členitých či obtížně přístupných míst. Nové zařízení nahradí starší mulčovač pevné konstrukce a umožní kvalitnější a efektivnější provádění údržby.',
      'Součástí projektu je také pořízení nového dílenského pracovního stolu, který bude využíván pro údržbu a drobné opravy používané zemědělské techniky a dalšího strojního vybavení. Projekt tak přispěje ke zlepšení technického zázemí farmy a efektivnější péči o zemědělské plochy a okolní krajinu.',
      'Tímto bych rád poděkoval za poskytnutou podporu MAS Rozvoj Krnovska o.p.s. — Petr Vacula',
    ],
    photos: [{ src: 'media/aktualita-stul.jpg', alt: 'Nový dílenský pracovní stůl' }],
    poster: {
      src: 'media/aktualita-cedule.jpg',
      alt: 'Publicitní cedule projektu: Inovace zemědělské techniky – rodinná farma v Krásných Loučkách byl spolufinancován Evropskou unií. Cílem projektu je zefektivnění zemědělské výroby. Nový mulčovač a dílenský stůl zvýší soběstačnost farmy při údržbě travních porostů a opravách techniky.',
    },
    link: { href: 'https://www.maskrnovsko.cz/', label: 'maskrnovsko.cz' },
    pdf: 'media/publicita-mas-krnovsko.pdf',
  },
]

// Zvětšení fotky přímo na stránce (bez otevírání nové adresy).
// Zavírá se křížkem, klepnutím vedle fotky nebo Esc; listuje se šipkami,
// klávesami ← → nebo přejetím prstem do strany.
// Vykresluje se přes portál do <body>: karta má backdrop-blur, který by jinak
// z `position: fixed` udělal pozici vůči kartě, ne vůči oknu.
function Lightbox({ photos, index, onClose, onIndex }) {
  const touchX = useRef(null)
  const count = photos.length
  const go = (step) => onIndex((index + step + count) % count)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (count > 1 && e.key === 'ArrowRight') go(1)
      if (count > 1 && e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  })

  const ph = photos[index]
  const btn =
    'absolute flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-wheat backdrop-blur transition hover:bg-black/70'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ph.alt}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <img
        src={ph.src}
        alt={ph.alt}
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        aria-label="Zavřít"
        className={`${btn} right-3 top-3 sm:right-6 sm:top-6`}
        onClick={onClose}
      >
        <X size={22} />
      </button>
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Předchozí fotka"
            className={`${btn} left-3 top-1/2 -translate-y-1/2 sm:left-6`}
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="Další fotka"
            className={`${btn} right-3 top-1/2 -translate-y-1/2 sm:right-6`}
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            <ChevronRight size={24} />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-sans text-xs text-wheat/60">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>,
    document.body,
  )
}

// Mozaika fotek: hlavní fotka na výšku vlevo přes celou výšku, ostatní (na šířku)
// vpravo pod sebou ve svém přirozeném poměru. Na mobilu jdou všechny pod sebe.
// Klepnutím se fotka zvětší v Lightboxu.
function Gallery({ item }) {
  const [zoomed, setZoomed] = useState(null)
  const lead = { src: item.image, alt: item.title }
  const side = [...(item.photos ?? []), ...(item.poster ? [item.poster] : [])]
  const all = [lead, ...side]

  const thumb = (ph, i, imgClass, btnClass = '') => (
    <button
      key={ph.src}
      type="button"
      aria-label={`Zvětšit: ${ph.alt}`}
      onClick={() => setZoomed(i)}
      className={`block w-full cursor-zoom-in overflow-hidden rounded-lg ${btnClass}`}
    >
      <img
        src={ph.src}
        alt={ph.alt}
        loading="lazy"
        decoding="async"
        className={`w-full transition-transform duration-300 hover:scale-[1.02] ${imgClass}`}
      />
    </button>
  )

  return (
    <>
      {side.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.08fr_1fr]">
          {/* Absolutní pozice: výšku řádků určují fotky vpravo, levá je jen vyplní. */}
          <div className="relative sm:row-span-2">
            {thumb(lead, 0, 'h-auto object-cover sm:h-full', 'sm:absolute sm:inset-0')}
          </div>
          {side.map((ph, i) => thumb(ph, i + 1, 'h-auto'))}
        </div>
      ) : (
        thumb(lead, 0, 'h-auto')
      )}
      {zoomed !== null && (
        <Lightbox photos={all} index={zoomed} onIndex={setZoomed} onClose={() => setZoomed(null)} />
      )}
    </>
  )
}

function NewsCard({ item }) {
  const [open, setOpen] = useState(false)
  const hasMore = Boolean(item.body?.length)

  return (
    <GlowCard
      glowColor="orange"
      customSize
      className={`w-full ${open ? 'sm:col-span-2 lg:col-span-3' : ''}`}
    >
      <div className="flex h-full flex-col">
        {!open && (
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className={`w-full shrink-0 rounded-lg object-cover ${item.imageAspect ? '' : 'h-56'}`}
            style={item.imageAspect ? { aspectRatio: item.imageAspect } : undefined}
          />
        )}
        <div className={open ? 'pb-1' : 'pb-1 pt-4'}>
          <span className="font-sans text-xs text-wheat/50">{item.date}</span>
          <h3 className="mt-1 font-instrument-serif text-lg text-wheat">{item.title}</h3>
          {!open && (
            <p className="mt-2 font-sans text-sm leading-relaxed text-wheat/70">{item.text}</p>
          )}

          {open && (
            <div className="mt-3 max-w-4xl space-y-6">
              <div className="space-y-4">
                {item.body.map((p, i) => (
                  <p key={i} className="font-sans text-sm leading-relaxed text-wheat/80">
                    {p}
                  </p>
                ))}
              </div>

              <Gallery item={item} />

              <div className="flex flex-col gap-3 border-t border-wheat/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                {item.link && (
                  <p className="font-sans text-sm text-wheat/60">
                    Více o podpoře MAS Rozvoj Krnovska o.p.s. na{' '}
                    <a
                      href={item.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-grain underline underline-offset-2 hover:text-wheat"
                    >
                      {item.link.label}
                    </a>
                  </p>
                )}
                {item.pdf && (
                  <a
                    href={item.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 font-sans text-sm text-grain hover:text-wheat"
                  >
                    <FileText size={16} /> Stáhnout článek (PDF)
                  </a>
                )}
              </div>
            </div>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-4 inline-flex items-center gap-1 font-sans text-sm text-grain hover:text-wheat"
            >
              {open ? 'Sbalit' : 'Číst celý článek'}
              <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </GlowCard>
  )
}

export default function Aktuality() {
  return (
    <section id="aktuality" className="bg-soil px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 font-instrument-serif text-3xl text-wheat md:text-4xl">
          Aktuality ze statku
        </h2>
        <p className="mb-10 font-sans text-sm text-wheat/60">Co se u nás zrovna děje</p>

        {newsItems.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-wheat/20 px-6 py-16 text-center">
            <Sprout size={32} className="text-grain" />
            <p className="mt-5 font-instrument-serif text-2xl text-wheat md:text-3xl">
              Na novinkách pracujeme
            </p>
            <p className="mt-3 max-w-md font-sans text-sm font-light leading-relaxed text-wheat/60">
              Zatím tu nic není. Chystáme první novinky ze statku — mrkněte sem zase za
              chvíli.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
