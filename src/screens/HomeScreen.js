import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import characterAssets from '../data/characters_assets.json';

export default function HomeScreen({ navigation }) {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [favorites, setFavorites] = useState([]);
  
  const [activeTab, setActiveTab] = useState('EXPLORER');

  const fetchCharacters = async () => {
    try {
      const response = await fetch('https://spapi.dev/api/characters');
      const json = await response.json();
      setCharacters(json.data); 
    } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(id)) {
        return prevFavorites.filter((favId) => favId !== id);
      }
      return [...prevFavorites, id];
    });
  };

  const renderCharacterCard = ({ item }) => {
    const asset = characterAssets[String(item.id)];
    let imageUrl = asset ? asset.imageUrl : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

    if (imageUrl && imageUrl.startsWith('/')) {
      imageUrl = 'https://southpark.wiki.gg' + imageUrl;
    }

    const attributes = item.attributes || {};
    const characterName = attributes.name || item.name || "Unknown";
    const tag1 = attributes.sex || "UNKNOWN";
    const tag2 = attributes.occupation || "RESIDENT";
    const isFavorite = favorites.includes(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>{characterName.toUpperCase()}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={22} 
                color={isFavorite ? "#c0392b" : "#000"} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            <View style={styles.tag}><Text style={styles.tagText}>{tag1.toUpperCase()}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{tag2.toUpperCase()}</Text></View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.viewDexButton} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CharacterDetails', { character: item, imageUrl: imageUrl })}
        >
          <Ionicons name="eye" size={16} color="#000" style={{ marginRight: 5 }} />
          <Text style={styles.viewDexText}>VIEW DEX</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Loading South Park...</Text>
      </View>
    );
  }
  const displayedCharacters = activeTab === 'FAVORITES' 
    ? characters.filter(char => favorites.includes(char.id))
    : characters;

  return (
    <View style={styles.layout}>
      
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={{fontSize: 30}}>👦🏼</Text>
          </View>
          <Text style={styles.logoTitle}>PARK DEX</Text>
          <Text style={styles.logoSubtitle}>Construction Paper Edition</Text>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'EXPLORER' && styles.menuItemActive]}
            onPress={() => setActiveTab('EXPLORER')}
          >
            <Ionicons name="compass" size={20} color={activeTab === 'EXPLORER' ? "#000" : "#555"} />
            <Text style={[styles.menuText, activeTab === 'EXPLORER' && styles.menuTextActive]}>EXPLORER</Text>
          </TouchableOpacity>


          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'FAVORITES' && styles.menuItemActive]}
            onPress={() => setActiveTab('FAVORITES')}
          >
            <Ionicons name="heart" size={20} color={activeTab === 'FAVORITES' ? "#000" : "#555"} />
            <Text style={[styles.menuText, activeTab === 'FAVORITES' && styles.menuTextActive]}>FAVORITES</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'ACCOUNT' && styles.menuItemActive]}
            onPress={() => setActiveTab('ACCOUNT')}
          >
            <Ionicons name="person-circle" size={20} color={activeTab === 'ACCOUNT' ? "#000" : "#555"} />
            <Text style={[styles.menuText, activeTab === 'ACCOUNT' && styles.menuTextActive]}>ACCOUNT</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'SETTINGS' && styles.menuItemActive]}
            onPress={() => setActiveTab('SETTINGS')}
          >
            <Ionicons name="settings" size={20} color={activeTab === 'SETTINGS' ? "#000" : "#555"} />
            <Text style={[styles.menuText, activeTab === 'SETTINGS' && styles.menuTextActive]}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.mainContent}>
        {activeTab === 'FAVORITES' && displayedCharacters.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Nu ai adăugat niciun personaj la favorite.</Text>
            <Text style={styles.emptyStateSubtext}>Mergi în Explorer și apasă pe inimi!</Text>
          </View>
        ) : activeTab === 'ACCOUNT' || activeTab === 'SETTINGS' ? (
           <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>Ecran în construcție...</Text>
          </View>
        ) : (
          <FlatList
            data={displayedCharacters}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCharacterCard}
            numColumns={4} 
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20 }}
          />
        )}
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#f5f5f5',
    borderRightWidth: 3,
    borderColor: '#000',
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderColor: '#000',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 80, height: 80,
    backgroundColor: '#f1c40f',
    borderWidth: 3, borderColor: '#000',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
  },
  logoSubtitle: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#555',
  },
  menuItems: {
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 0,
  },
  menuItemActive: {
    backgroundColor: '#17a2b8',
    borderWidth: 2,
    borderColor: '#000',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555', // Schimbat puțin pentru contrast
    letterSpacing: 1,
  },
  menuTextActive: {
    color: '#000',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '23%',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  imageContainer: {
    backgroundColor: '#34495e',
    borderBottomWidth: 4,
    borderColor: '#000',
    height: 160,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '90%',
  },
  cardBody: {
    padding: 10,
    height: 100,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
    lineHeight: 18,
    paddingRight: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    borderWidth: 1.5,
    borderColor: '#000',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  viewDexButton: {
    flexDirection: 'row',
    borderTopWidth: 4,
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDexText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  }
});