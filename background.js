// BurpLite Background Service Worker
class BurpLiteBackground {
    constructor() {
        this.isIntercepting = false;
        this.httpHistory = [];
        this.maxHistorySize = 1000;
        this.init();
    }

    init() {
        // Monitor all HTTP/HTTPS requests
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => this.handleBeforeRequest(details),
            { urls: ["<all_urls>"] },
            ["requestBody"]
        );

        chrome.webRequest.onBeforeSendHeaders.addListener(
            (details) => this.handleBeforeSendHeaders(details),
            { urls: ["<all_urls>"] },
            ["requestHeaders"]
        );

        chrome.webRequest.onCompleted.addListener(
            (details) => this.handleCompleted(details),
            { urls: ["<all_urls>"] },
            ["responseHeaders"]
        );

        chrome.webRequest.onErrorOccurred.addListener(
            (details) => this.handleError(details),
            { urls: ["<all_urls>"] }
        );

        // Handle messages from other parts of the extension
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });

        // Load saved settings
        this.loadSettings();
    }

    handleBeforeRequest(details) {
        // Skip internal chrome requests
        if (details.url.startsWith('chrome://') || 
            details.url.startsWith('chrome-extension://')) {
            return;
        }

        const historyEntry = {
            id: details.requestId,
            url: details.url,
            method: details.method,
            timestamp: new Date(details.timeStamp).toISOString(),
            type: details.type,
            tabId: details.tabId,
            requestBody: this.formatRequestBody(details.requestBody),
            status: 'pending',
            protocol: new URL(details.url).protocol
        };

        // Store in temporary map for later updates
        this.storeTemporaryRequest(historyEntry);

        // If intercepting, notify proxy panel
        if (this.isIntercepting) {
            this.notifyInterceptors('REQUEST_INTERCEPTED', historyEntry);
        }
    }

    handleBeforeSendHeaders(details) {
        if (details.url.startsWith('chrome://') || 
            details.url.startsWith('chrome-extension://')) {
            return;
        }

        this.updateTemporaryRequest(details.requestId, {
            requestHeaders: this.formatHeaders(details.requestHeaders)
        });
    }

    handleCompleted(details) {
        if (details.url.startsWith('chrome://') || 
            details.url.startsWith('chrome-extension://')) {
            return;
        }

        const responseData = {
            status: details.statusCode,
            statusText: this.getStatusText(details.statusCode),
            responseHeaders: this.formatHeaders(details.responseHeaders),
            fromCache: details.fromCache || false
        };

        this.finalizeRequest(details.requestId, responseData);
    }

    handleError(details) {
        if (details.url.startsWith('chrome://') || 
            details.url.startsWith('chrome-extension://')) {
            return;
        }

        this.finalizeRequest(details.requestId, {
            status: 'error',
            statusText: details.error,
            error: true
        });
    }

    formatRequestBody(requestBody) {
        if (!requestBody) return null;
        
        if (requestBody.formData) {
            return { type: 'formData', data: requestBody.formData };
        } else if (requestBody.raw) {
            const decoder = new TextDecoder('utf-8');
            const body = requestBody.raw.map(item => 
                decoder.decode(new Uint8Array(item.bytes))
            ).join('');
            return { type: 'raw', data: body };
        }
        return null;
    }

    formatHeaders(headers) {
        if (!headers) return {};
        const formatted = {};
        headers.forEach(header => {
            formatted[header.name] = header.value;
        });
        return formatted;
    }

    getStatusText(statusCode) {
        const statusTexts = {
            200: 'OK', 201: 'Created', 204: 'No Content',
            301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
            400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
            404: 'Not Found', 500: 'Internal Server Error', 502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
        return statusTexts[statusCode] || 'Unknown';
    }

    storeTemporaryRequest(entry) {
        if (!this.tempRequests) this.tempRequests = new Map();
        this.tempRequests.set(entry.id, entry);
    }

    updateTemporaryRequest(id, data) {
        if (!this.tempRequests) return;
        const entry = this.tempRequests.get(id);
        if (entry) {
            Object.assign(entry, data);
        }
    }

    finalizeRequest(id, responseData) {
        if (!this.tempRequests) return;
        const entry = this.tempRequests.get(id);
        
        if (entry) {
            Object.assign(entry, responseData);
            entry.completedAt = new Date().toISOString();
            
            // Add to history
            this.addToHistory(entry);
            
            // Notify listeners
            this.notifyListeners('HTTP_HISTORY_UPDATE', entry);
            
            // Clean up
            this.tempRequests.delete(id);
        }
    }

    addToHistory(entry) {
        this.httpHistory.unshift(entry);
        
        // Limit history size
        if (this.httpHistory.length > this.maxHistorySize) {
            this.httpHistory = this.httpHistory.slice(0, this.maxHistorySize);
        }

        // Save to storage periodically
        this.saveHistoryDebounced();
    }

    saveHistoryDebounced() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ 
                httpHistory: this.httpHistory.slice(0, 500) // Save last 500
            });
        }, 2000);
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'TOGGLE_INTERCEPT':
                this.isIntercepting = message.enabled;
                chrome.storage.local.set({ isIntercepting: this.isIntercepting });
                sendResponse({ success: true, isIntercepting: this.isIntercepting });
                break;

            case 'GET_HTTP_HISTORY':
                sendResponse({ history: this.httpHistory });
                break;

            case 'CLEAR_HTTP_HISTORY':
                this.httpHistory = [];
                chrome.storage.local.set({ httpHistory: [] });
                sendResponse({ success: true });
                break;

            case 'GET_INTERCEPT_STATUS':
                sendResponse({ isIntercepting: this.isIntercepting });
                break;

            case 'EXPORT_HISTORY':
                const data = JSON.stringify(this.httpHistory, null, 2);
                sendResponse({ data: data });
                break;

            case 'SEND_TO_REPEATER':
                // Forward request data to repeater
                this.notifyListeners('SEND_TO_REPEATER', message.request);
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ error: 'Unknown message type' });
        }
    }

    notifyListeners(type, data) {
        chrome.runtime.sendMessage({
            type: type,
            data: data
        }).catch(() => {
            // No listeners, ignore
        });
    }

    notifyInterceptors(type, data) {
        // Notify all open proxy panels
        chrome.runtime.sendMessage({
            type: type,
            data: data
        }).catch(() => {});
    }

    async loadSettings() {
        const result = await chrome.storage.local.get([
            'isIntercepting', 
            'httpHistory'
        ]);
        
        this.isIntercepting = result.isIntercepting || false;
        this.httpHistory = result.httpHistory || [];
    }
}

// Initialize the background service
new BurpLiteBackground();