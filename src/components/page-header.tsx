import { Reveal } from "@/components/reveal";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative flex min-h-[62svh] items-end overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 text-bone lg:px-10 lg:pb-20">
        <Reveal>
          <p className="eyebrow text-ochre">{eyebrow}</p>
          <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[0.98]">
            {title}
          </h1>
          {intro ? <p className="mt-6 max-w-xl leading-relaxed text-bone/80">{intro}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}
