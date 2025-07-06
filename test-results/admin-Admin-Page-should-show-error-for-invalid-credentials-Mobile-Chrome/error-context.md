# Page snapshot

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - heading "Communication Matters Conference 2025" [level=1]
  - paragraph: AAC Conference App
  - toolbar "Accessibility controls":
    - text: "Display:"
    - button "Display:": High Contrast
    - text: "Text Size:"
    - radiogroup "Text Size:":
      - radio "A small"
      - radio "A off" [checked]
      - radio "A large"
      - radio "A xl"
- navigation "Main navigation":
  - button "Toggle navigation menu": Menu
- main:
  - heading "Admin Login" [level=1]
  - paragraph: Communication Matters Conference Administration
  - text: ⚠️ Invalid login credentials Email Address
  - textbox "Email Address": invalid@email.com
  - text: Password
  - textbox "Password": wrongpassword
  - button "Show password": 👁️‍🗨️
  - button "Sign In"
  - paragraph: 🔒 This is a secure admin area. All login attempts are logged.
  - link "Need help? Contact Support":
    - /url: mailto:support@communicationmatters.org
```