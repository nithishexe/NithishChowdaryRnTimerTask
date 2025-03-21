import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import {loadState} from '../utils/Storage';

const CategoryDropdown = ({value, onChange, colorScheme}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const storedState = await loadState('TIMER_APP_STATE');
        if (storedState && storedState.timers) {
          const uniqueCategories = Array.from(
            new Set(storedState.timers.map(timer => timer.category)),
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <View style={styles.dropdownContainer}>
      <TextInput
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
        value={value}
        onChangeText={onChange}
        placeholder="e.g. Workout, Study"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      <Pressable
        style={styles.dropdownToggle}
        onPress={() => setDropdownVisible(prev => !prev)}>
        <Text style={styles.dropdownToggleText}>▼</Text>
      </Pressable>
      {dropdownVisible && (
        <View
          style={[
            styles.dropdownList,
            colorScheme === 'dark' && styles.dropdownListDark,
          ]}>
          {categories.map((cat, index) => (
            <Pressable
              key={index}
              style={styles.dropdownItem}
              onPress={() => {
                onChange(cat);
                setDropdownVisible(false);
              }}>
              <Text
                style={[
                  styles.dropdownItemText,
                  colorScheme === 'dark' && styles.dropdownItemTextDark,
                ]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const AddTimerScreen = ({navigation, route}) => {
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    if (!name || !duration || !category) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      remaining: parseInt(duration),
      category,
      status: 'paused',
    };
    // if (route.params && route.params.onAddTimer) {
    //   route.params.onAddTimer(newTimer);
    // }
    if (name && duration && category) {
      const newTimer = {
        id: Date.now().toString(),
        name,
        duration: parseInt(duration),
        remaining: parseInt(duration),
        category,
        status: 'paused',
      };
      navigation.navigate('Home', {newTimer}); // 👈 navigate back with data
    }

    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.container,
        colorScheme === 'dark' && styles.containerDark,
      ]}>
      <Text style={[styles.label, colorScheme === 'dark' && styles.textDark]}>
        Timer Name
      </Text>
      <TextInput
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Workout Timer"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      <Text style={[styles.label, colorScheme === 'dark' && styles.textDark]}>
        Duration (seconds)
      </Text>
      <TextInput
        style={[styles.input, colorScheme === 'dark' && styles.inputDark]}
        value={duration}
        onChangeText={setDuration}
        placeholder="e.g. 3600"
        keyboardType="numeric"
        placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#666'}
      />
      <Text style={[styles.label, colorScheme === 'dark' && styles.textDark]}>
        Category
      </Text>
      <CategoryDropdown
        value={category}
        onChange={setCategory}
        colorScheme={colorScheme}
      />
      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Timer</Text>
      </Pressable>
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
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  textDark: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    color: '#000',
  },
  inputDark: {
    borderColor: '#555',
    color: '#fff',
  },
  button: {
    backgroundColor: '#0F56B3',
    padding: 12,
    borderRadius: 4,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownToggle: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  dropdownToggleText: {
    fontSize: 16,
    color: '#0F56B3',
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    zIndex: 10,
  },
  dropdownListDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  dropdownItem: {
    padding: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#0F56B3',
  },
  dropdownItemTextDark: {
    color: '#fff',
  },
});

export default AddTimerScreen;
