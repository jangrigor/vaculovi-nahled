import { Phone, Mail, ArrowRight } from 'lucide-react'
import { GlowCard } from '@/components/ui/spotlight-card'

const EMAIL = 'rfkl@rfkl.cz'

const people = [
  { name: 'Petr Vacula', phone: '+420 603 481 631' },
  { name: 'Mgr. Tadeusz Vacula, MBA', phone: '+420 604 356 341' },
  { name: 'Josef Vojkůvka', role: 'pěstitelská palírna', phone: '+420 733 531 233' },
]

// Souřadnice farmy — mapa se na ně vycentruje.
const MAP_QUERY = '50.12490003789712,17.63789405205469'

// Mezery v čísle jsou jen pro čtení — do odkazu tel: patří číslo bez nich.
const telHref = (phone) => `tel:${phone.replace(/\s/g, '')}`

export default function Kontakt() {
  return (
    <section id="kontakt" className="bg-soil px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 font-instrument-serif text-3xl text-wheat md:text-4xl">
          Ozvěte se nám
        </h2>
        <p className="mb-10 font-sans text-sm text-wheat/60">
          Napište nám k poptávce, spolupráci nebo jen na pozdrav.
        </p>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <GlowCard glowColor="orange" customSize className="w-full self-start p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-wheat/40">
                  E-mail
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-2 inline-flex items-center gap-3 font-instrument-serif text-2xl text-wheat transition-colors hover:text-grain md:text-3xl"
                >
                  <Mail size={22} className="shrink-0 text-grain" />
                  {EMAIL}
                </a>
              </div>

              <div className="border-t border-wheat/10 pt-6">
                <p className="font-sans text-xs uppercase tracking-widest text-wheat/40">
                  Telefon
                </p>
                <div className="mt-3 space-y-4">
                  {people.map((person) => (
                    <div key={person.phone} className="flex items-start gap-3">
                      <Phone size={18} className="mt-1 shrink-0 text-grain" />
                      <div>
                        <p className="font-sans text-sm text-wheat md:text-base">
                          {person.name}
                          {person.role && (
                            <span className="text-wheat/50"> — {person.role}</span>
                          )}
                        </p>
                        <a
                          href={telHref(person.phone)}
                          className="font-sans text-sm text-wheat/70 transition-colors hover:text-grain md:text-base"
                        >
                          {person.phone}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-grain px-7 py-3 font-sans text-sm font-medium text-soil transition-colors hover:bg-wheat"
              >
                Napsat e-mail
                <ArrowRight size={16} />
              </a>
            </div>
          </GlowCard>

          <iframe
            title="Mapa — kde nás najdete"
            src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
            className="h-80 w-full rounded-2xl border-0 md:h-full md:min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <p className="mt-12 border-t border-wheat/10 pt-6 font-sans text-xs text-wheat/40">
          Rodinná Farma Krásné Loučky — Petr Vacula a Teresa Katarzyna Vaculová (IČO 180 98
          649), Mgr. Tadeusz Vacula, MBA a Mgr. Ilona Vaculová, MBA (IČO 730 84 808)
        </p>
      </div>
    </section>
  )
}
