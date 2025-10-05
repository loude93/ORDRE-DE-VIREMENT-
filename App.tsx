
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import OrdreVirementForm from './components/OrdreVirementForm';
import ManageSuppliers from './components/ManageSuppliers';
import MyAccount from './components/MyAccount';
import { SUPPLIERS, MY_ACCOUNTS } from './constants';
import { Supplier, MyAccountDetails, AppDataBackup } from './types';

type Page = 'newTransfer' | 'manageSuppliers' | 'myAccount';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('newTransfer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const storedSuppliers = localStorage.getItem('suppliers');
      return storedSuppliers ? JSON.parse(storedSuppliers) : SUPPLIERS;
    } catch (error) {
      console.error("Failed to load suppliers from localStorage:", error);
      return SUPPLIERS;
    }
  });

  const [myAccounts, setMyAccounts] = useState<MyAccountDetails[]>(() => {
    try {
      const storedAccounts = localStorage.getItem('myAccounts');
      return storedAccounts ? JSON.parse(storedAccounts) : MY_ACCOUNTS;
    } catch (error) {
      console.error("Failed to load accounts from localStorage:", error);
      return MY_ACCOUNTS;
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('suppliers', JSON.stringify(suppliers));
    } catch (error) {
      console.error("Failed to save suppliers to localStorage:", error);
      alert("Erreur: Impossible de sauvegarder les fournisseurs. Le stockage local est peut-être plein.");
    }
  }, [suppliers]);
  
  useEffect(() => {
    try {
      localStorage.setItem('myAccounts', JSON.stringify(myAccounts));
    } catch (error) {
      console.error("Failed to save accounts to localStorage:", error);
      let errorMessage = "Erreur: Impossible de sauvegarder vos comptes. Le stockage local est peut-être plein.";
      // Check for QuotaExceededError
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          errorMessage += "\n\nLe fichier PDF pour le papier à en-tête est probablement trop volumineux. Veuillez essayer avec un fichier plus petit.";
      }
      alert(errorMessage);
    }
  }, [myAccounts]);

  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prevSuppliers => [
      ...prevSuppliers,
      { ...newSupplier, id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
    ]);
  };

  const handleBulkAddSuppliers = (newSuppliers: Omit<Supplier, 'id'>[]) => {
    const suppliersToAdd = newSuppliers.map((supplier, index) => ({
      ...supplier,
      id: `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
    }));
    setSuppliers(prevSuppliers => [...prevSuppliers, ...suppliersToAdd]);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prevSuppliers =>
      prevSuppliers.map(supplier =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier
      )
    );
  };
  
  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prevSuppliers =>
      prevSuppliers.filter(supplier => supplier.id !== supplierId)
    );
  };

  const handleAddAccount = (newAccount: Omit<MyAccountDetails, 'id'>) => {
    setMyAccounts(prevAccounts => [
      ...prevAccounts,
      { ...newAccount, id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
    ]);
  };

  const handleUpdateAccount = (updatedAccount: MyAccountDetails) => {
    setMyAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    setMyAccounts(prevAccounts =>
      prevAccounts.filter(account => account.id !== accountId)
    );
  };
  
  const handleImportData = (data: AppDataBackup) => {
    if (data && Array.isArray(data.suppliers) && Array.isArray(data.myAccounts)) {
      setSuppliers(data.suppliers);
      setMyAccounts(data.myAccounts);
      alert('Données importées avec succès !');
    } else {
      alert("Erreur: Le fichier de sauvegarde est invalide ou corrompu.");
    }
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'newTransfer':
        return <OrdreVirementForm suppliers={suppliers} accounts={myAccounts} />;
      case 'manageSuppliers':
        return (
          <ManageSuppliers 
            suppliers={suppliers} 
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onBulkAddSuppliers={handleBulkAddSuppliers}
          />
        );
      case 'myAccount':
        return <MyAccount 
          accounts={myAccounts}
          suppliers={suppliers}
          onUpdateAccount={handleUpdateAccount} 
          onDeleteAccount={handleDeleteAccount}
          onAddAccount={handleAddAccount}
          onImportData={handleImportData}
        />;
      default:
        return <OrdreVirementForm suppliers={suppliers} accounts={myAccounts} />;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
