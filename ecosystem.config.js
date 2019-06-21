module.exports = {
  apps : [{
    name: 'server',
    script: 'server.js',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      FILE_SIZE: 1800000000
    },
    env_production: {
      NODE_ENV: 'production',
      FILE_SIZE: 1400000000
    }
  }]
};
