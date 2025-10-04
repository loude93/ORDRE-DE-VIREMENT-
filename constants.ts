
import { Supplier, MyAccountDetails } from './types';

const defaultBankAddress = "Attijariwafa Bank, 22 Rue de la Paix, 75002 Paris";

export const MY_ACCOUNTS: MyAccountDetails[] = [
  { id: "acc1", companyName: "AKOR FOODS", rib: "007787000215400030054744", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { id: "acc2", companyName: "MGM FOOD", rib: "007787000215400030054755", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { id: "acc3", companyName: "DREAM DONUTS & COFFEE", rib: "007787000215400030054766", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { id: "acc4", companyName: "RASMAL GESTION", rib: "007787000215400030054777", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { id: "acc5", companyName: "SHOPAL", rib: "007787000215400030054788", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
  { id: "acc6", companyName: "CHICCORNER", rib: "007787000215400030054799", bankAddress: defaultBankAddress, signatoryName: "Le Gérant" },
];

export const SUPPLIERS: Supplier[] = [
  // Companies are already in MY_ACCOUNTS, removed from here to avoid confusion.
  { id: "5", name: "Fournisseur Alpha", rib: "164787000215400030051234" },
  { id: "6", name: "Services Beta SARL", rib: "164787000215400030054321" },
  { id: "7", name: "Logistique Gamma", rib: "164787000215400030055678" },
];

export const CURRENCIES = ["MAD"];