import { useRTL } from '@/lib/i18n/RTLContext';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface BackIconProps {
  variant?: 'chevron' | 'arrow';
  size?: number;
  color?: string;
  className?: string;
}

export function BackIcon({ variant = 'chevron', size, color, className }: BackIconProps) {
  const { isRTL } = useRTL();

  if (variant === 'arrow') {
    const Icon = isRTL ? ArrowRight : ArrowLeft;
    return <Icon size={size} color={color} className={className} />;
  }

  const Icon = isRTL ? ChevronRight : ChevronLeft;
  return <Icon size={size} color={color} className={className} />;
}
