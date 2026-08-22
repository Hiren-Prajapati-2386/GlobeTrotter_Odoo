import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowLeft, Plus, Trash2, DollarSign, AlertTriangle, TrendingUp, Calendar, Tag, FileText, CheckCircle, ChevronRight } from 'lucide-react';

const BudgetPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(150);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: 'transport',
    amount: '',
    note: ''
  });

  const fetchBudgetDetails = async () => {
    try {
      const tripRes = await api.get(`/api/trips/${id}`);
      setTrip(tripRes.data);

      const summaryRes = await api.get(`/api/trips/${id}/budget/summary`, {
        params: { daily_limit: dailyLimit }
      });
      setBudgetData(summaryRes.data);
    } catch (err) {
      console.error("Error fetching budget summary", err);
      setError("Failed to load budget details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetDetails();
  }, [id, dailyLimit]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');

    if (parseFloat(expenseForm.amount) <= 0) {
      setError('Amount must be positive.');
      return;
    }

    try {
      await api.post(`/api/trips/${id}/budget/`, {
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        note: expenseForm.note || null
      });
      setExpenseForm({ category: 'transport', amount: '', note: '' });
      fetchBudgetDetails();
    } catch (err) {
      setError('Failed to add expense.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/api/trips/${id}/budget/expenses/${expenseId}`);
      fetchBudgetDetails();
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-bold">
          Loading Budget Details...
        </div>
      </div>
    );
  }

  // Formatting data for Pie Chart
  const pieData = budgetData ? Object.keys(budgetData.by_category).map(cat => ({
    name: cat.toUpperCase(),
    value: parseFloat(budgetData.by_category[cat])
  })).filter(item => item.value > 0) : [];

  const COLORS = ['#0ea5e9', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Formatting daily activity data for Bar Chart
  // We want to construct daily stops/activities data.
  const barData = [];
  if (trip && budgetData) {
    // Generate dates between start and end
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    let loop = new Date(start);
    while (loop <= end) {
      const dateStr = loop.toISOString().split('T')[0];
      barData.push({
        date: new Date(loop).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        cost: 0,
        dateStr
      });
      loop.setDate(loop.getDate() + 1);
    }
    
    // Sum activity costs into dates
    // (Note: in ItineraryBuilder page, we schedule activities to stops which have specific scheduled dates)
    // The backend /summary endpoint calculates this. Let's trace it and populate barData costs.
    // If the backend returned overbudget days, we can match daily totals.
    // Since we want this barData to show the daily costs:
    // Let's see: can we deduce daily activity spend from stops of trip?
    // Yes! The trip details has stops, and each stop has trip_activities.
    if (trip.stops) {
      trip.stops.forEach(stop => {
        if (stop.trip_activities) {
          stop.trip_activities.forEach(ta => {
            const costVal = parseFloat(ta.cost_override !== null ? ta.cost_override : ta.activity?.cost || 0);
            const match = barData.find(d => d.dateStr === ta.scheduled_date);
            if (match) {
              match.cost += costVal;
            }
          });
        }
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Back Link */}
        <Link to={`/trip/${id}`} className="text-slate-500 hover:text-brand font-bold text-sm flex items-center gap-1 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Itinerary Builder
        </Link>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Budget & Expenses: {trip?.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track expenditures, categorized totals, and daily limit thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Daily limit threshold:</span>
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand/10 text-brand rounded-xl custom-gradient-bg text-white shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Spent</span>
              <span className="text-2xl font-extrabold text-slate-800">
                ${parseFloat(budgetData?.total_spent || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className={`border rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-colors ${
            budgetData && parseFloat(budgetData.daily_average) > dailyLimit 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-white border-slate-100'
          }`}>
            <div className={`p-3 rounded-xl shadow-sm ${
              budgetData && parseFloat(budgetData.daily_average) > dailyLimit 
                ? 'bg-rose-600 text-white' 
                : 'bg-emerald-50 text-emerald-600'
            }`}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                budgetData && parseFloat(budgetData.daily_average) > dailyLimit 
                  ? 'text-rose-400' 
                  : 'text-slate-400'
              }`}>Daily Average</span>
              <span className={`text-2xl font-extrabold ${
                budgetData && parseFloat(budgetData.daily_average) > dailyLimit 
                  ? 'text-rose-700' 
                  : 'text-slate-800'
              }`}>
                ${parseFloat(budgetData?.daily_average || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl shadow-sm ${
              budgetData?.overbudget_days?.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Overbudget Days</span>
              <span className={`text-2xl font-extrabold ${
                budgetData?.overbudget_days?.length > 0 ? 'text-rose-600' : 'text-slate-800'
              }`}>
                {budgetData?.overbudget_days?.length || 0} days
              </span>
            </div>
          </div>

        </div>

        {/* Daily Average Overbudget Alert */}
        {budgetData && parseFloat(budgetData.daily_average) > dailyLimit && (
          <div className="mb-8 bg-rose-50 border border-rose-200 rounded-3xl p-6 flex gap-4 items-center shadow-inner animate-slideUp">
            <AlertTriangle className="w-8 h-8 text-rose-600 flex-shrink-0" />
            <div>
              <h4 className="font-extrabold text-rose-800 text-base">Daily budget limit exceeded!</h4>
              <p className="text-xs text-rose-700 font-semibold mt-1">
                Your daily average spending of <span className="underline font-black">${parseFloat(budgetData.daily_average).toFixed(2)}</span> exceeds your threshold limit of <span className="underline font-black">${dailyLimit}.00</span>. Consider reducing non-essential expenses.
              </p>
            </div>
          </div>
        )}

        {/* Charts & Graphs Row */}
        {pieData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            
            {/* Pie Chart Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 font-heading border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Tag className="w-5 h-5 text-brand" /> Category distribution
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 font-heading border-b border-slate-50 pb-2 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-emerald-500" /> Daily activity cost profile
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* Expenses List & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of expenses */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-slate-700" />
              Miscellaneous Expenses
            </h2>

            {budgetData?.expenses?.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm text-slate-500 text-sm font-medium">
                No miscellaneous expenses recorded. Use the right form to add travel details.
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {budgetData?.expenses?.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase text-xs">
                          {exp.category.substring(0, 2)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 leading-tight block">
                            {exp.note || 'Travel Expense'}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 capitalize">{exp.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-800 text-sm">
                          ${parseFloat(exp.amount).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overbudget Warn Banner */}
            {budgetData?.overbudget_days?.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex gap-4 items-start shadow-inner">
                <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-800 text-sm">Limit warning alerts</h4>
                  <p className="text-xs text-rose-700 font-medium">
                    The scheduled activity spending on the following days exceeds your daily threshold limit of ${dailyLimit}:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {budgetData.overbudget_days.map((day) => (
                      <span key={day} className="bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-bold px-2 py-1 rounded-lg">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form to Add expense */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1">
              <Plus className="w-5 h-5 text-brand" /> Add Expense
            </h2>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                >
                  <option value="transport">Transport</option>
                  <option value="stay">Stay</option>
                  <option value="meals">Meals</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 85.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes / Description</label>
                <textarea
                  placeholder="e.g. Hotel stay, Train ticket..."
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition custom-gradient-bg"
              >
                Add Cost
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BudgetPage;
