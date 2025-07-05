"use client"

import { useState } from "react"
import { MapPin, Navigation, Users } from "lucide-react"

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [filterType, setFilterType] = useState("all")

  const cleanupLocations = [
    {
      id: 1,
      name: "Central Park East Side",
      type: "park",
      urgency: "high",
      description: "Heavy litter accumulation near the playground area",
      reportedBy: "Sarah M.",
      reportedDate: "2 days ago",
      volunteers: 12,
      coordinates: { lat: 40.7829, lng: -73.9654 },
    },
    {
      id: 2,
      name: "Brooklyn Bridge Walkway",
      type: "public",
      urgency: "medium",
      description: "Tourist litter and food waste along the pedestrian path",
      reportedBy: "Mike R.",
      reportedDate: "1 week ago",
      volunteers: 8,
      coordinates: { lat: 40.7061, lng: -73.9969 },
    },
    {
      id: 3,
      name: "Coney Island Beach",
      type: "beach",
      urgency: "high",
      description: "Plastic waste and debris washed up after recent storm",
      reportedBy: "Emma L.",
      reportedDate: "3 days ago",
      volunteers: 25,
      coordinates: { lat: 40.5755, lng: -73.9707 },
    },
    {
      id: 4,
      name: "Hudson River Trail",
      type: "trail",
      urgency: "low",
      description: "Scattered litter along the jogging path",
      reportedBy: "Alex K.",
      reportedDate: "5 days ago",
      volunteers: 6,
      coordinates: { lat: 40.7589, lng: -74.006 },
    },
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "park":
        return "🌳"
      case "beach":
        return "🏖️"
      case "trail":
        return "🥾"
      case "public":
        return "🏛️"
      default:
        return "📍"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 lg:h-[600px] animate-fade-in">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Simulated Map */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center"></div>
                </div>

                {/* Map Pins */}
                {cleanupLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 animate-fade-in`}
                    style={{
                      left: `${20 + index * 20}%`,
                      top: `${30 + index * 15}%`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div
                      className={`w-4 h-4 ${getUrgencyColor(location.urgency)} rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform`}
                    ></div>
                    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs font-medium text-green-800 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                      {location.name}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <MapPin className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Interactive Map</p>
                  <p className="text-sm text-green-500">Click on pins to view cleanup locations</p>
                </div>
              </div>

              {/* Map Controls */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-green-700">High Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-green-700">Medium Priority</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">Low Priority</span>
                  </div>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Navigation className="h-4 w-4" />
                  <span>My Location</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location Details & List */}
          <div className="space-y-6">
            {/* Selected Location Details */}
            {selectedLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-scale-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(selectedLocation.type)}</span>
                    <div>
                      <h3 className="font-bold text-green-800">{selectedLocation.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 ${getUrgencyColor(selectedLocation.urgency)} rounded-full`}></div>
                        <span className="text-sm text-green-600 capitalize">{selectedLocation.urgency} Priority</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLocation(null)} className="text-green-400 hover:text-green-600">
                    ×
                  </button>
                </div>

                <p className="text-green-700 mb-4">{selectedLocation.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Reported by:</span>
                    <span className="font-medium text-green-800">{selectedLocation.reportedBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Reported:</span>
                    <span className="font-medium text-green-800">{selectedLocation.reportedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Volunteers:</span>
                    <span className="font-medium text-green-800">{selectedLocation.volunteers} interested</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                    Join Cleanup
                  </button>
                  <button className="px-4 py-3 border-2 border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition-colors">
                    <Navigation className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Locations List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up">
              <h3 className="font-bold text-green-800 mb-4">Nearby Locations</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cleanupLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedLocation?.id === location.id
                        ? "bg-green-100 border-2 border-green-300"
                        : "bg-green-50 hover:bg-green-100"
                    }`}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getTypeIcon(location.type)}</span>
                        <div>
                          <h4 className="font-medium text-green-800">{location.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 ${getUrgencyColor(location.urgency)} rounded-full`}></div>
                            <span className="text-xs text-green-600 capitalize">{location.urgency}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xs text-green-600">
                          <Users className="h-3 w-3 mr-1" />
                          {location.volunteers}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mb-2 line-clamp-2">{location.description}</p>
                    <div className="flex items-center justify-between text-xs text-green-500">
                      <span>Reported {location.reportedDate}</span>
                      <span>by {location.reportedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white animate-fade-in">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white bg-opacity-20 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm">
                  Report New Location
                </button>
                <button className="w-full py-3 bg-white bg-opacity-20 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm">
                  Organize Cleanup Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
