import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [fingerprintHash, setFingerprintHash] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !phone) {
      Alert.alert('Validation Error', 'Name and phone are required');
      return;
    }

    if (!pin && !password && !fingerprintHash) {
      Alert.alert('Validation Error', 'At least one of PIN, password, or fingerprint is required');
      return;
    }

    const validContacts = emergencyContacts.filter(c => c.name && c.phone);
    if (validContacts.length < 1) {
      Alert.alert('Validation Error', 'At least one emergency contact is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        phone,
        pin,
        password,
        fingerprintHash,
        emergencyContacts: validContacts,
      });

      Alert.alert('Success', 'Registered successfully');
      navigation.navigate('Login');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Register for Raksha</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="PIN (optional)"
          secureTextEntry
          value={pin}
          onChangeText={setPin}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (optional)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Fingerprint Hash (optional)"
          value={fingerprintHash}
          onChangeText={setFingerprintHash}
        />

        <Text style={styles.sectionTitle}>Emergency Contacts (min. 1)</Text>
        {emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Contact ${index + 1} Name`}
              value={contact.name}
              onChangeText={(text) => handleContactChange(index, 'name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder={`Contact ${index + 1} Phone`}
              keyboardType="phone-pad"
              value={contact.phone}
              onChangeText={(text) => handleContactChange(index, 'phone', text)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#1f2937',
  },
  contactContainer: {
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    textAlign: 'center',
    color: '#374151',
    fontSize: 14,
  },
});

export default RegisterScreen;
