import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { setLanguage } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type LanguageOption = 'en' | 'ar';

export function LanguageSwitcher() {
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language;

  const options: { value: LanguageOption; label: string }[] = [
    { value: 'en', label: t('common.english') },
    { value: 'ar', label: t('common.arabic') },
  ];

  return (
    <View className="bg-card border border-border rounded-2xl p-4">
      <Text className="text-foreground text-base font-semibold mb-3">
        {t('common.language')}
      </Text>

      <View className="flex-row gap-2">
        {options.map((option) => {
          const isActive = currentLanguage === option.value;

          return (
            <Button
              key={option.value}
              onPress={() => setLanguage(option.value)}
              variant={isActive ? 'default' : 'outline'}
              className={[
                'flex-1 rounded-xl',
                isActive ? 'border border-primary' : 'border-border',
              ].join(' ')}
            >
              <Text className="text-sm font-semibold">{option.label}</Text>
            </Button>
          );
        })}
      </View>
    </View>
  );
}

export default LanguageSwitcher;
