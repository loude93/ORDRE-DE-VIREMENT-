import { Supplier, MyAccountDetails } from './types';

const defaultBankAddress = "Attijariwafa Bank, 22 Rue de la Paix, 75002 Paris";

export const INITIAL_ACCOUNTS: Omit<MyAccountDetails, 'id'>[] = [
  { companyName: "AKOR FOODS", rib: "007787000215400030054744", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { companyName: "MGM FOOD", rib: "007787000215400030054755", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { companyName: "DREAM DONUTS & COFFEE", rib: "007787000215400030054766", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { companyName: "RASMAL GESTION", rib: "007787000215400030054777", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { companyName: "SHOPAL", rib: "007787000215400030054788", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { companyName: "CHICCORNER", rib: "007787000215400030054799", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
];

export const INITIAL_SUPPLIERS: Omit<Supplier, 'id'>[] = [
  { name: "Fournisseur Alpha", rib: "164787000215400030051234" },
  { name: "Services Beta SARL", rib: "164787000215400030054321" },
  { name: "Logistique Gamma", rib: "164787000215400030055678" },
];

export const CURRENCIES = ["MAD"];