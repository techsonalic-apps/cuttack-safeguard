
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Info,
  ChevronRight,
  X,
  Smartphone,
  Users,
  Settings,
  Volume2,
  Clock,
  Heart,
  Globe,
  Zap,
  RotateCcw,
  Code,
  ShieldCheck,
  Share2,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  EyeOff,
  VolumeX,
  Volume2 as VolumeIcon,
  Scale,
  Video,
  Mic,
  Download,
  FolderLock
} from 'lucide-react';
import Layout from './components/Layout';
import { Contact, ContactType, UserSettings, Language, Helpline, Evidence } from './types';
import { INITIAL_CONTACTS, INITIAL_SETTINGS, TRANSLATIONS, HELPLINE_DIRECTORY, DEFAULT_EMERGENCY_MESSAGE } from './constants';
import { getCurrentLocation, LocationData } from './services/locationService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sos' | 'contacts' | 'directory' | 'settings'>('sos');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const lastTapRef = useRef<number>(0);
  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    const saved = localStorage.getItem('csg_data');
    if (saved) {
      const data = JSON.parse(saved);
      setContacts(data.contacts || INITIAL_CONTACTS);
      setSettings(data.settings || INITIAL_SETTINGS);
    } else {
      setContacts(INITIAL_CONTACTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('csg_data', JSON.stringify({ contacts, settings }));
  }, [contacts, settings]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      executeSOS();
    }
  }, [countdown]);

  const executeSOS = useCallback(() => {
    setCountdown(null);
    setIsEmergencyActive(true);
    if (settings.silentMode) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    if (settings.autoRecord) {
      startRecording();
    }
  }, [settings.silentMode, settings.autoRecord]);

  const triggerSOS = useCallback(async () => {
    const now = Date.now();
    // Double tap detection
    if (now - lastTapRef.current < 400) {
      executeSOS();
      return;
    }
    lastTapRef.current = now;

    setCountdown(settings.countdownSeconds);
    setLocationError(null);
    if (navigator.vibrate) navigator.vibrate(50);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err: any) { 
      console.error("Location failed:", err.message);
      setLocationError(err.message);
    }
  }, [settings.countdownSeconds, executeSOS]);

  const cancelEmergency = () => {
    setCountdown(null);
    setIsEmergencyActive(false);
    setLocationError(null);
    if (isSirenActive) toggleSiren();
    setIsStrobeActive(false);
    stopRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { facingMode: 'user' } 
      });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const evidence: Evidence = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          blob: blob,
          type: 'video'
        };
        setEvidences(prev => [evidence, ...prev]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const downloadEvidence = (evidence: Evidence) => {
    const url = URL.createObjectURL(evidence.blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `SafeGuard_Evidence_${new Date(evidence.timestamp).toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleSiren = () => {
    if (!isSirenActive) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      const mod = setInterval(() => {
        osc.frequency.exponentialRampToValueAtTime(osc.frequency.value > 600 ? 400 : 1200, ctx.currentTime + 0.3);
      }, 400);
      oscNodeRef.current = osc;
      (osc as any)._interval = mod;
      setIsSirenActive(true);
    } else {
      if (oscNodeRef.current) {
        clearInterval((oscNodeRef.current as any)._interval);
        oscNodeRef.current.stop();
      }
      setIsSirenActive(false);
    }
  };

  const handleNearbySearch = (type: 'Police' | 'Hospital') => {
    const query = type === 'Police' ? 'Police Station near me Cuttack' : 'Hospital near me Cuttack';
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  const handleWhatsApp = (contact: Contact) => {
    const locLink = location ? location.googleMapsLink : 'Location not available';
    const msg = encodeURIComponent(`${settings.emergencyMessage}\n\nLive Location: ${locLink}`);
    window.open(`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  const handleShareApp = async () => {
    const currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');
    const shareData: ShareData = {
      title: 'SafeGuard Cuttack',
      text: t.shareMsg,
      url: isValidUrl ? currentUrl : undefined,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share not supported');
      }
    } catch (err) {
      const fallbackText = `${t.shareMsg} ${isValidUrl ? currentUrl : ''}`;
      navigator.clipboard.writeText(fallbackText);
      alert("Link copied to clipboard!");
    }
  };

  const addContact = () => {
    if (!newContactName || !newContactPhone) return;
    const newC: Contact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone,
      type: ContactType.TRUSTED,
      isWhatsApp: true
    };
    setContacts([...contacts, newC]);
    setNewContactName('');
    setNewContactPhone('');
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const resetMessage = () => {
    setSettings({ ...settings, emergencyMessage: DEFAULT_EMERGENCY_MESSAGE });
  };

  const SOSView = () => (
    <div className={`flex flex-col h-full transition-colors duration-500 ${isStrobeActive ? 'animate-strobe' : settings.silentMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <style>{`
        @keyframes strobe { 0%, 100% { background: #fff; } 50% { background: #f00; } }
        .animate-strobe { animation: strobe 0.05s infinite; }
      `}</style>
      
      <div className="pt-6 px-6 flex justify-center">
        <div className="bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 flex items-center gap-1">
          <button 
            onClick={() => setSettings({...settings, silentMode: true})}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${settings.silentMode ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <VolumeX className="w-3 h-3" /> {t.silentMode}
          </button>
          <button 
            onClick={() => setSettings({...settings, silentMode: false})}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!settings.silentMode ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            <VolumeIcon className="w-3 h-3" /> {t.loudMode}
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <button 
          onClick={triggerSOS}
          className={`w-56 h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 relative mb-6 transition-all duration-500 ${settings.silentMode ? 'bg-slate-800 border-4 border-slate-700' : 'bg-red-600 animate-pulse-red'}`}
        >
          {settings.silentMode ? <EyeOff className="w-16 h-16 mb-1 opacity-20" /> : <AlertTriangle className="w-16 h-16 mb-1" />}
          <span className={`text-5xl font-black ${settings.silentMode ? 'opacity-40' : ''}`}>{t.sos}</span>
        </button>
        
        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 shadow-sm transition-colors ${settings.silentMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-500'}`}>
          <Clock className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {settings.countdownSeconds}s {settings.silentMode ? 'Covert' : 'Safety'} Delay
          </span>
        </div>
        <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">{t.hardwareDesc}</p>
      </div>

      {!settings.silentMode && (
        <div className="p-4 grid grid-cols-2 gap-3 mb-2">
          <button onClick={toggleSiren} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${isSirenActive ? 'bg-red-600 text-white border-red-700' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Volume2 className="w-5 h-5" />
            <span className="font-bold text-sm">{t.siren}</span>
          </button>
          <button onClick={() => setIsStrobeActive(!isStrobeActive)} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${isStrobeActive ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-white border-slate-200 text-slate-700'}`}>
            <Zap className="w-5 h-5" />
            <span className="font-bold text-sm">{t.strobe}</span>
          </button>
        </div>
      )}

      <div className="px-4 pb-6 space-y-3">
        <button onClick={() => window.location.href='tel:112'} className={`w-full p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xl shadow-lg active:scale-95 transition-all ${settings.silentMode ? 'bg-slate-800 text-slate-400' : 'bg-red-600 text-white'}`}>
          <ShieldAlert className={`w-6 h-6 ${settings.silentMode ? 'opacity-20' : 'fill-white'}`} /> {t.emergency} 112
        </button>
      </div>
    </div>
  );

  const DirectoryView = () => {
    const rights = [];
    let i = 1;
    while (t[`right${i}Title` as keyof typeof t]) {
      rights.push({
        title: t[`right${i}Title` as keyof typeof t],
        desc: t[`right${i}Desc` as keyof typeof t]
      });
      i++;
    }

    return (
      <div className="p-4 space-y-4 pb-24">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg mb-6 overflow-hidden relative">
          <HelpCircle className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-white" />
          <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> {t.howToTitle}
          </h3>
          <div className="space-y-3">
             {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
               <div key={i} className="flex gap-3 text-[11px] font-medium leading-tight">
                 <span className="bg-blue-600 h-4 w-4 rounded-full flex items-center justify-center text-[8px] flex-shrink-0 mt-0.5">{i+1}</span>
                 <p className="opacity-80">{step}</p>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg mb-6 overflow-hidden relative">
          <Scale className="absolute -right-4 -top-4 w-24 h-24 opacity-10 text-white" />
          <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-200" /> {t.rightsTitle}
          </h3>
          <div className="space-y-4">
             {rights.map((right, i) => (
               <div key={i} className="border-l-2 border-indigo-400 pl-3">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-1">{right.title}</h4>
                 <p className="text-[11px] font-medium leading-tight opacity-90">{right.desc}</p>
               </div>
             ))}
          </div>
        </div>

        <h2 className="text-xl font-black uppercase text-slate-800 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-red-600" /> {t.directory}
        </h2>
        <div className="space-y-3">
          {HELPLINE_DIRECTORY.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group active:bg-slate-50">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-slate-800 tracking-tight">{item.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold text-white ${item.category === 'Women' ? 'bg-pink-500' : item.category === 'Medical' ? 'bg-red-500' : 'bg-slate-500'}`}>
                    {item.category.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-none">
                  {settings.language === 'en' ? item.description_en : item.description_or}
                </p>
              </div>
              <button onClick={() => window.location.href=`tel:${item.number}`} className="bg-green-50 text-green-700 px-4 py-2 rounded-xl flex flex-col items-center">
                <Phone className="w-4 h-4 mb-1" />
                <span className="text-xs font-black">{item.number}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'sos' && <SOSView />}
      {activeTab === 'directory' && <DirectoryView />}
      
      {activeTab === 'contacts' && (
        <div className="p-4 space-y-4">
          <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg mb-2">
            <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-1"><Users className="w-5 h-5" /> Safety Circle</h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Add up to 5 family members or friends</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
               <input 
                 type="text" 
                 placeholder="e.g. Brother" 
                 value={newContactName}
                 onChange={(e) => setNewContactName(e.target.value)}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" 
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
               <input 
                 type="tel" 
                 placeholder="+91 00000 00000" 
                 value={newContactPhone}
                 onChange={(e) => setNewContactPhone(e.target.value)}
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20" 
               />
             </div>
             <button 
               onClick={addContact}
               disabled={!newContactName || !newContactPhone}
               className="w-full bg-slate-900 disabled:opacity-50 text-white p-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95"
             >
               <Plus className="w-4 h-4" /> Add To Circle
             </button>
          </div>

          <div className="space-y-3 pb-20">
            {contacts.filter(c => c.type === ContactType.TRUSTED).map(c => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><Users className="w-5 h-5"/></div>
                  <div><p className="font-black text-slate-800 text-sm leading-tight">{c.name}</p><p className="text-xs font-bold text-slate-400 tracking-tighter">{c.phone}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.location.href=`tel:${c.phone}`} className="p-3 bg-blue-50 rounded-2xl text-blue-600 active:bg-blue-100"><Phone className="w-4 h-4"/></button>
                  <button onClick={() => removeContact(c.id)} className="p-3 bg-red-50 rounded-2xl text-red-600 active:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-4 space-y-6 pb-20">
          <h2 className="text-xl font-black uppercase flex items-center gap-2"><Settings className="w-5 h-5 text-red-600" /> App Settings</h2>
          
          <div className="space-y-4">
            <button 
              onClick={handleShareApp}
              className="w-full bg-green-600 text-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-xl active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-full"><Share2 className="w-5 h-5" /></div>
                <div className="text-left">
                  <span className="font-black block text-lg">Share with Family</span>
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Help others stay safe</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-40" />
            </button>

            {/* Evidence Vault */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <FolderLock className="absolute -right-4 -top-4 w-20 h-20 opacity-10" />
              <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2"><Video className="w-4 h-4 text-red-500" /> {t.vaultTitle}</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-4">{t.vaultDesc}</p>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {evidences.length === 0 ? (
                  <p className="text-xs opacity-30 italic py-4">{t.vaultEmpty}</p>
                ) : (
                  evidences.map(ev => (
                    <div key={ev.id} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-[10px] font-black">{new Date(ev.timestamp).toLocaleString()}</p>
                          <p className="text-[8px] opacity-40 font-bold">{(ev.blob.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => downloadEvidence(ev)} className="p-2 bg-white/10 rounded-lg active:bg-white/20">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <Video className="w-5 h-5 text-purple-600" />
                   <div>
                     <span className="font-bold block">{t.recordLabel}</span>
                     <span className="text-[10px] text-slate-400 uppercase font-black">{t.recordDesc}</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setSettings({...settings, autoRecord: !settings.autoRecord})}
                   className={`w-14 h-8 rounded-full p-1 transition-all ${settings.autoRecord ? 'bg-purple-600' : 'bg-slate-200'}`}
                 >
                   <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.autoRecord ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   {settings.silentMode ? <VolumeX className="w-5 h-5 text-slate-400" /> : <VolumeIcon className="w-5 h-5 text-red-600" />}
                   <div>
                     <span className="font-bold block">{settings.silentMode ? t.silentMode : t.loudMode}</span>
                     <span className="text-[10px] text-slate-400 uppercase font-black">{settings.silentMode ? t.silentDesc : t.loudDesc}</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => setSettings({...settings, silentMode: !settings.silentMode})}
                   className={`w-14 h-8 rounded-full p-1 transition-all ${settings.silentMode ? 'bg-slate-800' : 'bg-red-600'}`}
                 >
                   <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.silentMode ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-bold">{t.msgLabel}</span>
                </div>
                <button onClick={resetMessage} className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase bg-red-50 px-2 py-1 rounded-md active:bg-red-100"><RotateCcw className="w-3 h-3" /> {t.resetMsg}</button>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-tight uppercase font-bold tracking-tight">{t.msgDesc}</p>
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                value={settings.emergencyMessage}
                onChange={(e) => setSettings({ ...settings, emergencyMessage: e.target.value })}
              />
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div><span className="font-bold block">Safety Delay</span><span className="text-[10px] text-slate-400">Cancel delay time</span></div>
                </div>
                <span className="text-2xl font-black text-red-600">{settings.countdownSeconds}s</span>
              </div>
              <input type="range" min="0" max="10" step="1" className="w-full accent-red-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" value={settings.countdownSeconds} onChange={(e) => setSettings({...settings, countdownSeconds: parseInt(e.target.value)})}/>
            </div>

            <button onClick={() => setSettings({...settings, language: settings.language === 'en' ? 'or' : 'en'})} className="w-full bg-white p-5 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm active:bg-slate-50">
              <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-blue-600" /><span className="font-bold">Language</span></div>
              <span className="text-xs font-black bg-slate-100 px-4 py-1.5 rounded-full">{settings.language === 'en' ? 'ENGLISH' : 'ଓଡ଼ିଆ'}</span>
            </button>
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-red-600" /><span className="font-bold">Medical ID (Blood Group)</span></div>
                <span className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg">{settings.bloodGroup}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <button key={bg} onClick={() => setSettings({...settings, bloodGroup: bg})} className={`p-2.5 text-xs font-black rounded-xl border transition-all ${settings.bloodGroup === bg ? 'bg-red-600 text-white border-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>{bg}</button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-full"><Code className="w-4 h-4 text-blue-400" /></div>
                <span className="text-xs font-black uppercase tracking-widest opacity-60">Developer Profile</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-1">Bibhu Mishra</h3>
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Cuttack, Odisha, India</p>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Production Build v1.1.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(countdown !== null || isEmergencyActive) && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white animate-in zoom-in duration-300 transition-colors ${settings.silentMode ? 'bg-slate-950' : 'bg-red-600'}`}>
          {isRecording && (
            <div className="absolute top-12 left-0 right-0 flex justify-center">
              <div className="bg-red-600 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse border border-white/20">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest">Recording Evidence</span>
              </div>
            </div>
          )}
          
          {countdown !== null ? (
            <div className="text-center w-full max-w-sm">
              <div className={`mb-6 inline-block p-6 rounded-full animate-pulse ${settings.silentMode ? 'bg-white/5' : 'bg-white/20'}`}>
                {settings.silentMode ? <EyeOff className="w-16 h-16 opacity-20" /> : <AlertTriangle className="w-16 h-16" />}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest mb-2">{settings.silentMode ? 'Covert Trigger' : 'Alert Countdown'}</h2>
              <div className={`text-[12rem] font-black mb-16 tabular-nums drop-shadow-2xl leading-none ${settings.silentMode ? 'text-slate-800' : 'text-white'}`}>{countdown}</div>
              <button onClick={cancelEmergency} className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 ${settings.silentMode ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-white text-red-600'}`}>CANCEL HELP</button>
            </div>
          ) : (
            <div className={`w-full max-w-sm rounded-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto ${settings.silentMode ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-800'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className={`text-4xl font-black uppercase tracking-tighter leading-none ${settings.silentMode ? 'text-slate-600' : 'text-red-600'}`}>HELP</h3>
                  <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{settings.silentMode ? 'Covert Actions' : 'Emergency Actions'}</p>
                </div>
                <button onClick={cancelEmergency} className={`p-2 rounded-full ${settings.silentMode ? 'bg-slate-800' : 'bg-slate-100'}`}><X className="w-5 h-5"/></button>
              </div>
              
              <div className="space-y-4">
                <button onClick={() => window.location.href='tel:112'} className={`w-full p-6 rounded-[2rem] flex items-center justify-between shadow-xl active:scale-95 ${settings.silentMode ? 'bg-slate-800 text-slate-400' : 'bg-red-600 text-white'}`}>
                  <div className="flex items-center gap-4">
                    <ShieldAlert className={`w-8 h-8 ${settings.silentMode ? 'opacity-20' : 'fill-white'}`} />
                    <span className="text-3xl font-black tracking-tighter uppercase">Call 112</span>
                  </div>
                  <ChevronRight className="w-8 h-8 opacity-30" />
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => window.location.href='tel:100'} className={`p-5 rounded-[1.5rem] flex flex-col items-center gap-2 active:scale-95 ${settings.silentMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-900 text-white'}`}><Smartphone className="w-6 h-6" /><span className="text-[10px] font-black uppercase">PCR 100</span></button>
                  <button onClick={() => handleNearbySearch('Police')} className={`p-5 rounded-[1.5rem] flex flex-col items-center gap-2 active:scale-95 ${settings.silentMode ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white'}`}><MapPin className="w-6 h-6" /><span className="text-[10px] font-black uppercase">Nearby PS</span></button>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">WhatsApp Circle</p>
                    {locationError && <span className="text-[8px] font-bold text-red-500 uppercase tracking-tight">Location Missing</span>}
                  </div>
                  
                  <div className="space-y-2">
                    {contacts.filter(c => c.type === ContactType.TRUSTED).map(c => (
                      <button key={c.id} onClick={() => handleWhatsApp(c)} className={`w-full p-4 rounded-2xl flex items-center justify-between active:scale-95 border ${settings.silentMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        <div className="flex items-center gap-3 text-sm font-black"><MessageSquare className="w-4 h-4" /> {c.name}</div>
                        <CheckCircle2 className="w-4 h-4 opacity-40" />
                      </button>
                    ))}
                  </div>
                </div>

                {locationError && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2 ${settings.silentMode ? 'bg-slate-950 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-red-600 uppercase leading-snug">
                      Alert: {locationError}. GPS enabled?
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
