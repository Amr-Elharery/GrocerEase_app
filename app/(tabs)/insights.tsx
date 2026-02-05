import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalysisScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-4 py-6">
        <Text className="text-foreground text-2xl font-bold mb-4">
          Shopping Analysis
        </Text>
        <Text className="text-muted-foreground text-base">
          Track your spending, compare prices, and view insights about your
          shopping habits.
        </Text>
      </View>
    </SafeAreaView>
  );
}
