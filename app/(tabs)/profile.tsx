import { ThemeSwitcher } from '@/components/domain/theme-switcher';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <View className="py-4">
          <Text className="text-foreground text-2xl font-bold">Profile</Text>
          <Text className="text-muted-foreground text-sm mt-1">
            Manage your account preferences.
          </Text>
        </View>

        <ThemeSwitcher />
      </ScrollView>
    </SafeAreaView>
  );
}
