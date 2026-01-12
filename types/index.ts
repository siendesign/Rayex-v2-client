export interface Currency {
  code: string
  name: string
  flag: string
  type?: "fiat" | "crypto"
}

export interface Order {
  id: string
  from: { currency: string; amount: string; flag: string }
  to: { currency: string; amount: string; flag: string }
  status: "pending_payment" | "payment_received" | "processing" | "completed" | "failed" | "cancelled"
  paymentMethod: string
  recipientDetails?: {
    name: string
    bank?: string
    accountNumber?: string
    swift?: string
  }
  createdAt: string
  rate: number
  fee: number
}

export interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  buyRate: number
  sellRate: number
  lastUpdated: string
  autoUpdate: boolean
  active: boolean
}

export interface PaymentMethod {
  id: string
  name: string
  type: "bank" | "crypto"
  currency: string
  active: boolean
  // Bank fields
  bankName?: string
  accountName?: string
  accountNumber?: string
  routingNumber?: string
  swift?: string
  iban?: string
  // Crypto fields
  walletAddress?: string
  network?: string
  instructions?: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  status: "active" | "suspended" | "pending"
  totalOrders: number
  totalVolume: string
  joinedAt: string
  lastActive: string
  verificationStatus: "verified" | "unverified" | "pending"
}
