// The filesystem editing proxy must only listen on this computer.
process.env.BIND_HOST = '127.0.0.1';
await import('decap-server/dist/index.js');
