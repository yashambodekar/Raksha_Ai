import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    if (!phone || !pin) {
      Alert.alert('Error', 'Please enter both phone and PIN/password');
      return;
    }

    try {
      const res = await api.post('/auth/login', { phone, pin });
      const userId = res.data.userId;

      await AsyncStorage.setItem('userId', userId);
      navigation.replace('Home');
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raksha Login</Text>

      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        placeholder="PIN or Password"
        secureTextEntry
        style={styles.input}
        value={pin}
        onChangeText={setPin}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 36,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
  },
});
