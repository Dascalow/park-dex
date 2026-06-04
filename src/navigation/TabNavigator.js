import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AccountScreen from '../screens/AccountScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ 
        headerShown: false, 
        tabBarStyle: { display: 'none' }, 
      }}
    >
      <Tab.Screen name="Explorer" component={HomeScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}