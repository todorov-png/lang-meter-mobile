import React from 'react';
import NotTeam from '../components/NotTeam.jsx';
import TestList from '../components/TestList.jsx';
import NotActivated from '../components/NotActivated.jsx';
import { useSelector } from 'react-redux';

const HomeScreen = () => {
  const selectUserIsActivated = (state) => state.user.isActivated;
  const selectUserIsTeam = (state) => state.user.isTeam;

  const userIsActivated = useSelector(selectUserIsActivated) || false;
  const userIsTeam = useSelector(selectUserIsTeam) || false;

  if (!userIsActivated) {
    return <NotActivated />;
  } else if (!userIsTeam) {
    return <NotTeam />;
  } else {
    return <TestList />;
  }
};

export default HomeScreen;
