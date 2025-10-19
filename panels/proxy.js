// Proxy Intercept Panel Controller
class ProxyInterceptor {
    constructor() {
        this.capturedRequests = [];
        this.isIntercepting = false;
        this.selectedRequest = null;
        this.filterText = '';
        this.init();
    }

    async init() {
        // Setup event listeners
        document.getElementById('toggleIntercept').addEventListener('click', () => {
            this.toggleIntercept();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearRequests();
        });

        document.getElementById('filterInput').addEventListener('input', (e) => {
            this.filterText = e.target.value.toLowerCase();
            this.renderRequests();
        });

        // Listen for intercepted requests from background
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'REQUEST_INTERCEPTED' || message.type === 'HTTP_HISTORY_UPDATE') {
                if (this.isIntercepting || message.type === 'HTTP_HISTORY_UPDATE') {
                    this.addRequest(message.data);
                }
            }
        });

        // Get current intercept status
        await this.checkInterceptStatus();

        // Load HTTP history
        await this.loadHistory();
    }

    async checkInterceptStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ 
                type: 'GET_INTERCEPT_STATUS' 
            });
            
            if (response) {
                this.isIntercepting = response.isIntercepting;
                this.updateInterceptUI();
            }
        } catch (error) {
            console.error('Failed to check intercept status:', error);
        }
    }

    async toggleIntercept() {
        this.isIntercepting = !this.isIntercepting;

        try {
            await chrome.runtime.sendMessage({
                type: 'TOGGLE_INTERCEPT',
                enabled: this.isIntercepting
            });
            
            this.updateInterceptUI();
        } catch (error) {
            console.error('Failed to toggle intercept:', error);
            this.isIntercepting = !this.isIntercepting; // Revert on error
        }
    }

    updateInterceptUI() {
        const toggleBtn = document.getElementById('toggleIntercept');
        const statusText = document.getElementById('statusText');

        if (this.isIntercepting) {
            toggleBtn.textContent = 'Disable Intercept';
            toggleBtn.classList.add('active');
            statusText.textContent = 'Intercept is ON';
        } else {
            toggleBtn.textContent = 'Enable Intercept';
            toggleBtn.classList.remove('active');
            statusText.textContent = 'Intercept is OFF';
        }
    }

    async loadHistory() {
        try {
            const response = await chrome.runtime.sendMessage({ 
                type: 'GET_HTTP_HISTORY' 
            });
            
            if (response && response.history) {
                this.capturedRequests = response.history;
                this.renderRequests();
                this.updateStats();
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    addRequest(request) {
        this.capturedRequests.unshift(request);
        this.renderRequests();
        this.updateStats();
    }

    renderRequests() {
        const listElement = document.getElementById('requestList');
        
        // Filter requests
        let filteredRequests = this.capturedRequests;
        if (this.filterText) {
            filteredRequests = this.capturedRequests.filter(req => 
                req.url.toLowerCase().includes(this.filterText) ||
                req.method.toLowerCase().includes(this.filterText)
            );
        }

        if (filteredRequests.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
                    <h3>${this.filterText ? 'No Matching Requests' : 'No Requests Captured'}</h3>
                    <p>${this.filterText ? 'Try a different filter' : 'Enable intercept and browse to see requests'}</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = '';
        
        filteredRequests.forEach((request, index) => {
            const item = this.createRequestItemElement(request, index);
            listElement.appendChild(item);
        });
    }

    createRequestItemElement(request, index) {
        const div = document.createElement('div');
        div.className = 'request-item';
        div.dataset.index = index;

        const protocol = request.protocol === 'https:' ? '🔒' : '🔓';
        
        div.innerHTML = `
            <div>
                <span class="method ${request.method}">${request.method}</span>
                ${protocol}
                ${request.status ? `<span style="color: ${this.getStatusColor(request.status)}; font-weight: 600; font-size: 12px;">${request.status}</span>` : ''}
            </div>
            <div class="url" title="${request.url}">${request.url}</div>
            <div class="time">${new Date(request.timestamp).toLocaleTimeString()} | ${request.type || 'xhr'}</div>
        `;

        div.addEventListener('click', () => {
            this.selectRequest(request, div);
        });

        return div;
    }

    getStatusColor(status) {
        if (status >= 200 && status < 300) return '#10b981';
        if (status >= 300 && status < 400) return '#f59e0b';
        if (status >= 400 && status < 500) return '#ef4444';
        if (status >= 500) return '#dc2626';
        return '#666';
    }

    selectRequest(request, element) {
        // Update selection
        document.querySelectorAll('.request-item').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');

        this.selectedRequest = request;
        this.renderDetails(request);
    }

    renderDetails(request) {
        const panel = document.getElementById('detailPanel');

        let requestBody = 'No body';
        if (request.requestBody) {
            if (request.requestBody.type === 'formData') {
                requestBody = JSON.stringify(request.requestBody.data, null, 2);
            } else if (request.requestBody.type === 'raw') {
                requestBody = request.requestBody.data;
            }
        }

        panel.innerHTML = `
            <div class="detail-section">
                <h3>Request Details</h3>
                <div class="detail-content">
<strong>URL:</strong> ${request.url}
<strong>Method:</strong> ${request.method}
<strong>Protocol:</strong> ${request.protocol}
<strong>Type:</strong> ${request.type || 'xhr'}
<strong>Time:</strong> ${new Date(request.timestamp).toLocaleString()}
${request.status ? `<strong>Status:</strong> ${request.status} ${request.statusText || ''}` : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="sendToRepeater">🔄 Send to Repeater</button>
                    <button class="btn btn-secondary" id="copyRequest">📋 Copy URL</button>
                </div>
            </div>

            ${request.requestHeaders ? `
            <div class="detail-section">
                <h3>Request Headers</h3>
                <div class="detail-content">${this.formatHeaders(request.requestHeaders)}</div>
            </div>
            ` : ''}

            ${requestBody !== 'No body' ? `
            <div class="detail-section">
                <h3>Request Body</h3>
                <div class="detail-content">${this.escapeHtml(requestBody)}</div>
            </div>
            ` : ''}

            ${request.responseHeaders ? `
            <div class="detail-section">
                <h3>Response Headers</h3>
                <div class="detail-content">${this.formatHeaders(request.responseHeaders)}</div>
            </div>
            ` : ''}
        `;

        // Add event listeners
        document.getElementById('sendToRepeater')?.addEventListener('click', () => {
            this.sendToRepeater(request);
        });

        document.getElementById('copyRequest')?.addEventListener('click', () => {
            navigator.clipboard.writeText(request.url);
            alert('URL copied to clipboard!');
        });
    }

    formatHeaders(headers) {
        if (!headers || typeof headers !== 'object') return 'No headers';
        
        return Object.entries(headers)
            .map(([key, value]) => `<strong>${this.escapeHtml(key)}:</strong> ${this.escapeHtml(value)}`)
            .join('\n');
    }

    async sendToRepeater(request) {
        try {
            await chrome.runtime.sendMessage({
                type: 'SEND_TO_REPEATER',
                request: request
            });
            
            // Open repeater
            chrome.tabs.create({ 
                url: chrome.runtime.getURL('panels/repeater.html') 
            });
        } catch (error) {
            console.error('Failed to send to repeater:', error);
        }
    }

    clearRequests() {
        if (confirm('Clear all captured requests?')) {
            this.capturedRequests = [];
            this.selectedRequest = null;
            this.renderRequests();
            this.updateStats();
            
            document.getElementById('detailPanel').innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 64px; margin-bottom: 20px;">✨</div>
                    <h3>Requests Cleared</h3>
                    <p>New requests will appear here</p>
                </div>
            `;
        }
    }

    updateStats() {
        document.getElementById('totalCount').textContent = `Total: ${this.capturedRequests.length}`;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize Proxy Interceptor
new ProxyInterceptor();