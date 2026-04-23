Quick setup — if you’ve done this kind of thing before
or	
https://github.com/sebbxs999/PersonalRepository.git
Get started by creating a new file or uploading an existing file. We recommend every repository include a README, LICENSE, and .gitignore.

…or create a new repository on the command line
echo "# PersonalRepository" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/equiposeis84/RematesPaisa.git
git push -u origin main
…or push an existing repository from the command line
git remote add origin https://github.com/equiposeis84/RematesPaisa.git
git branch -M main
git push -u origin main

INICIAR SERVIDORES:
cd backend
npm i --legacy-peer-deps
node server.js

cd frontend
npm install
npm run dev