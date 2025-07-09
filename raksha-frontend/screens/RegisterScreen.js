import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !phone || (!pin && !password)) {
      return Alert.alert('Error', 'Name, phone, and at least one credential (PIN or password) is required.');
    }

    try {
      const res = await api.post('/auth/register', {
        name,
        phone,
        pin,
        password,
        fingerprintHash: "", // leave empty for now
        emergencyContacts: [],
      });

      const userId = res.data.user._id;
      await AsyncStorage.setItem('userId', userId);
      navigation.replace('Home');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      Alert.alert('Error', msg);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="PIN (optional)" style={styles.input} secureTextEntry value={pin} onChangeText={setPin} />
      <TextInput placeholder="Password (optional)" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already registered? Login here</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 16,
  },
});
