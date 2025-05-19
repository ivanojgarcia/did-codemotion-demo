import { Module } from '@nestjs/common';
import { DIDController } from './controllers/did.controller';
import { CredentialsController } from './controllers/credentials.controller';
import { DIDRegistryService } from './services/did-registry.service';
import { BlockchainService } from './services/blockchain.service';
import { CredentialsService } from './services/credentials.service';
import { DIDDocumentService } from './services/did-document.service';

@Module({
  controllers: [DIDController, CredentialsController],
  providers: [
    DIDRegistryService, 
    BlockchainService, 
    CredentialsService,
    DIDDocumentService
  ],
  exports: [
    DIDRegistryService, 
    BlockchainService, 
    CredentialsService,
    DIDDocumentService
  ],
})
export class ApiModule {} 