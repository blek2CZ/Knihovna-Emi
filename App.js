import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import BookFormScreen from './src/screens/BookFormScreen';
import BackupScreen from './src/screens/BackupScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator pro záložku Knihovna (seznam + formulář)
function LibraryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#3498db' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="BookList"
        component={HomeScreen}
        options={{ title: 'Moje knihovna' }}
      />
      <Stack.Screen
        name="BookForm"
        component={BookFormScreen}
        options={({ route }) => ({
          title: route.params?.book ? 'Upravit knihu' : 'Přidat knihu',
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#3498db',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e0e0e0' },
          }}
        >
          {/* Záložka: Knihovna */}
          <Tab.Screen
            name="Library"
            component={LibraryStack}
            options={{
              headerShown: false,
              tabBarLabel: 'Knihovna',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>📚</Text>,
            }}
          />
          {/* Záložka: Záloha dat */}
          <Tab.Screen
            name="Backup"
            component={BackupScreen}
            options={{
              headerShown: true,
              title: 'Záloha dat',
              tabBarLabel: 'Záloha',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>💾</Text>,
              headerStyle: { backgroundColor: '#3498db' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
