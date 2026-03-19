# AI Learning Assistant Features

## ✅ All Requested Features Implemented

### 1. **Chat Interface for Quiz-Related Help**
- **Location**: Bottom-right corner of the quiz page (floating chat button)
- **Features**:
  - Real-time chat with AI assistant while taking the quiz
  - Context-aware responses based on the current quiz topic and question
  - Question-specific help suggestions when answering a question
  - Topic-specific tips and explanations
  - Previous messages saved during the quiz session

### 2. **Get Hints During Quiz (with Score Penalty)**
- **Location**: Quiz page, next to question text
- **Features**:
  - Up to 3 hints available per question
  - Automatic score penalties:
    - Hint 1: -25% penalty
    - Hint 2: -50% penalty  
    - Hint 3: -75% penalty
  - Visual indicators showing hint levels used
  - Penalty clearly displayed on results screen
  - Marks breakdown showing original and penalty-adjusted scores

### 3. **Detailed Explanations for Answers**
- **Location**: Below answer options after submitting a question
- **Features**:
  - Toggle-able explanation button ("📖 Explain this answer")
  - Powered by AI to explain why the answer is correct/incorrect
  - Shows correct answer vs user's answer
  - Available on quiz results page
  - Pull-down for efficient learning

### 4. **Ask Follow-up Questions About Topics**
- **Location**: AI Chat interface
- **Features**:
  - Question-specific suggestions:
    - "Explain the concept in this question"
    - "What does this question mean?"
    - "Help me understand the answer"
  - Topic-specific suggestions:
    - "Explain {topic} basics"
    - "What should I know about {topic}?"
    - "Give me tips for this quiz"
  - Free-form question capability
  - Conversation history maintained during quiz session
  - AI assistant has full context of quiz difficulty and topic

## 💡 How to Use

### Starting a Quiz
1. Click "New Quiz" on the home page
2. Select topic, difficulty, and number of questions
3. Begin the quiz

### While Taking the Quiz

**Get Help**:
- Click the **blue chat button** (bottom-right) to open AI Chat
- Ask questions about the topic or current question
- Use suggested prompts or type your own question

**Get a Hint**:
1. Click the **"💡 Hint N"** button next to the question
2. Understand the concept better
3. Note that your score will be reduced if you get the answer correct

**Review Earlier**:
- Click **"Explain this answer"** to understand the concept
- Works best after submitting your answer

### After Submitting Quiz
- Review all answers with explanations
- See detailed marks breakdown including penalties
- Retake the quiz to improve your score

## 🛠 Technical Implementation

### Files Modified
- `src/app/quiz/page.tsx` - Added AIChat component integration
- `src/components/AIChat.tsx` - Enhanced with current question context
- `src/app/history/page.tsx` - Fixed totalMarks property
- `src/app/results/[id]/page.tsx` - Fixed totalMarks property

### API Routes Used
- `/api/chat` - Handles AI chat conversations
- `/api/hint` - Generates leveled hints
- `/api/explain` - Generates answer explanations
- `/api/generate` - Generates quiz questions

### UI/UX Features
- Responsive design with mobile navigation
- Sticky position for AI chat (doesn't interfere with quiz)
- Real-time loading indicators
- Color-coded status indicators
- Progress tracking and question navigator
- Time tracking (if timer enabled)

## 📊 Scoring System

- **Full Marks**: All questions without hints
- **With Hints**: Marks reduced based on hint levels used
- **Example**: If a question is 2 marks and you use 2 hints:
  - Full marks: 2
  - With hint 1 (-25%): 1.5
  - With hint 2 (-50%): 1.0
  - Final deduction shown on results

## 🚀 Future Enhancements (Optional)

- Save chat conversations for future reference
- AI-powered quiz generation based on difficulty
- Custom question validation
- Performance analytics and recommendations
- Study recommendations based on weak topics
- Peer comparison (if needed)
