import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground text-lg">Search Screen</Text>
      </View>
    </SafeAreaView>
  );
}
