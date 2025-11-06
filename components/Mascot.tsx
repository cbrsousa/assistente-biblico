import React from 'react';

interface MascotProps {
  isThinking: boolean;
}

const Mascot: React.FC<MascotProps> = ({ isThinking }) => {
  const containerClasses = `
    w-12 h-12 sm:w-16 sm:h-16
    flex-shrink-0 
    flex items-center justify-center
    transition-transform 
    duration-500 
    ${isThinking ? 'animate-pulse' : 'animate-fade-in-up'}
  `;

  return (
    <div className={containerClasses} title="Assistente Bíblico">
      <img 
        src="/logo.svg" 
        alt="Mascote Robô do Assistente Bíblico"
        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
      />
    </div>
  );
};

export default Mascot;
