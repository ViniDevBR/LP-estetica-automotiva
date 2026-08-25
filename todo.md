# TODO — Itamaraty Estética Automotiva

## Domínio (urgente antes de publicar)

Trocar o placeholder `SEU-DOMINIO.com.br` pelo domínio real nos seguintes arquivos:

- `index.html` — `canonical`, `og:image`, `og:url`, e todas as URLs absolutas dentro do JSON-LD (`@id`, `url`, `image.url`, `logo.url`, `provider.@id`, `BreadcrumbList.item`)
- `robots.txt` — linha `Sitemap:`
- `llms.txt` — link em "Páginas"
- `sitemap.xml` — `<loc>`

## Pendências de EEAT (dados que só o cliente tem)

- [ ] **CNPJ** — adicionar no rodapé do site e no JSON-LD (`taxID`). Sinal de legitimidade importante para negócio brasileiro.
- [ ] **Ano de fundação / tempo de mercado** — hoje omitido de propósito por falta do dado real.
- [ ] **Links de verificação externa** (aumentam autoridade para Google e IA):
  - [ ] Link/página do prêmio "Profissional do Ano — Detailerfest 2025"
  - [ ] Perfil público na IDA (International Detailing Association)
  - [ ] Página de parceiro certificado Colortek Leather
  - [ ] Página de parceiro certificado GZOX / Prospec
- [ ] **Bio curta do Anderson** (dono) na seção "Sobre" — nome, cargo, o que credencia ele tecnicamente. Hoje ele só aparece citado dentro dos depoimentos de clientes.
- [ ] **Automação Pasta Imagens** — Fazer um .map nas pastas de imagens para gerar os elementos dinamicamente.

## Outras melhorias sugeridas (menor prioridade)

- [ ] Substituir imagens geradas por IA por fotos reais da loja/equipe/carros ao longo do tempo (autenticidade > mood genérico).
