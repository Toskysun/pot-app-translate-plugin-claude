# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude API translation plugin for Pot-App. It provides high-quality translation services using various Claude models from Anthropic, including the latest Claude 4 series.

## Architecture

The plugin system consists of three main components:

1. **info.json**: Plugin metadata and configuration schema
   - Contains plugin ID, display name, icon, homepage, dependencies, and language mappings
   - Defines the configuration interface with API URL, API Key, and model selection dropdown
   - Maps Pot-App language codes to service-specific language codes

2. **main.js**: Core plugin logic
   - Implements the `translate` function that receives text, source/target languages, and options
   - Has access to utilities including HTTP client, file system, database, and crypto functions
   - Returns translated text as string using Claude API
   - Includes comprehensive error handling for various API response scenarios

3. **claude.svg**: Claude-styled icon file using official color scheme (#CC9544)

## Supported Claude Models

The plugin supports the following Claude models via dropdown selection:

### Claude 4 Series (Latest)
- `claude-opus-4-20250514` - Most powerful model for highest quality translations
- `claude-sonnet-4-20250514` - Balanced performance and speed

### Claude 3.7 Series
- `claude-3-7-sonnet-20250219` - Enhanced Claude 3 variant

### Claude 3.5 Series
- `claude-3-5-sonnet-20241022` - Excellent balance of quality and performance
- `claude-3-5-haiku-20241022` - Fastest response times

### Claude 3 Series
- `claude-3-opus-20240229` - High-quality translations
- `claude-3-haiku-20240307` - Fast and efficient

## Plugin Development

### Key Development Points
- Use `config` object to access user-defined settings (apiUrl, apiKey, model)
- Language codes are mapped through the `language` object in `info.json`
- Implement proper error handling with Chinese-language error messages
- Handle API authentication using Bearer token
- Process Claude API response format (content array structure)

### Translation Function Interface
```javascript
async function translate(text, from, to, options) {
  const { config, utils } = options;
  const { tauriFetch: fetch } = utils;
  const { apiUrl, apiKey, model } = config;
  // Implementation here
}
```

### Error Handling
The plugin includes comprehensive error handling for:
- Missing or invalid configuration parameters
- HTTP status codes (400, 401, 403, 404, 429, 500)
- Network connectivity issues
- Invalid API responses
- Empty translation results

## Build Process

The repository uses GitHub Actions for automated building:
- **On push**: Creates artifacts with packaged plugin (.potext file)
- **On tag**: Creates release with packaged plugin
- **Package format**: ZIP file containing info.json, main.js, and claude.svg, renamed to `plugin.com.pot-app.claude.potext`

### Manual Packaging
1. Create ZIP file with info.json, main.js, and claude.svg
2. Rename to `plugin.com.pot-app.claude.potext` format
3. Install in Pot-App through plugin manager

## Language Support

The plugin supports 45+ languages including:
- Chinese (Simplified/Traditional)
- Major European languages (English, French, German, Spanish, etc.)
- Asian languages (Japanese, Korean, Thai, Vietnamese, etc.)
- Arabic, Hebrew, Hindi, and other global languages

## Configuration Requirements

Users must provide:
1. **API URL**: Usually `https://api.anthropic.com`
2. **API Key**: Valid Claude API key from Anthropic
3. **Model**: Selected from dropdown of supported Claude models

## Documentation Files

- `SUPPORTED_MODELS.md`: Detailed list of supported models with recommendations
- `README.md`: Complete user guide and installation instructions