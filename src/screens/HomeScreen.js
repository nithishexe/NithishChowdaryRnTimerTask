import React, {useReducer, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Accordion from '../components/Accordion';
import TimerCard from '../components/TimerCard';
import FAB from '../components/FAB';
import PreferencesModal from '../components/PreferencesModal';
import {saveState, loadState} from '../utils/Storage';
import {useFocusEffect} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';

const initialState = {
  timers: [
    {
      id: '1',
      name: 'Example Timer',
      category: 'Example',
      duration: 10,
      remaining: 10,
      status: 'paused',
    },
  ],
  history: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...state,
        timers: action.payload.timers,
        history: action.payload.history,
      };
    case 'ADD_TIMER':
      return {...state, timers: [...state.timers, action.payload]};
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id
            ? {...timer, ...action.payload.updates}
            : timer,
        ),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter(timer => timer.id !== action.payload.id),
      };
    case 'RESET_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id
            ? {...timer, remaining: timer.duration, status: 'paused'}
            : timer,
        ),
      };
    case 'COMPLETE_TIMER':
      const completedTimer = state.timers.find(
        timer => timer.id === action.payload.id,
      );
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id
            ? {...timer, remaining: 0, status: 'completed'}
            : timer,
        ),
        history: [
          ...state.history,
          {
            id: completedTimer.id,
            name: completedTimer.name,
            completedAt: new Date().toISOString(),
          },
        ],
      };
    case 'BULK_ACTION':
      return {
        ...state,
        timers: state.timers.map(timer => {
          if (timer.category === action.payload.category) {
            if (action.payload.actionType === 'reset') {
              return {...timer, remaining: timer.duration, status: 'paused'};
            }
            if (action.payload.actionType === 'start') {
              return {...timer, status: 'running'};
            }
            if (action.payload.actionType === 'pause') {
              return {...timer, status: 'paused'};
            }
          }
          return timer;
        }),
      };
    default:
      return state;
  }
};

const STORAGE_KEY = 'TIMER_APP_STATE';
const PREFS_KEY = 'PREFERENCES';

const HomeScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [menuVisible, setMenuVisible] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [halfwayAlertsEnabled, setHalfwayAlertsEnabled] = useState(false);
  const [completedTimer, setCompletedTimer] = useState(null);
  const route = useRoute();

  useEffect(() => {
    const fetchState = async () => {
      const stored = await loadState(STORAGE_KEY);
      if (stored) {
        dispatch({type: 'LOAD_STATE', payload: stored});
      }
    };
    fetchState();
  }, []);

  useEffect(() => {
    saveState(state, STORAGE_KEY);
  }, [state]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefsString = await AsyncStorage.getItem(PREFS_KEY);
        if (prefsString !== null) {
          const prefs = JSON.parse(prefsString);
          setHalfwayAlertsEnabled(prefs.halfwayAlertsEnabled);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.newTimer) {
        dispatch({type: 'ADD_TIMER', payload: route.params.newTimer});
        // Clear it after consuming
        navigation.setParams({newTimer: null});
      }
    }, [route.params?.newTimer]),
  );
  const savePreferences = async value => {
    try {
      setHalfwayAlertsEnabled(value);
      await AsyncStorage.setItem(
        PREFS_KEY,
        JSON.stringify({halfwayAlertsEnabled: value}),
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const onStart = id => {
    dispatch({
      type: 'UPDATE_TIMER',
      payload: {id, updates: {status: 'running'}},
    });
  };

  const onPause = id => {
    dispatch({
      type: 'UPDATE_TIMER',
      payload: {id, updates: {status: 'paused'}},
    });
  };

  const onReset = id => {
    dispatch({type: 'RESET_TIMER', payload: {id}});
  };

  const onDelete = id => {
    dispatch({type: 'DELETE_TIMER', payload: {id}});
  };

  const onComplete = id => {
    dispatch({type: 'COMPLETE_TIMER', payload: {id}});
    const completed = state.timers.find(timer => timer.id === id);
    if (completed) {
      setCompletedTimer(completed);
    }
  };

  const handleBulkAction = (category, actionType) => {
    dispatch({type: 'BULK_ACTION', payload: {category, actionType}});
  };

  const handleAddTimer = () => {
    navigation.navigate('AddTimer');
  };

  const handleHistory = () => {
    navigation.navigate('History');
  };

  const handlePreferences = () => {
    setPreferencesModalVisible(true);
  };

  const handleExport = async () => {
    try {
      const jsonString = JSON.stringify(state.history, null, 2);
      await Share.share({
        message: jsonString,
        title: 'Timer History',
      });
      setMenuVisible(false);
    } catch (error) {
      Alert.alert('Export Error', error.message);
    }
  };

  const handleResetAll = () => {
    Alert.alert(
      'Confirm Reset',
      'Are you sure you want to reset all data? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              dispatch({
                type: 'LOAD_STATE',
                payload: {timers: [], history: []},
              });
              Alert.alert('Reset', 'All data has been cleared.');
              setMenuVisible(false);
            } catch (error) {
              Alert.alert('Reset Error', error.message);
            }
          },
        },
      ],
    );
  };

  const groupedTimers = state.timers.reduce((acc, timer) => {
    if (!acc[timer.category]) {
      acc[timer.category] = [];
    }
    acc[timer.category].push(timer);
    return acc;
  }, {});

  return (
    <SafeAreaView
      style={[
        styles.container,
        colorScheme === 'dark' && styles.containerDark,
      ]}>
      {menuVisible && (
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        />
      )}

      <View style={styles.header}>
        <Pressable
          style={styles.kebabButton}
          onPress={() => setMenuVisible(prev => !prev)}>
          <Icon
            name="more-vert"
            size={24}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        </Pressable>
        {menuVisible && (
          <View
            style={[styles.menu, colorScheme === 'dark' && styles.menuDark]}>
            <Pressable style={styles.menuItem} onPress={handleExport}>
              <Text
                style={[
                  styles.menuItemText,
                  colorScheme === 'dark' && styles.menuItemTextDark,
                ]}>
                Export History
              </Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={handleResetAll}>
              <Text
                style={[
                  styles.menuItemText,
                  colorScheme === 'dark' && styles.menuItemTextDark,
                ]}>
                Delete All
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Object.keys(groupedTimers).map(category => (
          <Accordion
            key={category}
            value={{
              title: category,
              content: (
                <>
                  {groupedTimers[category].map(timer => (
                    <TimerCard
                      key={timer.id}
                      timer={timer}
                      onStart={onStart}
                      onPause={onPause}
                      onReset={onReset}
                      onDelete={onDelete}
                      onComplete={onComplete}
                      halfwayAlertsEnabled={halfwayAlertsEnabled}
                    />
                  ))}
                  <View
                    style={[
                      styles.footer,
                      colorScheme === 'dark' && styles.footerDark,
                    ]}>
                    <Text
                      style={[
                        styles.footerText,
                        colorScheme === 'dark' && styles.footerTextDark,
                      ]}>
                      {groupedTimers[category].length} Timers
                    </Text>
                    <View style={styles.bulkActions}>
                      <Pressable
                        onPress={() => handleBulkAction(category, 'start')}
                        style={styles.bulkButton}>
                        <Text style={styles.bulkButtonText}>Start All</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleBulkAction(category, 'pause')}
                        style={styles.bulkButton}>
                        <Text style={styles.bulkButtonText}>Pause All</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleBulkAction(category, 'reset')}
                        style={styles.bulkButton}>
                        <Text style={styles.bulkButtonText}>Reset All</Text>
                      </Pressable>
                    </View>
                  </View>
                </>
              ),
            }}
            numberOfRows={groupedTimers[category].length + 1}
            colorScheme={colorScheme}
          />
        ))}
      </ScrollView>

      <FAB
        onAddTimer={handleAddTimer}
        onHistory={handleHistory}
        onPreferences={handlePreferences}
      />

      <PreferencesModal
        visible={preferencesModalVisible}
        onClose={() => setPreferencesModalVisible(false)}
        initialHalfwayAlertsEnabled={halfwayAlertsEnabled}
        onSave={savePreferences}
      />

      <Modal
        visible={completedTimer !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedTimer(null)}>
        <View style={styles.completedModalBackdrop}>
          <View
            style={[
              styles.completedModalContainer,
              colorScheme === 'dark' && styles.completedModalContainerDark,
            ]}>
            <Text
              style={[
                styles.completedModalText,
                colorScheme === 'dark' && styles.completedModalTextDark,
              ]}>
              Whoooshh! {completedTimer?.name} time is completed!
            </Text>
            <Icon name="emoji-events" size={50} color="#4CAF50" />
            <Pressable
              onPress={() => setCompletedTimer(null)}
              style={styles.completedModalButton}>
              <Text style={styles.completedModalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    padding: 10,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kebabButton: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 8,
    width: 150,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuDark: {
    backgroundColor: '#333',
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    color: '#0F56B3',
    fontSize: 14,
  },
  menuItemTextDark: {
    color: '#fff',
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 8,
  },
  footerDark: {
    backgroundColor: '#2C2C2C',
    borderColor: '#555',
  },
  footerText: {
    fontSize: 14,
    color: '#333',
  },
  footerTextDark: {
    color: '#ccc',
  },
  bulkActions: {
    flexDirection: 'row',
  },
  bulkButton: {
    backgroundColor: '#0F56B3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  bulkButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  completedModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  completedModalContainerDark: {
    backgroundColor: '#333',
  },
  completedModalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  completedModalTextDark: {
    color: '#fff',
  },
  completedModalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  completedModalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
