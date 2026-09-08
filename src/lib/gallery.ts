import garden from "@/assets/hero-garden.jpg";
import food from "@/assets/food-platter.jpg";
import craft from "@/assets/craft-detail.jpg";
import drums from "@/assets/culture-drums.jpg";
import interiorDeck from "@/assets/interior-deck.jpg";
import sadzaPlate from "@/assets/sadza-plate.jpg";
import jollofPlate from "@/assets/jollof-plate.jpg";
import thatchedRoof from "@/assets/thatched-roof.jpg";
import craftBaskets from "@/assets/craft-art-baskets.jpg";
import craftClayPot from "@/assets/craft-clay-pot.jpg";

export const images = {
  garden,
  food,
  craft,
  drums,
  interiorDeck,
  sadzaPlate,
  jollofPlate,
  thatchedRoof,
  craftBaskets,
  craftClayPot,
};

export type GalleryEntry = {
  src: string;
  alt: string;
  caption: string;
  category: "Garden" | "Food" | "Culture" | "Détail";
  tall?: boolean;
};

/** Real photographs of Cultures Resort, Hillside, Harare. */
export const gallery: GalleryEntry[] = [
  {
    src: garden,
    alt: "Life-size zebra, giraffe and elephant sculptures on the lawn among picnic tables",
    caption: "The garden — zebra, giraffe and elephant among the trees",
    category: "Garden",
  },
  {
    src: sadzaPlate,
    alt: "Sadza and covo served on a white plate at an outdoor wooden table",
    caption: "Sadza and covo, served at the table",
    category: "Food",
  },
  {
    src: craft,
    alt: "A staff member hand-painting a buffalo mural on the brick wall of the dining pavilion",
    caption: "Hand-painted art on the pavilion walls",
    category: "Détail",
    tall: true,
  },
  {
    src: drums,
    alt: "The dining pavilion lit up at night with a leopard sculpture on the lawn",
    caption: "The grounds after dark",
    category: "Culture",
  },
  {
    src: interiorDeck,
    alt: "Covered wooden deck seating under a thatched roof",
    caption: "Covered deck seating",
    category: "Garden",
  },
  {
    src: food,
    alt: "Charcoal-grilled ribs fresh off the fire",
    caption: "Straight off the charcoal",
    category: "Food",
    tall: true,
  },
  {
    src: jollofPlate,
    alt: "Jollof rice with greens on a white plate",
    caption: "Jollof rice, served with greens",
    category: "Food",
  },
  {
    src: craftBaskets,
    alt: "Hand-painted canvases of African women and woven baskets on display",
    caption: "Local art and woven baskets on display",
    category: "Détail",
    tall: true,
  },
  {
    src: craftClayPot,
    alt: "A staff member in traditional dress arranging a large clay pot",
    caption: "Traditional dress and handcrafted clay pots",
    category: "Culture",
  },
  {
    src: thatchedRoof,
    alt: "Thatched roof of the dining pavilion against a blue sky",
    caption: "The thatched dining pavilion",
    category: "Détail",
  },
  {
    src: garden,
    alt: "Wooden signpost among the trees in the garden",
    caption: "Signposts through the garden",
    category: "Détail",
  },
];
