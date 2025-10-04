import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { getUserGroups, Group } from '../lib/groups';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { signOut, user, userName } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use userName from context, fallback to email username, then "Friend"
  const displayName = userName || 'Friend';

  // Fetch user groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching user groups...');
        const result = await getUserGroups(user.id);
        
        if (result.success && result.groups) {
          console.log('✅ Groups fetched successfully:', result.groups);
          setGroups(result.groups);
        } else {
          console.error('❌ Error fetching groups:', result.error);
        }
      } catch (error) {
        console.error('❌ Unexpected error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  // Group Card Component
  const GroupCard = ({ group }: { group: Group }) => (
    <TouchableOpacity 
      style={styles.groupCard} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Group', {
        groupId: group.id,
        groupName: group.group_name
      })}
    >
      <View style={styles.groupImagePlaceholder}>
        <Text style={styles.placeholderIcon}>📸</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.group_name}</Text>
        <Text style={styles.groupCode}>Code: {group.join_code}</Text>
        <Text style={styles.groupDate}>Created {new Date(group.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome, {displayName}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.groupsSection}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading your groups...</Text>
            </View>
          ) : groups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You have no groups right now</Text>
              <Text style={styles.emptySubtext}>Join or create a group to start sharing photos!</Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('JoinCode')}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: { 
    color: '#fff', 
    fontSize: 28, 
    fontWeight: '700', 
    letterSpacing: 0.3,
    flex: 1,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 16,
  },
  groupsList: {
    gap: 16,
  },
  groupCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupCode: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 2,
  },
  groupDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
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


