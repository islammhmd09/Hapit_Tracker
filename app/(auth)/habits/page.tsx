import Section from "@/components/shared/Section";
import { getSession } from "@/features/auth/actions";
import HabitTracker from "@/features/habits/HabitTracker";

export const metadata = {
  title: "Habits",
};

const Habits = async () => {
  const data = await getSession();

  // Habits are stored per user, so friends sharing a device stay separate.
  const userId = "user" in data ? data.user.id : "guest";

  return (
    <Section className="w-full gap-4">
      <HabitTracker userId={userId} />
    </Section>
  );
};

export default Habits;
