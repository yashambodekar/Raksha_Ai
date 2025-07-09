import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import GuardianScreen from '../screens/GuardianScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SOSLogScreen from '../screens/SOSLogSceen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Home" component={HomeScreen} />
     <Stack.Screen name="Guardian" component={GuardianScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="SOSLog" component={SOSLogScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
