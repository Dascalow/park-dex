import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountScreen from '../screens/AccountScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ 
        headerShown: true,
        tabBarActiveTintColor: '#e74c3c', 
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Explorer" component={HomeScreen} />
      <Tab.Screen name="Fans" component={FavoritesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}