import {
	AlertCircle,
	CheckCircle,
	CreditCard,
	Edit,
	MapPin,
	Plus,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import {
	useBillingDetailsQuery,
	useUpdateBillingDetailsMutation,
} from "~/hooks/useBillingQuery";

export function BillingDetailsCard() {
	const { data: billingDetails, isLoading } = useBillingDetailsQuery();
	const updateBilling = useUpdateBillingDetailsMutation();
	const [isEditing, setIsEditing] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [formData, setFormData] = useState({
		billingName: billingDetails?.billingName || "",
		billingEmail: billingDetails?.billingEmail || "",
		billingAddressLine1: billingDetails?.billingAddressLine1 || "",
		billingAddressLine2: billingDetails?.billingAddressLine2 || "",
		billingCity: billingDetails?.billingCity || "",
		billingState: billingDetails?.billingState || "",
		billingPostalCode: billingDetails?.billingPostalCode || "",
		billingCountry: billingDetails?.billingCountry || "US",
		taxId: billingDetails?.taxId || "",
	});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		try {
			await updateBilling.mutateAsync(formData);
			setSuccess("Billing details updated successfully!");
			setIsEditing(false);
			setTimeout(() => setSuccess(""), 3000);
		} catch (_err) {
			setError("Failed to update billing details. Please try again.");
		}
	};

	const handleCancel = () => {
		setFormData({
			billingName: billingDetails?.billingName || "",
			billingEmail: billingDetails?.billingEmail || "",
			billingAddressLine1: billingDetails?.billingAddressLine1 || "",
			billingAddressLine2: billingDetails?.billingAddressLine2 || "",
			billingCity: billingDetails?.billingCity || "",
			billingState: billingDetails?.billingState || "",
			billingPostalCode: billingDetails?.billingPostalCode || "",
			billingCountry: billingDetails?.billingCountry || "US",
			taxId: billingDetails?.taxId || "",
		});
		setIsEditing(false);
		setError("");
	};

	if (isLoading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
				</div>
			</div>
		);
	}

	const hasPaymentMethod = billingDetails?.cardLast4;
	const hasBillingAddress = billingDetails?.billingAddressLine1;

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-2">
					<CreditCard className="w-5 h-5 text-rose-500" />
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Billing Details
					</h2>
				</div>
				{!isEditing && (
					<button
						onClick={() => setIsEditing(true)}
						className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 hover:underline"
					>
						{hasBillingAddress ? (
							<>
								<Edit className="w-4 h-4" />
								Edit
							</>
						) : (
							<>
								<Plus className="w-4 h-4" />
								Add Details
							</>
						)}
					</button>
				)}
			</div>

			{/* Success/Error Messages */}
			{success && (
				<div className="mb-4 flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
					<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
					<p className="text-sm text-green-600 dark:text-green-400">
						{success}
					</p>
				</div>
			)}
			{error && (
				<div className="mb-4 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{/* Payment Method */}
			{hasPaymentMethod && (
				<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Payment Method
					</h3>
					<div className="flex items-center gap-3">
						<div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
							<CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
								{billingDetails.cardBrand} •••• {billingDetails.cardLast4}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								Expires {billingDetails.cardExpMonth}/
								{billingDetails.cardExpYear}
							</p>
						</div>
					</div>
					<p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
						Payment method managed by{" "}
						{billingDetails.paymentProvider || "payment provider"}. Update your
						payment method during checkout.
					</p>
				</div>
			)}

			{/* Billing Address Form/Display */}
			{isEditing ? (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Full Name
							</label>
							<input
								type="text"
								value={formData.billingName}
								onChange={(e) =>
									setFormData({ ...formData, billingName: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								placeholder="John Doe"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Email
							</label>
							<input
								type="email"
								value={formData.billingEmail}
								onChange={(e) =>
									setFormData({ ...formData, billingEmail: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								placeholder="john@example.com"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Address Line 1
						</label>
						<input
							type="text"
							value={formData.billingAddressLine1}
							onChange={(e) =>
								setFormData({
									...formData,
									billingAddressLine1: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
							placeholder="123 Main Street"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
							Address Line 2 (Optional)
						</label>
						<input
							type="text"
							value={formData.billingAddressLine2}
							onChange={(e) =>
								setFormData({
									...formData,
									billingAddressLine2: e.target.value,
								})
							}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
							placeholder="Apartment, suite, etc."
						/>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								City
							</label>
							<input
								type="text"
								value={formData.billingCity}
								onChange={(e) =>
									setFormData({ ...formData, billingCity: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								placeholder="New York"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								State/Province
							</label>
							<input
								type="text"
								value={formData.billingState}
								onChange={(e) =>
									setFormData({ ...formData, billingState: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								placeholder="NY"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Postal Code
							</label>
							<input
								type="text"
								value={formData.billingPostalCode}
								onChange={(e) =>
									setFormData({
										...formData,
										billingPostalCode: e.target.value,
									})
								}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
								placeholder="10001"
							/>
						</div>
					</div>

					<div className="flex gap-3">
						<button
							type="submit"
							disabled={updateBilling.isPending}
							className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
						>
							{updateBilling.isPending ? "Saving..." : "Save Details"}
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			) : hasBillingAddress ? (
				<div className="space-y-4">
					<div className="flex items-start gap-3">
						<MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
						<div>
							<p className="font-medium text-gray-900 dark:text-white">
								{billingDetails.billingName}
							</p>
							{billingDetails.billingEmail && (
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{billingDetails.billingEmail}
								</p>
							)}
							<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
								{billingDetails.billingAddressLine1}
							</p>
							{billingDetails.billingAddressLine2 && (
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{billingDetails.billingAddressLine2}
								</p>
							)}
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{billingDetails.billingCity}, {billingDetails.billingState}{" "}
								{billingDetails.billingPostalCode}
							</p>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{billingDetails.billingCountry}
							</p>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-8">
					<MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						No billing details on file
					</p>
					<button
						onClick={() => setIsEditing(true)}
						className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
					>
						<Plus className="w-4 h-4" />
						Add Billing Details
					</button>
				</div>
			)}

			{!hasPaymentMethod && !isEditing && (
				<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
					<p className="text-sm text-blue-900 dark:text-blue-200">
						<strong>Note:</strong> Payment methods are securely managed during
						checkout. Your card details are never stored on our servers.
					</p>
				</div>
			)}
		</div>
	);
}
