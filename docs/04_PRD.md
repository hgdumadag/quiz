# 4. Product Requirements Document (PRD)

## 4.1 Product Vision

### 4.1.1 Vision Statement
Create a universal, AI-enhanced examination platform that adapts to individual learning needs, providing personalized coaching in Practice Mode and rigorous evaluation in Assessment Mode, deployable anywhere from home education to corporate training.

### 4.1.2 Product Goals
1. **Personalized Learning:** Leverage AI to provide individualized feedback that guides learners without revealing answers
2. **Dual-Purpose Assessment:** Support both formative (practice) and summative (assessment) evaluation approaches
3. **Deployment Flexibility:** Work seamlessly in local, offline, and corporate intranet environments
4. **Subject Agnostic:** Support diverse content from elementary mathematics to professional auditing
5. **Privacy First:** Keep exam content and student data within user-controlled boundaries

### 4.1.3 Success Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **User Satisfaction** | 4.5/5 stars | Post-exam survey |
| **Learning Improvement** | 25% avg score increase (practice → assessment) | Score comparison |
| **Time to Competency** | 30% reduction vs traditional methods | Time tracking |
| **System Adoption** | 80% of assigned users complete at least 1 exam | Usage analytics |
| **AI Feedback Quality** | 90% of students find hints helpful | Survey question |
| **Technical Reliability** | 99% uptime (no crashes) | Error logging |

## 4.2 Target Market

### 4.2.1 Primary Markets
1. **Home Education:** Parents teaching children mathematics, science, language arts
2. **Corporate Training:** Organizations upskilling employees (e.g., audit, data analytics, AI)
3. **Self-Directed Learners:** Individuals preparing for certifications or skill development

### 4.2.2 Market Sizing (Estimated)
- **Home Users:** 1M+ homeschooling families globally
- **Corporate Training:** 50K+ mid-to-large organizations with training needs
- **Individual Learners:** 10M+ professional certification seekers

### 4.2.3 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Differentiator |
|------------|-----------|-----------|-------------------|
| **Google Forms/Quiz** | Free, familiar | No AI coaching, limited question types | AI-powered coaching |
| **Quizlet** | Large content library | Subscription-based, online only | Offline capable, custom content |
| **Moodle/Canvas LMS** | Comprehensive features | Complex setup, requires server | Zero setup, single file |
| **Kahoot** | Gamified, engaging | Real-time only, no deep feedback | Asynchronous, detailed feedback |
| **ExamSoft** | Enterprise-grade security | Expensive, locked ecosystem | Affordable, flexible |

**Unique Value Proposition:**  
"The only exam platform that combines AI-powered personalized coaching, offline capability, and zero-infrastructure deployment—from home education to corporate training."

## 4.3 Feature Prioritization (MoSCoW)

### 4.3.1 MUST HAVE (MVP)
- ✅ Dual-mode system (Practice & Assessment)
- ✅ All question types (MC, TF, Short, Long)
- ✅ LLM integration (Claude, OpenAI, Ollama)
- ✅ Progressive hints (Practice Mode)
- ✅ Comprehensive grading (Assessment Mode)
- ✅ Exam loading (JSON file/paste)
- ✅ Multi-user support with privacy
- ✅ Results export (CSV)
- ✅ Timer (Assessment Mode)
- ✅ Token budget management
- ✅ Super Admin configuration
- ✅ White-label theming

### 4.3.2 SHOULD HAVE (v1.1)
- 📝 Question bank reuse across exams
- 📝 Advanced analytics dashboard
- 📝 Spaced repetition recommendations
- 📝 Exam library with search/filter
- 📝 Mobile-responsive design
- 📝 Bulk user import (CSV)
- 📝 Email notifications (exam assigned, results ready)
- 📝 Question randomization
- 📝 Partial credit for text answers

### 4.3.3 COULD HAVE (v2.0)
- 💡 Integration with LMS (Moodle, Canvas)
- 💡 Video/audio question support
- 💡 Collaborative exams (group work)
- 💡 Adaptive difficulty (adjust based on performance)
- 💡 Gamification (badges, leaderboards)
- 💡 Multi-language support
- 💡 OCR for handwritten answers (scanned submissions)
- 💡 Plagiarism detection (text responses)

### 4.3.4 WON'T HAVE (Out of Scope)
- ❌ Proctoring/anti-cheat technology
- ❌ Video call integration
- ❌ Blockchain-based credential verification
- ❌ Social network features
- ❌ User authentication infrastructure (SSO/SAML)
- ❌ Real-time collaborative editing
- ❌ Native mobile apps (iOS/Android)

## 4.4 User Experience Requirements

### 4.4.1 Design Principles
1. **Simplicity First:** Every feature must justify its complexity
2. **Immediate Feedback:** Students see results instantly when possible
3. **Encouraging Tone:** All messaging promotes growth mindset
4. **Transparency:** Users always know what mode they're in and why
5. **Accessibility:** Keyboard navigation, clear contrast, readable fonts

### 4.4.2 User Flows

**Student Flow (Practice Mode):**
```
Login → View Assigned Exams → Select Exam → Choose Practice Mode → 
Read Instructions → Start Exam → Answer Question → Get Instant Feedback → 
Try Again (if wrong) → Get Progressive Hints → Master Question → 
Next Question → Repeat → Finish Practice → View Progress
```

**Student Flow (Assessment Mode):**
```
Login → View Assigned Exams → Select Exam → Choose Assessment Mode → 
Read Warnings → Confirm Understanding → Start Exam (Timer Begins) → 
Answer Question (One Attempt) → Lock Answer → Next Question → Repeat → 
Submit Exam → Wait for Grading → View Results → Review Feedback → 
Decide to Retake or Complete
```

**Super Admin Flow:**
```
Login → Admin Dashboard → Load Exam (JSON) → Validate → Assign to Users → 
Configure LLM Provider → Set Theme → Monitor Progress → Export Results → 
Analyze Performance
```

### 4.4.3 UI/UX Guidelines

**Color Scheme:**
- **Primary (Brand):** Customizable (default: Blue #2563EB)
- **Success:** Green #10B981
- **Warning:** Amber #F59E0B
- **Error:** Red #EF4444
- **Neutral:** Gray scale #F3F4F6 → #111827

**Typography:**
- **Headings:** 24px, 20px, 18px (bold)
- **Body:** 16px (regular)
- **Labels:** 14px (medium)
- **Captions:** 12px (regular)
- **Font Family:** System fonts (San Francisco, Segoe UI, Roboto)

**Spacing:**
- Use 8px grid system (8, 16, 24, 32, 40, 48px)
- Padding: 16px (cards), 24px (sections)
- Margins: 16px (between elements), 32px (between sections)

**Iconography:**
- ✅ Checkmark (correct answer, completed)
- ❌ X mark (incorrect answer)
- 🔒 Lock (answer locked, assessment mode)
- ⚑ Flag (flagged for review)
- 💡 Lightbulb (hint available)
- ⏱️ Timer (assessment mode)
- 📊 Chart (results, analytics)

---

