import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    // The main dark background wrapper
    <div className="min-h-screen bg-[#1c1c1c] text-gray-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Header */}
        <nav className="flex space-x-8 border-b border-gray-700 pb-3 mb-8 text-sm font-medium">
          <NavLink 
            to="/" 
            className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-[14px] -mb-[14px]" : "text-gray-400 hover:text-white transition-colors"}
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/expenses" 
            className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-[14px] -mb-[14px]" : "text-gray-400 hover:text-white transition-colors"}
          >
            Expenses
          </NavLink>
          
          <NavLink 
            to="/upload" 
            className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-[14px] -mb-[14px]" : "text-gray-400 hover:text-white transition-colors"}
          >
            Upload CSV
          </NavLink>
        </nav>

        {/* This Outlet is where the actual page content will be injected! */}
        <main>
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}