import React from 'react';

type Page = 'newTransfer' | 'manageSuppliers' | 'myAccount';

const NavItem: React.FC<{ icon: React.ReactElement; label: string; active?: boolean; onClick: () => void; }> = ({ icon, label, active, onClick }) => {
  const baseClasses = "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 cursor-pointer w-full text-left";
  const activeClasses = "bg-blue-600 text-white";
  const inactiveClasses = "text-gray-400 hover:bg-gray-700 hover:text-white";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl font-bold">RASMAL GROUP</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-white" aria-label="Close menu">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={<PlusCircleIcon />} 
            label="Nouveau Virement" 
            active={currentPage === 'newTransfer'}
            onClick={() => onNavigate('newTransfer')}
          />
          <NavItem 
            icon={<UsersIcon />}
            label="Gérer Fournisseurs" 
            active={currentPage === 'manageSuppliers'}
            onClick={() => onNavigate('manageSuppliers')}
          />
          <NavItem 
            icon={<UserCircleIcon />}
            label="Mon Compte" 
            active={currentPage === 'myAccount'}
            onClick={() => onNavigate('myAccount')}
          />
        </nav>
      </div>
    </>
  );
};

const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default Sidebar;