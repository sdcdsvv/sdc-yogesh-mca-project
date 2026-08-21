import React, { useState, useEffect } from 'react';
import { Phone, AlertTriangle, Loader2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  getEmergencyContacts,
  getEmergencyAdvice,
  getAlerts,
  type EmergencyContact,
  type TravelAlert
} from '../../services/api';

const EmergencyAlert: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<TravelAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [situation, setSituation] = useState('');
  const [location, setLocation] = useState('');
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [contactsRes, alertsRes] = await Promise.all([
        getEmergencyContacts(),
        getAlerts()
      ]);

      if (contactsRes.success) {
        setContacts(contactsRes.contacts || []);
      }

      if (alertsRes.success) {
        setAlerts(alertsRes.alerts || []);
      }
    } catch (err) {
      setError('Failed to load emergency information');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim()) return;

    setIsGettingAdvice(true);
    setAdvice(null);

    try {
      const response = await getEmergencyAdvice(situation, location);
      if (response.success && response.advice) {
        setAdvice(response.advice);
      } else {
        throw new Error(response.message || 'Failed to get advice');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get advice');
    } finally {
      setIsGettingAdvice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Travel Alerts Section - Separate Card */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-800">Active Travel Alerts</h3>
              <p className="text-sm text-stone-600">Critical safety notifications</p>
            </div>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-stone-800 text-base">{alert.title}</h4>
                  <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${
                    alert.severity.toLowerCase() === 'high' ? 'bg-red-600 text-white' :
                    alert.severity.toLowerCase() === 'moderate' ? 'bg-yellow-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-stone-700 mb-3 leading-relaxed">{alert.message}</p>
                <div className="flex items-center justify-between text-sm text-stone-600 bg-white/80 rounded-lg px-3 py-2 border border-red-100">
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    <span className="font-medium">{alert.location}</span>
                  </span>
                  <span>Until: {alert.valid_until}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts - Separate Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl shadow-lg">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-800">Emergency Contacts</h3>
            <p className="text-sm text-stone-600">24/7 helpline numbers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className="mb-3">
                <h4 className="font-bold text-stone-800 text-base mb-1">{contact.name}</h4>
                <p className="text-sm text-stone-600">{contact.description}</p>
              </div>
              <a
                href={`tel:${contact.number}`}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                <span>{contact.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* AI Emergency Advisor - Separate Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-stone-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-gradient-to-br from-stone-700 to-slate-800 rounded-xl shadow-lg">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-stone-800">AI Emergency Advisor</h3>
            <p className="text-sm text-stone-600">Get instant help & guidance</p>
          </div>
        </div>
        <form onSubmit={handleGetAdvice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Describe your situation
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe your emergency situation in detail..."
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all bg-stone-50 text-stone-800 placeholder-stone-400"
              rows={4}
              required
            />
          </div>
          <div className="grid md:grid-cols-[1fr_auto] gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your location (optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Dehradun, Mussoorie"
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 transition-all bg-stone-50 text-stone-800 placeholder-stone-400"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isGettingAdvice || !situation.trim()}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-stone-700 to-slate-800 text-white rounded-xl hover:from-stone-800 hover:to-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
              >
                {isGettingAdvice ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Get Advice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {advice && (
          <div className="mt-5 p-5 bg-gradient-to-br from-stone-50 to-slate-50 border-2 border-stone-300 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-300">
              <span className="text-3xl">🤖</span>
              <h4 className="font-bold text-stone-800 text-lg">AI Emergency Advice</h4>
            </div>
            <div className="prose prose-stone prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-stone-700 mb-3 last:mb-0 leading-relaxed text-base">{children}</p>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-stone-800">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-stone-800">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-stone-700">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-2 text-stone-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-2 text-stone-700">{children}</ol>,
                  li: ({ children }) => <li className="text-stone-700 text-base">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-stone-900">{children}</strong>,
                  em: ({ children }) => <em className="italic text-stone-600">{children}</em>,
                  code: ({ children }) => (
                    <code className="bg-stone-200 text-stone-800 px-2 py-1 rounded text-sm font-mono">{children}</code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-stone-100 p-4 rounded-lg text-sm overflow-x-auto border border-stone-300 my-3">{children}</pre>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-stone-700 hover:text-stone-900 underline font-medium" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {advice}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-400 text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default EmergencyAlert;

