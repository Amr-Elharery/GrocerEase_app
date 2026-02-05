import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onClear,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <View className="flex-row items-center bg-muted border border-border rounded-lg px-3 py-2">
      <Search size={20} className="text-muted-foreground mr-2" />
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        placeholderTextColor="rgb(115 115 115)"
        className="flex-1 text-foreground"
      />
      {query.length > 0 && (
        <Pressable onPress={handleClear}>
          <X size={20} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}
