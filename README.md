# YouTube Video Transcript Summarizer

This tool fetches transcripts from YouTube videos and generates concise summaries using AI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure API keys:
   - Copy the contents of `.env.example` to a new file named `.env`
   - Get your OpenRouter API key from [OpenRouter](https://openrouter.ai/)
   - Add your API keys to the `.env` file

## Usage

Run the script:
```bash
python summarize_video.py
```

Enter a YouTube video URL or ID when prompted. The script will fetch the transcript and generate a summary.

## Features

- Supports both YouTube URLs and video IDs
- Automatically fetches video transcripts
- Generates concise summaries using AI
- Secure API key management

## Error Handling

The script includes error handling for common issues:
- Invalid YouTube URLs
- Missing transcripts
- API failures
- Rate limiting
