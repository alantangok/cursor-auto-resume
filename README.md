# Cursor Auto Resume

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)
![Tested with Cursor](https://img.shields.io/badge/Tested%20with%20Cursor-0.50.7-brightgreen.svg)

A simple tool that automatically clicks the "resume the conversation" link when Cursor IDE hits its API rate limits.

## Compatibility

**✅ Tested and working with:**
- Cursor 0.50.7 (Latest tested version)
- Previous versions of Cursor IDE

**Note:** This tool is designed to be compatible with current and future versions of Cursor IDE. If you encounter issues with newer versions, please report them in the Issues section.

## Important Note on Usage

This tool is created with the intention of helping developers maintain their workflow efficiency while using Cursor IDE. It is designed to automate a manual action that Cursor explicitly allows (clicking the "resume conversation" link) and does not attempt to bypass or circumvent any actual rate limits or security measures.

We respect Cursor's services and their need for rate limiting. This tool:
- Only automates an action that users are explicitly allowed to perform
- Maintains the same cooldown periods as manual clicking
- Does not attempt to bypass actual API limits or quotas
- Simply reduces the manual interruption of having to click the resume link

The goal is to enhance developer productivity while working within Cursor's intended usage patterns.

## Why This Tool Exists

When using Cursor's AI features extensively during development, you often hit rate limits after about 25 tool calls. Normally, you'd see a message like this:

```
Note: we default stop the agent after 25 tool calls. You can resume the conversation.
```

This tool automatically detects this message and clicks the "resume the conversation" link for you, allowing you to maintain focus on your development tasks without manual interruption.

## Features

- **Auto-click**: Automatically clicks the "resume the conversation" link when rate limits appear
- **Anti-spam**: 3-second cooldown between clicks to prevent issues

## How to Use

Permanent installation:

1. Install [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css)
2. Clone this repo to your home directory
3. Add this to your `settings.json`:

```
"vscode_custom_css.imports": [
    "file://${userHome}/cursor-auto-resume/cursor-auto-resume.js"
]
```

4. Restart Cursor with proper permissions to modify itself (your user should own it)
5. Activate command "Reload Custom CSS and JS"
6. Reload window

Step 5 + 6 must be repeated on each Cursor update.

One time installation:

1. In Cursor, click "Help" in the menu bar and select "Toggle Developer Tools"
2. Click the "Console" tab
3. Copy the entire code from [cursor-auto-resume.js](cursor-auto-resume.js)
4. Paste it into the console and press Enter
5. Close DevTools by clicking the X in the corner (optional)

The script will now automatically click the "resume the conversation" link whenever it appears.

## How It Works

The script:

1. Monitors the page for specific rate limit messages
2. When found, looks for the exact "resume the conversation" link
3. Clicks the link automatically (with a 3-second cooldown)

## FAQ

### Is this safe to use?
Yes, the script only runs in your Cursor IDE and only clicks the specific "resume the conversation" link when rate limits are hit. It doesn't modify any core functionality or bypass any security measures.

### What versions of Cursor are supported?
This tool has been tested and confirmed working with Cursor 0.50.7. It should work with most versions of Cursor IDE that use the standard rate limit interface.

### Will this work with future versions of Cursor?
As long as Cursor continues to use similar rate limit messages and "resume the conversation" links, the script should continue to work. If Cursor's interface changes, we'll update the tool to maintain compatibility while respecting their service.

### How do I disable it?
Close and reopen Cursor IDE, or refresh the window.

### Does this bypass Cursor's rate limits?
No. This tool only automates clicking the "resume the conversation" link that Cursor explicitly provides. It respects all cooldown periods and doesn't bypass any actual API limits. It simply automates an action that users are already permitted to perform manually.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request. When contributing, please maintain the tool's core principle of respecting Cursor's service while helping developers be more productive.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 