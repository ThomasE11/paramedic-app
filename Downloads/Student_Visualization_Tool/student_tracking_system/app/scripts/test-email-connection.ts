import nodemailer from 'nodemailer';

async function testEmailConnection() {
  console.log('🔍 Testing Email Configuration\n');
  console.log('='.repeat(80));

  // Check environment variables
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  console.log('\n📧 Email Configuration:');
  console.log(`  GMAIL_USER: ${gmailUser || '❌ NOT SET'}`);
  console.log(`  GMAIL_APP_PASSWORD: ${gmailPassword ? (gmailPassword === 'secure_password_here' ? '❌ PLACEHOLDER - NOT A REAL PASSWORD' : '✓ Set (hidden)') : '❌ NOT SET'}`);

  if (!gmailUser || !gmailPassword) {
    console.log('\n❌ ERROR: Gmail credentials not configured');
    console.log('\n📝 TO FIX:');
    console.log('1. Go to: https://myaccount.google.com/apppasswords');
    console.log('2. Enable 2-Factor Authentication if needed');
    console.log('3. Generate an App Password for "Mail" → "Other (HCT Student Tracker)"');
    console.log('4. Copy the 16-character password (remove spaces)');
    console.log('5. Edit your .env file and replace:');
    console.log('   GMAIL_APP_PASSWORD="secure_password_here"');
    console.log('   with:');
    console.log('   GMAIL_APP_PASSWORD="your16charpassword"');
    console.log('6. Restart the server with: npm run dev');
    return;
  }

  if (gmailPassword === 'secure_password_here') {
    console.log('\n❌ ERROR: Using placeholder password');
    console.log('\n📝 TO FIX:');
    console.log('1. Go to: https://myaccount.google.com/apppasswords');
    console.log('2. Sign in to your Gmail account');
    console.log('3. Click "2-Step Verification" → Enable if not already');
    console.log('4. Scroll to "App passwords" and click it');
    console.log('5. Select app: Mail');
    console.log('6. Select device: Other → type "HCT Student Tracker"');
    console.log('7. Click GENERATE');
    console.log('8. Copy the 16-character password (example: abcd efgh ijkl mnop)');
    console.log('9. IMPORTANT: Remove ALL spaces → abcdefghijklmnop');
    console.log('10. Edit .env file and update:');
    console.log('    GMAIL_APP_PASSWORD="abcdefghijklmnop"');
    console.log('11. Save the file');
    console.log('12. Stop server (Ctrl+C) and restart: npm run dev');
    return;
  }

  console.log('\n🔄 Testing SMTP Connection...');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    console.log('  ✓ Transporter created');

    // Verify connection
    console.log('\n🔐 Verifying credentials with Gmail...');
    await transporter.verify();

    console.log('  ✅ SUCCESS! Connection verified\n');
    console.log('='.repeat(80));
    console.log('\n🎉 Your email is configured correctly!');
    console.log('\n📨 Sending test email...');

    // Send test email to yourself
    const testEmail = await transporter.sendMail({
      from: `"HCT Student Tracker (Test)" <${gmailUser}>`,
      to: gmailUser,
      subject: 'Test Email - HCT Student Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
            <h1 style="margin: 0;">✅ Email Configuration Successful!</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
            <p>Your HCT Student Tracker email system is working correctly.</p>
            <p><strong>Configuration:</strong></p>
            <ul>
              <li>Gmail Account: ${gmailUser}</li>
              <li>SMTP Server: smtp.gmail.com:587</li>
              <li>Authentication: ✓ Verified</li>
            </ul>
            <p>You can now send feedback emails to students!</p>
          </div>
        </div>
      `,
      text: `
Email Configuration Successful!

Your HCT Student Tracker email system is working correctly.

Configuration:
- Gmail Account: ${gmailUser}
- SMTP Server: smtp.gmail.com:587
- Authentication: ✓ Verified

You can now send feedback emails to students!
      `
    });

    console.log(`  ✅ Test email sent successfully!`);
    console.log(`  📧 Message ID: ${testEmail.messageId}`);
    console.log(`\n  Check your inbox at: ${gmailUser}`);
    console.log('\n='.repeat(80));
    console.log('\n✨ All tests passed! Your email system is ready.\n');

  } catch (error: any) {
    console.log('  ❌ FAILED\n');
    console.log('='.repeat(80));
    console.log('\n❌ ERROR Details:');
    console.log(`  ${error.message}\n`);

    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.log('🔍 This error means Gmail rejected your credentials.\n');
      console.log('Common causes:');
      console.log('  1. Using regular Gmail password instead of App Password');
      console.log('  2. App Password has spaces in it');
      console.log('  3. 2-Factor Authentication not enabled');
      console.log('  4. App Password was revoked or expired\n');

      console.log('📝 TO FIX:');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Make sure 2-Factor Authentication is ON');
      console.log('3. Click "App passwords"');
      console.log('4. Create NEW App Password:');
      console.log('   - App: Mail');
      console.log('   - Device: Other → "HCT Student Tracker"');
      console.log('5. Copy the password (remove ALL spaces)');
      console.log('6. Update .env file:');
      console.log('   GMAIL_APP_PASSWORD="your16charpassword"');
      console.log('   (NO SPACES, NO QUOTES INSIDE)');
      console.log('7. Save and restart server\n');

      console.log('Example of correct .env format:');
      console.log('  ❌ WRONG: GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"');
      console.log('  ✅ RIGHT: GMAIL_APP_PASSWORD="abcdefghijklmnop"\n');

    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.log('🔍 This error means cannot reach Gmail servers.\n');
      console.log('Possible causes:');
      console.log('  1. No internet connection');
      console.log('  2. Firewall blocking port 587');
      console.log('  3. Network/VPN issues\n');
    } else {
      console.log('🔍 Unexpected error. Full details:');
      console.log(error);
    }

    console.log('\n='.repeat(80));
  }
}

testEmailConnection().catch(console.error);
