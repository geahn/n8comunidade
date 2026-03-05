import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import MainTabs from './src/navigation/MainTabs';
import LoginScreen from './src/screens/LoginScreen';
import { ActivityIndicator, View, Platform } from 'react-native';
import "./global.css";

const Stack = createNativeStackNavigator();

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const isWeb = Platform.OS === 'web';
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <View style={{ 
        flex: 1, 
        width: '100%', 
        maxWidth: 1400, 
        alignSelf: 'center', 
        backgroundColor: '#ffffff', 
        overflow: 'hidden',
        // Visual enhancements for web/desktop so it doesn't look like a cut-off box
        ...(isWeb ? {
          boxShadow: '0px 0px 40px rgba(0, 0, 0, 0.05)',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#e2e8f0'
        } : {})
      }}>
        <AuthProvider>
          <CartProvider>
            <Navigation />
          </CartProvider>
        </AuthProvider>
      </View>
    </View>
  );
}
