import TheLoader from './components/TheLoader.jsx';
import { store, initializeSettings } from './store/index.js';
import { MenuProvider } from 'react-native-popup-menu';
import { Navigation } from './screens/Navigations.jsx';
import { i18n, initializeI18n } from './i18n/index.js';
import { I18nextProvider } from 'react-i18next';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      await initializeI18n();
      setIsInitialized(true);
      store.dispatch(initializeSettings());
    })();
  }, []);

  if (!isInitialized) return <TheLoader text="Loading..." />;

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MenuProvider>
          <StatusBar />
          <TheLoader isOverlay={true} />
          <Navigation />
        </MenuProvider>
      </I18nextProvider>
    </Provider>
  );
}

