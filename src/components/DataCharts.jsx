import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export function DataCharts({ speedHistory, newsArticles }) {
  // Process news data for pie chart
  const sourceDistribution = React.useMemo(() => {
    if (!newsArticles || newsArticles.length === 0) return [];
    
    const counts = {};
    newsArticles.forEach(article => {
      const source = article.source?.name || 'Unknown';
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 sources
  }, [newsArticles]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid md:grid-cols-2 gap-6 h-full">
      {/* Line Chart for ISS Speed */}
      <div className="flex flex-col h-full bg-background rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-4 text-center">ISS Speed (km/h) Trend</h3>
        <div className="flex-1 min-h-[200px]">
          {speedHistory && speedHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(val) => val.split(' ')[0]} // simplfy time
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  stroke="var(--muted-foreground)" 
                  fontSize={10}
                  tick={{ fill: 'currentColor' }}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Collecting speed data...
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart for News Distribution */}
      <div className="flex flex-col h-full bg-background rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-4 text-center">News by Source</h3>
        <div className="flex-1 min-h-[200px]">
          {sourceDistribution && sourceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              No news data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
