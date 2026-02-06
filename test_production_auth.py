"""
Production Application Audit - Authenticated State Test
Tests the application after logging in to verify Novu bell visibility
"""
from playwright.sync_api import sync_playwright

PRODUCTION_URL = "https://frontend-three-brown-95.vercel.app"

def test_authenticated_state():
    """Test application in authenticated state"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        console_messages = []
        
        # Capture all console messages
        def handle_console(msg):
            console_messages.append(f"[{msg.type}] {msg.text}")
        
        page.on('console', handle_console)
        
        try:
            print(f"\nNavigating to {PRODUCTION_URL}...")
            page.goto(PRODUCTION_URL, wait_until='networkidle', timeout=30000)
            
            # Check if on login page
            print("\nChecking auth state...")
            sign_in_button = page.get_by_role('button', name='Sign In')
            
            if sign_in_button.count() > 0:
                print("[*] User not authenticated - clicking Sign In button...")
                sign_in_button.click()
                page.wait_for_timeout(3000)
                
                # After clicking sign in with mock auth, should redirect to dashboard
                current_url = page.url
                print(f"[*] Current URL after sign in: {current_url}")
            
            # Wait for page to stabilize
            page.wait_for_timeout(3000)
            
            # Check for Novu bell now
            print("\n[*] Looking for Novu notification bell...")
            
            # Multiple selectors to find the bell
            bell_selectors = [
                'svg.lucide-bell',
                '[data-icon="bell"]',
                '.notification-bell',
                'button:has-text("Notifications")',
                '[aria-label*="notification" i]',
                'svg[class*="bell"]'
            ]
            
            bell_found = False
            for selector in bell_selectors:
                try:
                    elements = page.locator(selector)
                    if elements.count() > 0:
                        print(f"[PASS] Found bell icon using selector: {selector}")
                        print(f"       Count: {elements.count()}")
                        bell_found = True
                        break
                except:
                    pass
            
            if not bell_found:
                print("[FAIL] Bell icon not found with any selector")
                
                # Check console for Novu messages
                print("\n[*] Console messages related to Novu:")
                novu_messages = [msg for msg in console_messages if 'Novu' in msg or 'novu' in msg]
                if novu_messages:
                    for msg in novu_messages:
                        print(f"  - {msg}")
                else:
                    print("  - No Novu-related console messages")
                
                # Check for auth messages
                print("\n[*] Console messages related to Auth:")
                auth_messages = [msg for msg in console_messages if 'Auth' in msg or 'auth' in msg or 'Mock' in msg]
                if auth_messages:
                    for msg in auth_messages[:10]:  # First 10
                        print(f"  - {msg}")
                else:
                    print("  - No auth-related console messages")
            
            # Take screenshot of authenticated state
            screenshot_path = "C:\\Users\\User\\.gemini\\antigravity\\brain\\6081996e-3fd7-4bd3-ab38-de978d49b304\\production_authenticated.png"
            page.screenshot(path=screenshot_path, full_page=True)
            print(f"\n[+] Screenshot saved to: {screenshot_path}")
            
            # Get page content for analysis
            page_html = page.content()
            
            # Check if NovuInbox is rendering
            has_novu_provider = 'novu' in page_html.lower()
            print(f"\n[*] Novu provider in HTML: {has_novu_provider}")
            
            # Check visible text
            visible_text = page.inner_text('body')
            print(f"\n[*] Page has content: {len(visible_text) > 100}")
            
        finally:
            browser.close()

if __name__ == "__main__":
    test_authenticated_state()
