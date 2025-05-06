document.getElementById('sendBtn').addEventListener('click', async function () {
    const header = document.querySelector('body h1');
    const inputContainer = document.getElementById('inputContainer');
    const responseContainer = document.getElementById('responseContainer');
    const inputField = inputContainer.querySelector('input');
    const responseDiv = responseContainer.querySelector('.response');

    const userInput = inputField.value.trim();
    if (!userInput) return;

    // Hide UI
    inputContainer.classList.add('hidden');
    header.classList.add('hidden');
    responseContainer.classList.add('visible');

    // Show loading while waiting
    responseDiv.innerHTML = '<p><em>Thinking...</em></p>';

    try {
        const res = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userInput }),
        });

        const data = await res.json();

        // Show response and add a "Ask another" button
        responseDiv.innerHTML = `
            <p>${data.answer}</p>
            <button id="askAgainBtn" class="ask-again-btn">Ask another question</button>
        `;

        // Set up listener for the new button
        document.getElementById('askAgainBtn').addEventListener('click', () => {
            responseContainer.classList.remove('visible');
            inputContainer.classList.remove('hidden');
            header.classList.remove('hidden');
            inputField.value = '';
        });

    } catch (err) {
        responseDiv.innerHTML = '<p><strong>Error:</strong> Failed to fetch response.</p>';
        console.error(err);
    }
});