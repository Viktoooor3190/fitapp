# Subdomain Handling in FitApp

## Overview

FitApp uses subdomains to route users to specific coach portals. For example, `coach1.localhost:3000` should load the portal for the coach with the subdomain "coach1".

## Implementation Details

The application uses a multi-layered approach to handle subdomains:

1. **Primary Subdomain Detection**: 
   - Located in `src/utils/subdomain.ts`
   - Extracts the subdomain from the hostname
   - Handles special cases for localhost development

2. **Subdomain Context**:
   - Located in `src/contexts/SubdomainContext.tsx`
   - Provides subdomain information to the entire application
   - Fetches coach data based on the detected subdomain

3. **Coach Subdomain Handler**:
   - Located in `src/components/Coach1Handler.tsx` and `src/hooks/useCoach1Subdomain.tsx`
   - Special handling for any `coach*.localhost` subdomain to ensure it works even if the main subdomain detection fails
   - Acts as a fallback mechanism for local development
   - Automatically detects any subdomain starting with "coach" (e.g., coach1, coach2, coach-john)

## Local Development

When developing locally, you can test coach subdomains by using:
- `coach1.localhost:3000` - This will load the coach1 portal
- `coach2.localhost:3000` - This will load the coach2 portal
- `coach-john.localhost:3000` - This will load the coach-john portal
- `localhost:3000` - This will load the main application

### Setting Up New Coach Subdomains

To set up a new coach subdomain for local development:

1. **Update your hosts file**:
   - Add an entry for your new coach subdomain pointing to `127.0.0.1`
   - On Windows: `C:\Windows\System32\drivers\etc\hosts`
   - On Mac/Linux: `/etc/hosts`
   
   Example hosts file entry:
   ```
   127.0.0.1 localhost
   127.0.0.1 coach1.localhost
   127.0.0.1 coach2.localhost
   127.0.0.1 coach-john.localhost
   ```

2. **Access the subdomain**:
   - Simply navigate to `http://your-coach-subdomain.localhost:3000` in your browser
   - The application will automatically detect the subdomain and load the appropriate coach portal

3. **For production**:
   - Set up DNS records for your subdomains pointing to your server
   - Configure your web server (Nginx, Apache, etc.) to handle the subdomains

### Troubleshooting

If subdomain detection is not working:

1. **Check your hosts file**:
   - Ensure you have entries for your coach subdomains pointing to `127.0.0.1`

2. **Clear browser cache**:
   - Sometimes browsers cache DNS resolutions
   - Try clearing your browser cache or using incognito mode

3. **Check the SubdomainDebug panel**:
   - In development mode, a debug panel appears in the bottom right
   - It shows the current subdomain detection status and any errors

## Known Issues

- The main subdomain detection may fail in some edge cases, but the CoachSubdomainHandler provides a reliable fallback for `coach*.localhost`
- When using the CoachSubdomainHandler fallback, the main SubdomainContext will still show "Subdomain: none"

## Future Improvements

- Implement a more robust subdomain detection mechanism
- Add support for custom domains in addition to subdomains
- Improve error handling for invalid or non-existent coach subdomains 