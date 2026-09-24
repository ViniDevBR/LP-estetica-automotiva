# TODO — Itamaraty Estética Automotiva

## Domínio (urgente antes de publicar)

Trocar o placeholder `SEU-DOMINIO.com.br` pelo domínio real nos seguintes arquivos:

- `index.html` — `canonical`, `og:image`, `og:url`, e todas as URLs absolutas dentro do JSON-LD (`@id`, `url`, `image.url`, `logo.url`, `provider.@id`, `BreadcrumbList.item`)
- `robots.txt` — linha `Sitemap:`
- `llms.txt` — link em "Páginas"
- `sitemap.xml` — `<loc>`

## Pendências de EEAT (dados que só o cliente tem)

- [ ] **CNPJ** — adicionar no rodapé do site e no JSON-LD (`taxID`). Sinal de legitimidade importante para negócio brasileiro.
