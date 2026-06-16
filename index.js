import { UAParser } from 'ua-parser-js';

const APPLE_APP_SITE_ASSOCIATION = {
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "922K75PNN5.com.billu",
                "paths": ["/customerapp", "/customerapp/*"]
            }
        ]
    },
    "webcredentials": {
        "apps": [
            "922K75PNN5.com.billu"
        ]
    }
};

const ASSET_LINKS = [
    {
        "relation": [
            "delegate_permission/common.handle_all_urls"
        ],
        "target": {
            "namespace": "android_app",
            "package_name": "com.billu.care",
            "sha256_cert_fingerprints": [
                "D0:9A:E3:89:50:E9:01:85:6B:BF:40:39:65:35:D6:7E:C2:52:2D:95:CE:A3:38:6C:30:69:07:C1:F9:47:E7:D2",
                "22:56:61:87:FC:BA:C2:2C:52:C6:5F:6A:73:3F:DB:E3:5A:10:00:01:5C:ED:A5:D7:98:FE:B6:1B:F4:21:44:05"
            ]
        }
    }
];

export default {
    async fetch(request) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const userAgent = request.headers.get('user-agent') || '';

        // Basic Route
        if (pathname === '/') {
            return new Response('Hello World!');
        }

        // Serve .well-known/apple-app-site-association
        if (pathname === '/.well-known/apple-app-site-association') {
            return new Response(JSON.stringify(APPLE_APP_SITE_ASSOCIATION), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Serve .well-known/assetlinks.json
        if (pathname === '/.well-known/assetlinks.json') {
            return new Response(JSON.stringify(ASSET_LINKS), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        // Route: /customerapp/invitedby/:promocode
        const referralMatch = pathname.match(/^\/customerapp\/invitedby\/([^/]+)$/);
        if (referralMatch) {
            const promocode = referralMatch[1];

            let redirectUrl = 'https://play.google.com/store/apps/details?id=com.billu.care&referrer=' + promocode;
            if (result.os.name === 'iOS') {
                redirectUrl = `https://apps.apple.com/in/app/billu-customer/id1559235086?referral=${promocode}`;
            }

            return new Response(`
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
                    
                    setTimeout(() => {
                        window.location.href = "${redirectUrl}";
                    }, 300);
                }
            </script>
        </body>
        </html>
    `, { headers: { 'Content-Type': 'text/html' } });
        }

        // Route: /customerapp/productId/:productId
        const productMatch = pathname.match(/^\/customerapp\/productId\/([^/]+)$/);
        if (productMatch) {
            const productId = productMatch[1];

            let playStoreUrl = `https://play.google.com/store/apps/details?id=com.billu.care&productId=${productId}`;
            const appStoreUrl = 'https://apps.apple.com/in/app/billu-customer/id1559235086';

            if (result.os.name === 'iOS') {
                return Response.redirect(appStoreUrl, 302);
            }
            return Response.redirect(playStoreUrl, 302);
        }

        return new Response('Not Found', { status: 404 });
    }
};
