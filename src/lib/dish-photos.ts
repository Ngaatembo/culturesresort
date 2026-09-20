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
import softDrinkGlass from "@/assets/soft-drink-glass.jpg";
import maheuPhoto from "@/assets/dishes/maheu.jpg";
import freshJuice from "@/assets/dishes/fresh-juice.jpg";

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
  Pilau: jollofRice,
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
  "Soft Drink": softDrinkGlass,
  Maheu: maheuPhoto,
  "Fresh Juice": freshJuice,
};
