
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

config.maxWorkers = 2;

config.resetCache = true;

module.exports = config;
