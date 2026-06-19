import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  useInterviewActivityTimeline,
  type InterviewActivityTimeRange,
} from '@shared/hooks/use-interview-activity-timeline';
import { useIsMobile } from '@shared/hooks/use-mobile';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@shared/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select';
import { Skeleton } from '@shared/ui/skeleton';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@shared/ui/toggle-group';

const chartConfig = {
  started: {
    label: 'Начато',
    color: 'var(--chart-activity-started)',
  },
  completed: {
    label: 'Завершено',
    color: 'var(--chart-activity-completed)',
  },
  abandoned: {
    label: 'Прервано',
    color: 'var(--chart-activity-abandoned)',
  },
} satisfies ChartConfig;

const rangeLabels: Record<InterviewActivityTimeRange, string> = {
  '7d': 'Последние 7 дней',
  '30d': 'Последние 30 дней',
  '90d': 'Последние 3 месяца',
};

function formatChartDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  });
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<InterviewActivityTimeRange>('90d');
  const { points, isLoading, isError } = useInterviewActivityTimeline(timeRange);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Активность интервью</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Начато, завершено и прервано — {rangeLabels[timeRange]}
          </span>
          <span className="@[540px]/card:hidden">{rangeLabels[timeRange]}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              const next = value[0];
              if (next === '7d' || next === '30d' || next === '90d') {
                setTimeRange(next);
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 месяца</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 дней</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 дней</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value === '7d' || value === '30d' || value === '90d') {
                setTimeRange(value);
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Выбор периода"
            >
              <SelectValue placeholder="3 месяца" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 месяца
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 дней
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 дней
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="aspect-auto h-[250px] w-full" />
        ) : (
          <>
            {isError && (
              <p className="mb-3 text-sm text-destructive">
                Не удалось загрузить данные. Показан пустой график.
              </p>
            )}
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={points}>
                <defs>
                  <linearGradient id="fillStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-started)"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-started)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillAbandoned" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-abandoned)"
                      stopOpacity={0.75}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-abandoned)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatChartDate}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => formatChartDate(String(value))}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="completed"
                  type="natural"
                  fill="url(#fillCompleted)"
                  stroke="var(--color-completed)"
                />
                <Area
                  dataKey="abandoned"
                  type="natural"
                  fill="url(#fillAbandoned)"
                  stroke="var(--color-abandoned)"
                />
                <Area
                  dataKey="started"
                  type="natural"
                  fill="url(#fillStarted)"
                  stroke="var(--color-started)"
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
