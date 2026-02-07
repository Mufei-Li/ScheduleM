import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { ImportScreen } from '../screens/ImportScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Import') iconName = '📥';
            else if (route.name === 'Calendar') iconName = '📅';
            else if (route.name === 'Courses') iconName = '📚';
            else if (route.name === 'Settings') iconName = '⚙️';
            return <Text style={{ fontSize: size }}>{iconName}</Text>;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Import" component={ImportScreen} options={{ title: '导入' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '月历' }} />
        <Tab.Screen name="Courses" component={CoursesScreen} options={{ title: '课程' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
