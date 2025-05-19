import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDIDDto {
  @IsNotEmpty()
  @IsString()
  didId!: string;

  @IsNotEmpty()
  @IsString()
  documentHash!: string;
}

export class UpdateDIDDocumentDto {
  @IsNotEmpty()
  @IsString()
  didId!: string;

  @IsNotEmpty()
  @IsString()
  newDocumentHash!: string;
}

export class ChangeControllerDto {
  @IsNotEmpty()
  @IsString()
  didId!: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  newController!: string;
}

export class DeactivateDIDDto {
  @IsNotEmpty()
  @IsString()
  didId!: string;
}

export class DIDQueryDto {
  @IsNotEmpty()
  @IsString()
  didId!: string;
} 