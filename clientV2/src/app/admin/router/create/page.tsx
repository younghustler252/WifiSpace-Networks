"use client";

import { useRouter } from "next/navigation";

import PageHeader from "@/components/ui/PageHeader";

import RouterForm from "@/features/router/components/router-form";

import { useCreateRouter } from "@/features/router/hooks/use-router";


export default function CreateRouterPage(){

	const router = useRouter();

	const createMutation = useCreateRouter();



	return (

		<div className="p-6 space-y-6">


			<PageHeader
				title="Create Router"
				subtitle="Add a new MikroTik router."
			/>


			<div className="max-w-3xl p-6 border rounded-3xl bg-background">


				<RouterForm
					mode="create"

					loading={
						createMutation.isPending
					}

					onSubmit={(data)=>{

						createMutation.mutate(
							data as any,
							{
								onSuccess:()=>{
									router.push(
										"/routers"
									);
								},
							}
						);

					}}

					onCancel={()=>
						router.push(
							"/routers"
						)
					}

				/>


			</div>


		</div>

	);
}