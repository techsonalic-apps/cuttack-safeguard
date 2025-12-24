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
  FolderLock,
  Download as InstallIcon,
  Building2,
  Stethoscope
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  
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

  // PWA Install Logic
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallHelp(true);
    }
  };

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
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-y-auto ${isStrobeActive ? 'animate-strobe' : settings.silentMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <style>{`
        @keyframes strobe { 0%, 100% { background: #fff; } 50% { background: #f00; } }
        .animate-strobe { animation: strobe 0.05s infinite; }
      `}</style>
      
      {/* DIRECT INSTALL BUTTON AT TOP */}
      <div className="p-4">
        <button 
          onClick={handleInstallClick}
          className="w-full bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between border border-white/10 shadow-xl active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <InstallIcon className="w-5 h