import React from "react";

const SubscriptionForm = ({
	form,
	onChange,
	onSubmit,
	isPending,
	profiles = [],
	profilesLoading = false,
	errorMessage = "",
	successMessage = "",
	formTitle = "Subscription Plan",
	showMikrotik = true,
	backButton = null,
}) => {
	return (
		<div className="max-w-3xl mx-auto p-6 space-y-6">
			{/* Header: Back button + Title */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-primary">{formTitle}</h1>
				{backButton}
			</div>

			<form
				onSubmit={onSubmit}
				className="space-y-4 bg-surface p-6 rounded-xl shadow-card"
			>
				{/* Error / Success messages */}
				{errorMessage && (
					<div className="p-3 bg-badge-danger-bg text-danger rounded-lg">
						{errorMessage}
					</div>
				)}
				{successMessage && (
					<div className="p-3 bg-badge-success-bg text-success rounded-lg">
						{successMessage}
					</div>
				)}

				{/* Plan Name */}
				<div>
					<label className="block mb-1 text-primary font-medium">
						Plan Name *
					</label>
					<input
						name="planName"
						value={form.planName}
						onChange={onChange}
						required
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					/>
				</div>

				{/* Price */}
				<div>
					<label className="block mb-1 text-primary font-medium">Price *</label>
					<input
						type="number"
						name="price"
						value={form.price}
						onChange={onChange}
						required
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					/>
				</div>

				{/* Speed Rate */}
				<div>
					<label className="block mb-1 text-primary font-medium">
						Speed Rate (Mbps) *
					</label>
					<input
						type="number"
						name="speedRate"
						value={form.speedRate}
						onChange={onChange}
						required
						min={10}
						step={10}
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					/>
					<p className="text-xs mt-1 text-muted">
						Use arrows or type any number in increments of 10 Mbps. Minimum 10.
					</p>
				</div>

				{/* Duration */}
				<div>
					<label className="block mb-1 text-primary font-medium">
						Duration (Days)
					</label>
					<select
						name="durationDays"
						value={form.durationDays}
						onChange={onChange}
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					>
						{[30, 60, 90, 120, 180, 360].map((days) => (
							<option key={days} value={days}>
								{days} Days
							</option>
						))}
					</select>
				</div>

				{/* Devices Allowed */}
				<div>
					<label className="block mb-1 text-primary font-medium">
						Devices Allowed
					</label>
					<input
						type="number"
						name="devicesAllowed"
						value={form.devicesAllowed}
						onChange={onChange}
						placeholder="Default: 1"
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					/>
				</div>

				{/* Features */}
				<div>
					<label className="block mb-1 text-primary font-medium">
						Features (comma separated)
					</label>
					<input
						name="features"
						value={form.features}
						onChange={onChange}
						className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
					/>
				</div>

				{/* Mikrotik Profile */}
				{showMikrotik && (
					<div>
						<label className="block mb-1 text-primary font-medium">
							Mikrotik Profile
						</label>
						<select
							name="mikrotikProfile"
							value={form.mikrotikProfile}
							onChange={onChange}
							className="w-full px-4 py-2 border border-surface rounded-md bg-card text-primary focus:outline-none focus-ring"
						>
							<option value="">None</option>
							{profiles.map((profile) => (
								<option key={profile} value={profile}>
									{profile}
								</option>
							))}
						</select>
						<p className="text-xs mt-1 text-muted">
							{profilesLoading ? "Loading Mikrotik profiles…" : "Optional"}
						</p>
					</div>
				)}

				{/* Submit */}
				<button
					type="submit"
					disabled={isPending}
					className={`w-full btn btn-primary ${
						isPending ? "opacity-50 cursor-not-allowed" : ""
					}`}
				>
					{isPending ? "Processing..." : "Submit"}
				</button>
			</form>
		</div>
	);
};

export default SubscriptionForm;
