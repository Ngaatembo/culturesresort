import garden from "@/assets/hero-garden.jpg";
import food from "@/assets/food-platter.jpg";
import craft from "@/assets/craft-detail.jpg";
import drums from "@/assets/culture-drums.jpg";
import interiorDeck from "@/assets/interior-deck.jpg";
import sadzaPlate from "@/assets/sadza-plate.jpg";
import jollofPlate from "@/assets/jollof-plate.jpg";
import craftBaskets from "@/assets/craft-art-baskets.jpg";
import pavilionWide from "@/assets/pavilion-wide.jpg";
import curioShop from "@/assets/curio-shop.jpg";
import waterfall from "@/assets/waterfall.jpg";
import elephantBridge from "@/assets/elephant-bridge.jpg";
import staffWelcome from "@/assets/staff-welcome.jpg";
import gardenLion from "@/assets/garden-lion.jpg";
import picnicTables from "@/assets/picnic-tables.jpg";
import nightSunsetGrounds from "@/assets/night-sunset-grounds.jpg";
import nightLeopardStatue from "@/assets/night-leopard-statue.jpg";
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
import gardenPicnicSunlit from "@/assets/garden-picnic-sunlit.webp";
import craftShopPicnicTables from "@/assets/craft-shop-picnic-tables.jpg";
import lambChopsPlatter from "@/assets/lamb-chops-platter.jpg";
import steakOnGrillTomato from "@/assets/steak-on-grill-tomato.jpg";
import sadzaCouscousTwoPlates from "@/assets/sadza-couscous-two-plates.jpg";
import kuduStatueGarden from "@/assets/kudu-statue-garden.jpg";
import wholeGrilledChicken from "@/assets/whole-grilled-chicken.jpg";
import meatOverOpenCoals from "@/assets/meat-over-open-coals.jpg";
import entranceBananaLeaves from "@/assets/entrance-banana-leaves.jpg";
import staffPotOnHead from "@/assets/staff-pot-on-head.jpg";
import interiorThatchedHall from "@/assets/interior-thatched-hall.jpg";
import feastPlatterMixed from "@/assets/feast-platter-mixed.jpg";
import sausagesOnGrill from "@/assets/sausages-on-grill.jpg";
import lambChopsWideTray from "@/assets/lamb-chops-wide-tray.jpg";

export const images = {
  garden,
  food,
  craft,
  drums,
  interiorDeck,
  sadzaPlate,
  jollofPlate,
  craftBaskets,
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
  gardenPicnicSunlit,
  craftShopPicnicTables,
  lambChopsPlatter,
  steakOnGrillTomato,
  sadzaCouscousTwoPlates,
  kuduStatueGarden,
  wholeGrilledChicken,
  meatOverOpenCoals,
  entranceBananaLeaves,
  staffPotOnHead,
  interiorThatchedHall,
  feastPlatterMixed,
  sausagesOnGrill,
  lambChopsWideTray,
};

export type GalleryEntry = {
  src: string;
  alt: string;
  caption: string;
  category: "Garden" | "Food" | "Fire" | "Culture" | "People" | "Details" | "Night";
  tall?: boolean;
};

