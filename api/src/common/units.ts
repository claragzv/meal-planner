import { BadRequestException } from '@nestjs/common';

const massFactors: Record<string, number> = { g: 1, kg: 1000 };
const volumeFactors: Record<string, number> = { ml: 1, l: 1000 };

export function roundQuantity(quantity: number): number {
  return Number(quantity.toFixed(6));
}

export function convertQuantity(quantity: number, from: string, to: string): number {
  if (from === to) return roundQuantity(quantity);
  if (massFactors[from] !== undefined && massFactors[to] !== undefined) {
    return roundQuantity((quantity * massFactors[from]) / massFactors[to]);
  }
  if (volumeFactors[from] !== undefined && volumeFactors[to] !== undefined) {
    return roundQuantity((quantity * volumeFactors[from]) / volumeFactors[to]);
  }
  throw new BadRequestException(`Cannot convert ${from} to ${to}; configure compatible units first.`);
}

export function tryConvertQuantity(quantity: number, from: string, to: string): number | undefined {
  try {
    return convertQuantity(quantity, from, to);
  } catch {
    return undefined;
  }
}
