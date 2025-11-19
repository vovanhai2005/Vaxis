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
          className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm transition-colors
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-teal-50 cursor-pointer'}
            ${isSelected ? 'bg-teal-500 text-white hover:bg-teal-600' : ''}
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
        className="w-full p-3 rounded-lg focus:outline-none border-gray-300 ring-2 ring-transparent focus:border-teal-500 focus:ring-teal-100 bg-white text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {formatDisplayDate()}
        </span>
        <Calendar className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Time Picker */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock className="h-4 w-4" />
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDate}
            className="w-full mt-4 bg-teal-500 text-white py-2 rounded-lg font-semibold hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  )
}

export default DateTimePicker
