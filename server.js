const server = require("./src/server");

if (require.main === module) {
  server.start().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = server;
