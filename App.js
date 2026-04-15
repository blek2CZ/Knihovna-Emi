import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import BookFormScreen from './src/screens/BookFormScreen';
import BackupScreen from './src/screens/BackupScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator pro záložku Knihovna (seznam + formulář)
function LibraryStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
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

function AppNavigator() {
  const { dark, colors, toggleTheme } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={dark ? 'light' : 'light'} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder },
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
            headerStyle: { backgroundColor: colors.header },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => (
              <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 14 }}>
                <Text style={{ fontSize: 20 }}>{dark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
