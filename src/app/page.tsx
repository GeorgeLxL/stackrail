import { Landing } from "@/components/Landing";
import { getTeamMembers, getContactInfo } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [team, contact] = await Promise.all([getTeamMembers(), getContactInfo()]);
  return <Landing team={team} contact={contact} />;
}
