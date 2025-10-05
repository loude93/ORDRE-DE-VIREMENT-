import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import OrdreVirementForm from './components/OrdreVirementForm';
import ManageSuppliers from './components/ManageSuppliers';
import MyAccount from './components/MyAccount';
import { Supplier, MyAccountDetails, AppDataBackup } from './types';
import { INITIAL_ACCOUNTS, INITIAL_SUPPLIERS } from './constants';

type Page = 'newTransfer' | 'manageSuppliers' | 'myAccount';

// Helper to get initial state from localStorage or seed with default data
const getInitialState = <T extends { id: string }>(key: string, defaultValue: Omit<T, 'id'>[]): T[] => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      // Basic validation to ensure it's an array
      const parsed = JSON.parse(storedValue);
      return Array.isArray(parsed) ? parsed : [];
    }
    // If no stored value, create initial data with UUIDs
    const initialData = defaultValue.map(item => ({ ...item, id: crypto.randomUUID() })) as T[];
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  } catch (error) {
    console.error(`Error reading from localStorage for key "${key}":`, error);
    // Fallback to default in case of error
    return defaultValue.map(item => ({ ...item, id: crypto.randomUUID() })) as T[];
  }
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('newTransfer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getInitialState<Supplier>('suppliers', INITIAL_SUPPLIERS));
  const [myAccounts, setMyAccounts] = useState<MyAccountDetails[]>(() => getInitialState<MyAccountDetails>('myAccounts', INITIAL_ACCOUNTS));

  // Effect to save suppliers to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    } catch (error) {
        console.error("Failed to save suppliers to localStorage:", error);
        alert("Erreur: Impossible de sauvegarder les fournisseurs. Le stockage local est peut-être plein.");
    }
  }, [suppliers]);

  // Effect to save accounts to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('myAccounts', JSON.stringify(myAccounts));
    } catch (error) {
        console.error("Failed to save myAccounts to localStorage:", error);
        alert("Erreur: Impossible de sauvegarder les comptes. Le stockage local est peut-être plein.");
    }
  }, [myAccounts]);
  
  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id'>) => {
    setSuppliers(prev => [...prev, { ...newSupplier, id: crypto.randomUUID() }]);
  };
  
  const handleBulkAddSuppliers = (newSuppliers: Omit<Supplier, 'id'>[]) => {
    const suppliersWithIds = newSuppliers.map(s => ({ ...s, id: crypto.randomUUID() }));
    setSuppliers(prev => [...prev, ...suppliersWithIds]);
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
  };
  
  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
  };

  const handleAddAccount = (newAccount: Omit<MyAccountDetails, 'id'>) => {
    setMyAccounts(prev => [...prev, { ...newAccount, id: crypto.randomUUID() }]);
  };

  const handleUpdateAccount = (updatedAccount: MyAccountDetails) => {
    setMyAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
  };

  const handleDeleteAccount = (accountId: string) => {
    setMyAccounts(prev => prev.filter(a => a.id !== accountId));
  };
  
  const handleImportData = (data: AppDataBackup) => {
    if (!data || typeof data !== 'object') {
      alert("Erreur: Le fichier de sauvegarde est invalide ou corrompu.");
      return;
    }

    const { suppliers: importedSuppliers, myAccounts: importedAccounts, version } = data;

    if (version !== 1) {
      alert(`Avertissement: La version du fichier de sauvegarde (v${version || 'inconnue'}) n'est pas prise en charge.`);
      // Continue for now, but in the future, you might want to stop here or run a migration.
    }

    let importSuccess = false;
    if (Array.isArray(importedSuppliers)) {
      setSuppliers(importedSuppliers);
      importSuccess = true;
    }
    if (Array.isArray(importedAccounts)) {
      setMyAccounts(importedAccounts);
      importSuccess = true;
    }

    if(importSuccess) {
      alert("Les données ont été importées avec succès !");
    } else {
      alert("Aucune donnée valide à importer n'a été trouvée dans le fichier.");
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
          onUpdateAccount={handleUpdateAccount} 
          onDeleteAccount={handleDeleteAccount}
          onAddAccount={handleAddAccount}
          suppliers={suppliers}
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