import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import api from '../utils/api';

const HomeScreen = ({ route }) => {
  const { user } = route.params;
  const [guardianMode, setGuardianMode] = useState(false);
  const guardianModeRef = useRef(false);
  const recordingInterval = useRef(null);
  const isRecordingRef = useRef(false);
  const recordingRef = useRef(null);

  const getPermissions = async () => {
    console.log('🔐 Requesting permissions...');
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (audioStatus !== 'granted' || locationStatus !== 'granted') {
      Alert.alert('Permission Required', 'App requires audio and location permissions.');
      return false;
    }
    console.log('✅ Permissions granted');
    return true;
  };

  const recordAndSend = async () => {
  if (!guardianModeRef.current || isRecordingRef.current) {
    console.log('🚫 Skipping: Guardian Mode OFF or already recording');
    return;
  }

  isRecordingRef.current = true;
  console.log('⏺️ recordAndSend triggered...');

  let recording;

  try {
    const { coords } = await Location.getCurrentPositionAsync();
    console.log('📍 Location fetched:', coords);

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    console.log('🎙️ Recording started...');

    await new Promise(resolve => setTimeout(resolve, 10000));

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const fileName = uri.split('/').pop();
    console.log('💾 Audio recorded:', fileName);

    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/x-m4a',
      name: fileName,
    });
    formData.append('userId', user._id);
    formData.append('location', JSON.stringify({ lat: coords.latitude, lng: coords.longitude }));

    console.log('📤 Sending audio to /sos/classify...');
    const res = await fetch(`${api.defaults.baseURL}/sos/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await res.json();
    console.log('🤖 Classification Result:', data);

    if (data.label === 'screaming' || data.label === 'crying') {
      console.log('🚨 Danger Detected:', data.label);
      await triggerSOS(uri, coords);
    } else {
      console.log('✅ No danger:', data.label);
    }
  } catch (err) {
    console.error('❌ recordAndSend error:', err);
  } finally {
    isRecordingRef.current = false;
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
    } catch {}
  }
};



  const triggerSOS = async (uri, coords) => {
    console.log('🚨 Triggering SOS manually...');
    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/x-wav',
      name: 'sos_clip.wav'
    });
    formData.append('userId', user._id);
    formData.append('location', JSON.stringify({ lat: coords.latitude, lng: coords.longitude }));

    try {
      const res = await fetch(`${api.defaults.baseURL}/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const data = await res.json();
      console.log('📩 SOS Triggered:', data);
    } catch (err) {
      console.error('❌ SOS Trigger error:', err);
    }
  };

  const handleGuardianToggle = async (value) => {
    const permissionGranted = await getPermissions();
    if (!permissionGranted) return;

    try {
      console.log(value ? '🟢 Turning ON Guardian Mode' : '🔴 Turning OFF Guardian Mode');
      await api.post('/guardian/toggle', { userId: user._id, activate: value });
      setGuardianMode(value);
      guardianModeRef.current = value;

      Alert.alert(`Guardian Mode ${value ? 'Activated' : 'Deactivated'}`);

      if (value) {
        console.log('⏱️ Starting interval...');
        recordingInterval.current = setInterval(recordAndSend, 15000); // safer interval
      } else {
        console.log('⛔ Stopping interval...');
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    } catch (err) {
      console.error('❌ Toggle error:', err);
      Alert.alert('Error toggling Guardian Mode');
    }
  };

  useEffect(() => {
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guardian Mode</Text>
      <Switch
        value={guardianMode}
        onValueChange={handleGuardianToggle}
        thumbColor={guardianMode ? '#10b981' : '#f43f5e'}
        trackColor={{ false: '#ccc', true: '#bbf7d0' }}
      />
      <Text style={styles.status}>{guardianMode ? 'Active' : 'Inactive'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e3a8a',
  },
  status: {
    marginTop: 8,
    fontSize: 18,
    color: '#111827',
  },
});

export default HomeScreen;
