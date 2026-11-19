interface ChargedCheckIn {
  partySize: number
  feeCop: number
}

/**
 * Whether the amount a check-in kept is exactly its people × `feePerGuestCop`. The amount is always the stored one; this only
 * decides if the «personas × tarifa» line can be shown beside it as information. Check-ins from before the per-guest fee
 * were charged a flat amount, so for them it is false and they show their amount alone.
 */
export function matchesPerGuestFee(item: ChargedCheckIn, feePerGuestCop: number | undefined): boolean {
  return feePerGuestCop !== undefined && feePerGuestCop > 0 && item.feeCop === item.partySize * feePerGuestCop
}

/** Whether `amountCop` is exactly `guests` × `feePerGuestCop` (a period made only of per-guest check-ins). */
export function matchesPerGuestTotal(guests: number, amountCop: number, feePerGuestCop: number | undefined): boolean {
  return feePerGuestCop !== undefined && feePerGuestCop > 0 && guests > 0 && guests * feePerGuestCop === amountCop
}
