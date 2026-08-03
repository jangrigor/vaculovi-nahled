import { useEffect, useState } from 'react'
import { ArrowRight, Newspaper } from 'lucide-react'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'

const NAV_LINKS = [
  { label: 'O nás', id: 'o-nas' },
  { label: 'Aktuality', id: 'aktuality' },
  { label: 'Palírna', id: 'palirna' },
]

// Hero používá scroll-lock (video se nejdřív rozbaluje) — před scrollem na kotvu
// je potřeba rozbalení přeskočit, jinak by stránka zůstala zamčená nahoře.
function scrollToId(id) {
  window.dispatchEvent(new Event('expandHeroMedia'))
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

function Hamburger({ open, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Menu"
      aria-expanded={open}
      className="md:hidden relative z-50 flex h-6 w-6 flex-col items-center justify-center gap-1.5"
    >
      <span
        className="h-[2px] w-6 rounded-full bg-wheat transition-transform duration-500"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.76,0,0.24,1)',
          transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
        }}
      />
      <span
        className="h-[2px] w-4 rounded-full bg-wheat transition-opacity duration-500"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.76,0,0.24,1)',
          opacity: open ? 0 : 1,
        }}
      />
      <span
        className="h-[2px] w-6 rounded-full bg-wheat transition-transform duration-500"
        style={{
          transitionTimingFunction: 'cubic-bezier(0.76,0,0.24,1)',
          transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
        }}
      />
    </button>
  )
}

// Překryv menu musí být nad obsahem stránky — sekce Palírna má textové bloky
// na z-50 a přes menu prosvítaly. Zároveň musí zůstat pod hlavičkou na z-[60],
// aby byl křížek pro zavření nahoře a klikatelný.
function MobileMenu({ open, onNavigate }) {
  return (
    <div
      className={`fixed inset-0 z-[55] md:hidden bg-soil/95 backdrop-blur-xl transition-opacity duration-700 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <nav className="flex flex-col items-center">
          {NAV_LINKS.map((link, index) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className="w-full border-b border-wheat/10 py-4 text-center font-instrument-serif text-4xl text-wheat transition-all duration-500 hover:pl-4 sm:text-5xl"
              style={{
                transitionDelay: open ? `${150 + index * 80}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => onNavigate('kontakt')}
          className="mt-10 w-full rounded-full bg-grain py-4 font-sans text-sm font-medium text-soil"
        >
          Kontaktujte nás
        </button>
      </div>
    </div>
  )
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState('uvod')
  const [scrolled, setScrolled] = useState(false)

  const handleNavigate = (id) => {
    setMenuOpen(false)
    scrollToId(id)
  }

  // Zvýraznění sekce, ve které se návštěvník právě nachází
  useEffect(() => {
    const sections = ['uvod', 'o-nas', 'aktuality', 'palirna', 'kontakt']
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      // Aktivní je sekce protínající pás kolem středu obrazovky
      { rootMargin: '-45% 0px -50% 0px' }
    )
    sections.forEach((s) => observer.observe(s))

    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section id="uvod" className="relative bg-soil">
      <header
        className={`fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-6 py-4 transition-all duration-500 md:px-10 ${
          scrolled
            ? 'border-b border-wheat/10 bg-soil/90 py-3 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent py-5 md:py-6'
        }`}
      >
        <button
          onClick={() => scrollToId('uvod')}
          className="flex items-baseline gap-2 font-sans text-wheat"
        >
          <span className="text-lg font-semibold tracking-wide">RFKL</span>
          <span className="hidden text-xs font-light text-wheat/60 sm:inline">
            Rodinná Farma Krásné Loučky
          </span>
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToId(link.id)}
              className={`relative font-sans text-sm transition-colors ${
                activeId === link.id
                  ? 'font-normal text-wheat'
                  : 'font-light text-wheat/70 hover:text-wheat'
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-grain transition-all duration-300 ${
                  activeId === link.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              />
            </button>
          ))}
          <button
            onClick={() => scrollToId('kontakt')}
            className={`rounded-full px-5 py-2 font-sans text-sm transition-colors ${
              activeId === 'kontakt'
                ? 'bg-grain text-soil'
                : 'bg-wheat text-soil hover:bg-grain'
            }`}
          >
            Kontaktujte nás
          </button>
        </div>

        <Hamburger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
      </header>

      <MobileMenu open={menuOpen} onNavigate={handleNavigate} />

      {/* Pozadí je záměrně jiný záběr než video — traktor patří jen do
          rozbalovacího okna, na pozadí zůstává klidná krajina. */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="media/hero.mp4?v=2"
        posterSrc="media/hero-poster.jpg"
        bgImageSrc="media/hero-bg.jpg"
        date="Rodinná farma"
        scrollToExpand="Posouváním rozehrajete video"
        scrubOnScroll
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center text-center">
          <h1 className="font-instrument-serif text-3xl leading-tight text-wheat md:text-4xl">
            Již více jak 30 let hospodaříme{' '}
            <em className="italic">v naší krásné přírodě</em>
          </h1>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={() => scrollToId('kontakt')}
              className="flex items-center gap-2 rounded-full bg-grain px-7 py-3 font-sans text-sm font-medium text-soil"
            >
              Kontaktovat
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollToId('aktuality')}
              className="flex items-center gap-2 rounded-full border border-wheat/40 px-7 py-3 font-sans text-sm text-wheat"
            >
              Naše aktuality
              <Newspaper size={16} />
            </button>
          </div>
        </div>
      </ScrollExpandMedia>
    </section>
  )
}
