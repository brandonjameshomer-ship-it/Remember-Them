# Bringing photographs in from Google Drive

The reference photographs shown under each designer come from a Google Drive
folder — **Memorial Options** —
<https://drive.google.com/drive/folders/1P4JZ8GzZFylcqwEfBX4H18bM5Y5vuJYF>.

Each subfolder in there becomes the examples strip for one memorial type.

---

## The shape of it

```
Drive: Memorial Options/
  <a subfolder>/  ──▶  tools/drive-folders.json  ──▶  a memorial type
    photo.jpg     ──▶  assets/img/<type-id>/photo.jpg
                       assets/data/examples.js
```

Three files matter:

| File | What it holds | Written by |
|---|---|---|
| `tools/drive-folders.json` | which Drive folder feeds which memorial type | you, by hand |
| `tools/drive-listing.json` | a snapshot of the folders and the files in them | the export step |
| `assets/data/examples.js` | what the site actually reads | `tools/import-drive.js` |

---

## Step 1 — say which folder is which

Open `tools/drive-folders.json` and fill in the `folder` name (and ideally the
`id`) for each memorial type:

```json
{ "categoryId": "upright", "folder": "Uprights", "id": "1abc..." }
```

The folder id is the last part of the folder's URL in Drive.

A Drive folder with no entry here is **reported and skipped**, never guessed at.
If the folders do not divide the same way the eight memorial types do, that is
fine — add a new type in `assets/data/catalog.js` first (see
[CATALOG.md](CATALOG.md)), then point a folder at it.

Two folders may point at the same type. The import merges them.

## Step 2 — export the listing

Write `tools/drive-listing.json` describing what is in each folder:

```json
{
  "folders": [
    {
      "name": "Uprights",
      "id": "1abc...",
      "files": [
        { "name": "gillis-proof.jpg", "id": "1xyz...", "mimeType": "image/jpeg" }
      ]
    }
  ]
}
```

Anything that is not an image is ignored, so a folder containing order forms
and PDFs alongside the photographs imports cleanly.

## Step 3 — download the images

Put each image at the path the listing implies:

```
assets/img/<category-id>/<slugified-file-name>.jpg
```

The slug rule is: drop the extension, lowercase, replace every run of
non-alphanumeric characters with a single hyphen, trim hyphens, cap at 60
characters. Two files in one folder that slug to the same name get `-2`, `-3`
appended in listing order — nothing is silently dropped.

Run the import first (step 4) and it will tell you every path it expects.

**Sizing.** Save at roughly 1200px on the long edge and re-encode as JPEG at
about 80% quality. The strip renders square thumbnails and the lightbox caps at
74% of viewport height, so anything larger is bytes a grieving family waits on
for no benefit.

## Step 4 — import

```sh
node tools/import-drive.js tools/drive-listing.json
```

It rewrites `assets/data/examples.js` and prints what it did:

```
Wrote assets/data/examples.js
  42 images across 6 memorial types
  no images yet for: sculpture, estate

  These Drive folders matched no memorial type and were skipped:
    - Granite Colors
  Add them to the "map" in tools/drive-folders.json.
```

It only ever writes `assets/data/examples.js`. Your designer configuration in
`catalog.js` is never touched by an import.

## Step 5 — write the alt text

Every imported example lands with:

```js
alt: 'TODO: describe this memorial without naming anyone.'
```

Replace each one. Two rules:

1. **Describe the memorial, not the person.** "Serpentine-top upright in dark
   granite with a carved rose and a pair of vases" — not "the Gillis family
   monument".
2. **Never carry a real family's name into alt text, a caption or a file
   name.** These photographs are of other people's memorials. A name that
   reaches the public site is a real harm to a real family, and the site has no
   need of it.

While you are there, fill in what you know — `granite`, `size`,
`configuration`, `features`. Anything left `null` is simply not shown.

## Re-importing later

The import **overwrites** `examples.js`, including alt text you wrote by hand.
Before re-running, copy the file aside, then paste your descriptions back onto
the matching `driveId` values — that field survives a re-import and is the
reliable way to line the old file up against the new one.

---

## A note on what these photographs are

They are examples of finished work. They are not products, they are not
inventory, and nothing about them should imply a price or a stock level. The
examples strip deliberately has no filters by price, no "from $", and no
call to action beyond looking.
