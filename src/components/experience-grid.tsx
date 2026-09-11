import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { experiences } from "@/lib/site-data";

/**
 * The four pillars as four different chapters, not four identical cards —
 * per the brand brief's "avoid repetitive cards" rule. Order is fixed
 * (Garden, Fire, Décor, Family) and each position always gets the same
 * treatment, chosen for what already exists elsewhere on the page:
 * Garden gets the large featured slot since the hero video is ambient
 * rather than textual; Fire and Décor stay compact/editorial since both
 * already have their own full-width bands elsewhere on the homepage
 * ("Where tradition meets fire", the culture band); Family & Friends
 * gets the full-width closer since it has no dedicated band of its own.
 */
export function ExperienceGrid() {
  const [garden, fire, decor, family] = experiences;
  if (!garden || !fire || !decor || !family) return null;

  return (
    <ul className="grid gap-4 lg:grid-cols-2 lg:grid-rows-2">
      {/* Garden — large, featured, own headline */}
      <Reveal
        as="li"
        className="card-tactile group relative overflow-hidden rounded-2xl lg:row-span-2"
      >
        <img
          src={images[garden.imageKey]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-premium)] group-hover:scale-[1.06] lg:h-full lg:aspect-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-bone lg:p-9">
          <p className="eyebrow text-ochre">{garden.title}</p>
          {garden.headline ? (
            <p className="mt-3 font-display text-2xl italic leading-tight lg:text-3xl">
              {garden.headline}
            </p>
          ) : null}
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-bone/80">{garden.body}</p>
        </div>
      </Reveal>

      {/* Fire — small editorial: text beside image, not overlaid */}
      <Reveal
        as="li"
        delay={90}
        className="card-tactile grid grid-cols-[minmax(0,7rem)_1fr] gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,9rem)_1fr] lg:p-5"
      >
        <img
          src={images[fire.imageKey]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="aspect-square w-full rounded-xl object-cover"
        />
        <div className="min-w-0 self-center">
          <h3 className="font-display text-lg leading-tight lg:text-xl">{fire.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fire.body}</p>
        </div>
      </Reveal>

      {/* Décor — overlapping text panel breaking the image edge */}
      <Reveal as="li" delay={180} className="relative overflow-visible">
        <div className="card-tactile group overflow-hidden rounded-2xl">
          <img
            src={images[decor.imageKey]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="aspect-[16/10] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-premium)] group-hover:scale-[1.06]"
          />
        </div>
        <div className="relative -mt-8 ml-4 mr-4 rounded-xl border border-border bg-card p-5 shadow-lift sm:absolute sm:bottom-5 sm:left-5 sm:right-auto sm:mt-0 sm:max-w-[16rem]">
          <h3 className="font-display text-lg leading-tight">{decor.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{decor.body}</p>
        </div>
      </Reveal>

      {/* Family & Friends — full-width closer, own headline */}
      <Reveal
        as="li"
        delay={270}
        className="card-tactile group relative overflow-hidden rounded-2xl lg:col-span-2"
      >
        <img
          src={images[family.imageKey]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="aspect-[16/9] w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-premium)] group-hover:scale-[1.04] lg:aspect-[21/9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-bone lg:p-9">
          <p className="eyebrow text-ochre">{family.title}</p>
          {family.headline ? (
            <p className="mt-3 font-display text-2xl italic leading-tight lg:text-3xl">
              {family.headline}
            </p>
          ) : null}
          <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/80">{family.body}</p>
        </div>
      </Reveal>
    </ul>
  );
}
