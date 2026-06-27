import { prisma } from './prisma'
import { ADDONS } from './addons'

// Defaults — used if the platform_config row is missing (e.g. pre-migration)
export const DEFAULT_PRICES = {
  starter: 299,
  pro: 599,
} as const

export const DEFAULT_ADDON_PRICES: Record<string, number> = Object.fromEntries(
  Object.entries(ADDONS).map(([key, a]) => [key, a.price])
)

export interface PlatformConfig {
  starterPrice: number
  proPrice: number
  addonPrices: Record<string, number>
}

/**
 * Read the global platform pricing config. Falls back to hardcoded defaults
 * if the DB row is missing, so the app keeps working pre-migration.
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  const row = await prisma.platformConfig.findUnique({ where: { id: 1 } })
  if (!row) {
    return {
      starterPrice: DEFAULT_PRICES.starter,
      proPrice: DEFAULT_PRICES.pro,
      addonPrices: { ...DEFAULT_ADDON_PRICES },
    }
  }
  return {
    starterPrice: row.starterPrice,
    proPrice: row.proPrice,
    addonPrices:
      typeof row.addonPrices === 'object' && row.addonPrices !== null
        ? (row.addonPrices as Record<string, number>)
        : { ...DEFAULT_ADDON_PRICES },
  }
}

/**
 * Async plan list (starter/pro) with prices sourced from the DB.
 * Use this instead of the hardcoded PLANS constant in lib/billing.ts
 * wherever current pricing matters.
 */
export async function getPlans() {
  const cfg = await getPlatformConfig()
  return [
    {
      key: 'starter' as const,
      name: 'Starter',
      price: cfg.starterPrice,
    },
    {
      key: 'pro' as const,
      name: 'Pro',
      price: cfg.proPrice,
    },
  ]
}

/**
 * Resolve a plan tier from a basePlanPrice integer, using live config.
 * Returns 'starter' | 'pro' (whichever price matches; defaults to starter).
 */
export async function resolvePlan(basePlanPrice: number): Promise<'starter' | 'pro'> {
  const cfg = await getPlatformConfig()
  if (basePlanPrice === cfg.proPrice) return 'pro'
  return 'starter'
}
