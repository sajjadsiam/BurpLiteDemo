
# 🎯 Complete Installation & Usage Guide

## 📋 Table of Contents
1. [Installation](#installation)
2. [First Launch](#first-launch)
3. [Tool-by-Tool Guide](#tool-by-tool-guide)
4. [Real-World Examples](#real-world-examples)
5. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Installation

### Step 1: Download/Clone the Extension
```bash
# If using Git:
git clone <repository-url>

# Or: Download ZIP and extract to a folder
```

### Step 2: Install in Chrome/Edge/Brave

1. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`
   - Brave: Navigate to `brave://extensions/`

2. **Enable Developer Mode**
   - Look for toggle in top-right corner
   - Switch it ON

3. **Load the Extension**
   - Click "Load unpacked" button
   - Browse to the `burpextention` folder
   - Select the folder (not individual files)
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "BurpLite - Security Testing Suite" card
   - Status should show "Enabled"
   - Icon appears in browser toolbar (may be in extensions menu)

### Step 3: Pin to Toolbar (Optional)
- Click puzzle piece icon (Extensions)
- Find "BurpLite"
- Click pin icon
- Now visible in toolbar

---

## 🎉 First Launch

### 1. Open the Extension
- Click BurpLite icon in toolbar
- Popup menu appears with 5 tools

### 2. Quick Test - HTTP History

**Test that traffic monitoring works:**

1. Click "📊 HTTP History" in popup
2. New tab opens with HTTP History panel
3. In another tab, visit: `https://httpbin.org/get`
4. Return to HTTP History tab
5. ✅ You should see the captured GET request!

**What you'll see:**
```
┌────────────────────────────────┐
│ GET  200  🔒                   │
│ https://httpbin.org/get        │
│ 12:34:56 | document           │
└────────────────────────────────┘
```

6. Click on the request to see details
7. ✅ Success! Extension is working!

### 3. Quick Test - Repeater

**Test manual requests:**

1. Click BurpLite icon → "🔄 Repeater"
2. Enter URL: `https://httpbin.org/get`
3. Leave method as GET
4. Click "🚀 Send Request" (or Ctrl+Enter)
5. ✅ See response appear below!

### 4. Quick Test - Decoder

**Test encoding:**

1. Click BurpLite icon → "🔐 Decoder"
2. Type in Input: `Hello World`
3. Click "Base64 Encode"
4. ✅ See result: `SGVsbG8gV29ybGQ=`

---

## 📖 Tool-by-Tool Guide

### 📊 HTTP History - Complete Guide

**Purpose:** Automatically capture and analyze all HTTP/HTTPS traffic

#### Basic Usage:

1. **Open HTTP History**
   - Click extension icon
   - Select "📊 HTTP History"

2. **Browse Normally**
   - Visit any website
   - All requests are automatically captured
   - Watch requests appear in real-time

3. **View Request Details**
   - Click any request in the list
   - Right panel shows:
     - Request information (URL, method, status, time)
     - Request headers
     - Request body (if present)
     - Response headers

4. **Filter Traffic**
   - Type in filter box at top
   - Filter by:
     - URL: `api.example.com`
     - Method: `POST`
     - Status: `404`
     - Protocol: `https`

5. **Send to Repeater**
   - Click a request to select it
   - Click "🔄 Send to Repeater" button
   - Repeater opens with request pre-filled

6. **Export History**
   - Click "📥 Export" button
   - Downloads JSON file with all captured traffic
   - Useful for analysis or reporting

7. **Clear History**
   - Click "🗑️ Clear All"
   - Confirms before clearing
   - Start fresh

#### Pro Tips:

- **Focus on Specific Site:**
  ```
  Filter: "api.github.com"
  Shows only GitHub API requests
  ```

- **Find Errors:**
  ```
  Filter: "40"
  Shows all 400-level errors (404, 403, etc.)
  ```

- **HTTPS Only:**
  ```
  Filter: "https"
  Shows secure connections
  ```

- **Recent Activity:**
  - Latest requests appear at top
  - Scroll to see older requests
  - Limited to 1000 most recent

---

### 🔄 Repeater - Complete Guide

**Purpose:** Manually craft and send HTTP requests

#### Basic Usage:

1. **Open Repeater**
   - Click extension → "🔄 Repeater"

2. **Configure Request**
   
   **a) Set URL and Method:**
   ```
   Method: [GET ▼]
   URL: https://api.example.com/users
   ```

   **b) Add Headers (optional):**
   ```
   Content-Type: application/json
   Authorization: Bearer your-token-here
   User-Agent: BurpLite/1.0
   ```
   *Format: One per line, "Name: Value"*

   **c) Add Body (for POST/PUT/PATCH):**
   ```json
   {
     "username": "testuser",
     "email": "test@example.com"
   }
   ```

3. **Send Request**
   - Click "🚀 Send Request"
   - Or press: **Ctrl+Enter** (Windows) / **Cmd+Enter** (Mac)

4. **View Response**
   - **Body Tab:** Formatted response body
   - **Headers Tab:** Response headers
   - **Raw Tab:** Complete HTTP response

   **Status Bar Shows:**
   - Status code (200, 404, etc.)
   - Response time (234ms)
   - Response size (1.2 KB)

#### Common Workflows:

**GET Request:**
```
URL: https://api.github.com/users/octocat
Method: GET
Headers: (none needed)
Body: (none)
```

**POST with JSON:**
```
URL: https://httpbin.org/post
Method: POST
Headers:
  Content-Type: application/json
Body:
  {"name":"test","value":"123"}
```

**Authenticated Request:**
```
URL: https://api.example.com/private
Method: GET
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Useful Buttons:

- **🚀 Send:** Execute the request
- **🗑️ Clear:** Reset all fields
- **📜 History:** View past requests (in console for now)
- **✨ Beautify JSON:** Format JSON in body field

#### Pro Tips:

1. **Test API Endpoints:**
   - Use Repeater to test REST APIs
   - Modify parameters and see responses
   - Perfect for debugging

2. **Load from History:**
   - In HTTP History, select interesting request
   - Click "Send to Repeater"
   - Pre-fills all fields

3. **Quick Testing:**
   - Save frequently used URLs
   - Copy/paste headers between requests
   - Use Beautify for JSON readability

4. **Keyboard Shortcuts:**
   - **Ctrl+Enter:** Send request
   - **Ctrl+A:** Select all in field
   - **Ctrl+C/V:** Copy/paste

---

### ⚡ Intruder - Complete Guide

**Purpose:** Automated parameter testing with multiple payloads

#### Basic Usage:

1. **Open Intruder**
   - Click extension → "⚡ Intruder"

2. **Configure Attack**

   **a) Set Target URL:**
   ```
   https://httpbin.org/post
   ```

   **b) Create Request Template:**
   ```json
   {"username":"§admin§","password":"§pass123§"}
   ```
   *Use §§ to mark where payloads go*

   **c) Add Payloads:**
   ```
   admin
   user
   test
   guest
   root
   ```
   *One per line*

   **d) Select Attack Type:**
   - **Sniper:** One position at a time
   - **Battering Ram:** Same payload in all positions
   - **Pitchfork:** Different payloads per position

   **e) Set Delay:**
   ```
   Delay: 100 (milliseconds between requests)
   ```

3. **Start Attack**
   - Click "🚀 Start Attack"
   - Watch progress bar
   - Results appear in real-time

4. **Analyze Results**
   - Table shows:
     - Request number
     - Payload used
     - HTTP status
     - Response length
     - Response time
   - Click row for details

5. **Export Results**
   - Click "📥 Export"
   - Saves JSON with all results

#### Attack Types Explained:

**Sniper (Most Common):**
```
Template: {"user":"§admin§","pass":"§test§"}
Payload: admin, user, test

Requests sent:
1. {"user":"admin","pass":"test"}
2. {"user":"user","pass":"test"}
3. {"user":"test","pass":"test"}
```

**Battering Ram:**
```
Template: {"user":"§admin§","pass":"§test§"}
Payload: admin, user

Requests sent:
1. {"user":"admin","pass":"admin"}
2. {"user":"user","pass":"user"}
```

**Pitchfork:**
```
Template: {"user":"§admin§","pass":"§pass123§"}
Payloads: admin,user / pass1,pass2

Requests sent:
1. {"user":"admin","pass":"pass1"}
2. {"user":"user","pass":"pass2"}
```

#### Real Examples:

**Username Enumeration:**
```
URL: https://your-test-site.com/login
Template: username=§admin§&password=test
Payloads:
  admin
  administrator
  root
  user
  guest

Look for: Different response lengths or status codes
```

**Password Testing:**
```
URL: https://your-test-site.com/login
Template: username=admin&password=§password§
Payloads:
  password
  admin
  123456
  letmein

Look for: 200 status (successful login)
```

**API Parameter Fuzzing:**
```
URL: https://api.example.com/users?id=§1§
Template: (in URL)
Payloads:
  1
  2
  999
  -1
  abc

Look for: Different responses or errors
```

#### Pro Tips:

1. **Be Respectful:**
   - Use 500-1000ms delay for production systems
   - Only test systems you own
   - Stop if errors occur

2. **Payload Strategy:**
   - Start with small payload list
   - Test manually first
   - Use common values
   - Build payload lists for different purposes

3. **Analyze Results:**
   - Different status = potential finding
   - Different length = different response
   - Same results = parameter may not be vulnerable

4. **Stop Anytime:**
   - Click "⏹️ Stop Attack"
   - Current results preserved
   - Can export partial results

---

### 🛡️ Proxy Intercept - Complete Guide

**Purpose:** Monitor and intercept HTTP traffic in real-time

#### Basic Usage:

1. **Open Proxy Intercept**
   - Click extension → "🛡️ Proxy Intercept"

2. **Enable Interception**
   - Click "Enable Intercept" button
   - Status shows "Intercept is ON"
   - All traffic now captured

3. **Browse and Capture**
   - Visit any website
   - All requests appear in left panel
   - Real-time monitoring

4. **View Details**
   - Click any request
   - Right panel shows full details
   - Headers, body, response info

5. **Send to Repeater**
   - Select interesting request
   - Click "🔄 Send to Repeater"
   - Modify and resend

6. **Filter Traffic**
   - Use filter box to narrow down
   - Show only specific domains
   - Focus on relevant traffic

7. **Clear Logs**
   - Click "🗑️ Clear All"
   - Fresh start

#### Difference from HTTP History:

| Feature | HTTP History | Proxy Intercept |
|---------|--------------|-----------------|
| Always capturing | ✅ Yes | Only when enabled |
| Filter by intercept | ❌ No | ✅ Yes |
| Purpose | View all traffic | Active monitoring |

#### Use Cases:

**Monitor Specific Site:**
```
1. Enable intercept
2. Visit target site
3. Filter: "target-site.com"
4. See all requests/responses
```

**Find Hidden Endpoints:**
```
1. Enable intercept
2. Use application normally
3. Review all captured endpoints
4. Test in Repeater
```

**Analyze Traffic Patterns:**
```
1. Capture during specific action
2. Review sequence of requests
3. Identify interesting calls
4. Send to tools for testing
```

---

### 🔐 Decoder - Complete Guide

**Purpose:** Encode, decode, and hash data

#### Available Operations:

**Encoding/Decoding:**
1. **Base64** - Standard Base64 encoding
2. **URL** - Percent encoding for URLs
3. **HTML** - HTML entity encoding
4. **Hex** - Hexadecimal encoding

**Hashing:**
5. **MD5** - 128-bit hash (weak, for legacy)
6. **SHA-1** - 160-bit hash (weak, deprecated)
7. **SHA-256** - 256-bit hash (recommended)
8. **SHA-512** - 512-bit hash (strong)

#### Basic Usage:

1. **Open Decoder**
   - Click extension → "🔐 Decoder"

2. **Enter Input**
   ```
   Type or paste text in Input field
   ```

3. **Select Operation**
   - Click any button
   - Result appears in Output panel

4. **Copy Result**
   - Click "📋 Copy" button
   - Result copied to clipboard

5. **Chain Operations**
   - Copy output
   - Paste as new input
   - Apply another operation

#### Real Examples:

**Example 1: Encode for URL**
```
Input: test@example.com?query=hello world
Operation: URL Encode
Output: test%40example.com%3Fquery%3Dhello%20world
```

**Example 2: Decode Base64**
```
Input: SGVsbG8gV29ybGQ=
Operation: Base64 Decode
Output: Hello World
```

**Example 3: Hash Password**
```
Input: myPassword123
Operation: SHA-256
Output: 1d87f8fc1c12345... (64 character hex string)
```

**Example 4: Double Encoding**
```
Step 1: Hello World
→ Base64 Encode
→ SGVsbG8gV29ybGQ=

Step 2: Copy output, paste as new input
→ URL Encode
→ SGVsbG8lMjBXb3JsZA%3D%3D
```

#### Use Cases:

**1. Testing XSS Payloads:**
```
Payload: <script>alert('XSS')</script>
→ HTML Encode
→ &lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;
→ Test if application decodes
```

**2. Decoding Tokens:**
```
JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4ifQ...
→ Split by "."
→ Base64 Decode each part
→ View token contents
```

**3. Creating Hashes:**
```
Password: password123
→ SHA-256 Hash
→ Compare with database hashes
→ Verify password storage
```

**4. Analyzing Encoded Data:**
```
Found: %48%65%6C%6C%6F
→ URL Decode  
→ Hello
```

#### Pro Tips:

1. **Operation History:**
   - Shows recent operations
   - Click to see results again
   - Helps track your work

2. **Hash Verification:**
   - Hash same input twice
   - Should produce same output
   - Use for password verification

3. **Encoding Chains:**
   ```
   Text → Base64 → URL Encode
   Used in complex scenarios
   Decode in reverse order
   ```

4. **Common Patterns:**
   - **JWT Tokens:** Base64 + JSON
   - **URLs:** URL Encode special chars
   - **Passwords:** SHA-256 or stronger
   - **XSS:** HTML/URL encoding

---

## 🎯 Real-World Examples

### Example 1: API Testing Workflow

**Scenario:** Test a REST API for a user management system

1. **Discover Endpoints (HTTP History)**
   ```
   - Use the web application normally
   - Check HTTP History
   - Find: GET /api/users
   - Find: POST /api/users
   - Find: PUT /api/users/123
   ```

2. **Test GET Request (Repeater)**
   ```
   URL: https://api.example.com/users
   Method: GET
   Headers:
     Authorization: Bearer abc123
   
   Response: List of users
   Status: 200 OK
   ```

3. **Test Parameter Manipulation (Repeater)**
   ```
   URL: https://api.example.com/users?limit=10
   Try: ?limit=1000
   Try: ?limit=-1
   Try: ?limit=abc
   
   Look for: Errors, different responses
   ```

4. **Brute Force User IDs (Intruder)**
   ```
   URL: https://api.example.com/users/§1§
   Payloads: 1, 2, 3, 4, 5, 10, 100, 999
   
   Look for: Valid vs invalid responses
   ```

### Example 2: Authentication Testing

**Scenario:** Test login mechanism

1. **Capture Login Request (HTTP History)**
   ```
   - Perform login normally
   - Find POST /login request
   - Send to Repeater
   ```

2. **Test Single Login (Repeater)**
   ```
   URL: https://site.com/login
   Method: POST
   Body: username=test&password=test
   
   Test: Different credentials
   ```

3. **Username Enumeration (Intruder)**
   ```
   Template: username=§admin§&password=wrongpass
   Payloads:
     admin
     administrator
     root
     user
   
   Look for: Different error messages
   ```

4. **Password Attack (Intruder)**
   ```
   ⚠️ Only on your own systems!
   
   Template: username=admin&password=§password§
   Payloads:
     password
     admin
     123456
     (common passwords)
   
   Look for: Successful login (200 OK)
   ```

### Example 3: Data Encoding Analysis

**Scenario:** Analyze application data encoding

1. **Find Encoded Data (HTTP History)**
   ```
   Find request with encoded parameter:
   ?data=SGVsbG8lMjBXb3JsZA%3D%3D
   ```

2. **Decode Step by Step (Decoder)**
   ```
   Step 1: SGVsbG8lMjBXb3JsZA%3D%3D
   → URL Decode
   → SGVsbG8gV29ybGQ=
   
   Step 2: SGVsbG8gV29ybGQ=
   → Base64 Decode
   → Hello World
   ```

3. **Test Different Encodings (Repeater)**
   ```
   Try sending:
   - URL encoded only
   - Base64 only
   - Double encoded
   - Not encoded
   
   See how application handles each
   ```

---

## 💡 Tips & Best Practices

### General Tips

1. **Always Get Permission**
   - Only test systems you own or have written authorization
   - Read terms of service
   - When in doubt, don't test

2. **Start with Test APIs**
   ```
   Safe URLs:
   - httpbin.org (HTTP testing)
   - reqres.in (REST API)
   - jsonplaceholder.typicode.com (Fake API)
   ```

3. **Use HTTP History First**
   - Capture normal traffic
   - Understand application
   - Find interesting requests
   - Then test in other tools

4. **Save Your Work**
   - Export results regularly
   - Document findings
   - Save interesting requests
   - Build payload libraries

### Performance Tips

1. **Clear Regularly**
   - Clear history after sessions
   - Export before clearing
   - Keeps extension fast

2. **Use Filters**
   - Don't view all traffic at once
   - Filter to specific domains
   - Focus on relevant requests

3. **Manage Payloads**
   - Start small (10-20 payloads)
   - Use appropriate delays
   - Stop if too many errors

### Security Tips

1. **Rate Limiting**
   - Use delays in Intruder
   - Don't overwhelm servers
   - 500-1000ms for production

2. **Error Handling**
   - Watch for blocks/bans
   - Stop if seeing errors
   - Respect robots.txt

3. **Data Privacy**
   - Don't capture sensitive data unnecessarily
   - Clear history when done
   - Export only what's needed
   - Be mindful of logged data

### Workflow Tips

1. **Systematic Approach**
   ```
   1. Observe (HTTP History)
   2. Analyze (Review captured traffic)
   3. Test (Repeater)
   4. Automate (Intruder)
   5. Document (Export results)
   ```

2. **Integration**
   - HTTP History → Repeater (quick testing)
   - Repeater → Intruder (automation)
   - Decoder → anywhere (data analysis)

3. **Documentation**
   - Take screenshots
   - Export data
   - Write notes
   - Build reports

---

## 🎓 Learning Path

### Beginner 
- [ ] Install extension
- [ ] Test HTTP History
- [ ] Simple GET in Repeater
- [ ] Basic Base64 encoding
- [ ] Test with httpbin.org

### Intermediate 
- [ ] POST requests with JSON
- [ ] Add custom headers
- [ ] Simple Intruder attacks
- [ ] Filter HTTP History
- [ ] Try all encoders

### Advanced 
- [ ] Complex Intruder attacks
- [ ] Chained encodings
- [ ] Custom payload lists
- [ ] API testing workflows
- [ ] Full testing methodology

---

## 📞 Need More Help?

---

**Happy Testing! 🔒**

*Remember: With great power comes great responsibility. Always test ethically and legally.*

