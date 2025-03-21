import React, {useState} from 'react';
import {View, StyleSheet, Pressable, Text, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FAB = ({onAddTimer, onHistory, onPreferences}) => {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, colorScheme === 'dark']}>
      {expanded && (
        <View style={styles.options}>
          <Pressable
            style={styles.optionButton}
            onPress={() => {
              setExpanded(false);
              onAddTimer && onAddTimer();
            }}>
            <Text style={styles.optionText}>Add Timer</Text>
          </Pressable>
          <Pressable
            style={styles.optionButton}
            onPress={() => {
              setExpanded(false);
              onHistory && onHistory();
            }}>
            <Text style={styles.optionText}>History</Text>
          </Pressable>
          <Pressable
            style={styles.optionButton}
            onPress={() => {
              setExpanded(false);
              onPreferences && onPreferences();
            }}>
            <Text style={styles.optionText}>Preferences</Text>
          </Pressable>
        </View>
      )}
      <Pressable style={styles.fab} onPress={() => setExpanded(prev => !prev)}>
        <Icon name="menu" size={25} color="#D4D4D4" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'flex-end',
  },

  fab: {
    backgroundColor: '#0F56B3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  optionButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginVertical: 4,
  },
  optionText: {
    color: '#0F56B3',
    fontWeight: '600',
  },
});

export default FAB;
