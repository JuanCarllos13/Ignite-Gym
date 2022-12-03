import React, { useState } from "react";
import { VStack, Image, Text, Center, Heading, ScrollView } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import LogoSvg from "@assets/logo.svg";
import BackgroundIMG from "@assets/background.png";

import { Input } from "@components/Input";
import { Button } from "@components/Button";

import { AuthNavigatorRoutesProps } from "@routes/auth.routes";

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
};

const signInSchema = yup
  .object({
    Name: yup.string().required("Informe o nome."),
    email: yup
      .string()
      .required("Informe o e-mail.")
      .email("E-email invalido."),
    password: yup
      .string()
      .required("Informe a senha.")
      .min(6, "A senha deve conter no mínimo 6 carácter."),
    password_confirm: yup
      .string()
      .required("Confirme a senha.")
      .oneOf([yup.ref("password"), null], 'A confirma de senha não confere.'),
  })
  .required();

export function SignUp() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    resolver: yupResolver(signInSchema),
  });

  function handleGoBack() {
    navigation.goBack();
  }

  function handleSignUp(data: FormDataProps) {
    console.log(data);
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsHorizontalScrollIndicator={false}
    >
      <VStack flex={1} px={10}>
        <Image
          source={BackgroundIMG}
          alt="Pessoa treinando"
          resizeMode="contain"
          position="absolute"
          defaultSource={BackgroundIMG}
        />

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Crie sua conta
          </Heading>

          <Controller
            control={control}
            name="name"
            // rules={{
            //   required: "Informe o nome",
            // }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Nome"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            // rules={{
            //   required: "Email obrigatório",
            //   pattern: {
            //     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            //     message: "E-mail inválido",
            //   },
            // }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password_confirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Confirmar a senha"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
              />
            )}
          />

          <Button
            title="Criar e acessar"
            onPress={handleSubmit(handleSignUp)}
          />
        </Center>

        <Button
          title="Voltar para o login"
          variant="outline"
          mt={15}
          onPress={handleGoBack}
        />
      </VStack>
    </ScrollView>
  );
}
