import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, ScrollView } from 'react-native';
import { courseStore } from '../store/CourseStore';
import { TimeUtils } from '@schedulem/core';

export const SettingsScreen = () => {
  const [semesterStart, setSemesterStart] = useState('');
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [versionInfo, setVersionInfo] = useState({ app: '1.0.0', core: '0.0.1' });

  const loadSettings = async () => {
    await courseStore.init();
    const start = courseStore.getSemesterStart();
    setSemesterStart(start);
    calculateCurrentWeek(start);
  };

  const calculateCurrentWeek = (startStr: string) => {
    const d = new Date(startStr);
    if (isNaN(d.getTime())) {
      setCurrentWeek(null);
      return;
    }
    const today = new Date();
    // Simple week diff
    const diff = today.getTime() - d.getTime();
    const weeks = Math.ceil(diff / (7 * 24 * 3600 * 1000));
    setCurrentWeek(weeks > 0 ? weeks : 1);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveStart = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(semesterStart)) {
      Alert.alert('Error', 'Format must be YYYY-MM-DD');
      return;
    }
    await courseStore.saveSemesterStart(semesterStart);
    calculateCurrentWeek(semesterStart);
    Alert.alert('Success', 'Semester start date updated.');
  };

  const handleClearData = async () => {
    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to delete all courses?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await courseStore.clearRules();
            Alert.alert('Cleared', 'All courses have been removed.');
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Semester Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Semester Configuration</Text>
        
        <Text style={styles.label}>Semester Start Date (YYYY-MM-DD)</Text>
        <TextInput 
          style={styles.input}
          value={semesterStart}
          onChangeText={setSemesterStart}
          placeholder="2024-09-01"
        />
        <Button title="Save Date" onPress={handleSaveStart} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Week:</Text>
          <Text style={styles.infoValue}>{currentWeek ? `第 ${currentWeek} 周` : 'Unknown'}</Text>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Button title="Clear All Courses" onPress={handleClearData} color="#ef4444" />
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>App Version: {versionInfo.app}</Text>
        <Text style={styles.text}>Core Version: {versionInfo.core}</Text>
        <Text style={styles.footerText}>Powered by ScheduleLLM Core</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#0f172a' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#334155' },
  label: { fontSize: 14, color: '#64748b', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    color: '#1e293b'
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' },
  infoLabel: { fontSize: 16, color: '#475569' },
  infoValue: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  text: { fontSize: 14, color: '#475569', marginBottom: 4 },
  footerText: { fontSize: 12, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }
});
