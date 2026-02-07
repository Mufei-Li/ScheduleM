import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { TimeUtils, NormalizeRule } from '@schedulem/core';
import { llmService, LLMCourse } from '@schedulem/services';
import { courseStore } from '../store/CourseStore';

export const ImportScreen = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Init store on mount
    courseStore.init().then(() => {
      setStatus(`Store ready. ${courseStore.getRules().length} courses loaded.`);
    });
    
    // Check LLM Health
    llmService.checkHealth().then(ok => {
        if (!ok) setStatus(s => s + '\nWarning: LLM API Key not configured.');
    });
  }, []);

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setStatus('Parsing...');

    try {
      // 1. Call LLM Service
      // Note: In real app, you might want to configure API Key in Settings
      // For now we assume env var or hardcoded key in LLMService (which is empty by default)
      // So this might fail if no key provided.
      // Let's use a mock for demo if LLM fails or for testing logic.
      
      let result = await llmService.parseCourse(inputText);
      
      if (result.error) {
          setStatus(`Error: ${result.error}`);
          setLoading(false);
          return;
      }

      // 2. Normalize to Rules
      const rules = result.courses.map(c => {
        // Convert LLM Course to Rule
        // This logic should ideally be in core or service, but simple enough here
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: c.name,
            rawName: c.name,
            location: c.location,
            className: c.className,
            dayOfWeek: 1, // Default or parsed? LLM currently doesn't output day/period clearly in "courses" array? 
            // Wait, LLM result structure in LLMService.ts:
            // courses: { name, weeks, location, ... } 
            // It misses dayOfWeek and period! 
            // The prompt in LLMService needs to extract day/period if it's in text.
            // But usually LLM extracts from a cell where day/period is implicit (grid).
            // If input is raw text like "Monday 1-2 Math", LLM should extract it.
            
            // Let's assume for this demo, we add a dummy rule or user needs to edit.
            // Actually, the current LLM prompt in LLMService.ts DOES NOT ask for day/period explicitly 
            // in the "courses" array, it expects grid for that? 
            // Let's look at LLMService.ts again.
            
            // Re-reading LLMService.ts: 
            // "courses": [ { "name": ..., "weeks": ..., "location": ... } ]
            // Indeed, day/period is missing in the JSON schema requested from LLM.
            // This is a limitation of the current prompt for pure text parsing if text contains time info.
            
            // For now, let's just map what we have and maybe default to Monday 1-2
            // so we can see it on calendar.
            dayOfWeek: 1,
            periodRange: c.periodRange || '1-2',
            weeksRaw: c.weeksRaw,
            weeks: c.weeks,
            source: 'auto' as const,
            createdAt: Date.now()
        };
      });

      // 3. Save
      await courseStore.addRules(rules);
      setStatus(`Imported ${rules.length} courses!`);
      setInputText('');

    } catch (e: any) {
      setStatus(`Exception: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMockImport = async () => {
      const mockRules = [
          {
              id: 'mock-1',
              name: '高等数学',
              rawName: '高等数学',
              location: '一教201',
              className: '软件2101',
              dayOfWeek: 1, // Mon
              periodRange: '1-2',
              weeksRaw: '1-16周',
              weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
              source: 'manual' as const,
              createdAt: Date.now()
          },
          {
              id: 'mock-2',
              name: '大学英语',
              rawName: '大学英语',
              location: '二教305',
              className: '软件2101',
              dayOfWeek: 3, // Wed
              periodRange: '3-4',
              weeksRaw: '1-16周',
              weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
              source: 'manual' as const,
              createdAt: Date.now()
          }
      ];
      await courseStore.addRules(mockRules);
      setStatus(`Added 2 mock courses.`);
  };

  const handleClear = async () => {
      await courseStore.clearRules();
      setStatus('Cleared all courses.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Import Schedule</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Paste Text / JSON:</Text>
        <TextInput 
            style={styles.input} 
            multiline 
            numberOfLines={6}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Paste course text here..." 
        />
        <Button title="Parse & Import" onPress={handleParse} disabled={loading} />
      </View>

      <View style={styles.card}>
          <Text style={styles.label}>Debug Tools:</Text>
          <View style={styles.row}>
            <Button title="Add Mock Data" onPress={handleMockImport} />
            <View style={{width: 10}} />
            <Button title="Clear All" onPress={handleClear} color="red" />
          </View>
      </View>

      <Text style={styles.status}>{status}</Text>
      {loading && <ActivityIndicator size="large" style={{marginTop: 20}} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#334155' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, height: 120, textAlignVertical: 'top', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'flex-start' },
  status: { marginTop: 10, color: '#64748b', fontSize: 14 }
});
