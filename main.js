import FormData from 'form-data';
import axios from 'axios';
import readline from 'readline';
import log from './utils/logger.js';
import {
saveToFile,
newAgent
} from './utils/helper.js';

// Function to prompt user input
function promptUser(promptText) {
return new Promise((resolve) => {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
});

 
    rl.question(promptText, (input) => {
        rl.close();
        resolve(input.trim());
    });
});
 

}

// Function to generate a secure password
function generatePassword(length = 16) {
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%!';
return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}

// Function to send OTP
async function sendOtp(email, proxy) {
const agent = newAgent(proxy);
const form = new FormData();
form.append('email', email);
form.append('ci_csrf_token', '');

 
const headers = {
    ...form.getHeaders(),
};

const response = await axios.post('https://arichain.io/api/Email/send_valid_email', form, {
    headers: headers,
    httpsAgent: agent,
});
log.info('Sending OTP Result:', response.data);
return response.data;
 

}

// Function to verify OTP
async function verifyOtp(email, otp, proxy) {
const agent = newAgent(proxy);
const form = new FormData();
form.append('email', email);
form.append('code', otp);
form.append('ci_csrf_token', '');

 
const headers = {
    ...form.getHeaders(),
};

const response = await axios.post('https://arichain.io/api/Email/check_valid_code', form, {
    headers: headers,
    httpsAgent: agent,
});
log.info('Verification Result:', response.data);

if (response.data.status === 'success') {
    return otp; // Return the valid OTP
} else {
    throw new Error('OTP verification failed');
}
 

}

// Function to register account
async function register(email, pw, valid_code, invite_code, proxy) {
const agent = newAgent(proxy);
const form = new FormData();
form.append('email', email);
form.append('pw', pw);
form.append('pw_re', pw);
form.append('valid_code', valid_code);
form.append('invite_code', invite_code);
form.append('ci_csrf_token', '');

 
const headers = {
    ...form.getHeaders(),
};

const response = await axios.post('https://arichain.io/api/Account/signup', form, {
    headers: headers,
    httpsAgent: agent,
});
log.info('Register Result:', response.data);
return response.data;
 

}

// Main function
async function main() {
// Display author information
console.log( ================================================ 🎭 Author: Falcon Telegram: t.me/anharhussan1 Github: https://github.com/falconthehunter ================================================ );

 
const inviteCode = await promptUser('Enter your invite code: ');
log.info(`Invite code: ${inviteCode}`);

while (true) {
    try {
        const email = await promptUser('Enter your email: ');
        const proxy = null; // Add proxy handling if required
        const password = generatePassword();

        // Send OTP
        const otpResponse = await sendOtp(email, proxy);
        log.info('OTP sent successfully.');

        // Get OTP from user
        const otp = await promptUser('Enter the OTP sent to your email: ');

        // Verify OTP
        const validCode = await verifyOtp(email, otp, proxy);
        log.info('OTP verified successfully.');

        // Register the account
        const registrationResponse = await register(email, password, validCode, inviteCode, proxy);
        log.info(`Successfully registered: ${email}`);

        // Save the account to a file (email and password)
        const accountData = `${email}|${password}`;
        await saveToFile('accounts.txt', `${accountData}\n`);
        log.info(`Account saved: ${accountData}`);
    } catch (error) {
        log.error('Error:', error.message);
    }

    log.info('Restarting immediately...');
}
 

}

main();