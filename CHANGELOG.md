# Changelog

## [2.0.0](https://github.com/marcioaltoe/barrel-craft/compare/v1.0.1...v2.0.0) (2025-08-20)


### ⚠ BREAKING CHANGES

* **cli:** Complete BarrelGenerator API rewrite with new configuration system. Previous direct usage of BarrelGenerator requires migration to the new JSON-based configuration approach.
* Renamed core module and restructured API 🤖 Generated with [Claude Code](https://claude.ai/code)

### Features

* **ci:** add GitHub Actions workflows for automated npm publishing ([f186379](https://github.com/marcioaltoe/barrel-craft/commit/f186379f3bb76c212c30cf2361da8e4c7d55897b))
* **cli:** introduce barrel-buddy CLI ([f4292d5](https://github.com/marcioaltoe/barrel-craft/commit/f4292d52978c694f258d981c39e47cd20c808cd2))
* **cli:** introduce configurable barrel generation system ([41b2713](https://github.com/marcioaltoe/barrel-craft/commit/41b2713f0fd489c21422ee8d74b829e922dda833))
* major refactor and architecture improvements ([5507695](https://github.com/marcioaltoe/barrel-craft/commit/55076959aad19740b1d28fb6d04fc4603f3b1089))


### Bug Fixes

* **barrel-generator:** correct directory matching logic ([b4960c8](https://github.com/marcioaltoe/barrel-craft/commit/b4960c83973f374401fb414c155f8a201c655b1a))
* **build:** migrate from CommonJS to ESM modules ([19f0930](https://github.com/marcioaltoe/barrel-craft/commit/19f0930b58351c97c0a743af36a665d2c2d39ea8))
* **build:** migrate from CommonJS to ESM modules ([#1](https://github.com/marcioaltoe/barrel-craft/issues/1)) ([4379fa5](https://github.com/marcioaltoe/barrel-craft/commit/4379fa5f91b44f552b067d70fab2c0b08e5ebfce))
* **ci:** add workflow_dispatch trigger and edited event ([a0147e7](https://github.com/marcioaltoe/barrel-craft/commit/a0147e79aa491b1aa4f82fcf80c5b69cda7b8c6b))
* **ci:** allow CI to run on all pull requests ([d47e096](https://github.com/marcioaltoe/barrel-craft/commit/d47e096e7c8ec23bfa4a7e0fde5113cbd88db73a))
* **ci:** fix Release Please configuration ([360101b](https://github.com/marcioaltoe/barrel-craft/commit/360101bc5cefd712e7253e03bc689507870cb3b6))
* **ci:** simplify pull_request trigger to run on all PRs ([0f8a93c](https://github.com/marcioaltoe/barrel-craft/commit/0f8a93cb5df1c4ca8e2d05e7fa5ddacd324de1a4))
* **cli:** read version from package.json dynamically ([3826577](https://github.com/marcioaltoe/barrel-craft/commit/3826577332b1c33e0e67a9627bcd704c0d942ad0))
* **core:** resolve duplicate processing and improve directory handling ([15e5eba](https://github.com/marcioaltoe/barrel-craft/commit/15e5eba7dc30066bc9f9080603766d89e0170baf))

## [1.0.1](https://github.com/marcioaltoe/barrel-craft/compare/v1.0.0...v1.0.1) (2025-08-20)


### Bug Fixes

* **cli:** read version from package.json dynamically ([3826577](https://github.com/marcioaltoe/barrel-craft/commit/3826577332b1c33e0e67a9627bcd704c0d942ad0))

## 1.0.0 (2025-08-20)


### ⚠ BREAKING CHANGES

* **cli:** Complete BarrelGenerator API rewrite with new configuration system. Previous direct usage of BarrelGenerator requires migration to the new JSON-based configuration approach.
* Renamed core module and restructured API 🤖 Generated with [Claude Code](https://claude.ai/code)

### Features

* **ci:** add GitHub Actions workflows for automated npm publishing ([f186379](https://github.com/marcioaltoe/barrel-craft/commit/f186379f3bb76c212c30cf2361da8e4c7d55897b))
* **cli:** introduce barrel-buddy CLI ([f4292d5](https://github.com/marcioaltoe/barrel-craft/commit/f4292d52978c694f258d981c39e47cd20c808cd2))
* **cli:** introduce configurable barrel generation system ([41b2713](https://github.com/marcioaltoe/barrel-craft/commit/41b2713f0fd489c21422ee8d74b829e922dda833))
* major refactor and architecture improvements ([5507695](https://github.com/marcioaltoe/barrel-craft/commit/55076959aad19740b1d28fb6d04fc4603f3b1089))


### Bug Fixes

* **barrel-generator:** correct directory matching logic ([b4960c8](https://github.com/marcioaltoe/barrel-craft/commit/b4960c83973f374401fb414c155f8a201c655b1a))
* **build:** migrate from CommonJS to ESM modules ([19f0930](https://github.com/marcioaltoe/barrel-craft/commit/19f0930b58351c97c0a743af36a665d2c2d39ea8))
* **build:** migrate from CommonJS to ESM modules ([#1](https://github.com/marcioaltoe/barrel-craft/issues/1)) ([4379fa5](https://github.com/marcioaltoe/barrel-craft/commit/4379fa5f91b44f552b067d70fab2c0b08e5ebfce))
* **ci:** add workflow_dispatch trigger and edited event ([a0147e7](https://github.com/marcioaltoe/barrel-craft/commit/a0147e79aa491b1aa4f82fcf80c5b69cda7b8c6b))
* **ci:** allow CI to run on all pull requests ([d47e096](https://github.com/marcioaltoe/barrel-craft/commit/d47e096e7c8ec23bfa4a7e0fde5113cbd88db73a))
* **ci:** fix Release Please configuration ([360101b](https://github.com/marcioaltoe/barrel-craft/commit/360101bc5cefd712e7253e03bc689507870cb3b6))
* **ci:** simplify pull_request trigger to run on all PRs ([0f8a93c](https://github.com/marcioaltoe/barrel-craft/commit/0f8a93cb5df1c4ca8e2d05e7fa5ddacd324de1a4))
* **core:** resolve duplicate processing and improve directory handling ([15e5eba](https://github.com/marcioaltoe/barrel-craft/commit/15e5eba7dc30066bc9f9080603766d89e0170baf))
