// Real dish/drink photos, cropped from the client's own printed menu.
// Keyed by the exact menu_items.name value in D1 (current client names and the
// older names they replace). Food with no entry here is shown as a text-only
// card in routes/menu.tsx; only beverages fall back to a category placeholder.
import kukuChoma from "@/assets/dishes/kuku-choma.jpg";
import mufushwaUneDovi from "@/assets/dishes/mufushwa-une-dovi.jpg";
import biryaniRice from "@/assets/dishes/biryani-rice.jpg";
import kukuKaranga from "@/assets/dishes/kuku-karanga.jpg";
import beefChopAlaMasai from "@/assets/dishes/beef-chop-ala-masai.jpg";
import mbavuZaMbuzi from "@/assets/dishes/mbavu-za-mbuzi.jpg";
import tsuroRabbit from "@/assets/dishes/tsuro-rabbit.jpg";
import bataChoma from "@/assets/dishes/bata-choma.jpg";
import zvinyenze from "@/assets/dishes/zvinyenze.jpg";
import mbuziKapoto from "@/assets/dishes/mbuzi-kapoto.jpg";
import hugePorkRibs from "@/assets/dishes/huge-pork-ribs.jpg";
import roadRunnerChicken from "@/assets/dishes/road-runner-chicken.jpg";
import mguuWaMbuzi from "@/assets/dishes/mguu-wa-mbuzi.jpg";
import borewores from "@/assets/dishes/borewores.jpg";
import samakiBream from "@/assets/dishes/samaki-bream.jpg";
import samakiMakange from "@/assets/dishes/samaki-makange.jpg";
import hanga from "@/assets/dishes/hanga.jpg";
import haifiridzi from "@/assets/dishes/haifiridzi.jpg";
import braaiedBeefShortRibs from "@/assets/dishes/braaied-beef-short-ribs.jpg";
import maasaiMeatPlatter from "@/assets/dishes/maasai-meat-platter.jpg";
import mbuziUlaya from "@/assets/dishes/mbuzi-ulaya.jpg";
import piriPiriGizzards from "@/assets/dishes/piri-piri-gizzards.jpg";
import friedLiverChiropa from "@/assets/dishes/fried-liver-chiropa.jpg";
import mopaniWormsMadora from "@/assets/dishes/mopani-worms-madora.jpg";
import friedKapentaOmena from "@/assets/dishes/fried-kapenta-omena.jpg";
import caribbean from "@/assets/dishes/caribbean.jpg";
import darkMargharitta from "@/assets/dishes/dark-margharitta.jpg";
import sunriseMocktail from "@/assets/dishes/sunrise-mocktail.jpg";
import sexOnTheBeach from "@/assets/dishes/sex-on-the-beach.jpg";
import malawianShandy from "@/assets/dishes/malawian-shandy.jpg";
import longIsland from "@/assets/dishes/long-island.jpg";
import tequilaGinSunrise from "@/assets/dishes/tequila-gin-sunrise.jpg";
import blueLagoon from "@/assets/dishes/blue-lagoon.jpg";
import chips from "@/assets/dishes/chips.jpg";
import muriwoUneDovi from "@/assets/dishes/muriwo-une-dovi.jpg";
import jollofRice from "@/assets/dishes/jollof-rice.jpg";
import chapati from "@/assets/dishes/chapati.jpg";
import friedPotatoWedges from "@/assets/dishes/fried-potato-wedges.jpg";
import mpungaUneDovi from "@/assets/dishes/mpunga-une-dovi.jpg";
import sadzaUgali from "@/assets/dishes/sadza-ugali.jpg";
import plainRice from "@/assets/dishes/plain-rice.jpg";
import homemadeCake from "@/assets/dishes/homemade-cake.jpg";
import wildDriedFruits from "@/assets/dishes/wild-dried-fruits.jpg";
import zimTeaCoffee from "@/assets/dishes/zim-tea-coffee.jpg";
import softDrinkPhoto from "@/assets/dishes/soft-drink.jpg";
import maheuPhoto from "@/assets/dishes/maheu.jpg";
import freshJuice from "@/assets/dishes/fresh-juice.jpg";
import pilauPhoto from "@/assets/dishes/pilau.jpg";
import barLocalLagers from "@/assets/dishes/bar-local-lagers.jpg";
import barImportedLagers from "@/assets/dishes/bar-imported-lagers.jpg";
import barCastleLite from "@/assets/dishes/bar-castle-lite.jpg";
import barMineralWater from "@/assets/dishes/bar-mineral-water.jpg";
import barCiders from "@/assets/dishes/bar-ciders.jpg";
import barSpirits from "@/assets/dishes/bar-spirits.jpg";
import barJwRed from "@/assets/dishes/bar-jw-red.jpg";
import barJwBlack from "@/assets/dishes/bar-jw-black.jpg";
import barJwDoubleBlack from "@/assets/dishes/bar-jw-double-black.jpg";
import barJwGold from "@/assets/dishes/bar-jw-gold.jpg";
import barGlenfiddich12 from "@/assets/dishes/bar-glenfiddich-12.jpg";
import barGlenfiddich15 from "@/assets/dishes/bar-glenfiddich-15.jpg";
import barJackDaniels from "@/assets/dishes/bar-jack-daniels.jpg";
import barChivas12 from "@/assets/dishes/bar-chivas-12.jpg";
import barFamousGrouse from "@/assets/dishes/bar-famous-grouse.jpg";
import barMixers from "@/assets/dishes/bar-mixers.jpg";
import wineChamdor from "@/assets/dishes/wine-chamdor.jpg";
import wineDomaine from "@/assets/dishes/wine-jc-le-roux-domaine-white.jpg";
import wineFleurette from "@/assets/dishes/wine-jc-le-roux-la-fleurette.jpg";
import wineKwvSb from "@/assets/dishes/wine-kwv-sauvignon-blanc.jpg";
import wineKwvMerlot from "@/assets/dishes/wine-kwv-merlot.jpg";
import wineNederburg from "@/assets/dishes/wine-nederburg-pinotage.jpg";
import wineBonCourage from "@/assets/dishes/wine-bon-courage-cabernet.jpg";
import wineFatBastard from "@/assets/dishes/wine-fat-bastard-cabernet.jpg";
import wineFourCousins from "@/assets/dishes/wine-four-cousins.jpg";

