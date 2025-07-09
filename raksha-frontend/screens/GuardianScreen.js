import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const RECORDING_OPTIONS = Audio.RecordingOptionsPresets.HIGH_QUALITY;

const GuardianScreen = () => {
  const [statusText, setStatusText] = useState('Guardian Mode: Inactive');
  const [recordingActive, setRecordingActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startGuardian = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      const loc = await Location.requestForegroundPermissionsAsync();

      if (!granted || loc.status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow microphone and location access');
        return;
      }

      setRecordingActive(true);
      setStatusText('Monitoring: Recording every 10s...');

      intervalRef.current = setInterval(() => {
        handleRecordingCycle();
      }, 10000);
    } catch (err) {
      console.error('Start Error:', err);
      Alert.alert('Error', 'Could not start Guardian mode');
    }
  };

  const stopGuardian = () => {
    setRecordingActive(false);
    setStatusText('Guardian Mode: Inactive');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleRecordingCycle = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recorded URI:", uri);
      const location = await Location.getCurrentPositionAsync({});
      const userId = await AsyncStorage.getItem('userId');

      if (!uri || !userId) return;

      await uploadAndClassify(uri, userId, location.coords);
    } catch (err) {
      console.error('Recording cycle error:', err);
      setStatusText('⚠️ Error during recording');
    }
  };

  const uploadAndClassify = async (uri, userId, coords) => {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      });
      formData.append('userId', userId);
      formData.append('location', JSON.stringify(coords));

      const res = await api.post('/sos/classify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { message, label, confidence } = res.data;

      if (message === "SOS triggered") {
        setStatusText(`🚨 SOS sent: ${label} (${(confidence * 100).toFixed(1)}%)`);
      } else if (message === "No threat detected") {
        setStatusText(`✅ ${label} detected (${(confidence * 100).toFixed(1)}%)`);
      } else {
        setStatusText(message || 'No response from server');
      }
    } catch (err) {
      console.error('Upload/classify error:', err);
      setStatusText('❌ Failed to upload audio');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Guardian Mode</Text>
      <Text style={styles.status}>{statusText}</Text>
      {recordingActive ? (
        <Button title="Stop Monitoring" onPress={stopGuardian} color="#d11a2a" />
      ) : (
        <Button title="Start Monitoring" onPress={startGuardian} color="#34C759" />
      )}
    </View>
  );
};

export default GuardianScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginVertical: 24,
    textAlign: 'center',
  },
});
