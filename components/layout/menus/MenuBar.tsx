import {
  CalendarCheck,
  Flag,
  LayoutDashboardIcon,
  ShieldUser,
} from "lucide-react";

import MenuBarItem from "./MenuBarItem";
import UserMenu from "./UserMenu";
import { User } from "@/lib/auth/server";

const MenuBar = ({ user }: { user: User }) => {
  return (
    <nav className="fixed right-0 bottom-4 left-0 mx-auto flex w-full max-w-[95%] rounded-full border backdrop-blur-lg">
      <ul
        className="flex w-full items-center justify-around py-1 transition-all duration-300"
        dir="auto"
      >
        {links.map((link) => (
          <MenuBarItem key={link.url} data={link} />
        ))}

        {user?.role === "admin" && (
          <MenuBarItem
            key="admin"
            data={{
              label: "المسؤول",
              url: "/admin",
              icon: <ShieldUser />,
            }}
          />
        )}

        <UserMenu avatarUrl={user.image} />
      </ul>
    </nav>
  );
};

export default MenuBar;

const links = [
  { label: "الرئيسية", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { label: "التقارير", url: "/reports", icon: <Flag /> },
  { label: "العادات", url: "/habits", icon: <CalendarCheck /> },
  // { label: "Admin", url: "/admin", icon: <ShieldUser />, admin: true },
  // { label: "My Books", url: "/my-books", icon: <Library /> },
  // { label: "Inbox", url: "/inbox", icon: <InboxIcon /> },
];
