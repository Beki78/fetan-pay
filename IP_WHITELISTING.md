# FetanPay API Key IP Whitelisting

## Overview

IP Whitelisting is a security feature that restricts API key usage to specific IP addresses or IP ranges. When enabled for an API key, requests can only be made from pre-approved IP addresses, providing an additional layer of security beyond API key authentication.

## Table of Contents

- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [IP Address Formats](#ip-address-formats)
- [Management Interface](#management-interface)
- [API Usage](#api-usage)
- [Security Benefits](#security-benefits)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Use Cases](#use-cases)

## How It Works

### Request Flow

1. **API Request**: Client makes a request using an API key
2. **IP Detection**: System extracts the client's real IP address
3. **Whitelist Check**: If IP whitelisting is enabled for the API key:
   - Compare client IP against allowed IP list
   - Allow request if IP matches
   - Deny request if IP doesn't match
4. **Standard Processing**: If IP is allowed, proceed with normal API key validation

### IP Address Detection

The system intelligently detects client IP addresses by:

- Checking direct connection IP
- Parsing proxy headers (`X-Forwarded-For`, `X-Real-IP`)
- Handling load balancer configurations
- Supporting both IPv4 and IPv6 addresses

## Getting Started

### Step 1: Enable IP Whitelisting

1. Log in to your [FetanPay Merchant Dashboard](https://admin.fetanpay.et)
2. Navigate to **API Keys** in the sidebar
3. Select an existing API key or create a new one
4. Toggle **"Enable IP Whitelisting"**

### Step 2: Add Allowed IP Addresses

1. Click **"Add IP Address"**
2. Enter your IP address or IP range
3. Add a description (optional)
4. Click **"Save"**

### Step 3: Test Your Configuration

1. Use the **"Test API Key"** button to verify access
2. Check the **"Access Logs"** to see IP validation results
3. Make a test API request from your allowed IP

## Configuration

### Dashboard Configuration

#### Adding IP Addresses

```
┌─────────────────────────────────────┐
│ IP Whitelisting Configuration       │
│                                     │
│ ☑ Enable IP Whitelisting           │
│                                     │
│ Allowed IP Addresses:               │
│ ┌─────────────────────────────────┐ │
│ │ 192.168.1.100                   │ │
│ │ Office Desktop                  │ │
│ │ [Edit] [Remove]                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 10.0.0.0/24                     │ │
│ │ Production Servers              │ │
│ │ [Edit] [Remove]                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add IP Address]                  │
│ [Add My Current IP: 203.0.113.45]  │
└─────────────────────────────────────┘
```

#### Quick Actions

- **Add Current IP**: Automatically detect and add your current IP
- **Bulk Import**: Upload CSV file with IP addresses
- **Template IPs**: Use pre-configured IP ranges for common scenarios

### API Configuration

Create an API key with IP whitelisting via API:

```bash
curl -X POST https://api.fetanpay.et/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "ipWhitelistEnabled": true,
    "allowedIps": ["192.168.1.100", "10.0.0.0/24"]
  }'
```

## IP Address Formats

### Supported Formats

| Format          | Example          | Description              |
| --------------- | ---------------- | ------------------------ |
| **Single IPv4** | `192.168.1.100`  | Exact IP address match   |
| **IPv4 CIDR**   | `192.168.1.0/24` | IP range (256 addresses) |
| **Single IPv6** | `2001:db8::1`    | Exact IPv6 address       |
| **IPv6 CIDR**   | `2001:db8::/32`  | IPv6 range               |

### Common CIDR Ranges

| CIDR  | Addresses  | Use Case                |
| ----- | ---------- | ----------------------- |
| `/32` | 1          | Single IP (IPv4)        |
| `/24` | 256        | Small office network    |
| `/16` | 65,536     | Large corporate network |
| `/8`  | 16,777,216 | Very large networks     |

### Examples

```json
{
  "allowedIps": [
    "203.0.113.45", // Single office IP
    "192.168.1.0/24", // Office network
    "10.0.0.0/8", // Corporate network
    "2001:db8::1", // IPv6 address
    "2001:db8::/32" // IPv6 range
  ]
}
```

## Management Interface

### API Key List View

```
┌─────────────────────────────────────────────────────────────┐
│ API Keys                                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Production Key                    🛡️ IP Protected      │ │
│ │ fetan_live_sk_1234...             2 IPs allowed        │ │
│ │ Last used: 2 hours ago            ✅ Current IP allowed │ │
│ │ [Edit] [View Logs] [Test]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Development Key                   🌐 No IP Restrictions │ │
│ │ fetan_live_sk_5678...             All IPs allowed       │ │
│ │ Last used: 1 day ago              ⚠️ Consider enabling   │ │
│ │ [Edit] [View Logs] [Test]                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Access Logs

```
┌─────────────────────────────────────────────────────────────┐
│ API Key Access Logs                                         │
│                                                             │
│ Time        IP Address      Status    Endpoint             │
│ ─────────────────────────────────────────────────────────── │
│ 10:30 AM    192.168.1.100   ✅ Allow   /payments/verify    │
│ 10:25 AM    203.0.113.45    ❌ Block   /payments/verify    │
│ 10:20 AM    192.168.1.100   ✅ Allow   /payments/history   │
│ 10:15 AM    10.0.0.50       ✅ Allow   /payments/verify    │
│                                                             │
│ [Export Logs] [Filter] [Refresh]                           │
└─────────────────────────────────────────────────────────────┘
```

## API Usage

### Making Requests

When IP whitelisting is enabled, make requests normally:

```bash
curl -X POST https://api.fetanpay.et/api/v1/payments/verify \
  -H "Authorization: Bearer fetan_live_sk_..." \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "CBE",
    "reference": "FT26017MLDG7755415774",
    "claimedAmount": 1000.00
  }'
```

### Success Response

```json
{
  "success": true,
  "data": {
    "status": "VERIFIED",
    "amount": 1000.0,
    "reference": "FT26017MLDG7755415774"
  }
}
```

### IP Blocked Response

```json
{
  "success": false,
  "error": {
    "code": "IP_NOT_WHITELISTED",
    "message": "Your IP address (203.0.113.45) is not authorized to use this API key",
    "details": {
      "clientIp": "203.0.113.45",
      "allowedIps": ["192.168.1.0/24", "10.0.0.100"]
    }
  }
}
```

## Security Benefits

### 1. **Stolen Key Protection**

- **Problem**: API key leaked in code repository
- **Solution**: Key unusable from unauthorized locations
- **Result**: Breach impact significantly reduced

### 2. **Insider Threat Mitigation**

- **Problem**: Employee leaves with API key knowledge
- **Solution**: Key stops working outside office network
- **Result**: Automatic access revocation

### 3. **Automated Attack Prevention**

- **Problem**: Brute force attacks from global IPs
- **Solution**: Attacks blocked at network level
- **Result**: Reduced server load and attack surface

### 4. **Compliance Support**

- **Problem**: Regulatory requirements for access control
- **Solution**: Network-level restrictions documented
- **Result**: Easier compliance audits

## Best Practices

### 1. **Use CIDR Ranges for Networks**

```json
// ✅ Good - Use network ranges
"allowedIps": ["192.168.1.0/24", "10.0.0.0/16"]

// ❌ Avoid - Individual IPs for large networks
"allowedIps": ["192.168.1.1", "192.168.1.2", "192.168.1.3", ...]
```

### 2. **Separate Keys for Different Environments**

- **Production**: Strict IP restrictions to production servers
- **Staging**: Restricted to staging environment IPs
- **Development**: Either no restrictions or office IP range

### 3. **Regular IP Audit**

- Review allowed IPs monthly
- Remove unused or outdated IP addresses
- Update ranges when network changes occur

### 4. **Monitor Access Logs**

- Check for blocked access attempts
- Investigate unusual IP access patterns
- Set up alerts for repeated blocked attempts

### 5. **Document IP Assignments**

```json
{
  "allowedIps": [
    {
      "ip": "192.168.1.100",
      "description": "Production Server 1",
      "addedBy": "admin@company.com",
      "addedDate": "2025-01-15"
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. **"IP Not Whitelisted" Error**

**Problem**: Getting blocked despite being on allowed list

**Solutions**:

- Check your current IP: Visit [whatismyipaddress.com](https://whatismyipaddress.com)
- Verify IP format in dashboard
- Check if using VPN or proxy
- Contact your network administrator

#### 2. **Dynamic IP Changes**

**Problem**: IP address changes frequently

**Solutions**:

- Use CIDR ranges instead of specific IPs
- Set up automatic IP updates via API
- Consider using a static IP from your ISP
- Use VPN with static IP

#### 3. **Corporate Network Issues**

**Problem**: Requests blocked from office network

**Solutions**:

- Add entire office IP range (e.g., `203.0.113.0/24`)
- Check with IT for external IP addresses
- Consider NAT/firewall configurations
- Test from different network locations

#### 4. **IPv6 Compatibility**

**Problem**: IPv6 addresses not working

**Solutions**:

- Ensure IPv6 format is correct
- Use IPv6 CIDR notation for ranges
- Check if your network supports IPv6
- Add both IPv4 and IPv6 addresses

### Debugging Steps

1. **Check Current IP**

   ```bash
   curl https://api.ipify.org
   ```

2. **Test API Key**

   ```bash
   curl -I https://api.fetanpay.et/api/v1/payments/verify \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. **Review Access Logs**
   - Check dashboard access logs
   - Look for your IP in blocked attempts
   - Verify timestamp matches your request

4. **Validate IP Format**
   - Use online CIDR calculators
   - Verify IPv6 format with validators
   - Test with IP range tools

## Use Cases

### 1. **E-commerce Platform**

```
Scenario: Online store with dedicated servers
Configuration:
- Production API Key: Server farm IPs only
- Staging API Key: Staging server IPs only
- Development API Key: Office network range

Benefits:
- Production key can't be misused from development
- Staging isolated from production
- Office access for development and testing
```

### 2. **Financial Institution**

```
Scenario: Bank with strict security requirements
Configuration:
- Single production server IP
- Backup server IP for failover
- No development access from production key

Benefits:
- Maximum security for sensitive operations
- Compliance with financial regulations
- Clear audit trail for access
```

### 3. **Multi-location Business**

```
Scenario: Retail chain with multiple offices
Configuration:
- Head office: 203.0.113.0/24
- Branch 1: 198.51.100.0/24
- Branch 2: 192.0.2.0/24

Benefits:
- Each location can access API
- Centralized key management
- Location-based access control
```

### 4. **Development Team**

```
Scenario: Remote development team
Configuration:
- Office network: 10.0.0.0/16
- VPN range: 172.16.0.0/12
- Home offices: Individual IPs

Benefits:
- Secure remote access
- VPN-based access control
- Flexible for remote work
```

## API Reference

### Get API Key IP Configuration

```bash
GET /api/v1/api-keys/:id/ip-whitelist
```

### Update IP Whitelist

```bash
PUT /api/v1/api-keys/:id/ip-whitelist
Content-Type: application/json

{
  "enabled": true,
  "allowedIps": ["192.168.1.0/24", "10.0.0.100"]
}
```

### Get Access Logs

```bash
GET /api/v1/api-keys/:id/access-logs?limit=100&blocked=true
```

## Support

### Getting Help

- **Documentation**: [https://docs.fetanpay.et/api/ip-whitelisting](https://docs.fetanpay.et/api/ip-whitelisting)
- **Dashboard**: [https://admin.fetanpay.et/api-keys](https://admin.fetanpay.et/api-keys)
- **Support**: [support@fetanpay.et](mailto:support@fetanpay.et)

### Common Support Requests

1. **IP Range Calculation**: Help with CIDR notation
2. **Network Configuration**: Assistance with corporate networks
3. **Bulk IP Management**: Help with large IP lists
4. **Compliance Questions**: Regulatory requirement guidance

---

**Note**: IP Whitelisting is an additional security feature. Your API keys remain secure even without IP restrictions through our existing security measures including key hashing, rate limiting, and signature verification.
