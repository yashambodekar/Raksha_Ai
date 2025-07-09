import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const HomeScreen = ({ navigation }) => {
  const [guardianMode, setGuardianMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const storedId = await AsyncStorage.getItem('userId');
      setUserId(storedId);

      try {
        const res = await api.get(`/guardian/status/${storedId}`);
        setGuardianMode(res.data.isActive);
      } catch (err) {
        console.error('Status error:', err);
        Alert.alert('Error', 'Failed to get Guardian status');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    try {
      const activate = !guardianMode;
      const res = await api.post('/guardian/toggle', { userId, activate });
      setGuardianMode(res.data.log.isActive);
    } catch (err) {
      console.error('Toggle error:', err);
      Alert.alert('Error', 'Could not toggle Guardian Mode.');
    }
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Raksha</Text>

      <View style={styles.guardianRow}>
        <Text style={styles.guardianText}>
          Guardian Mode: {guardianMode ? 'Active 🛡️' : 'Inactive ⚠️'}
        </Text>
        <Switch
          value={guardianMode}
          onValueChange={handleToggle}
          thumbColor={guardianMode ? '#34C759' : '#f4f3f4'}
          trackColor={{ false: '#ccc', true: '#81b0ff' }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Guardian')}>
          <Text style={styles.buttonText}>Guardian Mode Screen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SOSLog')}>
          <Text style={styles.buttonText}>SOS Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  guardianRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 24,
  },
  guardianText: {
    fontSize: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
