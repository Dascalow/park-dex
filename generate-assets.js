const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchCharactersFromAPI() {
    try {
        console.log("Se descarcă personajele de la SPAPI (din mai multe pagini)...");
        const pageRequests = [];
        for (let i = 1; i <= 20; i++) {
            pageRequests.push(axios.get(`https://spapi.dev/api/characters?page=${i}`));
        }
        
        const responses = await Promise.all(pageRequests);
        let allCharacters = [];
        
        responses.forEach(response => {
            if (response.data && response.data.data) {
                allCharacters = allCharacters.concat(response.data.data);
            }
        });
        
        return allCharacters; 
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
                       $('.pi-image-thumbnail').first().attr('src') ||
                       $('table.infobox img').first().attr('src') ||
                       $('.image img').first().attr('src');

        if (imageUrl) {
            if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
                imageUrl = 'https://southpark.wiki.gg' + imageUrl;
            }
            return { url: imageUrl, reason: 'Găsită' };
        }
        return { url: null, reason: 'Pagina există, dar fără o poză principală detectată' };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { url: null, reason: 'Pagina Wiki nu există sub acest nume exact' };
        }
        return { url: null, reason: 'Eroare de conexiune' };
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

    // Dicționar pentru excepții: "Nume API" : "Nume exact pe Wiki"
    const nameOverrides = {
        "Fluffy": "Fluffy (pig)",
        "Timmy": "Timmy Burch",
        "Jimmy": "Jimmy Valmer",
        "Chef": "Jerome \"Chef\" McElroy",
        "Garrison": "Herbert Garrison",
        "Mr. Garrison": "Herbert Garrison",
        "Token": "Tolkien Black",
        "Token Black": "Tolkien Black",
        "Florence Cartman" : "Florence_Cartamn"
    };

    for (let char of characters) {
        const id = char.id;
        const name = (char.attributes?.name || char.name || "").trim(); 
        if (!name) {
            console.log(`[Avertisment] Am sărit peste un obiect fără nume (ID: ${id})`);
            continue;
        }
        
        // Folosim numele din dicționar dacă există, altfel numele standard
        const searchName = nameOverrides[name] || name;
        const result = await getWikiImageUrl(searchName);
        const imageUrl = result.url;
        characterMap[id] = {
            name: name,
            imageUrl: imageUrl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
        };
        console.log(`[ID: ${id}] ${name} -> ${imageUrl ? '✅ Poză găsită!' : `❌ Placeholder (${result.reason})`}`);
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