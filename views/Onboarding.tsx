
import React, { useState } from 'react';
// Added ChevronRight to imports
import { ChevronLeft, Search, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';
import { CHRONIC_DISEASES } from '../constants';
import { ChronicDisease } from '../types';

interface OnboardingProps {
  onComplete: (diseases: ChronicDisease[]) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [selectedDiseases, setSelectedDiseases] = useState<ChronicDisease[]>([]);

  const toggleDisease = (id: ChronicDisease) => {
    if (id === 'None') {
      setSelectedDiseases(['None']);
      return;
    }
    
    setSelectedDiseases(prev => {
      const filtered = prev.filter(d => d !== 'None');
      if (filtered.includes(id)) {
        return filtered.filter(d => d !== id);
      } else {
        return [...filtered, id];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex flex-col p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button className="p-2 rounded-full bg-gray-800/50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} className={`w-8 h-1 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
          ))}
        </div>
        <button className="text-sm font-medium text-gray-500 hover:text-white" onClick={() => onComplete([])}>Skip</button>
      </div>

      <div className="flex-1">
        <p className="text-blue-500 text-[10px] font-bold tracking-widest uppercase mb-2">ONBOARDING - STEP 2 OF 5</p>
        <h1 className="text-3xl font-bold mb-4">Let's tailor your <span className="text-blue-500">care</span>.</h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">Select any chronic conditions you are currently managing so our AI can prepare your smart pharmacy.</p>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search for other conditions..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Common Conditions</h3>
        <div className="grid grid-cols-2 gap-4">
          {CHRONIC_DISEASES.map(disease => {
            const isSelected = selectedDiseases.includes(disease.id as ChronicDisease);
            return (
              <button
                key={disease.id}
                onClick={() => toggleDisease(disease.id as ChronicDisease)}
                className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-3 text-center relative overflow-hidden ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`${disease.color} ${isSelected ? 'scale-110' : ''} transition-transform`}>
                  {disease.icon}
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>{disease.label}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/20 rounded-2xl flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">AI Assistant Note</h4>
            <p className="text-[11px] text-blue-200/70 leading-relaxed">I will cross-reference these conditions with your medications to prevent any adverse interactions.</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => onComplete(selectedDiseases)}
          disabled={selectedDiseases.length === 0}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
        >
          Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
