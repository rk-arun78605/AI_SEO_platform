# Connect Amplify To indraseo.com

## Prerequisites
- Amplify app is already deployed and healthy.
- You control DNS for indraseo.com in Namecheap.

## 1. Add domain in Amplify
1. Open AWS Amplify -> your app -> Hosting -> Custom domains.
2. Click Add domain.
3. Enter indraseo.com.
4. Select branch mappings:
   - `main` -> `indraseo.com`
   - `main` -> `www.indraseo.com`
5. Save.

Amplify will show DNS records to create in Namecheap.

## 2. Add DNS records in Namecheap
In Namecheap -> Domain List -> Manage -> Advanced DNS, add records exactly as shown by Amplify.

Typical setup:
- CNAME: `www` -> Amplify target host
- CNAME or ALIAS/ANAME for root (`@`) depending on what Amplify provides

If Namecheap does not support ALIAS/ANAME for `@`, use URL redirect from root to `https://www.indraseo.com` and keep `www` as CNAME to Amplify.

## 3. Wait for SSL validation
- Return to Amplify custom domains page.
- Wait for certificate status and domain status to become available.
- This can take from a few minutes up to 30-60 minutes.

## 4. Verify
- Open `https://indraseo.com`
- Open `https://www.indraseo.com`
- Confirm both resolve and HTTPS certificate is valid.

## 5. Keep canonical consistent
Use a single canonical host in metadata (`www` or apex) and redirect the other host to it.
