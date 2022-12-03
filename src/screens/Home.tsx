import React, { useState } from "react";
import { VStack, FlatList, HStack, Heading, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";

import { AuthNavigatorRoutesProps } from "@routes/app.routes";
import { HomeHeader } from "@components/HomeHeader";
import { Group } from "@components/Group";
import { ExerciseCard } from "@components/ExerciseCard";

export function Home() {
  const [groupSelected, setGroupSelect] = useState("Costa");
  const [groups, setGroups] = useState(["Costa", "Ombro", "biceps", "tríceps"]);
  const [exercise, setExercise] = useState([
    "Puxada frontal",
    "Remada Lateral",
    "Remada Unilateral",
  ]);

  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  function handleOpenExerciseDetails() {
    navigation.navigate("exercise");
  }

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={
              String(groupSelected).toUpperCase() === String(item).toUpperCase()
            }
            onPress={() => setGroupSelect(item)}
          />
        )}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
        minH={10}
      />

      <VStack flex={1} px={8}>
        <HStack justifyContent="space-between" mb={5}>
          <Heading color="gray.200" fontSize="md" fontFamily='heading'>
            Exercícios
          </Heading>

          <Text color="gray.200" fontSize="sm">
            {exercise.length}
          </Text>
        </HStack>

        <FlatList
          data={exercise}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ExerciseCard onPress={handleOpenExerciseDetails} />
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ paddingBottom: 20 }}
        />
      </VStack>
    </VStack>
  );
}
