"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
const DEFAULT_REGION_CODES = ["vn"] as const;

type Coordinates = {
  lat: number;
  lng: number;
};

type Suggestion = {
  placeId: string;
  description: string;
};

type UseGoogleLocationSearchOptions = {
  initialLocation?: string;
  initialCoordinates?: Coordinates | null;
  minChars?: number;
  regionCodes?: readonly string[];
  isGoogleMapsLoaded?: boolean;
  googleMapsLoadError?: Error | undefined;
};

export default function useGoogleLocationSearch({
  initialLocation = "",
  initialCoordinates = null,
  minChars = 2,
  regionCodes,
  isGoogleMapsLoaded,
  googleMapsLoadError,
}: UseGoogleLocationSearchOptions = {}) {
  const [location, setLocation] = useState(initialLocation);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<Suggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | undefined>(undefined);

  const isLoaded = isGoogleMapsLoaded ?? (typeof window !== "undefined" && !!window.google);
  const loadError = googleMapsLoadError;
  const effectiveRegionCodes = useMemo(
    () => (regionCodes && regionCodes.length > 0 ? [...regionCodes] : [...DEFAULT_REGION_CODES]),
    [regionCodes]
  );

  useEffect(() => {
    if (!isLoaded || location.trim().length < minChars || !showSuggestions) {
      setSuggestionsData((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const fetchSuggestions = async () => {
      try {
        if (!sessionTokenRef.current && window.google) {
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }

        const request = {
          input: location,
          includedRegionCodes: effectiveRegionCodes,
          sessionToken: sessionTokenRef.current,
        };

        const { suggestions } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        const formatted = suggestions.flatMap((suggestion) => {
          const placePrediction = suggestion.placePrediction;

          if (!placePrediction) {
            return [];
          }

          return [
            {
              placeId: placePrediction.placeId,
              description: placePrediction.text.text,
            },
          ];
        });

        setSuggestionsData(formatted);
      } catch (error) {
        console.error("Lỗi Google Places API:", error);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [effectiveRegionCodes, isLoaded, location, minChars, showSuggestions]);

  const onLocationInputChange = (value: string) => {
    setLocation(value);
    setCoordinates(null);
    setShowSuggestions(true);
  };

  const selectSuggestion = async (placeId: string, description: string) => {
    setLocation(description);
    setShowSuggestions(false);
    setSuggestionsData([]);

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ placeId });

      if (response.results[0]) {
        const { lat, lng } = response.results[0].geometry.location;
        setCoordinates({ lat: lat(), lng: lng() });
      }

      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    } catch (error) {
      console.error("Lỗi lấy tọa độ:", error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setLocation("Đang lấy vị trí...");
    setIsLoadingAddress(true);
    setShowSuggestions(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        try {
          const geocoder = new window.google.maps.Geocoder();
          const response = await geocoder.geocode({
            location: { lat: latitude, lng: longitude },
          });

          if (response.results[0]) {
            setLocation(response.results[0].formatted_address);
          } else {
            setLocation(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error("Lỗi Geocoding:", error);
          setLocation(`${latitude}, ${longitude}`);
        } finally {
          setIsLoadingAddress(false);
        }
      },
      (error) => {
        console.error("Lỗi lấy vị trí GPS:", error);
        setLocation("");
        setIsLoadingAddress(false);
        toast.error("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí trên trình duyệt.");
      }
    );
  };

  const clearLocation = () => {
    setLocation("");
    setCoordinates(null);
    setSuggestionsData([]);
    setShowSuggestions(false);
  };

  return {
    location,
    coordinates,
    isLoadingAddress,
    showSuggestions,
    suggestionsData,
    isLoaded,
    loadError,
    setShowSuggestions,
    onLocationInputChange,
    selectSuggestion,
    getCurrentLocation,
    clearLocation,
  };
}
