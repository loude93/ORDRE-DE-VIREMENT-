
export interface Supplier {
  id: string;
  name: string;
  rib: string;
}

export interface MyAccountDetails {
  id:string;
  companyName: string;
  rib: string;
  bankAddress: string;
  signatoryName: string;
  letterhead?: {
    name: string;
    dataUrl: string;
  };
}

export interface AppDataBackup {
  suppliers: Supplier[];
  myAccounts: MyAccountDetails[];
}
