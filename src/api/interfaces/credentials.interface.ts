export interface CredentialClaims {
  [key: string]: any;
}

export interface IssueCredentialRequest {
  issuerDid: string;
  subjectDid: string;
  credentialType: string;
  claims: CredentialClaims;
  expirationDate?: string;
}

export interface VerifiableCredential {
  id: string;
  type: string;
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string;
    claims: CredentialClaims;
  };
  proof: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

export interface VerifyCredentialRequest {
  credentialId: string;
  verifierDid: string;
  presentationContext: string;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  issuer: string;
  subject: string;
  claims: CredentialClaims;
  validUntil?: string;
  errors?: string[];
} 