import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

export interface BillingDetails {
	billingName: string | null;
	billingEmail: string | null;
	billingAddressLine1: string | null;
	billingAddressLine2: string | null;
	billingCity: string | null;
	billingState: string | null;
	billingPostalCode: string | null;
	billingCountry: string | null;
	taxId: string | null;
	taxIdType: string | null;
	cardBrand: string | null;
	cardLast4: string | null;
	cardExpMonth: number | null;
	cardExpYear: number | null;
	paymentProvider: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Invoice {
	id: string;
	invoice_number: string;
	subscription_tier: string;
	billing_period_start: string;
	billing_period_end: string;
	subtotal: string;
	tax_amount: string;
	discount_amount: string;
	total_amount: string;
	currency: string;
	status: string;
	paid_at: string | null;
	due_date: string | null;
	payment_method: string | null;
	card_last4: string | null;
	payment_provider: string | null;
	pdf_url: string | null;
	hosted_invoice_url: string | null;
	coupon_code: string | null;
	coupon_description: string | null;
	created_at: string;
	updated_at: string;
}

export interface InvoiceWithLineItems extends Invoice {
	lineItems: Array<{
		id: string;
		description: string;
		quantity: number;
		unit_amount: string;
		amount: string;
		currency: string;
		period_start: string | null;
		period_end: string | null;
	}>;
}

export const billingDetailsQueryKey = ["billingDetails"] as const;
export const invoicesQueryKey = ["invoices"] as const;

/**
 * Get user's billing details
 */
export function useBillingDetailsQuery() {
	return useQuery({
		queryKey: billingDetailsQueryKey,
		queryFn: async () => {
			try {
				return await api.get<BillingDetails | null>("/api/billing/details");
			} catch (_error) {
				// Return null if no billing details exist yet
				return null;
			}
		},
	});
}

/**
 * Update billing details
 */
export function useUpdateBillingDetailsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			billingName?: string;
			billingEmail?: string;
			billingAddressLine1?: string;
			billingAddressLine2?: string;
			billingCity?: string;
			billingState?: string;
			billingPostalCode?: string;
			billingCountry?: string;
			taxId?: string;
			taxIdType?: string;
		}) => {
			return await api.patch<BillingDetails>("/api/billing/details", data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billingDetailsQueryKey });
		},
	});
}

/**
 * Get user's invoices
 */
export function useInvoicesQuery(limit = 50, offset = 0) {
	return useQuery({
		queryKey: [...invoicesQueryKey, limit, offset],
		queryFn: async () => {
			return await api.get<Invoice[]>(
				`/api/billing/invoices?limit=${limit}&offset=${offset}`,
			);
		},
	});
}

/**
 * Get a specific invoice with line items
 */
export function useInvoiceQuery(invoiceId: string | null) {
	return useQuery({
		queryKey: [...invoicesQueryKey, invoiceId],
		queryFn: async () => {
			if (!invoiceId) return null;
			return await api.get<InvoiceWithLineItems>(
				`/api/billing/invoices/${invoiceId}`,
			);
		},
		enabled: !!invoiceId,
	});
}
