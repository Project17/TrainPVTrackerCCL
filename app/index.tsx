import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { BarChart2, ArrowRight, RefreshCw } from "lucide-react-native";
import ProgressSummary from "./components/ProgressSummary";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProgressStats = {
  totalUnits: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  overallPercentage: number;
};

export default function Dashboard() {
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalUnits: 64,
    completed: 0,
    inProgress: 0,
    notStarted: 64,
    overallPercentage: 0,
  });

  const [recentActivity, setRecentActivity] = useState<
    Array<{
      pvId: string;
      testId: string;
      action: string;
      newStatus: string;
      timestamp: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load overall progress
        const overallProgressStr =
          await AsyncStorage.getItem("overallProgress");
        if (overallProgressStr) {
          const overallProgress = JSON.parse(overallProgressStr);
          setProgressStats({
            totalUnits: overallProgress.totalPVs || 64,
            completed: overallProgress.completedCount || 0,
            inProgress: overallProgress.inProgressCount || 0,
            notStarted: overallProgress.notStartedCount || 64,
            overallPercentage: overallProgress.totalCompletion || 0,
          });
        }

        // Load recent activity
        const recentActivityStr = await AsyncStorage.getItem("recentActivity");
        if (recentActivityStr) {
          setRecentActivity(JSON.parse(recentActivityStr));
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up a refresh interval (every 5 seconds)
    const intervalId = setInterval(loadData, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-800">
            PV Progress Dashboard
          </Text>
          <Text className="text-gray-600 mt-1">
            Monitor test units PV01-PV64
          </Text>
        </View>

        {/* Progress Summary Component */}
        {isLoading ? (
          <View
            className="bg-white p-4 rounded-lg shadow-md w-full items-center justify-center"
            style={{ height: 300 }}
          >
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-2 text-gray-600">Loading progress data...</Text>
          </View>
        ) : (
          <ProgressSummary
            totalCompletion={progressStats.overallPercentage}
            completedCount={progressStats.completed}
            inProgressCount={progressStats.inProgress}
            notStartedCount={progressStats.notStarted}
            totalPVs={progressStats.totalUnits}
          />
        )}

        {/* Recent Activity Section */}
        <View className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-semibold text-gray-800">
              Recent Activity
            </Text>
            <TouchableOpacity
              onPress={async () => {
                setIsLoading(true);
                const recentActivityStr =
                  await AsyncStorage.getItem("recentActivity");
                if (recentActivityStr) {
                  setRecentActivity(JSON.parse(recentActivityStr));
                }
                setIsLoading(false);
              }}
              className="p-2"
            >
              <RefreshCw size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Activity items */}
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => {
              // Format the timestamp
              const activityTime = new Date(activity.timestamp);
              const now = new Date();
              const diffMs = now.getTime() - activityTime.getTime();
              const diffMins = Math.round(diffMs / 60000);
              const diffHours = Math.round(diffMs / 3600000);
              const timeAgo =
                diffMins < 60 ? `${diffMins}m ago` : `${diffHours}h ago`;

              // Format the status text
              const statusText =
                activity.newStatus === "completed"
                  ? "marked as complete"
                  : activity.newStatus === "in-progress"
                    ? "marked as in progress"
                    : "marked as not started";

              return (
                <View key={index} className="py-3 border-b border-gray-100">
                  <Text className="text-gray-800 font-medium">
                    PV{activity.pvId} updated
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    TestID #{activity.testId} {statusText}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-1">{timeAgo}</Text>
                </View>
              );
            })
          ) : (
            <View className="py-3 items-center">
              <Text className="text-gray-500">No recent activity</Text>
            </View>
          )}
        </View>

        {/* Quick Stats Section */}
        <View className="mt-6 flex-row justify-between">
          <View className="bg-white rounded-xl p-4 shadow-sm w-[48%]">
            <View className="bg-blue-100 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
              <BarChart2 size={20} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {progressStats.completed}
            </Text>
            <Text className="text-gray-600">Units Completed</Text>
          </View>

          <View className="bg-white rounded-xl p-4 shadow-sm w-[48%]">
            <View className="bg-amber-100 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
              <BarChart2 size={20} color="#f59e0b" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {progressStats.inProgress}
            </Text>
            <Text className="text-gray-600">Units In Progress</Text>
          </View>
        </View>

        {/* CCL Train Navigation Link */}
        <Link href="/ccl-train" asChild>
          <TouchableOpacity className="mt-6 bg-indigo-600 rounded-xl p-4 shadow-sm flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-semibold text-white">
                CCL Train
              </Text>
              <Text className="text-indigo-200">View all PV01-PV64 units</Text>
            </View>
            <ArrowRight size={24} color="white" />
          </TouchableOpacity>
        </Link>

        {/* Bottom spacing */}
        <View className="h-10" />
      </View>
    </ScrollView>
  );
}
