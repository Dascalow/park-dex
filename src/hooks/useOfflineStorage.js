import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('https://spapi.dev/api/characters', { method: 'HEAD' });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();
  }, []);

  const saveCharacters = async (characters) => {
    try {
      await AsyncStorage.setItem('cached_characters', JSON.stringify(characters));
    } catch (error) {
      console.error('Error saving characters to cache:', error);
    }
  };

  const getCharacters = async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_characters');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving characters from cache:', error);
      return null;
    }
  };

  const saveFavorites = async (favorites) => {
    try {
      await AsyncStorage.setItem('cached_favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to cache:', error);
    }
  };

  const getFavorites = async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_favorites');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error retrieving favorites from cache:', error);
      return [];
    }
  };

  return {
    isOnline,
    setIsOnline,
    saveCharacters,
    getCharacters,
    saveFavorites,
    getFavorites,
  };
};
