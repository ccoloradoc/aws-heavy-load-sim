sudo su
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install v10.16.0
node -e "console.log('Running Node.js ' + process.version)"
yum --skip-broken -t -y install git pm2
git clone https://github.com/ccoloradoc/aws-heavy-load-sim.git
cd aws-heavy-load-sim
mkdir public/content
npm install
npm install pm2@latest -g
pm2 start ecosystem.config.js --env production