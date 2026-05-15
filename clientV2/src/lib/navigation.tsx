// lib/navigation.ts
import {
	Home,
	Users,
	Settings,
	Wifi,
	Layers,
	Receipt,
	BadgeCheck,
} from "lucide-react";

const roleBasePath = {
	customer: "/user",
	staff: "/staff",
	superadmin: "/admin",
};

// shared admin/staff style navigation
const shared = (base: string) => [
	{
		label: "Overview",
		icon: <Layers size={18} />,
		href: `${base}/overview`,
	},

	{
		label: "Service Plans",
		icon: <BadgeCheck size={18} />,
		href: `${base}/plans`,
	},
];

export const navigation = {
	customer: [
		{
			label: "Dashboard",
			icon: <Home size={18} />,
			href: `${roleBasePath.customer}/dashboard`,
		},

		...shared(roleBasePath.customer),

		{
			label: "My Subscription",
			icon: <BadgeCheck size={18} />,
			href: `${roleBasePath.customer}/subscription`,
		},

		{
			label: "Billing & Payments",
			icon: <Receipt size={18} />,
			href: `${roleBasePath.customer}/payment/all`,
		},

		{
			label: "My Services",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.customer}/accounts`,
		},

		{
			label: "My Account",
			icon: <Users size={18} />,
			href: `${roleBasePath.customer}/account`,
		},
	],

	staff: [
		{
			label: "Dashboard",
			icon: <Home size={18} />,
			href: `${roleBasePath.staff}/dashboard`,
		},

		...shared(roleBasePath.staff),

		{
			label: "Manage Customers",
			icon: <Users size={18} />,
			href: `${roleBasePath.staff}/customers`,
		},

		{
			label: "Manage Accounts",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.staff}/accounts`,
		},

		{
			label: "Manage Payments",
			icon: <Receipt size={18} />,
			href: `${roleBasePath.staff}/payments`,
		},
	],

	superadmin: [
		{
			label: "Dashboard",
			icon: <Home size={18} />,
			href: `${roleBasePath.superadmin}/dashboard`,
		},

		...shared(roleBasePath.superadmin),

		{
			label: "Manage Users",
			icon: <Users size={18} />,
			href: `${roleBasePath.superadmin}/users`,
		},

		{
			label: "Manage Accounts",
			icon: <Wifi size={18} />,
			href: `${roleBasePath.superadmin}/accounts`,
		},

		{
			label: "Manage Payments",
			icon: <Receipt size={18} />,
			href: `${roleBasePath.superadmin}/payments`,
		},

		{
			label: "System Settings",
			icon: <Settings size={18} />,
			href: `${roleBasePath.superadmin}/settings`,
		},
	],
};