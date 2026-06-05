const fs = require('fs');
const path = require('path');

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '.env');
  const env = {};

  if (!fs.existsSync(envPath)) {
    return env;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    const index = trimmed.indexOf('=');
    if (index === -1) {
      return;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    env[key] = value;
  });

  return env;
}

const appJson = require('./app.json');
const env = loadDotEnv();

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...((appJson.expo && appJson.expo.extra) || {}),
      KEY_APP_PROD: env.KEY_APP_PROD || process.env.KEY_APP_PROD,
      KEY_APP_QA: env.KEY_APP_QA || process.env.KEY_APP_QA,
      VERSION_APP: env.VERSION_APP || process.env.VERSION_APP,
      BASE_QA_MEITRUCK: env.BASE_QA_MEITRUCK || process.env.BASE_QA_MEITRUCK,
      BASE_QA_CONTADO: env.BASE_QA_CONTADO || process.env.BASE_QA_CONTADO,
      BASE_PRD_MEITRUCK: env.BASE_PRD_MEITRUCK || process.env.BASE_PRD_MEITRUCK,
      BASE_PROD_CONTADO: env.BASE_QA_CONTADO || process.env.BASE_PROD_CONTADO,
    },
     orientation: 'portrait'
  },
};
