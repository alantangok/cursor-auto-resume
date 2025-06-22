# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-06-23

### Added
- Stop button handler: Automatically detects when user clicks the stop button and completely disables auto-resume functionality
- {end} count tracking: Prevents auto-continuation if {end} count increases within the last 5 seconds
- Enhanced command detection: Improved detection of user-input enhanced commands to prevent duplicate execution
- Debug functions: Added test_end_count() and check_end_increase() for testing end count functionality

### Improved
- Better user intent detection: Script now respects user's intention to stop generation more intelligently
- State management: Added comprehensive tracking for end count and timing variables
- Logging: Enhanced console output for better debugging and monitoring

### Technical
- Added addStopButtonHandler() function with event delegation
- Added countEndOccurrences() and hasEndCountIncreasedRecently() functions
- Enhanced state object with endCount, lastEndCountCheckTime, and lastEndCountIncrease tracking
- Integrated end count checking into main never-stop logic

## [1.0.0] - Initial Release
- Basic auto-resume functionality for Cursor AI chat
- Never-stop checker for continuous conversation
- Error handling and retry mechanisms
- Support for various UI selectors and button states 