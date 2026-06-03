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
    console.log('Se descarcă personajele de la SPapi...');
    const pageRequests = Array.from({ length: 20 }, (_, index) => {
      const url = `${SPAPI_BASE_URL}/characters?page=${index + 1}`;
      return axios.get(url);
    });

    const responses = await Promise.all(pageRequests);
    return responses.flatMap((response) => response.data?.data || []);
  } catch (error) {
    console.error('Eroare la conectarea cu SPapi:', error.message);
    return [];
  }
}

async function searchWikiPageTitle(characterName) {
  const searchUrl = `${WIKI_BASE_URL}/api.php`;

  try {
    const response = await axios.get(searchUrl, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: characterName,
        format: 'json',
        origin: '*',
      },
      headers: { 'User-Agent': 'ParkDex/2.0' },
    });

    const results = response.data?.query?.search || [];
    if (results.length === 0) return null;

    const exactMatch = results.find(
      (result) => result.title.toLowerCase() === characterName.toLowerCase()
    );

    return exactMatch?.title || results[0].title;
  } catch (error) {
    console.error(`Eroare la căutarea paginii wiki pentru ${characterName}:`, error.message);
    return null;
  }
}

async function getWikiImageUrlByTitle(pageTitle) {
  const wikiUrl = pageTitleToUrl(pageTitle);

  try {
    const response = await axios.get(wikiUrl, {
      headers: { 'User-Agent': 'ParkDex/2.0' },
    });

    const $ = cheerio.load(response.data);
    let imageUrl = null;

    const selectors = [
      'aside.portable-infobox img',
      '.infobox-image img',
      '.pi-image-thumbnail',
      'table.infobox img',
      '.image img'
    ];

    for (const selector of selectors) {
      const imgElement = $(selector).first();
      if (imgElement.length > 0) {
        imageUrl = imgElement.attr('data-src') || imgElement.attr('src');
        if (imageUrl && !imageUrl.includes('sprite')) { 
            break;
        }
      }
    }

    return {
      imageUrl: normalizeImageUrl(imageUrl),
      wikiUrl,
      reason: imageUrl ? 'Imagine găsită cu succes' : 'Pagina nu conține o poză în infobox',
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { imageUrl: null, wikiUrl, reason: 'Pagina Wiki nu există' };
    }
    return { imageUrl: null, wikiUrl, reason: `Eroare HTTP: ${error.message}` };
  }
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

  if (!characters.length) {
    console.log('Eroare: Nu s-au putut prelua personajele din API.');
    return;
  }

  console.log(`Am găsit ${characters.length} personaje. Să înceapă magia...`);
  const characterMap = {};

  for (const character of characters) {
    const asset = await resolveCharacterAsset(character);
    
    characterMap[String(asset.id)] = {
      name: asset.name,
      imageUrl: asset.imageUrl,
      wikiUrl: asset.wikiUrl
    };

    const statusIcon = asset.imageUrl === PLACEHOLDER_IMAGE ? 'NOK' : 'OK';
    console.log(`${statusIcon} [${asset.id}] ${asset.name} -> ${asset.wikiTitle || 'N/A'}`);

    await sleep(200); // Pauză mică să nu supărăm serverele Wiki
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