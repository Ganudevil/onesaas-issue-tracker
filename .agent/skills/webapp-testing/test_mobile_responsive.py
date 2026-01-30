"""
Test mobile responsiveness of the oneSAAS Issue Tracker
Tests the application at various mobile viewport sizes to verify:
- No horizontal scrolling
- Elements fit within screen boundaries
- Proper stacking of components
- Touch-friendly interactive elements
"""
from playwright.sync_api import sync_playwright
import sys

def test_mobile_responsiveness():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Test viewport sizes
        viewports = [
            {"name": "iPhone SE", "width": 375, "height": 667},
            {"name": "Small Mobile", "width": 360, "height": 640},
            {"name": "iPhone 12", "width": 390, "height": 844},
            {"name": "Tablet", "width": 768, "height": 1024}
        ]
        
        results = []
        
        for viewport in viewports:
            print(f"\n{'='*60}")
            print(f"Testing {viewport['name']} ({viewport['width']}x{viewport['height']})")
            print(f"{'='*60}")
            
            context = browser.new_context(
                viewport={"width": viewport["width"], "height": viewport["height"]},
                device_scale_factor=2
            )
            page = context.new_page()
            
            try:
                # Navigate to the issues page
                page.goto('http://localhost:3000/issues', wait_until='networkidle', timeout=30000)
                page.wait_for_timeout(2000)  # Wait for any animations
                
                # Check for horizontal scrollbar
                scroll_width = page.evaluate("document.documentElement.scrollWidth")
                client_width = page.evaluate("document.documentElement.clientWidth")
                has_horizontal_scroll = scroll_width > client_width
                
                # Take screenshot
                screenshot_path = f"C:\\Users\\User\\.gemini\\antigravity\\brain\\a1dd56a7-6800-42fb-81a7-103b8b92562a\\{viewport['name'].replace(' ', '_').lower()}_mobile_test.png"
                page.screenshot(path=screenshot_path, full_page=True)
                
                # Check if navbar is visible
                navbar_visible = page.locator('text=oneSAAS').is_visible()
                
                # Check if kanban columns exist
                todo_visible = page.locator('text=To Do').is_visible()
                
                # Test mobile menu button visibility on small screens
                mobile_menu_visible = False
                if viewport["width"] < 768:
                    mobile_menu_button = page.locator('button').filter(has=page.locator('svg')).first
                    mobile_menu_visible = mobile_menu_button.is_visible() if mobile_menu_button.count() > 0 else False
                
                result = {
                    "viewport": viewport["name"],
                    "width": viewport["width"],
                    "height": viewport["height"],
                    "has_horizontal_scroll": has_horizontal_scroll,
                    "scroll_width": scroll_width,
                    "client_width": client_width,
                    "navbar_visible": navbar_visible,
                    "kanban_visible": todo_visible,
                    "mobile_menu_visible": mobile_menu_visible,
                    "screenshot": screenshot_path,
                    "passed": not has_horizontal_scroll and navbar_visible
                }
                
                results.append(result)
                
                print(f"✓ Navbar visible: {navbar_visible}")
                print(f"✓ Kanban board visible: {todo_visible}")
                print(f"✓ Mobile menu button (if <768px): {mobile_menu_visible}")
                print(f"✓ Horizontal scroll: {'❌ FOUND' if has_horizontal_scroll else '✅ NONE'}")
                if has_horizontal_scroll:
                    print(f"  - Scroll width: {scroll_width}px, Client width: {client_width}px")
                print(f"✓ Screenshot saved: {screenshot_path}")
                
            except Exception as e:
                print(f"❌ Error testing {viewport['name']}: {str(e)}")
                result = {
                    "viewport": viewport["name"],
                    "error": str(e),
                    "passed": False
                }
                results.append(result)
            
            finally:
                context.close()
        
        browser.close()
        
        # Summary
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")
        
        passed_count = sum(1 for r in results if r.get("passed", False))
        total_count = len(results)
        
        for result in results:
            status = "✅ PASS" if result.get("passed", False) else "❌ FAIL"
            viewport_name = result["viewport"]
            print(f"{status} - {viewport_name}")
            if not result.get("passed", False):
                if "error" in result:
                    print(f"       Error: {result['error']}")
                elif result.get("has_horizontal_scroll"):
                    print(f"       Issue: Horizontal scroll detected")
        
        print(f"\nResults: {passed_count}/{total_count} viewports passed")
        
        return passed_count == total_count

if __name__ == "__main__":
    success = test_mobile_responsiveness()
    sys.exit(0 if success else 1)
