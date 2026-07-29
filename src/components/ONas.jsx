// Hospodařící subjekty — obě rodiny, jak je uvádí živnostenský rejstřík.
const farmers = [
  {
    names: 'Petr Vacula a Teresa Katarzyna Vaculová',
    ico: '180 98 649',
  },
  {
    names: 'Mgr. Tadeusz Vacula, MBA a Mgr. Ilona Vaculová, MBA',
    ico: '730 84 808',
  },
]

export default function ONas() {
  return (
    <section id="o-nas" className="bg-wheat px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <img
          src="media/o-nas.jpg"
          alt="Statek Rodinné Farmy Krásné Loučky"
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full rounded-2xl object-cover"
        />

        <div>
          <h2 className="font-instrument-serif text-3xl text-soil md:text-4xl">O nás</h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-soil/70 md:text-base">
            Na pozemcích Rodinné Farmy Krásné Loučky hospodaří
          </p>

          <div className="mt-6 space-y-5">
            {farmers.map((farmer) => (
              <div key={farmer.ico} className="border-l-2 border-grain pl-4">
                <p className="font-instrument-serif text-xl text-soil md:text-2xl">
                  {farmer.names}
                </p>
                <p className="mt-1 font-sans text-xs text-soil/50 md:text-sm">
                  IČO: {farmer.ico}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
