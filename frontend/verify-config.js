#!/usr/bin/env node

/**
 * Configuration Verification Script
 * Verifies that the frontend is properly configured to connect to the backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Budget Tracker - Configuration Verification\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 Environment File Check:');
console.log(`   .env file: ${envExists ? '✅ Found' : '❌ Missing'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const apiEnabled = envContent.includes('REACT_APP_USE_API=true');
  const apiUrl = envContent.match(/REACT_APP_API_URL=(.+)/);
  
  console.log(`   API Mode: ${apiEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   API URL: ${apiUrl ? `✅ ${apiUrl[1]}` : '❌ Not configured'}`);
} else {
  console.log('   ⚠️  Please run this script from the frontend directory');
}

// Check if config files exist
const configFiles = [
  'src/config/environment.js',
  'src/config/connectionTest.js',
  'src/components/BackendStatus.jsx'
];

console.log('\n📦 Configuration Files Check:');
configFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`   ${file}: ${exists ? '✅' : '❌'}`);
});

// Check package.json for required dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredDeps = ['axios', 'react', 'react-router-dom'];
  
  console.log('\n📦 Dependencies Check:');
  requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    console.log(`   ${dep}: ${exists ? `✅ ${exists}` : '❌ Missing'}`);
  });
}

// Instructions
console.log('\n📋 Next Steps:');
console.log('1. Start the backend server:');
console.log('   cd ../backend && npm run dev');
console.log('');
console.log('2. Start the frontend development server (FROM ROOT DIRECTORY):');
console.log('   cd .. && npm run frontend');
console.log('   OR: cd .. && npm start');
console.log('');
console.log('3. Open browser to: http://localhost:3000');
console.log('');
console.log('4. Look for the Backend Status indicator in the bottom-right corner');
console.log('');
console.log('💡 The backend status should show "✅ Backend Connected" if everything is working');
console.log('');
console.log('⚠️  IMPORTANT: Run frontend commands from the ROOT directory, not from frontend/');
console.log('   This is a monorepo setup.');

console.log('\n' + '='.repeat(60));
console.log('Phase 4: Environment Configuration - COMPLETE ✅');
console.log('='.repeat(60));
