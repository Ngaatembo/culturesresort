import { Reveal } from "@/components/reveal";
import { images } from "@/lib/gallery";
import { experiences } from "@/lib/site-data";

/**
 * Each experience gets its own photograph rather than a number — 01/02/03/04
 * implies a sequence, and these four are parallel features, not steps.
 */
export function ExperienceGrid() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {experiences.map((e, i) => (
        <Reveal as="li" key={e.title} delay={i * 90} className="group relative overflow-hidden">
          <img
            src={images[e.imageKey]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-bone lg:p-8">
            <h3 className="font-display text-xl leading-tight lg:text-2xl">{e.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-bone/80">{e.body}</p>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
