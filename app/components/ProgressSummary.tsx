import React from "react";
import { View, Text } from "react-native";
import { BarChart, CheckCircle, Clock, AlertCircle } from "lucide-react-native";

interface ProgressSummaryProps {
  totalCompletion?: number;
  completedCount?: number;
  inProgressCount?: number;
  notStartedCount?: number;
  totalPVs?: number;
}

export default function ProgressSummary({
  totalCompletion = 0,
  completedCount = 0,
  inProgressCount = 0,
  notStartedCount = 0,
  totalPVs = 64,
}: ProgressSummaryProps) {
  // Calculate percentages for each status
  const completedPercentage = Math.round((completedCount / totalPVs) * 100);
  const inProgressPercentage = Math.round((inProgressCount / totalPVs) * 100);
  const notStartedPercentage = Math.round((notStartedCount / totalPVs) * 100);

  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          Progress Summary
        </Text>
        <BarChart size={24} color="#4F46E5" />
      </View>

      {/* Overall Progress Bar */}
      <View className="mb-6">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 font-medium">Overall Completion</Text>
          <Text className="text-gray-700 font-bold">{totalCompletion}%</Text>
        </View>
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${totalCompletion}%` }}
          />
        </View>
      </View>

      {/* Status Breakdown */}
      <Text className="text-gray-700 font-medium mb-3">Status Breakdown</Text>

      {/* Completed */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-gray-700 ml-2">Completed</Text>
          </View>
          <Text className="text-gray-700">
            {completedCount} PVs ({completedPercentage}%)
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${completedPercentage}%` }}
          />
        </View>
      </View>

      {/* In Progress */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <Clock size={16} color="#F59E0B" />
            <Text className="text-gray-700 ml-2">In Progress</Text>
          </View>
          <Text className="text-gray-700">
            {inProgressCount} PVs ({inProgressPercentage}%)
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-yellow-500 rounded-full"
            style={{ width: `${inProgressPercentage}%` }}
          />
        </View>
      </View>

      {/* Not Started */}
      <View className="mb-1">
        <View className="flex-row justify-between items-center mb-1">
          <View className="flex-row items-center">
            <AlertCircle size={16} color="#EF4444" />
            <Text className="text-gray-700 ml-2">Not Started</Text>
          </View>
          <Text className="text-gray-700">
            {notStartedCount} PVs ({notStartedPercentage}%)
          </Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${notStartedPercentage}%` }}
          />
        </View>
      </View>

      {/* Summary Text */}
      <View className="mt-4 p-3 bg-gray-50 rounded-md">
        <Text className="text-gray-600 text-sm">
          {completedCount} of {totalPVs} PV units completed. {inProgressCount}{" "}
          currently in progress.
        </Text>
      </View>
    </View>
  );
}