export const dishPhotos: Record<string, string> = {
  "Kuku Choma": kukuChoma,
  "Mufushwa Une Dovi": mufushwaUneDovi,
  "Biryani Rice": biryaniRice,
  "Goat Ribs (Mbavu za Mbuzi)": mbavuZaMbuzi,
  "Mguu wambuzi (grilled goat leg)": mguuWaMbuzi,
  "Road Runner Chicken (Kuku Kienyeji)": roadRunnerChicken,
  Zvinyenze: zvinyenze,
  "Bata Choma": bataChoma,
  "Kuku Karanga": kukuKaranga,
  "Beef Chop ala Masai": beefChopAlaMasai,
  "Mbavu za Mbuzi": mbavuZaMbuzi,
  "Tsuro (Rabbit)": tsuroRabbit,
  "Tsuro / Rabbit": tsuroRabbit,
  Zvinvenze: zvinyenze,
  "Mbuzi Kapoto": mbuziKapoto,
  "Huge Pork Ribs": hugePorkRibs,
  "Kuku Kienyeji / Road Runner": roadRunnerChicken,
  "Mguu wa Mbuzi": mguuWaMbuzi,
  Borewores: borewores,
  "Samaki (Hove/Tsomba/Bream)": samakiBream,
  "Samaki / Hove / Tsomba / Bream": samakiBream,
  "Samaki Makange": samakiMakange,
  Hanga: hanga,
  Haifiridzi: haifiridzi,
  "Braaied Beef Short Ribs": braaiedBeefShortRibs,
  "Maasai Meat Platter": maasaiMeatPlatter,
  "Mbuzi Ulaya / Charcoal Grilled": mbuziUlaya,
  "Piri Piri Gizzards": piriPiriGizzards,
  "Fried Liver (Chiropa)": friedLiverChiropa,
  "Fried Liver / Chiropa": friedLiverChiropa,
  "Mopani Worms (Madora)": mopaniWormsMadora,
  "Mopani Worms / Madora": mopaniWormsMadora,
  "Fried Kapenta (Omena)": friedKapentaOmena,
  "Fried Kapenta / Omena": friedKapentaOmena,
  Caribbean: caribbean,
  "Dark Margharitta": darkMargharitta,
  "Sunrise Mocktail": sunriseMocktail,
  "Sex on the Beach": sexOnTheBeach,
  "Malawian Shandy": malawianShandy,
  "Long Island": longIsland,
  "Tequila/Gin Sunrise": tequilaGinSunrise,
  "Blue Lagoon": blueLagoon,
  Chips: chips,
  "Chips / Fries": chips,
  "Muriwo Une Dovi": muriwoUneDovi,
  "Pilau / Jollof Rice": jollofRice,
  "Jollof Rice": jollofRice,
  Pilau: pilauPhoto,
  Chapati: chapati,
  "Fried Potatoes": friedPotatoWedges,
  "Fried Potato Wedges": friedPotatoWedges,
  "Mpunga Une Dovi": mpungaUneDovi,
  "Sadza / Ugali (Isitshwala)": sadzaUgali,
  "Sadza / Ugali": sadzaUgali,
  "Plain Rice (Wali)": plainRice,
  "Plain Aromatic Rice": plainRice,
  "Homemade Cake Slice": homemadeCake,
  "Home Made Cake": homemadeCake,
  "Wild Dried Fruits": wildDriedFruits,
  "Best Zimbabwean Tea / Coffee": zimTeaCoffee,
  "Best Zimbabwean Coffee / Tea": zimTeaCoffee,
  "Soft Drink": softDrinkPhoto,
  Maheu: maheuPhoto,
  "Fresh Juice": freshJuice,
  // Bar price list (client-supplied product photos, matched by exact item name)
  "Local Lagers": barLocalLagers,
  "Imported Lagers": barImportedLagers,
  "Castle Lite": barCastleLite,
  "Mineral Water": barMineralWater,
  Ciders: barCiders,
  Spirits: barSpirits,
  "J Walker Red": barJwRed,
  "J Walker Black": barJwBlack,
  "J Walker D/Black": barJwDoubleBlack,
  "J Walker Double Black": barJwDoubleBlack,
  "J Walker Gold": barJwGold,
  "Glenfiddich 12yrs": barGlenfiddich12,
  "Glenfiddich 15yrs": barGlenfiddich15,
  "Jack Daniels": barJackDaniels,
  "Chivas Regal 12yrs": barChivas12,
  "Famous Grouse": barFamousGrouse,
  "Mixers (Tonic, Ginger Ale, etc)": barMixers,
  Mixers: barMixers,
  // Wines (product-only photos, matched by exact name; Rooiberg Brut has no photo yet)
  Chamdor: wineChamdor,
  "J.C. Le Roux Domaine White": wineDomaine,
  "J.C. Le Roux La Fleurette": wineFleurette,
  "KWV Sauvignon Blanc": wineKwvSb,
  "KWV Merlot": wineKwvMerlot,
  "Nederburg Pinotage": wineNederburg,
  "Bon Courage Cabernet Sauvignon": wineBonCourage,
  "Fat Bastard Cabernet Sauvignon": wineFatBastard,
  "Four Cousins": wineFourCousins,
};
