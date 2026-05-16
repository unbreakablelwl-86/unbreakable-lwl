import type { Unit } from '../types';
import ch1ScienceOfFocus from '@/assets/university/mindl2-u3-ch1-science-of-focus.png';
import ch2DisciplineVsMotivation from '@/assets/university/mindl2-u3-ch2-discipline-vs-motivation.png';
import ch3HabitFormation from '@/assets/university/mindl2-u3-ch3-habit-formation.png';
import ch4EmotionalRegulation from '@/assets/university/mindl2-u3-ch4-emotional-regulation.png';
import ch5Visualisation from '@/assets/university/mindl2-u3-ch5-visualisation.png';
import ch6DopamineLoop from '@/assets/university/mindl2-u3-ch6-dopamine-loop.png';


export const mindsetL2Unit3: Unit = {
  number: 3,
  title: 'Focus, Discipline & Habit Formation',
  description: 'Develop the practical skills of sustained focus, self-discipline, and habit formation — the building blocks of consistent performance in any area of life.',
  chapters: [
    {
      number: 1,
      title: 'The Science of Focus',
      learningOutcome: 'Understand the neuroscience of attention, the impact of distraction, and strategies for improving sustained focus.',
      assessmentCriteria: [
        'Describe how attention works in the brain and its limitations',
        'Explain the cost of multitasking and context switching',
        'Identify practical strategies for improving focus in daily life',
      ],
      content: [
        {
          heading: 'Attention Is a Limited Resource',
          paragraphs: [
            'Your brain has a finite capacity for focused attention. The prefrontal cortex — responsible for executive function, decision-making, and sustained attention — operates like a battery that depletes with use. Every decision, every task switch, and every distraction drains this resource.',
            'This is why you make poorer decisions at the end of a long day and why "willpower" seems to evaporate by evening. Understanding that focus is a depletable resource changes how you structure your day — you protect your best attention for your most important work.',
          ],
          imageUrl: ch1ScienceOfFocus,
          imageAlt: 'Focus science diagram showing attention depletion across the day',
        },
        {
          heading: 'The Myth of Multitasking',
          paragraphs: [
            'True multitasking — performing two cognitively demanding tasks simultaneously — is neurologically impossible. What people call multitasking is actually rapid task switching, and each switch incurs a cognitive cost: it takes an average of 23 minutes to fully refocus after a distraction.',
            'The constant switching between email, messages, social media, and actual work creates a state of continuous partial attention that dramatically reduces the quality and speed of everything you do. You feel busy — but you are producing less than if you focused on one thing at a time.',
          ],
        },
        {
          heading: 'Strategies for Better Focus',
          bullets: [
            'Time blocking — Dedicate specific blocks of time to single tasks. Protect these blocks from interruption',
            'Phone management — Put your phone in another room during focused work. Out of sight reduces the temptation to check it',
            'The two-minute rule — If a task takes less than two minutes, do it immediately. If not, schedule it. This prevents small tasks from fragmenting your attention',
            'Single-tasking — Commit to one task at a time. Close unnecessary tabs, silence notifications, and work until the block is complete',
            'Strategic breaks — Work in 25–50 minute blocks with 5–10 minute breaks (Pomodoro technique). Breaks restore attention capacity',
          ],
        },
      ],
      unbreakableInsight: 'You do not have a focus problem — you have a distraction problem. Your phone, your notifications, and your open browser tabs are stealing hours of productive attention every single day.',
      coachNote: 'Try one day of phone-free mornings — do not check your phone for the first hour after waking. Use that hour for your most important task. Most people are shocked by how much they accomplish.',
      practicalTask: {
        title: 'Focus Audit',
        instructions: 'Track every distraction and task switch during one working day. Note the time, the distraction source, and how long it took to refocus. At the end of the day, calculate your total focused work time versus total available time.',
        reflectionQuestions: [
          'How much of your day was truly focused versus fragmented?',
          'What were the three biggest sources of distraction?',
          'Which distractions are within your control to eliminate?',
        ],
      },
    },
    {
      number: 2,
      title: 'Discipline vs Motivation',
      learningOutcome: 'Understand why discipline is more reliable than motivation and how to build systems that reduce reliance on willpower.',
      assessmentCriteria: [
        'Explain why motivation is unreliable as a long-term driver of behaviour',
        'Describe how environment design reduces the need for willpower',
        'Discuss the concept of identity-based habits',
      ],
      content: [
        {
          heading: 'The Problem with Motivation',
          paragraphs: [
            'Motivation is an emotion — and like all emotions, it fluctuates. Some days you feel driven, energised, and ready to conquer the world. Other days you feel flat, tired, and would rather stay in bed. If your system for getting things done depends on feeling motivated, it will fail every time motivation dips.',
            'This is not a personal failing — it is the nature of motivation. It is useful for starting something new but unreliable for sustaining it. The people who consistently perform at a high level do not have more motivation than you — they have better systems that operate regardless of how they feel.',
          ],
          imageUrl: ch2DisciplineVsMotivation,
          imageAlt: 'Motivation fluctuation versus discipline consistency graph',
        },
        {
          heading: 'Environment Design',
          paragraphs: [
            'The most effective strategy for consistent behaviour is designing your environment so that the desired action is the easiest option. This reduces the willpower required to make good choices because the environment does the heavy lifting.',
            'Want to train in the morning? Sleep in your gym clothes and put your trainers by the door. Want to eat better? Do not keep junk food in the house. Want to journal daily? Leave the notebook open on your bedside table. These small environmental changes are more powerful than any amount of motivational content.',
          ],
        },
        {
          heading: 'Identity-Based Habits',
          paragraphs: [
            'James Clear\'s concept of identity-based habits shifts the focus from "what do I want to achieve?" to "who do I want to become?" Instead of "I want to run a marathon" (outcome), you ask "what would a runner do?" (identity). A runner trains consistently, even on days they do not feel like it. A runner prioritises sleep and nutrition. A runner enters races.',
            'When you adopt the identity first, the behaviours follow naturally. You are not forcing yourself to do something you dislike — you are acting consistently with who you are. This is far more sustainable than willpower-driven compliance.',
          ],
          bullets: [
            'Outcome-based — "I want to lose weight" → dependent on results to stay motivated',
            'Identity-based — "I am someone who takes care of their body" → behaviours flow from self-concept',
            'Every action is a vote for the type of person you want to become',
            'Start with small wins that reinforce the identity — each one makes the next one easier',
          ],
        },
      ],
      unbreakableInsight: 'You will never feel like doing the hard thing every day. Discipline means doing it anyway — not because you are motivated, but because it is who you are. Stop waiting to feel like it. Start acting like the person you want to become.',
      coachNote: 'Pick one identity statement and write it on a card you see daily: "I am someone who trains consistently," "I am someone who prepares their meals," "I am someone who keeps their word." Act accordingly — even when you do not feel like it.',
      practicalTask: {
        title: 'Environment Design Sprint',
        instructions: 'Choose one behaviour you want to be more consistent with. Make three environmental changes that make this behaviour easier and three that make competing behaviours harder. Implement all six changes today.',
        reflectionQuestions: [
          'How did the environmental changes affect your follow-through over the next few days?',
          'Which changes had the biggest impact with the least effort?',
          'What identity statement would you associate with this behaviour?',
        ],
      },
    },
    {
      number: 3,
      title: 'Habit Formation Science',
      learningOutcome: 'Understand the neuroscience of habit formation and apply evidence-based strategies to build and break habits effectively.',
      assessmentCriteria: [
        'Describe the habit loop (cue, routine, reward) and its neurological basis',
        'Explain the concept of habit stacking and implementation intentions',
        'Discuss strategies for breaking unwanted habits',
      ],
      content: [
        {
          heading: 'The Habit Loop',
          paragraphs: [
            'Every habit follows a neurological pattern: cue → routine → reward. A cue triggers the behaviour (your alarm goes off), the routine is the behaviour itself (you go to the gym), and the reward reinforces the loop (endorphins, sense of accomplishment). Over time, this loop becomes automatic — the basal ganglia takes over from the prefrontal cortex, requiring less conscious effort.',
            'This is why habits are so powerful — once established, they operate on autopilot. The challenge is building the loop in the first place, which requires conscious repetition for approximately 4–8 weeks until the basal ganglia encodes the pattern.',
          ],
          imageUrl: ch3HabitFormation,
          imageAlt: 'Habit loop diagram showing cue, routine, and reward',
        },
        {
          heading: 'Building New Habits',
          bullets: [
            'Start absurdly small — "Do one press-up" not "Do a full workout." Small starts reduce resistance and build the neural pathway',
            'Attach to existing habits (habit stacking) — "After I pour my morning coffee, I will write in my journal for 2 minutes"',
            'Make it obvious — Visual cues increase follow-through. Leave your gym bag by the door, your journal on the pillow, your water bottle on your desk',
            'Make it satisfying — Immediate rewards reinforce the loop. Tick a habit tracker, allow yourself a small treat, or simply acknowledge the completion',
            'Never miss twice — Missing one day does not break a habit. Missing two consecutive days starts a new pattern of not doing it',
          ],
        },
        {
          heading: 'Breaking Unwanted Habits',
          paragraphs: [
            'Breaking a habit is harder than building one because the neural pathway already exists — it does not disappear, it simply weakens with disuse. The most effective approach is to identify the cue, keep the reward, but replace the routine with a healthier alternative.',
            'If your habit is scrolling social media when you feel bored (cue: boredom, routine: scrolling, reward: stimulation), replace the routine with something that provides similar stimulation — reading, a puzzle, a short walk. The cue and reward stay the same; only the behaviour changes.',
          ],
        },
      ],
      unbreakableInsight: 'You do not rise to the level of your goals — you fall to the level of your systems. Your habits are your systems. Build better habits and you build a better life, automatically.',
      coachNote: 'Use a simple habit tracker — a physical calendar where you cross off each day you complete the habit. The visual streak becomes its own motivation. Protect the streak, but if you break it, start a new one immediately.',
      practicalTask: {
        title: 'Habit Building Challenge',
        instructions: 'Choose one small habit you want to build. Define the cue, routine, and reward. Make it absurdly easy to start (2 minutes or less). Track it daily for 14 days using a physical habit tracker.',
        reflectionQuestions: [
          'Did the habit feel more automatic by day 14?',
          'What was the hardest day and what made it difficult?',
          'How could you make the habit even easier to maintain long-term?',
        ],
      },
    },
    {
      number: 4,
      title: 'Emotional Regulation',
      learningOutcome: 'Learn practical techniques for managing emotional responses, reducing reactivity, and maintaining composure under pressure.',
      assessmentCriteria: [
        'Describe the difference between emotional suppression and emotional regulation',
        'Explain the cognitive reappraisal technique',
        'Apply the STOP method in high-pressure situations',
      ],
      content: [
        {
          heading: 'Regulation Is Not Suppression',
          paragraphs: [
            'Emotional regulation is the ability to influence which emotions you have, when you have them, and how you experience and express them. It is not about suppressing emotions — research consistently shows that suppression increases physiological stress, impairs memory, and damages relationships.',
            'Effective regulation means processing emotions consciously rather than being controlled by them. You still feel anger, frustration, fear, and sadness — but you create space between the emotion and your response, allowing you to choose how to act rather than reacting automatically.',
          ],
          imageUrl: ch4EmotionalRegulation,
          imageAlt: 'Stimulus-space-response emotional regulation diagram',
        },
        {
          heading: 'Cognitive Reappraisal',
          paragraphs: [
            'Cognitive reappraisal is the most researched and effective emotional regulation strategy. It involves changing how you interpret a situation to change how you feel about it — not denying reality, but choosing a more constructive perspective.',
            'Example: You fail a lift at the gym. Automatic thought: "I am weak and pathetic." Reappraisal: "I pushed to my limit today, which is exactly how I get stronger. Now I know where my current max is." The facts have not changed — your interpretation has, and with it, your emotional response.',
          ],
        },
        {
          heading: 'The STOP Method',
          paragraphs: [
            'When emotions are running high, use the STOP method to create space before responding:',
          ],
          bullets: [
            'S — Stop. Literally pause. Do not speak, do not act, do not type a response',
            'T — Take a breath. Three slow, deep breaths activate the parasympathetic nervous system',
            'O — Observe. Notice what you are feeling without judgement. Name the emotion: "I am feeling angry"',
            'P — Proceed. Now choose your response consciously rather than reactively',
          ],
        },
      ],
      unbreakableInsight: 'Between stimulus and response, there is a space. In that space lies your freedom and your power. The person who masters that space masters themselves.',
      coachNote: 'Practise naming your emotions out loud: "I notice I am feeling frustrated." This simple act of labelling activates the prefrontal cortex and reduces the intensity of the emotion. Neuroscience calls this "affect labelling."',
      practicalTask: {
        title: 'Emotional Regulation Practice',
        instructions: 'For one week, whenever you notice a strong emotional reaction, apply the STOP method. Journal each instance: what triggered it, what you felt, what you did, and whether the outcome was different from your usual reactive response.',
        reflectionQuestions: [
          'Were you able to create space between the trigger and your response?',
          'Did naming the emotion reduce its intensity?',
          'Which situations were hardest to apply the STOP method to?',
        ],
      },
    },
    {
      number: 5,
      title: 'Visualisation & Mental Rehearsal',
      learningOutcome: 'Understand the evidence behind mental rehearsal and learn to use visualisation as a practical performance tool.',
      assessmentCriteria: [
        'Explain the neuroscience behind why visualisation improves performance',
        'Describe the difference between outcome visualisation and process visualisation',
        'Apply a structured visualisation protocol to a specific goal',
      ],
      content: [
        {
          heading: 'Why Visualisation Works',
          paragraphs: [
            'Mental rehearsal — vividly imagining yourself performing an action — activates many of the same neural pathways as physically performing it. Brain imaging studies show that visualising a movement produces activity in the motor cortex, premotor cortex, and supplementary motor area — the same regions active during actual movement.',
            'This is not pseudoscience or "manifesting." It is established neuroscience used by elite athletes, surgeons, musicians, and military operators. Visualisation does not replace physical practice, but it enhances it — improving motor learning, confidence, and performance under pressure.',
          ],
          imageUrl: ch5Visualisation,
          imageAlt: 'Brain activity comparison between movement and mental rehearsal',
        },
        {
          heading: 'Process vs Outcome Visualisation',
          paragraphs: [
            'Outcome visualisation — imagining the end result (standing on the podium, hitting a personal record) — can boost motivation but does not improve performance by itself. Research shows it can actually reduce effort by creating a premature sense of achievement.',
            'Process visualisation — imagining the steps, sensations, and actions required to achieve the outcome — is far more effective. Instead of imagining crossing the marathon finish line, visualise maintaining your pace at mile 20, controlling your breathing on hills, and staying mentally focused when fatigue sets in.',
          ],
        },
        {
          heading: 'A Practical Visualisation Protocol',
          bullets: [
            'Find a quiet space and close your eyes. Take 5 slow breaths to settle your nervous system',
            'Choose one specific scenario you want to prepare for (a competition, a presentation, a difficult conversation)',
            'Visualise the entire process in vivid, first-person detail — what you see, hear, feel, and do',
            'Include challenges — visualise yourself encountering difficulty and responding effectively',
            'Feel the emotions — confidence, focus, determination. Make the visualisation as real as possible',
            'Duration — 5–10 minutes per session. Practise 3–5 times before the event',
          ],
        },
      ],
      unbreakableInsight: 'Visualisation is not daydreaming — it is deliberate mental practice. The difference is specificity and engagement. Imagining "being successful" does nothing. Imagining the exact steps, sensations, and challenges of your next performance changes your brain.',
      coachNote: 'Before your next training session, spend 3 minutes visualising your warm-up, your working sets, and how you will handle the hardest moments. Notice whether this preparation changes your actual performance.',
      practicalTask: {
        title: 'Visualisation Session',
        instructions: 'Choose an upcoming challenge (training session, competition, presentation). Complete a 5-minute process visualisation session daily for five consecutive days before the event. After the event, compare your performance to previous similar events.',
        reflectionQuestions: [
          'How vivid were you able to make the visualisation?',
          'Did visualising challenges in advance help you respond to them during the actual event?',
          'How did your confidence and composure compare to events you did not prepare for mentally?',
        ],
      },
    },
    {
      number: 6,
      title: 'Digital Detox & Attention Management',
      learningOutcome: 'Understand how digital technology affects attention, focus, and mental health, and develop practical strategies for managing screen time and digital consumption.',
      assessmentCriteria: [
        'Explain how social media and digital notifications fragment attention and impact cognitive performance',
        'Describe the dopamine reward cycle created by smartphones and how it differs from natural reward systems',
        'Create a personal digital boundaries plan that protects deep focus without eliminating technology entirely',
      ],
      content: [
        {
          heading: 'The Attention Crisis',
          paragraphs: [
            'The average person checks their phone 96 times a day — roughly once every 10 minutes of waking time. Each check breaks focus, and research shows it takes an average of 23 minutes to fully regain deep concentration after an interruption. Do the maths: most people never reach sustained deep focus at all.',
            'This isn\'t a willpower problem — it\'s an environment problem. Your phone is designed by teams of engineers and psychologists whose entire job is to keep you engaged. Infinite scroll, notification badges, autoplay — these features exploit your brain\'s reward circuitry to capture and hold your attention.',
          ],
        },
        {
          heading: 'How Screens Hijack Your Dopamine System',
          paragraphs: [
            'Dopamine isn\'t a "pleasure chemical" — it\'s a motivation and anticipation chemical. Your brain releases dopamine when it expects a reward, not when it receives one. This is why scrolling through social media is so addictive: every swipe offers the possibility of something interesting.',
            'The problem is that constant low-level dopamine stimulation from phones raises your baseline expectation. Activities that are genuinely rewarding but slower — reading, training, deep conversation, creative work — feel boring by comparison. Your brain has been recalibrated to need constant novelty.',
          ],
          bullets: [
            'Social media likes and comments — intermittent reinforcement (the same pattern as slot machines)',
            'Notifications — create urgency and anxiety when unread, relief when checked',
            'Infinite scroll — removes natural stopping cues, leading to extended mindless consumption',
            'Comparison culture — constant exposure to curated highlight reels lowers self-esteem and increases anxiety',
          ],
          imageUrl: ch6DopamineLoop,
          imageAlt: 'Circular diagram showing the dopamine feedback loop: notification, anticipation, check phone, brief reward, dopamine drop, seek next stimulus',
        },
        {
          heading: 'The Impact on Training and Performance',
          paragraphs: [
            'Digital distraction doesn\'t just affect work — it affects everything, including your training. People who scroll between sets have worse mind-muscle connection, longer rest periods, and lower session quality. Phone use before bed disrupts sleep quality through blue light exposure and cognitive arousal, directly impacting recovery and next-day performance.',
            'Beyond the gym, constant connectivity leaves you in a state of partial attention. You\'re never fully present with the people around you, never fully recovered, never fully focused on what matters. This chronic low-grade stress accumulates.',
          ],
        },
        {
          heading: 'Practical Digital Boundaries',
          paragraphs: [
            'The goal isn\'t to eliminate technology — it\'s to use it intentionally. Here are evidence-based strategies:',
          ],
          bullets: [
            'Phone-free first hour — don\'t check your phone for the first 60 minutes after waking. This protects your morning from being reactive',
            'Notification audit — disable all notifications except calls and direct messages from real people. Batch-check everything else',
            'Training mode — put your phone on aeroplane mode during workouts. Use a watch for rest timers instead',
            'Single-tasking — when doing focused work, close all tabs except the one you need. Use website blockers if necessary',
            'Evening wind-down — no screens for 60 minutes before bed. Read a physical book, journal, or have a face-to-face conversation instead',
            'Scheduled social media — if you use social media, check it at set times (e.g., 12pm and 6pm for 15 minutes) rather than reflexively throughout the day',
          ],
        },
        {
          heading: 'Building an Attention-Rich Life',
          paragraphs: [
            'Managing your digital environment isn\'t about restriction — it\'s about creating space for what actually matters. When you reduce digital noise, you create room for deep work, genuine relationships, quality training, and creative thinking.',
            'The people who achieve extraordinary things in any field share one trait: the ability to sustain focus on what matters while ignoring what doesn\'t. In a world engineered to distract you, protecting your attention is a competitive advantage.',
          ],
        },
      ],
      unbreakableInsight: 'Your phone is not a neutral tool — it\'s designed to consume your attention and sell it to advertisers. Every minute you spend mindlessly scrolling is a minute stolen from training, recovery, learning, and building real relationships. You wouldn\'t let a stranger steal your wallet. Why let one steal your time?',
      coachNote: 'Start small. Pick one boundary from this chapter and implement it for a week. Most people find the phone-free first hour transformative. You\'ll be amazed how different your mornings feel when you start with intention instead of Instagram.',
      practicalTask: {
        title: 'Digital Audit & Detox Challenge',
        instructions: 'Check your screen time report for the past week (Settings > Screen Time on iPhone, or Digital Wellbeing on Android). Note your total daily average and your top 3 most-used apps. Then implement a 48-hour partial digital detox: delete social media apps from your phone (not your accounts — just the apps), disable non-essential notifications, and put your phone in a different room during meals and training.',
        reflectionQuestions: [
          'What was your total daily screen time, and how did that number make you feel?',
          'During the 48-hour detox, what did you notice about your urge to check your phone?',
          'Did reducing screen time change your focus, sleep quality, or mood in any noticeable way?',
        ],
      },
    },
    {
      number: 7,
      title: 'Procrastination & Resistance',
      learningOutcome: 'Understand the psychology of procrastination, why willpower-based approaches fail, and evidence-based strategies for overcoming resistance to important tasks.',
      assessmentCriteria: [
        'Explain procrastination as an emotional regulation problem rather than a time management issue',
        'Identify the key triggers that drive procrastination',
        'Apply practical techniques to reduce resistance and initiate action',
      ],
      content: [
        {
          heading: 'Procrastination Is Not Laziness',
          paragraphs: [
            'Procrastination is not a character flaw or a lack of discipline — it is an emotional regulation problem. When a task triggers negative emotions (boredom, anxiety, self-doubt, overwhelm), your brain seeks immediate relief by switching to something more pleasant. Scrolling your phone, checking emails, or tidying your desk are not productive — they are emotional escape routes.',
            'Understanding this distinction is critical. If you frame procrastination as laziness, the solution feels like "try harder." But research by Dr Tim Pychyl and others shows that the real solution is managing the emotions attached to the task, not simply exerting more willpower.',
          ],
        },
        {
          heading: 'Common Procrastination Triggers',
          bullets: [
            'Task ambiguity — If you do not know exactly what to do, your brain resists starting. Vague tasks feel overwhelming',
            'Fear of failure — If the task is tied to your identity ("if I fail this, I am not good enough"), avoidance feels safer than attempting',
            'Perfectionism — If your standard is impossibly high, starting feels pointless because the outcome will never match your expectations',
            'Low immediate reward — Your brain heavily discounts future benefits. A task that pays off in three months feels less urgent than one that provides instant satisfaction',
            'Decision fatigue — If you have already made dozens of decisions today, your capacity to initiate difficult tasks is depleted',
          ],
        },
        {
          heading: 'Practical Anti-Procrastination Strategies',
          bullets: [
            'The two-minute rule — Commit to starting for just two minutes. Starting is the hardest part; once you begin, momentum often carries you forward',
            'Clarify the next action — Transform vague tasks ("work on the project") into specific actions ("write the introduction paragraph"). Specificity reduces resistance',
            'Remove friction — Make the desired action as easy as possible. Lay out gym clothes the night before. Open the document before you "decide" to start',
            'Pair with reward — Attach an immediate reward to the difficult task. Listen to a favourite podcast only during training. Have your best coffee only during study time',
            'Time-boxing — Commit to a fixed time window (25 minutes), not a fixed output. You cannot control results, but you can control your time allocation',
            'Forgive and restart — When you procrastinate (and you will), self-criticism makes it worse. Acknowledge it, understand the trigger, and restart without drama',
          ],
        },
      ],
      unbreakableInsight: 'You do not need to feel motivated to start. You need to start in order to feel motivated. Action generates motivation — not the other way around.',
      coachNote: 'Next time you catch yourself procrastinating, do not ask "why am I so lazy?" Ask "what emotion am I avoiding?" That question changes everything about how you approach the problem.',
      practicalTask: {
        title: 'Procrastination Pattern Analysis',
        instructions: 'For five days, track every instance of procrastination. Note: (1) the task you avoided, (2) the emotion you felt when thinking about it, (3) what you did instead, and (4) what eventually got you started. Look for patterns in your triggers and your successful start strategies.',
        reflectionQuestions: [
          'What emotions most commonly trigger your procrastination?',
          'Is there a specific time of day when resistance is highest?',
          'Which strategy was most effective at getting you to start?',
        ],
      },
    },
    {
      number: 8,
      title: 'Accountability & Progress Tracking',
      learningOutcome: 'Understand the science of accountability, learn to design effective tracking systems, and build structures that sustain long-term behaviour change.',
      assessmentCriteria: [
        'Explain why accountability significantly increases follow-through on commitments',
        'Design a practical progress tracking system for personal goals',
        'Identify different types of accountability and their effectiveness',
      ],
      content: [
        {
          heading: 'Why Accountability Works',
          paragraphs: [
            'Research by the American Society of Training and Development found that having a specific accountability appointment with someone increases the probability of completing a goal from 65% to 95%. Accountability works because it leverages social commitment — your brain treats promises made to others as significantly more binding than promises made to yourself.',
            'Accountability is not about punishment or shame. It is about creating a structure where your intentions are visible, your progress is tracked, and your commitment is reinforced by someone or something outside your own head.',
          ],
        },
        {
          heading: 'Types of Accountability',
          bullets: [
            'Self-accountability — Tracking systems, journals, habit apps. Lowest friction, but also lowest external pressure. Works best for people with strong self-regulation',
            'Peer accountability — A training partner, study buddy, or friend with similar goals. Moderate pressure, mutual benefit. Most accessible and sustainable for most people',
            'Coach/mentor accountability — A professional relationship where someone holds you to higher standards than you would set for yourself. Highest impact but requires investment',
            'Public accountability — Sharing goals publicly (social media, community groups). Powerful motivator but carries risk of ego-driven goal pursuit',
            'Environmental accountability — Designing your environment so the default action is the desired one. The most underrated form — it works without requiring willpower',
          ],
        },
        {
          heading: 'Designing Your Tracking System',
          paragraphs: [
            'A tracking system should be simple enough to maintain daily and detailed enough to reveal patterns. Overly complex systems get abandoned within two weeks. The best system is the one you will actually use.',
          ],
          bullets: [
            'Track lead indicators, not just outcomes — Track sessions completed, not just weight lost. Track hours studied, not just exam results. Lead indicators are within your control',
            'Use visual systems — Streak calendars, progress bars, and habit grids provide immediate visual feedback that reinforces commitment',
            'Review weekly — Set a fixed weekly review time (10 minutes) to assess what worked, what did not, and what needs adjusting',
            'Celebrate consistency, not perfection — Hitting 85% adherence is excellent. Demanding 100% creates all-or-nothing thinking that collapses at the first miss',
            'Keep it visible — Put your tracker where you see it daily. Out of sight means out of mind means out of practice',
          ],
        },
      ],
      unbreakableInsight: 'The difference between someone who achieves their goals and someone who does not is rarely talent or knowledge — it is systems. Build systems that make consistency the default, and motivation becomes optional.',
      coachNote: 'Find one person this week to share a goal with — and agree to check in weekly. It does not need to be formal. A simple text every Sunday night saying "I did 4 out of 5 sessions" is more powerful than any motivational video.',
      practicalTask: {
        title: 'Accountability System Design',
        instructions: 'Choose one goal you are working toward. Design a tracking system using the principles above: select 2–3 lead indicators to track daily, choose a visual format (paper calendar, app, spreadsheet), set a weekly review time, and identify one accountability partner. Run this system for two weeks.',
        reflectionQuestions: [
          'Did tracking your lead indicators change your daily behaviour?',
          'How did having an accountability partner affect your consistency?',
          'What would you change about your tracking system based on the first two weeks?',
        ],
      },
    },
  ],
};
