import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'

const DateTimePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [selectedTime, setSelectedTime] = useState(value ? new Date(value).toTimeString().slice(0, 5) : '09:00')

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
  }

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':')
      const dateTime = new Date(selectedDate)
      dateTime.setHours(parseInt(hours), parseInt(minutes))
      onChange(dateTime.toISOString())
      setIsOpen(false)
    }
  }

  const formatDisplayDate = () => {
    if (!value) return 'Select date and time'
    const date = new Date(value)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const renderCalendar = () => {
    const days = []
    const totalDays = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      date.setHours(0, 0, 0, 0)
      const isPast = date < today
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()

      days.push(
        <button
          key={day}
          onClick={() => !isPast && handleDateClick(day)}
          disabled={isPast}
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors
            ${isPast ? 'text-gray-400 cursor-not-allowed bg-gray-200' : 'text-gray-700 hover:bg-teal-100 cursor-pointer'}
            ${isSelected ? 'bg-teal-600 text-white hover:bg-teal-700' : ''}
          `}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl focus:outline-none border-2 border-gray-400 ring-2 ring-transparent focus:border-teal-600 focus:ring-teal-200 bg-white text-left flex items-center justify-between hover:border-gray-500 transition shadow-sm"
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
          {formatDisplayDate()}
        </span>
        <Calendar className="h-5 w-5 text-teal-600" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-gray-50 rounded-xl shadow-xl border-2 border-gray-400 p-4 w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg font-semibold text-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-bold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg font-semibold text-gray-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-bold text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Time Picker */}
          <div className="border-t-2 border-gray-300 pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              <Clock className="h-4 w-4 text-teal-600" />
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 rounded-lg border-2 border-gray-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200 bg-white text-gray-900 font-medium"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDate}
            className="w-full mt-4 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  )
}

export default DateTimePicker
