"use client";

import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/Button";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Modal, { ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import PageHeader from "@/components/ui/PageHeader";
import { useSyncAllRouters } from "@/features/router/hooks/useRouterSync";
import { routerApi, Router, UpdateRouterDto,CreateRouterDto } from "@/lib/api/router";

export default function RoutersPage() {
const queryClient = useQueryClient();

const [selected, setSelected] = useState<Router | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [createOpen, setCreateOpen] = useState(false);

const detailRef = useRef<HTMLDivElement | null>(null);

// Forms initialized with type-safe defaults based on your API response
const [editForm, setEditForm] = useState<UpdateRouterDto>({});

const [createForm, setCreateForm] = useState<CreateRouterDto>({
	name: "",
	code: "",
	host: "",
	username: "",
	password: "",
	port: 8728,
	ssl: false,

	supportedServices: [],

	location: "",
	siteCode: "",
	popName: "",

	connectionType: "direct",
	connectorId: null,

	isEnabled: true,
	apiEnabled: true,

	maxSessions: 0,

	priority: 1,
	isDefaultRouter: false,
});

// ================= DATA FETCHING =================

const query = useQuery({
	queryKey: ["routers"],
	queryFn: routerApi.getAll,
});

console.log("router response:", query.data);
const routers = query.data ?? [];

// ================= MUTATIONS =================

const createMutation = useMutation({
	mutationFn: (data: CreateRouterDto) => routerApi.create(data),

	onSuccess: () => {
		queryClient.invalidateQueries({
			queryKey: ["routers"],
		});

		setCreateOpen(false);

		setCreateForm({
			name: "",
			code: "",
			host: "",
			username: "",
			password: "",
			port: 8728,
			ssl: false,

			supportedServices: [],

			location: "",
			siteCode: "",
			popName: "",

			connectionType: "direct",
			connectorId: null,

			isEnabled: true,
			apiEnabled: true,

			maxSessions: 0,

			priority: 1,
			isDefaultRouter: false,
		});
	},
});

const updateMutation = useMutation({
	mutationFn: ({
		id,
		data,
	}: {
		id: string;
		data: UpdateRouterDto;
	}) => routerApi.update(id, data),

	onSuccess: (response) => {
		queryClient.invalidateQueries({
			queryKey: ["routers"],
		});

		setIsEditing(false);

		if (response?.data) {
			setSelected(response.data);
		}
	},
});

const {
    mutate: syncAllRouters,
    isPending: isSyncing,
} = useSyncAllRouters();

// ================= HANDLERS =================

const handleSelect = (router: Router) => {
	setSelected(router);
	setIsEditing(false);

	setTimeout(() => {
		detailRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}, 50);
};

const handleSave = () => {
	if (!selected) return;

	updateMutation.mutate({
		id: selected.id,
		data: editForm,
	});
};

const handleCreate = () => {
	createMutation.mutate(createForm);
};

// ================= EFFECTS =================

// Sync edit form fields when selection changes
useEffect(() => {
	if (!selected) return;

	setEditForm({
		name: selected.name,
		code: selected.code,

		host: selected.host,
		port: selected.port,
		username: selected.username,
		ssl: selected.ssl,

		supportedServices: selected.supportedServices,

		location: selected.location,
		siteCode: selected.siteCode,
		popName: selected.popName,

		isEnabled: selected.isEnabled,
		apiEnabled: selected.apiEnabled,

		connectionType: selected.connectionType,
		connectorId: selected.connectorId,

		maxSessions: selected.maxSessions,

		priority: selected.priority,
		isDefaultRouter: selected.isDefaultRouter,
	});
}, [selected]);
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
					<div className="flex gap-2">
						<Button
							onClick={() => syncAllRouters()}
							disabled={isSyncing}
							variant="outline"
						>
							{isSyncing ? "Syncing..." : "Sync All"}
						</Button>

						<Button onClick={() => setCreateOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							New Router
						</Button>
					</div>
				}
			/>

			{/* ================= SELECTED DETAIL (TOP EXPANDING CARD) ================= */}
			{selected && (
				<div ref={detailRef}>
					<Card className="border-primary/30 bg-primary/5">
						<CardHeader>
							<div>
								<p className="text-xl font-semibold">
									{selected.name}
								</p>

								<div className="flex flex-wrap gap-2 mt-1 text-xs">
									<span className="px-2 py-1 rounded bg-muted">
										{selected.code}
									</span>

									<span className="px-2 py-1 rounded bg-muted">
										{selected.host}:{selected.port}
									</span>

									<span
										className={`rounded px-2 py-1 ${
											selected.status === "online"
												? "bg-green-100 text-green-700"
												: selected.status === "maintenance"
													? "bg-yellow-100 text-yellow-700"
													: "bg-red-100 text-red-700"
										}`}
									>
										{selected.status}
									</span>
								</div>
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

						<CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">

							{/* Identity */}
							{isEditing ? (
								<InputField
									label="Name"
									value={editForm.name ?? ""}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											name: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Name" value={selected.name} />
							)}

							{isEditing ? (
								<InputField
									label="Code"
									value={editForm.code ?? ""}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											code: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Code" value={selected.code} />
							)}

							{/* Connection */}
							{isEditing ? (
								<InputField
									label="Host"
									value={editForm.host ?? ""}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											host: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Host" value={selected.host} />
							)}

							{isEditing ? (
								<InputField
									label="Username"
									value={editForm.username ?? ""}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											username: e.target.value,
										}))
									}
								/>
							) : (
								<Info label="Username" value={selected.username} />
							)}

							{isEditing ? (
								<InputField
									label="Port"
									type="number"
									value={String(editForm.port ?? "")}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											port: Number(e.target.value),
										}))
									}
								/>
							) : (
								<Info label="Port" value={selected.port} />
							)}

							<Info
								label="Supported Services"
								value={
									selected.supportedServices?.join(", ") || "-"
								}
							/>

							<Info
								label="Location"
								value={selected.location || "-"}
							/>

							<Info
								label="Site Code"
								value={selected.siteCode || "-"}
							/>

							<Info
								label="POP"
								value={selected.popName || "-"}
							/>

							{/* Status */}
							<Info
								label="Status"
								value={selected.status}
							/>

							<Info
								label="Sessions"
								value={`${selected.currentSessions}/${selected.maxSessions}`}
							/>

							{/* Connection Type */}
							{isEditing ? (
								<select
									className="p-2 border rounded-md bg-background"
									value={editForm.connectionType ?? "direct"}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											connectionType: e.target.value as
												| "direct"
												| "agent"
												| "vpn",
										}))
									}
								>
									<option value="direct">
										Direct
									</option>

									<option value="agent">
										Agent
									</option>

									<option value="vpn">
										VPN
									</option>
								</select>
							) : (
								<Info
									label="Connection Type"
									value={selected.connectionType}
								/>
							)}


							{/* Connector ID */}
							{isEditing ? (
								<InputField
									label="Connector ID"
									value={editForm.connectorId ?? ""}
									onChange={(e) =>
										setEditForm((p) => ({
											...p,
											connectorId: e.target.value,
										}))
									}
								/>
							) : (
								<Info
									label="Connector ID"
									value={selected.connectorId || "-"}
								/>
							)}
							{/* Settings */}
							<Info
								label="Priority"
								value={selected.priority}
							/>

							<Info
								label="Default Router"
								value={selected.isDefaultRouter ? "Yes" : "No"}
							/>

							<Info
								label="API Enabled"
								value={selected.apiEnabled ? "Yes" : "No"}
							/>

							<Info
								label="Enabled"
								value={selected.isEnabled ? "Yes" : "No"}
							/>

							<Info
								label="SSL"
								value={selected.ssl ? "Enabled" : "Disabled"}
							/>

							{/* RouterOS Metadata */}
							<Info
								label="Router UID"
								value={selected.routerUid || "-"}
							/>

							<Info
								label="RouterOS Version"
								value={selected.routerOsVersion || "-"}
							/>

							<Info
								label="Board"
								value={selected.routerBoard || "-"}
							/>

							<Info
								label="System Identity"
								value={selected.systemIdentity || "-"}
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

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
								<div className="flex items-start justify-between">
									<div>
										<p className="font-semibold">
											{r.name}
										</p>

										<span className="text-xs text-muted-foreground">
											{r.code}
										</span>
									</div>

									<span
										className={`text-xs px-2 py-1 rounded-full ${
											r.status === "online"
												? "bg-green-100 text-green-700"
												: r.status === "maintenance"
													? "bg-yellow-100 text-yellow-700"
													: "bg-red-100 text-red-700"
										}`}
									>
										{r.status}
									</span>
								</div>
							</CardHeader>

							<CardContent className="space-y-3">
								<div>
									<p className="text-sm font-medium">
										{r.host}:{r.port}
									</p>

									<p className="text-xs text-muted-foreground">
										{r.location || "No location"}
										{r.popName && ` • ${r.popName}`}
									</p>
								</div>


								<div className="flex flex-wrap gap-2">
									{r.supportedServices?.map((service) => (
										<span
											key={service}
											className="px-2 py-1 text-xs rounded bg-muted"
										>
											{service}
										</span>
									))}
								</div>


								<div className="flex items-center justify-between text-xs">
									<span>
										Sessions:
										{" "}
										{r.currentSessions}/{r.maxSessions}
									</span>

									<span>
										{r.connectionType}
									</span>
								</div>


								<div className="flex items-center justify-between">
									{r.isDefaultRouter ? (
										<span className="text-xs font-medium text-primary">
											Default Router
										</span>
									) : (
										<span />
									)}

									{!r.isEnabled && (
										<span className="text-xs text-red-600">
											Disabled
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
			<p className="text-xs text-muted-foreground">{label}</p>
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
						setForm((p: CreateRouterDto) => ({
							...p,
							name: e.target.value,
						}))
					}
				/>

				<InputField
					label="Code"
					value={form.code}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							code: e.target.value,
						}))
					}
				/>

				<InputField
					label="Host"
					value={form.host}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							host: e.target.value,
						}))
					}
				/>

				<InputField
					label="Port"
					type="number"
					value={String(form.port ?? "")}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							port: Number(e.target.value),
						}))
					}
				/>

				<InputField
					label="Username"
					value={form.username}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
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
						setForm((p: CreateRouterDto) => ({
							...p,
							password: e.target.value,
						}))
					}
				/>

				<InputField
					label="Location"
					value={form.location ?? ""}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							location: e.target.value,
						}))
					}
				/>

				<InputField
					label="Site Code"
					value={form.siteCode ?? ""}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							siteCode: e.target.value,
						}))
					}
				/>

				<InputField
					label="POP Name"
					value={form.popName ?? ""}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							popName: e.target.value,
						}))
					}
				/>

				<InputField
					label="Max Sessions"
					type="number"
					value={String(form.maxSessions ?? "")}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							maxSessions: Number(e.target.value),
						}))
					}
				/>

				<InputField
					label="Priority"
					type="number"
					value={String(form.priority ?? "")}
					onChange={(e) =>
						setForm((p: CreateRouterDto) => ({
							...p,
							priority: Number(e.target.value),
						}))
					}
				/>

				<div className="space-y-2">
					<p className="text-sm font-medium">
						Supported Services
					</p>

					<div className="flex gap-2">
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={
									form.supportedServices?.includes("pppoe")
								}
								onChange={(e) =>
									setForm((p: CreateRouterDto) => ({
										...p,
										supportedServices: e.target.checked
											? [
												...(p.supportedServices ?? []),
												"pppoe",
											]
											: (p.supportedServices ?? []).filter(
												(x) => x !== "pppoe"
											),
									}))
								}
							/>
							PPPoE
						</label>

						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={
									form.supportedServices?.includes("hotspot")
								}
								onChange={(e) =>
									setForm((p: CreateRouterDto) => ({
										...p,
										supportedServices: e.target.checked
											? [
												...(p.supportedServices ?? []),
												"hotspot",
											]
											: (p.supportedServices ?? []).filter(
												(x) => x !== "hotspot"
											),
									}))
								}
							/>
							Hotspot
						</label>
					</div>
				</div>

			</ModalBody>

			<ModalFooter>
				<Button variant="ghost" onClick={onClose}>
					Cancel
				</Button>

				<Button onClick={onCreate}>
					Create
				</Button>
			</ModalFooter>
		</Modal>
	);
}