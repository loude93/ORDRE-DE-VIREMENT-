
import React, { useState, useRef } from 'react';
import { Supplier } from '../types';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
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
}> = ({ label, id, placeholder, value, onChange, maxLength, pattern, title }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type="text"
            name={id}
            id={id}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3 font-mono"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete="off"
            maxLength={maxLength}
            pattern={pattern}
            title={title}
            required
        />
    </div>
);

interface ManageSuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: { name: string, rib: string }) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onBulkAddSuppliers: (suppliers: { name: string; rib: string }[]) => void;
}

const ManageSuppliers: React.FC<ManageSuppliersProps> = ({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier, onBulkAddSuppliers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formName, setFormName] = useState('');
    const [formRib, setFormRib] = useState('');
    const [importSummary, setImportSummary] = useState<{ newSuppliers: { name: string, rib: string }[], errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModalForAdd = () => {
        setEditingSupplier(null);
        setFormName('');
        setFormRib('');
        setIsModalOpen(true);
    };

    const openModalForEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormName(supplier.name);
        setFormRib(supplier.rib);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        setFormName('');
        setFormRib('');
    };
    
    const handleDelete = (supplier: Supplier) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplier.name}" ? Cette action est irréversible.`)) {
            onDeleteSupplier(supplier.id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName || !formRib || formRib.length !== 24 || !/^\d{24}$/.test(formRib)) {
            alert("Veuillez remplir tous les champs. Le RIB doit contenir exactement 24 chiffres.");
            return;
        }

        if (editingSupplier) {
            onUpdateSupplier({ ...editingSupplier, name: formName, rib: formRib });
        } else {
            onAddSupplier({ name: formName, rib: formRib });
        }
        
        closeModal();
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                const existingRibs = new Set(suppliers.map(s => s.rib));
                const newSuppliers: { name: string, rib: string }[] = [];
                const errors: string[] = [];
                const lines = text.split(/\r?\n/);

                lines.forEach((line, index) => {
                    if (!line.trim()) return; 

                    const values = line.split(/[;,]/);
                    if (values.length !== 2) {
                        errors.push(`Ligne ${index + 1}: Format incorrect. Attendu: nom,rib`);
                        return;
                    }

                    const name = values[0].trim();
                    const rib = values[1].trim().replace(/\s/g, '');

                    if (!name) {
                        errors.push(`Ligne ${index + 1}: Le nom du fournisseur est vide.`);
                        return;
                    }
                    if (!/^\d{24}$/.test(rib)) {
                        errors.push(`Ligne ${index + 1}: RIB invalide pour "${name}". Il doit contenir 24 chiffres.`);
                        return;
                    }
                    if (existingRibs.has(rib)) {
                        errors.push(`Ligne ${index + 1}: Le RIB pour "${name}" existe déjà.`);
                        return;
                    }

                    newSuppliers.push({ name, rib });
                    existingRibs.add(rib);
                });
                
                setImportSummary({ newSuppliers, errors });
            }
        };
        reader.readAsText(file);

        if (event.target) {
            event.target.value = '';
        }
    };

    const confirmImport = () => {
        if (importSummary && importSummary.newSuppliers.length > 0) {
            onBulkAddSuppliers(importSummary.newSuppliers);
        }
        setImportSummary(null);
    };

    const cancelImport = () => {
        setImportSummary(null);
    };


    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,text/csv" />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h1>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200 flex items-center space-x-2"
                        onClick={handleImportClick}
                    >
                        <ImportIcon />
                        <span>Importer</span>
                    </button>
                    <button
                        type="button"
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center space-x-2"
                        onClick={openModalForAdd}
                    >
                        <PlusIcon />
                        <span>Ajouter</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InfoIcon />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            Pour importer des fournisseurs, créez un fichier CSV avec une ligne par fournisseur. Format: <strong>Nom,RIB</strong> (ex: <code>Fournisseur ABC,123...456</code>).
                        </p>
                    </div>
                </div>
            </div>


            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nom du Fournisseur
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    RIB
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {suppliers.length > 0 ? (
                                suppliers
                                    .slice()
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 font-mono">{supplier.rib}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button onClick={() => openModalForEdit(supplier)} className="text-blue-600 hover:text-blue-900" aria-label={`Modifier ${supplier.name}`}>
                                                    <EditIcon />
                                                </button>
                                                <button onClick={() => handleDelete(supplier)} className="text-red-600 hover:text-red-900" aria-label={`Supprimer ${supplier.name}`}>
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                                        Aucun fournisseur trouvé. Cliquez sur "Ajouter" ou "Importer" pour commencer.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in-down" style={{animationDuration: '0.3s'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">{editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un nouveau fournisseur'}</h3>
                                <div className="mt-4 space-y-4">
                                    <InputField 
                                        label="Nom du Fournisseur"
                                        id="supplier-name"
                                        placeholder="Ex: Services Beta SARL"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                    />
                                    <InputField 
                                        label="RIB du Fournisseur (24 chiffres)"
                                        id="supplier-rib"
                                        placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                                        value={formRib}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setFormRib(val);
                                        }}
                                        maxLength={24}
                                        pattern="\d{24}"
                                        title="Le RIB doit contenir exactement 24 chiffres."
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {editingSupplier ? 'Enregistrer' : 'Ajouter'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {importSummary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in-down">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Résumé de l'importation</h3>
                            <div className="mt-4">
                                {importSummary.newSuppliers.length > 0 && (
                                    <p className="text-sm text-green-800 bg-green-100 p-3 rounded-md">
                                        {importSummary.newSuppliers.length} fournisseur(s) valide(s) prêt(s) à être importé(s).
                                    </p>
                                )}
                                {importSummary.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-red-800 bg-red-100 p-3 rounded-md">
                                            {importSummary.errors.length} erreur(s) trouvée(s). Ces lignes seront ignorées.
                                        </p>
                                        <ul className="mt-2 list-disc list-inside text-sm text-red-700 max-h-32 overflow-y-auto p-3 border rounded-md bg-red-50">
                                            {importSummary.errors.map((error, index) => <li key={index}>{error}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {importSummary.newSuppliers.length === 0 && importSummary.errors.length === 0 && (
                                    <p className="mt-4 text-sm text-gray-600">Le fichier semble vide ou ne contient aucun fournisseur à ajouter.</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button
                                type="button"
                                onClick={confirmImport}
                                disabled={importSummary.newSuppliers.length === 0}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                Importer
                            </button>
                            <button
                                type="button"
                                onClick={cancelImport}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSuppliers;
