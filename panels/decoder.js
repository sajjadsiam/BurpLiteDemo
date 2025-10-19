// Decoder Panel Controller
class Decoder {
    constructor() {
        this.history = [];
        this.currentOutput = '';
        this.currentOperation = '';
        this.init();
    }

    init() {
        // Button event listeners
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.process(action);
            });
        });

        // Clear buttons
        document.getElementById('clearInput').addEventListener('click', () => {
            document.getElementById('input').value = '';
        });

        document.getElementById('clearOutput').addEventListener('click', () => {
            document.getElementById('output').textContent = 'Perform an operation to see the result...';
            document.getElementById('operationLabel').textContent = 'Result will appear here';
            this.currentOutput = '';
        });

        // Copy button
        document.getElementById('copyOutput').addEventListener('click', () => {
            this.copyOutput();
        });

        // Load history
        this.loadHistory();
        this.renderHistory();
    }

    async process(action) {
        const input = document.getElementById('input').value;

        if (!input) {
            alert('Please enter some text to process');
            return;
        }

        let output = '';
        let operationName = '';

        try {
            switch (action) {
                case 'base64encode':
                    output = btoa(unescape(encodeURIComponent(input)));
                    operationName = 'Base64 Encode';
                    break;

                case 'base64decode':
                    output = decodeURIComponent(escape(atob(input)));
                    operationName = 'Base64 Decode';
                    break;

                case 'urlencode':
                    output = encodeURIComponent(input);
                    operationName = 'URL Encode';
                    break;

                case 'urldecode':
                    output = decodeURIComponent(input);
                    operationName = 'URL Decode';
                    break;

                case 'htmlencode':
                    output = this.htmlEncode(input);
                    operationName = 'HTML Encode';
                    break;

                case 'htmldecode':
                    output = this.htmlDecode(input);
                    operationName = 'HTML Decode';
                    break;

                case 'hexencode':
                    output = this.hexEncode(input);
                    operationName = 'Hex Encode';
                    break;

                case 'hexdecode':
                    output = this.hexDecode(input);
                    operationName = 'Hex Decode';
                    break;

                case 'md5':
                    output = await this.hash(input, 'MD5');
                    operationName = 'MD5 Hash';
                    break;

                case 'sha1':
                    output = await this.hash(input, 'SHA-1');
                    operationName = 'SHA-1 Hash';
                    break;

                case 'sha256':
                    output = await this.hash(input, 'SHA-256');
                    operationName = 'SHA-256 Hash';
                    break;

                case 'sha512':
                    output = await this.hash(input, 'SHA-512');
                    operationName = 'SHA-512 Hash';
                    break;

                default:
                    output = 'Unknown operation';
            }

            this.showResult(output, operationName);
            this.addToHistory(input, output, operationName);

        } catch (error) {
            this.showResult(`Error: ${error.message}`, operationName + ' (Failed)');
        }
    }

    htmlEncode(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    htmlDecode(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    }

    hexEncode(text) {
        let hex = '';
        for (let i = 0; i < text.length; i++) {
            hex += text.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex;
    }

    hexDecode(hex) {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    async hash(text, algorithm) {
        // MD5 is not supported by Web Crypto API, so we'll use a simplified approach
        if (algorithm === 'MD5') {
            return this.md5(text);
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Simple MD5 implementation
    md5(string) {
        // This is a simplified MD5 implementation for demonstration
        // In production, you should use a proper crypto library
        function rotateLeft(value, amount) {
            return (value << amount) | (value >>> (32 - amount));
        }

        function addUnsigned(x, y) {
            const lsw = (x & 0xFFFF) + (y & 0xFFFF);
            const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        function F(x, y, z) { return (x & y) | ((~x) & z); }
        function G(x, y, z) { return (x & z) | (y & (~z)); }
        function H(x, y, z) { return x ^ y ^ z; }
        function I(x, y, z) { return y ^ (x | (~z)); }

        function FF(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function GG(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function HH(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function II(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }

        function convertToWordArray(string) {
            let wordArray = [];
            let wordCount;
            for (let i = 0; i < string.length; i++) {
                wordCount = i >> 2;
                while (wordArray.length <= wordCount) {
                    wordArray.push(0);
                }
                wordArray[wordCount] |= (string.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
            }
            return wordArray;
        }

        const x = convertToWordArray(unescape(encodeURIComponent(string)));
        const len = string.length * 8;

        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        let a = 0x67452301;
        let b = 0xEFCDAB89;
        let c = 0x98BADCFE;
        let d = 0x10325476;

        for (let i = 0; i < x.length; i += 16) {
            const olda = a;
            const oldb = b;
            const oldc = c;
            const oldd = d;

            a = FF(a, b, c, d, x[i], 7, 0xD76AA478);
            d = FF(d, a, b, c, x[i + 1], 12, 0xE8C7B756);
            c = FF(c, d, a, b, x[i + 2], 17, 0x242070DB);
            b = FF(b, c, d, a, x[i + 3], 22, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[i + 4], 7, 0xF57C0FAF);
            d = FF(d, a, b, c, x[i + 5], 12, 0x4787C62A);
            c = FF(c, d, a, b, x[i + 6], 17, 0xA8304613);
            b = FF(b, c, d, a, x[i + 7], 22, 0xFD469501);
            a = FF(a, b, c, d, x[i + 8], 7, 0x698098D8);
            d = FF(d, a, b, c, x[i + 9], 12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[i + 10], 17, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[i + 11], 22, 0x895CD7BE);
            a = FF(a, b, c, d, x[i + 12], 7, 0x6B901122);
            d = FF(d, a, b, c, x[i + 13], 12, 0xFD987193);
            c = FF(c, d, a, b, x[i + 14], 17, 0xA679438E);
            b = FF(b, c, d, a, x[i + 15], 22, 0x49B40821);

            a = GG(a, b, c, d, x[i + 1], 5, 0xF61E2562);
            d = GG(d, a, b, c, x[i + 6], 9, 0xC040B340);
            c = GG(c, d, a, b, x[i + 11], 14, 0x265E5A51);
            b = GG(b, c, d, a, x[i], 20, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[i + 5], 5, 0xD62F105D);
            d = GG(d, a, b, c, x[i + 10], 9, 0x2441453);
            c = GG(c, d, a, b, x[i + 15], 14, 0xD8A1E681);
            b = GG(b, c, d, a, x[i + 4], 20, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[i + 9], 5, 0x21E1CDE6);
            d = GG(d, a, b, c, x[i + 14], 9, 0xC33707D6);
            c = GG(c, d, a, b, x[i + 3], 14, 0xF4D50D87);
            b = GG(b, c, d, a, x[i + 8], 20, 0x455A14ED);
            a = GG(a, b, c, d, x[i + 13], 5, 0xA9E3E905);
            d = GG(d, a, b, c, x[i + 2], 9, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[i + 7], 14, 0x676F02D9);
            b = GG(b, c, d, a, x[i + 12], 20, 0x8D2A4C8A);

            a = HH(a, b, c, d, x[i + 5], 4, 0xFFFA3942);
            d = HH(d, a, b, c, x[i + 8], 11, 0x8771F681);
            c = HH(c, d, a, b, x[i + 11], 16, 0x6D9D6122);
            b = HH(b, c, d, a, x[i + 14], 23, 0xFDE5380C);
            a = HH(a, b, c, d, x[i + 1], 4, 0xA4BEEA44);
            d = HH(d, a, b, c, x[i + 4], 11, 0x4BDECFA9);
            c = HH(c, d, a, b, x[i + 7], 16, 0xF6BB4B60);
            b = HH(b, c, d, a, x[i + 10], 23, 0xBEBFBC70);
            a = HH(a, b, c, d, x[i + 13], 4, 0x289B7EC6);
            d = HH(d, a, b, c, x[i], 11, 0xEAA127FA);
            c = HH(c, d, a, b, x[i + 3], 16, 0xD4EF3085);
            b = HH(b, c, d, a, x[i + 6], 23, 0x4881D05);
            a = HH(a, b, c, d, x[i + 9], 4, 0xD9D4D039);
            d = HH(d, a, b, c, x[i + 12], 11, 0xE6DB99E5);
            c = HH(c, d, a, b, x[i + 15], 16, 0x1FA27CF8);
            b = HH(b, c, d, a, x[i + 2], 23, 0xC4AC5665);

            a = II(a, b, c, d, x[i], 6, 0xF4292244);
            d = II(d, a, b, c, x[i + 7], 10, 0x432AFF97);
            c = II(c, d, a, b, x[i + 14], 15, 0xAB9423A7);
            b = II(b, c, d, a, x[i + 5], 21, 0xFC93A039);
            a = II(a, b, c, d, x[i + 12], 6, 0x655B59C3);
            d = II(d, a, b, c, x[i + 3], 10, 0x8F0CCC92);
            c = II(c, d, a, b, x[i + 10], 15, 0xFFEFF47D);
            b = II(b, c, d, a, x[i + 1], 21, 0x85845DD1);
            a = II(a, b, c, d, x[i + 8], 6, 0x6FA87E4F);
            d = II(d, a, b, c, x[i + 15], 10, 0xFE2CE6E0);
            c = II(c, d, a, b, x[i + 6], 15, 0xA3014314);
            b = II(b, c, d, a, x[i + 13], 21, 0x4E0811A1);
            a = II(a, b, c, d, x[i + 4], 6, 0xF7537E82);
            d = II(d, a, b, c, x[i + 11], 10, 0xBD3AF235);
            c = II(c, d, a, b, x[i + 2], 15, 0x2AD7D2BB);
            b = II(b, c, d, a, x[i + 9], 21, 0xEB86D391);

            a = addUnsigned(a, olda);
            b = addUnsigned(b, oldb);
            c = addUnsigned(c, oldc);
            d = addUnsigned(d, oldd);
        }

        const hex = [a, b, c, d].map(x => {
            let str = '';
            for (let i = 0; i < 4; i++) {
                str += ((x >> (i * 8)) & 0xFF).toString(16).padStart(2, '0');
            }
            return str;
        }).join('');

        return hex;
    }

    showResult(result, operationName) {
        this.currentOutput = result;
        this.currentOperation = operationName;

        document.getElementById('output').textContent = result;
        document.getElementById('operationLabel').textContent = operationName;
    }

    addToHistory(input, output, operation) {
        const entry = {
            input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
            output: output.substring(0, 50) + (output.length > 50 ? '...' : ''),
            operation: operation,
            timestamp: new Date().toLocaleTimeString()
        };

        this.history.unshift(entry);
        
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-size: 12px;">No operations performed yet</div>';
            return;
        }

        historyList.innerHTML = '';
        
        this.history.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <strong>${entry.operation}</strong> - ${entry.timestamp}<br>
                <span style="color: #666;">Input: ${this.escapeHtml(entry.input)}</span>
            `;
            item.addEventListener('click', () => {
                document.getElementById('output').textContent = entry.output;
                document.getElementById('operationLabel').textContent = entry.operation + ' (from history)';
            });
            historyList.appendChild(item);
        });
    }

    copyOutput() {
        if (!this.currentOutput) {
            alert('Nothing to copy');
            return;
        }

        navigator.clipboard.writeText(this.currentOutput).then(() => {
            const btn = document.getElementById('copyOutput');
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            alert('Failed to copy: ' + err);
        });
    }

    saveHistory() {
        localStorage.setItem('decoderHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('decoderHistory');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
            } catch (e) {
                this.history = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize Decoder
new Decoder();