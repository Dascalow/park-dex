import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function AccountScreen() {
  const [stats, setStats] = useState({ charactersCollected: 0, cheesyPoofs: 0 });
  const [isModalVisible, setModalVisible] = useState(false);
  const [episodesInput, setEpisodesInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveEpisodes = async () => {
    let num = parseInt(episodesInput);
    if (!isNaN(num)) {
      if (num > 339) {
        setErrorMessage('Mai incearca , Douchebag! Numarul maxim de episoade este 339!');
        return;
      }
      setErrorMessage('');
      num = Math.max(0, num);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { episodesWatched: num }, { merge: true });
    }
    setModalVisible(false);
    setErrorMessage('');
  };

  const handleResetStats = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, {
      charactersCollected: 0,
      cheesyPoofs: 0,
      favorites: [],
      episodesWatched: 0,
      achievements: []
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}><Text style={{fontSize: 40}}>👦🏼</Text></View>
        <Text style={styles.username}>NEW KID</Text>
        <Text style={styles.location}>South Park, CO</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="people" size={24}/><Text style={styles.statValue}>{stats.charactersCollected}</Text><Text style={styles.statLabel}>CHARACTERS</Text>
        </View>
        <TouchableOpacity style={styles.statBox} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
          <Ionicons name="pencil" size={14} color="#666" style={styles.editIcon} />
          <Ionicons name="tv" size={24}/><Text style={styles.statValue}>{stats.episodesWatched || 0}</Text><Text style={styles.statLabel}>EPISODES</Text>
        </TouchableOpacity>
        <View style={styles.statBox}>
          <Ionicons name="fast-food" size={24}/><Text style={styles.statValue}>{stats.cheesyPoofs}</Text><Text style={styles.statLabel}>CHEESY POOFS</Text>
        </View>
      </View>
      
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <View style={styles.badgesWrapper}>
          {stats.achievements && stats.achievements.length > 0 ? (
            stats.achievements.map((badge, idx) => (
              <View key={idx} style={styles.badge}>
                <Ionicons name="medal" size={20} color="#d35400" />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noBadgeText}>Apasă VIEW DEX pe personajele faimoase pentru a debloca insigne!</Text>
          )}
        </View>
      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Câte episoade ai vizionat?</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={episodesInput} onChangeText={setEpisodesInput} placeholder="Ex: 121" />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setModalVisible(false); setErrorMessage(''); }}><Text style={styles.modalCancelText}>CANCEL</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveEpisodes}><Text style={styles.modalButtonText}>SAVE</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Buton ascuns pentru resetarea statisticilor, pentru testare * 
      <TouchableOpacity style={styles.resetButton} activeOpacity={0.8} onPress={handleResetStats}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.resetButtonText}>RESET ACCOUNT STATS</Text>
      </TouchableOpacity> 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1c40f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  location: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    padding: 15,
    width: '31%',
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  statLabel: {
    fontSize: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    marginVertical: 5,
  },
  achievementsContainer: {
    marginTop: 40,
    borderTopWidth: 4,
    borderColor: '#000',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 1,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1c40f',
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  noBadgeText: {
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: 300,
    borderWidth: 4,
    borderColor: '#000',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 10,
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    backgroundColor: '#17a2b8', padding: 10, borderWidth: 2, borderColor: '#000',
  },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  modalCancel: {
    backgroundColor: '#e0e0e0', padding: 10, borderWidth: 2, borderColor: '#000',
  },
  modalCancelText: { color: '#000', fontWeight: 'bold' },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#b92b27',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 3,
    borderColor: '#000',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '900',
    marginLeft: 8,
  },
  errorText: {
    color: '#b92b27',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  }
});