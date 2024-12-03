from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import requests
from summarize_video import extract_video_id, get_transcript, summarize_with_openrouter
from datetime import datetime

app = Flask(__name__)
load_dotenv()

def get_video_info(video_id):
    """Get video title and thumbnail from YouTube Data API"""
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={api_key}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'items' in data and len(data['items']) > 0:
            snippet = data['items'][0]['snippet']
            return {
                'title': snippet['title'],
                'thumbnail': snippet['thumbnails']['high']['url']
            }
    except Exception as e:
        print(f"Error fetching video info: {e}")
    
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'No URL provided'})

    try:
        video_id = extract_video_id(url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'})

        # Get transcript
        transcript = get_transcript(video_id)
        if not transcript:
            return jsonify({'error': 'Failed to get video transcript'})

        # Get video info
        video_info = get_video_info(video_id)
        if not video_info:
            return jsonify({'error': 'Failed to get video information'})

        # Generate summary
        summary = summarize_with_openrouter(transcript)
        if not summary:
            return jsonify({'error': 'Failed to generate summary'})

        response_data = {
            'videoId': video_id,
            'url': url,
            'title': video_info['title'],
            'thumbnail': video_info['thumbnail'],
            'summary': summary,
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in summarize endpoint: {str(e)}")  # Debug log
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
