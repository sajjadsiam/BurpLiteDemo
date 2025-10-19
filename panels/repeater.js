// Repeater Panel Controller
class Repeater {
    constructor() {
        this.history = [];
        this.currentResponse = null;
        this.activeTab = 'body';
        this.init();
    }

    init() {
        // Button event listeners
        document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('beautifyBtn').addEventListener('click', () => this.beautifyJSON());

        // Tab switching
        document.querySelectorAll('.response-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Listen for requests from HTTP History
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'SEND_TO_REPEATER') {
                this.loadFromHistory(message.data);
            }
        });

        // Load saved history
        this.loadHistory();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.sendRequest();
            }
        });
    }

    async sendRequest() {
        const url = document.getElementById('url').value.trim();
        const method = document.getElementById('method').value;
        const headersText = document.getElementById('headers').value;
        const body = document.getElementById('body').value;

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Invalid URL format');
            return;
        }

        const headers = this.parseHeaders(headersText);
        const startTime = Date.now();

        // Show loading state
        this.showLoading();

        try {
            const requestOptions = {
                method: method,
                headers: headers,
                mode: 'cors'
            };

            // Add body for non-GET requests
            if (method !== 'GET' && method !== 'HEAD' && body) {
                requestOptions.body = body;
            }

            const response = await fetch(url, requestOptions);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Get response data
            const responseText = await response.text();
            const responseHeaders = Object.fromEntries([...response.headers]);

            const responseData = {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body: responseText,
                time: responseTime,
                ok: response.ok
            };

            this.currentResponse = responseData;
            this.displayResponse(responseData);

            // Save to history
            this.saveToHistory({
                url,
                method,
                headers,
                body,
                response: responseData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            const errorResponse = {
                status: 'Error',
                statusText: error.message,
                body: `Error: ${error.message}\n\nThis could be due to:\n- CORS restrictions\n- Network connectivity issues\n- Invalid request configuration\n- Server not responding`,
                time: responseTime,
                error: true
            };

            this.currentResponse = errorResponse;
            this.displayResponse(errorResponse);
        }
    }

    showLoading() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('responseSection').style.display = 'flex';
        document.getElementById('responseStatus').innerHTML = '<div class="loading"></div> Sending request...';
        document.getElementById('responseBody').innerHTML = '<div class="empty-state"><div class="loading"></div><p>Loading...</p></div>';
    }

    parseHeaders(headersText) {
        const headers = {};
        if (!headersText) return headers;

        headersText.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                if (key && value) {
                    headers[key] = value;
                }
            }
        });
        return headers;
    }

    displayResponse(response) {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('responseSection').style.display = 'flex';

        // Update status
        const statusClass = response.error ? 'status-error' : 
                           response.ok ? 'status-success' : 
                           response.status >= 300 && response.status < 400 ? 'status-redirect' : 
                           'status-error';

        document.getElementById('responseStatus').innerHTML = `
            <span class="status-badge ${statusClass}">
                ${response.status} ${response.statusText || ''}
            </span>
            <span>⏱️ ${response.time}ms</span>
            <span>📦 ${this.formatSize(response.body?.length || 0)}</span>
        `;

        // Update body tab
        this.updateBodyTab(response.body);
        
        // Update headers tab
        if (response.headers) {
            this.updateHeadersTab(response.headers);
        }

        // Update raw tab
        this.updateRawTab(response);

        // Switch to body tab
        this.switchTab('body');
    }

    updateBodyTab(body) {
        const bodyElement = document.getElementById('responseBody');
        
        try {
            // Try to parse as JSON for pretty display
            const parsed = JSON.parse(body);
            bodyElement.innerHTML = `<pre class="response-body">${JSON.stringify(parsed, null, 2)}</pre>`;
        } catch (e) {
            // Not JSON, display as is
            bodyElement.innerHTML = `<pre class="response-body">${this.escapeHtml(body)}</pre>`;
        }
    }

    updateHeadersTab(headers) {
        const headersElement = document.getElementById('responseHeaders');
        
        let html = '<div class="response-headers">';
        for (const [key, value] of Object.entries(headers)) {
            html += `
                <div class="header-item">
                    <span class="header-name">${this.escapeHtml(key)}:</span> ${this.escapeHtml(value)}
                </div>
            `;
        }
        html += '</div>';
        
        headersElement.innerHTML = html;
    }

    updateRawTab(response) {
        const rawElement = document.getElementById('responseRaw');
        
        let rawText = `HTTP/1.1 ${response.status} ${response.statusText}\n`;
        
        if (response.headers) {
            for (const [key, value] of Object.entries(response.headers)) {
                rawText += `${key}: ${value}\n`;
            }
        }
        
        rawText += `\n${response.body}`;
        
        rawElement.innerHTML = `<pre class="response-body">${this.escapeHtml(rawText)}</pre>`;
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.response-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.getElementById('responseBody').style.display = tabName === 'body' ? 'block' : 'none';
        document.getElementById('responseHeaders').style.display = tabName === 'headers' ? 'block' : 'none';
        document.getElementById('responseRaw').style.display = tabName === 'raw' ? 'block' : 'none';

        this.activeTab = tabName;
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearForm() {
        if (confirm('Clear all fields?')) {
            document.getElementById('url').value = '';
            document.getElementById('method').value = 'GET';
            document.getElementById('headers').value = '';
            document.getElementById('body').value = '';
            document.getElementById('emptyState').style.display = 'flex';
            document.getElementById('responseSection').style.display = 'none';
        }
    }

    beautifyJSON() {
        const bodyField = document.getElementById('body');
        try {
            const parsed = JSON.parse(bodyField.value);
            bodyField.value = JSON.stringify(parsed, null, 2);
        } catch (e) {
            alert('Invalid JSON in request body');
        }
    }

    saveToHistory(request) {
        this.history.unshift(request);
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        localStorage.setItem('repeaterHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('repeaterHistory');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
            } catch (e) {
                this.history = [];
            }
        }
    }

    showHistory() {
        if (this.history.length === 0) {
            alert('No history available');
            return;
        }

        const historyList = this.history.map((item, index) => 
            `${index + 1}. ${item.method} ${item.url} - ${new Date(item.timestamp).toLocaleString()}`
        ).join('\n');

        const selection = prompt(`Request History (enter number to load):\n\n${historyList}`);
        
        if (selection) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < this.history.length) {
                this.loadFromHistory(this.history[index]);
            }
        }
    }

    loadFromHistory(item) {
        document.getElementById('url').value = item.url || '';
        document.getElementById('method').value = item.method || 'GET';
        
        // Format headers
        if (item.headers || item.requestHeaders) {
            const headers = item.headers || item.requestHeaders;
            const headersText = Object.entries(headers)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            document.getElementById('headers').value = headersText;
        }
        
        // Set body
        if (item.body) {
            document.getElementById('body').value = typeof item.body === 'string' ? 
                item.body : JSON.stringify(item.body, null, 2);
        } else if (item.requestBody) {
            if (item.requestBody.type === 'raw') {
                document.getElementById('body').value = item.requestBody.data;
            } else if (item.requestBody.data) {
                document.getElementById('body').value = JSON.stringify(item.requestBody.data, null, 2);
            }
        }
    }
}

// Initialize Repeater
new Repeater();