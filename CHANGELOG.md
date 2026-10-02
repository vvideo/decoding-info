# v1.0.4
- Require a video configuration for resolution searches; audio-only calls now return an error without probing.
- Simplified the test and npm release workflows by removing unused verification scripts.
- Added development and release instructions and removed an unused binary-search helper.

# v1.0.3
- Fixed invalid search sizes and made decoding-info probe errors consistent.
- Corrected package entry points and type declarations, and added a package smoke test.
- Updated README examples and demo pages.
- Updated GitHub Actions and made tests run before deployment and npm publication.

# v1.0.2
- Fixed resolution searches with a custom start size, reduced duplicate decoding-info requests, and stopped quality-range searches when the start size does not qualify.
- Updated development dependencies.

# v1.0.1
Fixed dist files.

# v1.0.0
First release.
