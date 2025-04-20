import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import WebScraperScreen from './screens/WebScraperScreen';
import SavedScrapesScreen from './screens/SavedScrapesScreen';
import ScrapeDetailsScreen from './screens/ScrapeDetailsScreen';

// Create stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="WebScraper" component={WebScraperScreen} />
          <Stack.Screen name="SavedScrapes" component={SavedScrapesScreen} />
          <Stack.Screen name="ScrapeDetails" component={ScrapeDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}