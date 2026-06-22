// index.js
const express = require('express');
const cors = require('cors')
const app = express();
const UAParser = require('ua-parser-js');
const path = require('path');
const PORT = 3005;

app.use(cors())
app.use(express.json());


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'allow',
}));



// app.get('/.well-known/apple-app-site-association', (req, res) => {
//     // Set proper headers
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     const aasaConfig = {
//         "applinks": {
//           "apps": [],
//           "details": [
//             {
//               "appID": "922K75PNN5.com.billu",
//               "paths": ["/customerapp", "/customerapp/*"]
//             }
//           ]
//         },
//         "webcredentials": {
//           "apps": [
//             "922K75PNN5.com.billu"
//           ]
//         }
//       };

//     res.json(aasaConfig);
// });




// Basic Route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.get("/customerapp/invitedby/:promocode", (req, res) => {
//     const userAgent = req.headers['user-agent'];
//     const parser = new UAParser(userAgent);
//     const result = parser.getResult();
//     let promocode = req.params.promocode;
//     console.log("Request from : ", result.os);
//     console.log("Request Path : ", promocode);

//     // Base URLs
//     let playStoreUrl = 'https://play.google.com/store/apps/details?id=com.billu.care';
//     const appStoreUrl = `https://apps.apple.com/in/app/billu-customer/id1559235086?referral=${promocode}`;

//     // playStoreUrl += `&referral=${promocode}`;
//     playStoreUrl += `&referrer=${promocode}`;

    

//     // Redirect based on OS
//     if (result.os.name === 'Android' || result.os.name === 'Linux') {
//         res.redirect(playStoreUrl);
//     } else if (result.os.name === 'iOS') {
//         res.redirect(appStoreUrl);
//     }
// });

app.get("/customerapp/invitedby/:promocode", (req, res) => {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const promocode = req.params.promocode;

    let redirectUrl = 'https://play.google.com/store/apps/details?id=com.billu.care&referrer=' + promocode;
    if (result.os.name === 'iOS') {
        redirectUrl = `https://apps.apple.com/in/app/billu-customer/id1559235086?referral=${promocode}`;
    }


    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Billu Care</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    text-align: center;
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .btn {
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 18px;
                    margin: 20px 0;
                    transition: all 0.3s;
                }
                .btn:hover {
                    background: #ff5252;
                    transform: translateY(-2px);
                }
                .code {
                    background: rgba(255,255,255,0.2);
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-family: monospace;
                    font-size: 14px;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🎉 Give One & Get One</h2>
                <p>Click to copy referral code and open app</p>
                <div class="code">BILLU_REFERRAL_CODE=${promocode}</div>
                <button class="btn" onclick="copyAndRedirect()">Copy Code & Open App</button>
            </div>

            <script>
                function copyAndRedirect() {
                    const promocode = "BILLU_REFERRAL_CODE=${promocode}";
                    
                    // Copy to clipboard
                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(promocode);
                    } else {
                        const input = document.createElement('input');
                        input.value = promocode;
                        document.body.appendChild(input);
                        input.select();
                        document.execCommand('copy');
                        document.body.removeChild(input);
                    }
                    
                    // Small delay then redirect
                    setTimeout(() => {
                        window.location.href = "${redirectUrl}";
                    }, 300);
                }
            </script>
        </body>
        </html>
    `);   
});





app.get("/customerapp/productId/:productId", (req, res) => {
    const userAgent = req.headers['user-agent'];
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    let productId = req.params.productId

    console.log("Request from : ", result.os);
    console.log("Request Path : ", req.path);

    // Base URLs
    let playStoreUrl = 'https://play.google.com/store/apps/details?id=com.billu.care';
    const appStoreUrl = 'https://apps.apple.com/in/app/billu-customer/id1559235086';

    playStoreUrl += `&productId=${productId}`;

    // Redirect based on OS
    if (result.os.name === 'Android' || result.os.name === 'Linux') {
        res.redirect(playStoreUrl);
    } else if (result.os.name === 'iOS') {
        res.redirect(appStoreUrl);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
