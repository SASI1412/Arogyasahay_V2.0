
import React, { useState } from 'react';
import { 
  Shield, 
  RotateCcw, 
  ChevronRight, 
  Award, 
  Bell, 
  PhoneCall, 
  Save, 
  Languages,
  User,
  Star,
  Edit2,
  Phone,
  Check,
  Mail,
  Calendar,
  Users,
  HeartPulse,
  Droplet,
  AlertCircle,
  Stethoscope,
  Database,
  Eye,
  Trash2,
  Download,
  Clock,
  Zap,
  Globe,
  Lock,
  X,
  Activity,
  Sparkles,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { UserData, EmergencyContact, ChronicDisease } from '../types';
import { CHRONIC_DISEASES } from '../constants';

interface ProfileProps {
  user: UserData;
  onLogout: () => void;
  onUpdateUser: (data: Partial<UserData>) => void;
  onUpdateSettings: (settings: any) => void;
  onUpdateEmergencyContact: (contact: EmergencyContact) => void;
  onResetVault: () => void;
}

type SettingsMode = 'PERSONAL' | 'MEDICAL' | 'PRIVACY' | 'NOTIFICATIONS';

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, onUpdateSettings, onUpdateEmergencyContact, onResetVault }) => {
  const [mode, setMode] = useState<SettingsMode>('PERSONAL');
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const triggerFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 1. Personal Details Mode
  const PersonalMode = () => {
    const [temp, setTemp] = useState({
      username: user.username,
      age: user.age || '',
      gender: user.gender || 'Prefer not to say',
      phoneNumber: user.phoneNumber,
      email: user.email || ''
    });
    const [tempLang, setTempLang] = useState(user.settings.language);

    const handleSave = () => {
      onUpdateUser(temp);
      onUpdateSettings({ language: tempLang });
      setIsEditing(false);
      triggerFeedback('Identity Secured');
    };

    if (!isEditing) {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-black uppercase tracking-tight">Personal Details</h3>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
            >
              <Edit2 className="w-3 h-3" /> Update
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <DisplayCard label="Display Name" value={user.username} icon={<User className="w-4 h-4" />} />
             <div className="grid grid-cols-2 gap-4">
               <DisplayCard label="Age" value={user.age || 'Not Set'} icon={<Calendar className="w-4 h-4" />} />
               <DisplayCard label="Gender" value={user.gender || 'Not Set'} icon={<Users className="w-4 h-4" />} />
             </div>
             <DisplayCard label="App Language" value={user.settings.language} icon={<Globe className="w-4 h-4" color="#3b82f6" />} />
             <DisplayCard label="Secure Phone" value={user.phoneNumber || 'Not Set'} icon={<Phone className="w-4 h-4" />} />
             <DisplayCard label="Vault Email" value={user.email || 'Not Set'} icon={<Mail className="w-4 h-4" />} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-blue-500">Edit Identity</h3>
          <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-800 rounded-full text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="bg-gray-900/40 border border-blue-500/30 rounded-[32px] p-6 space-y-5">
          <InputGroup label="Display Name" icon={<User className="w-4 h-4" />} value={temp.username} onChange={v => setTemp({...temp, username: v})} placeholder="Legal Name" />
          
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Age" icon={<Calendar className="w-4 h-4" />} value={temp.age} onChange={v => setTemp({...temp, age: v})} placeholder="Years" type="number" />
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Gender</label>
              <select 
                value={temp.gender} 
                onChange={e => setTemp({...temp, gender: e.target.value as any})}
                className="w-full bg-gray-800 border-none p-4 rounded-2xl text-xs font-black text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Language</label>
            <select 
              value={tempLang} 
              onChange={e => setTempLang(e.target.value as any)}
              className="w-full bg-gray-800 border-none p-4 rounded-2xl text-xs font-black text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>

          <InputGroup label="Phone" icon={<Phone className="w-4 h-4" />} value={temp.phoneNumber} onChange={v => setTemp({...temp, phoneNumber: v})} placeholder="Phone" />
          <InputGroup label="Email" icon={<Mail className="w-4 h-4" />} value={temp.email} onChange={v => setTemp({...temp, email: v})} placeholder="Email" />
          
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Details
          </button>
        </div>
      </div>
    );
  };

  // 2. Medical Profile Mode
  const MedicalMode = () => {
    const [temp, setTemp] = useState({
      bloodGroup: user.bloodGroup || '',
      allergies: user.allergies?.join(', ') || '',
      ecName: user.emergencyContact?.name || '',
      ecPhone: user.emergencyContact?.phone || '',
      diseases: [...user.diseases]
    });

    const toggleDisease = (id: ChronicDisease) => {
      if (id === 'None') {
        setTemp(prev => ({ ...prev, diseases: ['None'] }));
        return;
      }
      setTemp(prev => {
        const filtered = prev.diseases.filter(d => d !== 'None');
        if (filtered.includes(id)) {
          return { ...prev, diseases: filtered.filter(d => d !== id) };
        } else {
          return { ...prev, diseases: [...filtered, id] };
        }
      });
    };

    const handleSave = () => {
      onUpdateUser({ 
        bloodGroup: temp.bloodGroup, 
        allergies: temp.allergies.split(',').map(s => s.trim()).filter(Boolean),
        diseases: temp.diseases
      });
      onUpdateEmergencyContact({ name: temp.ecName, phone: temp.ecPhone });
      setIsEditing(false);
      triggerFeedback('Medical Vault Synchronized');
    };

    if (!isEditing) {
      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xl font-black uppercase tracking-tight">Medical Profile</h3>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-600/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
            >
              <Edit2 className="w-3 h-3" /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="grid grid-cols-2 gap-4">
               <DisplayCard label="Blood Group" value={user.bloodGroup || 'Not Set'} icon={<Droplet className="w-4 h-4" color="#ef4444" />} />
               <DisplayCard label="Conditions" value={user.diseases.join(', ') || 'None'} icon={<Activity className="w-4 h-4" />} />
             </div>
             <DisplayCard label="Allergies" value={user.allergies?.join(', ') || 'None Detected'} icon={<AlertCircle className="w-4 h-4" />} />
             
             <div className="mt-4 space-y-3">
               <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                 <Shield className="w-3 h-3" /> Emergency SOS Contact
               </h4>
               <div className="bg-red-600/5 border border-red-500/10 rounded-2xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500"><PhoneCall className="w-5 h-5" /></div>
                   <div>
                     <p className="text-xs font-black text-white uppercase">{user.emergencyContact?.name || 'Emergency Name'}</p>
                     <p className="text-[10px] font-bold text-gray-500">{user.emergencyContact?.phone || 'No Phone Link'}</p>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-emerald-500">Edit Medical Vault</h3>
          <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-800 rounded-full text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-gray-900/40 border border-emerald-500/30 rounded-[32px] p-6 space-y-5">
          <div className="space-y-4">
            <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">Managed Conditions</label>
            <div className="grid grid-cols-2 gap-3">
              {CHRONIC_DISEASES.map(disease => {
                const isSelected = temp.diseases.includes(disease.id as ChronicDisease);
                return (
                  <button
                    key={disease.id}
                    type="button"
                    onClick={() => toggleDisease(disease.id as ChronicDisease)}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center relative ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500' 
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className={`${disease.color} scale-75`}>{disease.icon}</div>
                    <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>{disease.label}</span>
                    {isSelected && <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 text-blue-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <InputGroup label="Blood Group" icon={<Droplet className="w-4 h-4" />} value={temp.bloodGroup} onChange={v => setTemp({...temp, bloodGroup: v})} placeholder="e.g. O+" />
            <InputGroup label="Allergies" icon={<AlertCircle className="w-4 h-4" />} value={temp.allergies} onChange={v => setTemp({...temp, allergies: v})} placeholder="Nuts, Milk" />
          </div>
          
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest px-2">Emergency Hub</h4>
            <InputGroup label="Contact Name" icon={<User className="w-4 h-4" />} value={temp.ecName} onChange={v => setTemp({...temp, ecName: v})} placeholder="Name" />
            <InputGroup label="Contact Phone" icon={<PhoneCall className="w-4 h-4" />} value={temp.ecPhone} onChange={v => setTemp({...temp, ecPhone: v})} placeholder="Number" />
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Clinical Profile
          </button>
        </div>
      </div>
    );
  };

  // 3. Privacy & Data Mode
  const PrivacyMode = () => {
    const p = user.settings.privacy;
    const toggle = (key: keyof typeof p) => {
      onUpdateSettings({ privacy: { ...p, [key]: !p[key] } });
      triggerFeedback('Privacy Sync Complete');
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 px-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-black uppercase tracking-tight">Privacy & Data</h3>
        </div>
        <div className="space-y-4">
          <ToggleItem label="AI Personalization" desc="Custom insights based on health data" active={p.aiPersonalization} onToggle={() => toggle('aiPersonalization')} />
          <ToggleItem label="Voice & Vision AI" desc="Processing audio/images for health checks" active={p.voiceProcessing} onToggle={() => toggle('voiceProcessing')} />
        </div>
      </div>
    );
  };

  // 4. Notification Rules Mode
  const NotificationMode = () => {
    const rules = user.settings.notificationRules;
    const toggle = (key: keyof typeof rules) => {
      if (key === 'emergencyAlerts') return;
      onUpdateSettings({ notificationRules: { ...rules, [key]: !rules[key] } });
      triggerFeedback('Alert Rules Updated');
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3 px-2">
          <Bell className="w-5 h-5 text-orange-400" />
          <h3 className="text-xl font-black uppercase tracking-tight">Notification Rules</h3>
        </div>
        <div className="space-y-4">
          <ToggleItem label="Medication Reminders" desc="Alerts for pill schedules" active={rules.medicationReminders} onToggle={() => toggle('medicationReminders')} />
          <ToggleItem label="Lab Report Alerts" desc="AI Decoding completion updates" active={rules.labReportAlerts} onToggle={() => toggle('labReportAlerts')} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pt-4 pb-24">
      {/* Profile Summary Header */}
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center text-3xl font-black text-white uppercase">
            {user.username.substring(0, 2)}
          </div>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{user.username}</h2>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-black text-blue-400 uppercase">{user.coins} Coins</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-600/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            <span className="text-[10px] font-black text-emerald-400 uppercase">{user.streak} Streak</span>
          </div>
        </div>
      </div>

      {/* Settings Sub-Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
        <ModeButton active={mode === 'PERSONAL'} label="Identity" icon={<User />} onClick={() => { setMode('PERSONAL'); setIsEditing(false); }} />
        <ModeButton active={mode === 'MEDICAL'} label="Medical" icon={<HeartPulse />} onClick={() => { setMode('MEDICAL'); setIsEditing(false); }} />
        <ModeButton active={mode === 'NOTIFICATIONS'} label="Alerts" icon={<Bell />} onClick={() => { setMode('NOTIFICATIONS'); setIsEditing(false); }} />
        <ModeButton active={mode === 'PRIVACY'} label="Privacy" icon={<Shield />} onClick={() => { setMode('PRIVACY'); setIsEditing(false); }} />
      </div>

      {/* Feedback Overlay */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full font-black uppercase text-[10px] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2 border border-white/20">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Current View Controller */}
      <div className="px-1 min-h-[450px]">
        {mode === 'PERSONAL' && <PersonalMode />}
        {mode === 'MEDICAL' && <MedicalMode />}
        {mode === 'PRIVACY' && <PrivacyMode />}
        {mode === 'NOTIFICATIONS' && <NotificationMode />}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 px-1 space-y-4">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center justify-between p-5 bg-blue-600/5 border border-blue-500/20 rounded-[28px] text-blue-400 hover:bg-blue-600/10 transition-all group"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Log Out (Lock Vault)</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={onResetVault} 
          className="w-full flex items-center justify-between p-5 bg-red-500/5 border border-red-500/20 rounded-[28px] text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Reset Vault Data</span>
          </div>
          <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-[8px] font-black text-gray-700 uppercase mt-4 tracking-widest">ArogyaSahay Security Core v2.5.2</p>
      </div>
    </div>
  );
};

// Helper Components
const DisplayCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-white uppercase">{value}</p>
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string, icon: React.ReactNode, value: string, onChange: (v: string) => void, placeholder: string, type?: string }> = ({ label, icon, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest px-2">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700">{icon}</div>
      <input 
        type={type}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full bg-gray-800 border-none p-4 pl-12 rounded-2xl text-xs font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
      />
    </div>
  </div>
);

const ModeButton: React.FC<{ active: boolean, label: string, icon: React.ReactNode, onClick: () => void }> = ({ active, label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all border ${
      active 
        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-105' 
        : 'bg-gray-900 border-gray-800 text-gray-500'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ToggleItem: React.FC<{ label: string, desc: string, active: boolean, onToggle: () => void }> = ({ label, desc, active, onToggle }) => (
  <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-3xl flex items-center justify-between">
    <div className="space-y-0.5">
      <p className="text-xs font-black uppercase text-white">{label}</p>
      <p className="text-[9px] font-bold text-gray-500 uppercase">{desc}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-7 rounded-full transition-all duration-300 relative ${active ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${active ? 'right-1 shadow-lg' : 'left-1'}`}></div>
    </button>
  </div>
);

export default Profile;
