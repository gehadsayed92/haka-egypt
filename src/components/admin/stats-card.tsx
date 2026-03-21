import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="flex items-center gap-4">
        <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-0.5">{trend}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
