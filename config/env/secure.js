'use strict';

module.exports = {
  port: 8443,
  passphrase: process.env.SSL_PASSWORD || 'password',
  db: {
    pg: {
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT ||  5432,
      database: process.env.PG_DB || 'hanx',
      user: process.env.PG_USER || 'hanx',
      password: process.env.PG_PASSWORD || 'password'
    },
    mongodb: {
      host: process.env.MONGO_HOST || '127.0.0.1',
      port: process.env.MONGO_PORT ||  27017,
      user: process.env.MONGO_USER || '',
      password: process.env.MONGO_PASSWORD || ''
    }
  },
  log: {
    enabled: true,
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //console: '*'
      stream: 'access.log'
    }
  },
  assets: {
    lib: {
      css: [
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css'
      ],
      js: [
        'public/lib/angular/angular.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-ui-utils/ui-utils.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js'
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: 'https://localhost:443/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: 'https://localhost:443/auth/github/callback'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  }
};
