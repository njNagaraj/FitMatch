export enum Page {
  Home = 'Home',
  AdminDashboard = 'Admin Dashboard',
  CreateActivity = 'Create Activity',
  MyActivities = 'My Activities',
  Events = 'Events',
  Chats = 'Chats',
  Profile = 'Profile',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  currentLocation?: { lat: number; lon: number };
  homeLocation?: { lat: number; lon: number; name: string };
  isAdmin?: boolean;
  viewRadius?: number;
  isDeactivated?: boolean;
}

export interface Sport {
  id: string;
  name: string;
  isTeamSport: boolean;
  activityTypes: string[];
  levels: string[];
}

export interface Activity {
  id: string;
  sportId: string;
  otherSportName?: string;
  title: string;
  creatorId: string;
  dateTime: Date;
  locationName: string;
  locationCoords: { lat: number; lon: number };
  activityType: string;
  level: string;
  partnersNeeded: number; 
  participants: string[];
}

export interface Event {
  id: string;
  title: string;
  sport: string;
  city: string;
  date: Date;
  description: string;
  imageUrl: string;
  registrationUrl: string;
}

export interface Message {
  id: string;
  senderId: string | null; // Null for system messages
  text: string;
  timestamp: Date;
  isSystemMessage?: boolean;
  status?: 'pending' | 'sent' | 'failed';
}

export interface Chat {
  id: string; // Same as activityId
  activityId: string;
  messages: Message[];
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}