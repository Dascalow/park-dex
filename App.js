import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <NavigationContainer>
      {/* Aici încărcăm meniul cu tab-urile de jos */}
      <TabNavigator />
    </NavigationContainer>
  );
}