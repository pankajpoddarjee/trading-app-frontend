import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface ChartComponentProps {
  data: any[];
  symbol: string;
  loading: boolean;
  error: string | null;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, symbol, loading, error }) => {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-error">{error}</div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-error">No chart data available</div>
      </div>
    );
  }

  // ✅ Format data
  const chartData = data
    .filter((item: any) => item && item.close !== null && item.close !== undefined)
    .map((item: any) => ({
      time: item.time ? new Date(item.time).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'N/A',
      price: Number(item.close) || Number(item.price) || 0,
      high: Number(item.high) || 0,
      low: Number(item.low) || 0,
      open: Number(item.open) || 0,
      volume: Number(item.volume) || 0,
    }))
    .filter((item: any) => item.price > 0);

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-error">No valid price data</div>
      </div>
    );
  }

  // ✅ Calculate colors based on price change
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;

  // ✅ Colors
  const colors = {
    line: isPositive ? '#22c55e' : '#ef4444',
    gradient: isPositive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
    gradientEnd: isPositive ? 'rgba(34,197,94,0)' : 'rgba(239,68,68,0)',
    dot: isPositive ? '#22c55e' : '#ef4444',
    text: isPositive ? '#22c55e' : '#ef4444',
  };

  const prices = chartData.map((d: any) => d.price);
  const minPrice = Math.max(0, Math.min(...prices) - 5);
  const maxPrice = Math.max(...prices) + 5;

  // ✅ Custom Tooltip with Green/Red
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value || 0;
      const isPositiveTooltip = value >= (chartData[0]?.price || 0);
      
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-time">{label}</p>
          <p 
            className="chart-tooltip-price"
            style={{ color: isPositiveTooltip ? '#22c55e' : '#ef4444' }}
          >
            ₹{value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h4 className="chart-title">
        {symbol} - Price Chart
        <span 
          className="chart-change"
          style={{ 
            color: isPositive ? '#22c55e' : '#ef4444',
            marginLeft: '12px',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}
          {((lastPrice - firstPrice) / firstPrice * 100).toFixed(2)}%
        </span>
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.line} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.line} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#6c757d', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            tick={{ fill: '#6c757d', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.05)' }}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.line}
            strokeWidth={2}
            fill="url(#chartGradient)"
            activeDot={{ r: 6, fill: colors.dot }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Mini stats */}
      <div className="chart-stats">
        <div className="chart-stat">
          <span className="chart-stat-label">Open</span>
          <span className="chart-stat-value">₹{chartData[0]?.price?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="chart-stat">
          <span className="chart-stat-label">High</span>
          <span className="chart-stat-value" style={{ color: '#22c55e' }}>
            ₹{Math.max(...prices).toFixed(2)}
          </span>
        </div>
        <div className="chart-stat">
          <span className="chart-stat-label">Low</span>
          <span className="chart-stat-value" style={{ color: '#ef4444' }}>
            ₹{Math.min(...prices).toFixed(2)}
          </span>
        </div>
        <div className="chart-stat">
          <span className="chart-stat-label">Close</span>
          <span 
            className="chart-stat-value"
            style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
          >
            ₹{chartData[chartData.length - 1]?.price?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;