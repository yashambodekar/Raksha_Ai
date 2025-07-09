import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const SOSLogScreen = () => {
  const [sosList, setSosList] = useState([]);

  useEffect(() => {
    const fetchSOS = async () => {
      const userId = await AsyncStorage.getItem('userId');
      try {
        const res = await api.get(`/sos/user/${userId}`); // API to get all SOS for a user
        setSosList(res.data.sosList.reverse()); // Most recent first
      } catch (err) {
        console.error('SOS fetch error:', err);
        Alert.alert('Error', 'Failed to fetch SOS history');
      }
    };

    fetchSOS();
  }, []);

  const handleResend = async (sosId) => {
    try {
      const res = await api.post('/sos/resend', { sosId });
      Alert.alert('Success', 'SOS alert resent to contacts.');
    } catch (err) {
      console.error('Resend error:', err);
      Alert.alert('Error', 'Failed to resend SOS.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>🆘 Date:</Text>
      <Text>{new Date(item.createdAt).toLocaleString()}</Text>

      <Text style={styles.label}>📍 Location:</Text>
      <Text
        style={styles.link}
        onPress={() =>
          Linking.openURL(
            `https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`
          )
        }
      >
        View on Map
      </Text>

      <Text style={styles.label}>🔊 Audio:</Text>
      <Text
        style={styles.link}
        onPress={() => Linking.openURL(item.audioUrl)}
      >
        Play Audio
      </Text>

      <Text style={styles.label}>🚩 Status:</Text>
      <Text style={{ color: item.isFalseAlarm ? 'red' : 'green' }}>
        {item.isFalseAlarm ? 'Marked as False Alarm' : 'Active/Triggered'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleResend(item._id)}
      >
        <Text style={styles.buttonText}>Resend SOS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your SOS Alerts</Text>
      <FlatList
        data={sosList}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default SOSLogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
