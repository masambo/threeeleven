import { styles } from '@/lib/styles';
import { api } from '@311-security/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const LIST_ARGS = {
  paginationOpts: { cursor: null, numItems: 10 },
} as const;

export default function MissingScreen() {
  const createReport = useMutation(api.missingReports.create);
  const publicReports = useQuery(api.missingReports.publicApproved, LIST_ARGS);
  const myReports = useQuery(api.missingReports.mine, LIST_ARGS);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [personName, setPersonName] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        reportType: 'missing_person',
        title: title.trim(),
        description: description.trim(),
        personName: personName.trim() || undefined,
        lastSeenLocation: lastSeenLocation.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      setPersonName('');
      setLastSeenLocation('');
      Alert.alert('Report submitted', 'Your missing report is awaiting admin review.');
    } catch (error) {
      Alert.alert('Submission failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Missing reports</Text>
      <Text style={styles.title}>Report a missing person</Text>

      <View style={styles.list}>
        <TextInput onChangeText={setTitle} placeholder="Report title" placeholderTextColor="#94a3b8" style={styles.input} value={title} />
        <TextInput onChangeText={setPersonName} placeholder="Person name" placeholderTextColor="#94a3b8" style={styles.input} value={personName} />
        <TextInput onChangeText={setLastSeenLocation} placeholder="Last seen location" placeholderTextColor="#94a3b8" style={styles.input} value={lastSeenLocation} />
        <TextInput multiline onChangeText={setDescription} placeholder="Description" placeholderTextColor="#94a3b8" style={styles.input} value={description} />
        <Pressable disabled={isSubmitting} onPress={() => void handleSubmit()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Submitting...' : 'Submit missing report'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, { fontSize: 22, marginTop: 24 }]}>Published cases</Text>
      <View style={styles.list}>
        {(publicReports?.page ?? []).map((report) => (
          <View key={report._id} style={styles.card}>
            <Text style={styles.cardTitle}>{report.title}</Text>
            <Text style={styles.cardMeta}>{report.lastSeenLocation ?? 'Location unknown'}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.title, { fontSize: 22, marginTop: 24 }]}>Your submissions</Text>
      <View style={styles.list}>
        {(myReports?.page ?? []).map((report) => (
          <View key={report._id} style={styles.card}>
            <Text style={styles.cardTitle}>{report.title}</Text>
            <Text style={styles.cardMeta}>Status: {report.status}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
