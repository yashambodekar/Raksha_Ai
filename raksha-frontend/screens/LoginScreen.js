import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import api from '../utils/api';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [fingerprintHash, setFingerprintHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert('Validation Error', 'Phone number is required');
      return;
    }

    if (!pin && !password && !fingerprintHash) {
      Alert.alert('Validation Error', 'At least one credential is required (PIN, password, or fingerprint)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        phone,
        pin,
        password,
        fingerprintHash
      });

      setLoading(false);

      if (response.data && response.data.user) {
        Alert.alert('Login Successful');
        navigation.navigate('Home', { user: response.data.user });
      } else {
        Alert.alert('Error', 'Unexpected response from server');
      }
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.error || 'Server error during login';
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
    >
      <Text style={styles.title}>Raksha AI - Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="PIN (Optional)"
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (Optional)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Fingerprint Hash (Optional)"
        value={fingerprintHash}
        onChangeText={setFingerprintHash}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    color: '#1f2937',
    fontSize: 14,
  },
});

export default LoginScreen;
