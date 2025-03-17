// app/order-feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";
import { format } from "date-fns";

// Define the types based on the database schema
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

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export default function OrderFeedbackPage() {
  const [feedback, setFeedback] = useState<OrderFeedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<OrderFeedback[]>([]);
  const [users, setUsers] = useState<Map<string, UserInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);

        // Replace with your actual API endpoint
        const response = await fetch("/api/order-feedback");

        if (!response.ok) {
          throw new Error("Failed to fetch feedback data");
        }

        const data = await response.json();
        setFeedback(data);
        setFilteredFeedback(data);

        // Fetch user information for each unique user
        const uniqueUserIds = [
          ...new Set(data.map((item: OrderFeedback) => item.user_id)),
        ];
        await fetchUserInfo(uniqueUserIds);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Fetch user information
  const fetchUserInfo = async (userIds: string[]) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      const userMap = new Map<string, UserInfo>();

      userData.forEach((user: UserInfo) => {
        userMap.set(user.id, user);
      });

      setUsers(userMap);
    } catch (err) {
      console.error("Error fetching user information:", err);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = [...feedback];

    // Status filter
    if (statusFilter !== "all") {
      results = results.filter((item) => item.status === statusFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const ratingValue = parseInt(ratingFilter, 10);
      results = results.filter((item) => item.rating === ratingValue);
    }

    // Search filter
    if (searchTerm) {
      results = results.filter((item) => {
        const commentMatch = item.comment
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const userInfo = users.get(item.user_id);
        const userMatch =
          userInfo && !item.is_anonymous
            ? userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              userInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
            : false;

        return commentMatch || userMatch;
      });
    }

    setFilteredFeedback(results);
  }, [statusFilter, ratingFilter, searchTerm, feedback, users]);

  const handleViewDetails = (id: string) => {
    router.push(`/order-feedback/${id}`);
  };

  // Calculate overall stats
  const calculateStats = () => {
    if (feedback.length === 0) return { average: 0, total: 0 };

    const total = feedback.length;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    const average = sum / total;

    return { average: parseFloat(average.toFixed(1)), total };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.refresh()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Order Feedback Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <p className="text-3xl font-bold mr-2">{stats.average}</p>
            <StarRating value={stats.average} readOnly />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {feedback.filter((item) => item.status === "active").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search by comment or user"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Order Feedback</CardTitle>
          <CardDescription>
            Showing {filteredFeedback.length} of {feedback.length} feedback
            items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No feedback found matching the current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((item) => {
                  const userInfo = users.get(item.user_id);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.order_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {item.is_anonymous ? (
                          <span className="text-gray-500">Anonymous</span>
                        ) : userInfo ? (
                          <div>
                            <div>{userInfo.name}</div>
                            <div className="text-xs text-gray-500">
                              {userInfo.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Loading...</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StarRating value={item.rating} readOnly />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.delivery_rating && (
                            <Badge variant="outline" className="text-xs">
                              Delivery: {item.delivery_rating}/5
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Food: {item.food_quality_rating}/5
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Service: {item.service_rating}/5
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "active"
                              ? "success"
                              : item.status === "inactive"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
