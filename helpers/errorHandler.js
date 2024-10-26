import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

const useErrorHandler = () => {
  const { t } = useTranslation();

  const handleError = (e) => {
    let messageError = t('TOAST.DETAIL.SERVER_ERROR');
    if (e.response?.data?.message) {
      messageError = e.response.data.message;
    }
    Alert.alert(t('TOAST.SUMMARY.ERROR'), messageError);
  };

  return handleError;
};

export default useErrorHandler;
