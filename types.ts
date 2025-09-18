
export enum Page {
  Home = 'Home',
  CreateActivity = 'Create Activity',
  MyActivities = 'My Activities',
  Events = 'Events',
  Chats = 'Chats',
  Profile = 'Profile',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  location: { lat: number; lon: number };
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
  title: string;
  creatorId: string;
  dateTime: Date;
  locationName: string;
  locationCoords: { lat: number; lon: number };
  activityType: string;
  level: string;
  partnersNeeded: number; // 0 for unlimited
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
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Chat {
  id: string; // Same as activityId
  activityId: string;
  messages: Message[];
}
