import React, { useCallback, useState } from "react";
import {
  Heading,
  Text,
  VStack,
  SectionList,
  useToast,
  Center,
} from "native-base";

import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { AppError } from "@utils/AppError";
import { api } from "@services/api";
import { useFocusEffect } from "@react-navigation/native";
import { HistoryByDayDtoDTO } from "@dtos/HistoryGroupByDayDto";
import { Loading } from "@components/Loading";
import { useAuth } from "@hooks/useAuth";

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [exercise, setExercise] = useState<HistoryByDayDtoDTO[]>([]);
  const toast = useToast();
  const { refreshToken } = useAuth();
  async function fetchHistory() {
    try {
      setIsLoading(true);
      const response = await api.get("/history");

      setExercise(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError
        ? error.message
        : "Não foi possível carregar o histórico";

      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [refreshToken])
  );

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercício" />

      {isLoading ? (
        <Loading />
      ) : exercise.length > 0 ? (
        <SectionList
          sections={exercise}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HistoryCard data={item} />}
          renderSectionHeader={({ section }) => (
            <Heading
              color="gray.200"
              fontSize="md"
              mt={10}
              mb={3}
              fontFamily="heading"
            >
              {section.title}
            </Heading>
          )}
          px={8}
          contentContainerStyle={
            exercise.length === 0 && { flex: 1, justifyContent: "center" }
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Center>
          <Text color="gray.100" textAlign="center">
            Não há exercícios registrados ainda.{`\n`} vamos fazer exercícios
            hoje?
          </Text>
        </Center>
      )}
    </VStack>
  );
}
