# M.I.K.E. website

Veřejný statický marketingový web pro `m.i.k.e.praut.cz`. Produktový zdroj ani
osobní data sem nepatří.

## Nasazení

1. Založte veřejný GitHub repozitář `EmperorKunDis/mike-site` a nastavte Pages
   source na GitHub Actions.
2. Přidejte custom domain `m.i.k.e.praut.cz`, ověřte ji v GitHubu a nastavte
   odpovídající DNS záznam podle GitHub Pages.
3. V Cloudflare vytvořte Turnstile widget pro `m.i.k.e.praut.cz` a vložte jeho
   veřejný site key do `data-turnstile-sitekey` v `index.html`.
4. Nezapínejte formulář, dokud privacy page neobsahuje právní název a sídlo
   správce a Worker není nasazený na `api.m.i.k.e.praut.cz`.
