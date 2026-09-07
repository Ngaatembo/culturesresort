import garden from "@/assets/hero-garden.jpg";
import food from "@/assets/food-platter.jpg";
import craft from "@/assets/craft-detail.jpg";
import drums from "@/assets/culture-drums.jpg";

export const images = { garden, food, craft, drums };

export type GalleryEntry = {
  src: string;
  alt: string;
  caption: string;
  category: "Garden" | "Food" | "Culture" | "Détail";
  tall?: boolean;
};

/** Placeholder gallery — the owner replaces these with their own photographs. */
export const gallery: GalleryEntry[] = [
  {
    src: garden,
    alt: "Long wooden tables set under trees with lanterns at dusk",
    caption: "Garden dining at dusk — placeholder image",
    category: "Garden",
  },
  {
    src: food,
    alt: "Traditional African dishes served in carved wooden and clay bowls",
    caption: "Traditional plates, served family style — placeholder image",
    category: "Food",
  },
  {
    src: craft,
    alt: "Carved wooden mask, woven basket and clay pot against an earth wall",
    caption: "Handcrafted décor — placeholder image",
    category: "Détail",
    tall: true,
  },
  {
    src: drums,
    alt: "Drummer and dancers performing beside a fire in a courtyard",
    caption: "Cultural performance in the courtyard — placeholder image",
    category: "Culture",
  },
  {
    src: garden,
    alt: "Warm lantern light over garden seating",
    caption: "Evening lantern light — placeholder image",
    category: "Garden",
  },
  {
    src: food,
    alt: "Close view of grilled meat and relishes on a wooden platter",
    caption: "From the fire — placeholder image",
    category: "Food",
    tall: true,
  },
  {
    src: drums,
    alt: "Guests watching a traditional dance performance",
    caption: "Guests at a performance — placeholder image",
    category: "Culture",
  },
  {
    src: craft,
    alt: "Detail of hand-dyed indigo and ochre cloth",
    caption: "Cloth and colour — placeholder image",
    category: "Détail",
  },
];
