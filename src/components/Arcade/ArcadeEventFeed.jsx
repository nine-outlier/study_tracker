import React, { useEffect, useState } from 'react';

const ArcadeEventFeed = ({ events }) => {
  // events prop should be an array of strings or objects: { id, text, type }
  // We only display the last 5 events
  const [displayEvents, setDisplayEvents] = useState([]);

  useEffect(() => {
    if (events && events.length > 0) {
        const latest = events[events.length - 1];
        // Add new event with timestamp ID to trigger animations
        const newEvent = { 
            id: Date.now(), 
            text: typeof latest === 'string' ? latest : latest.text,
            type: latest.type || 'info'
        };
        
        setDisplayEvents(prev => [newEvent, ...prev].slice(0, 5));
    }
  }, [events]);

  const getTypeStyles = (type) => {
      switch(type) {
          case 'danger': return 'text-red-400 border-l-red-500 bg-red-900/10';
          case 'gold': return 'text-yellow-400 border-l-yellow-500 bg-yellow-900/10';
          case 'success': return 'text-green-400 border-l-green-500 bg-green-900/10';
          default: return 'text-slate-400 border-l-slate-500 bg-slate-900/10';
      }
  };

  return (
    <div className="absolute bottom-6 left-6 z-40 w-64 flex flex-col-reverse gap-2 pointer-events-none">
      {displayEvents.map((ev) => (
        <div 
            key={ev.id} 
            className={`
                border-l-2 px-3 py-2 rounded-r text-xs font-mono uppercase tracking-wide animate-slideIn
                ${getTypeStyles(ev.type)}
            `}
        >
            {ev.text}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ArcadeEventFeed;