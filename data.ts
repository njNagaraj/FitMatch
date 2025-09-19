import { User, Sport, Activity, Event, Chat } from './types';
import { TODAY } from './constants';

// Helper function to create dates relative to TODAY
const addHours = (date: Date, h: number) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + h);
  return newDate;
};
const addDays = (date: Date, d: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + d);
    return newDate;
};

export const MOCK_USERS: User[] = [
  // ==> Users with login credentials <==
  { 
    id: 'admin-user', 
    name: 'Admin', 
    email: 'admin@fitmatch.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=admin-user', 
    currentLocation: { lat: 12.9716, lon: 77.5946 }, // Bangalore
    isAdmin: true 
  },
  { 
    id: 'user-1', 
    name: 'Nagaraj (Chennai)', 
    email: 'nagaraj@fitmatch.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=user-1', 
    currentLocation: { lat: 13.0471, lon: 80.1873 }, // Chennai
    homeLocation: { lat: 13.0471, lon: 80.1873, name: 'Home in Chennai' }
  },
  { 
    id: 'user-2', 
    name: 'Priya (Chennai)', 
    email: 'priya@fitmatch.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=user-2', 
    currentLocation: { lat: 13.0480, lon: 80.1890 } // Chennai
  },
  { 
    id: 'user-4', // Using existing ID to avoid breaking activities
    name: 'Sam (Bangalore)', 
    email: 'sam@fitmatch.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=user-4', 
    currentLocation: { lat: 12.9780, lon: 77.6000 }   // Bangalore
  },

  // ==> Other users for populating activities <==
  { 
    id: 'user-3', 
    name: 'Maria', 
    email: 'maria@test.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=user-3', 
    currentLocation: { lat: 12.9700, lon: 77.5920 }, // Bangalore
    homeLocation: { lat: 12.9716, lon: 77.5946, name: 'Central Bangalore' }
  },
  { 
    id: 'user-5', 
    name: 'Chloe', 
    email: 'chloe@test.com', 
    avatarUrl: 'https://i.pravatar.cc/150?u=user-5', 
    currentLocation: { lat: 13.0000, lon: 77.6100 } // Bangalore
  },
];

export const MOCK_SPORTS: Sport[] = [
  { id: 'sport-1', name: 'Running', isTeamSport: false, activityTypes: ['Easy Run', 'Threshold', 'Long Run', 'Intervals'], levels: ['Beginner', 'Intermediate', 'Advanced'] },
  { id: 'sport-2', name: 'Cycling', isTeamSport: false, activityTypes: ['Road', 'Mountain', 'Gravel'], levels: ['Beginner', 'Intermediate', 'Advanced'] },
  { id: 'sport-3', name: 'Swimming', isTeamSport: false, activityTypes: ['Lap Swim', 'Open Water'], levels: ['Beginner', 'Intermediate', 'Advanced'] },
  { id: 'sport-4', name: 'Football', isTeamSport: true, activityTypes: ['5-a-side', '7-a-side', '11-a-side'], levels: ['Casual', 'Competitive'] },
  { id: 'sport-5', name: 'Basketball', isTeamSport: true, activityTypes: ['3v3', '5v5', 'Shooting Practice'], levels: ['Casual', 'Competitive'] },
];

export const MOCK_ACTIVITIES: Activity[] = [
    // Chennai Activities
    {
        id: 'activity-6', sportId: 'sport-1', title: 'Marina Beach Run', creatorId: 'user-2',
        dateTime: addHours(TODAY, 1), locationName: 'Marina Beach', locationCoords: { lat: 13.0535, lon: 80.2826 },
        activityType: 'Easy Run', level: 'Beginner', partnersNeeded: 10, participants: ['user-2']
    },
    {
        id: 'activity-7', sportId: 'sport-2', title: 'Guindy Park Cycling', creatorId: 'user-3', // A Bangalore user creating activity in Chennai
        dateTime: addHours(TODAY, 6), locationName: 'Guindy National Park', locationCoords: { lat: 13.0076, lon: 80.2215 },
        activityType: 'Mountain', level: 'Intermediate', partnersNeeded: 4, participants: ['user-3', 'user-2']
    },

    // Bangalore Activities
    {
        id: 'activity-1', sportId: 'sport-2', title: 'Morning Cycling Group', creatorId: 'user-3',
        dateTime: addHours(TODAY, -3), locationName: 'Cubbon Park', locationCoords: { lat: 12.9759, lon: 77.5921 },
        activityType: 'Road', level: 'Beginner', partnersNeeded: 5, participants: ['user-3']
    },
    {
        id: 'activity-2', sportId: 'sport-1', title: 'Evening Long Run', creatorId: 'user-4',
        dateTime: addHours(TODAY, 5), locationName: 'Lalbagh Botanical Garden', locationCoords: { lat: 12.9507, lon: 77.5848 },
        activityType: 'Long Run', level: 'Intermediate', partnersNeeded: 0, participants: ['user-4']
    },
    {
        id: 'activity-3', sportId: 'sport-3', title: 'Swimming Lap Session', creatorId: 'user-5',
        dateTime: addHours(TODAY, 2.5), locationName: 'Basavanagudi Aquatic Centre', locationCoords: { lat: 12.9427, lon: 77.5746 },
        activityType: 'Lap Swim', level: 'Advanced', partnersNeeded: 1, participants: ['user-5']
    },
];

export const MOCK_EVENTS: Event[] = [
    {
        id: 'event-1', title: 'Bangalore Marathon 2025', sport: 'Running', city: 'Bangalore', date: new Date('2025-10-12T06:00:00'),
        description: 'The premier running event of the city. Choose from Full Marathon, Half Marathon, and 10K.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop',
        registrationUrl: 'https://example.com/blrmarathon'
    },
    {
        id: 'event-2', title: 'Mumbai Cyclothon', sport: 'Cycling', city: 'Mumbai', date: new Date('2025-11-23T07:00:00'),
        description: 'Ride through the iconic streets of Mumbai in this celebrated cyclothon.',
        imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop',
        registrationUrl: 'https://example.com/mumbaicyclo'
    },
    {
        id: 'event-3', title: 'Chennai Soccer League Finals', sport: 'Football', city: 'Chennai', date: new Date('2025-09-28T18:00:00'),
        description: 'Watch the thrilling conclusion to the Chennai Soccer League season.',
        imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1923&auto=format&fit=crop',
        registrationUrl: 'https://example.com/chennaisoccer'
    },
];

export const MOCK_CHATS: Chat[] = [
    {
        id: 'activity-7', activityId: 'activity-7', messages: [
            { id: 'msg-1-1', senderId: 'user-3', text: 'Hey, ready for the ride tomorrow in Guindy?', timestamp: addHours(TODAY, -20) },
            { id: 'msg-1-2', senderId: 'user-2', text: 'Yep! See you there.', timestamp: addHours(TODAY, -19) }
        ]
    }
];