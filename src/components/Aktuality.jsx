import { Sprout } from 'lucide-react'
import { GlowCard } from '@/components/ui/spotlight-card'

// Až budou první novinky, stačí sem přidat objekt — zbytek kódu se nemění.
// Formát: { id, image: 'media/nazev.jpg', date: '1. 8. 2026', title: '…', text: '…' }
const newsItems = []

function NewsCard({ item }) {
  return (
    <GlowCard glowColor="orange" customSize className="w-full">
      <div className="flex h-full flex-col">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="h-44 w-full shrink-0 rounded-lg object-cover"
        />
        <div className="pb-1 pt-4">
          <span className="font-sans text-xs text-wheat/50">{item.date}</span>
          <h3 className="mt-1 font-instrument-serif text-lg text-wheat">{item.title}</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-wheat/70">{item.text}</p>
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
