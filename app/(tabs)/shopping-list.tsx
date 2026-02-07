import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShoppingListScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
          <Text className="text-foreground text-2xl font-bold">
            Shopping Lists
          </Text>
          <Pressable className="bg-primary rounded-full p-2">
            <Plus size={24} className="text-primary-foreground" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-6">
          <Text className="text-muted-foreground text-base text-center">
            No shopping lists yet. Create your first list to get started!
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
