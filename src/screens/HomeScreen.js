import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importăm dicționarul local pentru a "lipi" pozele de datele din API
import characterAssets from '../data/characters_assets.json';

export default function HomeScreen({ navigation }) {
  // Stările aplicației: una pentru date, una pentru ecranul de încărcare
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Funcția care face request-ul extern către SPAPI
  const fetchCharacters = async () => {
    try {
      const response = await fetch('https://spapi.dev/api/characters');
      const json = await response.json();
      
      // SPAPI returnează datele în interiorul unui array numit "data"
      setCharacters(json.data); 
    } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
    } finally {
      setIsLoading(false); // Oprim rotița de încărcare indiferent de rezultat
    }
  };

  // useEffect se execută o singură dată la pornirea ecranului
  useEffect(() => {
    fetchCharacters();
  }, []);

const renderCharacterCard = ({ item }) => {
    // 1. Căutăm datele în JSON-ul nostru generat
    const asset = characterAssets[String(item.id)];
    
    // 2. Extragem link-ul brut
    let imageUrl = asset ? asset.imageUrl : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

    // 3. REPARAȚIA: Dacă link-ul începe cu "/", adăugăm adresa de la Wiki în față!
    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = 'https://southpark.wiki.gg' + imageUrl;
    }

    // 4. Extragem numele
    const characterName = item.attributes?.name || item.name || "Unknown";

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="contain" 
        />
        <Text style={styles.name}>{characterName}</Text>
      </TouchableOpacity>
    );
  };
  // Cât timp se aduc datele, arătăm o rotiță de încărcare
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Loading South Park...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCharacterCard}
        numColumns={2} // Creează grila cu 2 coloane
        columnWrapperStyle={styles.row} // Aplică stilul pentru rânduri
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    width: '48%', // Oferă spațiu între cele două coloane
    borderWidth: 3, // Bordură groasă specifică desenelor
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    // Umbră solidă (fără blur) pentru efectul 2D retro
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000',
  }
});