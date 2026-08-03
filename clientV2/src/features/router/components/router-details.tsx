"use client";

import { useEffect, useState } from "react";
import {
	RefreshCcw,
	Power,
	Save,
	X,
	Pencil,
	Server,
	Wifi,
	Settings,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card, {
	CardHeader,
	CardContent,
} from "@/components/ui/Card";

import { InputField } from "@/components/ui/InputField";

import type {
	Router,
	UpdateRouterDto,
} from "../api/router.types";

import RouterStatusBadge from "./router-status-badge";


interface RouterDetailsProps {
	router: Router;

	onUpdate: (
		id: string,
		data: UpdateRouterDto
	) => void;

	onSync: (
		id: string
	) => void;

	onReboot: (
		id: string
	) => void;

	onCheckStatus: (
		id: string
	) => void;

	updating?: boolean;
	syncing?: boolean;
	rebooting?: boolean;
}


export default function RouterDetails({
	router,
	onUpdate,
	onSync,
	onReboot,
	onCheckStatus,
	updating,
	syncing,
	rebooting,
}: RouterDetailsProps) {


	const [editing, setEditing] = useState(false);


	const [form, setForm] =
		useState<UpdateRouterDto>({});



	useEffect(() => {

		setForm({
			name: router.name,
			code: router.code,

			host: router.host,
			port: router.port,

			username: router.username,

			ssl: router.ssl,

			location: router.location,
			siteCode: router.siteCode,
			popName: router.popName,

			connectionType:
				router.connectionType,

			isEnabled:
				router.isEnabled,

			apiEnabled:
				router.apiEnabled,

			maxSessions:
				router.maxSessions,

			priority:
				router.priority,

			isDefaultRouter:
				router.isDefaultRouter,
		});

	}, [router]);



	const save = () => {

		onUpdate(
			router.id,
			form
		);

		setEditing(false);
	};



	return (

		<Card
			className=" border-primary/20 bg-primary/5"
		>


			<CardHeader>


				<div className="flex flex-col w-full gap-4">


					<div className="flex items-start justify-between gap-4 ">


						<div>

							<h2 className="text-xl font-semibold ">
								{router.name}
							</h2>


							<div className="flex flex-wrap gap-2 mt-2 ">

								<span className="badge">
									{router.code}
								</span>


								<RouterStatusBadge
									status={router.status}
								/>

							</div>

						</div>


						<div className="flex flex-wrap gap-2 ">


							<Button
								variant="outline"
								onClick={() =>
									onCheckStatus(router.id)
								}
							>
								<Wifi size={15}/>
								Status
							</Button>



							<Button
								variant="outline"
								onClick={() =>
									onSync(router.id)
								}
								disabled={syncing}
							>
								<RefreshCcw size={15}/>
								Sync
							</Button>



							<Button
								variant="outline"
								onClick={() =>
									onReboot(router.id)
								}
								disabled={rebooting}
							>
								<Power size={15}/>
								Reboot
							</Button>


							{editing ? (

								<Button
									onClick={save}
									disabled={updating}
								>
									<Save size={15}/>
									Save
								</Button>

							) : (

								<Button
									onClick={() =>
										setEditing(true)
									}
								>
									<Pencil size={15}/>
									Edit
								</Button>

							)}



						</div>

					</div>


				</div>


			</CardHeader>



			<CardContent
				className="grid gap-6 md:grid-cols-2"
			>


				<Section
					title="Identity"
					icon={<Server size={16}/>}
				>

					{editing ? (

						<InputField
							label="Name"
							value={form.name ?? ""}
							onChange={(e)=>setForm({
								...form,
								name:e.target.value
							})}
						/>

					) : (

						<Info
							label="Name"
							value={router.name}
						/>

					)}



					<Info
						label="Code"
						value={router.code}
					/>

				</Section>



				<Section
					title="Connection"
					icon={<Wifi size={16}/>}
				>

					<Info
						label="Host"
						value={`${router.host}:${router.port}`}
					/>

					<Info
						label="Username"
						value={router.username}
					/>

					<Info
						label="Type"
						value={router.connectionType}
					/>

				</Section>




				<Section
					title="Capacity"
					icon={<Settings size={16}/>}
				>

					<Info
						label="Sessions"
						value={`${router.currentSessions}/${router.maxSessions}`}
					/>

					<Info
						label="Priority"
						value={router.priority}
					/>

				</Section>



				<Section title="Location">

					<Info
						label="Location"
						value={router.location || "-"}
					/>

					<Info
						label="POP"
						value={router.popName || "-"}
					/>

				</Section>



				<Section title="RouterOS">

					<Info
						label="Version"
						value={router.routerOsVersion || "-"}
					/>

					<Info
						label="Board"
						value={router.routerBoard || "-"}
					/>

					<Info
						label="Identity"
						value={router.systemIdentity || "-"}
					/>

				</Section>



				<Section title="Settings">

					<Info
						label="Enabled"
						value={
							router.isEnabled
								? "Yes"
								: "No"
						}
					/>

					<Info
						label="API"
						value={
							router.apiEnabled
								? "Enabled"
								: "Disabled"
						}
					/>

				</Section>


			</CardContent>

		</Card>

	);
}



function Section({
	title,
	icon,
	children,
}:{
	title:string;
	icon?:React.ReactNode;
	children:React.ReactNode;
}){

	return (

		<div className="space-y-3">

			<div className="flex items-center gap-2 text-sm font-semibold ">

				{icon}

				{title}

			</div>


			<div className="p-4 space-y-2 rounded-xl bg-background">

				{children}

			</div>

		</div>

	);
}



function Info({
	label,
	value,
}:{
	label:string;
	value:any;
}){

	return (

		<div>

			<p className="text-xs text-muted-foreground">
				{label}
			</p>


			<p className="text-sm font-medium">
				{value || "-"}
			</p>

		</div>

	);
}