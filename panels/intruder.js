// Intruder Panel Controller
class Intruder {
    constructor() {
        this.isRunning = false;
        this.results = [];
        this.totalRequests = 0;
        this.completedRequests = 0;
        this.init();
    }

    init() {
        document.getElementById('startAttack').addEventListener('click', () => this.startAttack());
        document.getElementById('stopAttack').addEventListener('click', () => this.stopAttack());
        document.getElementById('exportResults').addEventListener('click', () => this.exportResults());
    }

    async startAttack() {
        // Validate inputs
        const targetUrl = document.getElementById('targetUrl').value.trim();
        const template = document.getElementById('payloadTemplate').value.trim();
        const payloadsText = document.getElementById('payloads').value.trim();

        if (!targetUrl) {
            alert('Please enter a target URL');
            return;
        }

        if (!template) {
            alert('Please enter a request template');
            return;
        }

        if (!payloadsText) {
            alert('Please enter payloads');
            return;
        }

        // Check for payload positions
        if (!template.includes('§')) {
            alert('No payload positions found. Use §markers§ to mark insertion points.');
            return;
        }

        // Reset state
        this.isRunning = true;
        this.results = [];
        this.completedRequests = 0;
        document.getElementById('startAttack').disabled = true;
        document.getElementById('stopAttack').disabled = false;
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('resultsTable').style.display = 'table';
        document.getElementById('resultsBody').innerHTML = '';

        const attackType = document.getElementById('attackType').value;
        const delay = parseInt(document.getElementById('delay').value) || 0;
        const payloads = payloadsText.split('\n').filter(p => p.trim());
        const positions = this.findPositions(template);

        this.totalRequests = payloads.length;
        this.updateStats();

        // Execute attack
        for (let i = 0; i < payloads.length && this.isRunning; i++) {
            const payload = payloads[i].trim();
            const modifiedRequest = this.replacePositions(template, positions, payload);
            
            await this.sendRequest(targetUrl, modifiedRequest, payload, i + 1);
            
            this.completedRequests++;
            this.updateProgress();
            this.updateStats();

            // Add delay between requests
            if (delay > 0 && i < payloads.length - 1) {
                await this.sleep(delay);
            }
        }

        this.stopAttack();
    }

    findPositions(template) {
        const positions = [];
        let pos = 0;
        
        while ((pos = template.indexOf('§', pos)) !== -1) {
            const endPos = template.indexOf('§', pos + 1);
            if (endPos !== -1) {
                positions.push({ 
                    start: pos, 
                    end: endPos,
                    placeholder: template.substring(pos + 1, endPos)
                });
                pos = endPos + 1;
            } else {
                break;
            }
        }
        
        return positions;
    }

    replacePositions(template, positions, payload) {
        let result = template;
        let offset = 0;

        positions.forEach(pos => {
            const originalLength = pos.end - pos.start + 1;
            const adjustedStart = pos.start + offset;
            const adjustedEnd = pos.end + offset + 1;
            
            result = result.substring(0, adjustedStart) + payload + result.substring(adjustedEnd);
            offset += payload.length - originalLength;
        });

        return result;
    }

    async sendRequest(url, body, payload, requestNum) {
        const startTime = Date.now();

        try {
            // Determine if body is JSON or form data
            let headers = {};
            let requestBody = body;

            try {
                JSON.parse(body);
                headers['Content-Type'] = 'application/json';
            } catch (e) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: requestBody
            });

            const responseText = await response.text();
            const responseTime = Date.now() - startTime;

            const result = {
                requestNum: requestNum,
                payload: payload,
                status: response.status,
                statusText: response.statusText,
                length: responseText.length,
                time: responseTime,
                response: responseText.substring(0, 500), // Store first 500 chars
                success: response.ok
            };

            this.results.push(result);
            this.displayResult(result);

        } catch (error) {
            const responseTime = Date.now() - startTime;

            const errorResult = {
                requestNum: requestNum,
                payload: payload,
                status: 'Error',
                statusText: error.message,
                length: 0,
                time: responseTime,
                response: error.toString(),
                error: true
            };

            this.results.push(errorResult);
            this.displayResult(errorResult);
        }
    }

    displayResult(result) {
        const tbody = document.getElementById('resultsBody');
        const row = tbody.insertRow(0); // Insert at top

        const statusClass = result.error ? 'status-400' :
                           result.status >= 200 && result.status < 300 ? 'status-200' :
                           result.status >= 300 && result.status < 400 ? 'status-300' :
                           result.status >= 500 ? 'status-500' : 'status-400';

        row.innerHTML = `
            <td>${result.requestNum}</td>
            <td class="payload-cell" title="${this.escapeHtml(result.payload)}">${this.escapeHtml(result.payload)}</td>
            <td class="status-cell ${statusClass}">${result.status}</td>
            <td>${result.length}</td>
            <td>${result.time}</td>
            <td>${this.escapeHtml(result.response.substring(0, 100))}${result.response.length > 100 ? '...' : ''}</td>
        `;

        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            this.showResultDetail(result);
        });
    }

    showResultDetail(result) {
        const detail = `
Request #${result.requestNum}
Payload: ${result.payload}
Status: ${result.status} ${result.statusText || ''}
Length: ${result.length} bytes
Time: ${result.time}ms

Response (first 500 chars):
${result.response}
        `.trim();

        alert(detail);
    }

    updateProgress() {
        const percentage = (this.completedRequests / this.totalRequests) * 100;
        document.getElementById('progressBar').style.width = percentage + '%';
    }

    updateStats() {
        const stats = document.getElementById('stats');
        
        if (this.isRunning) {
            stats.textContent = `Attack in progress: ${this.completedRequests} / ${this.totalRequests} requests`;
        } else if (this.completedRequests > 0) {
            const successCount = this.results.filter(r => r.success).length;
            const errorCount = this.results.filter(r => r.error).length;
            stats.textContent = `Complete: ${this.completedRequests} requests | Success: ${successCount} | Errors: ${errorCount}`;
        } else {
            stats.textContent = 'Ready to attack';
        }
    }

    stopAttack() {
        this.isRunning = false;
        document.getElementById('startAttack').disabled = false;
        document.getElementById('stopAttack').disabled = true;
        this.updateStats();
    }

    exportResults() {
        if (this.results.length === 0) {
            alert('No results to export');
            return;
        }

        const data = JSON.stringify(this.results, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `intruder-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize Intruder
new Intruder();