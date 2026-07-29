# Náhradní hero video

Alternativa k traktorovému videu v hero sekci — pomalý nálet nad zrajícím obilím
do krajiny. Leží mimo `public/`, takže se nenasazuje na web.

Přepnutí na tuhle variantu:

```bash
cp media-alt/hero-krajina.mp4 public/media/hero.mp4
cp media-alt/hero-krajina-poster.jpg public/media/hero-poster.jpg
```

Poster musí vždy odpovídat prvnímu snímku videa — hero se scrubuje podle scrollu
a při načtení ukazuje poster, takže nesoulad je vidět jako záblesk.
