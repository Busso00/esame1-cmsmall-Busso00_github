cd server
npm install
npm audit fix --force

cd ../client
npm install
npm audit fix --force
npm run build