module.exports = {
  apps: [
    {
      name: 'med-expiry-checker',
      script: 'npm',
      args: 'start',
      cwd: '/workspace/med_application',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Auto-restart on failure
      autorestart: true,
      // Restart delay
      restart_delay: 3000,
      // Max memory before restart
      max_memory_restart: '1G',
      // Log files
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Don't minify logs
      min_uptime: '10s',
      // Max restarts in 60 seconds
      max_restarts: 5,
      // Don't restart if crashing too fast
      exp_backoff_restart_delay: 100,
      // Watch for changes (disable in production for stability)
      watch: false,
      // Ignore files for watch
      ignore_watch: ['node_modules', 'logs', '.next', '*.log'],
      // Merge logs
      merge_logs: true,
      // Kill timeout
      kill_timeout: 5000,
      // Listen timeout
      listen_timeout: 10000,
      // Shutdown with message
      shutdown_with_message: true,
      // Wait for ready signal
      wait_ready: false
    }
  ]
};