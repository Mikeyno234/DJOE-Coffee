import { redirect } from "next/navigation";

// The cashier terminal is the landing screen; admin tools live behind their own routes.
export default function Home() {
  redirect("/pos");
}
