/**
 * Search Hooks
 * Manages search state, autocomplete, filters, and results
 */

import type {
    ProductSearchFilters,
    ProductSearchResponse,
    ProductSearchSuggestionResponse,
    SearchCategory,
    SearchFilterOptionsResponse
} from "@/lib/types";
import { searchService } from "@/shared/search.service";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for search autocomplete with debounce
 */
export function useSearchAutoComplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] =
    useState<ProductSearchSuggestionResponse>({
      products: [],
      sub_categories: [],
    });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Skip if query is empty or too short
    if (!query || query.trim().length < 2) {
      setSuggestions({ products: [], sub_categories: [] });
      setError(null);
      return;
    }

    // Set debounce timer for 200ms
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await searchService.getSuggestions(query.trim());
        setSuggestions(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch suggestions",
        );
        setSuggestions({ products: [], sub_categories: [] });
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
  };
}

/**
 * Hook for search results with pagination
 */
export function useSearchResults(initialFilters?: ProductSearchFilters) {
  const [filters, setFilters] = useState<ProductSearchFilters>(
    initialFilters || { q: "", page: 1, limit: 20 },
  );
  const [results, setResults] = useState<ProductSearchResponse>({
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    has_next_page: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(
    async (filtersToUse?: ProductSearchFilters) => {
      const searchFilters = filtersToUse || filters;
      setIsLoading(true);
      setError(null);
      try {
        const result = await searchService.searchProducts(searchFilters);
        setResults((prev) => {
          if ((searchFilters.page ?? 1) <= 1) return result;

          const seenIds = new Set(prev.items.map((item) => item.id));
          const newItems = result.items.filter((item) => !seenIds.has(item.id));

          return {
            ...result,
            items: [...prev.items, ...newItems],
            // If the "next page" came back with nothing genuinely new,
            // treat it as the end (guards against a backend that ignores
            // offset and just repeats page 1).
            has_next_page: newItems.length > 0 && result.has_next_page,
          };
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch search results",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchResults();
  }, [filters, fetchResults]);

  const updateFilters = useCallback(
    (newFilters: Partial<ProductSearchFilters>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1, // Reset to first page when filters change
      }));
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (results.has_next_page) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [results.has_next_page]);

  const clearFilters = useCallback(() => {
    setFilters({ q: "", page: 1, limit: 20 });
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.sub_category_id) count++;
    if (filters.min_price !== undefined || filters.max_price !== undefined)
      count++;
    if (filters.store_ids && filters.store_ids.length > 0) count++;
    if (filters.in_stock) count++;
    return count;
  }, [filters]);

  return {
    filters,
    results,
    isLoading,
    error,
    updateFilters,
    loadMore,
    clearFilters,
    getActiveFilterCount,
    fetchResults,
  };
}

/**
 * Hook for search filter options
 */
export function useSearchFilterOptions() {
  const [options, setOptions] = useState<SearchFilterOptionsResponse>({
    categories: [],
    stores: [],
    min_price: 0,
    max_price: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await searchService.getFilterOptions();
        setOptions(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch filter options",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const getCategoriesHierarchy = useCallback(() => {
    const hierarchy: SearchCategory[] = [];
    const byId = new Map<number, SearchCategory>();

    // First pass: create all categories
    options.categories.forEach((cat) => {
      byId.set(cat.id, { ...cat, subcategories: [] });
    });

    // Second pass: build hierarchy
    options.categories.forEach((cat) => {
      if (cat.parent_id === null) {
        hierarchy.push(byId.get(cat.id)!);
      } else {
        const parent = byId.get(cat.parent_id);
        if (parent) {
          if (!parent.subcategories) parent.subcategories = [];
          parent.subcategories.push(byId.get(cat.id)!);
        }
      }
    });

    return hierarchy;
  }, [options.categories]);

  return {
    options,
    isLoading,
    error,
    getCategoriesHierarchy,
  };
}

/**
 * Hook to find matching category by name
 */
export function useFindMatchingCategory() {
  const [matchingCategory, setMatchingCategory] =
    useState<SearchCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const findCategory = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setMatchingCategory(null);
      return null;
    }

    try {
      setIsLoading(true);
      const result = await searchService.findMatchingCategory(query);
      setMatchingCategory(result);
      return result;
    } catch (err) {
      setMatchingCategory(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    matchingCategory,
    isLoading,
    findCategory,
  };
}
