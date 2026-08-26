import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-8xl font-black text-slate-200">404</h1>
      <p className="text-2xl font-semibold text-slate-700">Page Not Found</p>
      <p className="text-slate-500 pb-4">Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-white bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
