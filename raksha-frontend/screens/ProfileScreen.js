import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

const ProfileScreen = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    pin: '',
    password: '',
    emergencyContacts: [],
  });

  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = await AsyncStorage.getItem('userId');
      try {
        const res = await api.get(`/auth/profile/${userId}`);
        setProfile({ ...res.data });
      } catch (err) {
        console.error('Profile fetch error:', err);
        Alert.alert('Error', 'Failed to load profile.');
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const res = await api.put('/auth/update-profile', {
        ...profile,
        userId,
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setProfile(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact],
    }));
    setNewContact({ name: '', phone: '' });
  };

  const handleRemoveContact = (index) => {
    setProfile(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={profile.phone}
        onChangeText={(text) => setProfile({ ...profile, phone: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN (optional)"
        keyboardType="numeric"
        value={profile.pin}
        onChangeText={(text) => setProfile({ ...profile, pin: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (optional)"
        secureTextEntry
        value={profile.password}
        onChangeText={(text) => setProfile({ ...profile, password: text })}
      />

      <Text style={styles.subheading}>Emergency Contacts</Text>

      <FlatList
        data={profile.emergencyContacts}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.contactRow}>
            <Text>{item.name} - {item.phone}</Text>
            <TouchableOpacity onPress={() => handleRemoveContact(index)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.newContactRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Contact Name"
          value={newContact.name}
          onChangeText={(text) => setNewContact({ ...newContact, name: text })}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Contact Phone"
          keyboardType="phone-pad"
          value={newContact.phone}
          onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
        />
        <Button title="Add" onPress={handleAddContact} />
      </View>

      <Button title="Save Profile" onPress={handleSave} color="#007AFF" />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 4,
  },
  removeText: {
    color: '#d11a2a',
    fontWeight: 'bold',
  },
  newContactRow: {
    flexDirection: 'column',
    marginBottom: 16,
  },
});
