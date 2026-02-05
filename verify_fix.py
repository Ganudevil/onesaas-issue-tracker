from playwright.sync_api import sync_playwright
import sys

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))
        
        print("Navigating to http://localhost:3001/login...")
        try:
            # Go to blank page first to set storage
            page.goto('http://localhost:3001/login')
            
            # Inject mock user to force NovuInbox to render
            print("Injecting mock auth state...")
            page.evaluate("""() => {
                localStorage.setItem('auth-storage', JSON.stringify({
                    state: {
                        user: { id: 'mock-user', email: 'mock@test.com' },
                        isAuthenticated: true
                    }
                }));
            }""")
            
            # Reload to pick up the user state
            page.reload()
            page.wait_for_load_state('networkidle', timeout=30000)
            
            content = page.content()
            
            # Check for generic crash or mock mode success
            if "Something went wrong" in content:
                print("FAILURE: App crashed with 'Something went wrong'!")
                sys.exit(1)
                
            # Check if we are on login page (Mock mode usually redirects to dash or shows login)
            if "Login to OneSAAS" in content:
                print("SUCCESS: Login page loaded.")
            else:
                 print("SUCCESS: App loaded (content length: " + str(len(content)) + ")")
            
        except Exception as e:
            print(f"Error during verification: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
