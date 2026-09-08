// Real dish/drink photos, cropped from the client's own printed menu.
// Keyed by the exact menu_items.name value in D1 — falls back to a
// category placeholder (see routes/menu.tsx) for anything not listed here.
import kukuChoma from "@/assets/dishes/kuku-choma.jpg";
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

export const dishPhotos: Record<string, string> = {
  "Kuku Choma": kukuChoma,
  "Kuku Karanga": kukuKaranga,
  "Beef Chop ala Masai": beefChopAlaMasai,
  "Goat Ribs (Mbavu za Mbuzi)": mbavuZaMbuzi,
  "Tsuro (Rabbit)": tsuroRabbit,
  "Bata Choma": bataChoma,
  Zvinyenze: zvinyenze,
  "Mbuzi Kapoto": mbuziKapoto,
  "Huge Pork Ribs": hugePorkRibs,
  "Road Runner Chicken (Kuku Kienyeji)": roadRunnerChicken,
  "Mguu wa Mbuzi": mguuWaMbuzi,
  Borewores: borewores,
  "Samaki (Hove/Tsomba/Bream)": samakiBream,
  "Samaki Makange": samakiMakange,
  Hanga: hanga,
  Haifiridzi: haifiridzi,
  "Braaied Beef Short Ribs": braaiedBeefShortRibs,
  "Maasai Meat Platter": maasaiMeatPlatter,
  "Mbuzi Ulaya (Charcoal Grilled Pork Chops)": mbuziUlaya,
  "Piri Piri Gizzards": piriPiriGizzards,
  "Fried Liver (Chiropa)": friedLiverChiropa,
  "Mopani Worms (Madora)": mopaniWormsMadora,
  "Fried Kapenta (Omena)": friedKapentaOmena,
  Caribbean: caribbean,
  "Dark Margharitta": darkMargharitta,
  "Sunrise Mocktail": sunriseMocktail,
  "Sex on the Beach": sexOnTheBeach,
  "Malawian Shandy": malawianShandy,
  "Long Island": longIsland,
  "Tequila/Gin Sunrise": tequilaGinSunrise,
  "Blue Lagoon": blueLagoon,
};
