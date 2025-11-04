import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';
import neo4j from 'neo4j-driver';
import JournalLog from '../models/JournalLog.js';
import ChatLog from '../models/ChatLog.js';

const router = Router();

const NEO4J_URI = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || 'password';
const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));

router.post('/summary', requireAuth, async (req, res, next) => {
  try {
    const { journals, start, end } = req.body;

    // If no journals provided, fetch from database based on date range
    let journalEntries = journals;
    let analysisData = {};

    if (!journals || journals.length === 0) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      journalEntries = await JournalLog.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 });

      // Analyze the period
      const emotions = {};
      const keywords = {};
      const sentiments = { positive: 0, negative: 0, neutral: 0 };

      journalEntries.forEach(entry => {
        // Count emotions
        entry.emotions.forEach(emotion => {
          emotions[emotion] = (emotions[emotion] || 0) + 1;
        });

        // Count keywords
        entry.keywords.forEach(keyword => {
          keywords[keyword] = (keywords[keyword] || 0) + 1;
        });

        // Count sentiments
        if (entry.sentiment) {
          sentiments[entry.sentiment] = (sentiments[entry.sentiment] || 0) + 1;
        }
      });

      analysisData = {
        totalEntries: journalEntries.length,
        dateRange: { start, end },
        emotions,
        keywords,
        sentiments,
        avgWordsPerEntry: journalEntries.length > 0 ?
          Math.round(journalEntries.reduce((sum, entry) => sum + entry.content.split(' ').length, 0) / journalEntries.length) : 0
      };
    }

    // Generate AI-powered summary using summary service
    let aiSummary = '';
    let keyFindings = [];

    try {
      const summaryResponse = await axios.post(process.env.SUMMARY_URL || 'http://localhost:8003/summary', {
        journals: journalEntries.map(entry => ({
          content: entry.content,
          date: entry.date.toISOString().split('T')[0],
          emotions: entry.emotions,
          keywords: entry.keywords,
          sentiment: entry.sentiment
        })),
        start,
        end,
        emotions: analysisData.emotions,
        keywords: analysisData.keywords,
        sentiments: analysisData.sentiments
      });

      aiSummary = summaryResponse.data.summary || 'Summary generation completed.';
      keyFindings = summaryResponse.data.keyFindings || [];
    } catch (e) {
      console.error('Summary service error:', e);
      // Fallback summary
      aiSummary = `During your journaling journey from ${start} to ${end}, you created ${journalEntries.length} entries exploring various emotions and themes. Your consistent practice of self-reflection is a valuable step in your mental wellness journey.`;
      keyFindings = [
        'Consistent journaling practice shows commitment to self-reflection',
        'Emotional exploration indicates growing self-awareness',
        'Regular reflection supports mental wellness goals'
      ];
    }

    res.json({
      aiSummary,
      analysisData,
      keyFindings
    });
  } catch (e) { next(e); }
});

// New prompts endpoint
router.get('/prompts', requireAuth, async (req, res, next) => {
  try {
    const { tags } = req.query;
    const tagArray = tags ? tags.split(',') : [];

    // Get user's recent journal entries for context
    const recentEntries = await JournalLog.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(10);

    // Extract common themes
    const allKeywords = recentEntries.flatMap(entry => entry.keywords || []);
    const keywordCounts = {};
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });

    const topKeywords = Object.keys(keywordCounts).slice(0, 5);

    // Generate contextual prompts based on user's journaling patterns
    const prompts = [
      { text: 'What made you smile today?', category: 'Reflection' },
      { text: 'Describe a moment when you felt proud of yourself.', category: 'Achievement' },
      { text: 'What are you grateful for right now?', category: 'Gratitude' },
      { text: 'What challenge did you overcome today?', category: 'Resilience' },
      { text: 'How did you take care of yourself today?', category: 'Self-care' },
    ];

    // Add contextual prompts based on tags/keywords
    if (tagArray.length > 0 || topKeywords.length > 0) {
      const contextTags = tagArray.length > 0 ? tagArray : topKeywords;
      prompts.push(
        { text: `Reflect on your experiences with ${contextTags[0] || 'this topic'}.`, category: 'Contextual' },
        { text: `How has ${contextTags[0] || 'this'} affected your mood recently?`, category: 'Contextual' }
      );
    }

    // Add prompts based on recent emotions
    const recentEmotions = recentEntries.flatMap(entry => entry.emotions || []);
    if (recentEmotions.length > 0) {
      const emotionCounts = {};
      recentEmotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
      const topEmotion = Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0];
      prompts.push(
        { text: `Explore your feelings about ${topEmotion.toLowerCase()}.`, category: 'Emotional' }
      );
    }

    res.json({ prompts: prompts.slice(0, 8) });
  } catch (e) {
    console.error('Prompts error:', e);
    // Fallback prompts
    res.json({
      prompts: [
        { text: 'What made you smile today?', category: 'Reflection' },
        { text: 'Describe a moment when you felt proud of yourself.', category: 'Achievement' },
        { text: 'What are you grateful for right now?', category: 'Gratitude' },
        { text: 'What challenge did you overcome today?', category: 'Resilience' },
        { text: 'How did you take care of yourself today?', category: 'Self-care' },
      ]
    });
  }
});

