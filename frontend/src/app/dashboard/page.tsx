'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  // In a real app, you would fetch user data from your API
  const [userData, setUserData] = useState({
    name: 'Student Name',
    grade: '8',
    recentActivity: []
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Header/Navigation would go here */}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-teal-400 mb-8">Welcome back, {userData.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick access cards */}
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Quizzes</h2>
            <Link href="/quizzes" className="text-teal-400 hover:text-teal-300">View all quizzes →</Link>
          </div>
          
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Recommended Videos</h2>
            <Link href="/videos" className="text-teal-400 hover:text-teal-300">View all videos →</Link>
          </div>
          
          <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Learning Progress</h2>
            {/* Progress visualization would go here */}
            <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
              <div className="bg-teal-500 h-4 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}