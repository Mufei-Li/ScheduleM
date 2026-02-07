import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { TimeUtils, CalendarEvent } from '@schedulem/core';

const { width } = Dimensions.get('window');
const CELL_WIDTH = (width - 32) / 7; // 32 for padding
const CELL_HEIGHT = 80;

interface CalendarMonthProps {
    year: number;
    month: number;
    events?: CalendarEvent[];
    onDayPress?: (day: TimeUtils.CalendarDay) => void;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({ year, month, events = [], onDayPress }) => {
    const grid = TimeUtils.getCalendarGrid(year, month);
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.weekRow}>
                {weekDays.map((d, i) => (
                    <View key={i} style={styles.headerCell}>
                        <Text style={styles.headerText}>{d}</Text>
                    </View>
                ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {grid.weeks.map((week, wIdx) => (
                    <View key={wIdx} style={styles.weekRow}>
                        {week.map((day, dIdx) => {
                            const isToday = new Date().toDateString() === new Date(day.year, day.month, day.day).toDateString();
                            
                            // Filter events for this day
                            const dayEvents = events.filter(e => 
                                e.date.getFullYear() === day.year &&
                                e.date.getMonth() === day.month &&
                                e.date.getDate() === day.day
                            );

                            // Sort by time
                            dayEvents.sort((a, b) => a.period - b.period);

                            return (
                                <TouchableOpacity
                                    key={dIdx}
                                    style={[
                                        styles.dayCell,
                                        !day.isCurrentMonth && styles.dayCellDimmed,
                                        isToday && styles.dayCellToday
                                    ]}
                                    onPress={() => onDayPress?.(day)}
                                >
                                    <View style={styles.dayNumberContainer}>
                                        <Text style={[
                                            styles.dayNumber,
                                            !day.isCurrentMonth && styles.dayNumberDimmed,
                                            isToday && styles.dayNumberToday
                                        ]}>
                                            {day.day}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.dotsContainer}>
                                        {dayEvents.slice(0, 4).map((ev, i) => {
                                            let dotColor = '#3b82f6'; // Default blue
                                            if (ev.timeOfDay === 'morning') dotColor = '#10b981'; // Green
                                            else if (ev.timeOfDay === 'afternoon') dotColor = '#f59e0b'; // Amber
                                            else if (ev.timeOfDay === 'evening') dotColor = '#6366f1'; // Indigo

                                            return (
                                                <View 
                                                    key={i} 
                                                    style={[styles.dot, { backgroundColor: dotColor }]} 
                                                />
                                            );
                                        })}
                                        {dayEvents.length > 4 && (
                                            <View style={[styles.dot, { backgroundColor: '#94a3b8' }]} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerCell: {
        width: CELL_WIDTH,
        alignItems: 'center',
        paddingVertical: 8,
    },
    headerText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#e2e8f0',
    },
    dayCell: {
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e2e8f0',
        padding: 4,
        backgroundColor: '#fff',
    },
    dayCellDimmed: {
        backgroundColor: '#f8fafc',
    },
    dayCellToday: {
        backgroundColor: '#eff6ff',
    },
    dayNumberContainer: {
        alignItems: 'flex-start',
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    dayNumberDimmed: {
        color: '#cbd5e1',
    },
    dayNumberToday: {
        color: '#3b82f6',
        fontWeight: '700',
    },
    dotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
        gap: 3,
        paddingHorizontal: 2,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    }
});
