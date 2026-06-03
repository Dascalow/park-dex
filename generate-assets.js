const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const SPAPI_BASE_URL = 'https://spapi.dev/api';
const WIKI_BASE_URL = 'https://southpark.wiki.gg';
const PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const nameOverrides = {
  Fluffy: 'Fluffy (pig)',
  Timmy: 'Timmy Burch',
  Jimmy: 'Jimmy Valmer',
  Chef: 'Jerome "Chef" McElroy',
  Garrison: 'Herbert Garrison',
  'Mr. Garrison': 'Herbert Garrison',
  Token: 'Tolkien Black',
  'Token Black': 'Tolkien Black',
  'Florence Cartman': 'Florence Cartman',
  'Grandpa Marsh': 'Marvin Marsh',
  'Liane Cartman': 'Liane Cartman',
};

function normalizeImageUrl(imageUrl) {
  if (!imageUrl) return null;

  imageUrl = imageUrl.split('/revision/latest')[0]; 

  if (imageUrl.startsWith('//')) {
    return `https:${imageUrl}`;
  }
  if (imageUrl.startsWith('/')) {
    return `${WIKI_BASE_URL}${imageUrl}`;
  }
  return imageUrl;
}

function pageTitleToUrl(title) {
  return `${WIKI_BASE_URL}/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

async function fetchCharactersFromAPI() {
    try {
        console.log("Se descarcă personajele de la SPAPI...");
        const response = await axios.get('https://spapi.dev/api/characters?page[size]=50');
        return response.data.data; 
    } catch (error) {
        console.error("Eroare la conectarea cu SPAPI:", error.message);
        return [];
    }
}
async function getWikiImageUrl(characterName) {
    const formattedName = encodeURIComponent(characterName.replace(/ /g, '_'));
    const wikiUrl = `https://southpark.wiki.gg/wiki/${formattedName}`;

    try {
        const response = await axios.get(wikiUrl);
        const $ = cheerio.load(response.data);
        let imageUrl = $('.infobox img').first().attr('src') || 
                       $('.pi-image-thumbnail').first().attr('src');

        if (imageUrl) {
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            }
            return imageUrl;
        }
        return null;
    } catch (error) {
        return null;
    }
    return { imageUrl: null, wikiUrl, reason: `Eroare HTTP: ${error.message}` };
  }

async function resolveCharacterAsset(character) {
  const id = character.id;
  const name = (character.attributes?.name || character.name || '').trim();

  if (!name) {
    return {
      id, name: 'Unknown', wikiTitle: null, wikiUrl: null, imageUrl: PLACEHOLDER_IMAGE, matchMethod: 'missing-name', reason: 'Fără nume în SPapi',
    };
  }

  const searchName = nameOverrides[name] || name;
  const wikiTitle = await searchWikiPageTitle(searchName);

  if (!wikiTitle) {
    return {
      id, name, searchName, wikiTitle: null, wikiUrl: null, imageUrl: PLACEHOLDER_IMAGE, matchMethod: 'search-no-result', reason: 'Nu s-a găsit pe Wiki',
    };
  }

  const imageResult = await getWikiImageUrlByTitle(wikiTitle);

  return {
    id,
    name,
    searchName,
    wikiTitle,
    wikiUrl: imageResult.wikiUrl,
    imageUrl: imageResult.imageUrl || PLACEHOLDER_IMAGE,
    matchMethod: nameOverrides[name] ? 'override-search' : 'wiki-search',
    reason: imageResult.reason,
  };
}

async function main() {
    const characters = await fetchCharactersFromAPI();
    const characterMap = {};

    console.log(`Am găsit ${characters?.length || 0} personaje. Începem căutarea pozelor...`);

    if (!characters || characters.length === 0) {
        console.log("Nu am primit date valide de la API.");
        return;
    }

    for (let char of characters) {
        const id = char.id;
        const name = char.attributes?.name || char.name; 
        if (!name) {
            console.log(`[Avertisment] Am sărit peste un obiect fără nume (ID: ${id})`);
            continue;
        }
        const imageUrl = await getWikiImageUrl(name);
        characterMap[id] = {
            name: name,
            imageUrl: imageUrl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
        };
        console.log(`[ID: ${id}] ${name} -> ${imageUrl ? 'Poză găsită!' : 'Fără poză, s-a pus placeholder.'}`);
        await new Promise(resolve => setTimeout(resolve, 200));
    }

  const dir = './src/data';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    `${dir}/characters_assets.json`,
    JSON.stringify(characterMap, null, 2),
    'utf8'
  );

  console.log("\n Baza de date actualizată cu succes în 'src/data/characters_assets.json'");
}

main();