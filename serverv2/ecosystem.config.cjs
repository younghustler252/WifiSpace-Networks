module.exports = {
  apps: [
    {
      name: "wifispace-api",
      script: "./src/server.js",
      cwd: "/var/www/WifiSpace-Networks/serverv2",
      interpreter: "node",

      instances: 1,
      exec_mode: "fork",
      watch: false,

      env_production: {
        NODE_ENV: "production",
      },

      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,

      error_file: "/home/youngtech/.pm2/logs/wifispace-api-error.log",
      out_file: "/home/youngtech/.pm2/logs/wifispace-api-out.log",
      merge_logs: true,

      time: true,
    },

    {
      name: "wifispace-worker",
      script: "./src/worker.js",
      cwd: "/var/www/WifiSpace-Networks/serverv2",
      interpreter: "node",

      instances: 1,
      exec_mode: "fork",
      watch: false,

      env_production: {
        NODE_ENV: "production",
      },

      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,

      error_file: "/home/youngtech/.pm2/logs/wifispace-worker-error.log",
      out_file: "/home/youngtech/.pm2/logs/wifispace-worker-out.log",
      merge_logs: true,

      time: true,
    },
  ],
};