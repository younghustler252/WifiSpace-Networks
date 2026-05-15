"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreVertical } from "lucide-react";

import { planApi, Plan } from "@/lib/api/plan";

import Button from "@/components/ui/Button";
import Modal, { ModalHeader, ModalBody } from "@/components/ui/Modal";
import PlanForm from "@/components/forms/PlanForm";

import Dropdown, {
	DropdownItem,
	DropdownDivider,
} from "@/components/ui/Dropdown";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/Table";

import { MobileDataCard } from "@/components/ui/MobileDataCard";
import AdminTableLayout from "@/components/layout/AdminTableLayout";

export default function AdminPlansPage() {
	const queryClient = useQueryClient();

	// ================= STATE =================

	const [serviceTypeFilter, setServiceTypeFilter] = useState("");
	const [accountTypeFilter, setAccountTypeFilter] = useState("");

	const [sort, setSort] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [openCreate, setOpenCreate] = useState(false);

	const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

	// DELETE STATE

	const [openDeleteModal, setOpenDeleteModal] = useState(false);

	const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(
		null
	);

	// ================= QUERY =================

	const { data, isLoading, isFetching, error } = useQuery({
		queryKey: [
			"admin-plans",
			serviceTypeFilter,
			accountTypeFilter,
			sort,
			page,
			limit,
		],

		queryFn: () =>
			planApi.getAll({
				serviceType:
					serviceTypeFilter as "pppoe" | "hotspot" | undefined,

				accountType:
					accountTypeFilter as
						| "personal"
						| "business"
						| undefined,

				sort: sort || undefined,
				page,
				limit,
			}),

		placeholderData: (prev) => prev,
	});

	const plans = data?.data?.data ?? [];

	const pagination = data?.data?.pagination;

	const totalPages = pagination?.totalPages || 1;

	// ================= MUTATIONS =================

	const createMutation = useMutation({
		mutationFn: planApi.create,

		onSuccess: () => {
			setOpenCreate(false);

			queryClient.invalidateQueries({
				queryKey: ["admin-plans"],
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<Plan>;
		}) => planApi.update(id, data),

		onSuccess: () => {
			setEditingPlan(null);

			queryClient.invalidateQueries({
				queryKey: ["admin-plans"],
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: planApi.remove,

		onSuccess: () => {
			setOpenDeleteModal(false);

			setSelectedDeleteId(null);

			queryClient.invalidateQueries({
				queryKey: ["admin-plans"],
			});
		},

		onError: (err) => {
			console.error("Delete failed:", err);
		},
	});

	// ================= HANDLERS =================

	const handleCreate = async (data: any) => {
		await createMutation.mutateAsync(data);
	};

	const handleUpdate = async (data: any) => {
		if (!editingPlan) return;

		await updateMutation.mutateAsync({
			id: editingPlan.id,
			data,
		});
	};

	const handleDeleteClick = (id: string) => {
		setSelectedDeleteId(id);

		setOpenDeleteModal(true);
	};

	const confirmDelete = () => {
		if (!selectedDeleteId) return;

		deleteMutation.mutate(selectedDeleteId);
	};

	const handleFilterChange =
		(setter: (value: string) => void) => (value: string) => {
			setter(value);

			setPage(1);
		};

	// ================= ERROR =================

	if (error) {
		return (
			<div className="p-6 text-danger text-center">
				Failed to load plans
			</div>
		);
	}

	// ================= TOOLBAR =================

	const primary = null;

	const secondary = (
		<>
			{/* SERVICE TYPE */}

			<select
				className="ui-input"
				value={serviceTypeFilter}
				onChange={(e) =>
					handleFilterChange(setServiceTypeFilter)(
						e.target.value
					)
				}
			>
				<option value="">All Services</option>

				<option value="pppoe">PPPoE</option>

				<option value="hotspot">Hotspot</option>
			</select>

			{/* ACCOUNT TYPE */}

			<select
				className="ui-input"
				value={accountTypeFilter}
				onChange={(e) =>
					handleFilterChange(setAccountTypeFilter)(
						e.target.value
					)
				}
			>
				<option value="">All Accounts</option>

				<option value="personal">Personal</option>

				<option value="business">Business</option>
			</select>

			{/* SORT */}

			<select
				className="ui-input"
				value={sort}
				onChange={(e) => {
					setSort(e.target.value);

					setPage(1);
				}}
			>
				<option value="">Default</option>

				<option value="price_asc">Price ↑</option>

				<option value="price_desc">Price ↓</option>
			</select>

			{/* LIMIT */}

			<select
				className="ui-input"
				value={limit}
				onChange={(e) => {
					setLimit(Number(e.target.value));

					setPage(1);
				}}
			>
				<option value={10}>10</option>

				<option value={20}>20</option>

				<option value={50}>50</option>
			</select>
		</>
	);

	const actions = (
		<Button variant="accent" onClick={() => setOpenCreate(true)}>
			<Plus className="w-4 h-4 mr-2" />
			Create Plan
		</Button>
	);

	// ================= RENDER =================

	return (
		<>
			<AdminTableLayout
				title="Manage Plans"
				primary={primary}
				secondary={secondary}
				actions={actions}
				loading={isLoading}
				fetching={isFetching}
				isEmpty={plans.length === 0}
				emptyText="No plans found"
				page={page}
				totalPages={totalPages}
				limit={limit}
				onPageChange={setPage}
				onLimitChange={setLimit}

				// ================= MOBILE =================

				mobile={
					<div className="ui-stack">
						{plans.map((plan: Plan) => (
							<MobileDataCard
								key={plan.id}
								title={plan.name}
								subtitle={`${plan.serviceType}${
									plan.accountType
										? ` • ${plan.accountType}`
										: ""
								}`}
								badge={
									<span className="ui-badge ui-badge-success">
										{plan.status}
									</span>
								}
								fields={[
									{
										label: "Price",
										value: `₦${plan.price}`,
									},

									{
										label: "Speed",
										value: plan.speedRate,
									},

									{
										label: "Duration",
										value: `${plan.durationValue} ${plan.durationUnit}`,
									},

									{
										label: "Devices",
										value: plan.devicesAllowed,
									},
								]}
								onClick={() => setEditingPlan(plan)}
								actions={
									<Dropdown
										trigger={
											<button className="p-2">
												⋮
											</button>
										}
									>
										<DropdownItem
											onClick={() =>
												setEditingPlan(plan)
											}
										>
											Edit
										</DropdownItem>

										<DropdownDivider />

										<DropdownItem
											danger
											onClick={() =>
												handleDeleteClick(plan.id)
											}
										>
											Delete
										</DropdownItem>
									</Dropdown>
								}
							/>
						))}
					</div>
				}

				// ================= DESKTOP =================

				table={
					<Table>
						<TableHeader>
							<tr>
								<TableHead>Name</TableHead>

								<TableHead>Service</TableHead>

								<TableHead>Account</TableHead>

								<TableHead>Price</TableHead>

								<TableHead>Speed</TableHead>

								<TableHead>Duration</TableHead>

								<TableHead>Status</TableHead>

								<TableHead>Actions</TableHead>
							</tr>
						</TableHeader>

						<TableBody>
							{plans.map((plan: Plan) => (
								<TableRow
									key={plan.id}
									onClick={() =>
										setEditingPlan(plan)
									}
								>
									<TableCell>
										{plan.name}
									</TableCell>

									<TableCell className="capitalize">
										{plan.serviceType}
									</TableCell>

									<TableCell className="capitalize">
										{plan.accountType || "-"}
									</TableCell>

									<TableCell>
										₦{plan.price}
									</TableCell>

									<TableCell>
										{plan.speedRate}
									</TableCell>

									<TableCell>
										{plan.durationValue}{" "}
										{plan.durationUnit}
									</TableCell>

									<TableCell>
										<span className="ui-badge ui-badge-success">
											{plan.status}
										</span>
									</TableCell>

									<TableCell>
										<div
											onClick={(e) =>
												e.stopPropagation()
											}
										>
											<Dropdown
												trigger={
													<button>
														<MoreVertical />
													</button>
												}
											>
												<DropdownItem
													onClick={() =>
														setEditingPlan(
															plan
														)
													}
												>
													Edit
												</DropdownItem>

												<DropdownDivider />

												<DropdownItem
													danger
													onClick={() =>
														handleDeleteClick(
															plan.id
														)
													}
												>
													Delete
												</DropdownItem>
											</Dropdown>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				}
			/>

			{/* ================= CREATE MODAL ================= */}

			<Modal
				open={openCreate}
				onClose={() => setOpenCreate(false)}
				size="lg"
			>
				<ModalHeader>Create Plan</ModalHeader>

				<ModalBody>
					<PlanForm
						onSubmit={handleCreate}
						loading={createMutation.isPending}
					/>
				</ModalBody>
			</Modal>

			{/* ================= EDIT MODAL ================= */}

			<Modal
				open={!!editingPlan}
				onClose={() => setEditingPlan(null)}
				size="lg"
			>
				<ModalHeader>Edit Plan</ModalHeader>

				<ModalBody>
					{editingPlan && (
						<PlanForm
							defaultValues={{
								name: editingPlan.name,

								serviceType:
									editingPlan.serviceType,

								accountType:
									editingPlan.accountType,

								price: editingPlan.price,

								speedRate:
									editingPlan.speedRate,

								durationValue:
									editingPlan.durationValue,

								durationUnit:
									editingPlan.durationUnit,

								// dataLimitBytes:
								// 	editingPlan.dataLimitBytes,

								devicesAllowed:
									editingPlan.devicesAllowed,

								mikrotikProfile:
									editingPlan.mikrotikProfile,

								features: (
									editingPlan.features || []
								).join(", "),
							}}
							onSubmit={handleUpdate}
							loading={updateMutation.isPending}
						/>
					)}
				</ModalBody>
			</Modal>

			{/* ================= DELETE MODAL ================= */}

			<Modal
				open={openDeleteModal}
				onClose={() =>
					setOpenDeleteModal(false)
				}
				size="sm"
			>
				<ModalHeader>
					Confirm Delete
				</ModalHeader>

				<ModalBody>
					<p className="mb-4">
						Are you sure you want to delete this
						plan? This action cannot be undone.
					</p>

					<div className="flex justify-end gap-3">
						<Button
							variant="ghost"
							onClick={() =>
								setOpenDeleteModal(false)
							}
						>
							Cancel
						</Button>

						<Button
							variant="danger"
							onClick={confirmDelete}
							isLoading={
								deleteMutation.isPending
							}
						>
							Delete
						</Button>
					</div>
				</ModalBody>
			</Modal>
		</>
	);
}