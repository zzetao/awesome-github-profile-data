# awesome-github-profile-data

A tool to automatically capture and maintain data for [Awesome GitHub Profile Readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme) contributors, including screenshots, metadata, and performance metrics.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed, then:

```bash
# Clone the repository
git clone https://github.com/zzetao/awesome-github-profile.git
cd awesome-github-profile

# Install dependencies
yarn install  # or npm install
```

## Usage

### Capture New Profiles

Run the capture script to process newly added profile URLs:

```bash
yarn capture
```

This command:
1. Fetches the latest contributor list from the Awesome GitHub Profile Readme
2. Identifies new profiles not yet in `data.json`
3. Captures screenshots of their GitHub README pages
4. Updates `data.json` with metadata (size, dimensions, GIF detection, and timestamps)

### Update Existing Profiles

Refresh existing profiles older than 15 days:

```bash
yarn update
```

This command:
1. Checks all existing profiles in `data.json`
2. Re-captures screenshots for entries older than 15 days
3. Updates metadata and timestamps

## Automated Workflows

This project includes GitHub Actions for automated maintenance:

| Workflow       | Schedule         | Description                          |
|----------------|------------------|--------------------------------------|
| `capture.yml`  | Every day at 9 AM| Captures new contributor profiles  |
| `update.yml`   | Every 15 days    | Updates stale existing profiles      |

Screenshots are saved to the `screenshots/` directory as `.jpeg` files, with quality optimized via the `sharp` library.

## Data Structure

The `data.json` file contains tiered entries with:
- Profile metadata (username, GitHub URL)
- Screenshot details (file path, width, height)
- Timestamp for update tracking
- GIF detection flag

Example entry:
```json
{
  "categoryName": "Art",
  "list": [
    {
      "githubUrl": "https://github.com/username",
      "nickName": "User",
      "hasGif": true,
      "filePath": "screenshots/username.jpeg",
      "timestamp": 1629384721000,
      "width": 800,
      "height": 500
    }
  ]
}
```

## License

ISC License (ISC)
