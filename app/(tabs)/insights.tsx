import { useTheme } from '@/lib/theme-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const weeklyExpenses = [
  { label: 'Week 1', total: 760 },
  { label: 'Week 2', total: 920 },
  { label: 'Week 3', total: 1000 },
  { label: 'Week 4', total: 1100 },
];

const lastMonthTotal = 3700;

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

export default function InsightsScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const chartColor = theme === 'dark' ? '#F5F5F5' : '#111111';
  const axisColor = theme === 'dark' ? '#6B7280' : '#9CA3AF';

  const chartData = useMemo(
    () =>
      weeklyExpenses.map((item) => ({
        value: item.total,
        label: item.label.replace('Week ', 'W'),
        frontColor: chartColor,
      })),
    [chartColor],
  );

  const chartMaxValue = useMemo(
    () => Math.max(...weeklyExpenses.map((item) => item.total)),
    [],
  );

  const currentWeekTotal = weeklyExpenses[weeklyExpenses.length - 1].total;
  const lastWeekTotal = weeklyExpenses[weeklyExpenses.length - 2].total;
  const weekDelta = currentWeekTotal - lastWeekTotal;
  const weekDeltaPct = Math.round((weekDelta / lastWeekTotal) * 100);

  const currentMonthTotal = weeklyExpenses.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const monthDelta = currentMonthTotal - lastMonthTotal;
  const monthDeltaPct = Math.round((monthDelta / lastMonthTotal) * 100);

  const advice = useMemo(() => {
    if (weekDeltaPct > 0 && monthDeltaPct > 0) {
      return {
        title: 'Spending is trending up',
        body: 'Your weekly and monthly totals increased. Consider setting a weekly cap and reviewing the last week for avoidable items.',
      };
    }

    if (weekDeltaPct < 0 && monthDeltaPct > 0) {
      return {
        title: 'Weekly drop, monthly still high',
        body: 'Last week improved, but the month is still above last month. Keep the momentum and target your biggest categories.',
      };
    }

    if (weekDeltaPct > 0 && monthDeltaPct <= 0) {
      return {
        title: 'Watch this week',
        body: 'This week went up while the month is stable or lower. Try a midweek check to stay within your monthly goal.',
      };
    }

    return {
      title: 'Spending is stabilizing',
      body: 'Both week and month are down or flat. Keep tracking your essentials and repeat what worked this month.',
    };
  }, [weekDeltaPct, monthDeltaPct]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        <View className="flex-row items-center gap-3 py-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted"
          >
            <ChevronLeft size={22} className="text-foreground" />
          </Pressable>
          <Text className="text-foreground text-2xl font-bold">Insights</Text>
        </View>

        <View className="bg-card border border-border rounded-2xl p-4 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-1">
            Expenses over the last 4 weeks
          </Text>
          <Text className="text-muted-foreground text-sm mb-4">
            Tracking weekly totals from Order Service.
          </Text>

          <View className="mt-2 flex flex-1 items-center justify-center">
            <BarChart
              data={chartData}
              barWidth={30}
              spacing={22}
              barBorderRadius={6}
              maxValue={chartMaxValue}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={axisColor}
              yAxisTextStyle={{ color: axisColor, fontSize: 12 }}
              xAxisLabelTextStyle={{ color: axisColor, fontSize: 12 }}
              isAnimated
              animationDuration={700}
            />
          </View>
        </View>

        <View className="bg-card border border-border rounded-2xl p-4 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-4">
            Week & month comparison
          </Text>

          <View className="mb-4">
            <Text className="text-muted-foreground text-sm">Current week</Text>
            <Text className="text-foreground text-base font-semibold">
              {formatNumber(currentWeekTotal)}
            </Text>
            <Text className="text-muted-foreground text-sm mt-2">
              Last week
            </Text>
            <Text className="text-foreground text-base font-semibold">
              {formatNumber(lastWeekTotal)}
            </Text>
            <Text className="text-primary text-sm font-semibold mt-2">
              {weekDelta >= 0 ? '+' : ''}
              {formatNumber(weekDelta)} ({weekDeltaPct >= 0 ? '+' : ''}
              {weekDeltaPct}%)
            </Text>
          </View>

          <View>
            <Text className="text-muted-foreground text-sm">Current month</Text>
            <Text className="text-foreground text-base font-semibold">
              {formatNumber(currentMonthTotal)}
            </Text>
            <Text className="text-muted-foreground text-sm mt-2">
              Last month
            </Text>
            <Text className="text-foreground text-base font-semibold">
              {formatNumber(lastMonthTotal)}
            </Text>
            <Text className="text-primary text-sm font-semibold mt-2">
              {monthDelta >= 0 ? '+' : ''}
              {formatNumber(monthDelta)} ({monthDeltaPct >= 0 ? '+' : ''}
              {monthDeltaPct}%)
            </Text>
          </View>
        </View>

        <View className="bg-card border border-border rounded-2xl p-4">
          <Text className="text-foreground text-lg font-semibold mb-2">
            Personalized Advice
          </Text>
          <Text className="text-foreground text-base font-semibold mb-1">
            {advice.title}
          </Text>
          <Text className="text-muted-foreground text-sm">{advice.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
