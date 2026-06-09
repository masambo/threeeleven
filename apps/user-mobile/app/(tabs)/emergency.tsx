import { styles } from '@/lib/styles';
import { getCurrentLocation } from '@/lib/location';
import { api } from '@311-security/backend/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput } from 'react-native';

export default function EmergencyScreen() {
  const triggerAlert = useMutation(api.emergencyAlerts.trigger);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Current location');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrigger = async (type: 'panic' | 'medical' | 'fire' | 'crime_in_progress') => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const currentLocation = await getCurrentLocation();
      await triggerAlert({
        type,
        description: description.trim() || undefined,
        locationDescription: location.trim() || undefined,
        latitude: currentLocation?.latitude,
        longitude: currentLocation?.longitude,
      });
      Alert.alert(
        'Emergency sent',
        currentLocation
          ? 'Regional responders have been notified with your current location.'
          : 'Regional responders have been notified. Location permission was not granted.',
      );
      setDescription('');
    } catch (error) {
      Alert.alert('Emergency failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Emergency</Text>
      <Text style={styles.title}>Immediate help</Text>
      <Text style={styles.body}>
        Trigger an emergency alert. Your trusted contacts and regional services will be notified.
      </Text>

      <TextInput
        multiline
        onChangeText={setDescription}
        placeholder="Optional details"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={description}
      />
      <TextInput
        onChangeText={setLocation}
        placeholder="Location description"
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={location}
      />

      <Pressable disabled={isSubmitting} onPress={() => void handleTrigger('panic')} style={styles.emergencyButton}>
        <Text style={styles.primaryButtonText}>{isSubmitting ? 'Sending...' : 'Panic SOS'}</Text>
      </Pressable>
      <Pressable disabled={isSubmitting} onPress={() => void handleTrigger('medical')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Medical emergency</Text>
      </Pressable>
      <Pressable disabled={isSubmitting} onPress={() => void handleTrigger('fire')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Fire emergency</Text>
      </Pressable>
      <Pressable disabled={isSubmitting} onPress={() => void handleTrigger('crime_in_progress')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Crime in progress</Text>
      </Pressable>
    </ScrollView>
  );
}
