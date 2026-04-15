
import React, { useState, useRef } from 'react';
import { 
  Microscope, 
  FileText, 
  ShoppingBag, 
  Asterisk, 
  ChevronRight, 
  ArrowLeft,
  Upload,
  Sparkles,
  AlertCircle,
  Stethoscope,
  Phone,
  CheckSquare,
  Thermometer,
  Brain,
  Zap,
  Mic,
  Smile,
  Activity,
  User,
  Clock,
  Heart,
  History,
  Shield,
  PhoneCall,
  Save,
  Loader2,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { UserData } from '../types';
import { geminiService } from '../services/geminiService';
import Store from './Store';

interface ClinicalHubProps {
  user: UserData;
  onNavigateToTrends: () => void;
  onPurchaseItem: (id: number, name: string, price: number) => void;
}

const ClinicalHub: React.FC<ClinicalHubProps> = ({ user, onNavigateToTrends, onPurchaseItem }) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'decoder' | 'prep' | 'store' | 'caregiver' | 'symptom' | 'mental' | 'longevity'>('main');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const langContext = `IMPORTANT: Respond ONLY in ${user.settings.language}. Always include a disclaimer that you are an AI assistant and not a medical doctor.`;

  const handleBack = () => {
    setActiveSubView('main');
    setResult(null);
    setLoading(false);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const analysis = await geminiService.analyzeImage(
        `${langContext} Analyze this lab report. Extract test names, values, and normal ranges. Flag highs/lows. Explain what these results might mean for a layperson.`,
        base64,
        file.type
      );
      setResult(analysis);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const runAISubview = async (module: string, prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    
    let systemInstruction = "";
    
    if (module === 'symptom') {
      systemInstruction = "You are a clinical symptom triage assistant. Ask clarifying questions about duration, severity, and associated symptoms. Provide potential causes and suggest when to seek professional help. DO NOT DIAGNOSE.";
    } else if (module === 'mental') {
      systemInstruction = "You are an empathetic mental wellness coach. Provide mindfulness exercises, emotional reflection, and supportive listening. Encourage professional help if self-harm or severe distress is indicated.";
    } else if (module === 'longevity') {
      systemInstruction = "You are a preventative health and longevity expert. Focus on diet, sleep, exercise, and stress management based on the user's current habits. Suggest evidence-based improvements.";
    }

    const res = await geminiService.sendMessage(`${langContext} User Input: ${prompt}`, [], systemInstruction);
    setResult(res);
    setLoading(false);
  };

  const renderModuleHeader = (title: string, icon: React.ReactNode, color: string) => (
    <div className="flex items-center justify-between mb-6">
      <button onClick={handleBack} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
      <div className="flex items-center gap-2">
        <div className={`${color} scale-110`}>{icon}</div>
        <h2 className="text-lg font-black uppercase tracking-tight text-white">{title}</h2>
      </div>
      <div className="w-9"></div>
    </div>
  );

  if (activeSubView === 'store') {
    return (
      <div className="animate-in fade-in slide-in-from-right duration-300 pb-20">
        <button onClick={handleBack} className="flex items-center gap-2 text-blue-500 font-bold uppercase text-[10px] tracking-widest mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </button>
        <Store coins={user.coins} onPurchase={onPurchaseItem} />
      </div>
    );
  }

  // Subview: Lab Decoder (Vision-based)
  if (activeSubView === 'decoder') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        {renderModuleHeader("Lab Decoder", <Microscope className="w-6 h-6" />, "text-emerald-500")}
        <div className="bg-[#141A23] border border-gray-800 rounded-[32px] p-8 text-center space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-800 rounded-3xl p-12 hover:border-emerald-500/50 transition-all cursor-pointer group bg-gray-900/40"
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Upload Lab Report</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Scan Image or PDF</p>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
          
          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black text-emerald-500 uppercase animate-pulse tracking-widest">Sequencing Bio-Data...</p>
            </div>
          )}
        </div>
        {result && (
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-[32px] space-y-4 animate-in fade-in-up duration-500">
             <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Clinical Breakdown</h4>
             </div>
             <div className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap font-medium">{result}</div>
          </div>
        )}
      </div>
    );
  }

  // Subview: Symptom Checker
  if (activeSubView === 'symptom') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        {renderModuleHeader("Symptom Checker", <Thermometer className="w-6 h-6" />, "text-red-500")}
        <div className="bg-[#141A23] border border-gray-800 rounded-[32px] p-6 space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Describe Your Physical Symptoms</p>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: I have a dull ache in my lower back for 3 days..."
            className="w-full bg-gray-900 border border-gray-800 p-5 rounded-2xl text-white font-black focus:border-red-500 outline-none h-40 resize-none text-xs"
          />
          <button 
            onClick={() => runAISubview('symptom', input)}
            disabled={loading || !input.trim()}
            className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run AI Triage"}
          </button>
        </div>
        {result && <div className="p-6 bg-gray-900 border border-gray-800 rounded-[32px] text-xs leading-relaxed text-gray-300 whitespace-pre-wrap animate-in fade-in-up">{result}</div>}
      </div>
    );
  }

  // Subview: Mental Mirror
  if (activeSubView === 'mental') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        {renderModuleHeader("Mental Mirror", <Brain className="w-6 h-6" />, "text-purple-500")}
        <div className="bg-[#141A23] border border-gray-800 rounded-[32px] p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {['😔 Low', '😐 Neutral', '😊 Positive'].map(mood => (
              <button key={mood} onClick={() => setInput(`My current mood is ${mood}. `)} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${input.includes(mood) ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-900 border-gray-800 text-gray-500'}`}>{mood}</button>
            ))}
          </div>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Express your thoughts or concerns..."
            className="w-full bg-gray-900 border border-gray-800 p-5 rounded-2xl text-white font-black focus:border-purple-500 outline-none h-40 resize-none text-xs"
          />
          <button 
            onClick={() => runAISubview('mental', input)}
            disabled={loading || !input.trim()}
            className="w-full py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-600/20 uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aarogya Mirror Check"}
          </button>
        </div>
        {result && <div className="p-6 bg-gray-900 border border-gray-800 rounded-[32px] text-xs leading-relaxed text-gray-300 whitespace-pre-wrap animate-in fade-in-up">{result}</div>}
      </div>
    );
  }

  // Subview: Longevity Coach
  if (activeSubView === 'longevity') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        {renderModuleHeader("Longevity Coach", <Zap className="w-6 h-6" />, "text-amber-500")}
        <div className="bg-[#141A23] border border-gray-800 rounded-[32px] p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
               <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-2">Average Daily Activity</label>
               <input type="text" placeholder="e.g. 10,000 steps, light cardio..." className="w-full bg-transparent text-sm font-black text-white focus:outline-none" onChange={e => setInput(prev => `Activity: ${e.target.value}. ${prev}`)} />
             </div>
             <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
               <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-2">Sleep Habits</label>
               <input type="text" placeholder="e.g. 6 hours, frequent waking..." className="w-full bg-transparent text-sm font-black text-white focus:outline-none" onChange={e => setInput(prev => `${prev} Sleep: ${e.target.value}.`)} />
             </div>
          </div>
          <button 
            onClick={() => runAISubview('longevity', `Analyze my lifestyle markers: ${input}`)}
            disabled={loading || !input.trim()}
            className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Longevity Plan"}
          </button>
        </div>
        {result && <div className="p-6 bg-gray-900 border border-gray-800 rounded-[32px] text-xs leading-relaxed text-gray-300 whitespace-pre-wrap animate-in fade-in-up">{result}</div>}
      </div>
    );
  }

  // Subview: Caregiver Hub
  if (activeSubView === 'caregiver') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-20">
        {renderModuleHeader("Caregiver Hub", <Asterisk className="w-6 h-6" />, "text-red-600")}
        <div className="bg-red-600/5 border border-red-500/20 rounded-[32px] p-8 text-center space-y-6">
           <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto">
             <Shield className="w-10 h-10 text-red-500" />
           </div>
           <div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">SOS Caregiver Link</h3>
             <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">Emergency responders can access your medical vault during a crisis.</p>
           </div>
           <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 text-left">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[8px] font-black text-gray-500 uppercase">Registered Guardian</p>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase rounded">Linked</span>
              </div>
              <p className="text-sm font-black text-white">{user.emergencyContact?.name || 'No Primary Contact'}</p>
              <p className="text-[10px] font-bold text-blue-500 mt-1">{user.emergencyContact?.phone || 'Add contact in Profile settings'}</p>
           </div>
           <button 
             onClick={() => {
                fetch('http://localhost:5000/api/alert/sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contactPhone: user.emergencyContact?.phone,
                    message: `EMERGENCY SOS: ${user.username || 'A patient'} has manually triggered a panic alert. Please contact them immediately.`
                  })
                }).then(() => {
                  alert(`SOS signal dispatched securely via Twilio to ${user.emergencyContact?.name || 'your emergency contact'}.`);
                }).catch(err => {
                  alert("Failed to send SOS. Please check your network or backend credentials.");
                  console.error(err);
                });
             }}
             className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
           >
              <PhoneCall className="w-4 h-4" /> Trigger Emergency Alert
           </button>
        </div>
        <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-[32px]">
           <h4 className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Shared Care Permissions</h4>
           <div className="space-y-3 opacity-40">
              {['Medication History', 'Daily Vitals', 'Allergy List'].map(item => (
                <div key={item} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-black text-white uppercase">{item}</span>
                  <Check className="w-3 h-3 text-emerald-500" />
                </div>
              ))}
           </div>
           <p className="text-[8px] text-gray-700 font-bold uppercase text-center mt-4 italic">Caregiver management for dependents coming in v3.0.</p>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="space-y-8 pt-4 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">CLINICAL AI VAULT</h3>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 rounded-full uppercase tracking-widest">v2.5 AI ENGINE</span>
      </div>
      
      <div className="bg-[#141A23]/50 border border-gray-800/50 rounded-[48px] overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="divide-y divide-gray-800/30">
          <HubItem icon={<History />} title="Health Archives" badge="HISTORY" onClick={onNavigateToTrends} color="text-emerald-400" />
          <HubItem icon={<ImageIcon />} title="AI Lab Decoder" badge="VISION" onClick={() => setActiveSubView('decoder')} color="text-blue-500" />
          <HubItem icon={<ShoppingBag />} title="AI Hub Store" badge="SHOP" onClick={() => setActiveSubView('store')} color="text-amber-400" />
          <HubItem icon={<Thermometer />} title="Symptom Checker" badge="TRIAGE" onClick={() => setActiveSubView('symptom')} color="text-red-500" />
          <HubItem icon={<Brain />} title="Mental Mirror" badge="MIND" onClick={() => setActiveSubView('mental')} color="text-purple-500" />
          <HubItem icon={<Zap />} title="Longevity Coach" badge="LONGEVITY" onClick={() => setActiveSubView('longevity')} color="text-orange-500" />
          <HubItem icon={<Asterisk />} title="Caregiver Hub" badge="SOS" onClick={() => setActiveSubView('caregiver')} color="text-red-600" />
        </div>
      </div>

      <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-[40px] flex items-center gap-4 relative overflow-hidden group">
        <Smile className="w-10 h-10 text-blue-400 group-hover:rotate-12 transition-transform" />
        <div className="flex-1 relative z-10">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Language: {user.settings.language}</h4>
          <p className="text-[9px] text-gray-500 font-medium uppercase leading-relaxed mt-1">Clinical logic and AI responses are tailored to your medical profile.</p>
        </div>
        <Sparkles className="absolute -right-2 -bottom-2 w-16 h-16 text-blue-500/5 rotate-12" />
      </div>
    </div>
  );
};

// Internal Helper Components
const HubItem: React.FC<{ icon: React.ReactNode, title: string, badge: string, onClick: () => void, color?: string }> = ({ icon, title, badge, onClick, color = "text-blue-500" }) => (
  <button onClick={onClick} className="w-full p-7 flex items-center justify-between group active:bg-blue-600/5 transition-all outline-none">
    <div className="flex items-center gap-5">
      <div className={`${color} group-hover:scale-125 transition-transform duration-300`}>{icon}</div>
      <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:translate-x-1 transition-transform">{title}</h4>
    </div>
    <div className="flex items-center gap-4">
      <span className="px-2 py-0.5 bg-gray-800 text-[7px] font-black text-gray-400 rounded-lg uppercase tracking-widest border border-gray-700 shadow-sm">{badge}</span>
      <ChevronRight className="w-4 h-4 text-gray-800 group-hover:text-blue-500 transition-colors" />
    </div>
  </button>
);

export default ClinicalHub;
