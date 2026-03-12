# CHANGELOG — _[APPLICATION NAME]_

## Per RAISE 2.0 — APPO-16

All notable changes to this application must be documented here. This file is reviewed by the RPOC ISSM during quarterly reviews and for each release.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- _[New features not yet released]_

### Changed
- _[Changes to existing features]_

### Fixed
- _[Bug fixes]_

### Security
- _[Security-related changes — vulnerability patches, dependency updates]_

---

## [v1.0.0] — YYYY-MM-DD

### Added
- Initial release
- _[List key features]_

### Security
- Base image: _[e.g., cgr.dev/chainguard/nginx:1.27]_
- All dependencies scanned (0 CRITICAL, 0 HIGH)
- SAST scan: 0 findings
- DAST scan: 0 HIGH findings
- SBOM: SPDX JSON attached to image

### Pipeline Results
- GATE 1 (SAST): Passed
- GATE 2 (SBOM): Generated
- GATE 3 (Secrets): Passed
- GATE 4 (Container Scan): Passed
- GATE 5 (DAST): Passed
- GATE 6 (ISSM Review): Approved by _[NAME]_ on _[DATE]_
- GATE 7 (Signing): Signed
- GATE 8 (Storage): harbor.sre.internal/_[team]_/_[app]_:v1.0.0

---

## Template for New Releases

```markdown
## [vX.Y.Z] — YYYY-MM-DD

### Added
-

### Changed
-

### Fixed
-

### Security
- Base image: [IMAGE:TAG]
- Dependencies updated: [LIST]
- CVEs remediated: [LIST]

### Pipeline Results
- GATE 1 (SAST): Passed / [N findings — see mitigation statements]
- GATE 2 (SBOM): Generated
- GATE 3 (Secrets): Passed
- GATE 4 (Container Scan): Passed / [N findings — see mitigation statements]
- GATE 5 (DAST): Passed / [N findings — see mitigation statements]
- GATE 6 (ISSM Review): Approved by [NAME] on [DATE]
- GATE 7 (Signing): Signed
- GATE 8 (Storage): harbor.sre.internal/[team]/[app]:vX.Y.Z
```
