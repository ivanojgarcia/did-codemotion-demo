import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { CredentialsService } from '../services/credentials.service';
import { IssueCredentialDto, VerifyCredentialDto } from '../dto/credentials.dto';
import { VerificationResult } from '../interfaces/credentials.interface';

@Controller('credentials')
export class CredentialsController {
  private readonly logger = new Logger(CredentialsController.name);

  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('issue')
  async issueCredential(@Body() issueCredentialDto: IssueCredentialDto) {
    try {
      const credentialId = await this.credentialsService.issueCredential({
        issuerDid: issueCredentialDto.issuerDid,
        subjectDid: issueCredentialDto.subjectDid,
        credentialType: issueCredentialDto.credentialType,
        claims: issueCredentialDto.claims,
        expirationDate: issueCredentialDto.expirationDate,
      });
      
      // Obtener la credencial completa para devolverla al cliente
      const credential = this.credentialsService.getCredential(credentialId);
      
      return credential;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to issue credential: ${errorMessage}`);
      throw new HttpException(
        'Failed to issue credential',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify')
  async verifyCredential(@Body() verifyCredentialDto: VerifyCredentialDto): Promise<VerificationResult> {
    try {
      return await this.credentialsService.verifyCredential({
        credentialId: verifyCredentialDto.credentialId,
        verifierDid: verifyCredentialDto.verifierDid,
        presentationContext: verifyCredentialDto.presentationContext,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to verify credential: ${errorMessage}`);
      throw new HttpException(
        'Failed to verify credential',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':credentialId')
  async getCredential(@Param('credentialId') credentialId: string) {
    try {
      const credential = this.credentialsService.getCredential(credentialId);
      
      if (!credential) {
        throw new HttpException('Credential not found', HttpStatus.NOT_FOUND);
      }
      
      return credential;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get credential: ${errorMessage}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to get credential',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 