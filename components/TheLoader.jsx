import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const TheLoader = ({ text, isOverlay }) => {
  const isLoading = isOverlay ? useSelector((state) => state.isLoading || false) : false;

  if (isOverlay && !isLoading) return null;

  return (
    <View style={[styles.container, isOverlay && styles.overlay]}>
      <ActivityIndicator size="large" />
      <Text style={styles.textBlock}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  textBlock: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TheLoader;
