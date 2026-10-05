import { useState } from 'react'
import { Sprout, ChevronDown, FileText } from 'lucide-react'
import { GlowCard } from '@/components/ui/spotlight-card'

// Novou novinku stačí přidat jako objekt — zbytek kódu se nemění.
// Povinné: { id, image: 'media/nazev.jpg', date: '1. 8. 2026', title: '…', text: '…' }
// Volitelné pro delší článek: body (pole odstavců), photos (další fotky),
// logos (pruh s logy dotace), pdf (odkaz ke stažení).
const newsItems = [
  {
    id: 'mas-krnovsko-mulcovac',
    image: 'media/aktualita-mulcovac.jpg',
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
    logos: {
      src: 'media/loga-eu-mas.png',
      alt: 'Spolufinancováno Evropskou unií · Strategický plán SZP · MAS Rozvoj Krnovska',
    },
    link: { href: 'https://www.maskrnovsko.cz/', label: 'maskrnovsko.cz' },
    pdf: 'media/publicita-mas-krnovsko.pdf',
  },
]

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
            className="h-44 w-full shrink-0 rounded-lg object-cover"
          />
        )}
        <div className={open ? 'pb-1' : 'pb-1 pt-4'}>
          <span className="font-sans text-xs text-wheat/50">{item.date}</span>
          <h3 className="mt-1 font-instrument-serif text-lg text-wheat">{item.title}</h3>
          {!open && (
            <p className="mt-2 font-sans text-sm leading-relaxed text-wheat/70">{item.text}</p>
          )}

          {open && (
            <div className="mt-3 space-y-4">
              {item.body.map((p, i) => (
                <p key={i} className="max-w-3xl font-sans text-sm leading-relaxed text-wheat/80">
                  {p}
                </p>
              ))}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[{ src: item.image, alt: item.title }, ...(item.photos ?? [])].map((ph) => (
                  <img
                    key={ph.src}
                    src={ph.src}
                    alt={ph.alt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ))}
              </div>
              {item.link && (
                <p className="font-sans text-sm text-wheat/70">
                  Více informací o podpoře a činnosti MAS Rozvoj Krnovska o.p.s. naleznete na{' '}
                  <a
                    href={item.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-grain underline underline-offset-2 hover:text-wheat"
                  >
                    {item.link.label}
                  </a>
                  .
                </p>
              )}
              {item.logos && (
                <div className="rounded-lg bg-white p-3">
                  <img src={item.logos.src} alt={item.logos.alt} loading="lazy" className="w-full" />
                </div>
              )}
              {item.pdf && (
                <a
                  href={item.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-sans text-sm text-grain hover:text-wheat"
                >
                  <FileText size={16} /> Stáhnout článek (PDF)
                </a>
              )}
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
