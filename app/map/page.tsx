"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Users, Loader } from "lucide-react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import React from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow as GoogleInfoWindow } from "@react-google-maps/api";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";

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
  volunteers?: number;
}

export default function MapPage() {
  const position = { lat: 53.54, lng: 10 };
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<CleanupLocation | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [myLocation, setMyLocation] = useState(false);
  const [infoWindowOpen, setInfoWindowOpen] = useState<string | null>(null);
  const [cleanupLocations, setCleanupLocations] = useState<CleanupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: process.env.NEXT_PUBLIC_MAP_ID || "",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  
  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 40.7128,
    lng: -74.006,
  }); // Default to NYC

  // Fetch cleanup locations from Firestore
  const fetchCleanupLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cleanupsRef = collection(db, "cleanups");
      // Only fetch locations that are reported (pending cleanup)
      const q = query(
        cleanupsRef, 
        where("status", "==", "reported"),
        orderBy("createdAt", "desc"), 
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      
      const locations: CleanupLocation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
          volunteers: Math.floor(Math.random() * 20) + 1, // Random number for demo
        };
        
        // Only add locations with valid coordinates
        if (locationData.location.latitude !== 0 && locationData.location.longitude !== 0) {
          locations.push(locationData);
        }
      });
      
      setCleanupLocations(locations);
    } catch (err: any) {
      console.error("Error fetching cleanup locations:", err);
      setError("Failed to load cleanup locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleanupLocations();
  }, []);

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Handle error or fallback
        }
      );
    }
  }, [myLocation]);

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map: any) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: any) {
    setMap(null);
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#EF4444"; // red-500
      case "medium":
        return "#EAB308"; // yellow-500
      case "low":
        return "#22C55E"; // green-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "park":
        return "🌳";
      case "beach":
        return "🏖️";
      case "trail":
        return "🥾";
      case "public":
        return "🏛️";
      default:
        return "📍";
    }
  };

  const createCustomMarker = (urgency: string) => {
    const color = getUrgencyColor(urgency);
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 8,
    };
  };

  const handleMarkerClick = (location: CleanupLocation) => {
    setSelectedLocation(location);
    setInfoWindowOpen(location.id);
  };

  const handleInfoWindowClose = () => {
    setInfoWindowOpen(null);
    setSelectedLocation(null);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 48) return "1 day ago";
      return `${Math.floor(diffInHours / 24)} days ago`;
    } catch (err) {
      return "Unknown date";
    }
  };

  const filteredLocations = filterType === "all" 
    ? cleanupLocations 
    : cleanupLocations.filter(location => location.type === filterType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 lg:h-[600px] animate-fade-in">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                      gestureHandling: "greedy",
                      disableDefaultUI: true,
                      minZoom: 8,
                      maxZoom: 18,
                      styles: [
                        {
                          featureType: "poi",
                          elementType: "labels",
                          stylers: [{ visibility: "off" }],
                        },
                      ],
                    }}
                  >
                    {/* Plot cleanup locations as markers */}
                    {filteredLocations.map((location) => (
                      <React.Fragment key={location.id}>
                        <Marker
                          position={{ lat: location.location.latitude, lng: location.location.longitude }}
                          icon={createCustomMarker(location.urgency)}
                          onClick={() => handleMarkerClick(location)}
                          title={location.locationName}
                        />
                        
                        {/* Info Window for each marker */}
                        {infoWindowOpen === location.id && (
                          <GoogleInfoWindow
                            position={{ lat: location.location.latitude, lng: location.location.longitude }}
                            onCloseClick={handleInfoWindowClose}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -40),
                            }}
                          >
                            <div className="p-2 max-w-xs">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg">{getTypeIcon(location.type)}</span>
                                <div>
                                  <h3 className="font-bold text-green-800 text-sm">
                                    {location.locationName}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: getUrgencyColor(location.urgency) }}
                                    ></div>
                                    <span className="text-xs text-green-600 capitalize">
                                      {location.urgency} Priority
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-green-700 mb-2 line-clamp-2">
                                {location.description}
                              </p>
                              <div className="flex items-center justify-between text-xs text-green-500">
                                <span>{location.volunteers} volunteers</span>
                                <span>{formatDate(location.createdAt)}</span>
                              </div>
                            </div>
                          </GoogleInfoWindow>
                        )}
                      </React.Fragment>
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-green-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
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
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setMyLocation(!myLocation)}
              >
                <Navigation className="h-4 w-4" />
                <span>My Location</span>
              </button>
            </div>
          </div>

          {/* Location Details & List */}
          <div className="space-y-6">
            {/* Selected Location Details */}
            {selectedLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-scale-in">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getTypeIcon(selectedLocation.type)}
                    </span>
                    <div>
                      <h3 className="font-bold text-green-800">
                        {selectedLocation.locationName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getUrgencyColor(selectedLocation.urgency) }}
                        ></div>
                        <span className="text-sm text-green-600 capitalize">
                          {selectedLocation.urgency} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLocation(null);
                      setInfoWindowOpen(null);
                    }}
                    className="text-green-400 hover:text-green-600"
                  >
                    ×
                  </button>
                </div>

                <p className="text-green-700 mb-4">
                  {selectedLocation.description}
                </p>

                {selectedLocation.beforePhotoUrl && (
                  <div className="mb-4">
                    <img 
                      src={selectedLocation.beforePhotoUrl} 
                      alt="Before cleanup" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <p className="text-xs text-green-600 mt-1">Before photo</p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Status:</span>
                    <span className="font-medium text-green-800 capitalize">
                      {selectedLocation.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Reported:</span>
                    <span className="font-medium text-green-800">
                      {formatDate(selectedLocation.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">Volunteers:</span>
                    <span className="font-medium text-green-800">
                      {selectedLocation.volunteers} interested
                    </span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-green-800">
                  Cleanup Locations ({filteredLocations.length})
                </h3>
                {loading && <Loader className="h-4 w-4 animate-spin text-green-600" />}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
                    <p className="text-green-600">Loading locations...</p>
                  </div>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-green-600">No cleanup locations found.</p>
                  <p className="text-sm text-green-500 mt-1">Be the first to report a location!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedLocation?.id === location.id
                          ? "bg-green-100 border-2 border-green-300"
                          : "bg-green-50 hover:bg-green-100"
                      }`}
                      onClick={() => handleMarkerClick(location)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {getTypeIcon(location.type)}
                          </span>
                          <div>
                            <h4 className="font-medium text-green-800">
                              {location.locationName}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getUrgencyColor(location.urgency) }}
                              ></div>
                              <span className="text-xs text-green-600 capitalize">
                                {location.urgency}
                              </span>
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
                      <p className="text-sm text-green-700 mb-2 line-clamp-2">
                        {location.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-green-500">
                        <span>Reported {formatDate(location.createdAt)}</span>
                        <span className="capitalize">{location.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
