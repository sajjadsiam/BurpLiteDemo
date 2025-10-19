// HTTP History Panel Controller
class HTTPHistoryPanel {
    constructor() {
        this.history = [];
        this.filteredHistory = [];
        this.selectedRequest = null;
        this.filterText = '';
        this.init();
    }

    async init() {
        // Setup event listeners
        document.getElementById('filterInput').addEventListener('input', (e) => {
            this.filterText = e.target.value.toLowerCase();
            this.filterHistory();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportHistory();
        });

        // Listen for history updates from background
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'HTTP_HISTORY_UPDATE') {
                this.addHistoryItem(message.data);
            }
        });

        // Load existing history
        await this.loadHistory();
    }

    async loadHistory() {
        try {
            const response = await chrome.runtime.sendMessage({ 
                type: 'GET_HTTP_HISTORY' 
            });
            
            if (response && response.history) {
                this.history = response.history;
                this.filteredHistory = [...this.history];
                this.renderHistory();
                this.updateStats();
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    addHistoryItem(item) {
        this.history.unshift(item);
        this.filterHistory();
    }

    filterHistory() {
        if (!this.filterText) {
            this.filteredHistory = [...this.history];
        } else {
            this.filteredHistory = this.history.filter(item => {
                return (
                    item.url.toLowerCase().includes(this.filterText) ||
                    item.method.toLowerCase().includes(this.filterText) ||
                    (item.status && item.status.toString().includes(this.filterText))
                );
            });
        }
        this.renderHistory();
        this.updateStats();
    }

    renderHistory() {
        const listElement = document.getElementById('historyList');
        
        if (this.filteredHistory.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔍</div>
                    <h3>${this.filterText ? 'No Matching Requests' : 'No HTTP Traffic Captured Yet'}</h3>
                    <p>${this.filterText ? 'Try a different filter' : 'Browse the web to see HTTP/HTTPS requests appear here'}</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = '';
        
        this.filteredHistory.forEach((item, index) => {
            const itemElement = this.createHistoryItemElement(item, index);
            listElement.appendChild(itemElement);
        });
    }

    createHistoryItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.dataset.index = index;

        const statusClass = this.getStatusClass(item.status);
        const protocol = item.protocol === 'https:' ? '🔒' : '🔓';
        
        div.innerHTML = `
            <div>
                <span class="method ${item.method}">${item.method}</span>
                ${item.status ? `<span class="status ${statusClass}">${item.status}</span>` : ''}
                ${protocol}
            </div>
            <div class="url" title="${item.url}">${item.url}</div>
            <div class="meta">
                <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
                <span style="margin-left: 10px;">${item.type || 'xhr'}</span>
                ${item.fromCache ? '<span style="margin-left: 10px;">⚡ Cached</span>' : ''}
            </div>
        `;

        div.addEventListener('click', () => {
            this.selectRequest(item, div);
        });

        return div;
    }

    getStatusClass(status) {
        if (!status) return '';
        if (status >= 200 && status < 300) return 'success';
        if (status >= 300 && status < 400) return 'redirect';
        if (status >= 400 && status < 500) return 'client-error';
        if (status >= 500) return 'server-error';
        return '';
    }

    selectRequest(item, element) {
        // Update UI selection
        document.querySelectorAll('.history-item').forEach(el => {
            el.classList.remove('selected');
        });
        element.classList.add('selected');

        this.selectedRequest = item;
        this.renderDetails(item);
    }

    renderDetails(item) {
        const panel = document.getElementById('detailPanel');
        
        let requestBody = 'No body';
        if (item.requestBody) {
            if (item.requestBody.type === 'formData') {
                requestBody = JSON.stringify(item.requestBody.data, null, 2);
            } else if (item.requestBody.type === 'raw') {
                requestBody = item.requestBody.data;
            }
        }

        panel.innerHTML = `
            <div class="detail-section">
                <h3>Request Information</h3>
                <div class="detail-content">
                    <strong>URL:</strong> ${item.url}<br>
                    <strong>Method:</strong> ${item.method}<br>
                    <strong>Protocol:</strong> ${item.protocol}<br>
                    <strong>Type:</strong> ${item.type || 'xhr'}<br>
                    <strong>Timestamp:</strong> ${new Date(item.timestamp).toLocaleString()}<br>
                    ${item.status ? `<strong>Status:</strong> ${item.status} ${item.statusText || ''}<br>` : ''}
                    ${item.fromCache ? '<strong>From Cache:</strong> Yes<br>' : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="sendToRepeater">🔄 Send to Repeater</button>
                    <button class="btn btn-secondary" id="copyUrl">📋 Copy URL</button>
                </div>
            </div>

            ${item.requestHeaders ? `
            <div class="detail-section">
                <h3>Request Headers</h3>
                <div class="detail-content">
                    ${this.formatHeaders(item.requestHeaders)}
                </div>
            </div>
            ` : ''}

            ${requestBody !== 'No body' ? `
            <div class="detail-section">
                <h3>Request Body</h3>
                <div class="detail-content">
                    <pre>${requestBody}</pre>
                </div>
            </div>
            ` : ''}

            ${item.responseHeaders ? `
            <div class="detail-section">
                <h3>Response Headers</h3>
                <div class="detail-content">
                    ${this.formatHeaders(item.responseHeaders)}
                </div>
            </div>
            ` : ''}
        `;

        // Add event listeners for action buttons
        document.getElementById('sendToRepeater')?.addEventListener('click', () => {
            this.sendToRepeater(item);
        });

        document.getElementById('copyUrl')?.addEventListener('click', () => {
            navigator.clipboard.writeText(item.url);
            alert('URL copied to clipboard!');
        });
    }

    formatHeaders(headers) {
        if (!headers || typeof headers !== 'object') return 'No headers';
        
        return Object.entries(headers)
            .map(([key, value]) => `
                <div class="header-item">
                    <span class="header-name">${key}:</span> ${value}
                </div>
            `)
            .join('');
    }

    async sendToRepeater(item) {
        try {
            await chrome.runtime.sendMessage({
                type: 'SEND_TO_REPEATER',
                request: item
            });
            
            // Open repeater tab
            chrome.tabs.create({ 
                url: chrome.runtime.getURL('panels/repeater.html') 
            });
        } catch (error) {
            console.error('Failed to send to repeater:', error);
        }
    }

    updateStats() {
        document.getElementById('totalCount').textContent = `Total: ${this.history.length}`;
        
        const filteredCount = document.getElementById('filteredCount');
        if (this.filterText) {
            filteredCount.textContent = `Filtered: ${this.filteredHistory.length}`;
        } else {
            filteredCount.textContent = '';
        }
    }

    async clearHistory() {
        if (confirm('Are you sure you want to clear all HTTP history?')) {
            this.history = [];
            this.filteredHistory = [];
            this.selectedRequest = null;
            
            await chrome.runtime.sendMessage({ 
                type: 'CLEAR_HTTP_HISTORY' 
            });
            
            this.renderHistory();
            this.updateStats();
            
            document.getElementById('detailPanel').innerHTML = `
                <div class="empty-state">
                    <div class="icon">✨</div>
                    <h3>History Cleared</h3>
                    <p>Start browsing to capture new requests</p>
                </div>
            `;
        }
    }

    async exportHistory() {
        try {
            const response = await chrome.runtime.sendMessage({ 
                type: 'EXPORT_HISTORY' 
            });
            
            if (response && response.data) {
                const blob = new Blob([response.data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `burplite-history-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export history');
        }
    }
}

// Initialize the panel
new HTTPHistoryPanel();
