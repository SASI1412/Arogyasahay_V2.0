
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Trash2,
  Zap,
  Star,
  Sparkles,
  PlusCircle,
  UtensilsCrossed,
  Info,
  X,
  Plus,
  Calendar,
  Quote,
  ChevronRight,
  Activity,
  AlertTriangle,
  Package
} from 'lucide-react';
import { UserData, Medication } from '../types';

interface DashboardProps {
  user: UserData;
  onMarkTaken: (id: string) => void;
  onDeleteMed: (id: string) => void;
  onAddMed: (med: Medication) => void;
}

const MOTIVATIONAL_QUOTES = [
  "Take care of your body. It's the only place you have to live.",
  "Consistency is the key to recovery.",
  "Your health is an investment, not an expense.",
  "One dose at a time, one day at a time.",
  "Eat to live, don't live to eat.",
  "Small steps lead to long-term wellness."
];

const Dashboard: React.FC<DashboardProps> = ({ user, onMarkTaken, onDeleteMed, onAddMed }) => {
  const [showAddMed, setShowAddMed] = useState(false);
  const [isChronicMed, setIsChronicMed] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [addSuccess, setAddSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update current time every minute to refresh the filter
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter active meds to only show those within 30 minutes before their scheduled time
  const activeMeds = useMemo(() => {
    return user.medications.filter(med => {
      // Must not be already taken or marked missed
      if (med.taken || med.missed) return false;

      const [h, m] = med.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(h, m, 0, 0);

      // Visibility window starts 30 minutes before scheduled time
      const startTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
      
      return currentTime >= startTime;
    });
  }, [user.medications, currentTime]);

  const nextMed = activeMeds.length > 0 ? activeMeds[0] : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const interval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollLeft += 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [user.diseases]);

  const getFoodSuggestions = () => {
    const suggestions = [];
    const isDiabetes = user.diseases.includes('Diabetes');
    const isBP = user.diseases.includes('BP');
    const isThyroid = user.diseases.includes('Thyroid');

    if (isDiabetes) {
      suggestions.push({ 
        title: 'Spinach & Greens', 
        desc: 'Rich in fiber, keeps sugar levels stable.', 
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      });
      suggestions.push({ 
        title: 'Whole Oats', 
        desc: 'Slow-release energy for better glycemic control.', 
        img: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400',
      });
    }
    if (isBP) {
      suggestions.push({ 
        title: 'Berries Mix', 
        desc: 'Packed with antioxidants to support vascular health.', 
        img: 'https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?auto=format&fit=crop&q=80&w=400',
      });
      suggestions.push({ 
        title: 'Garlic Power', 
        desc: 'Natural vasodilator to help relax blood vessels.', 
        img: 'https://images.unsplash.com/photo-1589307733276-324e64f727c6?auto=format&fit=crop&q=80&w=400',
      });
    }
    if (isThyroid) {
      suggestions.push({ 
        title: 'Healthy Salmon', 
        desc: 'Iodine and Selenium for healthy TSH balance.', 
        img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400',
      });
    }

    suggestions.push({ 
      title: 'Probiotic Yogurt', 
      desc: 'Improves gut flora for better pill absorption.', 
      img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=400',
    });

    return suggestions;
  };

  const foodItems = getFoodSuggestions();

  return (
    <div className="space-y-6 pt-2 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Namaste, {user.username}</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Status: <span className="text-emerald-400">{user.diseases.filter(d => d !== 'None').join(' & ') || 'General Wellness'}</span></p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-2xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-black text-yellow-500">{user.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gray-900/40 border border-gray-800 rounded-3xl p-5 min-h-[90px] flex items-center justify-center text-center">
        <Quote className="absolute -top-1 -left-1 w-10 h-10 text-blue-500/10 rotate-180" />
        <p className="text-xs font-black uppercase text-gray-300 tracking-wide leading-relaxed animate-in fade-in slide-in-from-right duration-1000">
          "{MOTIVATIONAL_QUOTES[quoteIndex]}"
        </p>
      </div>

      {nextMed ? (
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase text-white flex items-center gap-1.5 backdrop-blur-md">
                <Clock className="w-3 h-3" /> Scheduled {nextMed.time}
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase text-white flex items-center gap-1.5 backdrop-blur-md">
                  <Package className="w-3 h-3" /> {nextMed.count} left
                </div>
                <button onClick={() => setShowAddMed(true)} className="text-white/80 hover:text-white bg-white/10 p-2 rounded-xl backdrop-blur-md"><Plus className="w-4 h-4" /></button>
                <button onClick={() => onDeleteMed(nextMed.id)} className="text-white/40 hover:text-white/100 transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{nextMed.name}</h3>
            <p className="text-white/80 text-xs mb-8 font-black uppercase tracking-widest">{nextMed.dosage} • {nextMed.isChronic ? 'Chronic Care' : 'Acute Course'}</p>
            <button 
              onClick={() => onMarkTaken(nextMed.id)} 
              className="w-full py-4 bg-white text-blue-700 font-black uppercase rounded-2xl shadow-xl active:scale-95 transition-all text-xs tracking-widest"
            >
              Mark as Taken
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        </div>
      ) : (
        <div className="bg-gray-900/40 border-2 border-dashed border-gray-800 rounded-[40px] p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <PlusCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">NO TABLETS NOW</h3>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">Checking Vault Security...</p>
          <button onClick={() => setShowAddMed(true)} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest active:scale-95 transition-all"><Plus className="w-4 h-4" /> Add Tablet</button>
        </div>
      )}

      {/* Nutrition Suggestions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-500" /> Adherence Nutrition
          </h3>
          <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase">Moving List</span>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {foodItems.map((food, i) => (
            <div key={i} className="min-w-[280px] snap-center bg-gray-900/60 border border-gray-800 rounded-[24px] overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="h-36 relative">
                <img src={food.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt={food.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3">
                   <h4 className="text-xs font-black text-white uppercase tracking-tighter">{food.title}</h4>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-gray-500 leading-relaxed font-black uppercase tracking-tighter">{food.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Persistent Med Vault Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Medication Vault</h3>
          <button onClick={() => setShowAddMed(true)} className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase">
            <Plus className="w-3 h-3" /> Add More
          </button>
        </div>
        
        <div className="space-y-3">
          {user.medications.length === 0 ? (
            <div className="p-6 text-center bg-gray-900/20 border border-gray-800 rounded-3xl opacity-40">
              <p className="text-[10px] font-black uppercase">Your Vault is empty</p>
            </div>
          ) : (
            user.medications.map(med => (
              <div key={med.id} className={`p-4 rounded-[24px] border transition-all flex items-center justify-between group ${
                med.taken ? 'bg-emerald-500/5 border-emerald-500/20' : 
                med.missed ? 'bg-red-500/5 border-red-500/20' : 
                'bg-gray-900/80 border-gray-800 hover:border-gray-700'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    med.taken ? 'bg-emerald-500/10 text-emerald-400' : 
                    med.missed ? 'bg-red-500/10 text-red-400' : 
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {med.missed ? <AlertTriangle className="w-5 h-5" /> : med.taken ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black uppercase tracking-tight ${med.taken ? 'text-gray-500 line-through' : med.missed ? 'text-red-400' : 'text-white'}`}>{med.name}</h4>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${med.count < 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-gray-700 text-gray-500'}`}>
                        {med.count} LEFT
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                      {med.time} • {med.dosage} 
                      {!med.isChronic && med.endDate && ` • TIL ${med.endDate}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Intake button only shown if not taken, not missed, AND within the visibility window */}
                  {!med.taken && !med.missed && activeMeds.some(am => am.id === med.id) && (
                    <button 
                      onClick={() => onMarkTaken(med.id)} 
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform"
                    >
                      Taken
                    </button>
                  )}
                  {med.taken && <span className="text-emerald-500 text-[10px] font-black uppercase bg-emerald-500/10 px-3 py-1 rounded-lg">Success</span>}
                  {med.missed && <span className="text-red-500 text-[10px] font-black uppercase bg-red-500/10 px-3 py-1 rounded-lg">Missed</span>}
                  <button onClick={() => onDeleteMed(med.id)} className="p-2 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddMed && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="w-full max-w-md bg-[#141A23] rounded-t-[40px] sm:rounded-3xl p-8 border-t border-gray-800 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Vault Entry</h2>
              <button onClick={() => setShowAddMed(false)} className="p-2 bg-gray-800 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            {addSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase text-center animate-bounce">
                Security: Medicine added to Vault
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              onAddMed({
                id: Math.random().toString(),
                name: f.get('name') as string,
                dosage: f.get('dosage') as string,
                time: f.get('time') as string,
                description: 'Scheduled',
                isChronic: isChronicMed,
                taken: false,
                missed: false,
                frequency: 'Daily',
                count: parseInt(f.get('count') as string) || 0,
                startDate: !isChronicMed ? (f.get('startDate') as string) : undefined,
                endDate: !isChronicMed ? (f.get('endDate') as string) : undefined,
              });
              
              setAddSuccess(true);
              setTimeout(() => setAddSuccess(false), 2000);
              e.currentTarget.reset();
            }} className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Medicine Name</label>
                 <input name="name" placeholder="e.g. Metformin" className="w-full bg-gray-900 border border-gray-800 p-4 rounded-2xl text-white font-black focus:border-blue-500 outline-none uppercase text-xs" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Strength</label>
                  <input name="dosage" placeholder="e.g. 500mg" className="w-full bg-gray-900 border border-gray-800 p-4 rounded-2xl text-white font-black focus:border-blue-500 outline-none uppercase text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Alert Time</label>
                  <input name="time" type="time" className="w-full bg-gray-900 border border-gray-800 p-4 rounded-2xl text-white font-black focus:border-blue-500 outline-none text-xs" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Total Tablets/Doses in Stock</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="count" type="number" placeholder="e.g. 30" className="w-full bg-gray-900 border border-gray-800 p-4 pl-12 rounded-2xl text-white font-black focus:border-blue-500 outline-none text-xs" required min="1" />
                </div>
                <p className="text-[8px] text-gray-600 font-bold uppercase mt-1 px-2">We will alert you when stock falls below 10</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-300 uppercase">Chronic Care</span>
                  <span className="text-[8px] text-gray-600 font-black uppercase">Life-long medicine</span>
                </div>
                <button type="button" onClick={() => setIsChronicMed(!isChronicMed)} className={`w-12 h-6 rounded-full relative transition-all ${isChronicMed ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isChronicMed ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {!isChronicMed && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl">
                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1 tracking-widest">Start From</label>
                    <input name="startDate" type="date" className="w-full bg-transparent text-white text-[10px] font-black outline-none" required />
                  </div>
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl">
                    <label className="block text-[8px] font-black text-gray-500 uppercase mb-1 tracking-widest">Valid To</label>
                    <input name="endDate" type="date" className="w-full bg-transparent text-white text-[10px] font-black outline-none" required />
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest active:scale-95 transition-all">Add To Vault</button>
                <button type="button" onClick={() => setShowAddMed(false)} className="px-8 py-5 bg-gray-800 text-white font-black rounded-2xl uppercase text-xs tracking-widest active:scale-95 transition-all">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
