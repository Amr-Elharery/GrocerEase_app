import { setLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme-context';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  const { theme, setTheme, activeTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      className="bg-background"
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text className="text-foreground text-primary">{t('home.edit')}</Text>
      <Text className="text-2xl font-bold text-foreground">
        {t('home.status')}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
        <Pressable
          onPress={() => setLanguage('en')}
          className="border border-border bg-card rounded-lg px-4 py-2"
        >
          <Text className="text-card-foreground">{t('common.english')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setLanguage('ar')}
          className="border border-border bg-card rounded-lg px-4 py-2"
        >
          <Text className="text-card-foreground">{t('common.arabic')}</Text>
        </Pressable>
      </View>
      <View>
        <Pressable
          onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="mt-4 border border-border bg-card rounded-lg px-4 py-2"
        >
          <Text className="text-card-foreground">
            Toggle Theme | Now {theme}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
