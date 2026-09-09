import { createFileRoute } from "@tanstack/react-router";
import { MenuAdminPage } from "@/components/admin/menu-admin";

export const Route = createFileRoute("/admin/beverages")({
  component: () => <MenuAdminPage kind="beverages" noun="drink" />,
});
