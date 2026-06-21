"use client";

import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import PageHeader from "@/components/ui/PageHeader";

import { routerApi, Router, UpdateRouterDto } from "@/lib/api/router";

export default function RoutersPage() {
	// ================= STATE =================
	const [selected, setSelected] = useState<Router | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	const [createOpen, setCreateOpen] = useState(false);
	const detailRef = useRef<HTMLDivElement | null>(null);

	const [form, setForm] = useState<UpdateRouterDto>({});

	// ================= DATA =================
	const query = useQuery({
		queryKey: ["routers"],
		queryFn: routerApi.getAll,
	});

	const routers = query.data?.data ?? [];

	// ================= SELECT ROUTER =================
	const handleSelect = (router: Router) => {
		setSelected(router);
		setIsEditing(false);

		// smooth scroll to top detail card
		setTimeout(() => {
			detailRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 50);
	};

	// ================= INIT EDIT =================
	useEffect(() => {
		if (selected) {
			setForm({
				name: selected.name,
				code: selected.code,
				host: selected.host,
				port: selected.port,
				username: selected.username,
				ssl: selected.ssl,
				routerType: selected.routerType,
				location: selected.location,
				popName: selected.popName,
				apiEnabled: selected.apiEnabled,
				isEnabled: selected.isEnabled,
				maxSessions: selected.maxSessions,
				priority: selected.priority,
				isDefaultRouter: selected.isDefaultRouter,
			});
		}
	}, [selected]);

	// ================= RESET EDIT =================
	useEffect(() => {
		setIsEditing(false);
	}, [selected]);

	// ================= SAVE =================
	const handleSave = async () => {
		if (!selected) return;

		await routerApi.update(selected.id, form);
		setIsEditing(false);
		query.refetch();
	};

	// ================= CREATE =================
	const [createForm, setCreateForm] = useState({
		name: "",
		code: "",
		host: "",
		username: "",
		password: "",
		port: 8728,
	});

	const handleCreate = async () => {
		await routerApi.create(createForm);
		setCreateOpen(false);
		query.refetch();
	};

	// ================= EMPTY STATE =================
	if (routers.length === 0) {
		return (
			<div className="p-6">
				<PageHeader
					title="Routers"
					actions={
						<Button onClick={() => setCreateOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Add Router
						</Button>
					}
				/>

				<div className="mt-10 text-center text-muted-foreground">
					No routers found. Create your first router to get started.
				</div>

				{/* CREATE MODAL */}
				<RouterCreateModal
					open={createOpen}
					onClose={() => setCreateOpen(false)}
					form={createForm}
					setForm={setCreateForm}
					onCreate={handleCreate}
				/>
			</div>
		);
	}

	// ================= UI =================
	return (
		<div className="p-6 space-y-6">

			{/* ================= HEADER ================= */}
			<PageHeader
				title="Routers"
				actions={
					<Button onClick={() => setCreateOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						New Router
					</Button>
				}
			/>

			{/* ================= SELECTED DETAIL (TOP EXPANDING CARD) ================= */}
			{selected && (
				<div ref={detailRef}>
					<Card className="border-primary/30 bg-primary/5">
						<CardHeader>
							<div>
								<p className="font-semibold text-lg">
									{selected.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{selected.code} • {selected.host}
								</p>
							</div>

							<div className="flex gap-2">
								{!isEditing ? (
									<Button onClick={() => setIsEditing(true)}>
										Edit
									</Button>
								) : (
									<>
										<Button
											variant="ghost"
											onClick={() => setIsEditing(false)}
										>
											Cancel
										</Button>
										<Button onClick={handleSave}>
											Save Changes
										</Button>
									</>
								)}
							</div>
						</CardHeader>

						<CardContent className="grid md:grid-cols-2 gap-4">
							{/* NAME */}
							{isEditing ? (
								<InputField
									label="Name"
									value={form.name || ""}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											name: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Name" value={selected.name} />
							)}

							{/* HOST */}
							{isEditing ? (
								<InputField
									label="Host"
									value={form.host || ""}
									onChange={(e) =>
										setForm((p) => ({
											...p,
											host: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Host" value={selected.host} />
							)}

							{/* STATUS */}
							<Info label="Status" value={selected.status} />
							<Info
								label="Sessions"
								value={`${selected.currentSessions}/${selected.maxSessions}`}
							/>

							<Info
								label="Default"
								value={
									selected.isDefaultRouter
										? "Yes"
										: "No"
								}
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* ================= ROUTER LIST ================= */}
			<div className="space-y-3">
				<p className="text-sm text-muted-foreground">
					Available Routers
				</p>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					{routers.map((r) => (
						<Card
							key={r.id}
							onClick={() => handleSelect(r)}
							className={`cursor-pointer transition-all hover:-translate-y-1 ${
								selected?.id === r.id
									? "ring-2 ring-primary"
									: ""
							}`}
						>
							<CardHeader>
								<p className="font-semibold">{r.name}</p>
								<span className="text-xs text-muted-foreground">
									{r.code}
								</span>
							</CardHeader>

							<CardContent>
								<p className="text-sm">{r.host}</p>

								<div className="mt-2 flex items-center justify-between">
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											r.status === "online"
												? "bg-green-100 text-green-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{r.status}
									</span>

									{r.isDefaultRouter && (
										<span className="text-xs text-primary">
											Default
										</span>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* ================= CREATE MODAL ================= */}
			<RouterCreateModal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				form={createForm}
				setForm={setCreateForm}
				onCreate={handleCreate}
			/>
		</div>
	);
}

/* =====================================================
	Small UI Helpers
===================================================== */

function Info({ label, value }: { label: string; value: any }) {
	return (
		<div className="text-sm">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="font-medium">{value}</p>
		</div>
	);
}

/* =====================================================
	Create Modal (kept clean)
===================================================== */

function RouterCreateModal({
	open,
	onClose,
	form,
	setForm,
	onCreate,
}: any) {
	return (
		<Modal open={open} onClose={onClose}>
			<ModalHeader>Create Router</ModalHeader>

			<ModalBody className="space-y-3">
				<InputField
					label="Name"
					value={form.name}
					onChange={(e) =>
						setForm((p: any) => ({
							...p,
							name: e.target.value,
						}))
					}
				/>

				<InputField
					label="Code"
					value={form.code}
					onChange={(e) =>
						setForm((p: any) => ({
							...p,
							code: e.target.value,
						}))
					}
				/>

				<InputField
					label="Host"
					value={form.host}
					onChange={(e) =>
						setForm((p: any) => ({
							...p,
							host: e.target.value,
						}))
					}
				/>

				<InputField
					label="Username"
					value={form.username}
					onChange={(e) =>
						setForm((p: any) => ({
							...p,
							username: e.target.value,
						}))
					}
				/>

				<InputField
					label="Password"
					type="password"
					value={form.password}
					onChange={(e) =>
						setForm((p: any) => ({
							...p,
							password: e.target.value,
						}))
					}
				/>
			</ModalBody>

			<ModalFooter>
				<Button variant="ghost" onClick={onClose}>
					Cancel
				</Button>
				<Button onClick={onCreate}>Create</Button>
			</ModalFooter>
		</Modal>
	);
}