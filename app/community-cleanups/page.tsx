"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Search, User, Plus, Loader } from "lucide-react"
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/firebase/firebase"
import { useAuth } from "@/hooks/use-auth"

export default function CommunityCleanupPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const { user } = useAuth()

  // Form state
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    duration: "",
    difficulty: "",
    maxParticipants: "",
    description: "",
  })

  // Events state
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [pastEvents, setPastEvents] = useState<any[]>([])
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("All Locations")
  const [difficultyFilter, setDifficultyFilter] = useState("All Difficulties")

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

  // Check if all form fields are filled
  const isFormValid = () => {
    return (
      eventForm.title.trim() !== "" &&
      eventForm.date !== "" &&
      eventForm.time !== "" &&
      eventForm.location.trim() !== "" &&
      eventForm.duration !== "" &&
      eventForm.difficulty !== "" &&
      eventForm.maxParticipants !== "" &&
      eventForm.description.trim() !== ""
    )
  }

  // Filter events based on current filters
  const getFilteredEvents = (events: any[]) => {
    return events.filter(event => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Location filter
      const matchesLocation = locationFilter === "All Locations" || 
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      
      // Difficulty filter
      const matchesDifficulty = difficultyFilter === "All Difficulties" || 
        event.difficulty === difficultyFilter
      
      return matchesSearch && matchesLocation && matchesDifficulty
    })
  }

  // Handle form input changes
  const handleFormChange = (field: string, value: string) => {
    setEventForm(prev => ({ ...prev, [field]: value }))
    setSubmitError("") // Clear error when user starts typing
  }



  // Reset form when modal is closed
  const handleCloseModal = () => {
    setShowCreateForm(false)
    setEventForm({
      title: "",
      date: "",
      time: "",
      location: "",
      duration: "",
      difficulty: "",
      maxParticipants: "",
      description: "",
    })
    setSubmitError("")
  }

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      setLoadingEvents(true)
      setEventsError(null)
      
      const eventsRef = collection(db, "events")
      
      // Fetch all active events
      const eventsQuery = query(
        eventsRef,
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      )
      
      const querySnapshot = await getDocs(eventsQuery)
      
      const allEvents: any[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        allEvents.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        })
      })
      
      // Filter and separate events based on date and organizer
      const now = new Date()
      
      // Upcoming events: all future events (regardless of who created them)
      const upcoming = allEvents.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate > now
      })
      
      // My events: only events created by the current user (both past and future)
      const myEventsList = allEvents.filter(event => event.organizerId === user?.uid)
      
      // Past events: events that have already passed (regardless of who created them)
      const pastEventsList = allEvents.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate < now
      })
      
      setUpcomingEvents(upcoming)
      setMyEvents(myEventsList)
      setPastEvents(pastEventsList)
      
    } catch (err: any) {
      console.error("Error fetching events:", err)
      setEventsError("Failed to load events. Please try again.")
    } finally {
      setLoadingEvents(false)
    }
  }

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [user])

  // Refresh events after creating a new one
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setSubmitError("You must be logged in to create an event")
      return
    }

    if (!isFormValid()) {
      setSubmitError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const eventData = {
        title: eventForm.title.trim(),
        organizer: user.email || "Anonymous",
        organizerId: user.uid,
        date: eventForm.date,
        time: eventForm.time,
        location: eventForm.location.trim(),
        participants: 0,
        maxParticipants: parseInt(eventForm.maxParticipants),
        description: eventForm.description.trim(),
        difficulty: eventForm.difficulty,
        duration: eventForm.duration,
        supplies: "Provided", // Default value
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      }

      const docRef = await addDoc(collection(db, "events"), eventData)
      console.log("Event created successfully with ID:", docRef.id)

      // Reset form and close modal
      setEventForm({
        title: "",
        date: "",
        time: "",
        location: "",
        duration: "",
        difficulty: "",
        maxParticipants: "",
        description: "",
      })
      setShowCreateForm(false)
      
      // Refresh events instead of reloading page
      await fetchEvents()
      
    } catch (error: any) {
      console.error("Error creating event:", error)
      setSubmitError(error.message || "Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
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
            { id: "past", label: "Past Events", count: pastEvents.length },
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

        {/* Filters and Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option>All Locations</option>
            <option>Manhattan</option>
            <option>Brooklyn</option>
            <option>Queens</option>
            <option>Bronx</option>
            <option>Staten Island</option>
          </select>
          <select 
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Events Grid */}
        {loadingEvents ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading events...</span>
          </div>
        ) : eventsError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{eventsError}</p>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : getFilteredEvents(activeTab === "upcoming" ? upcomingEvents : activeTab === "my-events" ? myEvents : pastEvents).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {activeTab === "upcoming" 
                ? "No upcoming events found." 
                : activeTab === "my-events" 
                ? "You haven't created any events yet."
                : "No past events found."
              }
            </p>
            <p className="text-gray-400">
              {activeTab === "upcoming" 
                ? "Be the first to create an event!" 
                : activeTab === "my-events" 
                ? "Create your first cleanup event!"
                : "Start participating in cleanups to see your history here."
              }
            </p>
            {activeTab === "my-events" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Create Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredEvents(activeTab === "upcoming" ? upcomingEvents : activeTab === "my-events" ? myEvents : pastEvents).map((event, index) => (
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
                  {event.organizerId === user?.uid ? (
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
        )}


      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">Create Cleanup Event</h2>
              <button onClick={handleCloseModal} className="text-green-400 hover:text-green-600 text-2xl">
                ×
              </button>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Event Title</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter event title"
                  value={eventForm.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={eventForm.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Time</label>
                  <input
                    type="time"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={eventForm.time}
                    onChange={(e) => handleFormChange("time", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter cleanup location"
                  value={eventForm.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Duration</label>
                  <select 
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={eventForm.duration}
                    onChange={(e) => handleFormChange("duration", e.target.value)}
                  >
                    <option value="">Select duration</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="5+ hours">5+ hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Difficulty</label>
                  <select 
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    value={eventForm.difficulty}
                    onChange={(e) => handleFormChange("difficulty", e.target.value)}
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Max Participants</label>
                  <input
                    type="number"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="50"
                    min="1"
                    value={eventForm.maxParticipants}
                    onChange={(e) => handleFormChange("maxParticipants", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Describe your cleanup event..."
                  value={eventForm.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3 border-2 border-green-200 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Event</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
