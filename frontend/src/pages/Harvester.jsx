import { useState } from 'react';
import axios from 'axios';
import { CloudDownload, Loader2, CheckCircle2, AlertTriangle, Lock, Clock, LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Harvester() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleHarvest = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setStatus({ type: 'error', msg: 'Введите корректный запрос' });
      return;
    }
    setLoading(true);
    setStatus(null);

    try {
      const res = await axios.post(
        '/api/collect',
        { query, limit: parseInt(limit, 10) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: 'success', msg: res.data.message });
      setQuery('');
    } catch (err) {
      const errMsg = err?.response?.data?.error || err.message;
      setStatus({ type: 'error', msg: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
          Сбор метаданных
        </h2>
        <p className="text-text-muted text-lg">
          Сбор новых публикаций из OpenAlex API и сохранение их в базе данных.
        </p>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Уведомление: пользователь не авторизован */}
        {!token && (
          <div className="glass-panel p-6 border border-amber-500/20 bg-amber-500/5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl shrink-0">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-0.5">Требуется вход</h3>
              <p className="text-sm text-text-muted">
                Используйте кнопку <span className="text-white font-semibold">Войти</span> в правом верхнем углу.
              </p>
            </div>
            <LogIn className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        )}

        {/* Форма сбора данных */}
        <div className={`glass-panel p-8 transition-opacity duration-300 ${!token ? 'opacity-40 pointer-events-none' : ''}`}>
          <form onSubmit={handleHarvest} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-muted">
                Поисковый запрос
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="например: квантовые вычисления, изменение климата, CRISPR…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-muted">
                Количество результатов (макс. 100)
              </label>
              <input
                type="number"
                className="input-field"
                min="1" max="100"
                value={limit}
                onChange={e => setLimit(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn gradient-btn w-full justify-center py-4 text-lg"
              disabled={loading}
            >
              {loading
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : <CloudDownload className="w-6 h-6" />}
              {loading ? 'Выполнение...' : 'Начать сбор'}
            </button>
          </form>

          {/* Блок статуса */}
          {status && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 border ${
              status.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {status.type === 'success'
                ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold">{status.msg}</p>
                {status.type === 'success' && (
                  <p className="text-xs mt-1 text-green-300/70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Задача выполняется в фоне. Проверьте вкладку «Обзор» через несколько секунд.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}