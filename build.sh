cd server
npm install
npm audit fix --force

cd ../client
npm install
npm audit fix --force
npm run build

sqlite3 ./server/CMS_DB.sqlite < ./server/population_script.sql
