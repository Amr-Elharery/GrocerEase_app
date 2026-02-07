import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
 useEffect(() => {
  const timer = setTimeout(() => {
    router.replace("/(tabs)/home");
  }, 50); // 50ms delay

  return () => clearTimeout(timer);
}, [router]);

}
