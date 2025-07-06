"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Camera, Upload, MapPin, CheckCircle, Loader, AlertTriangle, Flag, Target, X } from "lucide-react"
import Link from "next/link"
import { addDoc, collection, serverTimestamp, GeoPoint, getDocs, query, orderBy, limit, doc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/firebase/firebase"
import { useAuth } from "@/hooks/use-auth"

type TabType = "report" | "complete"

interface CleanupLocation {
  id: string;
  locationName: string;
  type: string;
  urgency: string;
  description: string;
  createdBy: string;
  createdAt: any;
  status: string;
  location: {
    latitude: number;
    longitude: number;
  };
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<TabType>("report")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<CleanupLocation | null>(null)
  const [error, setError] = useState("")
  const { user } = useAuth()

  // Report Location Form Data
  const [reportFormData, setReportFormData] = useState({
    location: "",
    description: "",
    urgency: "medium",
    type: "public",
    dirtyImage: null as File | null,
    latitude: "",
    longitude: "",
  })

  // Image preview states
  const [dirtyImagePreview, setDirtyImagePreview] = useState<string | null>(null)
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null)

  // Complete Cleanup Form Data
  const [completeFormData, setCompleteFormData] = useState({
    selectedLocationId: "",
    afterImage: null as File | null,
    description: "",
  })

  // Cleanup locations state
  const [cleanupLocations, setCleanupLocations] = useState<CleanupLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationsError, setLocationsError] = useState<string | null>(null)

  // Add state for AI result and loading
  const [aiResult, setAiResult] = useState<null | { score: number; is_trashy: boolean; is_clean: boolean }>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Add state for AI result and loading for after image
  const [afterAiResult, setAfterAiResult] = useState<null | { score: number; is_trashy: boolean; is_clean: boolean }>(null);
  const [afterAiLoading, setAfterAiLoading] = useState(false);
  const [afterAiError, setAfterAiError] = useState<string | null>(null);

  // Fetch cleanup locations from Firestore
  const fetchCleanupLocations = async () => {
    try {
      setLoadingLocations(true)
      setLocationsError(null)
      
      const cleanupsRef = collection(db, "cleanups")
      // Only fetch locations that are reported (not completed)
      const q = query(
        cleanupsRef, 
        orderBy("createdAt", "desc"), 
        limit(50)
      )
      const querySnapshot = await getDocs(q)
      
      const locations: CleanupLocation[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Convert Firestore GeoPoint to regular coordinates
        const locationData = {
          id: doc.id,
          locationName: data.locationName || "Unknown Location",
          type: data.type || "public",
          urgency: data.urgency || "medium",
          description: data.description || "No description available",
          createdBy: data.createdBy || "Anonymous",
          createdAt: data.createdAt,
          status: data.status || "reported",
          location: {
            latitude: data.location?.latitude || data.location?._lat || 0,
            longitude: data.location?.longitude || data.location?._lng || 0,
          },
          beforePhotoUrl: data.beforePhotoUrl || "",
          afterPhotoUrl: data.afterPhotoUrl || "",
        }
        
        // Only add locations with valid coordinates and that are reported (not completed)
        if (locationData.location.latitude !== 0 && 
            locationData.location.longitude !== 0 && 
            locationData.status === "reported") {
          locations.push(locationData)
        }
      })
      
      setCleanupLocations(locations)
    } catch (err: any) {
      console.error("Error fetching cleanup locations:", err)
      setLocationsError("Failed to load cleanup locations. Please try again.")
    } finally {
      setLoadingLocations(false)
    }
  }

  // Fetch locations when switching to complete tab
  useEffect(() => {
    if (activeTab === "complete") {
      fetchCleanupLocations()
    }
  }, [activeTab])

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date"
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return "Just now"
      if (diffInHours < 24) return `${diffInHours} hours ago`
      if (diffInHours < 48) return "1 day ago"
      return `${Math.floor(diffInHours / 24)} days ago`
    } catch (err) {
      return "Unknown date"
    }
  }

  // Convert image file to base64 string with compression
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with quality compression (0.7 = 70% quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        
        // Check if the compressed image is still too large
        if (compressedDataUrl.length > 800000) { // ~800KB limit
          // Further compress with lower quality
          const furtherCompressed = canvas.toDataURL('image/jpeg', 0.5)
          resolve(furtherCompressed)
        } else {
          resolve(compressedDataUrl)
        }
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "dirty" | "after") => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      if (type === "dirty") {
        setReportFormData(prev => ({ ...prev, dirtyImage: file }))
        setDirtyImagePreview(previewUrl)
        // --- AI backend call for dirty image ---
        setAiResult(null)
        setAiError(null)
        setAiLoading(true)
        try {
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            throw new Error("AI analysis failed");
          }
          const data = await res.json();
          setAiResult(data);
        } catch (err: any) {
          setAiError(err.message || "AI analysis failed");
        } finally {
          setAiLoading(false);
        }
        // --- end AI backend call ---
      } else {
        setCompleteFormData(prev => ({ ...prev, afterImage: file }))
        setAfterImagePreview(previewUrl)
        // --- AI backend call for after image ---
        setAfterAiResult(null)
        setAfterAiError(null)
        setAfterAiLoading(true)
        try {
          const formData = new FormData();
          formData.append("image", file);
          const res = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            throw new Error("AI analysis failed");
          }
          const data = await res.json();
          setAfterAiResult(data);
        } catch (err: any) {
          setAfterAiError(err.message || "AI analysis failed");
        } finally {
          setAfterAiLoading(false);
        }
        // --- end AI backend call ---
      }
    }
  }

  const removeImage = (type: "dirty" | "after") => {
    if (type === "dirty") {
      setReportFormData(prev => ({ ...prev, dirtyImage: null }))
      if (dirtyImagePreview) {
        URL.revokeObjectURL(dirtyImagePreview)
        setDirtyImagePreview(null)
      }
    } else {
      setCompleteFormData(prev => ({ ...prev, afterImage: null }))
      if (afterImagePreview) {
        URL.revokeObjectURL(afterImagePreview)
        setAfterImagePreview(null)
      }
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!user) {
      setError("You must be logged in to report a location")
      return
    }

    if (!reportFormData.dirtyImage) {
      setError("Please upload a photo of the dirty area")
      return
    }

    if (!reportFormData.latitude || !reportFormData.longitude) {
      setError("Please provide valid coordinates for the location")
      return
    }

    setIsProcessing(true)

    try {
      // Convert image to base64 string
      const beforePhotoUrl = await convertImageToBase64(reportFormData.dirtyImage)

      // Create the cleanup document in Firestore
      const cleanupData = {
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        beforePhotoUrl: beforePhotoUrl, // Store base64 string directly
        afterPhotoUrl: "", // Empty for new reports
        location: new GeoPoint(
          parseFloat(reportFormData.latitude),
          parseFloat(reportFormData.longitude)
        ),
        rating: 0, // Default rating
        description: reportFormData.description,
        status: "reported", // New status for reported locations
        urgency: reportFormData.urgency,
        type: reportFormData.type,
        locationName: reportFormData.location,
      }

      const docRef = await addDoc(collection(db, "cleanups"), cleanupData)
      
      console.log("Cleanup location reported successfully with ID:", docRef.id)
      
      setIsProcessing(false)
      setIsVerified(true)
    } catch (error: any) {
      console.error("Error reporting cleanup location:", error)
      setError(error.message || "Failed to report location. Please try again.")
      setIsProcessing(false)
    }
  }

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocation || !completeFormData.afterImage) return

    setIsProcessing(true)

    try {
      // Convert after image to base64 string
      const afterPhotoUrl = await convertImageToBase64(completeFormData.afterImage)

      // Update the cleanup document in Firestore
      const cleanupDocRef = doc(db, "cleanups", selectedLocation.id)
      
      const updateData = {
        afterPhotoUrl: afterPhotoUrl,
        status: "completed",
        completedAt: serverTimestamp(),
        completedBy: user?.uid || "anonymous",
        completionDescription: completeFormData.description || "",
      }

      await updateDoc(cleanupDocRef, updateData)
      
      console.log("Cleanup completed successfully for location:", selectedLocation.id)
      
      // Simulate AI processing for cleanup completion
    setTimeout(() => {
      setIsProcessing(false)
      setIsVerified(true)
    }, 3000)
    } catch (error: any) {
      console.error("Error completing cleanup:", error)
      setError(error.message || "Failed to complete cleanup. Please try again.")
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setIsProcessing(false)
    setIsVerified(false)
    setSelectedLocation(null)
    setError("")
    setReportFormData({
      location: "",
      description: "",
      urgency: "medium",
      type: "public",
      dirtyImage: null,
      latitude: "",
      longitude: "",
    })
    setCompleteFormData({
      selectedLocationId: "",
      afterImage: null,
      description: "",
    })
    // Clean up preview URLs
    if (dirtyImagePreview) {
      URL.revokeObjectURL(dirtyImagePreview)
      setDirtyImagePreview(null)
    }
    if (afterImagePreview) {
      URL.revokeObjectURL(afterImagePreview)
      setAfterImagePreview(null)
    }
  }

  const handleLocationSelect = (location: CleanupLocation) => {
    setSelectedLocation(location)
    setCompleteFormData(prev => ({ ...prev, selectedLocationId: location.id }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReportFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Could not get your current location. Please enter coordinates manually.")
        }
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isVerified ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Upload & Report</h2>
              <p className="text-green-600">Report new cleanup locations or complete existing ones</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-green-100 p-1 rounded-xl mb-8">
              <button
                onClick={() => setActiveTab("report")}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "report"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                <Flag className="h-4 w-4" />
                <span>Report Location</span>
              </button>
              <button
                onClick={() => setActiveTab("complete")}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "complete"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-green-600 hover:text-green-700"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Complete Cleanup</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Report Location Tab */}
            {activeTab === "report" && (
              <form onSubmit={handleReportSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-orange-100 rounded-full mb-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Report a Dirty Area</h3>
                  <p className="text-green-600">Help identify areas that need cleanup</p>
                </div>

              {/* Location Input */}
              <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Location Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-green-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter the location name (e.g., Central Park East Side)"
                      value={reportFormData.location}
                      onChange={(e) => setReportFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

                {/* Coordinates Input */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="40.7829"
                      value={reportFormData.latitude}
                      onChange={(e) => setReportFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="-73.9654"
                      value={reportFormData.longitude}
                      onChange={(e) => setReportFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Use My Location
                    </button>
                  </div>
                </div>

                {/* Type and Urgency Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Area Type</label>
                    <select
                      value={reportFormData.type}
                      onChange={(e) => setReportFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="public">Public Space</option>
                      <option value="park">Park</option>
                      <option value="beach">Beach</option>
                      <option value="trail">Trail</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">Urgency Level</label>
                    <select
                      value={reportFormData.urgency}
                      onChange={(e) => setReportFormData(prev => ({ ...prev, urgency: e.target.value }))}
                      className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Dirty Area Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Photo of Dirty Area</label>
                  {dirtyImagePreview && (
                    <div className="relative border-2 border-green-300 rounded-xl p-4">
                      <img
                        src={dirtyImagePreview}
                        alt="Dirty area preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("dirty")}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="mt-2">
                        {aiLoading && (
                          <div className="flex items-center text-sm text-gray-500"><Loader className="animate-spin mr-2 w-4 h-4" />Analyzing photo...</div>
                        )}
                        {aiError && (
                          <div className="text-red-500 text-sm">AI error: {aiError}</div>
                        )}
                        {aiResult && (
                          <div className="text-sm">
                            <span className="font-semibold">AI Score:</span> {aiResult.score} <br />
                            {aiResult.is_trashy ? (
                              <span className="text-red-600 font-semibold flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Trash detected!</span>
                            ) : (
                              <span className="text-green-600 font-semibold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Looks clean!</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Add file input if no image is selected */}
                  {!dirtyImagePreview && (
                    <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="dirty-image"
                        onChange={(e) => handleImageUpload(e, "dirty")}
                      />
                      <label htmlFor="dirty-image" className="cursor-pointer">
                        <Camera className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <p className="text-green-600 font-medium">Upload Photo</p>
                        <p className="text-sm text-green-500 mt-1">Show the dirty area</p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    required
                    className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Describe the type and extent of litter/debris..."
                    value={reportFormData.description}
                    onChange={(e) => setReportFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !reportFormData.dirtyImage || !reportFormData.location || !reportFormData.description || !reportFormData.latitude || !reportFormData.longitude}
                  className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Submitting Report...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </form>
            )}

            {/* Complete Cleanup Tab */}
            {activeTab === "complete" && (
              <form onSubmit={handleCompleteSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Complete a Cleanup</h3>
                  <p className="text-green-600">Mark an existing location as cleaned</p>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Select Cleanup Location</label>
                  
                  {locationsError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{locationsError}</p>
                    </div>
                  )}
                  
                  {loadingLocations ? (
                    <div className="border border-green-200 rounded-xl p-8 text-center">
                      <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
                      <p className="text-green-600">Loading cleanup locations...</p>
                    </div>
                  ) : cleanupLocations.length === 0 ? (
                    <div className="border border-green-200 rounded-xl p-8 text-center">
                      <p className="text-green-600 mb-2">No cleanup locations available</p>
                      <p className="text-sm text-green-500">All reported locations have been completed or no locations have been reported yet.</p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-green-200 rounded-xl">
                      {cleanupLocations.map((location) => (
                        <div
                          key={location.id}
                          className={`p-4 cursor-pointer transition-all duration-200 border-b border-green-100 last:border-b-0 ${
                            selectedLocation?.id === location.id
                              ? "bg-green-100 border-l-4 border-l-green-500"
                              : "hover:bg-green-50"
                          }`}
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getTypeIcon(location.type)}</span>
                              <div>
                                <h4 className="font-medium text-green-800">{location.locationName}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className={`w-2 h-2 ${getUrgencyColor(location.urgency)} rounded-full`}></div>
                                  <span className="text-xs text-green-600 capitalize">{location.urgency}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-600">
                                {formatDate(location.createdAt)}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-green-700 mt-2 line-clamp-2">{location.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* After Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">After Photo</label>
                  {afterImagePreview ? (
                    <div className="relative border-2 border-green-300 rounded-xl p-4">
                      <img
                        src={afterImagePreview}
                        alt="After cleanup preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage("after")}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="mt-2">
                        {afterAiLoading && (
                          <div className="flex items-center text-sm text-gray-500"><Loader className="animate-spin mr-2 w-4 h-4" />Analyzing photo...</div>
                        )}
                        {afterAiError && (
                          <div className="text-red-500 text-sm">AI error: {afterAiError}</div>
                        )}
                        {afterAiResult && (
                          <div className="text-sm">
                            <span className="font-semibold">AI Score:</span> {afterAiResult.score} <br />
                            {afterAiResult.is_trashy ? (
                              <span className="text-red-600 font-semibold flex items-center"><AlertTriangle className="w-4 h-4 mr-1" /> Trash detected!</span>
                            ) : (
                              <span className="text-green-600 font-semibold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Looks clean!</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="after-image"
                      onChange={(e) => handleImageUpload(e, "after")}
                    />
                    <label htmlFor="after-image" className="cursor-pointer">
                      <Camera className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">Upload After Photo</p>
                      <p className="text-sm text-green-500 mt-1">Show the cleaned area</p>
                    </label>
                  </div>
                  )}
              </div>

              {/* Description */}
              <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Cleanup Description (Optional)</label>
                <textarea
                  rows={4}
                  className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your cleanup experience..."
                    value={completeFormData.description}
                    onChange={(e) => setCompleteFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                  disabled={isProcessing || !selectedLocation || !completeFormData.afterImage}
                className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Processing with AI...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </button>
            </form>
            )}
          </div>
        ) : (
          /* Success State */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              {activeTab === "report" ? "Location Reported! 🚨" : "Cleanup Verified! 🎉"}
            </h2>
            <p className="text-lg text-green-600 mb-6">
              {activeTab === "report" 
                ? "Your report has been submitted successfully. Volunteers will be notified!"
                : "Your cleanup has been successfully verified by our AI system. You've earned 75 points!"
              }
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-2">Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Location</p>
                  <p className="font-medium text-green-800">
                    {activeTab === "report" ? reportFormData.location : selectedLocation?.locationName}
                  </p>
                </div>
                <div>
                  <p className="text-green-600">
                    {activeTab === "report" ? "Report Type" : "Points Earned"}
                  </p>
                  <p className="font-medium text-green-800">
                    {activeTab === "report" ? "Dirty Area Report" : "75 points"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                {activeTab === "report" ? "Report Another Location" : "Complete Another Cleanup"}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-green-600 border-2 border-green-200 rounded-xl font-medium hover:bg-green-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <Loader className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                {activeTab === "report" ? "Submitting Report..." : "AI Verification in Progress"}
              </h3>
              <p className="text-green-600">
                {activeTab === "report" 
                  ? "Your report is being submitted to our system..."
                  : "Our AI is analyzing your cleanup photos..."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
