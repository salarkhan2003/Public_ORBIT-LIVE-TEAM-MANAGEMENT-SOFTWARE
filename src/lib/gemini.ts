import { GoogleGenerativeAI } from '@google/generative-ai';

// Load API key from environment variable
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('Missing Google Gemini API key. AI features will not work.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const geminiModel = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

export async function generateTaskSummary(tasks: any[]): Promise<string> {
  // Check if Gemini is available
  if (!geminiModel) {
    return getAIUnavailableMessage();
  }
  
  try {
    if (!tasks || tasks.length === 0) {
      return `TEAM STATUS OVERVIEW:

CURRENT SITUATION:
Your team workspace is ready but no tasks have been created yet. This is a great starting point!

IMMEDIATE RECOMMENDATIONS:
1. CREATE YOUR FIRST PROJECT
   - Define your main objectives
   - Break down goals into manageable projects
   - Set realistic timelines

2. ADD TEAM TASKS
   - Create specific, actionable tasks
   - Assign clear deadlines
   - Distribute work among team members

3. ESTABLISH WORKFLOW
   - Set up regular check-ins
   - Create communication channels
   - Define project milestones

4. ORGANIZE RESOURCES
   - Upload important documents
   - Share project specifications
   - Create knowledge base

NEXT STEPS:
- Start with the "New Project" button
- Invite team members to collaborate
- Set up your first sprint or milestone
- Use AI Assistant for personalized guidance

Ready to boost your team's productivity? Let's get started!`;
    }

    const prompt = `
      Analyze the following team tasks and provide a comprehensive but concise summary:
      ${JSON.stringify(tasks, null, 2)}
      
      Please provide insights in this format:
      
      TEAM PROGRESS OVERVIEW:
      
      CURRENT STATUS:
      - Brief summary of overall progress
      - Key achievements this period
      
      TASK BREAKDOWN:
      - Completed: [number] tasks
      - In Progress: [number] tasks  
      - Pending: [number] tasks
      
      TEAM PERFORMANCE:
      - Identify top performers
      - Note any bottlenecks or delays
      
      RECOMMENDATIONS:
      - 2-3 specific actionable recommendations
      - Priority areas for improvement
      
      UPCOMING FOCUS:
      - Key tasks approaching deadlines
      - Suggested next steps
      
      Keep the response professional, actionable, and under 300 words. Focus on insights that help the team improve productivity.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating task summary:', error);
    return `AI INSIGHTS TEMPORARILY UNAVAILABLE

CURRENT STATUS:
Unable to connect to AI service at the moment. Here's what you can do:

MANUAL REVIEW:
- Check task completion rates
- Review upcoming deadlines  
- Identify overdue items
- Monitor team workload distribution

IMMEDIATE ACTIONS:
1. Review pending tasks and priorities
2. Check for any blocked or overdue items
3. Ensure team members have clear assignments
4. Schedule check-ins for complex projects

PRODUCTIVITY TIPS:
- Break large tasks into smaller chunks
- Set realistic deadlines
- Communicate regularly with team
- Use project milestones to track progress

The AI assistant will be back online shortly to provide detailed insights.`;
  }
}

export async function parseNaturalLanguageCommand(command: string): Promise<any> {
  if (!geminiModel) {
    return { 
      action: 'other', 
      response: 'AI assistant is currently unavailable. Please check your API configuration.'
    };
  }
  
  try {
    const prompt = `
      Parse this natural language command into a structured action object:
      "${command}"
      
      Return a JSON object with these fields:
      {
        "action": "create_task" | "create_project" | "create_meeting" | "get_status" | "get_analytics" | "other",
        "title": "extracted title or null",
        "description": "extracted description or null", 
        "priority": "low" | "medium" | "high" | null,
        "deadline": "YYYY-MM-DD or null",
        "assigned_to": "user name or null",
        "project_name": "project name or null",
        "meeting_time": "time info or null",
        "response": "helpful response for the user"
      }
      
      Examples:
      - "Create a task to review the database design" -> action: "create_task", title: "Review database design"
      - "What's my team's progress?" -> action: "get_status", response: "I'll show you your team's current progress"
      - "Schedule a meeting for tomorrow" -> action: "create_meeting", meeting_time: "tomorrow"
      
      Always provide a helpful response field explaining what action will be taken.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error parsing natural language command:', error);
    return { 
      action: 'other', 
      response: 'I understand you want help with something. Could you please be more specific? I can help you create tasks, projects, meetings, or provide status updates.'
    };
  }
}

export async function generateWeeklyReport(projects: any[], tasks: any[]): Promise<string> {
  if (!geminiModel) {
    return getAIUnavailableMessage();
  }
  
  try {
    const prompt = `
      Generate a professional weekly status report based on this data:
      
      Projects: ${JSON.stringify(projects, null, 2)}
      Tasks: ${JSON.stringify(tasks, null, 2)}
      
      Format the report as follows:
      
      WEEKLY TEAM REPORT
      
      EXECUTIVE SUMMARY:
      [Brief overview of the week's achievements and status]
      
      KEY ACCOMPLISHMENTS:
      • [List major completed items]
      • [Include metrics and numbers]
      
      PROJECT STATUS:
      [For each active project, provide status and progress]
      
      UPCOMING DEADLINES:
      [List items due in next 7 days with dates]
      
      TEAM PERFORMANCE:
      [Highlight team productivity and collaboration]
      
      RISKS & BLOCKERS:
      [Identify any issues that need attention]
      
      NEXT WEEK PRIORITIES:
      [Key focus areas for upcoming week]
      
      Make it professional, data-driven, and actionable for stakeholders.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return `WEEKLY REPORT - ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY:
Report generation temporarily unavailable. Manual review recommended.

KEY METRICS:
- Total Projects: ${projects?.length || 0}
- Total Tasks: ${tasks?.length || 0}
- Completed Tasks: ${tasks?.filter(t => t.status === 'done').length || 0}

MANUAL REVIEW NEEDED:
Please review the dashboard for current project status, task completion rates, and upcoming deadlines.

RECOMMENDATIONS:
1. Check all project timelines
2. Review task assignments
3. Identify any blockers
4. Plan next week's priorities

Contact your team lead for detailed analysis.`;
  }
}

export async function generateProjectSuggestions(userInput: string, teamData: any): Promise<string[]> {
  if (!geminiModel) {
    return getDefaultSuggestions();
  }
  
  try {
    const prompt = `
      Based on this user input: "${userInput}"
      And team data: ${JSON.stringify(teamData, null, 2)}
      
      Generate 3-5 helpful suggestion questions that the user might want to ask about their projects, tasks, or team. 
      
      Return as a JSON array of strings. Examples:
      ["What tasks are due this week?", "Show me project progress", "Who needs help with their tasks?"]
      
      Make suggestions relevant to their current situation and data.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const suggestions = JSON.parse(response.text());
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [
      "What tasks are assigned to me?",
      "Show me this week's deadlines",
      "What's our team's progress?",
      "Create a new task",
      "Schedule a team meeting"
    ];
  }
}

export async function generateSmartResponse(userMessage: string, teamData: any): Promise<string> {
  if (!geminiModel) {
    return getDefaultSmartResponse();
  }
  
  try {
    const prompt = `
      You are ORBIT LIVE TEAM, an intelligent team management assistant. 
      
      User message: "${userMessage}"
      
      Team context:
      - Projects: ${teamData.projects?.length || 0}
      - Tasks: ${teamData.tasks?.length || 0}
      - Team members: ${teamData.members?.length || 0}
      - Recent activity: ${teamData.recentActivity?.length || 0} items
      
      Provide a helpful, specific, and actionable response. If the user is asking about:
      - Tasks: Provide task-related insights and suggestions
      - Projects: Give project status and recommendations
      - Team: Share team performance and collaboration tips
      - Deadlines: Highlight upcoming deadlines and priorities
      - General help: Offer relevant features and capabilities
      
      Keep responses under 200 words, professional, and focused on productivity.
      Include specific numbers and data when available.
      Always end with a helpful suggestion or next step.
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating smart response:', error);
    return `I'm here to help you manage your team more effectively! 

I can assist you with:
• Creating and tracking tasks and projects
• Analyzing team performance and productivity
• Scheduling meetings and deadlines
• Generating reports and insights
• Organizing documents and resources

What would you like to work on today? Try asking me something like:
- "What tasks are due this week?"
- "Show me our team's progress"
- "Create a new project"
- "Schedule a team meeting"

Let me know how I can help boost your team's productivity!`;
  }
}

// Helper functions for when AI is unavailable
function getAIUnavailableMessage(): string {
  return `AI INSIGHTS TEMPORARILY UNAVAILABLE

CURRENT STATUS:
Unable to connect to AI service at the moment. Here's what you can do:

MANUAL REVIEW:
- Check task completion rates
- Review upcoming deadlines  
- Identify overdue items
- Monitor team workload distribution

IMMEDIATE ACTIONS:
1. Review pending tasks and priorities
2. Check for any blocked or overdue items
3. Ensure team members have clear assignments
4. Schedule check-ins for complex projects

PRODUCTIVITY TIPS:
- Break large tasks into smaller chunks
- Set realistic deadlines
- Communicate regularly with team
- Use project milestones to track progress

The AI assistant will be back online shortly to provide detailed insights.`;
}

function getDefaultSuggestions(): string[] {
  return [
    "What tasks are assigned to me?",
    "Show me this week's deadlines",
    "What's our team's progress?",
    "Create a new task",
    "Schedule a team meeting"
  ];
}

function getDefaultSmartResponse(): string {
  return `I'm here to help you manage your team more effectively! 

I can assist you with:
• Creating and tracking tasks and projects
• Analyzing team performance and productivity
• Scheduling meetings and deadlines
• Generating reports and insights
• Organizing documents and resources

What would you like to work on today? Try asking me something like:
- "What tasks are due this week?"
- "Show me our team's progress"
- "Create a new project"
- "Schedule a team meeting"

Let me know how I can help boost your team's productivity!`;
}
