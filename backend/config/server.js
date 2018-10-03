const customWrapper = require('custom-harness');

module.exports = {
  PORT: process.env.APP_PORT || '1337',
  harness: {
    customWrapper
  }
};
