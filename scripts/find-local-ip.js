#!/usr/bin/env node

const { networkInterfaces } = require('os');

function getLocalIpAddress() {
  const nets = networkInterfaces();
  const results = {};

  // Create a list of non-internal IP addresses
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over internal (non-public) addresses
      if (!net.internal && net.family === 'IPv4') {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  console.log('\n=== Local Network Addresses ===');
  console.log('Use one of these addresses to access your app from other devices:');
  
  let found = false;
  for (const [device, addresses] of Object.entries(results)) {
    if (addresses.length > 0) {
      found = true;
      console.log(`\n${device}:`);
      addresses.forEach(addr => {
        console.log(`  http://${addr}:3000`);
      });
    }
  }

  if (!found) {
    console.log('\nNo network interfaces found. Are you connected to a network?');
  }
  
  console.log('\nOr use:');
  console.log('  http://localhost:3000');
  console.log('===========================\n');
}

getLocalIpAddress(); 