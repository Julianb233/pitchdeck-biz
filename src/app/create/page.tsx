import { redirect } from "next/navigation"

/**
 * /create now redirects to the 6-step AI Discovery Session.
 * The old quick upload flow is preserved at /create/quick.
 */
export default function CreatePage() {
  redirect("/create/discovery")
}
