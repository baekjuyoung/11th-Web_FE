import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "../../../pages/members/edit-profile-page";

export const Route = createFileRoute("/_authenticated/my/edit")({
  component: EditProfilePage,
});