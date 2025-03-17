// src/app/rewards/page.js
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  Loader2,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Award,
} from "lucide-react";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [selectedReward, setSelectedReward] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fetch rewards data
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);

        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*")
          .order("last_updated", { ascending: false });

        if (rewardsError) throw rewardsError;

        setRewards(rewardsData || []);

        // Get unique user_ids to fetch their profiles
        const userIds = [
          ...new Set(
            rewardsData.map((reward) => reward.user_id).filter((id) => id)
          ),
        ];

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, phone_number, email")
            .in("id", userIds);

          if (profilesError) throw profilesError;

          // Create a map of user_id to profile
          const profileMap = {};
          profilesData.forEach((profile) => {
            profileMap[profile.id] = profile;
          });

          setUserProfiles(profileMap);
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();

    // Setup real-time subscription
    const rewardsSubscription = supabase
      .channel("rewards-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rewards" },
        () => {
          fetchRewards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rewardsSubscription);
    };
  }, []);

  // Update rewards points
  const updateRewardPoints = async (rewardId, pointsChange) => {
    try {
      setProcessing(true);

      // First get the current points
      const { data: currentReward, error: fetchError } = await supabase
        .from("rewards")
        .select("points")
        .eq("id", rewardId)
        .single();

      if (fetchError) throw fetchError;

      const newPoints = Math.max(0, currentReward.points + pointsChange);

      const { error: updateError } = await supabase
        .from("rewards")
        .update({
          points: newPoints,
          last_updated: new Date().toISOString(),
        })
        .eq("id", rewardId);

      if (updateError) throw updateError;

      // Update the local state
      setRewards(
        rewards.map((reward) =>
          reward.id === rewardId
            ? {
                ...reward,
                points: newPoints,
                last_updated: new Date().toISOString(),
              }
            : reward
        )
      );

      setShowAddPoints(false);
      setPointsToAdd(0);
    } catch (error) {
      console.error("Error updating reward points:", error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Get user display name
  const getUserDisplayName = (userId) => {
    const profile = userProfiles[userId];
    if (!profile) return "Unknown User";
    return (
      `${profile.full_name || ""}`.trim() || profile.email || "Unnamed User"
    );
  };

  // Filter rewards by search query
  const filteredRewards = rewards.filter((reward) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const profile = userProfiles[reward.user_id];

    // Search in profile details if profile exists
    if (profile) {
      return (
        (profile.full_name &&
          profile.full_name.toLowerCase().includes(searchLower)) ||
        (profile.email && profile.email.toLowerCase().includes(searchLower))
      );
    }

    // If no profile or no match, return false
    return false;
  });

  // Calculate rewards stats
  const totalPoints = rewards.reduce(
    (sum, reward) => sum + (reward.points || 0),
    0
  );
  const averagePoints =
    rewards.length > 0 ? Math.round(totalPoints / rewards.length) : 0;
  const maxPoints =
    rewards.length > 0
      ? Math.max(...rewards.map((reward) => reward.points || 0))
      : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Award className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">Customer Rewards</h1>
            </div>

            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex items-center bg-white/20 rounded-md px-3 py-1">
                <span className="text-sm font-medium mr-2">Total Points:</span>
                <span className="font-bold">
                  {totalPoints.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center bg-white/20 rounded-md px-3 py-1">
                <span className="text-sm font-medium mr-2">Average:</span>
                <span className="font-bold">
                  {averagePoints.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center bg-white/20 rounded-md px-3 py-1">
                <span className="text-sm font-medium mr-2">Top Score:</span>
                <span className="font-bold">{maxPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="ml-2 bg-transparent outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
            <button
              className="mt-2 text-sm text-red-600 hover:text-red-800"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
            <p className="mt-2 text-gray-500">Loading rewards data...</p>
          </div>
        ) : (
          <>
            {/* Rewards List */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Customer
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Points
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">
                      Last Updated
                    </th>
                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRewards.length > 0 ? (
                    filteredRewards.map((reward) => (
                      <tr key={reward.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          {reward.user_id ? (
                            getUserDisplayName(reward.user_id)
                          ) : (
                            <span className="text-gray-400 italic">
                              No user assigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-mono font-medium">
                          {reward.points?.toLocaleString() || 0}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {formatDate(reward.last_updated)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {selectedReward === reward.id && showAddPoints ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    setPointsToAdd((prev) =>
                                      Math.max(prev - 10, -reward.points)
                                    )
                                  }
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  disabled={processing}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </button>
                                <input
                                  type="number"
                                  className="w-16 bg-gray-50 rounded border border-gray-300 text-center"
                                  value={pointsToAdd}
                                  onChange={(e) =>
                                    setPointsToAdd(
                                      parseInt(e.target.value || 0)
                                    )
                                  }
                                  disabled={processing}
                                />
                                <button
                                  onClick={() =>
                                    setPointsToAdd((prev) => prev + 10)
                                  }
                                  className="p-1 text-green-500 hover:bg-green-50 rounded"
                                  disabled={processing}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    updateRewardPoints(reward.id, pointsToAdd)
                                  }
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
                                  disabled={processing}
                                >
                                  {processing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReward(null);
                                    setShowAddPoints(false);
                                    setPointsToAdd(0);
                                  }}
                                  className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
                                  disabled={processing}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedReward(reward.id);
                                    setShowAddPoints(true);
                                    setPointsToAdd(0);
                                  }}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                                  title="Adjust points"
                                >
                                  <Award className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    updateRewardPoints(reward.id, 10)
                                  }
                                  className="p-2 text-green-500 hover:bg-green-50 rounded"
                                  title="Add 10 points"
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    updateRewardPoints(reward.id, -10)
                                  }
                                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                                  title="Subtract 10 points"
                                  disabled={reward.points < 10}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-8 px-4 text-center text-gray-500"
                      >
                        {searchQuery
                          ? "No customers found matching your search."
                          : "No reward records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination or Load More could be added here */}
          </>
        )}
      </div>
    </div>
  );
}
