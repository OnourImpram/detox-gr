# Approved aktar hero integration

Source branch base: `2afedc9777a3f4fb6c6cae5941867618aafe82b0`.
User-approved image: the final composition with the vinegar bottle on the left, not the earlier empty-left image. `src/data/aktar-hero.json` records the exact uploaded source SHA256 and four responsive WebP files. No crop is applied to the live-store image. No existing photograph, catalogue record, product price, quantity, stock, publication or checkout approval is modified.

## Two surfaces, explicitly separated

The existing multilingual store at `/` receives the approved image as its default hero. Its three actual archive photographs remain available as deliberate selections. The image is labelled illustrative in the current language. It is not assigned to SKU DT117 as a verified product picture and is not described as an actual view of the shop.

The user-selected `Yavaş Dükkân 08.3` HTML had not previously been deployed into this repository. Its updated 08.4 version is available at `/yavas-dukkan/`. This preserves the approved dark design, Turkish text, fourteen example products and local-only request interactions. It is a separately labelled design preview; it does not replace the 226-item live-store catalogue or silently imply a full design migration.

The tea hero is replaced with the approved aktar composition. “Bir çay içelim” becomes “Dükkâna buyurun.” The scene control is labelled “Aktardan”. On desktop the headline moves right to keep the left-hand vinegar bottle visible. On mobile the photograph occupies the upper area and the text sits below it. The source photo is neither stretched nor re-generated. Captions keep its illustrative status visible.

## Validation

Four new tests first failed for the missing scene and are now required. Existing source-preservation assertions remain. The browser suite verifies both surfaces at 320, 390, 768 and 1440 px, deliberate scene changes, responsive source replacement, the fourteen-product preview and its local list, plus every new asset hash. Existing v4 design checks now expect the new composition and all three real archive photos instead of asserting that every hero is an archive photo.

Local HTTP navigation is prohibited by this runtime's browser policy; that failed attempt is not a website failure or a passed browser check. Local visual review uses an inline copy with embedded images and fallback fonts. GitHub Actions runs the real HTTP and font-loading checks. After deployment, the same new suite runs against the actual public URL and verifies the expected build commit.
