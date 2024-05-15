const { exec } = require('child_process');
const open = require('open');

// Change directory to your Express.js project
const projectDirectory = 'C:/Users/dell/Desktop/cashier-main'; // Change this to your project directory
process.chdir(projectDirectory);

// Start the Express server
const serverProcess = exec('npm start');

// Open the browser after the server has started
serverProcess.stdout.on('data', (data) => {
    if (data.includes('Server listening on port')) {
        open('http://localhost:5000');
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});
