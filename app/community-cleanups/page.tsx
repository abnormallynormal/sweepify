"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, Search, User } from "lucide-react"

export default function CommunityCleanupPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const upcomingEvents = [
    {
      id: 1,
      title: "Central Park Spring Cleanup",
      organizer: "Sarah Johnson",
      date: "2024-03-15",
      time: "09:00 AM",
      location: "Central Park, East Side",
      participants: 23,
      maxParticipants: 50,
      description:
        "Join us for a comprehensive cleanup of Central Park's east side. We'll focus on the playground areas and walking paths.",
      difficulty: "Easy",
      duration: "3 hours",
      supplies: "Provided",
    },
    {
      id: 2,
      title: "Brooklyn Bridge Walkway Restoration",
      organizer: "Mike Rodriguez",
      date: "2024-03-18",
      time: "08:00 AM",
      location: "Brooklyn Bridge Pedestrian Walkway",
      participants: 15,
      maxParticipants: 30,
      description: "Help restore the beauty of one of NYC's most iconic landmarks by cleaning the pedestrian walkway.",
      difficulty: "Medium",
      duration: "4 hours",
      supplies: "Bring gloves",
    },
    {
      id: 3,
      title: "Coney Island Beach Cleanup",
      organizer: "Emma Liu",
      date: "2024-03-22",
      time: "07:00 AM",
      location: "Coney Island Beach",
      participants: 42,
      maxParticipants: 100,
      description: "Large-scale beach cleanup focusing on plastic waste and debris. Perfect for families and groups.",
      difficulty: "Easy",
      duration: "5 hours",
      supplies: "Provided",
    },
  ]

  const myEvents = [
    {
      id: 4,
      title: "Hudson River Trail Cleanup",
      organizer: "You",
      date: "2024-03-25",
      time: "10:00 AM",
      location: "Hudson River Trail, Mile 3-5",
      participants: 8,
      maxParticipants: 25,
      description: "Cleanup along the scenic Hudson River Trail focusing on litter along the jogging path.",
      difficulty: "Easy",
      duration: "2 hours",
      supplies: "Provided",
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Hard":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-green-100 p-1 rounded-xl mb-8 animate-fade-in">
          {[
            { id: "upcoming", label: "Upcoming Events", count: upcomingEvents.length },
            { id: "my-events", label: "My Events", count: myEvents.length },
            { id: "past", label: "Past Events", count: 12 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id ? "bg-white text-green-800 shadow-sm" : "text-green-600 hover:text-green-800"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Locations</option>
            <option>Manhattan</option>
            <option>Brooklyn</option>
            <option>Queens</option>
          </select>
          <select className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "upcoming" ? upcomingEvents : myEvents).map((event, index) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-green-800 mb-2 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center text-sm text-green-600 mb-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>by {event.organizer}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(event.difficulty)}`}
                  >
                    {event.difficulty}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-green-700">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                    <span>
                      {event.duration} • {event.supplies}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-green-600 mb-4 line-clamp-3">{event.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(4, event.participants))].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 bg-green-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-green-700"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {event.participants > 4 && (
                        <div className="w-8 h-8 bg-green-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-green-700">
                          +{event.participants - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-green-600">
                      {event.participants}/{event.maxParticipants}
                    </span>
                  </div>
                  <div className="w-16 bg-green-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {event.organizer === "You" ? (
                    <>
                      <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                        Manage Event
                      </button>
                      <button className="px-4 py-3 border-2 border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
                        Edit
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                        Join Event
                      </button>
                      <button className="px-4 py-3 border-2 border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
                        Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {activeTab === "past" && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">No Past Events Yet</h3>
            <p className="text-green-600 mb-6">Start participating in cleanups to see your history here.</p>
            <button
              onClick={() => setActiveTab("upcoming")}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Browse Upcoming Events
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">Create Cleanup Event</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-green-400 hover:text-green-600 text-2xl">
                ×
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Event Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter cleanup location"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Duration</label>
                  <select className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>3 hours</option>
                    <option>4 hours</option>
                    <option>5+ hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Difficulty</label>
                  <select className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Describe your cleanup event..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 border-2 border-green-200 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
