import React, { useState } from 'react';
import { Users, AlertCircle, CheckCircle2, FileText, Sliders, X, TrendingUp, Activity, Search } from 'lucide-react';

const MOCK_PATIENTS = [
  {
    id: '#P-104',
    name: 'John Doe',
    prescription: 'Bicep Curls: 3x10 daily',
    compliance: 'ON_TRACK',
    lastActive: 'Today, 8:45 AM',
    avgScore: 94,
    notes: 'Patient showing excellent ROM improvement.'
  },
  {
    id: '#P-105',
    name: 'Sarah Smith',
    prescription: 'Squats: 2x15 daily',
    compliance: 'NEEDS_REVIEW',
    lastActive: 'Yesterday',
    avgScore: 72,
    notes: 'Struggling with depth on squats. Adjust targets.'
  },
  {
    id: '#P-108',
    name: 'Michael Chen',
    prescription: 'Knee Extension: 3x8 daily',
    compliance: 'MISSED',
    lastActive: '4 days ago',
    avgScore: 88,
    notes: 'Check in on pain levels during extension.'
  }
];

const TherapistPortal = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getComplianceBadge = (status) => {
    switch (status) {
      case 'ON_TRACK':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 size={14} /> On Track</span>;
      case 'NEEDS_REVIEW':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={14} /> Needs Review</span>;
      case 'MISSED':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={14} /> Missed 3+ Days</span>;
      default:
        return null;
    }
  };

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative">
      
      {/* 1. Therapist Dashboard Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
            <Users className="text-[#0D9488]" size={32} />
            Therapist Clinical Portal
          </h1>
          <p className="text-slate-500 text-lg mt-1 font-medium">12 Active Patients Under Supervision</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] shadow-sm w-full md:w-64"
          />
        </div>
      </section>

      {/* 2. Patient Roster Grid / Table */}
      <section className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name & ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Prescription</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Compliance Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Form Score</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-[#0F172A]">{patient.name}</div>
                    <div className="text-sm font-medium text-slate-500">{patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#0D9488]" />
                      {patient.prescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getComplianceBadge(patient.compliance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${patient.avgScore >= 90 ? 'text-emerald-600' : patient.avgScore >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {patient.avgScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                    {patient.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setSelectedPatient(patient)}
                      className="text-[#0D9488] hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Activity size={16} /> Review Telemetry
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Patient Detail Modal / Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col relative">
            
            <button 
              onClick={() => setSelectedPatient(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold text-[#0F172A]">{selectedPatient.name}</h2>
              <div className="flex gap-4 mt-2">
                <span className="text-sm font-medium text-slate-500">ID: {selectedPatient.id}</span>
                {getComplianceBadge(selectedPatient.compliance)}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50 flex-grow">
              
              {/* Left Column: ROM Mock Chart */}
              <div className="lg:col-span-2 space-y-6">
                <div className="clinical-card p-6 border-0 shadow-md">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-[#0D9488]" />
                    Live ROM Recovery Curve
                  </h3>
                  <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 font-medium">
                    [ Detailed Line Chart Analytics ]
                  </div>
                </div>

                <div className="clinical-card p-6 border-0 shadow-md">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-[#0D9488]" />
                    Recent Session Logs
                  </h3>
                  <div className="bg-white rounded-lg border border-slate-200 p-4 text-sm text-slate-600 font-medium">
                    <p className="py-2 border-b border-slate-100"><strong>Today:</strong> 3x10 Squats completed. Avg Depth: 95°. Form: 94%</p>
                    <p className="py-2 border-b border-slate-100"><strong>Yesterday:</strong> 2x10 Squats completed. Avg Depth: 102°. Form: 88%</p>
                    <p className="py-2 text-slate-400"><strong>2 Days Ago:</strong> Missed Session</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Therapist Controls */}
              <div className="space-y-6">
                <div className="clinical-card p-6 border-t-4 border-t-[#0F172A] shadow-md">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Sliders size={20} className="text-[#0F172A]" />
                    Prescription Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Reps</label>
                      <input type="number" defaultValue={10} className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Sets</label>
                      <input type="number" defaultValue={3} className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Therapist Notes</label>
                      <textarea defaultValue={selectedPatient.notes} className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-700 outline-none focus:border-[#0D9488] bg-slate-50 h-24 resize-none transition-colors" />
                    </div>
                    
                    <button 
                      onClick={() => {
                        alert('Prescription remotely updated and synced to patient device.');
                        setSelectedPatient(null);
                      }}
                      className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 mt-2"
                    >
                      Update Prescription
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TherapistPortal;
