import { IsString, IsNotEmpty, IsObject, IsOptional, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CredentialClaimsDto {
  [key: string]: any;
}

export class IssueCredentialDto {
  @IsNotEmpty()
  @IsString()
  issuerDid!: string;

  @IsNotEmpty()
  @IsString()
  subjectDid!: string;

  @IsNotEmpty()
  @IsString()
  credentialType!: string;

  @IsNotEmpty()
  @IsObject()
  claims!: CredentialClaimsDto;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}

export class VerifyCredentialDto {
  @IsNotEmpty()
  @IsString()
  credentialId!: string;

  @IsNotEmpty()
  @IsString()
  verifierDid!: string;

  @IsNotEmpty()
  @IsString()
  presentationContext!: string;
} 