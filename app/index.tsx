import { ThemeProvider } from '@/lib/theme-context';
import { Text, View } from 'react-native';
import './global.css';
export default function Index() {
  return (
    <ThemeProvider defaultTheme="system">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <Text className="text-2xl font-bold text-foreground">
          NativeUI is working! 🎉
        </Text>
      </View>
    </ThemeProvider>
  );
}
