<p align="center">
<img style="align:center;" src="https://github.com/user-attachments/assets/bdecf1bc-de64-4642-bb8d-459aad2797ed" alt="LEMMA Extension Logo" width="200" />
</p>

<h1 align="center">LEMMA Chrome Extension</h1>

<h3 align="center">Your second brain, now in your browser.</h3>

## Overview

LEMMA Chrome Extension is a companion tool that extends your thinking and note-taking capabilities directly into your web browsing experience. This extension integrates seamlessly with your browser to help you capture ideas, make connections, and generate insights from web content while building your personal knowledge graph.

Built with privacy-first principles, the LEMMA Chrome Extension allows you to collect and organize information from the web while maintaining complete control over your data. Unlike traditional bookmarking tools, LEMMA creates intelligent connections between web content and your existing knowledge base, helping you discover patterns and generate new insights from your browsing activity.

## Features:
- **Web Content Capture**: Seamlessly save and annotate web pages, articles, and research
- **Smart Highlighting**: Intelligent text selection and note-taking directly on web pages
- **Knowledge Integration**: Connect web content to your existing LEMMA knowledge base
- **Context-Aware Suggestions**: Get relevant notes and connections based on current page content
- **Quick Note Creation**: Rapidly capture thoughts and ideas while browsing
- **Privacy-First Design**: All data processing respects user privacy and security
- **Offline Sync**: Works seamlessly with your local LEMMA application

## Usage

### Prerequisites
- Chrome or Chromium-based browser
- Node.js (for development)
- npm or yarn
- [LEMMA Desktop App](https://github.com/snavu/lemma) (optional, for full integration)

### Installation

#### For Development
1. Clone the repository and navigate to the extension directory
```bash
git clone https://github.com/your-repo/lemma-extension.git
cd lemma-extension
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load the extension in Chrome
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

#### For Production
1. Download from Chrome Web Store (coming soon)
2. Follow the installation prompts

### Development

1. Start development server
```bash
npm run dev
```

2. Make your changes and the extension will hot-reload
3. Test your changes in the browser

## Architecture

- **Framework**: WXT (Web Extension Tools)
- **Frontend**: React.js with TypeScript
- **Build System**: Vite
- **Styling**: Tailwind CSS
- **Storage**: Chrome Extension Storage API
- **Communication**: Chrome Extension Messaging API

## Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

<br>
<br>

---
<p align="center"><em>LEMMA Extension - Bridging web content with your knowledge graph</em></p>
