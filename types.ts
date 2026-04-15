
export type ChronicDisease = 'BP' | 'Diabetes' | 'Thyroid' | 'None';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  description: string;
  taken: boolean;
  missed?: boolean;
  nudged?: boolean;
  takenTime?: string;
  frequency: string;
  isChronic: boolean;
  startDate?: string;
  endDate?: string;
  count: number;
}

export interface UserVitals {
  bp_systolic: number;
  bp_diastolic: number;
  sugar: number;
  tsh: number;
  date: string;
}

export interface HistoryItem {
  id: string;
  type: 'medication' | 'purchase' | 'vital';
  title: string;
  description: string;
  timestamp: string;
  value?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'system' | 'reward' | 'stock';
}

export interface UserSettings {
  remindersEnabled: boolean;
  biometricLock: boolean;
  language: 'English' | 'Hindi' | 'Telugu';
  theme: 'dark' | 'light';
  privacy: {
    aiPersonalization: boolean;
    voiceProcessing: boolean;
    analyticsSharing: boolean;
  };
  notificationRules: {
    medicationReminders: boolean;
    labReportAlerts: boolean;
    appointmentReminders: boolean;
    emergencyAlerts: boolean; // Cannot be fully disabled per safety rules
    wellnessNudges: boolean;
  };
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface UserData {
  username: string; // Used as Display Name
  age?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  email?: string;
  phoneNumber: string;
  password?: string;
  
  // Medical Profile
  bloodGroup?: string;
  allergies?: string[];
  diseases: ChronicDisease[];
  medications: Medication[];
  
  coins: number;
  streak: number;
  onboarded: boolean;
  vitals: UserVitals[];
  history: HistoryItem[];
  notifications: Notification[];
  settings: UserSettings;
  emergencyContact?: EmergencyContact;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
