import {
	Users,
	Settings,
	Wifi,
	BadgeCheck,
	Router,
	CreditCard,
	LayoutDashboard,
	Package,
} from "lucide-react";

const roleBasePath = {
	customer: "/customer",
	staff: "/staff",
	superadmin: "/admin",
};

/* =========================
   COMMON ITEMS
========================= */

const dashboard = (base: string) => ({
	label: "Dashboard",
	icon: <LayoutDashboard size={18} />,
	href: `${base}/dashboard`,
});

const payments = (base: string) => ({
	label: "Payments",
	icon: <CreditCard size={18} />,
	href: `${base}/payments`,
});

/* =========================
   NAVIGATION
========================= */

export const navigation = {
	customer: [
		dashboard(roleBasePath.customer),

		{
			label: "My Account",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.customer}/account`,
		},

		payments(roleBasePath.customer),

		{
			label: "Plans",
			icon: <Package size={18} />,
			href: `${roleBasePath.customer}/plans`,
		},

		{
			label: "My Subscription",
			icon: <BadgeCheck size={18} />,
			href: `${roleBasePath.customer}/subscription`,
		},

		{
			label: "Profile",
			icon: <Users size={18} />,
			href: `${roleBasePath.customer}/profile`,
		},
	],

	staff: [
		dashboard(roleBasePath.staff),

		{
			label: "Accounts",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.staff}/accounts`,
		},

		payments(roleBasePath.staff),

		{
			label: "Customers",
			icon: <Users size={18} />,
			href: `${roleBasePath.staff}/customers`,
		},

		{
			label: "Plans",
			icon: <Package size={18} />,
			href: `${roleBasePath.staff}/plans`,
		},

		{
			label: "Router Management",
			icon: <Router size={18} />,
			href: `${roleBasePath.staff}/router`,
		},

		{
			label: "Profile",
			icon: <Users size={18} />,
			href: `${roleBasePath.staff}/profile`,
		},
	],

	superadmin: [
		dashboard(roleBasePath.superadmin),

		{
			label: "Accounts",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.superadmin}/accounts`,
		},

		payments(roleBasePath.superadmin),

		{
			label: "Users",
			icon: <Users size={18} />,
			href: `${roleBasePath.superadmin}/users`,
		},

		{
			label: "Plans",
			icon: <Package size={18} />,
			href: `${roleBasePath.superadmin}/plans`,
		},

		{
			label: "Routers",
			icon: <Router size={18} />,
			href: `${roleBasePath.superadmin}/router`,
		},

		{
			label: "Subscriptions",
			icon: <BadgeCheck size={18} />,
			href: `${roleBasePath.superadmin}/subscriptions`,
		},

		{
			label: "Settings",
			icon: <Settings size={18} />,
			href: `${roleBasePath.superadmin}/settings`,
		},
	],
};