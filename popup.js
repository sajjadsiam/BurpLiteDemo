// BurpLite Popup Controller
class PopupController {
    constructor() {
        this.init();
        this.checkStatus();
    }

    init() {
        // Tool navigation
        document.getElementById('httpHistory').addEventListener('click', () => {
            this.openTool('panels/history.html');
        });

        document.getElementById('repeater').addEventListener('click', () => {
            this.openTool('panels/repeater.html');
        });

        document.getElementById('intruder').addEventListener('click', () => {
            this.openTool('panels/intruder.html');
        });

        document.getElementById('proxy').addEventListener('click', () => {
            this.openTool('panels/proxy.html');
        });

        document.getElementById('decoder').addEventListener('click', () => {
            this.openTool('panels/decoder.html');
        });
    }

    openTool(path) {
        chrome.tabs.create({ 
            url: chrome.runtime.getURL(path)
        });
    }

    async checkStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ 
                type: 'GET_INTERCEPT_STATUS' 
            });
            
            const indicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            
            if (response.isIntercepting) {
                indicator.className = 'status-indicator active';
                statusText.textContent = 'Intercept Active';
            } else {
                indicator.className = 'status-indicator inactive';
                statusText.textContent = 'Ready';
            }
        } catch (error) {
            console.error('Status check failed:', error);
        }
    }
}

// Initialize popup
new PopupController();