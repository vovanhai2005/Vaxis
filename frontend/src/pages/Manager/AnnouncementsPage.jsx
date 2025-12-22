import React, { useState, useEffect } from 'react'
import { Megaphone, Plus, Edit2, Trash2, Users, Clock, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useAnnouncementStore } from '../../store/useAnnouncementStore'
import Header from '../../components/Header'
import toast from 'react-hot-toast'

const AnnouncementsPage = () => {
  const { announcements, isLoading, isCreating, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncementStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    priority: 0,
    expires_at: ''
  })

  useEffect(() => {
    getAnnouncements()
  }, [getAnnouncements])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData)
      } else {
        await createAnnouncement(formData)
      }
      resetForm()
    } catch (error) {
      // Error already handled in store
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      target_audience: 'all',
      priority: 0,
      expires_at: ''
    })
    setShowCreateModal(false)
    setEditingAnnouncement(null)
  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      priority: announcement.priority || 0,
      expires_at: announcement.expires_at ? new Date(announcement.expires_at).toISOString().slice(0, 16) : ''
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement(id)
    }
  }

  const getAudienceIcon = (audience) => {
    switch (audience) {
      case 'citizens':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'employees':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'managers':
        return <Users className="h-4 w-4 text-orange-600" />
      default:
        return <Users className="h-4 w-4 text-teal-600" />
    }
  }

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'citizens':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'employees':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'managers':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200'
    }
  }

  const getPriorityColor = (priority) => {
    if (priority >= 3) return 'bg-red-50 text-red-700 border-red-200'
    if (priority >= 2) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      <Header 
        title="Announcements Management" 
        subtitle="Create and manage system announcements"
        icon={Megaphone}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
            <p className="text-gray-500 text-sm">Manage announcements for different user groups</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
          >
            <Plus className="h-5 w-5" />
            New Announcement
          </button>
        </div>

        {/* Announcements List */}
        <div className="bg-white rounded-2xl shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No announcements yet</h3>
              <p className="text-gray-500 mb-4">Create your first announcement to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                Create Announcement
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${getAudienceColor(announcement.target_audience)}`}>
                          {getAudienceIcon(announcement.target_audience)}
                          {announcement.target_audience}
                        </span>
                        {announcement.priority > 0 && (
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${getPriorityColor(announcement.priority)}`}>
                            <AlertCircle className="h-3 w-3" />
                            Priority {announcement.priority}
                          </span>
                        )}
                        {announcement.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border bg-gray-50 text-gray-700 border-gray-200">
                            <X className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Created: {formatDate(announcement.created_at)}
                        </span>
                        {announcement.expires_at && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Expires: {formatDate(announcement.expires_at)}
                          </span>
                        )}
                        <span>By: {announcement.creator_name || 'Manager'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter announcement content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    name="target_audience"
                    value={formData.target_audience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="citizens">Citizens Only</option>
                    <option value="employees">Employees Only</option>
                    <option value="managers">Managers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="0">Normal</option>
                    <option value="1">Low Priority</option>
                    <option value="2">Medium Priority</option>
                    <option value="3">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  value={formData.expires_at}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Processing...' : (editingAnnouncement ? 'Update' : 'Create')} Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnouncementsPage
