import { ChevronDown, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SearchBar } from '../search-bar';

type SearchMode = 'product' | 'store';

interface HeaderProps {
  zone?: string;
  onZonePress?: () => void;
  onSearch?: (query: string, mode: SearchMode) => void;
}

export function Header({ zone = 'Cairo', onZonePress, onSearch }: HeaderProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>('product');

  const handleSearch = (query: string) => {
    onSearch?.(query, searchMode);
  };

  return (
    <View className="bg-background border-b border-border px-4 py-3">
      {/* Top Row: Zone */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable onPress={onZonePress} className="flex-row items-center">
          <MapPin size={20} className="text-primary mr-1" />
          <Text className="text-foreground font-semibold text-base">
            {zone}
          </Text>
          <ChevronDown size={16} className="text-muted-foreground ml-1" />
        </Pressable>
      </View>

      {/* Bottom Row: Search + Toggle */}
      <View className="flex-row items-center gap-2">
        <View className="flex-1">
          <SearchBar
            placeholder={`Search ${searchMode}s...`}
            onSearch={handleSearch}
          />
        </View>

        {/* Toggle Switch */}
        <View className="flex-row bg-muted border border-border rounded-lg p-1">
          <Pressable
            onPress={() => setSearchMode('product')}
            className={`px-3 py-1.5 rounded ${
              searchMode === 'product' ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                searchMode === 'product'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Product
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSearchMode('store')}
            className={`px-3 py-1.5 rounded ${
              searchMode === 'store' ? 'bg-primary' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                searchMode === 'store'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Store
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
