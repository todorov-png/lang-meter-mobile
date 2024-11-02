import React, { useRef, useState } from 'react';
import GPTService from '../services/GPTService.js';
import { Text, View, TextInput, StyleSheet, FlatList } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';

const ChatGPTScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const flatListRef = useRef(null);

  const addMessage = (newMessage, sender) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, { text: newMessage, sender }];
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
      return updatedMessages;
    });
  };

  const sendMessage = async () => {
    if (!message) return;
    try {
      setLoading(true);
      const answer = await GPTService.sendMessage({ text: message });
      addMessage(message, 'user');
      setMessage('');
      addMessage(answer.data || t('TOAST.DETAIL.SERVER_ERROR'), 'gpt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.header}>
        <Text style={styles.title(themeColors)}>{t('CHAT_GPT.TITLE')}</Text>
        <Button
          onPress={() => navigation.navigate('Home')}
          buttonStyle={styles.button(themeColors)}
          icon={{ name: 'home', type: 'material', size: 24, color: 'white' }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={messages}
          ref={flatListRef}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message(themeColors),
                item.sender === 'user' ? styles.userMessage : styles.gptMessage,
              ]}
            >
              <Text style={styles.messageText(themeColors)}>{item.text}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyMessage(themeColors)}>{t('CHAT_GPT.EMPTY')}</Text>
          }
        />
      </View>
      <View style={styles.messageForm}>
        <TextInput
          style={styles.input(themeColors)}
          placeholder={t('CHAT_GPT.MESSAGE')}
          placeholderTextColor={themeColors.color7}
          value={message}
          onChangeText={setMessage}
        />
        <Button
          icon={{ name: 'send', type: 'material', size: 22, color: themeColors.color4 }}
          onPress={sendMessage}
          loading={loading}
          buttonStyle={styles.button(themeColors.color3)}
        />
      </View>
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
  input: (themeColors) => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    borderColor: themeColors.color6,
    color: themeColors.color5,
    flex: 1,
    marginRight: 8,
  }),
  button: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingHorizontal: 2,
    aspectRatio: 1,
  }),
  emptyMessage: (themeColors) => ({
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: themeColors.color9,
  }),
  message: (themeColors) => ({
    backgroundColor: themeColors.color6,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '75%',
  }),
  messageText: (themeColors) => ({
    color: themeColors.color5,
    fontSize: 14,
  }),
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  gptMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
});

export default ChatGPTScreen;
