import test from 'node:test'
import assert from 'node:assert/strict'

import { formatCurrencyBRL } from '../src/utils/currency.ts'

test('formata valores em reais com separadores brasileiros de milhar e decimal', () => {
  assert.equal(formatCurrencyBRL(229999), 'R$\u00a0229.999,00')
  assert.equal(formatCurrencyBRL('229999.5'), 'R$\u00a0229.999,50')
})

test('retorna traço quando o preço não está disponível ou não é numérico', () => {
  assert.equal(formatCurrencyBRL(null), '—')
  assert.equal(formatCurrencyBRL('preço indisponível'), '—')
})
