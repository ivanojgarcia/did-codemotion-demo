import { Injectable, Logger } from '@nestjs/common';
import { DIDRegistryService } from './did-registry.service';
import { 
  CredentialClaims, 
  IssueCredentialRequest, 
  VerifiableCredential, 
  VerifyCredentialRequest, 
  VerificationResult 
} from '../interfaces/credentials.interface';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);
  // Simulamos un almacenamiento de credenciales (en producción sería una DB real)
  private credentials: Map<string, VerifiableCredential> = new Map();

  constructor(private didRegistryService: DIDRegistryService) {}

  async issueCredential(request: IssueCredentialRequest): Promise<string> {
    try {
      // Verificar que el emisor existe y está activo
      const issuerActive = await this.didRegistryService.isDIDActive(request.issuerDid);
      if (!issuerActive) {
        throw new Error(`Issuer DID ${request.issuerDid} is not active`);
      }

      // Verificar que el sujeto existe y está activo
      const subjectActive = await this.didRegistryService.isDIDActive(request.subjectDid);
      if (!subjectActive) {
        throw new Error(`Subject DID ${request.subjectDid} is not active`);
      }

      // Generar un ID único para la credencial
      const credentialId = `vc:ethr:codemtn:${request.credentialType.toLowerCase()}:${this.generateRandomId()}`;
      
      // Crear la credencial verificable
      const credential: VerifiableCredential = {
        id: credentialId,
        type: request.credentialType,
        issuer: request.issuerDid,
        issuanceDate: new Date().toISOString(),
        expirationDate: request.expirationDate,
        credentialSubject: {
          id: request.subjectDid,
          claims: request.claims,
        },
        proof: {
          type: 'EcdsaSecp256k1Signature2019',
          created: new Date().toISOString(),
          proofPurpose: 'assertionMethod',
          verificationMethod: `${request.issuerDid}#keys-1`,
          jws: this.generateProof(request),
        },
      };

      // Almacenar la credencial
      this.credentials.set(credentialId, credential);
      this.logger.log(`Credential ${credentialId} issued successfully`);

      return credentialId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error issuing credential: ${errorMessage}`);
      throw error;
    }
  }

  async verifyCredential(request: VerifyCredentialRequest): Promise<VerificationResult> {
    try {
      // Buscar la credencial
      const credential = this.credentials.get(request.credentialId);
      if (!credential) {
        return {
          success: false,
          verified: false,
          issuer: '',
          subject: '',
          claims: {},
          errors: ['Credential not found'],
        };
      }

      // Verificar que el emisor existe y está activo
      const issuerActive = await this.didRegistryService.isDIDActive(credential.issuer);
      if (!issuerActive) {
        return {
          success: false,
          verified: false,
          issuer: credential.issuer,
          subject: credential.credentialSubject.id,
          claims: credential.credentialSubject.claims,
          errors: ['Issuer DID is not active'],
        };
      }

      // Verificar que la credencial no ha expirado
      if (credential.expirationDate && new Date(credential.expirationDate) < new Date()) {
        return {
          success: false,
          verified: false,
          issuer: credential.issuer,
          subject: credential.credentialSubject.id,
          claims: credential.credentialSubject.claims,
          errors: ['Credential has expired'],
        };
      }

      // Verificar la firma (simplificado para esta demo)
      const verified = this.verifyProof(credential);

      return {
        success: true,
        verified,
        issuer: credential.issuer,
        subject: credential.credentialSubject.id,
        claims: credential.credentialSubject.claims,
        validUntil: credential.expirationDate,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error verifying credential: ${errorMessage}`);
      
      return {
        success: false,
        verified: false,
        issuer: '',
        subject: '',
        claims: {},
        errors: [errorMessage],
      };
    }
  }

  // Método para obtener una credencial por su ID
  getCredential(credentialId: string): VerifiableCredential | undefined {
    return this.credentials.get(credentialId);
  }

  // Método auxiliar para generar un ID aleatorio
  private generateRandomId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  // Método simulado para generar una prueba criptográfica
  private generateProof(request: IssueCredentialRequest): string {
    // En un entorno real, esto sería una firma criptográfica
    const payload = JSON.stringify({
      issuer: request.issuerDid,
      subject: request.subjectDid,
      type: request.credentialType,
      claims: request.claims,
      timestamp: Date.now(),
    });
    
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  // Método simulado para verificar una prueba criptográfica
  private verifyProof(credential: VerifiableCredential): boolean {
    // En un entorno real, esto verificaría criptográficamente la firma
    // Para la demo, siempre devolvemos true
    return true;
  }
} 