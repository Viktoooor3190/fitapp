/**
 * Test Subdomains Script
 * 
 * This script helps test subdomain functionality on localhost.
 * It opens browser tabs for different coach subdomains.
 */

import { exec } from 'child_process';
import { createInterface } from 'readline';
import { promises as fs } from 'fs';
import { platform } from 'os';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Subdomain Testing Tool ===');
console.log('This script will help you test subdomain functionality on localhost.');

// Define hosts file path based on platform
const hostsFilePath = platform() === 'win32' 
  ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
  : '/etc/hosts';

// Required host entries for testing
const requiredHosts = [
  '127.0.0.1    localhost',
  '127.0.0.1    coach1.localhost',
  '127.0.0.1    coach2.localhost'
];

// Check if hosts file contains the required entries
const checkHostsFile = async () => {
  try {
    console.log(`\nChecking hosts file at: ${hostsFilePath}`);
    
    // Try to read the hosts file
    let hostsContent;
    try {
      hostsContent = await fs.readFile(hostsFilePath, 'utf8');
    } catch (error) {
      console.log('\n⚠️  Could not read hosts file. You may need to run this script with admin privileges.');
      return false;
    }
    
    // Check for each required host entry
    const missingEntries = [];
    for (const entry of requiredHosts) {
      // Extract just the domain part for flexible matching (ignoring whitespace differences)
      const domain = entry.split(/\s+/)[1];
      const pattern = new RegExp(`127\\.0\\.0\\.1\\s+${domain}`);
      
      if (!pattern.test(hostsContent)) {
        missingEntries.push(entry);
      }
    }
    
    if (missingEntries.length === 0) {
      console.log('✅ Hosts file is correctly configured for subdomain testing.');
      return true;
    } else {
      console.log('\n⚠️  The following entries are missing from your hosts file:');
      missingEntries.forEach(entry => console.log(`   ${entry}`));
      
      console.log('\nYou need to add these entries to your hosts file to test subdomains locally.');
      console.log(`Hosts file location: ${hostsFilePath}`);
      
      if (platform() === 'win32') {
        console.log('\nOn Windows, you need to:');
        console.log('1. Open Notepad as Administrator');
        console.log('2. Open the file: C:\\Windows\\System32\\drivers\\etc\\hosts');
        console.log('3. Add the missing entries');
        console.log('4. Save the file and restart your browser');
      } else {
        console.log('\nOn Mac/Linux, you need to:');
        console.log('1. Open Terminal');
        console.log('2. Run: sudo nano /etc/hosts');
        console.log('3. Add the missing entries');
        console.log('4. Save (Ctrl+O, Enter) and exit (Ctrl+X)');
        console.log('5. Restart your browser');
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error checking hosts file:', error);
    return false;
  }
};

const openUrl = (url) => {
  const command = platform() === 'win32' 
    ? `start ${url}` 
    : platform() === 'darwin' 
      ? `open ${url}` 
      : `xdg-open ${url}`;
  
  exec(command, (error) => {
    if (error) {
      console.error(`Error opening URL: ${error.message}`);
    } else {
      console.log(`Opened: ${url}`);
    }
  });
};

const testOptions = [
  { name: 'Open main site (no subdomain)', url: 'http://localhost:3000' },
  { name: 'Open Coach 1 subdomain', url: 'http://coach1.localhost:3000' },
  { name: 'Open Coach 2 subdomain', url: 'http://coach2.localhost:3000' },
  { name: 'Open all test environments', urls: [
    'http://localhost:3000',
    'http://coach1.localhost:3000',
    'http://coach2.localhost:3000'
  ]},
  { name: 'Exit' }
];

const promptUser = () => {
  console.log('\nSelect an option:');
  testOptions.forEach((option, index) => {
    console.log(`${index + 1}. ${option.name}`);
  });

  rl.question('\nEnter option number: ', (answer) => {
    const option = parseInt(answer, 10);
    
    if (isNaN(option) || option < 1 || option > testOptions.length) {
      console.log('Invalid option. Please try again.');
      promptUser();
      return;
    }
    
    const selectedOption = testOptions[option - 1];
    
    if (selectedOption.name === 'Exit') {
      console.log('Exiting subdomain testing tool. Goodbye!');
      rl.close();
      return;
    }
    
    if (selectedOption.url) {
      openUrl(selectedOption.url);
    } else if (selectedOption.urls) {
      selectedOption.urls.forEach(url => openUrl(url));
    }
    
    setTimeout(promptUser, 1000);
  });
};

// Main execution
(async () => {
  const hostsConfigured = await checkHostsFile();
  
  if (!hostsConfigured) {
    rl.question('\nDo you want to continue anyway? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        promptUser();
      } else {
        console.log('Please configure your hosts file and try again. Exiting...');
        rl.close();
      }
    });
  } else {
    promptUser();
  }
})(); 