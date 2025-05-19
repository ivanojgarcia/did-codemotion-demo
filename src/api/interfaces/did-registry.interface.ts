export interface DIDInfo {
  controller: string;
  documentHash: string;
  lastUpdated: number;
}

export interface DIDRegistration {
  didId: string;
  documentHash: string;
}

export interface DIDDocumentUpdate {
  didId: string;
  newDocumentHash: string;
}

export interface DIDControllerChange {
  didId: string;
  newController: string;
}

export interface DIDDeactivation {
  didId: string;
}

export interface DIDQuery {
  didId: string;
} 