import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, JsonRpcProvider } from 'ethers';
import * as DIDRegistryArtifact from '../../../artifacts/contracts/DIDRegistry.sol/DIDRegistry.json';

@Injectable()
export class BlockchainService {
  private provider!: JsonRpcProvider;
  private didRegistryContract!: Contract;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
    this.initializeContracts();
  }

  private initializeProvider() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL', 'http://localhost:8545');
    this.provider = new JsonRpcProvider(rpcUrl);
  }

  private initializeContracts() {
    const didRegistryAddress = this.configService.get<string>('DID_REGISTRY_ADDRESS');
    
    if (!didRegistryAddress) {
      throw new Error('DID_REGISTRY_ADDRESS is not defined in the environment variables');
    }

    this.didRegistryContract = new Contract(
      didRegistryAddress,
      DIDRegistryArtifact.abi,
      this.provider
    );
  }

  getDIDRegistryContract() {
    return this.didRegistryContract;
  }

  getProvider() {
    return this.provider;
  }
} 