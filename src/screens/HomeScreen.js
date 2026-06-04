import { Ionicons } from '@expo/vector-icons';
import { arrayRemove, arrayUnion, doc, increment, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import characterAssets from '../data/characters_assets.json';
import { auth, db } from '../firebaseConfig';
import AccountScreen from './AccountScreen';
import SettingsScreen from './SettingsScreen';
 
export default function HomeScreen({ navigation }) {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
 
  const [favorites, setFavorites] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const [activeTab, setActiveTab] = useState('EXPLORER');

  const [appTheme, setAppTheme] = useState('LIGHT');

  const [displayName, setDisplayName] = useState('DOUCHEBAG');

  const [searchQuery, setSearchQuery] = useState('');

  const toggleFavorite = async (id) => {
    const isCurrentlyFavorite = favorites.includes(id);

    setFavorites((prevFavorites) => {
      if (isCurrentlyFavorite) {
        return prevFavorites.filter((favId) => favId !== id);
      }
      return [...prevFavorites, id];
    });

    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      await setDoc(userRef, { 
        charactersCollected: increment(isCurrentlyFavorite ? -1 : 1),
        favorites: isCurrentlyFavorite ? arrayRemove(id) : arrayUnion(id)
      }, { merge: true });
    } catch (error) {
      console.error("Eroare la actualizarea favoritelor:", error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const firstResponse = await fetch('https://spapi.dev/api/characters');
      
      if (!firstResponse.ok) {
        throw new Error(`Eroare HTTP: ${firstResponse.status}`);
      }
      
      const firstJson = await firstResponse.json();
      let allChars = [...firstJson.data];
      const totalPages = firstJson.meta?.last_page || 1; 

      for (let i = 2; i <= totalPages; i++) {

        if (i === 21 || i === 22) continue;

        const res = await fetch(`https://spapi.dev/api/characters?page=${i}`);
        
        
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            allChars = [...allChars, ...json.data];
          }
        } else {
          console.warn(`Am ratat pagina ${i} - Status: ${res.status}`);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setCharacters(allChars); 
      
    } catch (error) {
      console.error("Eroare la preluarea tuturor datelor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
    
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.favorites) setFavorites(data.favorites);
      
        if (data.settings && data.settings.theme) {
          setAppTheme(data.settings.theme);
        }
        const hideIdentity = data.settings?.hideIdentity !== undefined ? data.settings.hideIdentity : true;
        if (hideIdentity) {
          setDisplayName("DOUCHEBAG");
        } else {
          const realName = auth.currentUser.email.split('@')[0];
          setDisplayName(realName.toUpperCase());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleViewDex = async (item, imageUrl) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      const charName = (item.attributes?.name || item.name || "").toLowerCase();
      let newBadge = null;
      
      if (charName.includes("cartman")) newBadge = "RESPECT MY AUTHORITAH!";
      else if (charName.includes("kenny")) newBadge = "YOU BASTARD!";
      else if (charName.includes("towelie")) newBadge = "DON'T FORGET YOUR TOWEL!";
      else if (charName.includes("randy")) newBadge = "I THOUGHT THIS WAS AMERICA!";
      else if (charName.includes("butters")) newBadge = "OH, HAMBURGERS!";


      const updates = { cheesyPoofs: increment(1) };
      if (newBadge) {
        updates.achievements = arrayUnion(newBadge);
      }

      await setDoc(userRef, updates, { merge: true });
    } catch (error) {
      console.error("Eroare la incrementarea cheesy poofs:", error);
    }
    
    navigation.navigate('CharacterDetails', { character: item, imageUrl: imageUrl, currentTheme: appTheme });
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
          onPress={() => handleViewDex(item, imageUrl)}
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

  const filteredCharacters = displayedCharacters.filter(char => {
      const charName = char.attributes?.name || char.name || '';
      return charName.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const totalPages = Math.ceil(filteredCharacters.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCharacters.slice(indexOfFirstItem, indexOfLastItem);

  const themeStyles = {
    backgroundColor: appTheme === 'DARK' ? '#222' : appTheme === 'CLASSIC' ? '#f4d03f' : '#f5f5f5',
    sidebarColor: appTheme === 'DARK' ? '#111' : appTheme === 'CLASSIC' ? '#f1c40f' : '#f5f5f5',
    textColor: appTheme === 'DARK' ? '#fff' : '#000',
    subtitleColor: appTheme === 'DARK' ? '#aaa' : '#555',
  };

  return (
    <View style={[styles.layout, { backgroundColor: themeStyles.backgroundColor }]}>
      
      <View style={[styles.sidebar, { backgroundColor: themeStyles.sidebarColor }]}>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={{fontSize: 30}}></Text>
          </View>
          <Text style={[styles.logoTitle, { color: themeStyles.textColor }]}>PARK DEX</Text>
          <Text style={[styles.logoSubtitle, { color: themeStyles.subtitleColor }]}>{displayName}</Text>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'EXPLORER' && styles.menuItemActive]}
            onPress={() => setActiveTab('EXPLORER')}
          >
            <Ionicons name="compass" size={20} color={activeTab === 'EXPLORER' ? "#000" : themeStyles.textColor} />
            <Text style={[styles.menuText, { color: themeStyles.textColor }, activeTab === 'EXPLORER' && styles.menuTextActive]}>EXPLORER</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'FAVORITES' && styles.menuItemActive]}
            onPress={() => setActiveTab('FAVORITES')}
          >
            <Ionicons name="heart" size={20} color={activeTab === 'FAVORITES' ? "#000" : themeStyles.textColor} />
            <Text style={[styles.menuText, { color: themeStyles.textColor }, activeTab === 'FAVORITES' && styles.menuTextActive]}>FAVORITES</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'ACCOUNT' && styles.menuItemActive]}
            onPress={() => setActiveTab('ACCOUNT')}
          >
            <Ionicons name="person-circle" size={20} color={activeTab === 'ACCOUNT' ? "#000" : themeStyles.textColor} />
            <Text style={[styles.menuText, { color: themeStyles.textColor }, activeTab === 'ACCOUNT' && styles.menuTextActive]}>ACCOUNT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, activeTab === 'SETTINGS' && styles.menuItemActive]}
            onPress={() => setActiveTab('SETTINGS')}
          >
            <Ionicons name="settings" size={20} color={activeTab === 'SETTINGS' ? "#000" : themeStyles.textColor} />
            <Text style={[styles.menuText, { color: themeStyles.textColor }, activeTab === 'SETTINGS' && styles.menuTextActive]}>SETTINGS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.mainContent, { backgroundColor: themeStyles.backgroundColor }]}>
        {activeTab === 'FAVORITES' && displayedCharacters.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={60} color={themeStyles.subtitleColor} />
            <Text style={[styles.emptyStateText, { color: themeStyles.textColor }]}>Nu ai adăugat niciun personaj la favorite.</Text>
            <Text style={[styles.emptyStateSubtext, { color: themeStyles.subtitleColor }]}>Mergi în Explorer și apasă pe inimi!</Text>
          </View>
        ) : activeTab === 'ACCOUNT' ? (
          <AccountScreen currentTheme={appTheme}/>
        ) : activeTab === 'SETTINGS' ? (
           <SettingsScreen currentTheme={appTheme} onThemeChange={setAppTheme} />
        ) : (
          <View style={{ flex: 1 }}>
            
            <View style={{ 
              paddingHorizontal: 20, 
              paddingTop: 15, 
              paddingBottom: 15, // Schimbăm din margin în padding pentru a crea o mască solidă
              backgroundColor: themeStyles.backgroundColor, // Ia culoarea temei și blochează vizual ce e în spate
              zIndex: 10, // Forțează bara să stea la suprafață, deasupra listei
              elevation: 10 // Siguranță suplimentară pentru Android
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: themeStyles.textColor,
                backgroundColor: appTheme === 'DARK' ? '#333' : '#fff',
                paddingHorizontal: 15,
                paddingVertical: 10
              }}>
                <Ionicons name="search" size={20} color={themeStyles.textColor} style={{ marginRight: 10 }} />
                <TextInput 
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: themeStyles.textColor,
                    outlineStyle: 'none' 
                  }}
                  placeholder="CAUTĂ UN CETĂȚEAN..."
                  placeholderTextColor={appTheme === 'DARK' ? '#888' : '#666'}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setCurrentPage(1); 
                  }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={themeStyles.textColor} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={currentItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCharacterCard}
              numColumns={4} 
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20 }}
            />
            
            {totalPages > 1 && (
              <View style={[styles.paginationContainer, { backgroundColor: themeStyles.backgroundColor }]}>
                <TouchableOpacity 
                  style={[styles.pageButton, currentPage === 1 && styles.disabledButton]}
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <Ionicons name="arrow-back" size={20} color={currentPage === 1 ? "#999" : "#000"} />
                  <Text style={[styles.pageButtonText, currentPage === 1 && styles.disabledButtonText]}>PREV</Text>
                </TouchableOpacity>

                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>PAGE {currentPage} / {totalPages}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.pageButton, currentPage === totalPages && styles.disabledButton]}
                  disabled={currentPage === totalPages}
                  onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <Text style={[styles.pageButtonText, currentPage === totalPages && styles.disabledButtonText]}>NEXT</Text>
                  <Ionicons name="arrow-forward" size={20} color={currentPage === totalPages ? "#999" : "#000"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    color: '#555', 
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
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderTopWidth: 4,
    borderColor: '#000',
    marginTop: 10,
  },
  pageButton: {
    flexDirection: 'row',
    backgroundColor: '#17a2b8', 
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    shadowOffset: { width: 0, height: 0 },
  },
  disabledButtonText: {
    color: '#999',
  },
  pageBadge: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    transform: [{ rotate: '-1deg' }], 
  },
  pageBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
});