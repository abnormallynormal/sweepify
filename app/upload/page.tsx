"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Upload, MapPin, CheckCircle, Loader } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    beforeImage: null as File | null,
    afterImage: null as File | null,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "before" | "after") => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      if (type === "before") {
        setFormData({ ...formData, beforeImage: file })
      } else {
        setFormData({ ...formData, afterImage: file })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsVerified(true)
    }, 3000)
  }

  const resetForm = () => {
    setUploadedImage(null)
    setIsProcessing(false)
    setIsVerified(false)
    setFormData({
      location: "",
      description: "",
      beforeImage: null,
      afterImage: null,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isVerified ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <Upload className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Document Your Cleanup</h2>
              <p className="text-green-600">Upload before and after photos to verify your environmental impact</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Cleanup Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-green-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter the location of your cleanup"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Before Image */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">Before Photo</label>
                  <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="before-image"
                      onChange={(e) => handleImageUpload(e, "before")}
                    />
                    <label htmlFor="before-image" className="cursor-pointer">
                      <Camera className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">Upload Before Photo</p>
                      <p className="text-sm text-green-500 mt-1">Show the area before cleanup</p>
                    </label>
                  </div>
                </div>

                {/* After Image */}
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">After Photo</label>
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
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Description (Optional)</label>
                <textarea
                  rows={4}
                  className="block w-full px-3 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your cleanup experience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !formData.beforeImage || !formData.afterImage}
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
          </div>
        ) : (
          /* Success State */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-scale-in">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">Cleanup Verified! 🎉</h2>
            <p className="text-lg text-green-600 mb-6">
              Your cleanup has been successfully verified by our AI system. You've earned{" "}
              <span className="font-bold text-green-700">75 points</span>!
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-green-800 mb-2">Impact Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Location</p>
                  <p className="font-medium text-green-800">{formData.location}</p>
                </div>
                <div>
                  <p className="text-green-600">Points Earned</p>
                  <p className="font-medium text-green-800">75 points</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Upload Another Cleanup
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
            <div className="bg-white rounded-2xl p-8 text-center animate-scale-in">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <Loader className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">AI Verification in Progress</h3>
              <p className="text-green-600">Our AI is analyzing your cleanup photos...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
