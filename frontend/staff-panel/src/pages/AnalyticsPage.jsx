import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import { useApp } from '../context/AppContext';
import { fetchAnalytics } from '../services/api';
import { fmtDuration } from '../utils/managerUtils.jsx';

function StatCard({ label, value, sub }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const staff = useApp((s) => s.staff);
  const branchId = staff?.branch_id;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!branchId) return () => {};

    setLoading(true);
    setError('');

    (async () => {
      try {
        const resp = await fetchAnalytics(branchId);
        if (!cancelled) setData(resp);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || e?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const intents = data?.intents_breakdown || {};
  const sentiments = data?.sentiments_breakdown || {};
  const languages = data?.languages_used || {};

  // Formatter helpers
  const formatLabel = (str) => {
    return String(str)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const SENTIMENT_COLORS = {
    calm: '#16A34A',
    happy: '#10B981',
    neutral: '#64748B',
    confused: '#D97706',
    anxious: '#EC4899',
    frustrated: '#EF4444',
    urgent: '#9333EA'
  };

  const getSentimentColor = (sentiment) => {
    const key = String(sentiment).toLowerCase().trim();
    return SENTIMENT_COLORS[key] || '#3B82F6';
  };

  // Recharts Data Mapping
  const intentsData = Object.entries(intents)
    .map(([name, value]) => ({
      name: formatLabel(name),
      value
    }))
    .sort((a, b) => a.value - b.value); // Sort ascending so largest is at the top of the horizontal bar chart

  const sentimentsData = Object.entries(sentiments).map(([name, value]) => ({
    name: formatLabel(name),
    value,
    color: getSentimentColor(name)
  }));

  const LANG_COLORS = ['#2563EB', '#10B981', '#D97706', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6', '#F43F5E', '#059669'];

  const languagesData = Object.entries(languages).map(([name, value]) => ({
    name: formatLabel(name),
    value
  }));

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--body-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <div className="flex-1 min-h-0 p-4">
          <div
            className="h-full rounded-2xl p-6 overflow-y-auto"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Analytics
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Live branch analytics from DB. Branch: <b>{staff?.branch_code || '—'}</b>
            </p>

            {error && (
              <div
                className="mt-4 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.22)', color: '#DC2626' }}
              >
                {error}
              </div>
            )}

            {/* Top Stat Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
              <StatCard label="Total sessions" value={loading ? '—' : data?.total_sessions ?? 0} sub={data?.date || ''} />
              <StatCard label="Completed" value={loading ? '—' : data?.completed_sessions ?? 0} />
              <StatCard label="Abandoned" value={loading ? '—' : data?.abandoned_sessions ?? 0} />
              <StatCard
                label="Avg duration"
                value={loading ? '—' : (data?.avg_duration_seconds ? fmtDuration(data.avg_duration_seconds) : '0s')}
              />
            </div>

            {/* Beautiful Recharts Visualization Area */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
              
              {/* Intents Horizontal Gradient BarChart */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Intents Breakdown
                </p>
                <div className="flex-1 min-h-[240px]">
                  {intentsData.length === 0 && !loading ? (
                    <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No data yet today.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={intentsData}
                        layout="vertical"
                        margin={{ top: 5, right: 15, left: -25, bottom: 5 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="var(--text-muted)"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          width={110}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>
                          {intentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="url(#intentGradient)" />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="intentGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#003087" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Sentiments Donut Chart */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Sentiment Analysis
                </p>
                <div className="flex-1 min-h-[240px]">
                  {sentimentsData.length === 0 && !loading ? (
                    <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No data yet today.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={sentimentsData}
                          cx="50%"
                          cy="45%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {sentimentsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconSize={8}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Languages Used Pie Chart */}
              <div className="rounded-2xl p-5" style={{ background: 'var(--body-bg)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column' }}>
                <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Languages Used
                </p>
                <div className="flex-1 min-h-[240px]">
                  {languagesData.length === 0 && !loading ? (
                    <div className="h-[240px] flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      No data yet today.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={languagesData}
                          cx="50%"
                          cy="45%"
                          outerRadius={75}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                          fontSize={10}
                        >
                          {languagesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={LANG_COLORS[index % LANG_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Stat Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard label="PII detected" value={loading ? '—' : data?.pii_detected_count ?? 0} />
              <StatCard label="AI used" value={loading ? '—' : data?.ai_suggestion_used ?? 0} />
              <StatCard label="AI edited" value={loading ? '—' : data?.ai_suggestion_edited ?? 0} sub={`Ignored: ${data?.ai_suggestion_ignored ?? 0}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
