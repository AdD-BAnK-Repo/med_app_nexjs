module.exports = {
  apps: [
    {
      name: 'medapp',
      script: 'node_modules/.bin/next',
      args: 'dev',
      cwd: '/home/aitest/med_app_nexjs',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: '1G',
      log_file: './logs/pm2-out.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      kill_timeout: 10000,
      wait_ready: false
    }
  ]
};
