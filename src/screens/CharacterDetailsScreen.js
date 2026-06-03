import { StyleSheet, Text, View } from 'react-native';

export default function CharacterDetailsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aici va fi pagina detalii despre personaje</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 18, fontWeight: 'bold' }
});