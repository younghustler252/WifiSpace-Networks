"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";

import RouterCard from "@/features/router/components/router-card";
import RouterDetails from "@/features/router/components/router-details";

import type {
	Router,
	UpdateRouterDto,
} from "@/features/router/api/router.types";

import {
	useRouters,
	useUpdateRouter,
	useSyncRouter,
	useRebootRouter,
	useCheckRouterStatus,
} from "@/features/router/hooks/use-router";


export default function RoutersPage() {

	const router = useRouter();

	const detailRef = useRef<HTMLDivElement | null>(null);


	const [selected, setSelected] =
		useState<Router | null>(null);



	// ===============================
	// QUERIES
	// ===============================

	const {
		data: routers = [],
		isLoading,
	} = useRouters();



	// ===============================
	// MUTATIONS
	// ===============================

	const updateMutation =
		useUpdateRouter();


	const syncMutation =
		useSyncRouter();


	const rebootMutation =
		useRebootRouter();


	const statusMutation =
		useCheckRouterStatus();



	// ===============================
	// SELECT
	// ===============================

	const handleSelect = (
		item: Router
	) => {

		setSelected(item);


		setTimeout(() => {

			detailRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});

		},50);

	};



	// ===============================
	// UPDATE
	// ===============================

	const handleUpdate = (
		id:string,
		data:UpdateRouterDto
	) => {

		updateMutation.mutate({
			id,
			data,
		});

	};



	// ===============================
	// EMPTY
	// ===============================

	if(!isLoading && routers.length === 0){

		return (

			<div className="p-6 space-y-6">

				<PageHeader
					title="Routers"
					subtitle="Manage connected MikroTik routers."
					actions={

						<Button
							onClick={() =>
								router.push(
									"/routers/create"
								)
							}
						>

							<Plus
								className="w-4 h-4 mr-2"
							/>

							Add Router

						</Button>

					}
				/>


				<div className="p-10 text-center border border-dashed rounded-3xl text-muted-foreground">

					No routers found.

				</div>


			</div>

		);

	}



	return (

		<div className="p-6 space-y-6 ">


			{/* HEADER */}

			<PageHeader

				title="Routers"

				subtitle="
					Monitor and manage network routers.
				"

				actions={

					<Button
						onClick={() =>
							router.push(
								"/routers/create"
							)
						}
					>

						<Plus
							className="w-4 h-4 mr-2"
						/>

						New Router

					</Button>

				}

			/>




			{/* DETAILS */}

			{
				selected && (

					<div ref={detailRef}>

						<RouterDetails

							router={selected}


							onUpdate={
								handleUpdate
							}


							onSync={
								(id)=>
									syncMutation.mutate(id)
							}


							onReboot={
								(id)=>
									rebootMutation.mutate(id)
							}


							onCheckStatus={
								(id)=>
									statusMutation.mutate(id)
							}


							updating={
								updateMutation.isPending
							}


							syncing={
								syncMutation.isPending
							}


							rebooting={
								rebootMutation.isPending
							}

						/>

					</div>

				)

			}




			{/* LIST */}

			<div className="space-y-4">


				<div className="text-sm text-muted-foreground">

					Available Routers

				</div>



				{
					isLoading ? (

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

							{
								Array.from({
									length:6
								}).map((_,i)=>(

									<div

										key={i}

										className="h-64 rounded-3xl bg-muted animate-pulse"

									/>

								))
							}


						</div>


					) : (

						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">


							{
								routers.map(
									(item)=>(
										
										<RouterCard

											key={
												item.id
											}

											router={
												item
											}


											selected={
												selected?.id === item.id
											}


											onClick={() =>
												handleSelect(
													item
												)
											}

										/>

									)
								)
							}


						</div>

					)

				}


			</div>


		</div>

	);

}