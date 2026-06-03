import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebaseConfig';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 

  const handleSignUp = async () => {
    setErrorMessage(''); 

    if (!username || !password || !confirmPassword) {
      setErrorMessage("Te rugăm să completezi toate câmpurile!");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Codul secret trebuie să aibă cel puțin 8 caractere!");
      return;
    }
    if (username.length < 4) {
      setErrorMessage("Username-ul trebuie să aibă cel puțin 4 caractere!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Codurile secrete nu se potrivesc!");
      return;
    }

    try {
      const email = `${username}@parkdex.com`; 
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        charactersCollected: 0,
        cheesyPoofs: 0,
        favorites: [],
        episodesWatched: 0,
        achievements: []
      });

      navigation.replace('MainTabs');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage("Acest username este deja luat.");
      } else {
        setErrorMessage("A apărut o eroare: " + error.message);
      }
    }

  };
  

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoWrapper}>
        <View style={styles.logoTop}><Text style={styles.logoTitle}>PARK DEX</Text></View>
        <View style={styles.logoBottom}><Text style={styles.logoSubtitle}>CREATE NEW CITIZEN</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.inactiveTab]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.inactiveTabText}>LOGIN</Text>
          </TouchableOpacity>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>SIGN UP</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>CHOOSE USERNAME</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person" size={16} color="#333" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="EricCartman99"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.label}>CHOOSE SECRET CODE</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={16} color="#333" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
              <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>CONFIRM SECRET CODE</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="checkmark-circle" size={16} color="#333" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.signUpButton} activeOpacity={0.9} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>CREATE ACCOUNT</Text>
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  errorText: {
    color: '#b92b27', 
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#9be5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 30,
    transform: [{ rotate: '2deg' }], 
  },
  logoTop: {
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
  },
  logoBottom: {
    backgroundColor: '#222',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: -4,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 4,
    borderColor: '#000',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#17a2b8', 
  },    
  inactiveTab: {
    backgroundColor: '#e0e0e0',
    borderRightWidth: 4,
    borderColor: '#000',
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  formContainer: {
    padding: 25,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#333',
    marginBottom: 5,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    height: '100%',
    outlineStyle: 'none',
  },
  signUpButton: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginRight: 8,
  }
});