import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const checkoutPath = resolve(root, 'src/views/CheckoutView.vue')
const checkout = readFileSync(checkoutPath, 'utf8')
if (/init_point|sandbox_init_point|window\.location\.href/.test(checkout)) {
  throw new Error('O checkout não deve usar Checkout Pro ou redirecionar o comprador.')
}

const privateCredentialNames = /MERCADO_PAGO_(?:ACCESS_TOKEN|WEBHOOK_SECRET)/
const configuredSecretPattern = /(?:VITE_)?MERCADO_PAGO_(?:ACCESS_TOKEN|WEBHOOK_SECRET)\s*=/
for (const filename of ['.env', '.env.production', '.env.example']) {
  const path = resolve(root, filename)
  if (existsSync(path) && configuredSecretPattern.test(readFileSync(path, 'utf8'))) {
    throw new Error(`Credencial privada encontrada em ${filename}.`)
  }
}

const dist = resolve(root, 'dist')
if (existsSync(dist)) {
  let bundle = ''
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (/\.(?:js|css|html)$/.test(entry.name)) bundle += readFileSync(path, 'utf8')
    }
  }
  visit(dist)
  if (privateCredentialNames.test(bundle))
    throw new Error('Nome ou credencial privada encontrada no bundle de produção.')
}

console.log('Verificação de segurança do checkout aprovada.')
