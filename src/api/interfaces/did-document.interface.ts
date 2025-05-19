export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyHex?: string;
  publicKeyBase58?: string;
  publicKeyJwk?: any;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
  description?: string;
}

export interface DIDDocument {
  "@context": string | string[];
  id: string;
  controller?: string;
  alsoKnownAs?: string[];
  verificationMethod?: VerificationMethod[];
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: Service[];
  created?: string;
  updated?: string;
} 