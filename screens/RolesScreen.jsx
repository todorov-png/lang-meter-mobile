import RoleService from '../services/RoleService';
import SearchInput from '../components/SearchInput.jsx';
import useErrorHandler from '../helpers/errorHandler.js';
import MultiSelectDropdown from '../components/MultiSelectDropdown.jsx';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Alert,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getColumnWidths } from '../helpers/columnWidths.js';
import { useThemeColors } from '../styles/themeColors.js';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';

const RoleScreen = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const handleError = useErrorHandler();
  const [role, setRole] = useState({ permissions: {} });
  const [roles, setRoles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRole, setSelectedRole] = useState({});
  const [createDialog, setCreateDialog] = useState(false);
  const [changeDialog, setChangeDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const userPermissions = useSelector((state) => state.user.permissions || {});

  const permissions = [
    'createTeam',
    'assignTeam',
    'deleteTeam',
    'createRole',
    'assignRole',
    'deleteRole',
    'createUser',
    'deleteUser',
    'assignTest',
  ];
  const headers = [
    t('ROLES.PERMISSIONS.NAME'),
    ...permissions.map((perm) =>
      t(`ROLES.PERMISSIONS.${perm.replace(/([A-Z])/g, '_$1').toUpperCase()}`)
    ),
    { width: 70 },
  ];
  const keys = ['name', ...permissions.map((perm) => `permissions.${perm}`)];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const response = await RoleService.getAll();
      const rolesData = response.data || [];
      setRoles(rolesData.reverse().map((role) => formattingRole(role)));
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const formattingRole = (role) => {
    const data = { _id: role._id, name: role.name.toLowerCase(), permissions: {} };
    const rolePermissions = role.permissions || {};
    permissions.forEach((perm) => {
      data.permissions[perm] = perm in rolePermissions ? rolePermissions[perm] : false;
    });
    return data;
  };

  const openCreateModal = () => {
    setRole({ permissions: {} });
    setSubmitted(false);
    setCreateDialog(true);
  };

  const hideCreateModal = () => {
    setCreateDialog(false);
  };

  const createRole = async () => {
    if (role.name?.trim()) {
      const data = { name: role.name.toLowerCase(), permissions: role.permissions || {} };
      try {
        setSendLoading(true);
        const response = await RoleService.create(data);
        Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('ROLES.CREATE_ROLE.SUCCESSFUL'));
        data._id = response.data._id;
        setRoles((prevRoles) => [formattingRole(data), ...prevRoles]);
        hideCreateModal();
        setRole({ permissions: {} });
      } catch (e) {
        handleError(e);
      } finally {
        setSendLoading(false);
      }
    } else {
      setSubmitted(true);
    }
  };

  const openChangeModal = (item, index) => {
    setChangeDialog(true);
    setSelectedRole(item);
    setSelectedRoleIndex(index);
  };

  const hideChangeModal = () => {
    setChangeDialog(false);
  };

  const updateRole = async () => {
    try {
      setSendLoading(true);
      const newDataFormat = {
        _id: selectedRole._id,
        name: selectedRole.name?.toLowerCase(),
        permissions: {},
      };
      permissions.forEach((item) => {
        if (selectedRole.permissions[item]) newDataFormat.permissions[item] = true;
      });
      await RoleService.update(newDataFormat);
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('ROLES.CHANGE_ROLE.SUCCESSFUL'));
      const updatedRoles = [...roles];
      updatedRoles[selectedRoleIndex] = selectedRole;
      setRoles(updatedRoles);
      hideChangeModal();
    } catch (e) {
      handleError(e);
    } finally {
      setSendLoading(false);
    }
  };

  const openDeleteModal = (item, index) => {
    setSelectedRoleIndex(index);
    setSelectedRole(item);
    setDeleteDialog(true);
  };

  const hideDeleteModal = () => {
    setDeleteDialog(false);
  };

  const deleteRole = async () => {
    try {
      setSendLoading(true);
      await RoleService.delete({ role: selectedRole._id });
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('ROLES.DELETE_ROLE.ONE'));
      const updatedRoles = roles.filter((_, index) => index !== selectedRoleIndex);
      setRoles(updatedRoles);
      hideDeleteModal();
    } catch (e) {
      handleError(e);
    } finally {
      setSendLoading(false);
    }
  };

  const filteredRoles = roles.filter((item) =>
    item.name.toLowerCase().includes(filters.global.value.toLowerCase())
  );

  const columnWidths = getColumnWidths(filteredRoles, headers, keys);

  if (loading) {
    return (
      <View style={styles.loaderContainer(themeColors)}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.header}>
        <Text style={styles.title(themeColors)}>{t('ROLES.TABLE.TITLE')}</Text>
        {userPermissions.createRole && (
          <Button
            onPress={openCreateModal}
            buttonStyle={styles.buttonIcon(themeColors)}
            icon={{ name: 'add', type: 'material', size: 24, color: 'white' }}
          />
        )}
      </View>
      <SearchInput
        value={filters.global.value}
        onChangeText={(text) => setFilters({ global: { value: text, matchMode: 'contains' } })}
      />
      <ScrollView horizontal>
        <View style={{ flex: 1 }}>
          <View style={styles.tableHeader(themeColors)}>
            {headers.map((header, index) => (
              <Text
                key={index}
                style={[styles.headerCell(themeColors), { width: columnWidths[index] }]}
              >
                {typeof header === 'string' ? header : ''}
              </Text>
            ))}
          </View>
          <FlatList
            data={filteredRoles}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.row(themeColors)}>
                {keys.map((key, indexCell) => {
                  const value = key.split('.').reduce((acc, part) => acc && acc[part], item);
                  let displayValue;
                  switch (typeof value) {
                    case 'boolean':
                      displayValue = String(value);
                      break;
                    case 'string':
                      displayValue = value;
                      break;
                    default:
                      displayValue = '';
                  }
                  return (
                    <Text
                      key={indexCell}
                      style={[styles.cell(themeColors), { width: columnWidths[indexCell] }]}
                    >
                      {displayValue}
                    </Text>
                  );
                })}
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {userPermissions.createRole && (
                    <Button
                      buttonStyle={styles.buttonIcon(themeColors)}
                      onPress={() => openChangeModal(item, index)}
                      icon={{ name: 'edit', type: 'material', size: 16, color: 'white' }}
                    />
                  )}
                  {userPermissions.deleteRole && (
                    <Button
                      buttonStyle={styles.buttonIcon(themeColors)}
                      onPress={() => openDeleteModal(item, index)}
                      icon={{ name: 'delete', type: 'material', size: 16, color: 'white' }}
                    />
                  )}
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyMessage(themeColors)}>{t('ROLES.TABLE.EMPTY')}</Text>
            }
          />
        </View>
      </ScrollView>

      <Modal visible={createDialog} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer(themeColors)}>
            <Text style={styles.modalTitle(themeColors)}>{t('ROLES.CREATE_ROLE.HEADER')}</Text>
            <TextInput
              placeholder={t('ROLES.CREATE_ROLE.NAME')}
              placeholderTextColor={themeColors.color7}
              value={role.name || ''}
              onChangeText={(text) => setRole({ ...role, name: text })}
              style={styles.input(themeColors)}
            />
            {submitted && !role.name && (
              <Text style={styles.errorText}>{t('ROLES.CREATE_ROLE.EMPTY_NAME')}</Text>
            )}
            <MultiSelectDropdown
              data={permissions.map((item) => ({
                label: t(`ROLES.PERMISSIONS.${item.replace(/([A-Z])/g, '_$1').toUpperCase()}`),
                value: item,
              }))}
              placeholder={t('ROLES.CREATE_ROLE.PERMISSIONS')}
              value={permissions.filter((permission) => role.permissions?.[permission])}
              onChange={(selectedItems) => {
                const createdRole = { ...role };
                permissions.forEach((permission) => {
                  createdRole.permissions[permission] = selectedItems.includes(permission);
                });
                setRole(createdRole);
              }}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.CREATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={createRole}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.CANCEL')}
              buttonStyle={styles.button(themeColors.color7)}
              onPress={hideCreateModal}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={changeDialog} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer(themeColors)}>
            <Text style={styles.modalTitle(themeColors)}>{t('ROLES.CHANGE_ROLE.HEADER')}</Text>
            <TextInput
              placeholder={t('ROLES.CHANGE_ROLE.NAME')}
              placeholderTextColor={themeColors.color7}
              value={selectedRole.name || ''}
              onChangeText={(text) => setSelectedRole({ ...selectedRole, name: text })}
              style={styles.input(themeColors)}
            />
            {submitted && !role.name && (
              <Text style={styles.errorText}>{t('ROLES.CHANGE_ROLE.EMPTY_NAME')}</Text>
            )}
            <MultiSelectDropdown
              data={permissions.map((item) => ({
                label: t(`ROLES.PERMISSIONS.${item.replace(/([A-Z])/g, '_$1').toUpperCase()}`),
                value: item,
              }))}
              placeholder={t('ROLES.CHANGE_ROLE.PERMISSIONS')}
              value={permissions.filter((permission) => selectedRole.permissions?.[permission])}
              onChange={(selectedItems) => {
                const updatedRole = { ...selectedRole };
                permissions.forEach((permission) => {
                  updatedRole.permissions[permission] = selectedItems.includes(permission);
                });
                setSelectedRole(updatedRole);
              }}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.UPDATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={updateRole}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.CANCEL')}
              buttonStyle={styles.button(themeColors.color7)}
              onPress={hideChangeModal}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={deleteDialog} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer(themeColors)}>
            <Text style={styles.modalTitle(themeColors)}>{t('ROLES.DELETE_ROLE.HEADER')}</Text>
            <Text style={styles.modalSubtitle(themeColors)}>
              {t('ROLES.DELETE_ROLE.ROLE', { name: selectedRole.name })}
            </Text>
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.YES')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={deleteRole}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.NO')}
              buttonStyle={styles.button(themeColors.color7)}
              onPress={hideDeleteModal}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    flex: 1,
    padding: 16,
    backgroundColor: themeColors.color1,
  }),
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: (themeColors) => ({
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColors.color5,
  }),
  buttonIcon: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingHorizontal: 2,
    aspectRatio: 1,
  }),
  tableHeader: (themeColors) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: themeColors.color8,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  headerCell: (themeColors) => ({
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 0,
    marginHorizontal: 4,
    color: themeColors.color5,
  }),
  row: (themeColors) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  cell: (themeColors) => ({
    textAlign: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 4,
    color: themeColors.color5,
  }),
  emptyMessage: (themeColors) => ({
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: themeColors.color9,
  }),
  loaderContainer: (themeColors) => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.color1,
  }),
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: (themeColors) => ({
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.color5,
  }),
  modalSubtitle: (themeColors) => ({
    fontSize: 16,
    color: themeColors.color5,
  }),
  modalContainer: (themeColors) => ({
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: themeColors.color2,
  }),
  input: (themeColors) => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    borderColor: themeColors.color6,
    color: themeColors.color5,
  }),
  button: (backgroundColor) => ({
    padding: 10,
    backgroundColor,
  }),
  errorText: {
    color: 'red',
  },
});

export default RoleScreen;
