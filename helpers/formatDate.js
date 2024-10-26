const addZero = (num) => {
  return num >= 0 && num <= 9 ? '0' + num : num;
};

export const formatDate = (utc, delimiter = '.') => {
  const date = new Date(utc);
  return (
    addZero(date.getDate()) +
    delimiter +
    addZero(date.getMonth() + 1) +
    delimiter +
    date.getFullYear()
  );
};
