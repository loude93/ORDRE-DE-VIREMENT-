
import React, { useState } from 'react';
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
        />
    </div>
);

interface ManageSuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: { name: string, rib: string }) => void;
}

const ManageSuppliers: React.FC<ManageSuppliersProps> = ({ suppliers, onAddSupplier }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newRib, setNewRib] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newRib || newRib.length !== 24 || !/^\d{24}$/.test(newRib)) {
            alert("Veuillez remplir tous les champs. Le RIB doit contenir exactement 24 chiffres.");
            return;
        }
        onAddSupplier({ name: newName, rib: newRib });
        setNewName('');
        setNewRib('');
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Fournisseurs</h1>
                <button
                    type="button"
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center space-x-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusIcon />
                    <span>Ajouter un nouveau fournisseur</span>
                </button>
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
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 font-mono">{supplier.rib}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => alert(`Modifier ${supplier.name}`)} className="text-blue-600 hover:text-blue-900">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => alert(`Supprimer ${supplier.name}`)} className="text-red-600 hover:text-red-900">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Add Supplier Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <form onSubmit={handleAddSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Ajouter un nouveau fournisseur</h3>
                                <div className="mt-4 space-y-4">
                                    <InputField 
                                        label="Nom du Fournisseur"
                                        id="new-supplier-name"
                                        placeholder="Ex: Services Beta SARL"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                    <InputField 
                                        label="RIB du Fournisseur (24 chiffres)"
                                        id="new-supplier-rib"
                                        placeholder="XXXXXXXXXXXXXXXXXXXXXXXX"
                                        value={newRib}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) {
                                                setNewRib(val);
                                            }
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
                                    Ajouter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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

export default ManageSuppliers;
