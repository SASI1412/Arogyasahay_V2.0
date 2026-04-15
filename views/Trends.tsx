
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
  Download, Activity, Droplets, Thermometer, History, TrendingUp, ArrowLeft, FileText, CheckCircle
} from 'lucide-react';
import { UserData } from '../types';

interface TrendsProps {
  user: UserData;
  onBack: () => void;
}

const Trends: React.FC<TrendsProps> = ({ user, onBack }) => {
  const [reportType, setReportType] = useState<'weekly' | 'history'>('weekly');
  const [isExporting, setIsExporting] = useState(false);

  const vitalsChartData = useMemo(() => {
    return [...user.vitals].reverse().map(v => ({
      date: v.date.split('-').slice(1).join('/'),
      bp_sys: v.bp_systolic,
      bp_dia: v.bp_diastolic,
      sugar: v.sugar,
      tsh: v.tsh
    }));
  }, [user.vitals]);

  const downloadMonthlyPDF = () => {
    setIsExporting(true);
    const reportData = [
      `----------------------------------------------------`,
      `      AROGYASAHAY MONTHLY CLINICAL REPORT           `,
      `----------------------------------------------------`,
      `Generated: ${new Date().toLocaleString()}`,
      `User Profile: ${user.username.toUpperCase()} (${user.age || 'N/A'}Y, ${user.gender || 'N/A'})`,
      `Chronic Conditions: ${user.diseases.join(' | ')}`,
      `Blood Group: ${user.bloodGroup || 'Not Specified'}`,
      `----------------------------------------------------`,
      `            1. ADHERENCE SUMMARY                    `,
      `----------------------------------------------------`,
      `Streak: ${user.streak} Days`,
      `Total Logged Actions: ${user.history.length}`,
      `Current Vault Coins: ${user.coins}`,
      `----------------------------------------------------`,
      `            2. RECENT VITAL TRENDS                  `,
      `----------------------------------------------------`,
      ...user.vitals.slice(0, 10).map(v => `[${v.date}] BP: ${v.bp_systolic}/${v.bp_diastolic} | Sugar: ${v.sugar} mg/dL | TSH: ${v.tsh}`),
      `----------------------------------------------------`,
      `            3. MEDICATION LEDGER                    `,
      `----------------------------------------------------`,
      ...user.medications.map(m => `- ${m.name.toUpperCase()} (${m.dosage}) at ${m.time} | Stock: ${m.count}`),
      `----------------------------------------------------`,
      `         END OF CLINICAL VAULT REPORT               `,
      `----------------------------------------------------`,
    ].join('\n');

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Arogya_Monthly_Report_${new Date().getMonth() + 1}_${new Date().getFullYear()}.txt`;
    
    setTimeout(() => {
      link.click();
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pt-2 pb-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-1">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-500 font-black uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>
        <h1 className="text-xl font-black text-white uppercase">Health Archives</h1>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Monthly Clinical Report</h3>
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">PDF Export Ready for Doctors</p>
          </div>
          <button 
            onClick={downloadMonthlyPDF}
            disabled={isExporting}
            className="w-full py-4 bg-white text-blue-700 font-black uppercase rounded-2xl shadow-xl flex items-center justify-center gap-2 text-xs tracking-widest active:scale-95 transition-all"
          >
            {isExporting ? <span className="animate-pulse">Compiling Vault...</span> : <><FileText className="w-4 h-4" /> Download PDF Report</>}
          </button>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
      </div>

      <div className="flex bg-gray-900/50 p-1 rounded-2xl border border-gray-800">
        <button onClick={() => setReportType('weekly')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${reportType === 'weekly' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Visual Charts</button>
        <button onClick={() => setReportType('history')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${reportType === 'history' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Activity Log</button>
      </div>

      {reportType === 'history' ? (
        <div className="space-y-3">
          {user.history.length === 0 ? (
            <div className="p-12 text-center opacity-30 uppercase font-black text-[10px]">Vault empty</div>
          ) : (
            user.history.map(item => (
              <div key={item.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xs">
                   {item.type === 'medication' ? '💊' : item.type === 'purchase' ? '🛒' : '📊'}
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-white uppercase">{item.title}</h4>
                  <p className="text-[9px] text-gray-500 uppercase font-bold">{item.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {user.diseases.includes('BP') && vitalsChartData.length > 0 && (
            <ChartContainer title="BP Trends (mmHg)" icon={<Activity className="w-3 h-3 text-red-500" />}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" hide />
                  <YAxis width={30} fontSize={8} stroke="#475569" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0B0E14', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="bp_sys" stroke="#ef4444" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="bp_dia" stroke="#f87171" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {user.diseases.includes('Diabetes') && vitalsChartData.length > 0 && (
            <ChartContainer title="Sugar Curve (mg/dL)" icon={<Droplets className="w-3 h-3 text-blue-500" />}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vitalsChartData}>
                  <defs>
                    <linearGradient id="trendSugar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="date" hide />
                  <YAxis width={30} fontSize={8} stroke="#475569" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0B0E14', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="sugar" stroke="#3b82f6" fill="url(#trendSugar)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {user.vitals.length === 0 && (
            <div className="p-8 text-center bg-gray-900/30 border border-dashed border-gray-800 rounded-[32px] uppercase font-black text-[9px] text-gray-700">No telemetry data recorded</div>
          )}
        </div>
      )}
    </div>
  );
};

const ChartContainer: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
  <div className="bg-[#141A23] border border-gray-800 rounded-[32px] p-5">
    <h4 className="text-[9px] font-black text-gray-500 uppercase mb-4 flex items-center gap-2">{icon} {title}</h4>
    <div className="h-40 w-full">{children}</div>
  </div>
);

export default Trends;
