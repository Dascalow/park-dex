import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function SettingsScreen({ currentTheme, onThemeChange }) {
  
  const [hideIdentity, setHideIdentity] = useState(true); 
  const [accentColor, setAccentColor] = useState('#17a2b8'); 

  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists() && docSnap.data().settings) {
        const savedSettings = docSnap.data().settings;
        if (savedSettings.theme) {
          onThemeChange(savedSettings.theme);
        }
        setHideIdentity(savedSettings.hideIdentity !== undefined ? savedSettings.hideIdentity : true);
      }
    };
    fetchSettings();
  }, []);

  const handleApplySettings = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        settings: {
          theme: currentTheme,
          hideIdentity: hideIdentity,
          accentColor: accentColor
        }
      }, { merge: true }); 
      
      Alert.alert("Succes", "Setările tale de cetățean au fost actualizate!");
    } catch (error) {
      console.error("Eroare la salvarea setărilor:", error);
      Alert.alert("Eroare", "Nu am putut salva setările.");
    }
  };

  // --- CULORI DINAMICE ---
  const isDark = currentTheme === 'DARK';
  const bgColor = isDark ? '#222' : currentTheme === 'CLASSIC' ? '#f4d03f' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const subtextColor = isDark ? '#ccc' : '#555';
  const boxBg = isDark ? '#333' : '#f9f9f9';
  const rowBg = isDark ? '#444' : '#fff';
  const sidebarBg = isDark ? '#222' : '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>CONFIGURATION</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Customize your PARK DEX experience. Adjust the brutalist theme, tweak your accent colors, and manage your secret identity.
        </Text>
      </View>

      <View style={styles.row}>
        
        <View style={[styles.themeBox, { backgroundColor: boxBg, borderColor: textColor }]}>
          <View style={styles.tag}><Text style={styles.tagText}>APP THEME</Text></View>
          <Text style={[styles.boxDesc, { color: textColor }]}>Select the visual environment for your DEX.</Text>
          
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[styles.themeOption, currentTheme === 'LIGHT' && styles.themeOptionActive, { borderColor: textColor, backgroundColor: rowBg }]} 
              onPress={() => onThemeChange('LIGHT')}
            >
              <View style={[styles.circle, { backgroundColor: '#fff', borderColor: textColor }]} />
              <View style={[styles.themeLabel, { borderColor: textColor, backgroundColor: rowBg }]}><Text style={[styles.themeLabelText, { color: textColor }]}>LIGHT</Text></View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOption, currentTheme === 'DARK' && styles.themeOptionActive, { borderColor: textColor, backgroundColor: rowBg }]} 
              onPress={() => onThemeChange('DARK')}
            >
              <View style={[styles.circle, { backgroundColor: '#333', borderColor: textColor }]} />
              <View style={[styles.themeLabel, { borderColor: textColor, backgroundColor: rowBg }]}><Text style={[styles.themeLabelText, { color: textColor }]}>DARK</Text></View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.themeOption, currentTheme === 'CLASSIC' && styles.themeOptionActive, { borderColor: textColor, backgroundColor: rowBg }]} 
              onPress={() => onThemeChange('CLASSIC')}
            >
              <View style={[styles.circle, { backgroundColor: '#8ab4f8', borderColor: textColor }]} />
              <View style={[styles.themeLabel, { borderColor: textColor, backgroundColor: rowBg }]}><Text style={[styles.themeLabelText, { color: textColor }]}>CLASSIC SP</Text></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.alertsBox, { borderColor: textColor, backgroundColor: boxBg }]}>
        <View style={[styles.alertsSidebar, { borderColor: textColor, backgroundColor: sidebarBg }]}>
          <Text style={[styles.alertsTitle, { color: textColor }]}>IDENTITY</Text>
          <Text style={[styles.alertsDesc, { color: subtextColor }]}>Control how the system perceives you in reality.</Text>
          <Ionicons name="notifications" size={60} color={isDark ? '#555' : '#ccc'} style={{marginTop: 20}} />
        </View>
        
        <View style={styles.alertsContent}>
          <View style={[styles.alertRow, { borderColor: textColor, backgroundColor: rowBg }]}>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertRowTitle, { color: textColor }]}>HIDE REAL IDENTITY</Text>
              <Text style={[styles.alertRowDesc, { color: subtextColor }]}>If ON, the system will refer to you as "Douchebag". If OFF, your real username is displayed.</Text>
            </View>
            <Switch 
              trackColor={{ false: "#ccc", true: "#17a2b8" }}
              thumbColor={"#fff"}
              onValueChange={() => setHideIdentity(!hideIdentity)}
              value={hideIdentity}
            />
          </View>
        </View>
      </View>
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.applyButton, { borderColor: textColor }]} onPress={handleApplySettings}>
              <Ionicons name="save" size={18} color="#fff" />
              <Text style={styles.applyButtonText}>APPLY SETTINGS</Text>
            </TouchableOpacity>
          </View>
        <TouchableOpacity 
      style={{
        marginTop: 30,
        backgroundColor: '#c0392b', // Roșu aprins în stil South Park
        borderWidth: 3,
        borderColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
      onPress={async () => {
        try {
          await signOut(auth);
          // Firebase Auth va declanșa automat App.js să îl arunce înapoi la ecranul de Login!
        } catch (error) {
          console.error("Eroare la delogare:", error);
        }
      }}
    >
      <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
      <Text style={{ color: '#fff', fontWeight: '900', letterSpacing: 1 }}>LOG OUT FROM DEX</Text>
    </TouchableOpacity>
        </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    maxWidth: '80%',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  themeBox: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#000',
    padding: 20,
    position: 'relative',
    backgroundColor: '#f9f9f9',
  },
  tag: {
    position: 'absolute',
    top: -15,
    left: 10,
    backgroundColor: '#17a2b8',
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 3,
    transform: [{ rotate: '-2deg' }],
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  boxDesc: {
    fontSize: 12,
    color: '#444',
    marginBottom: 20,
    marginTop: 10,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  themeOptionActive: {
    backgroundColor: '#17a2b8',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 15,
  },
  themeLabel: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  themeLabelText: {
    fontSize: 10,
    fontWeight: '900',
  },
  alertsBox: {
    flexDirection: 'row',
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  alertsSidebar: {
    width: 200,
    backgroundColor: '#e0e0e0',
    borderRightWidth: 4,
    borderColor: '#000',
    padding: 20,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  alertsDesc: {
    fontSize: 12,
    color: '#555',
  },
  alertsContent: {
    flex: 1,
    padding: 20,
  },
  alertRow: {
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#000',
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  alertTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  alertRowTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },
  alertRowDesc: {
    fontSize: 11,
    color: '#666',
  },
  footer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: '#007b8f',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '900',
    marginLeft: 10,
    fontSize: 14,
  }
});