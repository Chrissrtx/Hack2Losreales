import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { user, login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [teamCode, setTeamCode] = useState('');
  const [email, setEmail] = useState('operator@tuckersoft.com'); // default email as per enunciado
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Clear global auth errors when mounting/changing fields
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setValidationError(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!teamCode.trim() || !email.trim() || !password.trim()) {
      setValidationError('All authorization coordinates are required.');
      return;
    }

    setLoading(true);
    try {
      await login({
        teamCode: teamCode.trim().toUpperCase(),
        email: email.trim(),
        password: password
      });
      navigate('/dashboard');
    } catch {
      // Error handled by AuthContext and shown in layout
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Visual background patterns */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse duration-[8000ms]" />
      
      {/* Sci-Fi Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="w-full max-w-md bg-[#0f111a] border border-indigo-500/20 rounded-xl p-8 shadow-2xl shadow-black/80 relative z-10">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-indigo-500/10">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/70 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block"></span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 tracking-wider">CONSOLE_CONNECT_V1.0</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase m-0">
            TROPEL<span className="text-indigo-400">CARE</span>
          </h1>
          <p className="text-xs font-mono text-gray-500 mt-2 uppercase tracking-wide">
            COLONY CONTROLLER INITIALIZATION
          </p>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs space-y-1">
            <div className="font-semibold text-rose-300">AUTHENTICATION_FAILURE:</div>
            <div>{validationError || error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-mono font-semibold tracking-wider text-indigo-400 mb-1.5 uppercase">
              Workspace Team Code
            </label>
            <input
              type="text"
              placeholder="e.g. TEAM-001"
              value={teamCode}
              onChange={handleInputChange(setTeamCode)}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#07080c] border border-indigo-500/10 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold tracking-wider text-indigo-400 mb-1.5 uppercase">
              Operator Email Address
            </label>
            <input
              type="email"
              placeholder="operator@tuckersoft.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#07080c] border border-indigo-500/10 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold tracking-wider text-indigo-400 mb-1.5 uppercase">
              Security Decryption Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              disabled={loading}
              className="w-full px-4 py-3 bg-[#07080c] border border-indigo-500/10 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-300"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 mt-2 rounded-lg font-mono font-bold text-sm tracking-widest text-center uppercase border transition-all duration-300 ${
              loading
                ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-400/40 cursor-not-allowed'
                : 'bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] cursor-pointer'
            }`}
          >
            {loading ? 'SECURE_CONNECTING...' : 'INITIATE_SESSION'}
          </button>
          
        </form>
        
      </div>
    </div>
  );
};
