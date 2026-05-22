import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizHomeScreen from '../screens/quiz/QuizHomeScreen';
import QuizPlayScreen from '../screens/quiz/QuizPlayScreen';
import QuizResultScreen from '../screens/quiz/QuizResultScreen';
import LeaderboardScreen from '../screens/quiz/LeaderboardScreen';

const Stack = createNativeStackNavigator();

const QuizNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="QuizHome" component={QuizHomeScreen} />
      <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
};

export default QuizNavigator;
