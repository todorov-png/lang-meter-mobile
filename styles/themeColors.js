import { useSelector } from 'react-redux';

const lightThemeColors = {
  color1: 'white',
  color2: '#f9f9f9',
  color3: '#007bff',
  color4: 'white',
  color5: 'black',
  color6: '#ddd',
  color7: '#6c757d',
  color8: '#f1f1f1',
  color9: '#999',
};

const darkThemeColors = {
  color1: 'black',
  color2: '#333',
  color3: '#0056b3',
  color4: 'white',
  color5: 'white',
  color6: '#555',
  color7: '#6c757d',
  color8: '#3a3a3a',
  color9: '#bbb',
};

export const useThemeColors = () => {
  const currentTheme = useSelector((state) => state.theme);
  return currentTheme === 'dark' ? darkThemeColors : lightThemeColors;
};
