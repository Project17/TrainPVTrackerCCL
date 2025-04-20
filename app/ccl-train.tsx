import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PVUnit = {
  id: string;
  name: string;
  completionPercentage: number;
  status: "completed" | "in-progress" | "not-started";
};

export default function CCLTrainScreen() {
  const router = useRouter();
  const [pvUnits, setPvUnits] = useState<PVUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPvUnitsData();
  }, []);

  const loadPvUnitsData = async () => {
    try {
      setLoading(true);
      const pvUnitsData: PVUnit[] = [];

      // Create array of all possible PV units
      for (let i = 1; i <= 64; i++) {
        const id = String(i).padStart(2, "0");
        const storageKey = `pv-${id}-progress`;

        // Try to get saved progress from AsyncStorage
        let completionPercentage = 0;
        try {
          // First check if we have data in pvUnitsData
          const pvUnitsDataStr = await AsyncStorage.getItem("pvUnitsData");
          const allPvUnitsData = pvUnitsDataStr
            ? JSON.parse(pvUnitsDataStr)
            : {};

          if (
            allPvUnitsData[id] &&
            allPvUnitsData[id].completionPercentage !== undefined
          ) {
            // Use data from pvUnitsData if available
            completionPercentage = allPvUnitsData[id].completionPercentage;
          } else {
            // Fall back to the direct progress storage
            const savedProgress = await AsyncStorage.getItem(storageKey);
            if (savedProgress !== null) {
              completionPercentage = parseInt(savedProgress, 10);
            }
          }
        } catch (error) {
          console.error(`Error loading progress for PV${id}:`, error);
        }

        // Determine status based on completion percentage
        let status: "completed" | "in-progress" | "not-started";
        if (completionPercentage === 100) {
          status = "completed";
        } else if (completionPercentage === 0) {
          status = "not-started";
        } else {
          status = "in-progress";
        }

        pvUnitsData.push({
          id,
          name: `PV${id}`,
          completionPercentage,
          status,
        });
      }

      setPvUnits(pvUnitsData);
    } catch (error) {
      console.error("Error loading PV units data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-yellow-500";
      case "not-started":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} color="#10b981" />;
      case "in-progress":
        return <Clock size={20} color="#f59e0b" />;
      case "not-started":
        return <XCircle size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  const handlePVUnitPress = (pvId: string) => {
    router.push(`/${pvId}`);
  };

  const renderPVUnitCard = ({ item }: { item: PVUnit }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
      onPress={() => handlePVUnitPress(item.id)}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-bold">{item.name}</Text>
        <View className="flex-row items-center">
          {getStatusIcon(item.status)}
          <Text className="ml-2">{item.completionPercentage}%</Text>
        </View>
      </View>

      <View className="mt-3 bg-gray-200 h-2 rounded-full overflow-hidden">
        <View
          className={`h-full ${getStatusColor(item.status)}`}
          style={{ width: `${item.completionPercentage}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-xs text-gray-500">
          {item.status === "completed"
            ? "Completed"
            : item.status === "in-progress"
              ? "In Progress"
              : "Not Started"}
        </Text>
        <Text className="text-xs text-gray-500">
          {Math.round(item.completionPercentage / 5)} of 20 tests completed
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 px-4 pt-2 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2">
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">CCL Train</Text>
        </View>

        <Text className="text-gray-600 mb-4">
          Select a PV unit to view and update test status
        </Text>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2 text-gray-600">Loading PV units data...</Text>
          </View>
        ) : (
          <FlatList
            data={pvUnits}
            renderItem={renderPVUnitCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onRefresh={loadPvUnitsData}
            refreshing={loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
