import React from 'react';
import TeamSvg from '../assets/img/svg/team.svg';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { ADMIN_TG } from '@env';

const NotTeam = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  const openTgAdmin = () => {
    if (ADMIN_TG) {
      Linking.openURL(ADMIN_TG).catch((err) => console.error("Couldn't load page", err));
    } else {
      console.error('URL для администратора не настроен');
    }
  };

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.card(themeColors)}>
        <TeamSvg style={styles.image} />
        <Text style={styles.title(themeColors)}>{t('NOT_TEAM.TITLE')}</Text>
        <Text style={styles.content(themeColors)}>{t('NOT_TEAM.CONTENT')}</Text>
        <Button
          title={t('NOT_TEAM.BUTTON')}
          icon={{ name: 'group', type: 'material', size: 22, color: themeColors.color4 }}
          onPress={openTgAdmin}
          buttonStyle={styles.button(themeColors)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: themeColors.color1,
  }),
  card: (themeColors) => ({
    width: '90%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    backgroundColor: themeColors.color2,
    alignItems: 'center',
  }),
  image: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  title: (themeColors) => ({
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: themeColors.color5,
  }),
  content: (themeColors) => ({
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: themeColors.color5,
  }),
  button: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  }),
});

export default NotTeam;
