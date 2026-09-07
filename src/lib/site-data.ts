/**
 * Single source of truth for editable site content.
 *
 * Verified business facts are marked VERIFIED and must not be changed
 * without confirmation from the owner. Everything else is a clearly
 * labelled placeholder that the owner can replace from the dashboard.
 */

export const business = {
  // VERIFIED
  name: "Cultures Resort",
  addressLine: "Corner Chiremba Road & Southey Road, Hillside, Harare, Zimbabwe",
  addressShort: "Cnr Chiremba & Southey Rd, Hillside, Harare",
  phoneDisplay: "+263 77 295 1308",
  phoneHref: "tel:+263772951308",
  whatsappHref: "https://wa.me/263772951308",
  email: "culturesresortzimbabwe@gmail.com",
  emailAlt: "culturesresort@gmail.com",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Cnr+Chiremba+and+Southey+Rd+Hillside+Harare+Zimbabwe",
} as const;

/** Placeholder — owner to confirm real trading hours in the dashboard. */
export const openingHours = [
  { day: "Monday", hours: "To be confirmed" },
  { day: "Tuesday", hours: "To be confirmed" },
  { day: "Wednesday", hours: "To be confirmed" },
  { day: "Thursday", hours: "To be confirmed" },
  { day: "Friday", hours: "To be confirmed" },
  { day: "Saturday", hours: "To be confirmed" },
  { day: "Sunday", hours: "To be confirmed" },
];

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  featured?: boolean;
  available?: boolean;
};

export type MenuCategory = {
  slug: string;
  title: string;
  intro: string;
  items: MenuItem[];
};

/**
 * Menu structure only. Dish names and prices are placeholders for the
 * owner's real menu — no prices are invented, they read "On request".
 */
export const menu: MenuCategory[] = [
  {
    slug: "to-begin",
    title: "To Begin",
    intro: "Small plates to share while the fire settles.",
    intro_placeholder: true,
    items: [
      { name: "Starter one", description: "Add the dish description here.", price: "On request", featured: true },
      { name: "Starter two", description: "Add the dish description here.", price: "On request" },
      { name: "Starter three", description: "Add the dish description here.", price: "On request" },
    ],
  } as MenuCategory,
  {
    slug: "traditional-plates",
    title: "Traditional Plates",
    intro: "The heart of the kitchen — slow cooking, wood smoke, patience.",
    items: [
      { name: "Traditional plate one", description: "Add the dish description here.", price: "On request", featured: true },
      { name: "Traditional plate two", description: "Add the dish description here.", price: "On request" },
      { name: "Traditional plate three", description: "Add the dish description here.", price: "On request" },
      { name: "Traditional plate four", description: "Add the dish description here.", price: "On request" },
    ],
  },
  {
    slug: "from-the-fire",
    title: "From The Fire",
    intro: "Grilled over open flame in the garden.",
    items: [
      { name: "Grill one", description: "Add the dish description here.", price: "On request", featured: true },
      { name: "Grill two", description: "Add the dish description here.", price: "On request" },
      { name: "Grill three", description: "Add the dish description here.", price: "On request" },
    ],
  },
  {
    slug: "sides",
    title: "Sides & Relishes",
    intro: "Served family style.",
    items: [
      { name: "Side one", description: "Add the dish description here.", price: "On request" },
      { name: "Side two", description: "Add the dish description here.", price: "On request" },
      { name: "Side three", description: "Add the dish description here.", price: "On request" },
    ],
  },
  {
    slug: "drinks",
    title: "Traditional Drinks",
    intro: "Traditional and contemporary refreshments.",
    items: [
      { name: "Drink one", description: "Add the drink description here.", price: "On request" },
      { name: "Drink two", description: "Add the drink description here.", price: "On request" },
      { name: "Drink three", description: "Add the drink description here.", price: "On request" },
    ],
  },
];

export const experiences = [
  {
    title: "The Garden",
    body: "Tables set beneath mature trees, lanterns in the branches, open air and shade. Seating is spread across the grounds so groups can gather without crowding.",
  },
  {
    title: "Open Fire Cooking",
    body: "Much of the kitchen happens outdoors, over flame and coals, where guests can see and smell what is being prepared.",
  },
  {
    title: "African Art & Décor",
    body: "Carved wood, woven fibre, clay and hand-dyed cloth are part of the building itself rather than decoration hung on a wall.",
  },
  {
    title: "Family & Friends",
    body: "Long tables, space for children, and an unhurried pace. People come to stay a while, not only to eat.",
  },
];

/** Gallery placeholders — replace with the owner's own photography. */
export const galleryCaptions = [
  "Garden dining at dusk — placeholder image",
  "Traditional plates, served family style — placeholder image",
  "Handcrafted détail and décor — placeholder image",
  "Cultural performance in the courtyard — placeholder image",
];

export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Our Story", to: "/our-story" },
  { label: "Menu", to: "/menu" },
  { label: "Experience", to: "/experience" },
  { label: "Gallery", to: "/gallery" },
  { label: "Events", to: "/events" },
  { label: "Contact", to: "/contact" },
] as const;
