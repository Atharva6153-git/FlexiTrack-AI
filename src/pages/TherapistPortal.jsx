import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, CheckCircle2, FileText, Sliders, X, TrendingUp, Activity, Search, Plus } from 'lucide-react';

const TherapistPortal = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  
  const [selectedPatientSessions, setSelectedPatientSessions] = useState([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ sessionId: null, mistakes: '', improvements: '' });

  const THERAPIST_ID = 'therapist_1';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/patients/therapist/${THERAPIST_ID}`);
      const patientsData = res.data;
      
      const enhancedPatients = await Promise.all(patientsData.map(async (p) => {
        try {
          const compRes = await axios.get(`${API_URL}/api/patients/${p.patientId}/compliance`);
          const complianceData = compRes.data;
          
          let overallCompliance = 'ON_TRACK';
          if (complianceData.length === 0) {
             overallCompliance = 'NO_DATA';
          } else if (complianceData.some(c => c.complianceStatus === 'behind')) {
             overallCompliance = 'NEEDS_REVIEW';
          }
          
          return { ...p, complianceData, compliance: overallCompliance };
        } catch (e) {
          console.error("Failed to fetch compliance for", p.patientId, e);
          return { ...p, complianceData: [], compliance: 'ERROR' };
        }
      }));
      setPatients(enhancedPatients);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPatient = {
      name: formData.get('name'),
      patientId: formData.get('patientId'),
      therapistId: THERAPIST_ID,
    };
    try {
      await axios.post(`${API_URL}/api/patients`, newPatient);
      setIsNewPatientModalOpen(false);
      fetchPatients();
    } catch(err) {
      console.error(err);
      alert("Failed to create patient. Make sure patient ID is unique.");
    }
  };

  const handleUpdatePrescription = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const presc = {
      exerciseType: formData.get('exerciseType'),
      targetReps: Number(formData.get('targetReps')),
      targetSets: Number(formData.get('targetSets'))
    };
    try {
      await axios.patch(`${API_URL}/api/patients/${selectedPatient.patientId}/prescription`, presc);
      alert('Prescription remotely updated and synced to patient device.');
      setSelectedPatient(null);
      fetchPatients();
    } catch(err) {
      console.error(err);
      alert("Failed to update prescription.");
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      setIsSessionsLoading(true);
      axios.get(`${API_URL}/api/sessions/patient/${selectedPatient.patientId}`)
        .then(res => setSelectedPatientSessions(res.data))
        .catch(err => console.error(err))
        .finally(() => setIsSessionsLoading(false));
    } else {
      setSelectedPatientSessions([]);
      setFeedbackForm({ sessionId: null, mistakes: '', improvements: '' });
    }
  }, [selectedPatient, API_URL]);

  const handleSaveFeedback = async (sessionId) => {
    try {
      await axios.patch(`${API_URL}/api/sessions/${sessionId}/feedback`, {
        mistakes: feedbackForm.mistakes,
        improvements: feedbackForm.improvements,
        reviewedBy: THERAPIST_ID
      });
      setSelectedPatientSessions(prev => prev.map(s => {
        if (s._id === sessionId) {
          return { ...s, feedback: { mistakes: feedbackForm.mistakes, improvements: feedbackForm.improvements, reviewedBy: THERAPIST_ID } };
        }
        return s;
      }));
      setFeedbackForm({ sessionId: null, mistakes: '', improvements: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to save feedback');
    }
  };

  const getComplianceBadge = (status) => {
    switch (status) {
      case 'ON_TRACK':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 size={14} /> On Track</span>;
      case 'NEEDS_REVIEW':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={14} /> Needs Review</span>;
      case 'MISSED':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max"><AlertCircle size={14} /> Missed 3+ Days</span>;
      case 'NO_DATA':
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">No Sessions Yet</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">Unknown</span>;
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-slate-500 text-lg mt-1 font-medium">{patients.length} Active Patients Under Supervision</p>
        </div>
        
        <div className="flex gap-4">
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
          <button 
            onClick={() => setIsNewPatientModalOpen(true)}
            className="bg-[#0D9488] hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={18} /> New Patient
          </button>
        </div>
      </section>

      {/* 2. Patient Roster Grid / Table */}
      <section className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name & ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Prescriptions</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488]"></div>
                    </div>
                    Loading patients...
                  </td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.patientId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#0F172A]">{patient.name}</div>
                      <div className="text-sm font-medium text-slate-500">ID: {patient.patientId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {patient.prescriptions?.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {patient.prescriptions.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <FileText size={14} className="text-[#0D9488]" />
                              {p.exerciseType.replace('_', ' ')}: {p.targetSets}x{p.targetReps}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No active prescriptions</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getComplianceBadge(patient.compliance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="text-[#0D9488] hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Activity size={16} /> Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-medium">
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Patient Detail / Update Prescription Modal */}
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
                <span className="text-sm font-medium text-slate-500">ID: {selectedPatient.patientId}</span>
                {getComplianceBadge(selectedPatient.compliance)}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50 flex-grow">
              
              {/* Left Column: Compliance Stats */}
              <div className="space-y-6">
                <div className="clinical-card p-6 border-0 shadow-md">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-[#0D9488]" />
                    Weekly Compliance
                  </h3>
                  {selectedPatient.complianceData && selectedPatient.complianceData.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPatient.complianceData.map(c => (
                        <div key={c.exerciseType} className="bg-white rounded-lg border border-slate-200 p-4 text-sm font-medium">
                          <div className="flex justify-between items-center mb-2">
                            <strong className="text-slate-800">{c.exerciseType.replace('_', ' ')}</strong>
                            {c.complianceStatus === 'on-track' 
                              ? <span className="text-emerald-600 font-bold">On Track</span> 
                              : <span className="text-amber-600 font-bold">Behind</span>}
                          </div>
                          <div className="text-slate-600">Sessions this week: {c.sessionsThisWeek}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No compliance data available.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Therapist Controls (Update Prescription) */}
              <div className="space-y-6">
                <div className="clinical-card p-6 border-t-4 border-t-[#0F172A] shadow-md">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <Sliders size={20} className="text-[#0F172A]" />
                    Update / Assign Prescription
                  </h3>
                  
                  <form onSubmit={handleUpdatePrescription} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Exercise Type</label>
                      <select name="exerciseType" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" required>
                        <option value="BICEP_CURL">Bicep Curl</option>
                        <option value="SQUAT">Squat</option>
                        <option value="KNEE_EXTENSION">Knee Extension</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Reps</label>
                        <input type="number" name="targetReps" defaultValue={10} min={1} required className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Sets</label>
                        <input type="number" name="targetSets" defaultValue={3} min={1} required className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" />
                      </div>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 mt-4"
                    >
                      Update Prescription
                    </button>
                  </form>
                </div>
              </div>

            </div>
            
            {/* Bottom Row: Recent Sessions & Feedback */}
            <div className="p-8 bg-white border-t border-slate-100 flex-grow">
              <h3 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#0D9488]" />
                Recent Sessions & Feedback
              </h3>
              {isSessionsLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488]"></div>
                </div>
              ) : selectedPatientSessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {selectedPatientSessions.map(session => (
                    <div key={session._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow bg-white">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          {session.exerciseType.replace('_', ' ')}
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${session.formAccuracyScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {session.formAccuracyScore}% Form
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                          <Activity size={14} className="text-slate-400" />
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mb-4 text-sm text-slate-600 font-medium bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div><span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Peak Angle</span> {session.maxFlexionAngle}°</div>
                        <div><span className="text-slate-400 block text-xs uppercase tracking-wider mb-0.5">Volume</span> {session.totalReps} Reps</div>
                      </div>
                      
                      {feedbackForm.sessionId === session._id ? (
                        <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">Mistakes Noticed</label>
                            <textarea 
                              className="w-full border border-teal-200 rounded-lg p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white" 
                              rows="2"
                              placeholder="e.g. Elbows flaring out..."
                              value={feedbackForm.mistakes}
                              onChange={e => setFeedbackForm({...feedbackForm, mistakes: e.target.value})}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">Suggested Improvements</label>
                            <textarea 
                              className="w-full border border-teal-200 rounded-lg p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white" 
                              rows="2"
                              placeholder="e.g. Keep elbows tucked to sides..."
                              value={feedbackForm.improvements}
                              onChange={e => setFeedbackForm({...feedbackForm, improvements: e.target.value})}
                            ></textarea>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <button onClick={() => handleSaveFeedback(session._id)} className="bg-[#0D9488] hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Save Feedback</button>
                            <button onClick={() => setFeedbackForm({ sessionId: null, mistakes: '', improvements: '' })} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {session.feedback && session.feedback.reviewedBy ? (
                            <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl mb-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <CheckCircle2 size={16} className="text-teal-600" />
                                <p className="text-xs font-extrabold text-teal-800 uppercase tracking-wider">Your Feedback</p>
                              </div>
                              {session.feedback.mistakes && <p className="text-sm text-teal-900 mb-2"><span className="font-semibold block text-xs text-teal-700 mb-0.5">Mistakes:</span> {session.feedback.mistakes}</p>}
                              {session.feedback.improvements && <p className="text-sm text-teal-900"><span className="font-semibold block text-xs text-teal-700 mb-0.5">Improvements:</span> {session.feedback.improvements}</p>}
                            </div>
                          ) : null}
                          <button 
                            onClick={() => setFeedbackForm({ 
                              sessionId: session._id, 
                              mistakes: session.feedback?.mistakes || '', 
                              improvements: session.feedback?.improvements || '' 
                            })} 
                            className="text-[#0D9488] hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-bold"
                          >
                            <FileText size={16} />
                            {session.feedback && session.feedback.reviewedBy ? 'Edit Feedback' : 'Add Feedback'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 font-medium">No sessions recorded by this patient yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. New Patient Modal */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 flex flex-col relative p-8">
            <button 
              onClick={() => setIsNewPatientModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-6">Add New Patient</h2>
            
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" 
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Patient ID (Must be unique)</label>
                <input 
                  type="text" 
                  name="patientId" 
                  required 
                  defaultValue={`patient_${Math.floor(Math.random()*10000)}`}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold text-[#0F172A] outline-none focus:border-[#0D9488] bg-slate-50 transition-colors" 
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#0D9488] hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 mt-4"
              >
                Create Patient
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TherapistPortal;
