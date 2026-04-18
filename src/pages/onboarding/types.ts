export interface OnboardingData {
  name: string
  profession: string
  specialization: string
  country: string
  language: string
  workFormat: 'online' | 'offline' | 'mixed' | ''
  clientType: string
  clientGenderAge: string
  clientPains: string
  clientDesiredResults: string
  currentServices: string
  currentPrices: string
  targetServices: string
  idealClients: string
  avoidClients: string
  instagramUrl: string
  postScreenshots: string[]
  competitors: string
  goals: string[]
  primaryGoal: string
}

export const TOTAL_STEPS = 9

export const STEP_TITLES = [
  'Хто ви',
  'Ваша аудиторія',
  'Що продаєте зараз',
  'Що хочете продавати',
  'З ким працюєте',
  'Профіль Instagram',
  'Пости',
  'Конкуренти',
  'Ваші цілі',
]

export const GOALS_OPTIONS = [
  'Отримати нових клієнтів',
  'Продавати супровід',
  'Збільшити кількість заявок',
  'Підвищити ціни',
  'Упакуватися професійно',
  'Запустити онлайн-продукт',
]
