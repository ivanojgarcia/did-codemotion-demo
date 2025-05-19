import { Injectable, Logger } from '@nestjs/common';
import { DIDDocument, VerificationMethod, Service } from '../interfaces/did-document.interface';
import * as crypto from 'crypto';

@Injectable()
export class DIDDocumentService {
  private readonly logger = new Logger(DIDDocumentService.name);
  // Simulamos un almacenamiento local de documentos DID
  private didDocuments: Map<string, DIDDocument> = new Map();

  /**
   * Crea un nuevo documento DID para la dirección proporcionada
   */
  createDIDDocument(didId: string, address: string): DIDDocument {
    // Verificar si ya existe un documento para este DID
    if (this.didDocuments.has(didId)) {
      return this.didDocuments.get(didId)!;
    }

    // Generar una clave pública simulada
    const publicKeyHex = this.generateSimulatedPublicKey();
    
    // Fecha actual para created y updated
    const timestamp = new Date().toISOString();
    
    // Crear el documento DID según la especificación W3C
    const document: DIDDocument = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      id: didId,
      controller: didId,
      verificationMethod: [
        {
          id: `${didId}#keys-1`,
          type: "EcdsaSecp256k1VerificationKey2019",
          controller: didId,
          publicKeyHex: publicKeyHex
        }
      ],
      authentication: [
        `${didId}#keys-1`
      ],
      assertionMethod: [
        `${didId}#keys-1`
      ],
      service: [
        {
          id: `${didId}#profile`,
          type: "SocialNetworkProfile",
          serviceEndpoint: `https://codemtn.com/profile/${address.slice(2).toLowerCase()}`
        }
      ],
      created: timestamp,
      updated: timestamp
    };
    
    // Almacenar el documento
    this.didDocuments.set(didId, document);
    this.logger.log(`Created DID Document for ${didId}`);
    
    return document;
  }

  /**
   * Obtiene un documento DID existente o devuelve undefined si no existe
   */
  getDIDDocument(didId: string): DIDDocument | undefined {
    return this.didDocuments.get(didId);
  }

  /**
   * Actualiza un documento DID existente
   */
  updateDIDDocument(didId: string, updates: Partial<DIDDocument>): DIDDocument | undefined {
    const existingDocument = this.didDocuments.get(didId);
    
    if (!existingDocument) {
      return undefined;
    }
    
    // No permitir cambiar el ID del documento
    const { id, ...allowedUpdates } = updates;
    
    // Actualizar el documento
    const updatedDocument: DIDDocument = {
      ...existingDocument,
      ...allowedUpdates,
      updated: new Date().toISOString()
    };
    
    // Guardar el documento actualizado
    this.didDocuments.set(didId, updatedDocument);
    this.logger.log(`Updated DID Document for ${didId}`);
    
    return updatedDocument;
  }

  /**
   * Agrega un servicio al documento DID
   */
  addService(didId: string, service: Service): DIDDocument | undefined {
    const document = this.didDocuments.get(didId);
    
    if (!document) {
      return undefined;
    }
    
    // Crear un nuevo array de servicios o usar el existente
    const services = document.service || [];
    
    // Agregar el nuevo servicio
    const updatedServices = [...services, service];
    
    // Actualizar el documento
    return this.updateDIDDocument(didId, {
      service: updatedServices
    });
  }

  /**
   * Agrega un método de verificación al documento DID
   */
  addVerificationMethod(didId: string, method: VerificationMethod): DIDDocument | undefined {
    const document = this.didDocuments.get(didId);
    
    if (!document) {
      return undefined;
    }
    
    // Crear un nuevo array de métodos de verificación o usar el existente
    const methods = document.verificationMethod || [];
    
    // Agregar el nuevo método
    const updatedMethods = [...methods, method];
    
    // Actualizar el documento
    return this.updateDIDDocument(didId, {
      verificationMethod: updatedMethods
    });
  }

  /**
   * Genera un hash del documento DID para almacenar en blockchain
   */
  generateDocumentHash(document: DIDDocument): string {
    const documentString = JSON.stringify(document);
    return crypto.createHash('sha256').update(documentString).digest('hex');
  }

  /**
   * Simula la generación de una clave pública
   */
  private generateSimulatedPublicKey(): string {
    // En un entorno real, esto sería una clave criptográfica real
    return crypto.randomBytes(32).toString('hex');
  }
} 