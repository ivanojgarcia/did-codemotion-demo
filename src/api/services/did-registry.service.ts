import { Injectable, Logger } from '@nestjs/common';
import { Contract, Wallet } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { DIDInfo } from '../interfaces/did-registry.interface';
import { DIDDocumentService } from './did-document.service';
import { DIDDocument } from '../interfaces/did-document.interface';

@Injectable()
export class DIDRegistryService {
  private readonly logger = new Logger(DIDRegistryService.name);
  private contract!: Contract;
  private wallet!: Wallet;

  constructor(
    private blockchainService: BlockchainService,
    private configService: ConfigService,
    private didDocumentService: DIDDocumentService,
  ) {
    this.initializeContract();
    this.initializeWallet();
  }

  private initializeContract() {
    this.contract = this.blockchainService.getDIDRegistryContract();
  }

  private initializeWallet() {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is not defined in the environment variables');
    }
    
    this.wallet = new Wallet(privateKey, this.blockchainService.getProvider());
    
    // Conectar el contrato al wallet para poder enviar transacciones
    this.contract = this.contract.connect(this.wallet) as Contract;
  }

  async createDID(): Promise<string> {
    try {
      // En caso de que la función createDID no esté disponible en el contrato,
      // generamos el DID en el lado del cliente
      let didId;
      let address;
      
      if (typeof this.contract.createDID === 'function') {
        didId = await this.contract.createDID();
      } else {
        address = await this.wallet.getAddress();
        didId = `did:ethr:codemtn:${address.slice(2).toLowerCase()}`;
      }
      
      // Si no tenemos la dirección todavía, la extraemos del DID
      if (!address) {
        address = '0x' + didId.split(':').pop()!;
      }
      
      // Crear un documento DID completo para este identificador
      const didDocument = this.didDocumentService.createDIDDocument(didId, address);
      
      // Generar un hash del documento para almacenar en blockchain
      const documentHash = this.didDocumentService.generateDocumentHash(didDocument);
      
      this.logger.log(`New DID created: ${didId} with document hash: ${documentHash}`);
      
      return didId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creating new DID: ${errorMessage}`);
      throw error;
    }
  }

  async registerDID(didId: string, documentHash: string): Promise<boolean> {
    try {
      const tx = await this.contract.registerDID(didId, documentHash);
      await tx.wait();
      this.logger.log(`DID ${didId} registered successfully`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error registering DID ${didId}: ${errorMessage}`);
      throw error;
    }
  }

  async updateDIDDocument(didId: string, newDocumentHash: string): Promise<boolean> {
    try {
      const tx = await this.contract.updateDIDDocument(didId, newDocumentHash);
      await tx.wait();
      this.logger.log(`DID document ${didId} updated successfully`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error updating DID document ${didId}: ${errorMessage}`);
      throw error;
    }
  }

  async changeController(didId: string, newController: string): Promise<boolean> {
    try {
      const tx = await this.contract.changeController(didId, newController);
      await tx.wait();
      this.logger.log(`Controller for DID ${didId} changed successfully`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error changing controller for DID ${didId}: ${errorMessage}`);
      throw error;
    }
  }

  async deactivateDID(didId: string): Promise<boolean> {
    try {
      const tx = await this.contract.deactivateDID(didId);
      await tx.wait();
      this.logger.log(`DID ${didId} deactivated successfully`);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deactivating DID ${didId}: ${errorMessage}`);
      throw error;
    }
  }

  async getDIDInfo(didId: string): Promise<DIDInfo> {
    try {
      const result = await this.contract.getDIDInfo(didId);
      
      return {
        controller: result[0],
        documentHash: result[1],
        lastUpdated: Number(result[2])
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting DID info for ${didId}: ${errorMessage}`);
      throw error;
    }
  }

  async isDIDActive(didId: string): Promise<boolean> {
    try {
      return await this.contract.isDIDActive(didId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error checking if DID ${didId} is active: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Obtiene el documento DID completo
   */
  getDIDDocument(didId: string): DIDDocument | undefined {
    return this.didDocumentService.getDIDDocument(didId);
  }

  /**
   * Registra un DID con su documento completo
   */
  async registerDIDWithDocument(didId: string, document: DIDDocument): Promise<boolean> {
    try {
      // Generar hash del documento
      const documentHash = this.didDocumentService.generateDocumentHash(document);
      
      // Registrar el DID en la blockchain
      await this.registerDID(didId, documentHash);
      
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error registering DID with document: ${errorMessage}`);
      throw error;
    }
  }
} 