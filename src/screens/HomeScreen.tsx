import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ route, navigation }: Props) {
  const name = route?.params?.name ?? 'Friend';
  // Mock groups data - replace with real data later
  const [groups] = useState<any[]>([]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome, {name}</Text>
        </View>

        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          
          {groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You have no groups right now</Text>
              <Text style={styles.emptySubtext}>Join or create a group to start sharing photos!</Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group, index) => (
                <TouchableOpacity key={index} style={styles.groupItem}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupCode}>Code: {group.joinCode}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('JoinCode', { name })}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100, // Space for floating button
  },
  header: {
    marginBottom: 32,
  },
  heading: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '700', 
    letterSpacing: 0.3 
  },
  groupsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    textAlign: 'center',
  },
  groupsList: {
    gap: 12,
  },
  groupItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  groupName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupCode: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 24,
  },
});


