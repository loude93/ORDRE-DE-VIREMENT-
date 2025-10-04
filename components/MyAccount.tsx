

import React, { useState, useEffect } from 'react';
import { MyAccountDetails } from '../types';

interface MyAccountProps {
  accounts: MyAccountDetails[];
  onUpdateAccount: (account: MyAccountDetails) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddAccount: (account: Omit<MyAccountDetails, 'id'>) => void;
}

const BankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1-3.72a6 6 0 00-6-3.72h-1a2 2 0 00-2 2v6h12z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);


const FileInput: React.FC<{ label: string; id: string; fileName: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void; }> = ({ label, id, fileName, onChange, onClear }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {fileName ? (
            <div className="mt-1 flex items-center justify-between bg-gray-100 p-2 rounded-md">
                <span className="text-sm text-gray-800 truncate">{fileName}</span>
                <button type="button" onClick={onClear} className="text-sm font-medium text-red-600 hover:text-red-800 ml-2">Changer</button>
            </div>
        ) : (
            <div className="mt-1">
                <input
                    type="file"
                    name={id}
                    id={id}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="application/pdf"
                    onChange={onChange}
                />
            </div>
        )}
    </div>
);


const InputField: React.FC<{ 
    label: string; 
    id: string; 
    placeholder: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    maxLength?: number;
    pattern?: string;
    title?: string;
    isMono?: boolean;
    required?: boolean;
}> = ({ label, id, placeholder, value, onChange, maxLength, pattern, title, isMono = false, required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            name={id}
            id={id}
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3 ${isMono ? 'font-mono' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete="off"
            maxLength={maxLength}
            pattern={pattern}
            title={title}
            required={required}
        />
    </div>
);


const MyAccount: React.FC<MyAccountProps> = ({ accounts, onUpdateAccount, onDeleteAccount, onAddAccount }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<MyAccountDetails | null>(null);
    const [editedCompanyName, setEditedCompanyName] = useState('');
    const [editedRib, setEditedRib] = useState('');
    const [editedBankAddress, setEditedBankAddress] = useState('');
    const [editedSignatoryName, setEditedSignatoryName] = useState('');
    const [editedLetterhead, setEditedLetterhead] = useState<MyAccountDetails['letterhead']>(undefined);

    useEffect(() => {
        if (editingAccount) {
            setEditedCompanyName(editingAccount.companyName);
            setEditedRib(editingAccount.rib);
            setEditedBankAddress(editingAccount.bankAddress);
            setEditedSignatoryName(editingAccount.signatoryName);
            setEditedLetterhead(editingAccount.letterhead);
        }
    }, [editingAccount]);

    const handleOpenAddModal = () => {
        setEditingAccount(null);
        setEditedCompanyName('');
        setEditedRib('');
        setEditedBankAddress('');
        setEditedSignatoryName('');
        setEditedLetterhead(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (account: MyAccountDetails) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (account: MyAccountDetails) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte "${account.companyName}" ? Cette action est irréversible.`)) {
            onDeleteAccount(account.id);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setEditedLetterhead({
                        name: file.name,
                        dataUrl: event.target.result as string,
                    });
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Veuillez sélectionner un fichier PDF.");
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editedRib.length !== 24 || !/^\d{24}$/.test(editedRib)) {
            alert("Le RIB doit contenir exactement 24 chiffres.");
            return;
        }

        if (!editedLetterhead) {
            alert("Le papier à en-tête est obligatoire. Veuillez sélectionner un fichier PDF.");
            return;
        }

        if (editingAccount) {
            onUpdateAccount({
                ...editingAccount,
                rib: editedRib,
                bankAddress: editedBankAddress,
                signatoryName: editedSignatoryName,
                letterhead: editedLetterhead
            });
        } else {
             if (!editedCompanyName || !editedBankAddress || !editedSignatoryName) {
                alert("Veuillez remplir tous les champs obligatoires.");
                return;
            }
            onAddAccount({
                companyName: editedCompanyName,
                rib: editedRib,
                bankAddress: editedBankAddress,
                signatoryName: editedSignatoryName,
                letterhead: editedLetterhead,
            });
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Mes Comptes</h1>
                <button
                    type="button"
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center space-x-2"
                    onClick={handleOpenAddModal}
                >
                    <PlusIcon />
                    <span>Ajouter une société</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts
                    .slice()
                    .sort((a, b) => a.companyName.localeCompare(b.companyName))
                    .map((account) => (
                    <div 
                        key={account.id} 
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between"
                    >
                        <div className="flex items-start space-x-4 text-left">
                            <div>
                                <BankIcon />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold text-gray-900">{account.companyName}</h2>
                                <div className="mt-2 space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">RIB</p>
                                        <p className="text-md text-gray-800 font-mono bg-gray-100 p-2 rounded-md mt-1 truncate">{account.rib}</p>
                                    </div>
                                     <div>
                                        <p className="text-sm font-medium text-gray-500">Nom du Signataire</p>
                                        <p className="text-md text-gray-800 bg-gray-100 p-2 rounded-md mt-1 truncate">{account.signatoryName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Adresse Banque</p>
                                        <p className="text-md text-gray-800 bg-gray-100 p-2 rounded-md mt-1 truncate">{account.bankAddress}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Papier à en-tête</p>
                                        <p className="text-md text-gray-800 bg-gray-100 p-2 rounded-md mt-1 truncate">{account.letterhead?.name || 'Non spécifié'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                             <button 
                                onClick={() => handleEditClick(account)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Modifier
                            </button>
                            <button 
                                onClick={() => handleDeleteClick(account)}
                                className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in-down" style={{animationDuration: '0.3s'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleSave}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">{editingAccount ? `Modifier le compte : ${editingAccount.companyName}` : 'Ajouter une nouvelle société'}</h3>
                                <div className="mt-4 space-y-4">
                                    {!editingAccount && (
                                        <InputField 
                                            label="Nom de la société"
                                            id="add-company-name"
                                            placeholder="Ex: RASMAL GESTION"
                                            value={editedCompanyName}
                                            onChange={(e) => setEditedCompanyName(e.target.value)}
                                            required
                                        />
                                    )}
                                    <InputField 
                                        label="RIB (24 chiffres)"
                                        id="edit-rib"
                                        placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                                        value={editedRib}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setEditedRib(val);
                                        }}
                                        maxLength={24}
                                        pattern="\d{24}"
                                        title="Le RIB doit contenir exactement 24 chiffres."
                                        isMono
                                        required
                                    />
                                    <InputField 
                                        label="Nom du Signataire"
                                        id="edit-signatory-name"
                                        placeholder="Ex: Le Gérant"
                                        value={editedSignatoryName}
                                        onChange={(e) => setEditedSignatoryName(e.target.value)}
                                        required
                                    />
                                    <InputField 
                                        label="Adresse de la banque"
                                        id="edit-bank-address"
                                        placeholder="Ex: Nom de la banque, Adresse..."
                                        value={editedBankAddress}
                                        onChange={(e) => setEditedBankAddress(e.target.value)}
                                        required
                                    />
                                    <FileInput
                                        label="Papier à en-tête (PDF, obligatoire)"
                                        id="edit-letterhead"
                                        fileName={editedLetterhead?.name || ''}
                                        onChange={handleFileChange}
                                        onClear={() => setEditedLetterhead(undefined)}
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {editingAccount ? 'Enregistrer' : 'Ajouter'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAccount;