import { createFileRoute } from "@tanstack/react-router";
import { MenuAdminPage } from "@/components/admin/menu-admin";

export const Route = createFileRoute("/admin/menu")({
  component: () => <MenuAdminPage kind="food" noun="dish" />,
});
