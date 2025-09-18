import React, { useState, useMemo } from 'react';
import { FitMatchData } from '../useFitMatchData';
import { ICONS } from '../constants';
import { ActivityCard } from './ActivityCard';
import { Activity } from '../types';

interface DashboardProps {
  data: FitMatchData;
  setCurrentPage: (page: React.SetStateAction<any>) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 border border-light-border dark:border-dark-border flex-1 min-w-[150px]">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
      </div>
      <div className={`p-2 ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ data, setCurrentPage }) => {
  const { currentUser, nearbyActivities, sports, myActivities } = data;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [levelFilter, setLevelFilter] = useState('All Levels');

  const filteredActivities = useMemo(() => {
    return nearbyActivities.filter(activity => {
        const sport = data.getSportById(activity.sportId);
        const searchMatch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) || sport?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const sportMatch = sportFilter === 'All Sports' || sport?.name === sportFilter;
        const levelMatch = levelFilter === 'All Levels' || activity.level === levelFilter;
        return searchMatch && sportMatch && levelMatch;
    });
  }, [searchTerm, sportFilter, levelFilter, nearbyActivities, data]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }
  
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${currentUser.name}!`;

  return (
    <div className="p-4 sm:p-8 space-y-8 overflow-y-auto h-full">
      {/* Header */}
      <header className='hidden sm:block'>
        <div className="flex items-center mb-1">
            <div className="bg-primary p-3 mr-4 text-white">{ICONS.logo}</div>
            <div>
                <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{greeting}</h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Ready to find your perfect workout partner?</p>
            </div>
        </div>
      </header>
      
      {/* Stats */}
      <section className="flex gap-4 flex-wrap">
        <StatCard title="Available Activities" value={nearbyActivities.length} icon={ICONS.calendar} color="bg-blue-100 text-blue-600" />
        <StatCard title="Today's Activities" value={myActivities.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length} icon={ICONS.clock} color="bg-orange-100 text-orange-600" />
        <StatCard title="Active Participants" value={new Set(nearbyActivities.flatMap(a => a.participants)).size} icon={ICONS.users} color="bg-cyan-100 text-cyan-600" />
        <StatCard title="Sports Available" value={sports.length} icon={ICONS.trend} color="bg-rose-100 text-rose-600" />
      </section>

      {/* Find Activities */}
      <section>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4 sm:mb-0">Find Activities Near You</h2>
          <button 
            onClick={() => setCurrentPage('Create Activity')}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 flex items-center justify-center gap-2 transition-colors">
            {ICONS.create} Create Activity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center p-4 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border">
          <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-light-text-secondary dark:text-dark-text-secondary">{ICONS.search}</span>
            <input 
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary" />
          </div>
          <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
            <option>All Sports</option>
            {sports.map(sport => <option key={sport.id}>{sport.name}</option>)}
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus:ring-primary focus:border-primary">
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Casual</option>
            <option>Competitive</option>
          </select>
          <div className="text-right text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {filteredActivities.length} activities found
          </div>
        </div>
      </section>
      
      {/* Activity List */}
      <section>
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredActivities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} data={data} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">No activities match your criteria. Try widening your search!</p>
          </div>
        )}
      </section>

    </div>
  );
};
