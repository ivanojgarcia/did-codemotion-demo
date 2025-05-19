import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  HttpException, 
  HttpStatus,
  Logger
} from '@nestjs/common';
import { DIDRegistryService } from '../services/did-registry.service';
import { 
  RegisterDIDDto, 
  UpdateDIDDocumentDto, 
  ChangeControllerDto, 
  DeactivateDIDDto,
  DIDQueryDto 
} from '../dto/did-registry.dto';
import { DIDInfo } from '../interfaces/did-registry.interface';
import { DIDDocument } from '../interfaces/did-document.interface';

@Controller('did')
export class DIDController {
  private readonly logger = new Logger(DIDController.name);

  constructor(private readonly didRegistryService: DIDRegistryService) {}

  @Post('register')
  async registerDID(@Body() registerDIDDto: RegisterDIDDto) {
    try {
      await this.didRegistryService.registerDID(
        registerDIDDto.didId, 
        registerDIDDto.documentHash
      );
      
      return {
        success: true,
        message: `DID ${registerDIDDto.didId} registered successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to register DID: ${errorMessage}`);
      throw new HttpException(
        'Failed to register DID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('update-document')
  async updateDIDDocument(@Body() updateDto: UpdateDIDDocumentDto) {
    try {
      await this.didRegistryService.updateDIDDocument(
        updateDto.didId,
        updateDto.newDocumentHash
      );
      
      return {
        success: true,
        message: `DID document ${updateDto.didId} updated successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update DID document: ${errorMessage}`);
      throw new HttpException(
        'Failed to update DID document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('change-controller')
  async changeController(@Body() changeControllerDto: ChangeControllerDto) {
    try {
      await this.didRegistryService.changeController(
        changeControllerDto.didId,
        changeControllerDto.newController
      );
      
      return {
        success: true,
        message: `Controller for DID ${changeControllerDto.didId} changed successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to change controller: ${errorMessage}`);
      throw new HttpException(
        'Failed to change controller',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('deactivate')
  async deactivateDID(@Body() deactivateDto: DeactivateDIDDto) {
    try {
      await this.didRegistryService.deactivateDID(deactivateDto.didId);
      
      return {
        success: true,
        message: `DID ${deactivateDto.didId} deactivated successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to deactivate DID: ${errorMessage}`);
      throw new HttpException(
        'Failed to deactivate DID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':didId')
  async getDIDInfo(@Param() params: DIDQueryDto): Promise<DIDInfo> {
    try {
      return await this.didRegistryService.getDIDInfo(params.didId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get DID info: ${errorMessage}`);
      throw new HttpException(
        'Failed to get DID info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':didId/active')
  async isDIDActive(@Param() params: DIDQueryDto) {
    try {
      const isActive = await this.didRegistryService.isDIDActive(params.didId);
      
      return {
        didId: params.didId,
        active: isActive,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check DID status: ${errorMessage}`);
      throw new HttpException(
        'Failed to check DID status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create')
  async createDID() {
    try {
      const did = await this.didRegistryService.createDID();
      
      // Obtener el documento DID completo
      const didDocument = this.didRegistryService.getDIDDocument(did);
      
      return {
        success: true,
        did,
        document: didDocument,
        message: 'DID created successfully',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create DID: ${errorMessage}`);
      throw new HttpException(
        'Failed to create DID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':didId/document')
  async getDIDDocument(@Param() params: DIDQueryDto): Promise<DIDDocument> {
    try {
      const didDocument = this.didRegistryService.getDIDDocument(params.didId);
      
      if (!didDocument) {
        throw new HttpException('DID document not found', HttpStatus.NOT_FOUND);
      }
      
      return didDocument;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get DID document: ${errorMessage}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to get DID document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('register-with-document')
  async registerDIDWithDocument(@Body() body: { didId: string, document: DIDDocument }) {
    try {
      await this.didRegistryService.registerDIDWithDocument(body.didId, body.document);
      
      return {
        success: true,
        message: `DID ${body.didId} registered with document successfully`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to register DID with document: ${errorMessage}`);
      throw new HttpException(
        'Failed to register DID with document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 