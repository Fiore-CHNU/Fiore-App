import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Store, Shield, User, ShoppingBag, Tag, CheckCircle2, XCircle, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { INITIAL_PRODUCTS } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock toggle for 1-click stock availability (US-8.3)
  const [stockStatus, setStockStatus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INITIAL_PRODUCTS.forEach(p => {
      initial[p.id] = p.isAvailable;
    });
    return initial;
  });

  const handleToggleStock = (id: string) => {
    setStockStatus(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSignOut = () => {
    // US-7.1 Scenario 4: Sign out and redirect to login
    logout();
    navigate('/admin/login', { replace: true });
  };

  const roleTitle = user?.role === 'admin' ? 'Адміністратор' : 'Менеджер';

  return (
    <div className="min-h-screen bg-[#180816] text-white flex flex-col">
      {/* Admin Top Navigation */}
      <header className="bg-[#240D20] border-b border-[#431A3C] sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Admin Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-widest text-[#F5B2E2]">
                FIORE
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#3D1735] border border-[#5A2250] text-[11px] font-semibold text-[#FFD7F1] uppercase tracking-wider">
              <Shield className="w-3 h-3 text-[#F5B2E2]" />
              <span>Панель персоналу</span>
            </span>
          </div>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* User Info Chip */}
            <div className="flex items-center gap-2.5 bg-[#1B0918] border border-[#3E1638] px-3 py-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full bg-[#4E1E46] flex items-center justify-center text-[#F5B2E2]">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-white block leading-tight">
                  {user?.fullName || user?.username}
                </span>
                <span className="text-[10px] text-[#F5B2E2] font-medium block">
                  {roleTitle}
                </span>
              </div>
              <span className="md:hidden text-xs font-bold text-[#F5B2E2] uppercase">
                {user?.role}
              </span>
            </div>

            {/* Back to Client Shop */}
            <Link
              to="/"
              className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="Перейти на клієнтський сайт"
            >
              <Store className="w-4 h-4" />
              <span>Магазин</span>
            </Link>

            {/* Sign Out Button (US-7.1 Scenario 4) */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3B1533] hover:bg-red-950/80 hover:text-red-300 border border-[#521E47] hover:border-red-500/50 text-xs font-semibold text-white/90 transition-all shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#240D20] border border-[#481A3F] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-white">
              Вітаємо, {user?.fullName}!
            </h1>
            <p className="text-sm text-white/60 mt-1 font-sans">
              Ви авторизовані з правами: <strong className="text-[#F5B2E2] font-semibold">{roleTitle}</strong>. Доступні лише модулі вашої ролі.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Зміна активна
            </span>
          </div>
        </div>

        {/* ROLE-BASED WORKSPACES (US-7.1 Scenario 1) */}
        {user?.role === 'admin' ? (
          /* ================= ADMINISTRATOR VIEW (US-9.1, US-8.3) ================= */
          <div className="space-y-8 animate-fade-in">
            {/* Order Queue (US-9.1) */}
            <section className="bg-[#240D20] border border-[#481A3F] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3E1638]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#4A1D42] text-[#F5B2E2]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-medium text-white">
                      Черга нових замовлень (US-9.1)
                    </h2>
                    <p className="text-xs text-white/50">
                      Автоматичне опитування кожні 30 с • Лише оплачені замовлення
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F5B2E2]/10 border border-[#F5B2E2]/30 text-[#F5B2E2] text-xs font-bold">
                  2 нових
                </span>
              </div>

              {/* Order Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#3A1734] text-xs uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3">Номер</th>
                      <th className="py-3 px-3">Слот доставки</th>
                      <th className="py-3 px-3">Одержувач</th>
                      <th className="py-3 px-3">Сума</th>
                      <th className="py-3 px-3">Статус</th>
                      <th className="py-3 px-3 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#32132C]">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#F5B2E2]">#ORD-2026-084</td>
                      <td className="py-3.5 px-3 text-white/80">Сьогодні, 16:00 – 18:00</td>
                      <td className="py-3.5 px-3">Марія Петренко (+380 67 111-22-33)</td>
                      <td className="py-3.5 px-3 font-bold text-[#FFD7F1]">₴1 800,00</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                          Нове (Оплачено)
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button className="px-3 py-1 rounded-full bg-[#F5B2E2] text-[#1E0B1A] text-xs font-bold hover:bg-[#FDBDE9] transition-all">
                          В роботу
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#F5B2E2]">#ORD-2026-085</td>
                      <td className="py-3.5 px-3 text-white/80">Завтра, 10:00 – 12:00</td>
                      <td className="py-3.5 px-3">Олена Кравчук (+380 50 999-88-77)</td>
                      <td className="py-3.5 px-3 font-bold text-[#FFD7F1]">₴2 200,00</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 text-xs font-medium">
                          У процесі складання
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button className="px-3 py-1 rounded-full bg-[#3D1A39] text-[#FFD7F1] text-xs font-bold hover:bg-[#4E1E46] transition-all">
                          Деталі
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 1-Click Availability Manager (US-8.3) */}
            <section className="bg-[#240D20] border border-[#481A3F] rounded-3xl p-6 shadow-xl">
              <div className="mb-6 pb-4 border-b border-[#3E1638]">
                <h2 className="font-serif text-xl font-medium text-white">
                  Керування наявністю в 1 клік (US-8.3)
                </h2>
                <p className="text-xs text-white/50">
                  Миттєве приховування товарів, якщо свіжі квіти закінчилися
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {INITIAL_PRODUCTS.slice(0, 6).map(product => {
                  const isAvailable = stockStatus[product.id] ?? product.isAvailable;

                  return (
                    <div
                      key={product.id}
                      className="bg-[#1C0A19] border border-[#3C1636] rounded-2xl p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.imageUrl || ''}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-[#130712] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate font-serif">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#FFD7F1] font-bold">
                            {product.currency}{product.price.toLocaleString('uk-UA')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleStock(product.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                          isAvailable
                            ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900'
                            : 'bg-red-950 border border-red-500/50 text-red-300 hover:bg-red-900'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>В наявності</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Закінчився</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        ) : (
          /* ================= MANAGER VIEW (US-8.1, US-8.2) ================= */
          <div className="space-y-8 animate-fade-in">
            {/* Bouquet Catalog & Pricing (US-8.1) */}
            <section className="bg-[#240D20] border border-[#481A3F] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3E1638]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#4A1D42] text-[#F5B2E2]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-medium text-white">
                      Керування букетами та цінами (US-8.1)
                    </h2>
                    <p className="text-xs text-white/50">
                      Редагування описів, складу композицій та підтвердження цін (BR-12)
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-full bg-[#F5B2E2] text-[#1E0B1A] text-xs font-bold hover:bg-[#FDBDE9] transition-all shadow-md">
                  + Додати новий букет
                </button>
              </div>

              <div className="divide-y divide-[#32132C]">
                {INITIAL_PRODUCTS.slice(0, 4).map(product => (
                  <div key={product.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={product.imageUrl || ''}
                        alt={product.name}
                        className="w-14 h-16 rounded-xl object-cover bg-[#130712] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-serif text-base font-medium text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-white/50 font-mono mt-0.5">
                          {product.sku}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-sans font-bold text-base text-[#FFD7F1]">
                        {product.currency}{product.price.toLocaleString('uk-UA')}
                      </span>
                      <button className="px-3.5 py-1.5 rounded-full bg-[#3B1533] hover:bg-[#4E1E46] border border-[#521E47] text-xs font-semibold text-[#FFD7F1] transition-all">
                        Редагувати
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Filters & Tags Association (US-8.2) */}
            <section className="bg-[#240D20] border border-[#481A3F] rounded-3xl p-6 shadow-xl">
              <div className="mb-4 pb-3 border-b border-[#3E1638] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#F5B2E2]" />
                <h2 className="font-serif text-lg font-medium text-white">
                  Прив'язка до категорій і Colour Picker (US-8.2)
                </h2>
              </div>
              <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
                Менеджер має доступ до налаштування відтінків (для фільтрації в Colour Picker) та категорій приводів (День народження, Романтика, Весілля).
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
