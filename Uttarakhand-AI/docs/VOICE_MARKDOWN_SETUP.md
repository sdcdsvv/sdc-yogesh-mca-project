# Voice & Markdown Features Setup

## What's New? 🎉

### 1. **Markdown Rendering** ✨
- AI responses now display with proper formatting
- Supports headings, lists, bold, italic, code blocks
- Better readability for structured information

### 2. **Text-to-Speech (Voice Output)** 🔊
- Click the speaker icon on any AI message to hear it read aloud
- Auto-speak toggle: Enable to automatically read all AI responses
- Supports multiple languages (English, Hindi)

### 3. **Voice Input** 🎤
- Click the microphone button to speak your question
- Automatically converts speech to text and sends
- Works in English and Hindi

## Installation Steps

### Step 1: Install react-markdown
Run this command in the frontend directory:
```bash
cd uttarakhand-tourism-ai/frontend
npm install react-markdown
```

Or simply double-click: `install-markdown.bat`

### Step 2: Restart Frontend Server
```bash
npm run dev
```

## Features Overview

### Markdown Support
The chatbot now renders:
- **Bold text** and *italic text*
- Headings (H1, H2, H3)
- Bullet lists and numbered lists
- Code blocks and inline code
- Proper spacing and formatting

### Voice Features

#### Text-to-Speech (TTS)
- Each AI message has a speaker icon (🔊)
- Click to hear the message read aloud
- Click again to stop
- Uses browser's built-in speech synthesis

#### Auto-Speak Mode
- Toggle button above the input field
- When ON: All AI responses are automatically read aloud
- When OFF: Manual control via speaker icons

#### Voice Input (STT)
- Microphone button next to text input
- Click to start recording
- Speak your question
- Automatically sends when done
- Red pulsing animation while recording

## Browser Compatibility

### Text-to-Speech
✅ Chrome, Edge, Safari, Firefox
✅ Works on desktop and mobile

### Voice Input
✅ Chrome, Edge (best support)
⚠️ Safari (limited)
❌ Firefox (not supported)

## Tips

1. **For best voice input**: Use Chrome or Edge browser
2. **Grant microphone permission** when prompted
3. **Auto-speak**: Great for hands-free usage
4. **Language**: Voice features adapt to selected language

## Troubleshooting

**Voice input not working?**
- Check browser compatibility
- Grant microphone permissions
- Try Chrome/Edge browser

**Text-to-speech not working?**
- Check browser volume
- Try a different browser
- Ensure no other audio is playing

**Markdown not rendering?**
- Make sure react-markdown is installed
- Restart the dev server
- Clear browser cache

## Usage Example

1. Click microphone 🎤 and say: "Tell me about Nainital"
2. AI responds with formatted markdown
3. Click speaker 🔊 to hear the response
4. Or enable Auto-speak for automatic reading

Enjoy your enhanced chatbot experience! 🚀
