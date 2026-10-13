"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "./CartContext";

// Bottom tab bar — native app navigation, mobile viewports only.
export default function MobileTabBar() {
  const pathname = usePathname();
  const { count } = useCart();

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("xyvot:open-cart"));
  };

  const tabs = [
    { key: "home", label: "Home", href: "/", Icon: Home, active: pathname === "/" },
    {
      key: "search",
      label: "Search",
      href: "/search",
      Icon: Search,
      active: pathname?.startsWith("/search") || pathname?.startsWith("/category"),
    },
    { key: "cart", label: "Cart", onClick: openCart, Icon: ShoppingCart, active: false, badge: count },
    {
      key: "account",
      label: "Account",
      href: "/account",
      Icon: User,
      active: pathname?.startsWith("/account") || pathname?.startsWith("/checkout"),
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ key, label, href, onClick, Icon, active, badge }) => {
          const content = (
            <>
              <span className="relative">
                <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-semibold mt-0.5">{label}</span>
            </>
          );
          const cls = `flex flex-col items-center justify-center gap-0.5 min-h-[56px] transition-colors ${
            active ? "text-green-600" : "text-slate-500"
          }`;
          return onClick ? (
            <button key={key} type="button" onClick={onClick} className={cls} aria-label={`${label}, ${count} items`}>
              {content}
            </button>
          ) : (
            <Link key={key} href={href} className={cls} aria-current={active ? "page" : undefined}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
