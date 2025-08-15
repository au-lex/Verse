import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          The page you are looking for doesn’t seem to exist.
        </Text>

        <Link href="/home" style={styles.link}>
          <Text style={styles.linkText}>Go back to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  link: {
    backgroundColor: '#FFD700', // your preferred yellow
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
