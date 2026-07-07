import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <View className="bg-background px-4 py-6">
      <Text className="text-foreground text-2xl font-bold mb-2">
        {t('home.hero.title')}
      </Text>
      <Text className="text-muted-foreground text-sm leading-5">
        {t('home.hero.subtitle')}
      </Text>
    </View>
  );
}
