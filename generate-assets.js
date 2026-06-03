const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 1. Funcția care aduce lista de personaje din API
async function fetchCharactersFromAPI() {
    try {
        console.log("Se descarcă personajele de la SPAPI...");
        // Luăm primele 50 de personaje (poți crește numărul la nevoie)
        const response = await axios.get('https://spapi.dev/api/characters?page[size]=50');
        return response.data.data; 
    } catch (error) {
        console.error("Eroare la conectarea cu SPAPI:", error.message);
        return [];
    }
}

// 2. Funcția care face "scraping" pe Wiki pentru a găsi poza
async function getWikiImageUrl(characterName) {
    // Înlocuim spațiile cu underscore pentru URL (ex: "Stan Marsh" -> "Stan_Marsh")
    const formattedName = encodeURIComponent(characterName.replace(/ /g, '_'));
    const wikiUrl = `https://southpark.wiki.gg/wiki/${formattedName}`;

    try {
        const response = await axios.get(wikiUrl);
        const $ = cheerio.load(response.data);

        // Căutăm imaginea principală din infobox-ul de pe Wiki
        let imageUrl = $('.infobox img').first().attr('src') || 
                       $('.pi-image-thumbnail').first().attr('src');

        if (imageUrl) {
            // Fandom/Wiki.gg uneori dă URL-uri fără "https:" la început
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            }
            return imageUrl;
        }
        return null;
    } catch (error) {
        return null; // Pagina nu există sau personajul nu are poză
    }
}

// 3. Funcția principală care leagă datele
async function main() {
    const characters = await fetchCharactersFromAPI();
    const characterMap = {};

    console.log(`Am găsit ${characters?.length || 0} personaje. Începem căutarea pozelor...`);

    if (!characters || characters.length === 0) {
        console.log("Nu am primit date valide de la API.");
        return;
    }

    for (let char of characters) {
        // Extragem ID-ul și numele în siguranță
        const id = char.id;
        
        // Verificăm dacă numele este în attributes, altfel îl luăm direct de pe obiect
        const name = char.attributes?.name || char.name; 

        // Dacă personajul ăsta e complet defect și nu are nume, trecem la următorul
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
        
        // Pauză de 200 milisecunde ca să nu blocăm serverele Wiki
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Salvăm datele direct în folderul aplicației tale React Native
    const dir = './src/data';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(`${dir}/characters_assets.json`, JSON.stringify(characterMap, null, 2));
    console.log("\n✅ Gata! Fișierul a fost salvat cu succes în 'src/data/characters_assets.json'");
}

main();