import React, { useEffect, useState } from 'react';
import { useActivities } from '../../features/activities/contexts/ActivityContext';

export const NotificationHandler: React.FC = () => {
  const { myActivities } = useActivities();
  const [notifiedActivities, setNotifiedActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      myActivities.forEach(activity => {
        const activityTime = new Date(activity.dateTime);
        if (
          !notifiedActivities.has(activity.id) &&
          activityTime > now &&
          activityTime <= twoHoursFromNow
        ) {
          // In a real app, this would be a push notification.
          // We'll use a simple alert for this simulation.
          alert(`Reminder: Your activity "${activity.title}" is starting in less than 2 hours!`);
          setNotifiedActivities(prev => new Set(prev).add(activity.id));
        }
      });
    };
    
    // Check for notifications every minute
    const intervalId = setInterval(checkNotifications, 60000);
    
    // Initial check
    checkNotifications();

    return () => clearInterval(intervalId);
  }, [myActivities, notifiedActivities]);

  return null; // This component does not render anything
};