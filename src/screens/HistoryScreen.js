import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'TIMER_APP_STATE';

const HistoryScreen = () => {
  const colorScheme = useColorScheme();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setHistory(parsedState.history || []);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({item}) => (
    <View style={[styles.item, colorScheme === 'dark' && styles.itemDark]}>
      <Text
        style={[styles.itemText, colorScheme === 'dark' && styles.textDark]}>
        {item.name} - Completed at:{' '}
        {new Date(item.completedAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        colorScheme === 'dark' && styles.containerDark,
      ]}>
      <Text style={[styles.title, colorScheme === 'dark' && styles.textDark]}>
        Completed Timers
      </Text>
      <FlatList
        data={history}
        keyExtractor={item => `${item.id}-${item.completedAt}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyText,
              colorScheme === 'dark' && styles.textDark,
            ]}>
            No completed timers.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F2',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  itemDark: {
    borderColor: '#555',
  },
  itemText: {
    fontSize: 16,
  },
  textDark: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;
