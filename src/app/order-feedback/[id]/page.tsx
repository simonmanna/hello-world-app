// app/order-feedback/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface OrderFeedback {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  status: "active" | "inactive" | "deleted";
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  delivery_rating: number | null;
  food_quality_rating: number;
  service_rating: number;
}

interface OrderDetails {
  id: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
}

export default function FeedbackDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [feedback, setFeedback] = useState<OrderFeedback | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedbackDetails = async () => {
      try {
        setLoading(true);

        // Fetch feedback details
        const feedbackResponse = await fetch(
          `/api/order-feedback/${params.id}`
        );

        if (!feedbackResponse.ok) {
          throw new Error("Failed to fetch feedback details");
        }

        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData);

        // Fetch order details
        const orderResponse = await fetch(
          `/api/orders/${feedbackData.order_id}`
        );

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrderDetails(orderData);
        }

        // Fetch user details (if not anonymous)
        if (!feedbackData.is_anonymous) {
          const userResponse = await fetch(
            `/api/users/${feedbackData.user_id}`
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackDetails();
  }, [params.id]);

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "deleted"
  ) => {
    if (!feedback) return;

    try {
      const response = await fetch(`/api/order-feedback/${feedback.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback status");
      }

      // Update local state
      setFeedback({
        ...feedback,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating feedback status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!feedback || !confirm("Are you sure you want to delete this feedback?"))
      return;

    try {
      const response = await fetch(`/api/order-feedback/${feedback.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete feedback");
      }

      // Navigate back to the feedback list
      router.push("/order-feedback");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback. Please try again.");
    }
  };

  const handleBackClick = () => {
    router.push("/order-feedback");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading feedback details...</p>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Feedback not found"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackClick}>Back to Feedback List</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={handleBackClick}>
          &larr; Back to Feedback List
        </Button>

        <div className="flex gap-2">
          {feedback.status !== "active" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("active")}
            >
              Mark as Active
            </Button>
          )}
          {feedback.status !== "inactive" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("inactive")}
            >
              Mark as Inactive
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            Delete Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Feedback Overview</CardTitle>
              <Badge
                variant={
                  feedback.status === "active"
                    ? "success"
                    : feedback.status === "inactive"
                    ? "warning"
                    : "destructive"
                }
              >
                {feedback.status}
              </Badge>
            </div>
            <CardDescription>
              Submitted on{" "}
              {format(new Date(feedback.created_at), "MMMM d, yyyy")} at{" "}
              {format(new Date(feedback.created_at), "h:mm a")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Rating</h3>
                <div className="flex items-center">
                  <StarRating value={feedback.rating} readOnly size="lg" />
                  <span className="ml-2 text-2xl font-bold">
                    {feedback.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Category Ratings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Food Quality</h4>
                    <StarRating value={feedback.food_quality_rating} readOnly />
                    <p className="mt-1 text-sm text-gray-600">
                      {feedback.food_quality_rating}/5
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Service</h4>
                    <StarRating value={feedback.service_rating} readOnly />
                    <p className="mt-1 text-sm text-gray-600">
                      {feedback.service_rating}/5
                    </p>
                  </div>

                  {feedback.delivery_rating && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Delivery</h4>
                      <StarRating value={feedback.delivery_rating} readOnly />
                      <p className="mt-1 text-sm text-gray-600">
                        {feedback.delivery_rating}/5
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {feedback.comment && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Comment</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{feedback.comment}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.is_anonymous ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-500 text-xl">?</span>
                  </div>
                  <p className="text-gray-600">Anonymous Feedback</p>
                </div>
              ) : user ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-500">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/customers/${user.id}`)}
                  >
                    View Customer Profile
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">Loading customer information...</p>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetails ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-medium">{orderDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(orderDetails.created_at),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge>{orderDetails.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-medium">
                      ${orderDetails.total.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/orders/${orderDetails.id}`)}
                  >
                    View Order Details
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">Loading order information...</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono">{feedback.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>
                    {format(new Date(feedback.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>
                    {format(new Date(feedback.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
                {feedback.deleted_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deleted:</span>
                    <span>
                      {format(new Date(feedback.deleted_at), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
