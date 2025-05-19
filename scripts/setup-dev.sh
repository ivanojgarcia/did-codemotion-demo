#!/bin/bash

# Función para manejar errores
handle_error() {
  echo "Error: $1"
  exit 1
}

# Configurar variables de entorno de desarrollo
echo "Configurando ambiente de desarrollo..."

# Iniciar nodo Hardhat local en segundo plano
echo "Iniciando nodo local de Hardhat..."
npx hardhat node > hardhat-node.log 2>&1 &
HARDHAT_PID=$!

# Esperar a que el nodo esté listo
echo "Esperando a que el nodo esté listo..."
sleep 5

# Verificar si el nodo está activo
if ! ps -p $HARDHAT_PID > /dev/null; then
  handle_error "No se pudo iniciar el nodo Hardhat"
fi

# Compilar contratos
echo "Compilando contratos..."
npx hardhat compile || handle_error "Error compilando contratos"

# Desplegar contrato en red local
echo "Desplegando contrato DIDRegistry..."
npx hardhat run scripts/deploy.ts --network localhost || handle_error "Error desplegando contratos"

# Obtener la dirección del contrato desplegado y guardarla en .env
CONTRACT_ADDRESS=$(grep "DIDRegistry deployed to:" hardhat-node.log | tail -1 | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
  handle_error "No se pudo obtener la dirección del contrato"
fi

echo "Contrato desplegado en: $CONTRACT_ADDRESS"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
  echo "Creando archivo .env..."
  cat > .env << EOF
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
DID_REGISTRY_ADDRESS=$CONTRACT_ADDRESS
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# API Configuration
PORT=3000
EOF
else
  # Actualizamos solo la dirección del contrato en .env
  sed -i '' "s/DID_REGISTRY_ADDRESS=.*/DID_REGISTRY_ADDRESS=$CONTRACT_ADDRESS/" .env
fi

echo "Ambiente configurado correctamente"
echo "Para iniciar la API: npm run start:dev"

# Presentar opciones
echo ""
echo "¿Qué deseas hacer ahora?"
echo "1) Iniciar API"
echo "2) Finalizar"

read -p "Selecciona una opción (1-2): " OPTION

case $OPTION in
  1)
    echo "Iniciando API..."
    npm run start:dev
    ;;
  2)
    echo "Configuración completada."
    echo "El nodo Hardhat sigue ejecutándose en segundo plano (PID: $HARDHAT_PID)"
    echo "Para detenerlo: kill $HARDHAT_PID"
    ;;
  *)
    echo "Opción no válida"
    ;;
esac 