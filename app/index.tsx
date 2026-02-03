import { setLanguage } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  const { t } = useTranslation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>{t('home.edit')}</Text>
      <Text className="text-2xl font-bold text-foreground">
        {t('home.status')}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
        <Pressable
          onPress={() => setLanguage('en')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text>{t('common.english')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setLanguage('ar')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderRadius: 8,
          }}
        >
          <Text>{t('common.arabic')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
