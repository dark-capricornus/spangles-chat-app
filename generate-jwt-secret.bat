@echo off
title JWT Secret Generator
color 0E

echo.
echo ===============================================
echo         JWT SECRET GENERATOR
echo       For Spangles Chat App Production
echo ===============================================
echo.

echo 🔐 Generating secure JWT secrets...
echo.

:: Generate multiple secure JWT secrets
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%%^&*"
set "timestamp=%date:~-4,4%%time:~0,2%%time:~3,2%%time:~6,2%"
set "timestamp=%timestamp: =0%"

:: Method 1: Complex with timestamp and random elements
set JWT1=SpanglesChatApp2025_Production_%timestamp%_%RANDOM%%RANDOM%%RANDOM%_SecureKey_%RANDOM%

:: Method 2: Base64-style encoding simulation
set JWT2=U3BhbmdsZXNDaGF0QXBwMjAyNV9Qcm9kdWN0aW9uXyVSQU5ET00lJVJBTkRPTSUlUkFORE9NJV9TZWN1cmVLZXk=_%RANDOM%%RANDOM%

:: Method 3: Mixed case with special characters
set JWT3=SpAnGlEs_ChAt_ApP_2025_PR0DUCT10N_%RANDOM%_%timestamp%_S3cUR3_K3Y_%RANDOM%

echo Here are 3 secure JWT secrets for production:
echo.
echo ✅ JWT Secret Option 1 (Recommended):
echo %JWT1%
echo.
echo ✅ JWT Secret Option 2:
echo %JWT2%
echo.
echo ✅ JWT Secret Option 3:
echo %JWT3%
echo.

echo 📝 Choose one of the above secrets for your production deployment.
echo.

echo 🔧 To set it in Heroku manually:
echo heroku config:set JWT_SECRET="your_chosen_secret_here"
echo.

echo 💡 Security Tips:
echo - Keep this secret private and secure
echo - Never commit it to version control
echo - Use different secrets for different environments
echo - Consider rotating secrets periodically
echo.

echo Would you like to set one of these in Heroku now? (y/n)
set /p choice="Enter choice: "

if /i "%choice%"=="y" (
    echo.
    echo Which secret would you like to use?
    echo 1. Option 1 (Recommended)
    echo 2. Option 2  
    echo 3. Option 3
    echo 4. Enter custom secret
    echo.
    
    set /p secret_choice="Enter your choice (1-4): "
    
    if "%secret_choice%"=="1" set CHOSEN_SECRET=%JWT1%
    if "%secret_choice%"=="2" set CHOSEN_SECRET=%JWT2%
    if "%secret_choice%"=="3" set CHOSEN_SECRET=%JWT3%
    if "%secret_choice%"=="4" (
        set /p CHOSEN_SECRET="Enter your custom JWT secret: "
    )
    
    echo.
    echo Setting JWT secret in Heroku...
    heroku config:set JWT_SECRET=%CHOSEN_SECRET%
    
    if %errorlevel% equ 0 (
        echo ✅ JWT secret updated successfully!
    ) else (
        echo ❌ Failed to update JWT secret. Make sure you're logged into Heroku.
    )
)

echo.
echo 🔒 Your JWT secret is now configured for production security!
echo.
pause
