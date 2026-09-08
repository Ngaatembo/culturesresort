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
import pavilionWide from "@/assets/pavilion-wide.jpg";
import curioShop from "@/assets/curio-shop.jpg";
import waterfall from "@/assets/waterfall.jpg";
import elephantBridge from "@/assets/elephant-bridge.jpg";
import staffWelcome from "@/assets/staff-welcome.jpg";
import gardenLion from "@/assets/garden-lion.jpg";
import picnicTables from "@/assets/picnic-tables.jpg";
import porkSizzler from "@/assets/pork-sizzler.jpg";

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
  pavilionWide,
  curioShop,
  waterfall,
  elephantBridge,
  staffWelcome,
  gardenLion,
  picnicTables,
  porkSizzler,
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
    src: pavilionWide,
    alt: "The thatched dining pavilion with guests seated, a stone path, and a crocodile sculpture on the lawn",
    caption: "The dining pavilion and grounds",
    category: "Garden",
    tall: true,
  },
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
    src: curioShop,
    alt: "A curio stand selling beaded jewellery, woven bags and traditional cloth",
    caption: "The curio shop, on site",
    category: "Détail",
  },
  {
    src: drums,
    alt: "The dining pavilion lit up at night with a leopard sculpture on the lawn",
    caption: "The grounds after dark",
    category: "Culture",
  },
  {
    src: staffWelcome,
    alt: "A staff member in branded uniform welcoming guests beside the curio display",
    caption: "Friendly staff, ready to welcome you",
    category: "Culture",
  },
  {
    src: interiorDeck,
    alt: "Covered wooden deck seating under a thatched roof",
    caption: "Covered deck seating",
    category: "Garden",
  },
  {
    src: elephantBridge,
    alt: "A life-size elephant sculpture beside a raised wooden walkway, with a signpost showing distances to African destinations",
    caption: "The elephant, and the walkway through the grounds",
    category: "Garden",
  },
  {
    src: waterfall,
    alt: "A rock-built water feature in the garden, with the thatched pavilion behind it",
    caption: "The rock water feature",
    category: "Détail",
  },
  {
    src: gardenLion,
    alt: "A lion sculpture and guinea fowl sculptures on the lawn among picnic tables",
    caption: "Another corner of the garden",
    category: "Garden",
  },
  {
    src: picnicTables,
    alt: "Numbered picnic tables in the garden with camel and cheetah sculptures nearby",
    caption: "Table seating around the grounds",
    category: "Garden",
  },
  {
    src: food,
    alt: "A grilled meat platter with rosemary garnish and cocktails, served in the evening garden",
    caption: "Dinner in the garden, after dark",
    category: "Food",
    tall: true,
  },
  {
    src: porkSizzler,
    alt: "Sizzling grilled pork served on a hot plate with tomato and onion",
    caption: "Sizzling grilled pork, straight to the table",
    category: "Food",
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
