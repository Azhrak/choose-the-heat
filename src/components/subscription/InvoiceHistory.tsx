import {
	CheckCircle,
	Clock,
	Download,
	Eye,
	FileText,
	XCircle,
} from "lucide-react";
import { useInvoicesQuery } from "~/hooks/useBillingQuery";

export function InvoiceHistory() {
	const { data: invoices, isLoading } = useInvoicesQuery();

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "paid":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "open":
			case "draft":
				return <Clock className="w-5 h-5 text-yellow-500" />;
			default:
				return <XCircle className="w-5 h-5 text-red-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
			case "open":
			case "draft":
				return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
			default:
				return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatAmount = (amount: string, currency: string) => {
		const num = parseFloat(amount);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency || "USD",
		}).format(num);
	};

	if (isLoading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-20 bg-gray-200 dark:bg-gray-700 rounded"
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
			<div className="flex items-center gap-2 mb-6">
				<FileText className="w-5 h-5 text-rose-500" />
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					Invoice History
				</h2>
			</div>

			{!invoices || invoices.length === 0 ? (
				<div className="text-center py-12">
					<FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
					<p className="text-gray-600 dark:text-gray-400 mb-2">
						No invoices yet
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-500">
						Invoices will appear here after your first payment
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{invoices.map((invoice) => (
						<div
							key={invoice.id}
							className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
						>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										{getStatusIcon(invoice.status)}
										<div>
											<h3 className="font-semibold text-gray-900 dark:text-white">
												Invoice #{invoice.invoice_number}
											</h3>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{formatDate(invoice.created_at)}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-3 text-sm">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}
										>
											{invoice.status}
										</span>
										<span className="text-gray-600 dark:text-gray-400">
											{formatDate(invoice.billing_period_start)} -{" "}
											{formatDate(invoice.billing_period_end)}
										</span>
										{invoice.subscription_tier && (
											<span className="text-gray-600 dark:text-gray-400 capitalize">
												{invoice.subscription_tier.replace("_", " ")} Plan
											</span>
										)}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="text-right">
										<div className="text-2xl font-bold text-gray-900 dark:text-white">
											{formatAmount(invoice.total_amount, invoice.currency)}
										</div>
										{invoice.paid_at && (
											<div className="text-xs text-gray-500 dark:text-gray-400">
												Paid {formatDate(invoice.paid_at)}
											</div>
										)}
									</div>

									<div className="flex gap-2">
										{invoice.hosted_invoice_url && (
											<a
												href={invoice.hosted_invoice_url}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
												title="View Invoice"
											>
												<Eye className="w-5 h-5" />
											</a>
										)}
										{invoice.pdf_url && (
											<a
												href={invoice.pdf_url}
												download
												className="p-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
												title="Download PDF"
											>
												<Download className="w-5 h-5" />
											</a>
										)}
									</div>
								</div>
							</div>

							{/* Additional details */}
							{(invoice.card_last4 || invoice.coupon_code) && (
								<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
									{invoice.card_last4 && (
										<div className="flex items-center gap-2">
											<span className="capitalize">
												{invoice.payment_method || "card"}
											</span>
											<span>•••• {invoice.card_last4}</span>
										</div>
									)}
									{invoice.coupon_code && (
										<div className="flex items-center gap-2">
											<span className="text-green-600 dark:text-green-400 font-medium">
												Coupon: {invoice.coupon_code}
											</span>
											{invoice.discount_amount &&
												parseFloat(invoice.discount_amount) > 0 && (
													<span>
														(-
														{formatAmount(
															invoice.discount_amount,
															invoice.currency,
														)}
														)
													</span>
												)}
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{invoices && invoices.length > 0 && (
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Showing {invoices.length} most recent invoice
						{invoices.length !== 1 ? "s" : ""}
					</p>
				</div>
			)}
		</div>
	);
}
