# Identidad Digital Descentralizada (DID) - Flujo de Demostración

## Caso de uso: Carla y la Red Social con Verificación Parental

Esta demostración muestra un flujo real de identidad digital descentralizada donde Carla (menor de edad) desea registrarse en una red social, sus padres verifican su edad mediante una credencial verificable, y finalmente puede acceder a la aplicación.

## Arquitectura

![Arquitectura](https://mermaid.ink/img/pako:eNqNkk1PwzAMhv9KlBMgTVsHbNIOiAMHDiBx4YY4hDamiVjzkWVVB1P_O2kLrB2HiUuk2I_fV7bsIxeKIIJMF1xqbNVOlZ35LqnALnL1hQbsOJX-5CRkMkgJsdcZTJ9iBCfQtkD-Lf4Jtxgqn_2OoXHAyRxvSVFpoZ6wFZx5wxUcbKqw7oYXs4vry_Pb-_XT2-Pl7PJ6Osk_j-l3PKM1mmDN68RbxOZnYtCNa1QRZPXkD-I2aJYwp97cBJXbEh_JGLYn0o1dT3JrTLGLp1lO9dACdpDrfbxA2Ck7_O5YKf4Py1EsRBOsFO1xZHZcxqVqbTUZ3a8m2dB-dHmJXRRkZTUJc4XRHcpCswiCzO0xsLOqAkYRGkxFZQ_DlDmRJ6U2hQkj7GPpxK4zWpbxnlUaJUZ4R1Jzk8ck4xsXZCQf8ZUhw8iwNF_jFrO4TXRFYtfCO4poe4OwCHs55rSxpk-RdBRhLsvU5CxCk5oe99jW-wc-_UHI?type=png)

### Componentes:
- **Carla**: Usuario final (menor de edad)
- **Padres de Carla**: Verificadores de edad
- **Red Social**: Servicio que requiere verificación de edad
- **Blockchain**: Almacena los DIDs y referencias a documentos
- **IPFS**: Almacena documentos DID y credenciales verificables

## Flujo de la Demo

### 1. Creación de Identidades Digitales (DIDs)

**Carla y sus padres crean sus identidades digitales:**
- Carla genera su DID
- Los padres de Carla generan sus DIDs
- La Red Social ya tiene su propio DID como institución

### 2. Verificación de Edad de Carla

**Los padres certifican la edad de Carla:**
- Los padres registran a Carla vinculando su DID
- Los padres emiten una Credencial Verificable (VC) certificando la edad de Carla
- La credencial se firma con la clave privada de los padres

### 3. Registro en la Red Social

**Carla se registra en la Red Social:**
- Carla inicia el proceso de registro en la Red Social
- La Red Social solicita verificación de edad
- Carla presenta la VC emitida por sus padres
- La Red Social verifica la autenticidad de la credencial

### 4. Acceso a la Red Social

**Carla accede a la plataforma:**
- La Red Social crea una cuenta para Carla con restricciones adecuadas según su edad
- Carla puede autenticarse en la plataforma usando su DID

## Endpoints API

### Gestión de DIDs

#### 1. Crear un nuevo DID

```
POST /did/create
```

**Respuesta:**
```json
{
  "success": true,
  "did": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "message": "DID created successfully"
}
```

#### 2. Registrar un DID con documento

```
POST /did/register
```

**Petición:**
```json
{
  "didId": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "documentHash": "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "DID did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10 registered successfully"
}
```

#### 3. Verificar información del DID

```
GET /did/:didId
```

**Respuesta:**
```json
{
  "controller": "0x5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "documentHash": "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o",
  "lastUpdated": 1716155126
}
```

### Gestión de Credenciales Verificables (VC)

#### 4. Emisión de Credencial de Edad (Padres → Carla)

```
POST /credentials/issue
```

**Petición:**
```json
{
  "issuerDid": "did:ethr:codemtn:8a37b5dc91a2588a4ef31c3c3902d0c86b20cbf9",
  "subjectDid": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "credentialType": "AgeVerification",
  "claims": {
    "age": 15,
    "birthDate": "2010-04-15",
    "parentalConsent": true
  },
  "expirationDate": "2026-04-15T00:00:00Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "credentialId": "vc:ethr:codemtn:age:1234",
  "message": "Credential issued successfully"
}
```

#### 5. Verificación de Credencial (Carla → Red Social)

```
POST /credentials/verify
```

**Petición:**
```json
{
  "credentialId": "vc:ethr:codemtn:age:1234",
  "verifierDid": "did:ethr:codemtn:7c8af6bd0eb3d3ded3b24aaad8a5238fde2f9983",
  "presentationContext": "social_network_registration"
}
```

**Respuesta:**
```json
{
  "success": true,
  "verified": true,
  "issuer": "did:ethr:codemtn:8a37b5dc91a2588a4ef31c3c3902d0c86b20cbf9",
  "subject": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "claims": {
    "age": 15,
    "birthDate": "2010-04-15",
    "parentalConsent": true
  },
  "validUntil": "2026-04-15T00:00:00Z"
}
```

### Registro y Autenticación en la Red Social

#### 6. Registro con Identidad Verificada

```
POST /social/register
```

**Petición:**
```json
{
  "userDid": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "username": "carla_teen",
  "ageCredentialId": "vc:ethr:codemtn:age:1234"
}
```

**Respuesta:**
```json
{
  "success": true,
  "userId": "social123456",
  "message": "Usuario registrado con verificación de edad completada",
  "restrictions": {
    "ageRestricted": true,
    "parentalApproval": true
  }
}
```

#### 7. Autenticación con DID

```
POST /social/login
```

**Petición:**
```json
{
  "userDid": "did:ethr:codemtn:5b02a38d33ead5149f5a36be33e28f13ceff3d10",
  "challenge": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "signature": "0x4d2afaf0284..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "profile": {
    "username": "carla_teen",
    "verifiedAge": 15,
    "restrictions": {
      "ageRestricted": true,
      "parentalApproval": true
    }
  }
}
```

## Implementación Actual

Actualmente, nuestro sistema tiene implementados los siguientes endpoints:

- [x] `POST /did/create` - Crear un nuevo DID
- [x] `POST /did/register` - Registrar un DID con documento
- [x] `PATCH /did/update-document` - Actualizar documento DID
- [x] `PATCH /did/change-controller` - Cambiar controlador del DID
- [x] `PATCH /did/deactivate` - Desactivar un DID
- [x] `GET /did/:didId` - Obtener información del DID
- [x] `GET /did/:didId/active` - Verificar si un DID está activo

## Siguientes Pasos para Completar la Demo

1. Implementar los endpoints para la gestión de credenciales verificables
2. Implementar los endpoints para la red social
3. Crear una interfaz de usuario para demostrar el flujo completo

## Beneficios del Enfoque DID/VC

- **Privacidad**: Carla comparte solo la información necesaria
- **Control**: Los padres y Carla mantienen control sobre sus datos
- **Reutilización**: La credencial verificada puede usarse en otros servicios
- **Auditabilidad**: Todas las verificaciones quedan registradas en blockchain
- **Sin intermediarios**: No se requiere una autoridad central de verificación
