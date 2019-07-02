#!/bin/sh
mkdir /home/ec2-user/log
echo "Startup" >> /home/ec2-user/log/test.log
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# This loads nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  
# install node 
nvm install v10.16.0
node -e "console.log('Running Node.js ' + process.version)"
# install git
yum --skip-broken -t -y install git
# clone project
cd /home/ec2-user
git clone https://github.com/ccoloradoc/aws-heavy-load-sim.git
cd aws-heavy-load-sim
mkdir public/content
# install modules
npm install
# install pm2 
npm install pm2@latest -g
pm2 reload ecosystem.config.js --env production
pm2 startup
pm2 save
# Log install paths
whereis git
whereis node
whereis nvm
# add properties to bash file for sudo
echo "export PATH=$PATH:/.nvm/versions/node/v10.16.0/bin" >> ~/.bashrc
echo "export NVM_DIR=\"$HOME/.nvm\"" >> ~/.bashrc
echo "[ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\""  >> ~/.bashrc
echo "export PM2_HOME=/etc/.pm2" >> ~/.bashrc
