import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || (!pin && !password)) {
      return Alert.alert('Error', 'Phone number and at least one credential is required.');
    }

    try {
      const res = await api.post('/auth/login', {
        phone,
        pin,
        password,
        fingerprintHash: "", 
      });

      const userId = res.data.user._id;
      await AsyncStorage.setItem('userId', userId);
      navigation.replace('Home');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      Alert.alert('Login Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="PIN (optional)" style={styles.input} secureTextEntry value={pin} onChangeText={setPin} />
      <TextInput placeholder="Password (optional)" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

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
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 16,
  },
});
