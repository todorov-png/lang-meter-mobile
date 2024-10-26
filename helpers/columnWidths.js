const calculateWidth = (text) => {
  const stringValue = JSON.stringify(text) || '';
  return stringValue.length * 8;
};

export const getColumnWidths = (data, headers, keys) => {
  const headerWidths = headers.map((header) => {
    if (typeof header === 'string') {
      return calculateWidth(header);
    } else if (typeof header === 'object' && header.width) {
      return header.width;
    }
    return 0;
  });

  const adjustedKeys = [...keys];
  while (adjustedKeys.length < headers.length) {
    adjustedKeys.push('');
  }

  const dataWidths = data.map((item) => {
    return adjustedKeys
      .map((key) => {
        return key.split('.').reduce((acc, part) => acc && acc[part], item) || '';
      })
      .map(calculateWidth);
  });

  return dataWidths.reduce((maxWidths, currentWidths) => {
    return maxWidths.map((maxWidth, index) => Math.max(maxWidth, currentWidths[index]));
  }, headerWidths);
};
