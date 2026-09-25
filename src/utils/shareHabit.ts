// src/utils/shareHabit.ts
export const shareHabitStreak = async (habitName: string, streakCount: number) => {
  const message = `I'm on a ${streakCount}-day streak for "${habitName}"! 🔥`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    await navigator.share({
      title: 'Habit Streak',
      text: message,
      url: window.location.href,
    });
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(message);
    alert('Streak copied to clipboard!');
  }
};