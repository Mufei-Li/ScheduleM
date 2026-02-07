import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { CalendarMonth } from '../components/CalendarMonth';
import { DayDetailModal } from '../components/DayDetailModal';
import { TimeUtils, CalendarEvent } from '@schedulem/core';
import { GestureHandlerRootView, GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { courseStore } from '../store/CourseStore';
import { useFocusEffect } from '@react-navigation/native';

export const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<TimeUtils.CalendarDay | null>(null);
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Load events when screen focuses or store changes (simple polling for now or useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
          // Ensure store is init (it might be already)
          await courseStore.init();
          const allEvents = courseStore.getEvents();
          setEvents(allEvents);
      };
      loadEvents();
    }, [])
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const onDayPress = (day: TimeUtils.CalendarDay) => {
    const dEvents = events.filter(e => 
        e.date.getFullYear() === day.year &&
        e.date.getMonth() === day.month &&
        e.date.getDate() === day.day
    );
    setSelectedDay(day);
    setDayEvents(dEvents);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
      setModalVisible(false);
      setSelectedDay(null);
  };

  // Swipe Gestures
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(handleNextMonth)();
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(handlePrevMonth)();
    });

  const composed = Gesture.Simultaneous(flingLeft, flingRight);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <Text style={styles.navText}>{'<'}</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{year}年 {month + 1}月</Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <Text style={styles.navText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <GestureDetector gesture={composed}>
          <View style={styles.content}>
            <CalendarMonth 
              year={year} 
              month={month} 
              events={events}
              onDayPress={onDayPress}
            />
          </View>
        </GestureDetector>

        {/* Detail Modal */}
        <DayDetailModal 
            visible={modalVisible}
            day={selectedDay}
            events={dayEvents}
            onClose={handleCloseModal}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  navBtn: {
    padding: 10,
  },
  navText: {
    fontSize: 20,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  }
});
