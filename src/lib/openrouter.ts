import axios from 'axios';

export async function summarizeWithOpenRouter(text: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-haiku-20241022',
        messages: [
          {
            role: 'system',
            content: `You are an research expert working in the field for 18 years that creates detailed video summary breakdowns. 
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
            - Provides a 2-3 sentence overview
            - Highlights the main takeaway
            - Uses simple, clear language`
          },
          {
            role: 'user',
            content: text
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in OpenRouter API:', error);
    throw new Error('Failed to generate summary');
  }
}
