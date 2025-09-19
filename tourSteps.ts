import { Page } from './types';

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  page?: Page; // The page this step is on
}

export const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour-id="sidebar-nav"]',
    title: 'Welcome to FitMatch!',
    content: 'This is your main navigation. From here, you can access all the core features of the app.',
    page: Page.Home,
  },
  {
    selector: '[data-tour-id="find-activities"]',
    title: 'Find Activities',
    content: 'Your dashboard shows activities happening near you. Use the filters to find the perfect match.',
    page: Page.Home,
  },
  {
    selector: '[data-tour-id="create-activity-nav"]',
    title: 'Create Your Own',
    content: "Can't find what you're looking for? Click here to create your own activity and invite others to join.",
    page: Page.Home,
  },
  {
    selector: '[data-tour-id="my-activities-nav"]',
    title: 'My Activities',
    content: 'This page shows all the activities you have created or joined. Keep track of your schedule here.',
    page: Page.MyActivities,
  },
  {
    selector: '[data-tour-id="events-list"]',
    title: 'Community Events',
    content: 'Discover official events like marathons and tournaments happening in your area.',
    page: Page.Events,
  },
  {
    selector: '[data-tour-id="chats-list"]',
    title: 'Group Chats',
    content: 'Once you join an activity, a group chat is created here. Coordinate with your partners and get ready!',
    page: Page.Chats,
  },
   {
    selector: '[data-tour-id="location-switcher"]',
    title: 'Location Basis',
    content: "Switch between your current location and a saved 'Home' location to find activities wherever you are.",
     page: Page.Home,
  },
  {
    selector: '[data-tour-id="profile-edit"]',
    title: 'Your Profile',
    content: "Finally, keep your profile up-to-date. You can set your home location here. That's it, you're all set to get started!",
    page: Page.Profile,
  },
];
