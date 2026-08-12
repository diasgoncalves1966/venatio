import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Venatio</Text>
      <Text style={styles.subtitle}>Caça em segunda mão</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#18181b',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#52525b',
    textAlign: 'center',
  },
});
