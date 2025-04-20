import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  Circle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TestStatus = "completed" | "not-started" | "in-progress";

interface TestItem {
  id: string;
  name: string;
  status: TestStatus;
}

export default function PVDetailScreen() {
  const { pvId } = useLocalSearchParams<{ pvId: string }>();
  const router = useRouter();

  // Initial data for the test IDs with specific names
  const initialTestItems = [
    {
      id: "test-1",
      name: "TRST_TVSS01: Equipment Hard Tag",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-2",
      name: "TRST_TVSS02: Label Equipment Cable",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-3",
      name: "TRST_TVSS03: TVSS Equipment Serial Number & Firmware Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-4",
      name: "TRST_TVSS04: System Functional Test - Physical Inspection and Configuration",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-5",
      name: "TRST_TVSS05: Camera Configuration Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-6",
      name: "TRST_TVSS06: System Functional Test - Camera Live Image & Coverage",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-7",
      name: "TRST_TVSS07: NVR Configuration Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-8",
      name: "TRST_TVSS08: System Functional Test - NVR Recording Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-9",
      name: "TRST_TVSS09: High Speed Recording Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-10",
      name: "TRST_TVSS10: Wireless Client Configuration",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-11",
      name: "TRST_TVSS11: WL Antenna VSWR Measurement",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-12",
      name: "TRST_TVSS12: 50m WLAN Access",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-13",
      name: "TRST_TVSS13: Microphone Audio Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-14",
      name: "TRST_TVSS14: Trainborne Test (RFC 2544) for Junction Box (PV01-64)",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-15",
      name: "TRST_TVSS15: TVSS Agent Redundancy Check",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-16",
      name: "TRST_TVSS16: Throughput Test (RFC 2544) for Junction Box (PV01-64)",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-17",
      name: "TRST_TVSS17: DRMD Port Readiness Verification (Reserved for future use)",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-18",
      name: "TRST_TVSS18: IT Security Hardening",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-19",
      name: "TRST_TVSS19: Power ON Test",
      status: "not-started" as TestStatus,
    },
    {
      id: "test-20",
      name: "TRST_TVSS20: Ring Redundancy",
      status: "not-started" as TestStatus,
    },
  ];

  const [testItems, setTestItems] = useState<TestItem[]>(initialTestItems);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved test items from AsyncStorage
  useEffect(() => {
    const loadTestItems = async () => {
      try {
        const savedItems = await AsyncStorage.getItem(`testItems-${pvId}`);
        if (savedItems) {
          setTestItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error("Failed to load test items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestItems();
  }, [pvId]);

  // Calculate completion percentage
  const completedCount = testItems.filter(
    (item) => item.status === "completed",
  ).length;
  const completionPercentage = Math.round(
    (completedCount / testItems.length) * 100,
  );

  // Toggle test status and save to AsyncStorage
  const toggleTestStatus = async (id: string) => {
    const updatedItems = testItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status:
              item.status === "not-started"
                ? "in-progress"
                : item.status === "in-progress"
                  ? "completed"
                  : "not-started",
          }
        : item,
    );

    setTestItems(updatedItems);

    try {
      await AsyncStorage.setItem(
        `testItems-${pvId}`,
        JSON.stringify(updatedItems),
      );

      // Save completion percentage for CCL Train screen
      const completedCount = updatedItems.filter(
        (item) => item.status === "completed",
      ).length;
      const inProgressCount = updatedItems.filter(
        (item) => item.status === "in-progress",
      ).length;
      const notStartedCount = updatedItems.filter(
        (item) => item.status === "not-started",
      ).length;
      const completionPercentage = Math.round(
        (completedCount / updatedItems.length) * 100,
      );

      // Update the specific PV unit progress in AsyncStorage for CCL Train page
      await AsyncStorage.setItem(
        `pv-${pvId}-progress`,
        completionPercentage.toString(),
      );

      // Get existing PV units data or initialize new object
      const pvUnitsDataStr = await AsyncStorage.getItem("pvUnitsData");
      const pvUnitsData = pvUnitsDataStr ? JSON.parse(pvUnitsDataStr) : {};

      // Update the specific PV unit data
      pvUnitsData[pvId] = {
        completionPercentage,
        status:
          completionPercentage === 100
            ? "completed"
            : completionPercentage === 0
              ? "not-started"
              : "in-progress",
        completedTests: completedCount,
        timestamp: new Date().toISOString(),
      };

      // Save updated PV units data
      await AsyncStorage.setItem("pvUnitsData", JSON.stringify(pvUnitsData));

      // Update overall progress data
      const overallProgressStr = await AsyncStorage.getItem("overallProgress");
      let overallProgress = overallProgressStr
        ? JSON.parse(overallProgressStr)
        : {
            totalCompletion: 0,
            completedCount: 0,
            inProgressCount: 0,
            notStartedCount: 0,
            totalPVs: 64,
          };

      // Calculate overall progress by checking all PV units
      let totalCompleted = 0;
      let totalInProgress = 0;
      let totalNotStarted = 0;
      let pvCount = 0;

      for (const key in pvUnitsData) {
        pvCount++;
        if (pvUnitsData[key].status === "completed") {
          totalCompleted++;
        } else if (pvUnitsData[key].status === "in-progress") {
          totalInProgress++;
        } else {
          totalNotStarted++;
        }
      }

      // For PVs without data, count them as not started
      const remainingPVs = 64 - pvCount;
      totalNotStarted += remainingPVs;

      overallProgress = {
        totalCompletion: Math.round((totalCompleted / 64) * 100),
        completedCount: totalCompleted,
        inProgressCount: totalInProgress,
        notStartedCount: totalNotStarted,
        totalPVs: 64,
      };

      await AsyncStorage.setItem(
        "overallProgress",
        JSON.stringify(overallProgress),
      );

      // Add to recent activity
      const recentActivityStr = await AsyncStorage.getItem("recentActivity");
      let recentActivity = recentActivityStr
        ? JSON.parse(recentActivityStr)
        : [];

      // Add this action to recent activity
      recentActivity.unshift({
        pvId: pvId,
        testId: id.replace("test-", ""),
        action: "status_change",
        newStatus:
          updatedItems.find((item) => item.id === id)?.status || "unknown",
        timestamp: new Date().toISOString(),
      });

      // Keep only the most recent 10 activities
      if (recentActivity.length > 10) {
        recentActivity = recentActivity.slice(0, 10);
      }

      await AsyncStorage.setItem(
        "recentActivity",
        JSON.stringify(recentActivity),
      );
    } catch (error) {
      console.error("Failed to save test items:", error);
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={24} color="#22c55e" />;
      case "in-progress":
        return <AlertCircle size={24} color="#eab308" />;
      case "not-started":
        return <Circle size={24} color="#ef4444" />;
    }
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-yellow-500";
      case "not-started":
        return "bg-red-500";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="auto" />
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-blue-600 p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-2"
          >
            <ArrowLeft size={24} color="white" />
            <Text className="text-white text-lg ml-2">Back to CCL Train</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            {pvId || "PV Unit"}
          </Text>
          <View className="mt-4 bg-white rounded-lg p-4">
            <Text className="text-lg font-semibold">Completion Progress</Text>
            <View className="flex-row items-center mt-2">
              <View className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className={`h-full ${completionPercentage === 100 ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
              <Text className="ml-3 font-bold">{completionPercentage}%</Text>
            </View>
            <View className="flex-row justify-between mt-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text>Completed: {completedCount}</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                <Text>
                  In Progress:{" "}
                  {
                    testItems.filter((item) => item.status === "in-progress")
                      .length
                  }
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text>
                  Not Started:{" "}
                  {
                    testItems.filter((item) => item.status === "not-started")
                      .length
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Test Items List */}
        <ScrollView className="flex-1 p-4">
          <Text className="text-xl font-bold mb-4">Test IDs</Text>
          {testItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleTestStatus(item.id)}
              className="flex-row items-center bg-white p-4 rounded-lg mb-3 shadow-sm"
            >
              {getStatusIcon(item.status)}
              <View className="flex-1 ml-3">
                <Text className="text-lg font-medium">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} mr-2`}
                  />
                  <Text className="text-gray-600 capitalize">
                    {item.status.replace("-", " ")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