router.get('/graph', requireAuth, async (req, res, next) => {
  const session = driver.session();
  try {
    const queries = {
      topAnxietyTriggers: `MATCH (e:Emotion {name:"Anxiety"})<-[:has_emotion]-(j:JournalEntry)-[:mentions]->(a:Activity)
                           RETURN a.name as activity, count(*) as count ORDER BY count DESC LIMIT 5`,
      happinessActivities: `MATCH (e:Emotion {name:"Joy"})<-[:has_emotion]-(j:JournalEntry)-[:mentions]->(a:Activity)
                           RETURN a.name as activity, count(*) as count ORDER BY count DESC LIMIT 5`,
      stabilizingHabits: `MATCH (h:Habit)-[:improves]->(e:Emotion {name:"Calm"})
                           RETURN h.name as habit, 1 as score LIMIT 5`,
    };
    const [r1, r2, r3] = await Promise.all([
      session.run(queries.topAnxietyTriggers),
      session.run(queries.happinessActivities),
      session.run(queries.stabilizingHabits),
    ]);
    res.json({
      topTriggersForAnxiety: r1.records.map(r=>({ activity: r.get('activity'), count: r.get('count').toNumber?.() || r.get('count') })),
      activitiesLinkedToHappiness: r2.records.map(r=>({ activity: r.get('activity'), count: r.get('count').toNumber?.() || r.get('count') })),
      habitsImprovingStability: r3.records.map(r=>({ habit: r.get('habit'), score: r.get('score') })),
    });
  } catch (e) { next(e); }
  finally { await session.close(); }
});

// New moodboard endpoint
router.get('/moodboard', requireAuth, async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Fetch journal entries
    const journalEntries = await JournalLog.find({
      userId: req.userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Fetch chat logs
    const chatLogs = await ChatLog.find({
      userId: req.userId,
      updatedAt: { $gte: startDate }
    });

    // Process journal data
    const moodTimeline = journalEntries.map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      sentiment: entry.sentiment,
      emotions: entry.emotions,
      keywords: entry.keywords
    }));

    // Aggregate emotions
    const emotionCounts = {};
    journalEntries.forEach(entry => {
      entry.emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });
    const emotionData = Object.entries(emotionCounts).map(([name, value]) => ({ name, value }));

    // Aggregate keywords for word cloud
    const keywordCounts = {};
    journalEntries.forEach(entry => {
      entry.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });
    const wordCloudData = Object.entries(keywordCounts).map(([text, value]) => ({ text, value }));

    // Chat insights
    const chatStats = {
      totalConversations: chatLogs.length,
      personaUsage: {},
      recentTopics: []
    };

    chatLogs.forEach(chat => {
      chatStats.personaUsage[chat.persona] = (chatStats.personaUsage[chat.persona] || 0) + 1;

      // Extract topics from recent messages
      const recentMessages = chat.messages.slice(-5);
      recentMessages.forEach(msg => {
        if (msg.role === 'user') {
          const words = msg.text.toLowerCase().split(/\s+/);
          chatStats.recentTopics.push(...words.filter(w => w.length > 3));
        }
      });
    });

    // Calculate consistency score
    const totalDays = parseInt(days);
    const journalDays = new Set(journalEntries.map(e => e.date.toISOString().split('T')[0])).size;
    const consistencyScore = Math.round((journalDays / totalDays) * 100);

    // Generate AI insights
    let aiInsights = [];
    try {
      const insightsPrompt = `Based on this user's data from the last ${days} days:

Journal entries: ${journalEntries.length}
Most common emotions: ${Object.keys(emotionCounts).join(', ')}
Consistency score: ${consistencyScore}%
Chat conversations: ${chatLogs.length}

Generate 2-3 personalized insights about their mental wellness patterns. Keep each insight to 1-2 sentences. Focus on positive observations and gentle suggestions.`;

      const insightsResponse = await axios.post(process.env.CHAT_URL || 'http://localhost:8002/chat', {
        message: insightsPrompt,
        persona: 'psychologist',
        history: []
      });

      aiInsights = insightsResponse.data.reply.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
    } catch (e) {
      aiInsights = [
        "You've been consistently journaling - that's a great sign of self-awareness!",
        "Your emotional landscape shows healthy variety, which is normal and positive.",
        "Consider reflecting on what activities bring you the most peace."
      ];
    }

    res.json({
      moodTimeline,
      emotionData,
      wordCloudData,
      chatStats,
      consistencyScore,
      aiInsights,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        days: parseInt(days)
      }
    });

  } catch (e) {
    console.error('Moodboard error:', e);
    next(e);
  }
});

export default router;
