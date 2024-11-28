import UserService from '../services/UserService';
import RoleService from '../services/RoleService';
import TeamService from '../services/TeamService';
import SearchInput from '../components/SearchInput.jsx';
import useErrorHandler from '../helpers/errorHandler.js';
import PasswordInput from '../components/PasswordInput.jsx';
import SelectDropdown from '../components/SelectDropdown.jsx';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getColumnWidths } from '../helpers/columnWidths.js';
import { useThemeColors } from '../styles/themeColors.js';
import { formatDate } from '../helpers/formatDate.js';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';

const UserScreen = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const handleError = useErrorHandler();
  const plug = { name: '------', _id: null };
  const userPermissions = useSelector((state) => state.user.permissions || {});
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedRole, setSelectedRole] = useState({});
  const [selectedTeam, setSelectedTeam] = useState({});
  const [createDialog, setCreateDialog] = useState(false);
  const [changeDialog, setChangeDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [roles, setRoles] = useState([plug]);
  const [teams, setTeams] = useState([plug]);
  const headers = [
    t('USERS.COLUMN.USERNAME'),
    t('USERS.COLUMN.EMAIL'),
    t('USERS.COLUMN.DATE_REGISTRATION'),
    t('USERS.COLUMN.DATE_ACTIVATION'),
    t('USERS.COLUMN.ROLE'),
    t('USERS.COLUMN.TEAM'),
    { width: 70 },
  ];
  const keys = [
    'username',
    'email',
    'registrationDate',
    'activationDate',
    'role.name',
    'team.name',
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      if (userPermissions.assignRole) {
        const responseRoles = await RoleService.getList();
        setRoles((prevRoles) => [...prevRoles, ...(responseRoles.data || [])]);
      }
      if (userPermissions.assignTeam) {
        const responseTeams = await TeamService.getList();
        setTeams((prevTeams) => [...prevTeams, ...(responseTeams.data || [])]);
      }
      const responseUsers = await UserService.getAll();
      const fetchedUsers = responseUsers.data || [];
      setUsers(fetchedUsers.reverse().map((u) => formattingUser(u)));
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const formattingUser = (user) => {
    user.registrationDate = user.registrationDate ? formatDate(user.registrationDate) : '------';
    user.activationDate = user.activationDate ? formatDate(user.activationDate) : '------';
    user.role = user.role || plug;
    user.team = user.team || plug;
    return user;
  };

  const openCreateModal = () => {
    setUser({});
    setSelectedRole(roles[0]);
    setSelectedTeam(teams[0]);
    setSubmitted(false);
    setCreateDialog(true);
  };

  const hideCreateModal = () => {
    setCreateDialog(false);
  };

  const createUser = async () => {
    if (user.username?.trim() && user.email?.trim() && user.password?.trim()) {
      setSendLoading(true);
      const data = {
        username: user.username.toLowerCase(),
        email: user.email.toLowerCase(),
        password: user.password,
        role: selectedRole._id,
        team: selectedTeam._id,
      };
      try {
        const response = await UserService.create(data);
        Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('USERS.CREATE_USER.SUCCESSFUL'));
        setUsers((prevUsers) => [
          formattingUser({
            _id: response.data._id,
            username: data.username,
            email: data.email,
            activationDate: response.data.date,
            registrationDate: response.data.date,
            role: selectedRole,
            team: selectedTeam,
          }),
          ...prevUsers,
        ]);
        hideCreateModal();
        setUser({});
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
    setSelectedUser(item);
    setSelectedUserIndex(index);
    setSelectedRole(item.role);
    setSelectedTeam(item.team);
  };

  const hideChangeModal = () => {
    setChangeDialog(false);
  };

  const updateUser = async () => {
    setSendLoading(true);
    const data = {
      userId: selectedUser._id,
      roleId: selectedRole._id,
      teamId: selectedTeam._id,
    };
    try {
      await UserService.update(data);
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('USERS.CHANGE_USER.SUCCESSFUL'));
      const updatedUsers = [...users];
      updatedUsers[selectedUserIndex].role = selectedRole;
      updatedUsers[selectedUserIndex].team = selectedTeam;
      setUsers(updatedUsers);
      hideChangeModal();
    } catch (e) {
      handleError(e);
    } finally {
      setSendLoading(false);
    }
  };

  const openDeleteModal = (item, index) => {
    setSelectedUserIndex(index);
    setSelectedUser(item);
    setDeleteDialog(true);
  };

  const hideDeleteModal = () => {
    setDeleteDialog(false);
  };

  const deleteUser = async () => {
    try {
      setSendLoading(true);
      await UserService.delete({ user: selectedUser._id });
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('USERS.DELETE_USER.SUCCESSFUL'));
      const updatedUsers = users.filter((_, index) => index !== selectedUserIndex);
      setUsers(updatedUsers);
      hideDeleteModal();
    } catch (e) {
      handleError(e);
    } finally {
      setSendLoading(false);
    }
  };

  const filteredUsers = users.filter((item) =>
    item.username.toLowerCase().includes(filters.global.value.toLowerCase())
  );

  const columnWidths = getColumnWidths(filteredUsers, headers, keys);

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
        <Text style={styles.title(themeColors)}>{t('USERS.TABLE.TITLE')}</Text>
        <Button
          onPress={openCreateModal}
          buttonStyle={styles.buttonIcon(themeColors)}
          icon={{ name: 'add', type: 'material', size: 24, color: 'white' }}
        />
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
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <View style={styles.row(themeColors)}>
                {keys.map((key, indexCell) => {
                  const value = key.split('.').reduce((acc, part) => acc && acc[part], item);
                  return (
                    <Text
                      key={indexCell}
                      style={[styles.cell(themeColors), { width: columnWidths[indexCell] }]}
                    >
                      {value}
                    </Text>
                  );
                })}
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {(userPermissions.assignRole || userPermissions.assignTeam) && (
                    <Button
                      buttonStyle={styles.buttonIcon(themeColors)}
                      onPress={() => openChangeModal(item, index)}
                      icon={{ name: 'edit', type: 'material', size: 16, color: 'white' }}
                    />
                  )}
                  {userPermissions.deleteUser && (
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
              <Text style={styles.emptyMessage(themeColors)}>{t('USERS.TABLE.EMPTY')}</Text>
            }
          />
        </View>
      </ScrollView>

      <Modal visible={createDialog} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer(themeColors)}>
            <Text style={styles.modalTitle(themeColors)}>{t('USERS.CREATE_USER.HEADER')}</Text>
            <TextInput
              placeholder={t('USERS.CREATE_USER.USERNAME')}
              placeholderTextColor={themeColors.color7}
              value={user.username}
              onChangeText={(text) => setUser({ ...user, username: text })}
              style={styles.input(themeColors)}
            />
            {submitted && !user.username && (
              <Text style={styles.errorText}>{t('USERS.CREATE_USER.EMPTY_USERNAME')}</Text>
            )}
            <TextInput
              style={styles.input(themeColors)}
              placeholder={t('USERS.CREATE_USER.EMAIL')}
              placeholderTextColor={themeColors.color7}
              value={user.email}
              onChangeText={(text) => setUser({ ...user, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {submitted && !user.email && (
              <Text style={styles.errorText}>{t('USERS.CREATE_USER.EMPTY_EMAIL')}</Text>
            )}
            <PasswordInput
              placeholder={t('USERS.CREATE_USER.PASSWORD')}
              placeholderTextColor={themeColors.color7}
              value={user.password}
              onChangeText={(text) => setUser({ ...user, password: text })}
            />
            {submitted && !user.password && (
              <Text style={styles.errorText}>{t('USERS.CREATE_USER.EMPTY_PASSWORD')}</Text>
            )}
            {userPermissions.assignRole && (
              <SelectDropdown
                data={roles.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
                placeholder={t('USERS.CREATE_USER.ROLE.DROPDOWN')}
                value={selectedRole._id}
                onChange={({ value }) =>
                  setSelectedRole(roles.find((role) => role._id === value) || plug)
                }
              />
            )}
            {userPermissions.assignTeam && (
              <SelectDropdown
                data={teams.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
                placeholder={t('USERS.CREATE_USER.TEAM.DROPDOWN')}
                value={selectedTeam._id}
                onChange={({ value }) =>
                  setSelectedTeam(teams.find((team) => team._id === value) || plug)
                }
              />
            )}
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.CREATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={createUser}
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
            <Text style={styles.modalTitle(themeColors)}>{t('USERS.CHANGE_USER.HEADER')}</Text>
            <TextInput
              placeholder={t('USERS.CHANGE_USER.USERNAME')}
              placeholderTextColor={themeColors.color7}
              value={selectedUser.username}
              style={styles.input(themeColors)}
              disabled
            />
            <TextInput
              style={styles.input(themeColors)}
              placeholder={t('USERS.CHANGE_USER.EMAIL')}
              placeholderTextColor={themeColors.color7}
              value={selectedUser.email}
              keyboardType="email-address"
              autoCapitalize="none"
              disabled
            />
            {userPermissions.assignRole && (
              <SelectDropdown
                data={roles.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
                placeholder={t('USERS.CHANGE_USER.ROLE.DROPDOWN')}
                value={selectedRole._id}
                onChange={({ value }) =>
                  setSelectedRole(roles.find((role) => role._id === value) || plug)
                }
              />
            )}
            {userPermissions.assignTeam && (
              <SelectDropdown
                data={teams.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
                placeholder={t('USERS.CHANGE_USER.TEAM.DROPDOWN')}
                value={selectedTeam._id}
                onChange={({ value }) =>
                  setSelectedTeam(teams.find((team) => team._id === value) || plug)
                }
              />
            )}
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.UPDATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={updateUser}
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
            <Text style={styles.modalTitle(themeColors)}>{t('USERS.DELETE_USER.HEADER')}</Text>
            <Text style={styles.modalSubtitle(themeColors)}>
              {t('USERS.DELETE_USER.USER', { name: selectedUser.username })}
            </Text>
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.YES')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={deleteUser}
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
    height: 42,
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

export default UserScreen;
