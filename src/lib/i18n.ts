export const locales = ["en","sr","de","es","fr","it","pt"] as const;
export type Locale = typeof locales[number];

export const localeNames: Record<Locale,string> = {
  en:"English", sr:"Srpski", de:"Deutsch", es:"Español", fr:"Français", it:"Italiano", pt:"Português"
};

export const dictionaries: Record<Locale, Record<string,string>> = {
  en:{
    home:"Home", trending:"Trending", xStories:"X Stories", tech:"Tech & AI", entertainment:"Entertainment",
    search:"Search stories...", breaking:"BREAKING", feed:"THE FEED", talking:"What everyone is talking about",
    viewTrending:"View trending →", category:"CATEGORY", searchTitle:"Search stories", searchButton:"Search",
    noStories:"No stories found.", tryKeyword:"Try a different keyword.", keepReading:"KEEP READING",
    more:"More from VIRALWIRE", minRead:"min read", shareX:"Share on X ↗", copy:"Copy link", localWeather:"Local weather",
    weatherUnavailable:"Weather unavailable", trendingDesc:"The stories getting attention across the VIRALWIRE feed.",
    trendingIntro:"A rolling view of the stories drawing the most attention on VIRALWIRE. Rankings are based on story views when analytics are available.",
    views:"views", noCategory:"No stories in this category yet.", searchDesc:"Search VIRALWIRE stories."
  },
  sr:{
    home:"Početna", trending:"U trendu", xStories:"X priče", tech:"Tehnologija i AI", entertainment:"Zabava",
    search:"Pretraži priče...", breaking:"NAJNOVIJE", feed:"FEED", talking:"O čemu svi pričaju",
    viewTrending:"Pogledaj trendove →", category:"KATEGORIJA", searchTitle:"Pretraži priče", searchButton:"Pretraži",
    noStories:"Nema pronađenih priča.", tryKeyword:"Probaj drugu ključnu reč.", keepReading:"NASTAVI ČITANJE",
    more:"Još sa VIRALWIRE", minRead:"min čitanja", shareX:"Podeli na X ↗", copy:"Kopiraj link", localWeather:"Lokalno vreme",
    weatherUnavailable:"Vreme nije dostupno", trendingDesc:"Priče koje privlače najviše pažnje na VIRALWIRE feedu.",
    trendingIntro:"Pregled priča koje privlače najviše pažnje na VIRALWIRE-u. Rangiranje se zasniva na pregledima kada je analitika dostupna.",
    views:"pregleda", noCategory:"Još nema priča u ovoj kategoriji.", searchDesc:"Pretraži VIRALWIRE priče."
  },
  de:{
    home:"Startseite", trending:"Im Trend", xStories:"X Stories", tech:"Tech & KI", entertainment:"Entertainment",
    search:"Stories suchen...", breaking:"AKTUELL", feed:"DER FEED", talking:"Worüber alle sprechen",
    viewTrending:"Trends ansehen →", category:"KATEGORIE", searchTitle:"Stories suchen", searchButton:"Suchen",
    noStories:"Keine Stories gefunden.", tryKeyword:"Versuche ein anderes Stichwort.", keepReading:"WEITERLESEN",
    more:"Mehr von VIRALWIRE", minRead:"Min. Lesezeit", shareX:"Auf X teilen ↗", copy:"Link kopieren", localWeather:"Lokales Wetter",
    weatherUnavailable:"Wetter nicht verfügbar", trendingDesc:"Stories mit Aufmerksamkeit im VIRALWIRE-Feed.",
    trendingIntro:"Ein laufender Überblick über die meistbeachteten Stories auf VIRALWIRE. Die Rangfolge basiert auf Aufrufen, sofern Analysen verfügbar sind.",
    views:"Aufrufe", noCategory:"Noch keine Stories in dieser Kategorie.", searchDesc:"VIRALWIRE Stories durchsuchen."
  },
  es:{
    home:"Inicio", trending:"Tendencias", xStories:"Historias de X", tech:"Tecnología e IA", entertainment:"Entretenimiento",
    search:"Buscar historias...", breaking:"ÚLTIMA HORA", feed:"EL FEED", talking:"De lo que todos hablan",
    viewTrending:"Ver tendencias →", category:"CATEGORÍA", searchTitle:"Buscar historias", searchButton:"Buscar",
    noStories:"No se encontraron historias.", tryKeyword:"Prueba otra palabra clave.", keepReading:"SEGUIR LEYENDO",
    more:"Más de VIRALWIRE", minRead:"min de lectura", shareX:"Compartir en X ↗", copy:"Copiar enlace", localWeather:"Clima local",
    weatherUnavailable:"Clima no disponible", trendingDesc:"Las historias que reciben atención en el feed de VIRALWIRE.",
    trendingIntro:"Una vista continua de las historias que reciben más atención en VIRALWIRE. Las posiciones se basan en visitas cuando hay analítica disponible.",
    views:"visitas", noCategory:"Aún no hay historias en esta categoría.", searchDesc:"Buscar historias de VIRALWIRE."
  },
  fr:{
    home:"Accueil", trending:"Tendances", xStories:"Histoires X", tech:"Tech & IA", entertainment:"Divertissement",
    search:"Rechercher des histoires...", breaking:"À LA UNE", feed:"LE FIL", talking:"Ce dont tout le monde parle",
    viewTrending:"Voir les tendances →", category:"CATÉGORIE", searchTitle:"Rechercher des histoires", searchButton:"Rechercher",
    noStories:"Aucune histoire trouvée.", tryKeyword:"Essayez un autre mot-clé.", keepReading:"CONTINUER LA LECTURE",
    more:"Plus de VIRALWIRE", minRead:"min de lecture", shareX:"Partager sur X ↗", copy:"Copier le lien", localWeather:"Météo locale",
    weatherUnavailable:"Météo indisponible", trendingDesc:"Les histoires qui attirent l’attention sur le fil VIRALWIRE.",
    trendingIntro:"Un aperçu continu des histoires qui attirent le plus d’attention sur VIRALWIRE. Le classement repose sur les vues lorsque les analyses sont disponibles.",
    views:"vues", noCategory:"Aucune histoire dans cette catégorie pour le moment.", searchDesc:"Rechercher des histoires VIRALWIRE."
  },
  it:{
    home:"Home", trending:"Tendenze", xStories:"Storie di X", tech:"Tech & IA", entertainment:"Intrattenimento",
    search:"Cerca storie...", breaking:"ULTIME NOTIZIE", feed:"IL FEED", talking:"Di cosa parlano tutti",
    viewTrending:"Vedi tendenze →", category:"CATEGORIA", searchTitle:"Cerca storie", searchButton:"Cerca",
    noStories:"Nessuna storia trovata.", tryKeyword:"Prova un'altra parola chiave.", keepReading:"CONTINUA A LEGGERE",
    more:"Altro da VIRALWIRE", minRead:"min di lettura", shareX:"Condividi su X ↗", copy:"Copia link", localWeather:"Meteo locale",
    weatherUnavailable:"Meteo non disponibile", trendingDesc:"Le storie che attirano attenzione nel feed VIRALWIRE.",
    trendingIntro:"Una panoramica delle storie che attirano più attenzione su VIRALWIRE. Le posizioni si basano sulle visualizzazioni quando le analisi sono disponibili.",
    views:"visualizzazioni", noCategory:"Nessuna storia in questa categoria per ora.", searchDesc:"Cerca storie VIRALWIRE."
  },
  pt:{
    home:"Início", trending:"Em alta", xStories:"Histórias do X", tech:"Tecnologia e IA", entertainment:"Entretenimento",
    search:"Pesquisar histórias...", breaking:"AGORA", feed:"O FEED", talking:"Sobre o que todos estão falando",
    viewTrending:"Ver tendências →", category:"CATEGORIA", searchTitle:"Pesquisar histórias", searchButton:"Pesquisar",
    noStories:"Nenhuma história encontrada.", tryKeyword:"Tente outra palavra-chave.", keepReading:"CONTINUAR A LER",
    more:"Mais da VIRALWIRE", minRead:"min de leitura", shareX:"Partilhar no X ↗", copy:"Copiar link", localWeather:"Clima local",
    weatherUnavailable:"Clima indisponível", trendingDesc:"As histórias que estão chamando atenção no feed VIRALWIRE.",
    trendingIntro:"Uma visão contínua das histórias que recebem mais atenção no VIRALWIRE. A posição baseia-se nas visualizações quando há análise disponível.",
    views:"visualizações", noCategory:"Ainda não há histórias nesta categoria.", searchDesc:"Pesquisar histórias da VIRALWIRE."
  }
};

export function isLocale(value:string|undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getLocale(locals:App.Locals):Locale {
  return isLocale(locals.locale) ? locals.locale : "en";
}

export function t(locals:App.Locals,key:string):string {
  const locale=getLocale(locals);
  return dictionaries[locale][key] || dictionaries.en[key] || key;
}

export function localizePath(locale:Locale,path:string):string {
  const clean=path.startsWith("/")?path:"/"+path;
  if(locale==="en") return clean;
  return "/"+locale+(clean===" /" ? "/" : clean);
}

export function localePath(locale:Locale,path:string):string {
  const clean=path.startsWith("/")?path:"/"+path;
  return locale==="en" ? clean : "/"+locale+clean;
}
