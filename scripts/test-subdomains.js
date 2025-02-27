/**
 * Test Subdomains Script
 * 
 * This script helps test subdomain functionality on localhost.
 * It opens browser tabs for different coach subdomains.
 */

import { exec } from 'child_process';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Subdomain Testing Tool ===');
console.log('This script will help you test subdomain functionality on localhost.');
console.log('Make sure you have added the following to your hosts file:');
console.log('127.0.0.1    coach1.localhost');
console.log('127.0.0.1    coach2.localhost');
console.log('\nAnd that your Vite dev server is running on port 3000.');

rl.question('\nDo you want to open test subdomains in your browser? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    const platform = process.platform;
    let command;
    
    // Open coach1.localhost:3000
    if (platform === 'win32') {
      command = 'start http://coach1.localhost:3000';
    } else if (platform === 'darwin') {
      command = 'open http://coach1.localhost:3000';
    } else {
      command = 'xdg-open http://coach1.localhost:3000';
    }
    
    exec(command, (error) => {
      if (error) {
        console.error(`Error opening coach1.localhost: ${error}`);
      } else {
        console.log('Opened coach1.localhost:3000 in browser');
      }
      
      // Open coach2.localhost:3000 after a short delay
      setTimeout(() => {
        if (platform === 'win32') {
          command = 'start http://coach2.localhost:3000';
        } else if (platform === 'darwin') {
          command = 'open http://coach2.localhost:3000';
        } else {
          command = 'xdg-open http://coach2.localhost:3000';
        }
        
        exec(command, (error) => {
          if (error) {
            console.error(`Error opening coach2.localhost: ${error}`);
          } else {
            console.log('Opened coach2.localhost:3000 in browser');
          }
          rl.close();
        });
      }, 1000);
    });
  } else {
    console.log('Exiting without opening browser tabs.');
    rl.close();
  }
}); 