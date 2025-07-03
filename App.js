import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { NotificationProvider } from './src/context/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <NavigationContainer>
              {Platform.OS !== 'web' && <StatusBar barStyle="default" />}
              <AppNavigator />
            </NavigationContainer>
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
