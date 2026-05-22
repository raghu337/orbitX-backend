import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../theme/theme';

const ARHud = ({ lat = 0, lon = 0, alt = 0, status = 'SCANNING' }) => {
  return (
    <View style={styles.container}>
      {/* Top Left HUD */}
      <View style={styles.topLeft}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: status === 'SCANNING' ? COLORS.primary : COLORS.success }]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <Text style={styles.hudLabel}>SYSTEM_READY_V1.0</Text>
      </View>

      {/* Top Right HUD */}
      <View style={styles.topRight}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>LAT</Text>
          <Text style={styles.dataValue}>{lat.toFixed(4)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>LON</Text>
          <Text style={styles.dataValue}>{lon.toFixed(4)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>ALT</Text>
          <Text style={styles.dataValue}>{alt.toFixed(0)}m</Text>
        </View>
      </View>

      {/* Frame Details */}
      <View style={styles.frameTL} />
      <View style={styles.frameTR} />
      <View style={styles.frameBL} />
      <View style={styles.frameBR} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: SPACING.lg,
    paddingTop: 50,
  },
  topLeft: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.text,
    letterSpacing: 1,
  },
  hudLabel: {
    fontFamily: FONTS.medium,
    fontSize: 8,
    color: COLORS.primary,
    marginTop: 4,
    opacity: 0.7,
  },
  topRight: {
    position: 'absolute',
    top: 50,
    right: SPACING.lg,
    alignItems: 'flex-end',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dataLabel: {
    fontFamily: FONTS.bold,
    fontSize: 8,
    color: COLORS.primary,
    marginRight: 6,
  },
  dataValue: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.text,
    minWidth: 50,
    textAlign: 'right',
  },
  frameTL: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
  },
  frameTR: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
  },
  frameBL: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
  },
  frameBR: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 40,
    height: 40,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.5)',
  },
});

export default ARHud;
