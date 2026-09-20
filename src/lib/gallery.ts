import garden from "@/assets/garden-umbrella-dining.jpg";
import food from "@/assets/grilled-ribs-on-grill.jpg";
import craft from "@/assets/craft-detail.jpg";
import drums from "@/assets/culture-drums.jpg";
import interiorDeck from "@/assets/interior-deck.jpg";
import sadzaPlate from "@/assets/sadza-plate.jpg";
import craftBaskets from "@/assets/craft-art-baskets.jpg";
import pavilionWide from "@/assets/pavilion-wide.jpg";
import curioShop from "@/assets/curio-shop.jpg";
import gardenZebraSignpost from "@/assets/garden-zebra-signpost.jpg";
import gardenZebraTable from "@/assets/garden-zebra-table.jpg";
import elephantBridge from "@/assets/elephant-bridge.jpg";
import staffWelcome from "@/assets/staff-welcome.jpg";
import gardenLion from "@/assets/garden-lion.jpg";
import picnicTables from "@/assets/picnic-tables.jpg";
import nightLeopardStatue from "@/assets/night-leopard-statue.jpg";
import porkSizzler from "@/assets/pork-sizzler.jpg";
import playArea from "@/assets/play-area.jpg";
import goatChopsPlate from "@/assets/goat-chops-plate.jpg";
import entranceNyamaChoma from "@/assets/entrance-nyama-choma.jpg";
import traditionalDrinkPouring from "@/assets/traditional-drink-pouring.webp";
import potjiePotsTable from "@/assets/potjie-pots-table.webp";
import gardenGuestsDaytime from "@/assets/garden-guests-daytime.webp";
import fireRibsFlame from "@/assets/fire-ribs-flame.webp";
import sadzaGreensMoody from "@/assets/sadza-greens-moody.webp";
import sadzaGreensPlatter from "@/assets/sadza-greens-platter.jpg";
import cocktailLayered from "@/assets/cocktail-layered.webp";
import ricePotjiePot from "@/assets/rice-potjie-pot.jpg";
import grilledMeatPlatter from "@/assets/grilled-meat-platter.jpg";
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
import grillStaffTurningMeat800 from "@/assets/grill-staff-turning-meat-800w.webp";
import grillStaffTurningMeat1600 from "@/assets/grill-staff-turning-meat-1600w.webp";
import chickenOnGrate800 from "@/assets/chicken-on-grate-closeup-800w.webp";
import chickenOnGrate1600 from "@/assets/chicken-on-grate-closeup-1600w.webp";
import nyamaChomaGrillCounterWide from "@/assets/nyama-choma-grill-counter-wide.webp";
import grillBaysTendingFire from "@/assets/grill-bays-tending-fire.webp";
import seatingLionKudu from "@/assets/seating-lion-kudu.jpg";
import gazeboArtForSale from "@/assets/gazebo-art-for-sale.jpg";
import kuduFamilyCloseup from "@/assets/kudu-family-closeup.jpg";
import elephantZebraSignpost from "@/assets/elephant-zebra-signpost.jpg";
import nyamaChomaGrillStation from "@/assets/nyama-choma-grill-station.jpg";

export const images = {
  garden,
  food,
  craft,
  drums,
  interiorDeck,
  sadzaPlate,
  craftBaskets,
  pavilionWide,
  curioShop,
  gardenZebraSignpost,
  gardenZebraTable,
  elephantBridge,
  staffWelcome,
  gardenLion,
  picnicTables,
  porkSizzler,
  playArea,
  goatChopsPlate,
  entranceNyamaChoma,
  traditionalDrinkPouring,
  potjiePotsTable,
  gardenGuestsDaytime,
  fireRibsFlame,
  sadzaGreensMoody,
  sadzaGreensPlatter,
  cocktailLayered,
  ricePotjiePot,
  grilledMeatPlatter,
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
  seatingLionKudu,
  gazeboArtForSale,
  kuduFamilyCloseup,
  elephantZebraSignpost,
  nyamaChomaGrillStation,
  chickenOnGrate800,
};