/** Real photographs of Cultures Resort, Hillside, Harare. */
export const gallery: GalleryEntry[] = [
  {
    src: pavilionWide,
    alt: "The thatched dining pavilion seen across the lawn, with a stone path and crocodile and antelope sculptures",
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
    alt: "A staff member in traditional beadwork admiring a hand-drawn buffalo artwork on the brick pavilion wall",
    caption: "African art on the pavilion walls",
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
    alt: "A staff member in traditional-pattern uniform beside African paintings and art on display",
    caption: "Art and culture on display",
    category: "Culture",
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
    alt: "Grilled chicken and steaks smoking on an open charcoal grill, with fresh vegetables and a potjie pot alongside",
    caption: "Straight off the open-fire grill",
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
    src: playArea,
    alt: "A colourful two-storey wooden play tower with a slide, in the garden",
    caption: "The kids' play area",
    category: "Garden",
  },
  {
    src: goatChopsPlate,
    alt: "A seared steak and chop platter garnished with rosemary, tomato and onion, served in the garden",
    caption: "Seared steaks, straight to the table",
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
    alt: "Two staff members in branded caps preparing maheu and traditional snacks beside large clay pots and calabashes",
    caption: "Maheu and traditional snacks, ready to serve",
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
    alt: "A dome of tomato rice and cooked greens on a white plate, with a small potjie pot of stew and the pavilion behind",
    caption: "Rice and stew, from the pot",
    category: "Food",
  },
  {
    src: craftShopPicnicTables,
    alt: "Picnic tables in front of the African Art & Crafts shop, with zebra and camel sculptures on the lawn",
    caption: "Picnic tables by the craft shop",
    category: "Garden",
  },
  {
    src: lambChopsPlatter,
    alt: "A platter of grilled lamb chops fanned out with a rosemary sprig at the centre",
    caption: "Grilled lamb chops, plated",
    category: "Fire",
  },
  {
    src: steakOnGrillTomato,
    alt: "Grilled steaks on a cast-iron griddle over the fire, garnished with a tomato slice and rosemary",
    caption: "Steaks, straight off the grill",
    category: "Fire",
    tall: true,
  },
  {
    src: sadzaCouscousTwoPlates,
    alt: "Two plates of sadza and couscous with cooked greens, with the African Art & Crafts shop in the background",
    caption: "Sadza and couscous, side by side",
    category: "Food",
  },
  {
    src: kuduStatueGarden,
    alt: "A kudu sculpture in the garden with the thatched pavilion, zebra and elephant sculptures behind",
    caption: "The kudu, keeping watch over the garden",
    category: "Garden",
    tall: true,
  },
  {
    src: wholeGrilledChicken,
    alt: "A whole butterflied chicken, char-grilled and garnished with fresh rosemary",
    caption: "Whole chicken, straight off the fire",
    category: "Fire",
    tall: true,
  },
  {
    src: meatOverOpenCoals,
    alt: "Grilled meat cooking on the grate over live charcoal and open flame",
    caption: "Over the open coals",
    category: "Fire",
  },
  {
    src: entranceBananaLeaves,
    alt: "The thatched entrance to Cultures Resort framed by banana leaves, with a chalkboard menu sign out front",
    caption: "The entrance, under the banana leaves",
    category: "Garden",
    tall: true,
  },
  {
    src: staffPotOnHead,
    alt: "A staff member in traditional dress balancing a clay pot on her head at the resort's entrance",
    caption: "A traditional welcome at the entrance",
    category: "People",
    tall: true,
  },
  {
    src: interiorThatchedHall,
    alt: "The main thatched dining hall with mounted kudu, buffalo and antelope trophies on the wall",
    caption: "Under the thatch, surrounded by the bush",
    category: "Details",
  },
  {
    src: feastPlatterMixed,
    alt: "A large mixed platter with sadza, brown rice, jollof rice, grilled chicken, greens and gravy",
    caption: "The feast platter, for sharing",
    category: "Food",
  },
  {
    src: sausagesOnGrill,
    alt: "Grilled sausages (boerewors) on the grill, garnished with rosemary",
    caption: "Boerewors, off the grill",
    category: "Fire",
  },
  {
    src: lambChopsWideTray,
    alt: "A wide tray of grilled lamb chops garnished with rosemary",
    caption: "Lamb chops, fresh off the coals",
    category: "Fire",
  },
  {
    src: nightSunsetGrounds,
    alt: "The grounds at dusk, with the play area, the thatched gazebo seating and the lit bar counter under an orange sunset sky",
    caption: "The grounds at sunset",
    category: "Night",
    tall: false,
  },
  {
    src: nightLeopardStatue,
    alt: "A leopard sculpture at the garden's edge at night, with lit umbrellas and animal statues among the tables beyond",
    caption: "The garden after dark",
    category: "Night",
  },
];
