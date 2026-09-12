import garden from "@/assets/hero-garden.jpg";
import food from "@/assets/food-platter.jpg";
import craft from "@/assets/craft-detail.jpg";
import drums from "@/assets/culture-drums.jpg";
import interiorDeck from "@/assets/interior-deck.jpg";
import sadzaPlate from "@/assets/sadza-plate.jpg";
import jollofPlate from "@/assets/jollof-plate.jpg";
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
import playArea from "@/assets/play-area.jpg";
import goatChopsPlate from "@/assets/goat-chops-plate.jpg";
import interiorTrophyWall from "@/assets/interior-trophy-wall.webp";
import traditionalDrinkPouring from "@/assets/traditional-drink-pouring.webp";
import potjiePotsTable from "@/assets/potjie-pots-table.webp";
import gardenGuestsDaytime from "@/assets/garden-guests-daytime.webp";
import fireRibsFlame from "@/assets/fire-ribs-flame.webp";
import sadzaGreensMoody from "@/assets/sadza-greens-moody.webp";
import cocktailLayered from "@/assets/cocktail-layered.webp";
import ricePotjiePot from "@/assets/rice-potjie-pot.webp";

export const images = {
  garden,
  food,
  craft,
  drums,
  interiorDeck,
  sadzaPlate,
  jollofPlate,
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
  playArea,
  goatChopsPlate,
  interiorTrophyWall,
  traditionalDrinkPouring,
  potjiePotsTable,
  gardenGuestsDaytime,
  fireRibsFlame,
  sadzaGreensMoody,
  cocktailLayered,
  ricePotjiePot,
};

export type GalleryEntry = {
  src: string;
  alt: string;
  caption: string;
  category: "Garden" | "Food" | "Fire" | "Culture" | "People" | "Details";
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
    category: "Details",
    tall: true,
  },
  {
    src: curioShop,
    alt: "A curio stand selling beaded jewellery, woven bags and traditional cloth",
    caption: "The curio shop, on site",
    category: "Culture",
  },
  {
    src: drums,
    alt: "The dining pavilion lit up at night with a leopard sculpture on the lawn",
    caption: "The grounds after dark",
    category: "Garden",
  },
  {
    src: staffWelcome,
    alt: "A staff member in branded uniform welcoming guests beside the curio display",
    caption: "Friendly staff, ready to welcome you",
    category: "People",
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
    category: "Garden",
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
    category: "Fire",
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
    category: "Culture",
    tall: true,
  },
  {
    src: craftClayPot,
    alt: "A staff member in traditional dress arranging a large clay pot",
    caption: "Traditional dress and handcrafted clay pots",
    category: "Culture",
  },
  {
    src: playArea,
    alt: "A colourful two-storey wooden play tower with a slide, in the garden",
    caption: "The kids' play area",
    category: "Garden",
  },
  {
    src: goatChopsPlate,
    alt: "Char-grilled ribs and chops with a slice of tomato, served sizzling on a black platter",
    caption: "Char-grilled ribs, straight off the fire",
    category: "Fire",
  },
  {
    src: gardenGuestsDaytime,
    alt: "Guests seated at picnic tables in the garden on a sunny day, with lion and elephant sculptures among the greenery",
    caption: "A sunny afternoon in the garden",
    category: "People",
    tall: true,
  },
  {
    src: interiorTrophyWall,
    alt: "The covered dining pavilion in daylight, with mounted kudu and wildebeest heads on the wood-panelled wall above rows of wooden tables and chairs",
    caption: "Covered seating, beneath the trophy wall",
    category: "Details",
  },
  {
    src: traditionalDrinkPouring,
    alt: "Two staff members in branded uniform pouring a traditional drink from a large clay pot into ceramic cups",
    caption: "A traditional welcome drink, poured from the pot",
    category: "People",
  },
  {
    src: potjiePotsTable,
    alt: "Small cast-iron three-legged pots of stew on a table, beside plates of grilled offal and mopani worms",
    caption: "Stews, straight from the pot",
    category: "Fire",
  },
  {
    src: fireRibsFlame,
    alt: "Grilled ribs and chops on a wire rack directly over open flame and glowing coals",
    caption: "Straight over the coals",
    category: "Fire",
  },
  {
    src: sadzaGreensMoody,
    alt: "A close-up plate of sadza and chopped greens, with a traditional clay pot softly out of focus behind it",
    caption: "Sadza and greens, plated",
    category: "Food",
    tall: true,
  },
  {
    src: cocktailLayered,
    alt: "A tall layered cocktail in blue, orange and red on a wooden table in the garden",
    caption: "A cocktail to start the evening",
    category: "Details",
  },
  {
    src: ricePotjiePot,
    alt: "A dome of tomato rice on a white plate, with a small traditional pot of stew served on the side",
    caption: "Rice and stew, from the pot",
    category: "Food",
  },
];
