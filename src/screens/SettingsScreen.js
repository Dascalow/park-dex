import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>CONFIGURATION</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          Customize your PARK DEX experience. Adjust the brutalist theme, tweak your accent colors, and manage your secret identity.
        </Text>
      </View>

      {/* SECȚIUNEA 1: TEMĂ */}
      <View style={styles.sectionRow}>
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
              <View style={[styles.circle, { backgroundColor: '#f4d03f', borderColor: textColor }]} />
              <View style={[styles.themeLabel, { borderColor: textColor, backgroundColor: rowBg }]}><Text style={[styles.themeLabelText, { color: textColor }]}>CLASSIC SP</Text></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SECȚIUNEA 2: IDENTITATE (RESPONSIVĂ PENTRU MOBIL) */}
      <View style={[styles.alertsBox, { borderColor: textColor, backgroundColor: boxBg }]}>
        <View style={[styles.alertsSidebar, { borderColor: textColor, backgroundColor: sidebarBg }]}>
          <Text style={[styles.alertsTitle, { color: textColor }]}>IDENTITY</Text>
          <Text style={[styles.alertsDesc, { color: subtextColor }]}>Control how the system perceives you.</Text>
        </View>
        
        <View style={styles.alertsContent}>
          <View style={[styles.alertRow, { borderColor: textColor, backgroundColor: rowBg }]}>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertRowTitle, { color: textColor }]}>HIDE REAL IDENTITY</Text>
              <Text style={[styles.alertRowDesc, { color: subtextColor }]}>
                If ON, you are "Douchebag". If OFF, your real username is displayed.
              </Text>
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

      {/* BUTOANE FINALE */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={[styles.applyButton, { borderColor: textColor }]} onPress={handleApplySettings}>
          <Ionicons name="save" size={18} color="#fff" />
          <Text style={styles.applyButtonText}>APPLY SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={async () => {
          try {
            console.log("Se încearcă delogarea...");
            await signOut(auth);
            console.log("Delogare reușită!");
            
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
          } catch (error) {
            console.error("Eroare completă la delogare:", error);
            Alert.alert("Eroare la delogare", error.message);
          }
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>LOG OUT FROM DEX</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionRow: {
    marginBottom: 25,
  },
  themeBox: {
    borderWidth: 4,
    padding: 15,
    position: 'relative',
    paddingTop: 25,
  },
  tag: {
    position: 'absolute',
    top: -14,
    left: 10,
    backgroundColor: '#17a2b8',
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '-1deg' }],
  },
  tagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  boxDesc: {
    fontSize: 12,
    marginBottom: 15,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: 10,
  },
  themeOption: {
    flex: 1,
    minWidth: 80,
    borderWidth: 3,
    alignItems: 'center',
    padding: 12,
  },
  themeOptionActive: {
    backgroundColor: '#17a2b8',
    borderWidth: 3,
    borderColor: '#000',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 10,
  },
  themeLabel: {
    borderWidth: 2,
    borderColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  themeLabelText: {
    fontSize: 9,
    fontWeight: '900',
  },
  alertsBox: {
    flexDirection: 'column', 
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 25,
  },
  alertsSidebar: {
    width: '100%', 
    borderBottomWidth: 4,
    borderRightWidth: 0,
    borderColor: '#000',
    padding: 15,
  },
  alertsTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  alertsDesc: {
    fontSize: 11,
  },
  alertsContent: {
    padding: 15,
  },
  alertRow: {
    flexDirection: 'row',
    borderWidth: 3,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  alertRowTitle: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
  },
  alertRowDesc: {
    fontSize: 11,
    lineHeight: 14,
  },
  footerRow: {
    marginTop: 10,
    alignItems: 'stretch',
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: '#007b8f',
    borderWidth: 3,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '900',
    marginLeft: 8,
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#c0392b', 
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoutButtonText: {
    color: '#fff', 
    fontWeight: '900', 
    letterSpacing: 1,
    fontSize: 13,
  }
});