# DJ Run 2027

A small React site for our 37 km flag relay around Contermanskloof, Durbanville.

## Run it locally

```sh
npm install
npm run dev
```

## Change who runs what

Edit the `RELAY` list at the top of `src/data/legs.js`. Each segment has a
distance and a `runners` array, so any number of people can run a segment
together:

```js
{ id: 2, distanceKm: 10, runners: ['Janet', 'Sam', 'Alex'], ... }
```

Segments run in order, and the km markers, handover flags on the map and the
total distance are all worked out from the distances.

## Change the route

1. Edit the `WAYPOINTS` list in `scripts/build-route.mjs`. Keep each point on
   the road you want, or the router may add a side-street detour.
2. Run `node scripts/build-route.mjs --dry --trace` to see the length and a
   point every km without writing anything.
3. Run `npm run route` to write `src/data/route.json`.
4. Run `npm run elevation` to refresh `src/data/elevation.json` (heights every
   100 m, from the free Open-Meteo elevation API). The climb and descent on
   each handover and the height profile come from this file.

Routing uses the public OpenStreetMap foot router (routing.openstreetmap.de).

## Deploy

Pushing to `main` builds and deploys via `.github/workflows/deploy.yml`.
One-time setup: in the GitHub repo, go to **Settings → Pages → Source** and
choose **GitHub Actions**. The site is served at the custom domain
https://dj.pixelstreamsystems.co.za/ (set under **Settings → Pages → Custom
domain**), so `base` in `vite.config.js` is `/`. If the custom domain is ever
removed, the site moves to `https://<username>.github.io/DJRun/` and `base`
must change back to `/DJRun/`.
