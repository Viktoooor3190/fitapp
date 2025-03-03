# Setting Up DNS for Dynamic Subdomains in Production

This guide explains how to configure DNS for dynamic subdomains in a production environment. This is necessary to ensure that all coach subdomains (e.g., `coach-john.yourdomain.com`) point to your application server.

## Option 1: Wildcard DNS Record (Recommended)

The simplest approach is to use a wildcard DNS record, which will direct all subdomains to your server.

### Steps:

1. **Log in to your domain registrar** or DNS provider's control panel (e.g., Cloudflare, AWS Route 53, GoDaddy, etc.)

2. **Create a wildcard A record**:
   - Type: A
   - Name: `*` (the asterisk is the wildcard)
   - Value: Your server's IP address
   - TTL: 3600 (or as recommended by your provider)

   Example:
   ```
   *.yourdomain.com.  3600  IN  A  123.456.789.10
   ```

3. **Create a wildcard CNAME record** (if you're using a load balancer or CDN):
   - Type: CNAME
   - Name: `*`
   - Value: Your load balancer or CDN endpoint
   - TTL: 3600

   Example:
   ```
   *.yourdomain.com.  3600  IN  CNAME  your-load-balancer.amazonaws.com.
   ```

4. **Wait for DNS propagation** (can take up to 48 hours, but usually much faster)

## Option 2: Individual DNS Records

If you prefer to have more control and explicitly create DNS records for each subdomain:

### Steps:

1. **Modify your application** to automatically create DNS records when a new coach registers
   - This requires using a DNS provider with an API (like AWS Route 53, Cloudflare, etc.)
   - Add code to your registration process that creates the DNS record via the provider's API

2. **Example using AWS Route 53**:
   ```typescript
   import { Route53 } from 'aws-sdk';

   const route53 = new Route53({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
     region: process.env.AWS_REGION
   });

   async function createSubdomainDNS(subdomain: string) {
     const params = {
       ChangeBatch: {
         Changes: [
           {
             Action: 'CREATE',
             ResourceRecordSet: {
               Name: `${subdomain}.yourdomain.com`,
               ResourceRecords: [
                 {
                   Value: 'YOUR_SERVER_IP'
                 }
               ],
               TTL: 300,
               Type: 'A'
             }
           }
         ],
         Comment: `Create DNS record for ${subdomain}`
       },
       HostedZoneId: 'YOUR_HOSTED_ZONE_ID'
     };

     return route53.changeResourceRecordSets(params).promise();
   }
   ```

3. **Call this function during user registration**:
   ```typescript
   // In your user registration service
   async function registerUser(email, password, displayName) {
     // ... existing registration code ...
     
     // Create the DNS record
     await createSubdomainDNS(userData.subdomain);
     
     // ... rest of registration code ...
   }
   ```

## Option 3: Using a Reverse Proxy

If you're using a reverse proxy like Nginx or Apache:

### Steps:

1. **Configure your web server** to handle all subdomains with a wildcard configuration

2. **Example Nginx configuration**:
   ```nginx
   server {
     listen 80;
     server_name *.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

3. **Restart your web server** to apply the changes:
   ```
   sudo systemctl restart nginx
   ```

## Testing Your Configuration

After setting up your DNS:

1. **Use `dig` or `nslookup` to verify DNS resolution**:
   ```
   dig coach-john.yourdomain.com
   ```

2. **Test in a browser** by visiting various subdomains

3. **Monitor your application logs** for any subdomain-related errors

## Security Considerations

1. **Implement proper validation** of subdomain names to prevent abuse
   - Restrict characters to alphanumeric and hyphens
   - Set a reasonable length limit
   - Check for reserved words or profanity

2. **Use HTTPS** for all subdomains
   - Get a wildcard SSL certificate (e.g., `*.yourdomain.com`)
   - Or use Let's Encrypt with DNS validation for automatic certificate issuance

3. **Set up proper Firestore security rules** to ensure users can only access their own data

## Troubleshooting

- **DNS not resolving**: Check your DNS configuration and ensure propagation has completed
- **SSL certificate errors**: Ensure your certificate covers all subdomains
- **Application not detecting subdomain**: Verify your application's subdomain detection logic
- **Subdomain conflicts**: Implement a system to handle name collisions and reserved subdomains 