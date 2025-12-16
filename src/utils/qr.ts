import { z } from 'zod'

const joinSessionSchema = z.object({
  type: z.literal('join-session'),
  sessionId: z.string(),
  joinCode: z.string(),
  card: z.object({
    id: z.string(),
    title: z.string(),
    punchesRequired: z.number().positive(),
    minSats: z.number().positive(),
  }),
  demoMode: z.boolean().default(true),
})

const purchaseTicketSchema = z.object({
  type: z.literal('purchase-ticket'),
  sessionId: z.string(),
  cardId: z.string(),
  cardTitle: z.string(),
  punchesRequired: z.number().positive(),
  minSats: z.number().positive(),
  purchaseNonce: z.string(),
  expiresAt: z.number(),
})

export type ParsedPayload =
  | z.infer<typeof joinSessionSchema>
  | z.infer<typeof purchaseTicketSchema>
  | { type: 'text'; value: string }
  | { type: 'unknown'; raw: unknown }

export const parsePayload = (payload: unknown): ParsedPayload => {
  if (typeof payload === 'string') {
    try {
      const parsed = JSON.parse(payload) as unknown
      return parsePayload(parsed)
    } catch (error) {
      return { type: 'text', value: payload }
    }
  }
  const parsedJoin = joinSessionSchema.safeParse(payload)
  if (parsedJoin.success) return parsedJoin.data
  const parsedPurchase = purchaseTicketSchema.safeParse(payload)
  if (parsedPurchase.success) return parsedPurchase.data
  return { type: 'unknown', raw: payload }
}
