'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';

// Define proper interfaces
interface Section {
  title: string;
  content: string;
  key_points: string[];
}

interface ContentItem {
  id: number;
  topic: string;
  difficulty_level: string;
  created_at: string;
  content: {
    topic: string;
    summary: string;
    sections: Section[];
    references?: string[];
  };
}

export default function ContentLibraryPage() {
  const { isAuthenticated, getToken } = useAuth();
  const router = useRouter();
  
  // State variables
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  
  // Fetch content on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const fetchUserContent = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('http://localhost:8000/api/user-contents/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data = await response.json();
        setContents(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching your content');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserContent();
  }, [isAuthenticated, getToken, router]);
  
  // Format date helper function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter content based on search term and difficulty
  const filteredContent = contents
    .filter(item => 
      (filterDifficulty === 'all' || item.difficulty_level === filterDifficulty) &&
      (item.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
       item.content.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-[#36393f] text-white flex flex-col">
      <Navbar />
      
      <div className="flex-grow py-10 px-6">
        <h1 className="text-3xl font-bold mb-10 text-center">
          <span className="text-white">My</span> <span className="text-[#8e6bff]">Content Library</span>
        </h1>
        
        <div className="max-w-6xl mx-auto">
          {/* Simplified Search and Filter Controls */}
          <div className="bg-[#2f3136] rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-grow">
                <label htmlFor="search" className="block text-[#dcddde] font-medium mb-2">
                  Find Content
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by topic or keyword..."
                    className="w-full py-3 px-4 pl-10 bg-[#202225] text-white rounded-lg border border-[#40444b] focus:border-[#8e6bff] focus:outline-none focus:ring-1 focus:ring-[#8e6bff]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-[#72767d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64">
                <label htmlFor="difficulty" className="block text-[#dcddde] font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="w-full py-3 px-4 bg-[#202225] text-white rounded-lg border border-[#40444b] focus:border-[#8e6bff] focus:outline-none focus:ring-1 focus:ring-[#8e6bff] cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Content Display */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-[#8e6bff] border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-[#f04747]/10 border border-[#f04747] text-[#f04747] px-6 py-4 rounded-lg">
              <p>{error}</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="bg-[#2f3136] rounded-xl shadow-md p-10 text-center">
              <div className="inline-block p-6 bg-[#202225] rounded-full mb-6">
                <svg className="h-16 w-16 text-[#8e6bff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">No Content Found</h2>
              {searchTerm || filterDifficulty !== 'all' ? (
                <p className="text-[#b9bbbe] mb-6 max-w-md mx-auto">Try a different search term or filter.</p>
              ) : (
                <p className="text-[#b9bbbe] mb-6 max-w-md mx-auto">Create your first learning material to start building your library.</p>
              )}
              <Link href="/content" className="inline-flex items-center justify-center py-3 px-6 bg-[#8e6bff] hover:bg-[#7b5ce5] text-white rounded-lg transition-colors">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Content
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredContent.map((item: ContentItem) => (
                <div key={item.id} className="bg-[#2f3136] rounded-xl shadow-md overflow-hidden border border-[#202225] hover:border-[#8e6bff] transition-all">
                  <div className="p-6">
                    {/* Difficulty badge and date in clean format */}
                    <div className="flex justify-between items-center mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.difficulty_level === 'beginner' ? 'bg-emerald-900/20 text-emerald-300' :
                        item.difficulty_level === 'intermediate' ? 'bg-amber-900/20 text-amber-300' :
                        'bg-rose-900/20 text-rose-300'
                      }`}>
                        {item.difficulty_level.charAt(0).toUpperCase() + item.difficulty_level.slice(1)}
                      </div>
                      <span className="text-sm text-[#b9bbbe]">{formatDate(item.created_at)}</span>
                    </div>
                    
                    {/* Clearer topic heading */}
                    <h3 className="text-2xl font-bold mb-3 text-white">{item.topic}</h3>
                    
                    {/* Better formatted summary */}
                    <div className="bg-[#202225] rounded-lg p-4 mb-5">
                      <p className="text-[#b9bbbe] line-clamp-3">{item.content.summary}</p>
                    </div>
                    
                    {/* Simplified section tags */}
                    <div className="mb-5">
                      <div className="flex flex-wrap gap-2">
                        {item.content.sections.slice(0, 3).map((section: Section, index: number) => (
                          <span key={index} className="bg-[#40444b] px-3 py-1 rounded-full text-xs text-[#dcddde]">
                            {section.title}
                          </span>
                        ))}
                        {item.content.sections.length > 3 && (
                          <span className="bg-[#36393f] px-3 py-1 rounded-full text-xs text-[#b9bbbe]">
                            +{item.content.sections.length - 3} more
                          </span>
                        )}
                      </div>
                      <p></p>
                    </div>
                    
                    {/* Cleaner button */}
                    <Link 
                      href={`/content?id=${item.id}`} 
                      className="w-full flex items-center justify-center py-3 px-4 bg-[#36393f] hover:bg-[#8e6bff] text-white rounded-lg transition-colors"
                    >
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Open Content
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* New pagination component if needed */}
          {filteredContent.length > 0 && (
            <div className="mt-10 flex justify-center">
              <Link href="/content" className="flex items-center justify-center py-3 px-6 bg-[#8e6bff] hover:bg-[#7b5ce5] text-white rounded-lg transition-colors">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Content
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}