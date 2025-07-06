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
  - form:
    - text: Email Address
    - textbox "Email Address" [disabled]: admin@communicationmatters.org
    - text: Password
    - textbox "Password" [disabled]: AdminPass2024!
    - button "Show password" [disabled]: 👁️‍🗨️
    - button "Signing In..." [disabled]
  - paragraph: 🔒 This is a secure admin area. All login attempts are logged.
  - link "Need help? Contact Support":
    - /url: mailto:support@communicationmatters.org
```