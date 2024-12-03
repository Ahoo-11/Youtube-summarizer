from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import requests
from summarize_video import extract_video_id, get_transcript, summarize_with_openrouter, get_video_comments
from datetime import datetime

app = Flask(__name__)
load_dotenv()

def get_video_info(video_id):
    """Get video title, thumbnail, and channel info from YouTube Data API"""
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet&id={video_id}&key={api_key}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'items' in data and len(data['items']) > 0:
            snippet = data['items'][0]['snippet']
            return {
                'title': snippet['title'],
                'thumbnail': snippet['thumbnails']['high']['url'],
                'channelTitle': snippet['channelTitle'],
                'channelId': snippet['channelId']
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

        # Get top comments
        comments = get_video_comments(video_id)

        # Generate transcript summary
        transcript_summary = summarize_with_openrouter(transcript)
        if not transcript_summary:
            return jsonify({'error': 'Failed to generate summary'})

        response_data = {
            'videoId': video_id,
            'url': url,
            'title': video_info['title'],
            'thumbnail': video_info['thumbnail'],
            'channelTitle': video_info['channelTitle'],
            'channelId': video_info['channelId'],
            'summary': transcript_summary,
            'comments': comments,
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error in summarize endpoint: {str(e)}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
