import TestService from '../services/TestService.js';
import TeamService from '../services/TeamService.js';
import SearchInput from '../components/SearchInput.jsx';
import useErrorHandler from '../helpers/errorHandler.js';
import MultiSelectDropdown from '../components/MultiSelectDropdown.jsx';
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
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { useSelector } from 'react-redux';

const TeamsScreen = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const handleError = useErrorHandler();
  const userPermissions = useSelector((state) => state.user.permissions || {});
  const [submitted, setSubmitted] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [changeDialog, setChangeDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const [selectTeamIndex, setSelectTeamIndex] = useState(null);
  const [selectTeam, setSelectTeam] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [tests, setTests] = useState([]);
  const [newTeam, setNewTeam] = useState({});
  const [teams, setTeams] = useState([]);

  const headers = [
    t('TEAMS.COLUMN.NAME'),
    t('TEAMS.COLUMN.MEMBERS'),
    t('TEAMS.COLUMN.LINK_IG'),
    { width: 70 },
  ];
  const keys = ['name', 'members', 'linkTg'];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const responseTests = await TestService.getList();
      setTests(responseTests.data || []);
      const responseTeam = await TeamService.getAll();
      const teamsData = responseTeam.data || [];
      setTeams(
        teamsData.reverse().map((team) => ({
          ...team,
          linkTg: team.linkTg || '------',
        }))
      );
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSubmitted(false);
    setSelectedTests([]);
    setNewTeam({});
    setCreateDialog(true);
  };

  const hideCreateModal = () => {
    setCreateDialog(false);
  };

  const createTeam = async () => {
    if (newTeam.name?.trim()) {
      try {
        setSendLoading(true);
        newTeam.tests = selectedTests;
        const response = await TeamService.create(newTeam);
        Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('TEAMS.CREATE_TEAM.SUCCESSFUL'));
        newTeam._id = response.data._id;
        newTeam.name = newTeam.name.toLowerCase();
        newTeam.members = 0;
        setTeams([newTeam, ...teams]);
        hideCreateModal();
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
    const data = { ...item };
    if (data.linkTg === '------') data.linkTg = '';
    setSubmitted(false);
    setSelectTeam(data);
    setSelectedTests(tests.filter((test) => data.tests.includes(test._id)).map((test) => test._id));
    setSelectTeamIndex(index);
    setChangeDialog(true);
  };

  const hideChangeModal = () => {
    setChangeDialog(false);
  };

  const changeTeam = async () => {
    if (selectTeam.name?.trim()) {
      try {
        setSendLoading(true);
        selectTeam.tests = selectedTests;
        await TeamService.update(selectTeam);
        Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('TEAMS.CHANGE_TEAM.SUCCESSFUL'));
        const data = { ...selectTeam };
        if (!data.linkTg) data.linkTg = '------';
        data.name = data.name.toLowerCase();
        const updatedTeams = [...teams];
        updatedTeams[selectTeamIndex] = data;
        setTeams(updatedTeams);
        hideChangeModal();
      } catch (e) {
        handleError(e);
      } finally {
        setSendLoading(false);
      }
    } else {
      setSubmitted(true);
    }
  };

  const openDeleteModal = (item, index) => {
    setSelectTeam(item);
    setSelectTeamIndex(index);
    setDeleteDialog(true);
  };

  const hideDeleteModal = () => {
    setDeleteDialog(false);
  };

  const deleteTeam = async () => {
    try {
      setSendLoading(true);
      await TeamService.delete({ team: selectTeam._id });
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('TEAMS.DELETE_TEAM.SUCCESSFUL'));
      const updatedTeams = [...teams];
      updatedTeams.splice(selectTeamIndex, 1);
      setTeams(updatedTeams);
      hideDeleteModal();
    } catch (e) {
      handleError(e);
    } finally {
      setSendLoading(false);
    }
  };

  const filteredTeams = teams.filter((item) =>
    item.name.toLowerCase().includes(filters.global.value.toLowerCase())
  );

  const columnWidths = getColumnWidths(filteredTeams, headers, keys);

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
        <Text style={styles.title(themeColors)}>{t('TEAMS.TABLE.TITLE')}</Text>
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
            data={filteredTeams}
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
                  {userPermissions.createTeam && (
                    <Button
                      buttonStyle={styles.buttonIcon(themeColors)}
                      onPress={() => openChangeModal(item, index)}
                      icon={{ name: 'edit', type: 'material', size: 16, color: 'white' }}
                    />
                  )}
                  {userPermissions.deleteTeam && (
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
              <Text style={styles.emptyMessage(themeColors)}>{t('TEAMS.TABLE.EMPTY')}</Text>
            }
          />
        </View>
      </ScrollView>

      <Modal visible={createDialog} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer(themeColors)}>
            <Text style={styles.modalTitle(themeColors)}>{t('TEAMS.CREATE_TEAM.HEADER')}</Text>
            <TextInput
              placeholder={t('TEAMS.CREATE_TEAM.NAME')}
              placeholderTextColor={themeColors.color7}
              value={newTeam.name}
              onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
              style={styles.input(themeColors)}
            />
            {submitted && !newTeam.name && (
              <Text style={styles.errorText}>{t('TEAMS.CREATE_TEAM.EMPTY_NAME')}</Text>
            )}
            <MultiSelectDropdown
              data={tests.map((item) => ({
                label: `${item.lang} - ${item.name}`,
                value: item._id,
              }))}
              placeholder={t('TEAMS.CREATE_TEAM.TEST.DROPDOWN')}
              value={selectedTests}
              onChange={setSelectedTests}
            />
            <TextInput
              placeholder={t('TEAMS.CREATE_TEAM.LINK_TG')}
              placeholderTextColor={themeColors.color7}
              value={newTeam.linkTg}
              onChangeText={(text) => setNewTeam({ ...newTeam, linkTg: text })}
              style={styles.input(themeColors)}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.CREATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={createTeam}
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
            <Text style={styles.modalTitle(themeColors)}>{t('TEAMS.CHANGE_TEAM.HEADER')}</Text>
            <TextInput
              placeholder={t('TEAMS.CHANGE_TEAM.NAME')}
              placeholderTextColor={themeColors.color7}
              value={selectTeam.name}
              onChangeText={(text) => setSelectTeam({ ...selectTeam, name: text })}
              style={styles.input(themeColors)}
            />
            {submitted && !newTeam.name && (
              <Text style={styles.errorText}>{t('TEAMS.CREATE_TEAM.EMPTY_NAME')}</Text>
            )}
            <MultiSelectDropdown
              data={tests.map((item) => ({
                label: `${item.lang} - ${item.name}`,
                value: item._id,
              }))}
              placeholder={t('TEAMS.CREATE_TEAM.TEST.DROPDOWN')}
              value={selectedTests}
              onChange={setSelectedTests}
            />
            <TextInput
              placeholder={t('TEAMS.CHANGE_TEAM.LINK_TG')}
              placeholderTextColor={themeColors.color7}
              value={selectTeam.linkTg}
              onChangeText={(text) => setSelectTeam({ ...selectTeam, linkTg: text })}
              style={styles.input(themeColors)}
            />
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.UPDATE')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={changeTeam}
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
            <Text style={styles.modalTitle(themeColors)}>{t('TEAMS.DELETE_TEAM.HEADER')}</Text>
            <Text style={styles.modalSubtitle(themeColors)}>
              {t('TEAMS.DELETE_TEAM.TEAM', { name: selectTeam.name })}
            </Text>
            <Button
              title={t('CONFIRM_MODAL.BUTTONS.YES')}
              buttonStyle={styles.button(themeColors.color3)}
              loading={sendLoading}
              onPress={deleteTeam}
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
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: themeColors.color8,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  headerCell: (themeColors) => ({
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: 'bold',
    color: themeColors.color5,
  }),
  row: (themeColors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  cell: (themeColors) => ({
    flex: 1,
    textAlign: 'center',
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

export default TeamsScreen;
