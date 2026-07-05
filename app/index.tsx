import { useAuth } from '@/lib/auth-context';
import { useAddress } from '@/lib/context/addressContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { isLoading, isLoggedIn, user } = useAuth();
  const {
    addresses,
    isLoading: addressesLoading,
    selectedAddressId,
    selectAddress,
  } = useAddress();

  useEffect(() => {
    if (isLoading) return;

    if (!isLoggedIn) {
      router.replace('/welcome');
      return;
    }

    if (user?.role === 'delivery') {
      router.replace('/driver');
      return;
    }

    if (addressesLoading) return;

    if (addresses.length === 0) {
      router.replace('/location-permission');
      return;
    }

    if (!selectedAddressId) {
      const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
      if (preferred?.id) selectAddress(preferred.id);
    }

    router.replace('./(tabs)/');
  }, [
    isLoading,
    isLoggedIn,
    user,
    addresses,
    addressesLoading,
    selectedAddressId,
    selectAddress,
    router,
  ]);

  return null;
}
