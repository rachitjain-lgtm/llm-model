require('dotenv').config();
const { connectDB, getDb } = require('../config/database');
const authService = require('../services/auth.service');

async function run() {
  console.log("Connecting to database...");
  await connectDB();
  
  // Wait a moment for connection
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  const db = getDb();
  const email = "test_recovery@example.com";
  
  try {
    // 1. Cleanup
    console.log("Cleaning up previous test user if any...");
    await db.collection('users').deleteOne({ email });
    
    // 2. Register
    console.log("Registering test user...");
    const regResult = await authService.registerUser({
      name: "Test Recovery User",
      email,
      password: "OldPassword123"
    });
    console.log("Registered successfully:", regResult.user);
    
    // 3. Generate Token
    console.log("Generating reset token...");
    const token = await authService.generatePasswordResetToken({ email });
    console.log("Generated Token:", token);
    
    // Verify token was saved in DB
    const userDoc = await db.collection('users').findOne({ email });
    console.log("Stored token in DB:", userDoc.resetPasswordToken);
    console.log("Expires in DB:", userDoc.resetPasswordExpires);
    
    // 4. Reset Password
    console.log("Resetting password...");
    const resetResult = await authService.resetUserPassword({
      email,
      token,
      newPassword: "NewPassword123"
    });
    console.log("Reset password result:", resetResult);
    
    // Verify token fields are unset in DB
    const updatedUserDoc = await db.collection('users').findOne({ email });
    console.log("Token fields after reset (should be undefined):", 
      updatedUserDoc.resetPasswordToken, 
      updatedUserDoc.resetPasswordExpires
    );
    
    // 5. Try Login with New Password
    console.log("Trying login with new password...");
    const loginResult = await authService.loginUser({
      email,
      password: "NewPassword123"
    });
    console.log("Logged in with new password successfully!", loginResult.user);
    
    // 6. Cleanup
    await db.collection('users').deleteOne({ email });
    console.log("Test user deleted. All checks passed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed with error:", error);
    process.exit(1);
  }
}

run();
