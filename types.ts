
export enum ContactType {
  POLICE = 'Police',
  TRUSTED = 'Trusted Contact',
  OFFICIAL = 'Official Helpline',
  MEDICAL = 'Medical/Hospital'
}

export type Language = 'en' | 'or';

export interface Helpline {
  name: string;
  number: string;
  category: 'Women' | 'General' | 'Medical' | 'Child' | 'Cyber';
  description_en: string;
  description_or: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: ContactType;
  isWhatsApp: boolean;
}

export interface UserSettings {
  userName: string;
  emergencyMessage: string;
  countdownSeconds: number;
  language: Language;
  bloodGroup: string;
  silentMode: boolean;
  autoRecord: boolean;
}

export interface Evidence {
  id: string;
  timestamp: number;
  blob: Blob;
  type: 'video' | 'audio';
}

export interface AppState {
  contacts: Contact[];
  settings: UserSettings;
}
