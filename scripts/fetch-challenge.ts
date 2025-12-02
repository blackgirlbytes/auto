import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface ChallengeContent {
  day: number;
  title: string;
  markdown: string;
  htmlContent: string;
}

/**
 * Fetch challenge markdown from frosty-agent-forge repository
 * @param day - The day number (1-25)
 * @returns Challenge content with markdown and HTML
 */
async function fetchChallenge(day: number): Promise<ChallengeContent> {
  const owner = process.env.GITHUB_REPO_OWNER || 'your-username';
  const repo = process.env.GITHUB_REPO_NAME || 'frosty-agent-forge';
  
  // Construct the path to the challenge file
  // Adjust this path based on your actual repository structure
  const filePath = `challenges/day-${day.toString().padStart(2, '0')}.md`;
  
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
  
  console.log(`Fetching challenge for day ${day} from: ${url}`);

  try {
    const headers: Record<string, string> = {};
    
    // Add GitHub token if available (for private repos or higher rate limits)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(url, { headers });
    const markdown = response.data;

    // Extract title from markdown (first # heading)
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Day ${day} Challenge`;

    // Convert markdown to basic HTML
    const htmlContent = convertMarkdownToHTML(markdown);

    console.log(`✅ Successfully fetched challenge for day ${day}`);

    return {
      day,
      title,
      markdown,
      htmlContent,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Challenge for day ${day} not found at ${url}`);
      }
      throw new Error(`Failed to fetch challenge: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Simple markdown to HTML converter
 * For production, consider using a library like 'marked'
 */
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = `<p>${html}</p>`;

  return html;
}

/**
 * Get the current day of Advent (1-25)
 * Assumes Advent runs December 1-25
 */
function getCurrentAdventDay(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed (11 = December)
  const day = now.getDate();

  // Only return day if we're in December and between 1-25
  if (month === 11 && day >= 1 && day <= 25) {
    return day;
  }

  // For testing outside of December, return a default
  console.warn('Not currently in Advent period (Dec 1-25), using day 1 for testing');
  return 1;
}

// Run if called directly
if (require.main === module) {
  const dayArg = process.argv[2];
  const day = dayArg ? parseInt(dayArg, 10) : getCurrentAdventDay();

  if (isNaN(day) || day < 1 || day > 25) {
    console.error('Invalid day number. Must be between 1 and 25');
    process.exit(1);
  }

  fetchChallenge(day)
    .then((challenge) => {
      console.log('\n--- Challenge Content ---');
      console.log(`Day: ${challenge.day}`);
      console.log(`Title: ${challenge.title}`);
      console.log('\nMarkdown Preview (first 200 chars):');
      console.log(challenge.markdown.substring(0, 200) + '...');
    })
    .catch((error) => {
      console.error('Failed to fetch challenge:', error.message);
      process.exit(1);
    });
}

export { fetchChallenge, getCurrentAdventDay };
