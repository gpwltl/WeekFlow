import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TaskAnalytics } from '@/src/task/entities/TaskAnalytics';

interface AnalyticsDashboardProps {
  analytics: TaskAnalytics;
  predictions: any[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  predictions,
  dateRange
}) => {
  const completionData = useMemo(() => [
    { name: '완료', value: analytics.completedTasks },
    { name: '미완료', value: analytics.totalTasks - analytics.completedTasks }
  ], [analytics]);

  const interruptionData = useMemo(() => 
    analytics.mostInterruptedTasks.map(task => ({
      name: task.taskName,
      interruptions: task.interruptions
    }))
  , [analytics]);

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold mb-6">작업 분석 대시보드</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 완료율 파이 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">작업 완료율</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 중단 분석 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">작업 중단 분석</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={interruptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="interruptions"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 예측 차트 */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">작업 예측</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#82ca9d"
                  name="예측된 작업량"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="총 작업"
          value={analytics.totalTasks}
        />
        <StatCard
          title="완료율"
          value={`${analytics.completionRate.toFixed(1)}%`}
        />
        <StatCard
          title="평균 소요 시간"
          value={`${(analytics.averageDuration / 3600).toFixed(1)}시간`}
        />
        <StatCard
          title="총 중단 횟수"
          value={analytics.totalInterruptions}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h4 className="text-sm text-gray-500">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
); 