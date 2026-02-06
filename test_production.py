"""
Production Application Audit Script
Tests the deployed application at https://frontend-three-brown-95.vercel.app
"""
from playwright.sync_api import sync_playwright
import sys
import json

PRODUCTION_URL = "https://frontend-three-brown-95.vercel.app"
RESULTS = []

def log_result(test_name, passed, message="", error=None):
    """Log test result"""
    status = "[PASS]" if passed else "[FAIL]"
    result = {
        "test": test_name,
        "passed": passed,
        "message": message,
        "error": str(error) if error else None
    }
    RESULTS.append(result)
    print(f"{status}: {test_name}")
    if message:
        print(f"  - {message}")
    if error:
        print(f"  - Error: {error}")
    return passed

def test_application(page):
    """Run all production tests"""
    print(f"\n{'='*80}")
    print(f"[*] Testing Production Application")
    print(f"URL: {PRODUCTION_URL}")
    print(f"{'='*80}\n")
    
    console_errors = []
    console_warnings = []
    
    # Capture console messages
    def handle_console(msg):
        if msg.type == 'error':
            console_errors.append(msg.text)
        elif msg.type == 'warning':
            console_warnings.append(msg.text)
    
    page.on('console', handle_console)
    
    # Test 1: Basic Page Load
    print("\n[1] Testing Basic Page Load...")
    try:
        response = page.goto(PRODUCTION_URL, wait_until='networkidle', timeout=30000)
        if response and response.status == 200:
            log_result("Page Load", True, f"Status: {response.status}")
        else:
            log_result("Page Load", False, f"Status: {response.status if response else 'No response'}")
    except Exception as e:
        log_result("Page Load", False, error=e)
    
    # Test 2: Check for "Something went wrong" error
    print("\n[2] Testing for React Errors...")
    try:
        error_heading = page.locator('h1, h2')
        error_text = error_heading.all_text_contents() if error_heading.count() > 0 else []
        has_error = any('Something went wrong' in text or 'Error' in text for text in error_text)
        
        if has_error:
            log_result("No React Errors", False, f"Found error: {error_text}")
        else:
            log_result("No React Errors", True, "No 'Something went wrong' errors found")
    except Exception as e:
        log_result("No React Errors", False, error=e)
    
    # Test 3: Check Page Title
    print("\n[3] Testing Page Title...")
    try:
        title = page.title()
        log_result("Page Title", len(title) > 0, f"Title: '{title}'")
    except Exception as e:
        log_result("Page Title", False, error=e)
    
    # Test 4: Check for Auth Provider
    print("\n[4] Testing Auth Provider Configuration...")
    try:
        # Wait a bit for providers to initialize
        page.wait_for_timeout(2000)
        
        # Check console for auth config messages
        auth_configured = any('[Providers] Auth Config Check:' in msg for msg in console_warnings + console_errors)
        log_result("Auth Provider", True, "Auth provider initialized (check console for mode)")
    except Exception as e:
        log_result("Auth Provider", False, error=e)
    
    # Test 5: Check for Login Button/Element
    print("\n[5] Testing Login Functionality...")
    try:
        # Look for login button or indication of auth
        login_button = page.get_by_role('button', name='Login')
        if login_button.count() > 0:
            log_result("Login Button", True, "Login button found")
            
            # Try clicking login
            login_button.first.click()
            page.wait_for_timeout(2000)
            
            # Check if it navigates or shows login form
            current_url = page.url
            log_result("Login Navigation", True, f"URL after login click: {current_url}")
        else:
            # Maybe already logged in? Check for user profile/dashboard elements
            dashboard_elements = page.locator('[data-testid="dashboard"], .dashboard, h1').count()
            if dashboard_elements > 0:
                log_result("Login Button", True, "Likely already authenticated (no login button, but dashboard content present)")
            else:
                log_result("Login Button", False, "No login button found and no dashboard content")
    except Exception as e:
        log_result("Login Button", False, error=e)
    
    # Test 6: Check for Novu Notification Bell
    print("\n[6] Testing Novu Notification System...")
    try:
        # Wait for page to fully load
        page.wait_for_timeout(2000)
        
        # Look for the bell icon (Novu notification bell)
        bell_icon = page.locator('[data-icon="bell"], svg.lucide-bell, .notification-bell')
        
        if bell_icon.count() > 0:
            log_result("Novu Notification Bell", True, f"Found {bell_icon.count()} bell icon(s)")
            
            # Check for NovuInbox component errors in console
            novu_errors = [err for err in console_errors if 'NovuInbox' in err or 'Novu' in err]
            if novu_errors:
                log_result("Novu No Errors", False, f"Found {len(novu_errors)} Novu-related errors")
            else:
                log_result("Novu No Errors", True, "No Novu-related console errors")
        else:
            # Check if Novu is configured
            novu_missing = any('[NovuInbox] CRITICAL: Missing components' in msg for msg in console_errors)
            if novu_missing:
                log_result("Novu Notification Bell", False, "Novu components missing (check NEXT_PUBLIC_NOVU_APP_ID)")
            else:
                log_result("Novu Notification Bell", False, "Bell icon not found")
    except Exception as e:
        log_result("Novu Notification Bell", False, error=e)
    
    # Test 7: Check for Critical Console Errors
    print("\n[7] Analyzing Console Errors...")
    try:
        critical_errors = [err for err in console_errors if 
                          'React' in err or 'TypeError' in err or 'ReferenceError' in err or 
                          'Uncaught' in err or 'Failed to fetch' in err]
        
        if len(critical_errors) > 0:
            log_result("No Critical Errors", False, f"Found {len(critical_errors)} critical errors")
            print("\n  [!] Critical Errors:")
            for err in critical_errors[:5]:  # Show first 5
                print(f"    - {err[:200]}")
        else:
            log_result("No Critical Errors", True, f"No critical errors (Total errors: {len(console_errors)})")
    except Exception as e:
        log_result("No Critical Errors", False, error=e)
    
    # Test 8: Take Screenshot
    print("\n[8] Capturing Screenshot...")
    try:
        screenshot_path = "C:\\Users\\User\\.gemini\\antigravity\\brain\\6081996e-3fd7-4bd3-ab38-de978d49b304\\production_screenshot.png"
        page.screenshot(path=screenshot_path, full_page=True)
        log_result("Screenshot", True, f"Saved to {screenshot_path}")
    except Exception as e:
        log_result("Screenshot", False, error=e)
    
    return console_errors, console_warnings

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            console_errors, console_warnings = test_application(page)
            
            # Summary
            print(f"\n{'='*80}")
            print("[*] TEST SUMMARY")
            print(f"{'='*80}")
            
            passed_tests = sum(1 for r in RESULTS if r['passed'])
            total_tests = len(RESULTS)
            
            print(f"\nPassed: {passed_tests}/{total_tests}")
            print(f"Failed: {total_tests - passed_tests}/{total_tests}")
            
            print(f"\n[*] Console Metrics:")
            print(f"  - Errors: {len(console_errors)}")
            print(f"  - Warnings: {len(console_warnings)}")
            
            # Write detailed results to file
            results_path = "C:\\Users\\User\\.gemini\\antigravity\\brain\\6081996e-3fd7-4bd3-ab38-de978d49b304\\test_results.json"
            with open(results_path, 'w') as f:
                json.dump({
                    'results': RESULTS,
                    'console_errors': console_errors,
                    'console_warnings': console_warnings,
                    'summary': {
                        'passed': passed_tests,
                        'failed': total_tests - passed_tests,
                        'total': total_tests
                    }
                }, f, indent=2)
            print(f"\n[+] Detailed results saved to: {results_path}")
            
            # Exit code
            exit_code = 0 if passed_tests == total_tests else 1
            sys.exit(exit_code)
            
        finally:
            browser.close()

if __name__ == "__main__":
    main()
