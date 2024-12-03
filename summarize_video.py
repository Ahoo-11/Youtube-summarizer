import os
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
import requests
import json
import time

# Constants
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
APP_NAME = 'YouTube Summary Generator'
APP_URL = 'http://localhost:3000'

# Rate limiting
REQUEST_WINDOW_MS = 10000  # 10 seconds
MAX_REQUESTS_PER_WINDOW = 45
request_timestamps = []

def wait_for_rate_limit():
    """Implement rate limiting"""
    now = time.time() * 1000  # Convert to milliseconds
    global request_timestamps
    
    # Remove old timestamps
    request_timestamps = [ts for ts in request_timestamps if now - ts < REQUEST_WINDOW_MS]
    
    if len(request_timestamps) >= MAX_REQUESTS_PER_WINDOW:
        oldest_timestamp = request_timestamps[0]
        wait_time = oldest_timestamp + REQUEST_WINDOW_MS - now
        if wait_time > 0:
            time.sleep(wait_time / 1000)  # Convert back to seconds
            request_timestamps = request_timestamps[1:]
    
    request_timestamps.append(now)

def extract_video_id(url):
    """Extract video ID from YouTube URL."""
    if "youtube.com/watch?v=" in url:
        return url.split("watch?v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return url

def get_transcript(video_id):
    """Get transcript for a YouTube video."""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join([entry['text'] for entry in transcript_list])
    except Exception as e:
        print(f"Error getting transcript: {e}")
        return None

def summarize_with_openrouter(transcript_text):
    try:
        # Convert transcript to a single string if it's a list
        if isinstance(transcript_text, list):
            full_transcript = ' '.join([entry['text'] for entry in transcript_text])
        else:
            full_transcript = transcript_text

        # Updated system prompt with detailed requirements
        system_prompt = """You are an research expert working in the field for 18 years that creates detailed video summary breakdowns. 
        Please provide a clear, well-structured breakdown of the key points from the video, following these guidelines:

        1. Main Breakdown:
        - Focus on delivering the information promised in the title
        - For tutorial videos: outline specific steps and instructions
        - For review videos: include pros, cons, and overall conclusions
        - Extract and highlight:
          * Important conclusions
          * Key facts and information
          * Statistics and numerical data
          * Relevant dates
          * Names and references mentioned
        - Organize information in a clear, list format for easy reference
        - Adjust break down length based on information density
        - Ensure all significant details are captured
        - Use markdown formatting for better readability
        - Expert Opinion (Required): You should add these at the end of each breakdowns like if video as 7 breakdown points you need to give your opnion on each one.
            - Share your analysis of the content, tell me what you learn from that particular breakdown.
            - Point out any limitations or areas for further exploration    
            - Make sure to label as Expert opinion under each breakdown where you write the expert openion.

        2. Simple Summary (Required):
        End with a section labeled "## Simple Summary" that:
        - Explains the key takeaways in simple terms (6th-grade level)
        - Uses everyday language and clear examples
        - Avoids technical jargon
        - Focuses on practical understanding
        - Keeps it brief (2-3 sentences)

        Important: Do not generate or include any title or heading at the start of the summary. The video's original title will be used."""

        # Make API request
        response = requests.post(
            OPENROUTER_API_URL,  # Use the constant defined at the top
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "HTTP-Referer": APP_URL,  # Use the constant defined at the top
                "Content-Type": "application/json",
                "X-Title": APP_NAME  # Add application name to headers
            },
            json={
                "model": "anthropic/claude-3.5-haiku-20241022",  # Do not change this model
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Please analyze and break down the following video transcript, following the guidelines above:\n\n{full_transcript}"}
                ]
            }
        )

        # Debug logging
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_text = response.text
            print(f"Raw Response: {response_text[:500]}...")  # Print first 500 chars of response
            
            if response.status_code != 200:
                print(f"API Error: {response.status_code} - {response_text}")
                return None

            response_data = response.json()
            
            if 'choices' in response_data and len(response_data['choices']) > 0:
                summary = response_data['choices'][0]['message']['content']
                return summary
            else:
                print(f"Unexpected response structure: {response_data}")
                return None

        except json.JSONDecodeError as json_err:
            print(f"JSON Decode Error: {json_err}")
            print(f"Response content: {response_text}")
            return None

    except Exception as e:
        print(f"Error in summarize_with_openrouter: {str(e)}")
        return None

def main():
    # Load environment variables
    load_dotenv()
    
    # Get video URL from user
    url = input("Enter YouTube video URL or ID: ")
    print()
    
    # Get video ID
    video_id = extract_video_id(url)
    print(f"Fetching transcript for video ID: {video_id}")
    
    # Get transcript
    transcript = get_transcript(video_id)
    if not transcript:
        print("Failed to get transcript.")
        return
    
    print(f"Transcript length: {len(transcript)} characters\n")
    
    # Generate summary
    summary = summarize_with_openrouter(transcript)
    
    if summary:
        print("\nSummary:")
        print("-" * 80)
        print(summary)
        print("-" * 80)
    else:
        print("\nFailed to generate summary.")

def test_openrouter_connection():
    load_dotenv()
    api_key = os.getenv('OPENROUTER_API_KEY')
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test with a minimal request
    payload = {
        "model": "anthropic/claude-2",
        "messages": [
            {"role": "user", "content": "Hello, this is a test."}
        ]
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Connection Error: {e}")
        return False

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

def get_video_comments(video_id, max_comments=100):
    """Fetch comments for a YouTube video"""
    api_key = os.getenv('YOUTUBE_API_KEY')
    url = f'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={video_id}&maxResults={max_comments}&key={api_key}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'items' in data:
            comments = []
            for item in data['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'text': comment['textDisplay'],
                    'author': comment['authorDisplayName'],
                    'likes': comment['likeCount'],
                    'publishedAt': comment['publishedAt']
                })
            
            # Sort comments by likes and get top 15
            comments.sort(key=lambda x: x['likes'], reverse=True)
            return comments[:15]
    except Exception as e:
        print(f"Error fetching comments: {e}")
    
    return []

if __name__ == "__main__":
    main()
