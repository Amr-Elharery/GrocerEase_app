import { useRTL } from '@/lib/i18n/RTLContext';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  placeholder,
  onSearch,
  onClear,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const { isRTL } = useRTL();
  const { t } = useTranslation();

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <View className={isRTL ? "flex-row-reverse items-center bg-muted border border-border rounded-lg px-3 py-2" : "flex-row items-center bg-muted border border-border rounded-lg px-3 py-2"}>
      <Search size={20} className={isRTL ? "text-muted-foreground ml-2" : "text-muted-foreground mr-2"} />
      <TextInput
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder ?? t('common.searchEllipsis')}
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
