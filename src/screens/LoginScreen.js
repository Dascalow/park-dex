import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage("Te rugăm să introduci username-ul și codul secret!");
      return;
    }

    try {
      const email = `${username}@parkdex.com`;
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      // Afișăm eroarea direct în state pentru a fi redată pe ecran
      if (error.code === 'auth/invalid-credential') {
        setErrorMessage("Username sau cod secret incorect!");
      } else {
        setErrorMessage("A apărut o problemă: " + error.message);
      }
    }
  };
  
  const handleSignUpNav = () => {
    navigation.navigate('SignUp');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.logoWrapper}>
        <View style={styles.logoTop}><Text style={styles.logoTitle}>PARK DEX</Text></View>
        <View style={styles.logoBottom}><Text style={styles.logoSubtitle}>UNAUTHORIZED ENCYCLOPEDIA</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.tabsContainer}>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={styles.activeTabText}>LOGIN</Text>
          </View>
          <TouchableOpacity style={[styles.tab, styles.inactiveTab]} onPress={handleSignUpNav}>
            <Text style={styles.inactiveTabText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>USERNAME</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person" size={16} color="#333" style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="StanMarsh1"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.label}>SECRET CODE</Text>
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
              <Ionicons 
                name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#333" 
              />
            </TouchableOpacity>
          </View>

          {/* Butonul de login */}
          <TouchableOpacity style={styles.loginButton} activeOpacity={0.9} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>ENTER SOUTH PARK</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Mesajul de eroare vizibil aici */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>FORGOT CODE?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
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
    transform: [{ rotate: '-2deg' }], 
  },
  logoTop: {
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  logoBottom: {
    backgroundColor: '#222',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: -4,
    zIndex: 1,
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
    borderColor: '#000',
  },
  inactiveTab: {
    backgroundColor: '#e0e0e0',
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
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#b92b27',
    borderWidth: 3,
    borderColor: '#000',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    marginRight: 8,
  },
  forgotButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#17a2b8',
    textDecorationLine: 'underline',
  },
  errorText: {
  color: '#b92b27', 
  fontSize: 14,
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: 15,
},
});