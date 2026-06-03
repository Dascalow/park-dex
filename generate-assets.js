const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(`${dir}/characters_assets.json`, JSON.stringify(characterMap, null, 2));
    console.log("\n✅ Gata! Fișierul a fost salvat cu succes în 'src/data/characters_assets.json'");
}

main();