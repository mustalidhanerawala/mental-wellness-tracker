export const getExamMotivation = (exam: string): string => {
  switch (exam) {
    case 'JEE':
      return "Physics, Chemistry, and Math are languages of logic. Master the concepts, trust your problem-solving speed, and take breaks to keep your analytical mind sharp.";
    case 'NEET':
      return "Every diagram you memorize and Biology concept you master brings you closer to healing lives. Pace yourself—healing begins with your own mental well-being.";
    case 'UPSC':
      return "UPSC is a marathon of consistency, not a sprint. The syllabus is vast, but your resolve is deeper. Focus on quality prep and prioritize mental clarity.";
    case 'BOARD':
      return "Board exams are just stepping stones, not final definitions of your potential. Take it one chapter at a time, sleep well, and trust your preparation.";
    default:
      return "Believe in your ability to learn, adapt, and grow. Consistency beats intensity every single time. Aura is here to walk this path with you.";
  }
};
