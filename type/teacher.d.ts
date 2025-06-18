interface ExamCreateRequest {
  title: string
  subject: string
  description: string
  startTime: string
  endTime: string
  duration: number
  teacherId: number
  questions: QuestionDTO[]
}

interface HomeworkCreateRequest {
  title: string
  subject: string
  description: string
  deadline: string
  teacherId: number
  questions: QuestionDTO[]
}

interface QuestionDTO {
  content: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options?: string[]
  answer: string
  score: number
}

interface ExamResults {
  exam: ExamDTO
  avgScore: number
  passRate: number
  maxScore: number
  minScore: number
  questionAvgScores: Record<number, number>
  scoreDistribution: Record<string, number>
  studentScores: StudentScore[]
}

interface HomeworkResults {
  homework: HomeworkDTO
  avgScore: number
  completionRate: number
  maxScore: number
  minScore: number
  questionAvgScores: Record<number, number>
  scoreDistribution: Record<string, number>
  studentScores: StudentScore[]
}

interface StudentScore {
  studentId: number
  studentName: string
  score: number
  totalScore: number
  status?: string
}

interface SubjectiveGrading {
  questionId: number
  score: number
}
