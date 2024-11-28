import React, { useRef } from 'react';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useNavigation, useRoute } from '@react-navigation/native';
import { handleLogout } from '../helpers/logoutHandler.js';
import { useThemeColors } from '../styles/themeColors.js';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';

const HeaderMenu = () => {
  const { t } = useTranslation();
  const menuRef = useRef();
  const route = useRoute();
  const navigation = useNavigation();
  const themeColors = useThemeColors();

  const openMenu = () => {
    if (menuRef.current) menuRef.current.open();
  };

  const userPermissions = useSelector((state) => state.user.permissions) || {};
  const isAuth = useSelector((state) => state.isAuth) || false;

  const menuItems = [
    {
      label: t('HEADER.MENU.HOME'),
      icon: 'home',
      screen: 'Home',
    },
    {
      label: t('HEADER.MENU.PROFILE'),
      icon: 'user',
      screen: 'Profile',
    },
    {
      label: t('HEADER.MENU.CHAT_GPT'),
      icon: 'wechat',
      screen: 'ChatGPT',
    },
    {
      permissions: ['assignRole', 'assignTeam', 'createUser', 'deleteUser'],
      label: t('HEADER.MENU.USERS'),
      icon: 'users',
      screen: 'Users',
    },
    {
      permissions: ['createTeam', 'deleteTeam'],
      label: t('HEADER.MENU.TEAMS'),
      icon: 'globe',
      screen: 'Teams',
    },
    {
      permissions: ['createRole', 'deleteRole'],
      label: t('HEADER.MENU.ROLES'),
      icon: 'shield',
      screen: 'Roles',
    },
    {
      separator: true,
    },
    {
      label: t('HEADER.MENU.LOG_OUT'),
      icon: 'sign-out',
      action: handleLogout,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.screen && item.screen === route.name) return false;
    if (!item?.permissions) return true;
    return item.permissions.some((perm) => userPermissions[perm]);
  });

  if (!isAuth) return null;

  return (
    <Menu ref={menuRef}>
      <MenuTrigger>
        <Button
          icon={{ name: 'menu', size: 25, color: themeColors.color5 }}
          buttonStyle={styles.menuButton}
          onPressIn={openMenu}
        />
      </MenuTrigger>
      <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer(themeColors) }}>
        {filteredMenuItems.map((item, index) =>
          item.separator ? (
            <View key={index} style={styles.separator(themeColors)} />
          ) : (
            <MenuOption
              key={index}
              onSelect={() => {
                if (item.action) {
                  item.action();
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <View style={styles.menuItem}>
                <View style={styles.menuItemIcon}>
                  <FontAwesome name={item.icon} size={20} color={themeColors.color5} />
                </View>
                <Text style={[styles.menuText, { color: themeColors.color5 }]}>{item.label}</Text>
              </View>
            </MenuOption>
          )
        )}
      </MenuOptions>
    </Menu>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    backgroundColor: 'transparent',
  },
  menuOptionsContainer: (themeColors) => ({
    marginTop: 50,
    alignSelf: 'flex-end',
    backgroundColor: themeColors.color2,
    borderColor: themeColors.color6,
    borderWidth: 1,
  }),
  separator: (themeColors) => ({
    height: 1,
    backgroundColor: themeColors.color6,
  }),
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  menuItemIcon: {
    width: 24,
    maxHeight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    paddingLeft: 10,
  },
});

export default HeaderMenu;
