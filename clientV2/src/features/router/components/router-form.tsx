"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

import type {
	CreateRouterDto,
	UpdateRouterDto,
} from "../api/router.types";


type RouterFormData =
	| CreateRouterDto
	| UpdateRouterDto;


interface RouterFormProps {
	mode: "create" | "edit";

	initialValues?: RouterFormData;

	loading?: boolean;

	onSubmit: (
		data: RouterFormData
	) => void;

	onCancel?: () => void;
}


export default function RouterForm({
	mode,
	initialValues,
	loading,
	onSubmit,
	onCancel,
}: RouterFormProps) {


	const [form, setForm] = React.useState<RouterFormData>(
		initialValues ?? {
			name: "",
			code: "",

			host: "",
			port: 8728,

			username: "",
			password: "",

			ssl: false,

			supportedServices: [],

			location: "",
			siteCode: "",
			popName: "",

			connectionType: "direct",

			isEnabled: true,
			apiEnabled: true,

			maxSessions: 0,

			priority: 1,

			isDefaultRouter: false,
		}
	);



	const update = (
		key: keyof RouterFormData,
		value: any
	) => {

		setForm((prev)=>({
			...prev,
			[key]: value,
		}));

	};



	return (

		<div className="space-y-8">


			{/* Identity */}

			<section className="space-y-4">

				<h2 className="font-semibold">
					Identity
				</h2>


				<InputField
					label="Router Name"
					value={form.name ?? ""}
					onChange={(e)=>
						update(
							"name",
							e.target.value
						)
					}
				/>


				<InputField
					label="Router Code"
					value={form.code ?? ""}
					onChange={(e)=>
						update(
							"code",
							e.target.value
						)
					}
				/>

			</section>



			{/* Connection */}

			<section className="space-y-4">

				<h2 className="font-semibold">
					Connection
				</h2>


				<InputField
					label="Host"
					value={form.host ?? ""}
					onChange={(e)=>
						update(
							"host",
							e.target.value
						)
					}
				/>


				<InputField
					label="Port"
					type="number"
					value={String(form.port ?? "")}
					onChange={(e)=>
						update(
							"port",
							Number(e.target.value)
						)
					}
				/>


				<InputField
					label="Username"
					value={form.username ?? ""}
					onChange={(e)=>
						update(
							"username",
							e.target.value
						)
					}
				/>


				<InputField
					label="Password"
					type="password"
					value={form.password ?? ""}
					onChange={(e)=>
						update(
							"password",
							e.target.value
						)
					}
				/>


			</section>



			{/* Location */}

			<section className="space-y-4">

				<h2 className="font-semibold">
					Location
				</h2>


				<InputField
					label="Location"
					value={form.location ?? ""}
					onChange={(e)=>
						update(
							"location",
							e.target.value
						)
					}
				/>


				<InputField
					label="Site Code"
					value={form.siteCode ?? ""}
					onChange={(e)=>
						update(
							"siteCode",
							e.target.value
						)
					}
				/>


				<InputField
					label="POP Name"
					value={form.popName ?? ""}
					onChange={(e)=>
						update(
							"popName",
							e.target.value
						)
					}
				/>

			</section>



			{/* Actions */}

			<div className="flex justify-end gap-3">


				{onCancel && (
					<Button
						variant="ghost"
						onClick={onCancel}
					>
						Cancel
					</Button>
				)}


				<Button
					disabled={loading}
					onClick={() =>
						onSubmit(form)
					}
				>
					{
						loading
							? "Saving..."
							: mode === "create"
							? "Create Router"
							: "Save Changes"
					}
				</Button>


			</div>


		</div>

	);
}