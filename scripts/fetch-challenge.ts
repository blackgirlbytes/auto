/**
 * Script to fetch challenge markdown from frosty-agent-forge GitHub repository
 * 
 * Usage:
 *   npx tsx scripts/fetch-challenge.ts --day=1
 */

interface ChallengeContent {
  title: string;
  greeting: string;
  description: string;
  fullMarkdown: string;
}

/**
 * Clean markdown text to plain text
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold
    .replace(/\*(.+?)\*/g, '$1')      // Remove italic
    .replace(/\\!/g, '!')             // Remove escaped characters
    .replace(/\\/g, '')               // Remove remaining backslashes
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links but keep text
    .trim();
}

/**
 * Fetch challenge markdown from GitHub
 */
async function fetchChallengeFromGitHub(day: number): Promise<string> {
  try {
    const url = `https://raw.githubusercontent.com/blackgirlbytes/frosty-agent-forge/main/challenges/day${day}.md`;
    console.log(`📡 Fetching challenge from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const markdown = await response.text();
    console.log(`✅ Successfully fetched Day ${day} challenge (${markdown.length} characters)`);
    
    return markdown;
  } catch (error: any) {
    console.error(`❌ Failed to fetch challenge from GitHub:`, error.message);
    throw error;
  }
}

/**
 * Parse challenge markdown to extract key information
 */
function parseChallengeMarkdown(markdown: string, day: number): ChallengeContent {
  try {
    // Extract title (first # heading) - clean it
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? cleanMarkdown(titleMatch[1]) : `Day ${day} Challenge`;
    
    // Extract greeting (## Welcome... heading) - handle both with and without **
    const greetingMatch = markdown.match(/##\s+\*?\*?(.+?)\*?\*?$/m);
    const greeting = greetingMatch ? cleanMarkdown(greetingMatch[1]) : 'Welcome, AI Engineer';
    
    // Extract the story/description paragraphs (after greeting heading, before first ###)
    const storyMatch = markdown.match(/##\s+\*?\*?Welcome[^\n]*\n+([\s\S]*?)(?=\n###)/);
    let description = '';
    
    if (storyMatch && storyMatch[1]) {
      // Get paragraphs, filter out empty lines and separators
      const paragraphs = storyMatch[1]
        .trim()
        .split('\n\n')
        .filter(p => {
          const trimmed = p.trim();
          return trimmed && 
                 !trimmed.startsWith('---') && 
                 !trimmed.startsWith('###') &&
                 trimmed.length > 10; // Skip very short lines
        })
        .map(p => cleanMarkdown(p))
        .filter(p => p.length > 0);
      
      // Take up to 4 paragraphs for a good preview
      description = paragraphs.slice(0, 4).join('\n\n');
    }
    
    // Fallback if we couldn't extract a good description
    if (!description || description.length < 50) {
      description = `Your Day ${day} challenge is now available! Head to the site to see what's in store.`;
    }
    
    return {
      title,
      greeting,
      description,
      fullMarkdown: markdown
    };
  } catch (error: any) {
    console.error(`❌ Error parsing challenge markdown:`, error.message);
    return {
      title: `Day ${day} Challenge`,
      greeting: 'Welcome, AI Engineer',
      description: `Your Day ${day} challenge is now available! Head to the site to see what's in store.`,
      fullMarkdown: markdown
    };
  }
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const dayArg = args.find(arg => arg.startsWith('--day='));
  
  if (!dayArg) {
    console.error('❌ Missing --day argument');
    console.log('Usage: npx tsx scripts/fetch-challenge.ts --day=1');
    process.exit(1);
  }
  
  const day = parseInt(dayArg.split('=')[1]);
  
  if (isNaN(day) || day < 1 || day > 17) {
    console.error('❌ Invalid day number. Must be between 1 and 17');
    process.exit(1);
  }
  
  console.log(`\n🎄 Advent of AI - Challenge Fetcher`);
  console.log(`📅 Fetching Day ${day} challenge...\n`);
  
  try {
    // Fetch markdown from GitHub
    const markdown = await fetchChallengeFromGitHub(day);
    
    // Parse the markdown
    console.log('\n📝 Parsing challenge content...');
    const content = parseChallengeMarkdown(markdown, day);
    
    // Display extracted information
    console.log('\n✅ Challenge content extracted:');
    console.log(`\n📌 Title: ${content.title}`);
    console.log(`👋 Greeting: ${content.greeting}`);
    console.log(`\n📖 Description preview:`);
    console.log(content.description.substring(0, 200) + '...');
    console.log(`\n📄 Full markdown: ${content.fullMarkdown.length} characters`);
    
    console.log('\n✅ Done!\n');
    
    return content;
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Export for use in other scripts
export { fetchChallengeFromGitHub, parseChallengeMarkdown, ChallengeContent };

// Run if called directly
if (require.main === module) {
  main();
}
