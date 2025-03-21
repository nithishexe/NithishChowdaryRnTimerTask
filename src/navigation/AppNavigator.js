import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddTimerScreen from '../screens/AddTimerScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        headerStyle: {backgroundColor: '#fff'},
        headerTintColor: '#000',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Timers'}}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{title: 'History'}}
      />
      <Stack.Screen
        name="AddTimer"
        component={AddTimerScreen}
        options={{title: 'Add Timer'}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
