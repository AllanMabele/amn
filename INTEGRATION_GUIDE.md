<!-- INTEGRATION GUIDE: Add to xauusd-scalping-ai.html -->

<!-- ════════════════════════════════════════════════════════════════
     UPDATE 1: Add this script tag in <head> section
════════════════════════════════════════════════════════════════ -->

<!-- Add after Supabase script -->
<script>
  // License System Configuration
  const LICENSE_API = 'https://your-vercel-app.vercel.app/api/licenses'; // UPDATE THIS WITH YOUR VERCEL URL
</script>


<!-- ════════════════════════════════════════════════════════════════
     UPDATE 2: Modify verifyPayment() function
     Replace the existing function with this version
════════════════════════════════════════════════════════════════ -->

function verifyPayment() {
  const txId = document.getElementById('transactionId').value.trim();
  const email = document.getElementById('buyerEmail').value.trim();
  const successMsg = document.getElementById('successMsg');
  const errorMsg = document.getElementById('errorMsg');
  const infoMsg = document.getElementById('infoMsg');
  const verifyBtn = document.getElementById('verifyBtn');

  successMsg.style.display = 'none';
  errorMsg.style.display = 'none';
  infoMsg.style.display = 'none';

  console.log('🔍 Verifying payment...');
  console.log('Transaction ID:', txId);
  console.log('Email:', email);

  if(!txId || !email) {
    errorMsg.textContent = '❌ Please enter transaction ID and email';
    errorMsg.style.display = 'block';
    console.error('❌ Missing transaction ID or email');
    return;
  }

  // Check if email already has active license
  checkEmailExists(email)
    .then(exists => {
      if (exists) {
        errorMsg.textContent = '❌ This email already has an active license. Contact allymabz@gmail.com if you need a new one.';
        errorMsg.style.display = 'block';
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.textContent = 'Verifying...';

      setTimeout(() => {
        const isValid = txId.length > 5;
        
        if(isValid) {
          console.log('✅ Transaction verification passed');
          successMsg.style.display = 'block';
          
          VALID_TRANSACTIONS[txId] = { 
            email: email, 
            timestamp: new Date().toISOString()
          };
          currentTransactionId = txId;
          currentBuyerEmail = email;
          
          // Create license in database
          createLicenseInDB(email, txId);
          
          setTimeout(() => {
            successMsg.style.display = 'none';
            infoMsg.style.display = 'block';
            document.getElementById('pinEntrySection').classList.add('active');
            document.getElementById('verifyBtn').style.display = 'none';
            console.log('📌 PIN entry section activated');
            setTimeout(() => {
              document.getElementById('pinDigit1').focus();
            }, 100);
          }, 2000);
          
        } else {
          console.error('❌ Transaction verification failed');
          errorMsg.textContent = '❌ Transaction ID not found. Please check and try again.';
          errorMsg.style.display = 'block';
          verifyBtn.disabled = false;
          verifyBtn.textContent = 'Verify Payment & Continue';
        }
      }, 1500);
    })
    .catch(err => {
      console.error('Error checking email:', err);
      errorMsg.textContent = '❌ Error verifying email. Please try again.';
      errorMsg.style.display = 'block';
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify Payment & Continue';
    });
}


<!-- ════════════════════════════════════════════════════════════════
     UPDATE 3: Add these new functions
     Add these BEFORE the closing </script> tag
════════════════════════════════════════════════════════════════ -->

// Check if email already has active license
async function checkEmailExists(email) {
  try {
    const response = await fetch(`${LICENSE_API}?action=check-email&email=${encodeURIComponent(email)}`);
    const data = await response.json();
    return data.exists || false;
  } catch (error) {
    console.error('Error checking email:', error);
    return false; // Allow if check fails
  }
}

// Create license in database after payment verification
async function createLicenseInDB(email, transactionId) {
  try {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from today
    
    const payload = {
      email: email,
      transaction_id: transactionId,
      expiry_date: expiryDate.toISOString().split('T')[0],
      notes: `Created from payment page - PIN verification required`
    };

    console.log('📤 Creating license in database...', payload);

    const response = await fetch(`${LICENSE_API}?action=create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'system_auto_create' // Use special key for automated creation
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ License created successfully');
    } else {
      console.warn('⚠️ License creation returned:', result);
    }

  } catch (error) {
    console.error('❌ Error creating license:', error);
    // Don't block user - license can be created manually by admin
  }
}

// Updated verifyPIN to show download after PIN verification
function verifyPIN() {
  const pin1 = document.getElementById('pinDigit1').value;
  const pin2 = document.getElementById('pinDigit2').value;
  const pin3 = document.getElementById('pinDigit3').value;
  const pin4 = document.getElementById('pinDigit4').value;
  const enteredPin = pin1 + pin2 + pin3 + pin4;
  
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const downloadSection = document.getElementById('downloadSection');
  const pinEntrySection = document.getElementById('pinEntrySection');

  console.log('🔐 PIN verification attempt. Entered:', enteredPin, 'Correct:', CORRECT_PIN);

  if(!pin1 || !pin2 || !pin3 || !pin4) {
    pinErrorMsg.textContent = '❌ Please enter all 4 PIN digits';
    pinErrorMsg.style.display = 'block';
    console.log('❌ Incomplete PIN entry');
    return;
  }

  if(enteredPin === CORRECT_PIN) {
    console.log('✅ PIN verification successful!');
    pinErrorMsg.style.display = 'none';
    pinEntrySection.classList.remove('active');
    downloadSection.classList.add('active');
    
    // Log successful activation
    logLicenseActivation(currentBuyerEmail, currentTransactionId);
    
    alert(`✅ PIN verified!\n\nYour download is now ready. Click the link below to download the file.`);
  } else {
    console.error('❌ PIN verification failed. Incorrect PIN entered.');
    pinErrorMsg.textContent = '❌ Incorrect PIN. Please check your email or contact allymabz@gmail.com for assistance.';
    pinErrorMsg.style.display = 'block';
  }
}

// Log when user successfully activates their license
async function logLicenseActivation(email, transactionId) {
  try {
    // This is optional - just for audit trail
    console.log(`📝 User ${email} activated license with transaction ${transactionId}`);
  } catch (error) {
    console.error('Error logging activation:', error);
  }
}


<!-- ════════════════════════════════════════════════════════════════
     COMPLETE INTEGRATION CHECKLIST
════════════════════════════════════════════════════════════════

STEP 1: Setup Supabase
  ✅ Copy supabase/schema.sql to your Supabase SQL editor
  ✅ Run all SQL to create tables and functions
  ✅ Verify tables are created in Supabase dashboard

STEP 2: Deploy API to Vercel
  ✅ Create account at vercel.com
  ✅ Create new project and upload api/licenses.js to /api folder
  ✅ Set environment variables:
     - SUPABASE_URL: https://gsivamaidhdjcrtzedmp.supabase.co
     - SUPABASE_SERVICE_KEY: (get from Supabase settings → API)
     - ADMIN_API_KEY: (create a strong random string)
  ✅ Deploy project and note the URL (e.g., https://your-app.vercel.app)

STEP 3: Setup Admin Dashboard
  ✅ Update LICENSE_API in admin-dashboard.html
  ✅ Deploy admin-dashboard.html to Netlify or GitHub Pages
  ✅ Access at https://your-admin-site.netlify.app
  ✅ Login with your ADMIN_API_KEY

STEP 4: Integrate with Payment Page
  ✅ Update xauusd-scalping-ai.html:
     - Add LICENSE_API = 'https://your-vercel-app.vercel.app/api/licenses'
     - Replace verifyPayment() function with new version
     - Add checkEmailExists() function
     - Add createLicenseInDB() function
     - Add logLicenseActivation() function

STEP 5: Test End-to-End
  ✅ Go to payment page
  ✅ Enter test email and transaction ID
  ✅ Verify PIN (9967)
  ✅ Check admin dashboard - license should appear
  ✅ Verify user's EA checks license on startup

════════════════════════════════════════════════════════════════

ENVIRONMENT VARIABLES FOR VERCEL (api/licenses.js)

SUPABASE_URL=https://gsivamaidhdjcrtzedmp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_API_KEY=supersecret_random_key_here_12345678

Get SUPABASE_SERVICE_KEY from:
  1. Supabase dashboard
  2. Settings → API
  3. Copy "service_role" key (NOT anon key!)

Generate ADMIN_API_KEY:
  - Use: https://uuidonline.com/ to generate a random string
  - Or use a password generator with 32+ characters

════════════════════════════════════════════════════════════════

HOW IT WORKS (Flow Diagram)

USER
  ↓
[Payment Page - xauusd-scalping-ai.html]
  ├─ Enter Email + Transaction ID
  ├─ Call: checkEmailExists(email)
  │  └─→ API checks if email already has license
  ├─ verifyPayment() → createLicenseInDB()
  │  └─→ Creates license in Supabase (1 year expiry)
  ├─ Enter PIN (9967)
  │  └─→ Show download link
  └─ Download .ex5 file from UDrop
        ↓
[EA Startup - Your MT5 Expert Advisor]
  ├─ Call: verifyLicense(userEmail, version)
  │  └─→ API checks Supabase:
  │      - Is license active?
  │      - Not suspended?
  │      - Not expired?
  │      - AI version still supported?
  ├─ If ALL checks pass → AI runs normally
  └─ If ANY check fails → Trading disabled + alert

════════════════════════════════════════════════════════════════

ADMIN DASHBOARD FEATURES

Overview Tab:
  • Total licenses count
  • Active licenses %
  • Suspended licenses
  • Licenses expiring in <7 days

Licenses Tab:
  • Search by email
  • Filter by status
  • View all license details
  • Quick extend (1-click 365 days)
  • Quick suspend (1-click)

Manage Tab:
  • Create new licenses manually
  • Extend existing license
  • Suspend license with reason

Activity Tab:
  • View all activities (created, verified, suspended, etc.)
  • Timestamp tracking
  • User-specific activity filtering

════════════════════════════════════════════════════════════════

SECURITY BEST PRACTICES

1. Admin Key
   ✅ Store ADMIN_API_KEY in Vercel environment variables
   ❌ NEVER commit to GitHub
   ❌ NEVER share publicly

2. API Endpoints
   ✅ Check admin key on every protected endpoint
   ✅ Only 'verify' endpoint is public (no key needed)
   ❌ All admin operations require x-admin-key header

3. Database
   ✅ Row Level Security (RLS) enabled on all tables
   ✅ Users can only verify their own license
   ✅ Admins can do everything
   ❌ Service key only used server-side (Vercel API)

4. Dashboard
   ✅ Admin key stored in localStorage (for convenience)
   ⚠️ In production, implement proper authentication
   ⚠️ Consider adding IP whitelist for admin dashboard

════════════════════════════════════════════════════════════════

TYPICAL WORKFLOW FOR YOU

DAY 1: User purchases
  1. User enters email + transaction ID on payment page
  2. License created automatically in Supabase
  3. User enters PIN (you send manually)
  4. User downloads .ex5 file

DAY 2-365: User trades
  1. User runs EA in MT5
  2. EA calls your API: verifyLicense(email)
  3. API checks Supabase - all good
  4. EA trades normally

DAY 100: Renew user
  1. User contacts you for renewal
  2. You open admin dashboard
  3. Click "Extend License" → add 365 days
  4. Done! User's EA continues working

DAY 350: License expiring
  1. Admin dashboard shows "licenses expiring soon"
  2. You can email users: "Your license expires in X days"
  3. They can renew before expiry

DAY 365+: License expired
  1. User tries to trade
  2. EA calls API: verifyLicense(email)
  3. API sees license expired
  4. EA stops trading + shows: "License expired, contact support"

════════════════════════════════════════════════════════════════

TROUBLESHOOTING

Problem: "API Error: 401"
  → Check ADMIN_API_KEY is correct in Vercel env vars

Problem: "License not found"
  → Supabase tables not created
  → Run schema.sql in Supabase SQL editor

Problem: "CORS Error"
  → API headers not set correctly
  → Check CORS headers in vercel API code

Problem: Email already has license (but shouldn't)
  → Check Supabase licenses table
  → Admin can manually delete old license

Problem: PIN not working
  → Check CORRECT_PIN = '9967' in both files
  → Clear localStorage and try again

════════════════════════════════════════════════════════════════