export type GalleryEntry = {
  src: string;
  /** Optional responsive candidates for the grid card. `src` stays the full-size file (used by the lightbox and as the fallback). */
  srcSet?: string;
  /** Optional CSS object-position for the grid-card crop, e.g. "50% 30%". */
  position?: string;
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
    alt: "Wooden picnic tables under tan umbrellas on the lawn, with a kudu sculpture in the foreground and a zebra sculpture among the trees",
    caption: "Dining under the umbrellas, among the sculptures",
    category: "Garden",
    tall: true,
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
    src: gardenZebraSignpost,
    alt: "A zebra sculpture drinking from a stone trough beside a signpost of African destinations, with umbrellas and picnic tables behind",
    caption: "The zebra and the signpost",
    category: "Garden",
    tall: true,
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
    alt: "Grilled meat at Cultures Resort: racks of ribs and other cuts cooking on the grill, with a pair of tongs turning them",
    caption: "Ribs on the open-fire grill",
    category: "Food",
  },
  {
    src: porkSizzler,
    alt: "Sizzling grilled pork served on a hot plate with tomato and onion",
    caption: "Sizzling grilled pork, straight to the table",
    category: "Fire",
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
    src: gardenZebraTable,
    alt: "A picnic table under an umbrella beneath leafy branches, with a zebra sculpture and the play area in the background",
    caption: "A table in the shade of the trees",
    category: "Garden",
    tall: true,
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
    src: sadzaGreensPlatter,
    alt: "Meal served at Cultures Resort: sadza, cooked greens, brown rice and chips on a steel platter, with a small bowl of gravy",
    caption: "Sadza, greens and rice, on the platter",
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
    alt: "Meal served at Cultures Resort: a dome of tomato rice and cooked greens on a white plate, with a small potjie pot of stew and the garden behind",
    caption: "Tomato rice and greens, with a pot of stew",
    category: "Food",
  },
  {
    src: entranceNyamaChoma,
    alt: "The covered entrance walkway beside the Nyama Choma grill counter, with banana plants, a reed gate and the thatched dining area ahead",
    caption: "The entrance, past the Nyama Choma grill",
    category: "Garden",
    tall: true,
  },
  {
    src: grilledMeatPlatter,
    alt: "Grilled meat pieces with herbs served on a dark platter on a wooden table",
    caption: "From the grill, served at the table",
    category: "Fire",
    tall: true,
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
    src: nyamaChomaGrillCounterWide,
    alt: "The Nyama Choma grill counter under its metal roof, with the large hooded grill behind it, a staff member at the fire and a woman in African-print clothing beside the red counter",
    caption: "The Nyama Choma grill counter and fire area",
    category: "Fire",
    tall: true,
    position: "50% 88%",
  },
  {
    src: chickenOnGrate1600,
    srcSet: `${chickenOnGrate800} 800w, ${chickenOnGrate1600} 1600w`,
    alt: "Golden-brown grilled chicken and other cuts on the grate above glowing coals",
    caption: "Chicken on the grate, above the embers",
    category: "Fire",
    tall: true,
    position: "50% 32%",
  },
  {
    src: grillBaysTendingFire,
    alt: "A staff member tending the fire in the large hooded grill, with logs and coals in the grill bays and the red Nyama Choma counter in the foreground",
    caption: "Tending the fire in the grill bays",
    category: "Fire",
    tall: true,
    position: "50% 55%",
  },
  {
    src: grillStaffTurningMeat1600,
    srcSet: `${grillStaffTurningMeat800} 800w, ${grillStaffTurningMeat1600} 1600w`,
    alt: "A staff member in a hairnet turning grilled chicken and other meat with tongs on the large charcoal grill, with glowing coals below",
    caption: "Turning the meat over glowing coals",
    category: "People",
    tall: true,
    position: "50% 30%",
  },
  {
    src: nightLeopardStatue,
    alt: "A leopard sculpture at the garden's edge at night, with lit umbrellas and animal statues among the tables beyond",
    caption: "The leopard keeping watch over the garden at night",
    category: "Night",
  },
  {
    src: seatingLionKudu,
    alt: "A picnic table under an umbrella beside the lion and kudu sculptures, with the thatched pavilion behind",
    caption: "Seating among the lion and kudu",
    category: "Garden",
  },
  {
    src: gazeboArtForSale,
    alt: "Hand-painted canvases leaning against the railing of a garden gazebo, with picnic tables and umbrellas beyond",
    caption: "African art, under the gazebo",
    category: "Culture",
  },
  {
    src: kuduFamilyCloseup,
    alt: "A kudu sculpture with its calf in the foreground, with a baboon, zebra and lion sculpture among the garden tables behind",
    caption: "The kudu and calf, in the garden",
    category: "Garden",
    tall: true,
  },
  {
    src: elephantZebraSignpost,
    alt: "An elephant sculpture in the foreground, with a zebra grazing near the signpost of African destinations behind",
    caption: "The elephant, and the signpost beyond",
    category: "Garden",
  },
  {
    src: nyamaChomaGrillStation,
    alt: "The three-bay Nyama Choma grill station, unlit, with firewood stacked in each bay",
    caption: "The Nyama Choma grill, ready for the fire",
    category: "Details",
  },
];
