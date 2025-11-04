import React, { useState, useEffect } from 'react';

const UserCounter: React.FC = () => {
  // Start with a random number to make it feel more authentic on load.
  const [userCount, setUserCount] = useState(() => Math.floor(Math.random() * 15) + 5);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prevCount => {
        // Fluctuate the number slightly.
        const fluctuation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newCount = prevCount + fluctuation;
        // Ensure the count doesn't drop below a minimum (e.g., 2).
        return Math.max(2, newCount);
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden sm:flex items-center space-x-2" title="Simulated live user count">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {userCount} Online
      </span>
    </div>
  );
};

export default UserCounter;