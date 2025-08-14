
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';



export default function RootLayout() {
  const [loaded] = useFonts({
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Light': require('../assets/fonts/Nunito-Light.ttf'),
    'Nunito-ExtraLight': require('../assets/fonts/Nunito-ExtraLight.ttf'),
  });



  if (!loaded) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="onboarding/Onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="search/Index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />

  
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
