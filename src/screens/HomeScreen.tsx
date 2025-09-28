import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { route: { params?: { name?: string } } };

export default function HomeScreen({ route }: Props) {
  const name = route?.params?.name ?? 'Friend';
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>You're in 🎉</Text>
      <Text style={styles.subheading}>Welcome, {name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subheading: { color: 'rgba(255,255,255,0.85)', fontSize: 18 },
});


