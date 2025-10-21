import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import axios from 'axios';
import neo4j from 'neo4j-driver';

const router = Router();

const NEO4J_URI = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASS = process.env.NEO4J_PASS || 'password';
const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));

router.post('/summary', requireAuth, async (req, res, next) => {
  try {
    const { journals, start, end } = req.body;
    const r = await axios.post(process.env.SUMMARY_URL || 'http://localhost:8003/summary', { journals, start, end });
    return res.json(r.data);
  } catch (e) { next(e); }
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

export default router;



