
import React, { useState } from 'react';
import { X, Activity, Droplets, Thermometer, Save, Calendar, ShieldCheck } from 'lucide-react';
import { ChronicDisease, UserVitals } from '../types';

interface VitalsLoggerProps {
  diseases: ChronicDisease[];
  onSave: (vitals: UserVitals) => void;
  onClose: () => void;
}

const VitalsLogger: React.FC<VitalsLoggerProps> = ({ diseases, onSave, onClose }) => {
  const activeDiseases = diseases.filter(d => d !== 'None');
  
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [sugar, setSugar] = useState('');
  const [tsh, setTsh] = useState('');

  const handleSave = () => {
    // Basic validation to prevent saving empty readings for active conditions
    if (diseases.includes('BP') && (!systolic || !diastolic)) return;
    if (diseases.includes('Diabetes') && !sugar) return;
    if (diseases.includes('Thyroid') && !tsh) return;

    onSave({
      bp_systolic: diseases.includes('BP') ? (parseInt(systolic) || 0) : 0,
      bp_diastolic: diseases.includes('BP') ? (parseInt(diastolic) || 0) : 0,
      sugar: diseases.includes('Diabetes') ? (parseInt(sugar) || 0) : 0,
      tsh: diseases.includes('Thyroid') ? (parseFloat(tsh) || 0) : 0,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const hasChronic = activeDiseases.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#141A23] rounded-t-[40px] p-8 space-y-8 animate-[slideUp_0.4s_ease-out]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Log Reading</h2>
            <p className="text-xs text-gray-500 font-medium">Updating data for: {activeDiseases.join(', ') || 'General'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-800 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {!hasChronic && (
            <div className="text-center space-y-2 py-4">
              <ShieldCheck className="w-12 h-12 text-green-500/20 mx-auto" />
              <p className="text-sm text-gray-500 font-medium uppercase">No chronic diseases selected in your profile.</p>
            </div>
          )}
          
          {diseases.includes('BP') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Blood Pressure (mmHg)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 focus-within:border-red-500/50 transition-colors">
                  <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Systolic</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 120"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full bg-transparent text-xl font-black focus:outline-none" 
                  />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 focus-within:border-red-500/50 transition-colors">
                  <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Diastolic</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 80"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full bg-transparent text-xl font-black focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {diseases.includes('Diabetes') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Blood Sugar (mg/dL)</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 focus-within:border-blue-500/50 transition-colors">
                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Fasting Glucose</label>
                <input 
                  type="number" 
                  placeholder="e.g. 95"
                  value={sugar}
                  onChange={(e) => setSugar(e.target.value)}
                  className="w-full bg-transparent text-xl font-black focus:outline-none" 
                />
              </div>
            </div>
          )}

          {diseases.includes('Thyroid') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">TSH Levels (mIU/L)</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 focus-within:border-purple-500/50 transition-colors">
                <label className="block text-[8px] font-black text-gray-500 uppercase mb-1">Current TSH</label>
                <input 
                  type="number" 
                  step="0.1"
                  placeholder="e.g. 2.5"
                  value={tsh}
                  onChange={(e) => setTsh(e.target.value)}
                  className="w-full bg-transparent text-xl font-black focus:outline-none" 
                />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          disabled={!hasChronic}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:grayscale disabled:opacity-50"
        >
          <Save className="w-5 h-5" /> Save to Vault
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VitalsLogger;
