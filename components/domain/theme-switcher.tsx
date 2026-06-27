import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme-context';
import { View } from 'react-native';

type ThemeOption = 'light' | 'dark';

const options: { value: ThemeOption; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <View className="bg-card border border-border rounded-2xl p-4">
      <Text className="text-foreground text-base font-semibold mb-3">
        Appearance
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
