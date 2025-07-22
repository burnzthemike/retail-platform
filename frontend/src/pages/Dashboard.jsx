import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiPackage, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: { count: 0, total: 0 },
    monthSales: { count: 0, total: 0 },
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-chart')
      ]);
      
      setStats(statsRes.data);
      
      const salesData = chartRes.data;
      setChartData({
        labels: salesData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Daily Revenue',
            data: salesData.map(d => d.revenue),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: "Today's Sales",
      value: `R${stats.todaySales.total.toFixed(2)}`,
      subtitle: `${stats.todaySales.count} transactions`,
      icon: FiShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: "Month's Revenue",
      value: `R${stats.monthSales.total.toFixed(2)}`,
      subtitle: `${stats.monthSales.count} transactions`,
      icon: FiShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      subtitle: `${stats.lowStockCount} low stock`,
      icon: FiPackage,
      color: stats.lowStockCount > 0 ? 'bg-yellow-500' : 'bg-purple-500'
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      subtitle: 'Active customers',
      icon: FiUsers,
      color: 'bg-pink-500'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                  <Icon size={24} />
                </div>
                {stat.title.includes('Products') && stats.lowStockCount > 0 && (
                  <FiAlertTriangle className="text-yellow-500" size={20} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.subtitle}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h2>
        <div className="h-64">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return 'R' + value;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
