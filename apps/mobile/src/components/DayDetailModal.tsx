import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { TimeUtils, CalendarEvent } from '@schedulem/core';

interface DayDetailModalProps {
    visible: boolean;
    day: TimeUtils.CalendarDay | null;
    events: CalendarEvent[];
    onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({ visible, day, events, onClose }) => {
    if (!day) return null;

    const dateStr = `${day.year}年${day.month + 1}月${day.day}日`;
    
    // Sort events
    const sortedEvents = [...events].sort((a, b) => a.period - b.period);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{dateStr}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>关闭</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Events List */}
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {sortedEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>今天没有课哦 ~</Text>
                            </View>
                        ) : (
                            sortedEvents.map((ev, i) => (
                                <View key={i} style={[styles.eventCard, styles[`type_${ev.timeOfDay}`]]}>
                                    <View style={styles.timeBadge}>
                                        <Text style={styles.timeText}>{ev.startTime}</Text>
                                        <Text style={styles.timeText}>-</Text>
                                        <Text style={styles.timeText}>{ev.endTime}</Text>
                                    </View>
                                    <View style={styles.eventInfo}>
                                        <Text style={styles.eventName}>{ev.title}</Text>
                                        <Text style={styles.eventLoc}>@{ev.location}</Text>
                                        {ev.className && <Text style={styles.eventMeta}>{ev.className}</Text>}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles: any = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        color: '#64748b',
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    eventCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    type_morning: {
        backgroundColor: '#ecfdf5',
        borderLeftColor: '#10b981',
    },
    type_afternoon: {
        backgroundColor: '#fffbeb',
        borderLeftColor: '#f59e0b',
    },
    type_evening: {
        backgroundColor: '#eef2ff',
        borderLeftColor: '#6366f1',
    },
    timeBadge: {
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.05)',
        paddingRight: 12,
    },
    timeText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    eventInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    eventName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    eventLoc: {
        fontSize: 14,
        color: '#334155',
        marginBottom: 2,
    },
    eventMeta: {
        fontSize: 12,
        color: '#64748b',
    }
});
