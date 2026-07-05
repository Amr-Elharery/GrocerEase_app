import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type ThemeOption = 'light' | 'dark';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const options: { value: ThemeOption; label: string }[] = [
    { value: 'light', label: t('theme.light') },
    { value: 'dark', label: t('theme.dark') },
  ];

  return (
    <View className="bg-card border border-border rounded-2xl p-4">
      <Text className="text-foreground text-base font-semibold mb-3">
        {t('theme.appearance')}
      </Text>

      <View className="flex-row gap-2">
        {options.map((option) => {
          const isActive = theme === option.value;

          return (
            <Button
              key={option.value}
              onPress={() => setTheme(option.value)}
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

export default ThemeSwitcher;
