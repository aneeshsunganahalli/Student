import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-gray-900">
      {/* Navigation */}
      <nav className="w-full p-4 md:p-6 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/50">
              <Image 
                src="/logo.png" 
                alt="Teacher Toolkit Logo" 
                fill 
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <span className="text-xl font-bold text-teal-400">Teacher Toolkit</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-teal-400">Dashboard</Link>
          <Link href="/quizzes" className="text-gray-300 hover:text-teal-400">Quizzes</Link>
          <Link href="/videos" className="text-gray-300 hover:text-teal-400">Videos</Link>
          <Link href="/profile" className="text-gray-300 hover:text-teal-400">Profile</Link>
          <button className="text-red-400 hover:text-red-300">Sign Out</button>
        </div>
      </nav>
      
      {children}
    </div>
  );
}