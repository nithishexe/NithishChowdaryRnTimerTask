import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Vibration,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {formatDuration} from '../utils/helpers';

const TimerCard = ({
  timer,
  onStart,
  onPause,
  onReset,
  onDelete,
  onComplete,
  halfwayAlertsEnabled,
}) => {
  const colorScheme = useColorScheme();
  const [remaining, setRemaining] = useState(timer.remaining);
  const [isRunning, setIsRunning] = useState(timer.status === 'running');
  const [halfwayAlertShown, setHalfwayAlertShown] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(timer.remaining);
    setIsRunning(timer.status === 'running');
    if (timer.remaining === timer.duration) {
      setHalfwayAlertShown(false);
    }
  }, [timer.remaining, timer.status, timer.duration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          const newRemaining = prev - 1;
          if (
            halfwayAlertsEnabled &&
            !halfwayAlertShown &&
            newRemaining <= timer.duration / 2
          ) {
            setHalfwayAlertShown(true);
            try {
              Vibration.vibrate(200);
              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  `${timer.name} is halfway done!`,
                  ToastAndroid.SHORT,
                );
              } else {
                Alert.alert('Halfway Alert', `${timer.name} is halfway done!`);
              }
            } catch (err) {
              console.error('Vibration error:', err);
            }
          }
          if (newRemaining <= 0) {
            clearInterval(intervalRef.current);
            setTimeout(() => {
              onComplete && onComplete(timer.id);
            }, 0);
            return 0;
          }

          return newRemaining;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, halfwayAlertsEnabled, halfwayAlertShown, timer.duration]);

  const handleToggle = () => {
    try {
      if (isRunning) {
        setIsRunning(false);
        onPause && onPause(timer.id);
      } else {
        setIsRunning(true);
        onStart && onStart(timer.id);
      }
    } catch (error) {
      console.error('Error toggling timer:', error);
    }
  };

  const handleReset = () => {
    try {
      clearInterval(intervalRef.current);
      setRemaining(timer.duration);
      setIsRunning(false);
      setHalfwayAlertShown(false);
      onReset && onReset(timer.id);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  const handleDelete = () => {
    onDelete && onDelete(timer.id);
  };

  const statusText =
    timer.status === 'completed'
      ? 'COMPLETED'
      : isRunning
      ? 'Running'
      : 'Paused';

  const progress = (remaining / timer.duration) * 100;

  return (
    <View style={[styles.card, colorScheme === 'dark' && styles.cardDark]}>
      <View style={styles.row}>
        <Text style={[styles.name, colorScheme === 'dark' && styles.textDark]}>
          {timer.name}
        </Text>
        <Text
          style={[
            styles.remaining,
            isRunning && styles.runningRemaining,
            colorScheme === 'dark' && styles.textDark,
          ]}>
          {formatDuration(remaining)}
        </Text>
        {timer.status === 'completed' ? (
          <View style={[styles.button, styles.completedButton]}>
            <Icon name="check-circle" size={34} color="#4CAF50" />
          </View>
        ) : (
          <Pressable onPress={handleToggle} style={styles.button}>
            <Icon
              name={isRunning ? 'pause' : 'play-arrow'}
              size={24}
              color="#fff"
            />
          </Pressable>
        )}
      </View>
      <View style={[styles.row, styles.actionsRow]}>
        <Text
          style={[styles.status, colorScheme === 'dark' && styles.textDark]}>
          {statusText}
        </Text>
        <Pressable onPress={handleReset} style={styles.popupButton}>
          <Icon
            name="refresh"
            size={20}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.popupButton}>
          <Icon
            name="delete"
            size={20}
            color={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        </Pressable>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, {width: `${progress}%`}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignSelf: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    marginTop: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  remaining: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  runningRemaining: {
    fontSize: 24,
    color: '#FF0000',
  },
  button: {
    backgroundColor: '#0F56B3',
    padding: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: 14,
    flex: 1,
  },
  popupButton: {
    marginHorizontal: 8,
  },
  progressBarContainer: {
    marginTop: 8,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0F56B3',
  },
  textDark: {
    color: '#fff',
  },
  completedButton: {
    backgroundColor: 'transparent',
  },
});

export default TimerCard;
