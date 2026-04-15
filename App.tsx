
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  MessageCircle, 
  User as UserIcon,
  Bell,
  X,
  AlertCircle,
  Activity,
  Cpu,
  Menu,
  ChevronRight,
  Star,
  Zap,
  ShieldCheck,
  History,
  ShoppingBag,
  RotateCcw,
  Lock
} from 'lucide-react';
import { UserData, Medication, HistoryItem, Notification } from './types';
import Dashboard from './views/Dashboard';
import Onboarding from './views/Onboarding';
import Trends from './views/Trends';
import Chat from './views/Chat';
import Profile from './views/Profile';
import VitalsLogger from './views/VitalsLogger';
import ChronicManager from './views/ChronicManager';
import ClinicalHub from './views/ClinicalHub';
import Store from './views/Store';
import Login from './views/Login';
import { APP_NAME, LOGO_URL } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'splash' | 'auth' | 'onboarding' | 'main'>('splash');
  const [activeTab, setActiveTab] = useState<'home' | 'chronic' | 'trends' | 'chat' | 'profile' | 'clinical' | 'store'>('home');
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{title: string, msg: string} | null>(null);
  
  const initialUserState: UserData = {
    username: '',
    password: '',
    phoneNumber: '',
    email: '',
    age: '',
    gender: 'Prefer not to say',
    bloodGroup: '',
    allergies: [],
    diseases: [],
    medications: [],
    coins: 100, 
    streak: 0,
    onboarded: false,
    vitals: [],
    history: [],
    notifications: [],
    settings: {
      remindersEnabled: true,
      biometricLock: false,
      language: 'English',
      theme: 'dark',
      privacy: {
        aiPersonalization: true,
        voiceProcessing: true,
        analyticsSharing: false
      },
      notificationRules: {
        medicationReminders: true,
        labReportAlerts: true,
        appointmentReminders: true,
        emergencyAlerts: true,
        wellnessNudges: true
      }
    },
    emergencyContact: { name: '', phone: '' }
  };

  const [user, setUser] = useState<UserData>(initialUserState);

  // Check registration status on load
  useEffect(() => {
    const saved = localStorage.getItem('arogya_username');
    setTimeout(() => {
      if (saved) {
        fetch(`/api/user/${saved}`)
          .then(res => res.json())
          .then(data => {
            if (data.username) setUser(prev => ({ ...prev, ...data }));
            setView('auth'); // User exists, ask for PIN
          })
          .catch(() => setView('auth'));
      } else {
        setView('auth'); // Show registration if no user exists
      }
    }, 2000);
  }, []);

  // Sync state to Backend and LocalStorage
  useEffect(() => {
    if (view === 'main' || view === 'onboarding' || (view === 'auth' && user.username)) {
      localStorage.setItem('arogya_username', user.username);
      if (user.username) {
        fetch(`/api/user/${user.username}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(user)
        }).catch(err => console.error("Sync Error:", err));
      }
    }
  }, [user, view]);

  // Automated Missed Dose Checker
  useEffect(() => {
    if (view !== 'main') return;
    const checkMissedDoses = () => {
      const now = new Date();
      setUser(prev => {
        let updated = false;
        const meds = prev.medications ?? [];
        const missedThisCycle: Medication[] = [];
        const nudgedThisCycle: Medication[] = [];
        const newMeds = meds.map(med => {
          if (med.taken || med.missed) return med;
          const [h, m] = med.time.split(':').map(Number);
          const medDate = new Date();
          medDate.setHours(h, m, 0, 0);
          
          const diffMinutes = (now.getTime() - medDate.getTime()) / 60000;

          if (diffMinutes > 30) {
            updated = true;
            missedThisCycle.push(med);
            return { ...med, missed: true };
          }

          if (diffMinutes > 15 && !med.nudged) {
            updated = true;
            nudgedThisCycle.push(med);
            return { ...med, nudged: true };
          }

          return med;
        });

        if (updated) {
          const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          const missedHistory: HistoryItem[] = missedThisCycle.map(m => ({
            id: Math.random().toString(),
            type: 'vital',
            title: `Missed: ${m.name}`,
            description: `Dose missed at ${m.time}. 0.5 coins deducted.`,
            timestamp: now.toLocaleString()
          }));

          const missedNotifs: Notification[] = missedThisCycle.map(m => ({
            id: Math.random().toString(),
            title: 'Dose Missed!',
            message: `You missed your ${m.name} dose. Your health is priority!`,
            time: currentTimeStr,
            read: false,
            type: 'reminder'
          }));

          const nudgeNotifs: Notification[] = nudgedThisCycle.map(m => ({
            id: Math.random().toString(),
            title: 'Medication Nudge',
            message: `You are 15 minutes late for your ${m.name} dose. Please take it now!`,
            time: currentTimeStr,
            read: false,
            type: 'reminder'
          }));
          
          const totalMissed = newMeds.filter(m => m.missed).length;
          let sosHistory: HistoryItem[] = [];
          
          if (totalMissed >= 2 && !prev.history.some(h => h.title.includes('SOS PROTOCOL ENGAGED'))) {
            fetch('/api/alert/sms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contactPhone: prev.emergencyContact?.phone,
                message: `CRITICAL ALERT: ${prev.username || 'A patient'} has missed ${totalMissed} essential medications. Please check on them.`
              })
            }).catch(console.error);

            sosHistory = [{ id: Math.random().toString(), type: 'vital', title: 'SOS PROTOCOL ENGAGED', description: `Automated SMS sent to caregiver over multiple missed medications.`, timestamp: now.toLocaleString() }];
            setActiveAlert({ title: "SOS ALARM DISPATCHED", msg: `SMS protocol engaged for ${prev.emergencyContact?.name || 'Caregiver'}.` });
          } else if (missedThisCycle.length > 0) {
            setActiveAlert({ title: "Health Alert", msg: `You missed ${missedThisCycle.length} dose(s). Stay consistent!` });
          } else if (nudgedThisCycle.length > 0) {
            setActiveAlert({ title: "Medication Reminder", msg: `You are 15 minutes late for your medication.` });
          }
          
          return {
            ...prev,
            medications: newMeds,
            coins: Math.max(0, prev.coins - (missedThisCycle.length * 0.5)),
            history: [...sosHistory, ...missedHistory, ...(prev.history ?? [])],
            notifications: [...missedNotifs, ...nudgeNotifs, ...(prev.notifications ?? [])]
          };
        }
        return prev;
      });
    };
    const interval = setInterval(checkMissedDoses, 10000); 
    return () => clearInterval(interval);
  }, [view]);

  const handleAuthSuccess = (userData: UserData, isNew: boolean) => {
    setUser(userData);
    if (isNew) {
      setView('onboarding');
    } else {
      setView('main');
    }
  };

  const markMedicationTaken = (id: string) => {
    setUser(prev => {
      let stockAlert = null;
      const meds = prev.medications ?? [];
      const newMeds = meds.map(m => {
        if (m.id === id) {
          const newCount = Math.max(0, (m.count || 0) - 1);
          if (newCount < 10) stockAlert = { name: m.name, count: newCount };
          return { ...m, taken: true, takenTime: new Date().toLocaleTimeString(), count: newCount };
        }
        return m;
      });
      const historyEntry: HistoryItem = {
        id: Math.random().toString(),
        type: 'medication',
        title: 'Medication Taken',
        description: `Confirmed at ${new Date().toLocaleTimeString()}.`,
        timestamp: new Date().toLocaleString()
      };
      if (stockAlert) {
        setActiveAlert({ title: "Low Stock Alert", msg: `Only ${stockAlert.count} tablets of ${stockAlert.name} left.` });
      }
      return {
        ...prev,
        medications: newMeds,
        coins: prev.coins + 10,
        streak: prev.streak + 1,
        history: [historyEntry, ...(prev.history ?? [])]
      };
    });
  };

  const deleteMedication = (id: string) => {
    setUser(prev => ({ ...prev, medications: (prev.medications ?? []).filter(m => m.id !== id) }));
  };

  const addMedication = (med: Medication) => {
    setUser(prev => ({ ...prev, medications: [...(prev.medications ?? []), med] }));
  };

  const purchaseItem = (id: number, name: string, price: number) => {
    setUser(prev => {
      if (prev.coins < price) return prev;
      return {
        ...prev,
        coins: prev.coins - price,
        history: [{ id: Math.random().toString(), type: 'purchase', title: `Purchased: ${name}`, description: `Spent ${price} coins.`, timestamp: new Date().toLocaleString() }, ...(prev.history ?? [])],
        notifications: [{ id: Math.random().toString(), title: 'Transaction Successful', message: `You've successfully claimed ${name}.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false, type: 'reward' }, ...(prev.notifications ?? [])]
      };
    });
  };

  const handleUpdateUser = (data: Partial<UserData>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const handleLock = () => {
    setView('auth');
    setIsSidebarOpen(false);
  };

  const handleReset = () => {
    localStorage.removeItem('arogya_username');
    window.location.reload();
  };

  if (view === 'splash') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B0E14]">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
          <div className="relative z-10 w-full h-full rounded-full border-2 border-blue-500/30 flex items-center justify-center overflow-hidden bg-gray-900 shadow-[0_0_50px_rgba(59,130,246,0.5)]">
             <img src={LOGO_URL} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest mb-2 uppercase">{APP_NAME}</h1>
        <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px]">Secure AI Vault</p>
      </div>
    );
  }

  if (view === 'auth') {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  if (view === 'onboarding') {
    return (
      <Onboarding 
        onComplete={(diseases) => { 
          setUser(prev => ({ ...prev, diseases, onboarded: true })); 
          setView('main'); 
        }} 
      />
    );
  }

  const navigateTo = (tab: any) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const hasUnreadNotifications = (user.notifications ?? []).some(n => !n.read);

  return (
    <div className="h-screen bg-[#0B0E14] text-gray-100 flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div 
            className="w-[280px] h-full bg-[#141A23] border-r border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full border border-gray-700 overflow-hidden">
                  <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-white tracking-tight">{APP_NAME}</h2>
                  <p className="text-[8px] text-blue-500 font-black uppercase tracking-[0.2em]">Clinical Core v2.5</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 p-2 rounded-xl text-center">
                  <Star className="w-3 h-3 text-yellow-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white">{user.coins}</p>
                </div>
                <div className="bg-gray-800/50 p-2 rounded-xl text-center">
                  <Zap className="w-3 h-3 text-emerald-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black text-white">{user.streak}D</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
              <SidebarItem active={activeTab === 'home'} icon={<Home />} label="Dashboard" onClick={() => navigateTo('home')} />
              <SidebarItem active={activeTab === 'store'} icon={<ShoppingBag />} label="Rewards Store" onClick={() => navigateTo('store')} />
              <SidebarItem active={activeTab === 'clinical'} icon={<Cpu />} label="Clinical AI Hub" onClick={() => navigateTo('clinical')} />
              {(user.diseases ?? []).length > 0 && !(user.diseases ?? []).includes('None') && (
                <SidebarItem active={activeTab === 'chronic'} icon={<Activity />} label="Chronic Care" onClick={() => navigateTo('chronic')} />
              )}
              <SidebarItem active={activeTab === 'chat'} icon={<MessageCircle />} label="Aarogya AI" onClick={() => navigateTo('chat')} />
              <SidebarItem active={activeTab === 'profile'} icon={<UserIcon />} label="Account Settings" onClick={() => navigateTo('profile')} />
              <div className="pt-4 border-t border-gray-800 mt-4">
                <SidebarItem active={activeTab === 'trends'} icon={<History />} label="Health Archives" onClick={() => navigateTo('trends')} />
              </div>
            </nav>

            <div className="p-4 border-t border-gray-800 shrink-0 space-y-2">
              <button 
                onClick={handleLock}
                className="w-full p-4 flex items-center gap-3 bg-blue-600/5 border border-blue-500/20 text-blue-500 rounded-2xl hover:bg-blue-500/10 transition-all font-black uppercase text-[10px]"
              >
                <Lock className="w-4 h-4" /> Lock Vault
              </button>
              <button 
                onClick={handleReset}
                className="w-full p-4 flex items-center gap-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/10 transition-all font-black uppercase text-[10px]"
              >
                <RotateCcw className="w-4 h-4" /> Reset Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAlert && (
        <div className="fixed top-0 left-0 right-0 z-[200] p-4 animate-in slide-in-from-top duration-300">
          <div className="bg-red-600 rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-red-500">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-white" />
              <div>
                <p className="text-sm font-black text-white uppercase">{activeAlert.title}</p>
                <p className="text-[10px] text-white/90 font-medium">{activeAlert.msg}</p>
              </div>
            </div>
            <button onClick={() => setActiveAlert(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white" /></button>
          </div>
        </div>
      )}

      <header className="p-4 flex items-center justify-between sticky top-0 z-30 bg-[#0B0E14]/80 backdrop-blur-md border-b border-gray-800/30 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-800 rounded-xl text-gray-300 hover:text-white transition-all shadow-lg shadow-black/20"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {activeTab === 'home' ? 'Dashboard' : activeTab === 'store' ? 'REWARDS STORE' : activeTab.toUpperCase()}
            </h2>
            {activeTab === 'home' && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setActiveTab('store')} className="p-2 rounded-xl bg-blue-600/10 text-blue-500" title="Coins">
             <Star className="w-5 h-5" />
           </button>
           <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-xl bg-gray-800/50">
            <Bell className="w-5 h-5 text-gray-400" />
            {hasUnreadNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0B0E14]"></span>}
          </button>
        </div>
      </header>

      {showNotifications && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setShowNotifications(false)}>
          <div className="w-4/5 h-full bg-[#141A23] shadow-2xl flex flex-col border-l border-gray-800 animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
              <h3 className="font-black text-xl uppercase tracking-tight">Vault Alerts</h3>
              <button onClick={() => setShowNotifications(false)} className="p-2 bg-gray-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!(user.notifications ?? []).length ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 uppercase font-black text-xs">No active alerts</div>
              ) : (
                (user.notifications ?? []).map(n => (
                  <div key={n.id} className="p-4 rounded-2xl border bg-gray-900 border-gray-800">
                    <h4 className="text-xs font-black uppercase text-white">{n.title}</h4>
                    <p className="text-[10px] text-gray-400">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-2 overflow-y-auto scrollbar-hide">
        {activeTab === 'home' && <Dashboard user={user} onMarkTaken={markMedicationTaken} onDeleteMed={deleteMedication} onAddMed={addMedication} />}
        {activeTab === 'chronic' && <ChronicManager user={user} onLogVitals={() => setShowVitalsModal(true)} />}
        {activeTab === 'clinical' && <ClinicalHub user={user} onNavigateToTrends={() => setActiveTab('trends')} onPurchaseItem={purchaseItem} />}
        {activeTab === 'trends' && <Trends user={user} onBack={() => setActiveTab('clinical')} />}
        {activeTab === 'chat' && <Chat user={user} />}
        {activeTab === 'store' && <Store coins={user.coins} onPurchase={purchaseItem} />}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            onLogout={handleLock} 
            onUpdateUser={handleUpdateUser} 
            onUpdateSettings={(s: any) => setUser(p => ({ ...p, settings: { ...p.settings, ...s } }))} 
            onUpdateEmergencyContact={(c: any) => setUser(p => ({ ...p, emergencyContact: c }))} 
            onResetVault={handleReset}
          />
        )}
      </main>

      {showVitalsModal && <VitalsLogger diseases={user.diseases ?? []} onSave={(v: any) => { setUser(prev => ({ ...prev, vitals: [v, ...(prev.vitals ?? [])] })); setShowVitalsModal(false); }} onClose={() => setShowVitalsModal(false)} />}
    </div>
  );
};

const SidebarItem: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-800/50'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`${active ? 'text-white' : 'text-gray-600 group-hover:text-blue-500'} transition-colors`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    </div>
    {active && <ChevronRight className="w-4 h-4" />}
  </button>
);

export default App;
