"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Shield, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InitialsAvatar from "@/components/InitialsAvatar";
import GetQuoteModal from "@/components/GetQuoteModal";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

interface Review {
  id: string;
  rating: number;
  text: string;
  reviewerType: string;
  reviewedAt: string;
}

interface Tradesperson {
  id: string;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  reviewsData: Review[];
  location: string;
  distance: string;
  image: string | null;
  initials: string;
  verified: boolean;
  yearsExperience: number;
  description: string;
  hourlyRate: string;
  responseTime: string;
  phone: string;
  email: string;
}

export default function TradespersonProfile() {
  const params = useParams();
  const [tradesperson, setTradesperson] = useState<Tradesperson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchTradesperson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/trade-data/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setTradesperson(data.tradesperson);
        } else {
          setError(data.error || "Failed to fetch tradesperson details");
        }
      } catch (err) {
        setError("Failed to fetch tradesperson details");
        console.error("Error fetching tradesperson:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTradesperson();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error || !tradesperson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-brand-navy mb-4">
            Tradesperson Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The tradesperson you are looking for does not exist."}
          </p>
          <Button asChild>
            <Link href="/find-tradespeople">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Section>
      <Container size="wide" className="py-4 sm:py-6 lg:py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-4 sm:mb-6 text-sm sm:text-base" asChild>
          <Link href="/find-tradespeople">
            <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
            Back to Search
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  {tradesperson.image ? (
                    <img
                      src={tradesperson.image}
                      alt={tradesperson.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover mx-auto sm:mx-0"
                    />
                  ) : (
                    <InitialsAvatar
                      initials={tradesperson.initials}
                      size="lg"
                      className="w-20 h-20 sm:w-24 sm:h-24 text-xl sm:text-2xl mx-auto sm:mx-0"
                    />
                  )}

                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-0">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy text-center sm:text-left">
                          {tradesperson.name}
                        </h1>
                        {tradesperson.verified && (
                          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto sm:mx-0" />
                        )}
                      </div>
                      <div className="text-center sm:text-right">
                        {tradesperson.hourlyRate && (
                          <div className="text-lg sm:text-xl font-bold text-blue-700">
                            {tradesperson.hourlyRate}
                          </div>
                        )}
                        {tradesperson.responseTime && (
                          <div className="text-xs sm:text-sm text-gray-600">
                            Response: {tradesperson.responseTime}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 w-fit mx-auto sm:mx-0"
                      >
                        {tradesperson.trade}
                      </Badge>
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        {renderStars(tradesperson.rating)}
                        <span className="ml-1 font-semibold text-sm sm:text-base">
                          {tradesperson.rating || "No rating"}
                        </span>
                        <span className="text-gray-600 text-sm sm:text-base">
                          ({tradesperson.reviews} reviews)
                        </span>
                      </div>
                    </div>

                    {tradesperson.description && (
                      <p className="text-gray-700 mb-4 text-sm sm:text-base text-center sm:text-left">
                        {tradesperson.description}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-600">
                      {tradesperson.location && (
                        <div className="flex items-center justify-center sm:justify-start">
                          <MapPin className="w-4 h-4 mr-1" />
                          {tradesperson.location}
                          {tradesperson.distance ? ` • ${tradesperson.distance}` : ''}
                        </div>
                      )}
                      {tradesperson.yearsExperience > 0 && (
                        <div className="flex items-center justify-center sm:justify-start">
                          <Calendar className="w-4 h-4 mr-1" />
                          {tradesperson.yearsExperience} years experience
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-extrabold mb-4">
                  Reviews ({tradesperson.reviews})
                </h2>
                {tradesperson.reviewsData.length > 0 ? (
                  <div className="space-y-4">
                    {tradesperson.reviewsData.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {renderStars(review.rating)}
                            </div>
                            <span className="font-semibold text-sm sm:text-base">
                              {review.rating}/5
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.reviewedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm sm:text-base">{review.text}</p>
                        <span className="text-xs text-gray-500 capitalize">
                          {review.reviewerType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">
                    No reviews yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-extrabold mb-3 sm:mb-4 text-sm sm:text-base">Get in Touch</h3>
                <div className="space-y-3 sm:space-y-4">
                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-sm sm:text-base py-2 sm:py-3"
                    onClick={() => setShowQuoteModal(true)}
                  >
                    Get Quote
                  </Button>
                </div>

                <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Contact details will be shared after quote request
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-extrabold mb-3 sm:mb-4 text-sm sm:text-base">Statistics</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Total Reviews</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {tradesperson.reviews}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Average Rating</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {tradesperson.rating || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-xs sm:text-sm">Years Experience</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {tradesperson.yearsExperience}
                    </span>
                  </div>
                  {tradesperson.responseTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Response Time</span>
                      <span className="font-semibold text-sm sm:text-base">
                        {tradesperson.responseTime}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
      </Section>

      {/* Modals */}
      {tradesperson && (
        <GetQuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          tradesperson={{
            id: tradesperson.id,
            name: tradesperson.name,
            trade: tradesperson.trade,
          }}
        />
      )}
    </div>
  );
}
