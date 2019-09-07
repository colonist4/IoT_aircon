module.exports = {
  apps : [{
    name      : 'IoT Server',
    script    : 'index.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    },
    watch:false,
    max_restart:10,
    max_memory_restart:'200M',
    out_file:'/var/www/IoT/logs/out.log',
    error_file:'/var/www/IoT/logs/err.log'

  }]
};
