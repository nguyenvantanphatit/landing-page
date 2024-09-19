'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

const emotions: { [key: string]: string } = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  neutral: '😐',
  anxious: '😰',
}

const activities: { [key: string]: string[] } = {
  happy: ['Chia sẻ niềm vui với bạn bè', 'Ghi nhật ký về những điều tích cực'],
  sad: ['Nghe nhạc yêu thích', 'Đi dạo trong công viên'],
  angry: ['Thực hành hít thở sâu', 'Viết ra những suy nghĩ của bạn'],
  neutral: ['Thử một sở thích mới', 'Đọc một cuốn sách hay'],
  anxious: ['Thực hành thiền 5 phút', 'Nói chuyện với người bạn tin tưởng'],
}

interface EmotionData {
  [key: string]: string
}

interface JournalData {
  [key: string]: string
}

interface ConsultationData {
  name: string
  email: string
  reason: string
}

interface EmotionGoal {
  emotion: string
  days: number
}

export function EmotionCalendarComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [emotionData, setEmotionData] = useState<EmotionData>({})
  const [journalData, setJournalData] = useState<JournalData>({})
  const [showJournal, setShowJournal] = useState(false)
  const [showStressTest, setShowStressTest] = useState(false)
  const [stressScore, setStressScore] = useState(0)
  const [showConsultation, setShowConsultation] = useState(false)
  const [consultationData, setConsultationData] = useState<ConsultationData>({ name: '', email: '', reason: '' })
  const [emotionGoal, setEmotionGoal] = useState<EmotionGoal>({ emotion: '', days: 0 })
  const [goalProgress, setGoalProgress] = useState(0)

  useEffect(() => {
    const storedEmotionData = localStorage.getItem('emotionData')
    const storedJournalData = localStorage.getItem('journalData')
    const storedEmotionGoal = localStorage.getItem('emotionGoal')
    if (storedEmotionData) setEmotionData(JSON.parse(storedEmotionData))
    if (storedJournalData) setJournalData(JSON.parse(storedJournalData))
    if (storedEmotionGoal) setEmotionGoal(JSON.parse(storedEmotionGoal))
  }, [])

  useEffect(() => {
    localStorage.setItem('emotionData', JSON.stringify(emotionData))
    localStorage.setItem('journalData', JSON.stringify(journalData))
    localStorage.setItem('emotionGoal', JSON.stringify(emotionGoal))
  }, [emotionData, journalData, emotionGoal])

  useEffect(() => {
    if (emotionGoal.emotion && emotionGoal.days) {
      const recentEmotions = Object.entries(emotionData)
        .filter(([date]) => {
          const emotionDate = new Date(date)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return emotionDate >= thirtyDaysAgo
        })
        .map(([_, emotion]) => emotion)

      const achievedDays = recentEmotions.filter(emotion => emotion === emotionGoal.emotion).length
      setGoalProgress((achievedDays / emotionGoal.days) * 100)
    }
  }, [emotionData, emotionGoal])

  const handleDateSelect = (date : any) => {
    setSelectedDate(date)
    setShowJournal(true)
  }

  const handleEmotionSelect = (emotion: any) => {
    const dateString = selectedDate.toISOString().split('T')[0]
    setEmotionData(prev => ({
      ...prev,
      [dateString]: emotion
    }))
  }

  const handleJournalEntry = (e: any) => {
    const dateString = selectedDate.toISOString().split('T')[0]
    setJournalData(prev => ({
      ...prev,
      [dateString]: e.target.value
    }))
  }

  const handleStressTest = (score: any) => {
    setStressScore(score)
    setShowStressTest(false)
    if (score > 7) {
      setShowConsultation(true)
    }
  }

  const handleConsultationSubmit = (e: any) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log('Consultation request:', consultationData)
    setShowConsultation(false)
    // Reset the form
    setConsultationData({ name: '', email: '', reason: '' })
  }

  const handleEmotionGoalSet = (e: any) => {
    e.preventDefault()
    const form = e.target
    const emotion = form.emotion.value
    const days = parseInt(form.days.value)
    setEmotionGoal({ emotion, days })
  }

  const getEmotionStats = () => {
    const stats = Object.values(emotionData).reduce((acc, emotion) => {
      if (typeof emotion === 'string') {
        acc[emotion] = (acc[emotion] || 0) + 1
      }
      return acc
    }, {} as { [key: string]: number })
    return Object.entries(stats).map(([name, count]) => ({ name, count }))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Emotion Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
        
        <div>
          {selectedDate && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <div className="flex space-x-2 mb-4">
                {Object.entries(emotions).map(([key, value]) => (
                  <Button
                    key={key}
                    onClick={() => handleEmotionSelect(key)}
                    variant={emotionData[selectedDate.toISOString().split('T')[0]] === key ? 'default' : 'outline'}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              
              {emotionData[selectedDate.toISOString().split('T')[0]] && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Gợi ý hoạt động:</h3>
                  <ul className="list-disc list-inside">
                    {activities[emotionData[selectedDate.toISOString().split('T')[0]]].map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Nhật ký cảm xúc</h3>
                <Textarea
                  value={journalData[selectedDate.toISOString().split('T')[0]] || ''}
                  onChange={handleJournalEntry}
                  placeholder="Viết về cảm xúc và trải nghiệm của bạn hôm nay..."
                  rows={4}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Thống kê cảm xúc</h2>
        <BarChart width={600} height={300} data={getEmotionStats()}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Đánh giá mức độ stress</h2>
        <Button onClick={() => setShowStressTest(true)}>Làm bài kiểm tra stress</Button>
        
        {showStressTest && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Bạn cảm thấy stress ở mức độ nào?</h3>
            <p className="mb-2">Chọn từ 1 (ít stress) đến 10 (rất stress)</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                <Button key={score} onClick={() => handleStressTest(score)} variant="outline">
                  {score}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={showConsultation} onOpenChange={setShowConsultation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lịch tư vấn tâm lý</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConsultationSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ tên</label>
              <Input
                type="text"
                id="name"
                value={consultationData.name}
                onChange={(e) => setConsultationData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                id="email"
                value={consultationData.email}
                onChange={(e) => setConsultationData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Lý do tư vấn</label>
              <Textarea
                id="reason"
                value={consultationData.reason}
                onChange={(e) => setConsultationData(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>
            <Button type="submit">Gửi yêu cầu tư vấn</Button>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Mục tiêu cảm xúc</h2>
        <form onSubmit={handleEmotionGoalSet} className="space-y-4">
          <div>
            <label htmlFor="emotion" className="block text-sm font-medium text-gray-700">Cảm xúc mục tiêu</label>
            <Select name="emotion" required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cảm xúc" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(emotions).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value} {key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700">Số ngày mục tiêu</label>
            <Input type="number" id="days" name="days" min="1" max="30" required />
          </div>
          <Button type="submit">Đặt mục tiêu</Button>
        </form>
        
        {emotionGoal.emotion && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Tiến độ mục tiêu</h3>
            <Progress value={goalProgress} className="w-full" />
            <p className="mt-2">
              Mục tiêu: {emotions[emotionGoal.emotion]} trong {emotionGoal.days} ngày
            </p>
          </div>
        )}
      </div>
    </div>
  )
}