
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import OrdreVirementForm from './components/OrdreVirementForm';
import ManageSuppliers from './components/ManageSuppliers';
import MyAccount from './components/MyAccount';
import { SUPPLIERS, MY_ACCOUNTS } from './constants';
import { Supplier, MyAccountDetails } from './types';

type Page = 'newTransfer' | 'manageSuppliers' | 'myAccount';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('newTransfer');
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [myAccounts, setMyAccounts] = useState<MyAccountDetails[]>(MY_ACCOUNTS);

  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prevSuppliers => [
      ...prevSuppliers,
      { ...newSupplier, id: Date.now().toString() }
    ]);
  };

  const handleUpdateAccount = (updatedAccount: MyAccountDetails) => {
    setMyAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'newTransfer':
        return <OrdreVirementForm suppliers={suppliers} accounts={myAccounts} />;
      case 'manageSuppliers':
        return <ManageSuppliers suppliers={suppliers} onAddSupplier={handleAddSupplier} />;
      case 'myAccount':
        return <MyAccount accounts={myAccounts} onUpdateAccount={handleUpdateAccount} />;
      default:
        return <OrdreVirementForm suppliers={suppliers} accounts={myAccounts} />;
    }
  }

  return (
    <main className="bg-[#EADBC8] min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="absolute top-10 right-10 text-7xl opacity-30">☕️</div>
      <div className="relative w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl aspect-[4/3] lg:aspect-[16/10] bg-gray-800 rounded-3xl shadow-2xl p-4 border-4 border-gray-600 flex overflow-hidden">
        
        {/* Tablet Frame and Screen */}
        <div className="bg-black rounded-xl w-full h-full flex overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          
          {/* Main Content Area */}
          <div className="flex-1 bg-gray-50 flex flex-col overflow-y-auto">
            <Header />
            <div className="flex-1 p-6 md:p-8">
              {renderContent()}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;