import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Loader2, TrendingUp, Globe, Calendar, CheckCircle, Activity, Award } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/publications/stats/summary');
        setStats(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-text-muted">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-6 border border-red-400/20 rounded-2xl bg-red-400/10 flex items-center gap-4">
        <Activity /> 
        <span>Ошибка загрузки статистики: {error}</span>
      </div>
    );
  }

  // Вычисляем максимальные значения для диаграмм
  const maxYearCount = Math.max(...(stats?.topYears?.map(y => y._count.id) || [1]));
  const maxVenueCount = Math.max(...(stats?.topVenues?.map(v => v._count.id) || [1]));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Аналитика платформы
          </h2>
          <p className="text-text-muted text-lg">
            Общая статистика системы и данные о публикациях.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold max-w-fit shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <CheckCircle className="w-4 h-4" /> API работает
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Общее количество */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Database className="w-7 h-7 text-white" />
            </div>
            <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-xs font-bold border border-green-500/20">
              <TrendingUp className="w-3 h-3" /> Онлайн
            </span>
          </div>
          <div className="z-10">
            <h3 className="text-text-muted font-medium mb-1">Всего публикаций</h3>
            <h2 className="text-5xl font-black text-white">
              {stats?.total?.toLocaleString() || 0}
            </h2>
          </div>
        </div>

        {/* Топ площадка */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group hover:border-pink-500/50 transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-text-muted font-medium mb-1">Самая популярная площадка</h3>
            <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2">
              {stats?.topVenues?.[0]?.venue || 'Нет данных'}
            </h2>
          </div>
        </div>

        {/* Самый активный год */}
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-colors duration-300">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
          <div className="flex justify-between items-start mb-4 z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="z-10">
            <h3 className="text-text-muted font-medium mb-1">Пиковый год публикаций</h3>
            <h2 className="text-4xl font-bold text-white">
              {stats?.topYears?.[0]?.year || 'Нет данных'}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* График по годам */}
        <div className="glass-panel p-6 lg:p-8 flex flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Calendar className="text-blue-400 w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Динамика по годам</h3>
          </div>
          <div className="space-y-6 flex-1">
            {stats?.topYears?.length > 0 ? stats.topYears.map((item, idx) => {
              const percentage = Math.max(8, Math.round((item._count.id / maxYearCount) * 100));
              return (
                <div key={idx} className="relative group">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-white bg-white/10 px-2 py-0.5 rounded">
                      {item.year}
                    </span>
                    <span className="text-blue-300 font-bold">
                      {item._count.id} записей
                    </span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-text-muted text-center py-4 bg-white/5 rounded-xl border border-white/5">
                Нет данных по годам
              </p>
            )}
          </div>
        </div>

        {/* Распределение по площадкам */}
        <div className="glass-panel p-6 lg:p-8 flex flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5 mb-6">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Globe className="text-pink-400 w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Распределение площадок</h3>
          </div>
          <div className="space-y-4 flex-1">
            {stats?.topVenues?.length > 0 ? stats.topVenues.map((item, idx) => {
              const percentage = Math.max(5, Math.round((item._count.id / maxVenueCount) * 100));
              return (
                <div key={idx} className="relative p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="font-semibold text-white/90 text-sm">
                      {item.venue || 'Неизвестно'}
                    </span>
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                      {item._count.id}
                    </span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }) : (
              <p className="text-text-muted text-center py-4 bg-white/5 rounded-xl border border-white/5">
                Нет данных по площадкам
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}