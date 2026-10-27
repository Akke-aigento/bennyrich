<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Shop open/closed status comes from SellQo `get_shop_status` in the root loader (`src/lib/shop-status*.ts`) and is fail-open: only an explicit `open === false` closes the shop, so SellQo being unreachable never takes the site down.
