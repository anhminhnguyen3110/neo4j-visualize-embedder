const generateTokenBtn = document.getElementById('generateTokenBtn');
const tokenResult = document.getElementById('tokenResult');
const tokenValue = document.getElementById('tokenValue');
const copyTokenBtn = document.getElementById('copyTokenBtn');
const tokenExpiry = document.getElementById('tokenExpiry');

const apiTokenInput = document.getElementById('apiToken');
const cypherQueryInput = document.getElementById('cypherQuery');
const expiresInDaysInput = document.getElementById('expiresInDays');
const createEmbedBtn = document.getElementById('createEmbedBtn');
const embedResult = document.getElementById('embedResult');
const embedUrl = document.getElementById('embedUrl');
const embedToken = document.getElementById('embedToken');
const embedExpiry = document.getElementById('embedExpiry');
const copyEmbedBtn = document.getElementById('copyEmbedBtn');
const openEmbedBtn = document.getElementById('openEmbedBtn');

const viewUrl = document.getElementById('viewUrl');
const loadVisualizationBtn = document.getElementById('loadVisualizationBtn');
const visualizationPreview = document.getElementById('visualizationPreview');
const embedFrame = document.getElementById('embedFrame');

const logs = document.getElementById('logs');
const clearLogsBtn = document.getElementById('clearLogsBtn');

// State
let currentToken = null;
let currentEmbedUrl = null;

// Logging function
function logRequest(method, url, status, requestBody, responseBody) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const statusClass = status >= 200 && status < 300 ? 'success' : 'error';
    
    let html = `
        <div class="log-timestamp">${timestamp}</div>
        <div>
            <span class="log-method ${method}">${method}</span>
            <span class="log-url">${url}</span>
            <span class="log-status ${statusClass}">${status}</span>
        </div>
    `;
    
    if (requestBody) {
        html += `
            <div class="log-body">
                <strong>Request:</strong>
                <pre>${JSON.stringify(requestBody, null, 2)}</pre>
            </div>
        `;
    }
    
    if (responseBody) {
        html += `
            <div class="log-body">
                <strong>Response:</strong>
                <pre>${JSON.stringify(responseBody, null, 2)}</pre>
            </div>
        `;
    }
    
    logEntry.innerHTML = html;
    logs.insertBefore(logEntry, logs.firstChild);
}

// Section 1: Generate Token
generateTokenBtn.addEventListener('click', async () => {
    try {
        generateTokenBtn.disabled = true;
        generateTokenBtn.textContent = 'Generating...';
        
        const response = await fetch(API_ENDPOINTS.GENERATE_TOKEN, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({}),
        });
        
        const data = await response.json();
        
        logRequest('POST', API_ENDPOINTS.GENERATE_TOKEN, response.status, {}, data);
        
        if (response.ok && data.success) {
            currentToken = data.data.token;
            tokenValue.value = currentToken;
            tokenExpiry.textContent = new Date(data.data.expiresAt).toLocaleString();
            tokenResult.classList.remove('hidden');
            
            // Auto-fill token in Section 2
            apiTokenInput.value = currentToken;
        } else {
            alert('Failed to generate token: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error generating token:', error);
        alert(API_ENDPOINTS.GENERATE_TOKEN);
        logRequest('POST', API_ENDPOINTS.GENERATE_TOKEN, 0, {}, { error: error.message });
    } finally {
        generateTokenBtn.disabled = false;
        generateTokenBtn.textContent = 'Generate Token';
    }
});

// Copy token button
copyTokenBtn.addEventListener('click', () => {
    tokenValue.select();
    document.execCommand('copy');
    copyTokenBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyTokenBtn.textContent = 'Copy';
    }, 2000);
});

// Section 2: Create Embed URL
createEmbedBtn.addEventListener('click', async () => {
    const token = apiTokenInput.value.trim();
    const query = cypherQueryInput.value.trim();
    const expiresInDays = parseInt(expiresInDaysInput.value);
    
    if (!token) {
        alert('Please enter an API token');
        return;
    }
    
    if (!query) {
        alert('Please enter a Cypher query');
        return;
    }
    
    try {
        createEmbedBtn.disabled = true;
        createEmbedBtn.textContent = 'Creating...';
        
        const requestBody = {
            cypherQuery: query,
            expiresInDays: expiresInDays,
        };
        
        const response = await fetch(API_ENDPOINTS.CREATE_EMBED, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        
        logRequest('POST', API_ENDPOINTS.CREATE_EMBED, response.status, requestBody, data);
        
        if (response.ok && data.success) {
            currentEmbedUrl = data.data.embedUrl;
            embedUrl.value = currentEmbedUrl;
            embedToken.textContent = data.data.embedToken;
            embedExpiry.textContent = new Date(data.data.expiresAt).toLocaleString();
            embedResult.classList.remove('hidden');
            
            // Auto-fill embed URL in Section 3
            viewUrl.value = currentEmbedUrl;
        } else {
            alert('Failed to create embed URL: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating embed:', error);
        alert('Error creating embed: ' + error.message);
        logRequest('POST', API_ENDPOINTS.CREATE_EMBED, 0, { cypherQuery: query }, { error: error.message });
    } finally {
        createEmbedBtn.disabled = false;
        createEmbedBtn.textContent = 'Create Embed URL';
    }
});

// Copy embed URL button
copyEmbedBtn.addEventListener('click', () => {
    embedUrl.select();
    document.execCommand('copy');
    copyEmbedBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyEmbedBtn.textContent = 'Copy';
    }, 2000);
});

// Open embed URL button
openEmbedBtn.addEventListener('click', () => {
    if (currentEmbedUrl) {
        window.open(currentEmbedUrl, '_blank');
    }
});

// Section 3: View Visualization
loadVisualizationBtn.addEventListener('click', () => {
    const url = viewUrl.value.trim();
    
    if (!url) {
        alert('Please enter an embed URL');
        return;
    }
    
    embedFrame.src = url;
    visualizationPreview.classList.remove('hidden');
    
    logRequest('GET', url, 200, null, { message: 'Loading visualization in iframe' });
});

// Clear logs button
clearLogsBtn.addEventListener('click', () => {
    logs.innerHTML = '';
});
