
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center text-2xl font-bold ${className}`}>
      <span className="text-orange-500">MOZ</span>
      <div className="relative">
        <span className="text-orange-500">UP</span>
        <svg
          className="absolute -top-2 -right-2 w-5 h-5 text-red-700"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V14a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
      <span className="text-sm font-normal text-gray-500 ml-2">Academy</span>
    </div>
  );
};

export default Logo;
