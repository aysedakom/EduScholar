import { ArrowUpRight, BriefcaseBusiness, Clock3, HandCoins, WalletCards } from 'lucide-react';

type Tone = 'primary' | 'success' | 'warning' | 'info';

const iconMap = { primary: HandCoins, success: WalletCards, warning: Clock3, info: BriefcaseBusiness };

export function StatsCards() {
  const stats: { label: string; value: string; detail: string; tone: Tone }[] = [
    { label: 'Total Aid', value: '₱0', detail: '0 active grants', tone: 'primary' },
    { label: 'Pending Disbursements', value: '₱0', detail: '0 transactions pending', tone: 'warning' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
      {stats.map((stat) => {
        const Icon = iconMap[stat.tone];
        return (
          <div key={stat.label} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <div
                className={`rounded-xl p-2.5 ${
                  stat.tone === 'primary'
                    ? 'bg-blue-50 text-primary'
                    : stat.tone === 'success'
                    ? 'bg-green-50 text-success'
                    : stat.tone === 'warning'
                    ? 'bg-amber-50 text-warning'
                    : 'bg-sky-50 text-info'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
