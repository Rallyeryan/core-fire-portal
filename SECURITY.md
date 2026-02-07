# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Core Fire Portal team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the project maintainers. You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Security Best Practices

When deploying Core Fire Portal, please follow these security best practices:

### Environment Variables

- **Never commit `.env` files** to version control
- Use strong, randomly generated values for all secrets
- Rotate credentials regularly
- Use different credentials for development, staging, and production

### Database Security

- Use strong passwords for database users
- Limit database user permissions to only what's necessary
- Enable SSL/TLS for database connections in production
- Regularly backup your database
- Keep your database software up to date

### Authentication & Authorization

- The application uses OAuth for authentication
- Admin access is controlled via the `OWNER_OPEN_ID` environment variable
- Ensure only trusted users have admin access
- Regularly review user permissions

### API Security

- All API endpoints use tRPC with built-in type safety
- Protected procedures require authentication
- Input validation is performed using Zod schemas
- Rate limiting should be implemented at the infrastructure level

### File Upload Security

- Signatures and PDFs are stored in AWS S3
- Ensure S3 bucket permissions are properly configured
- Use signed URLs for temporary access
- Implement file size limits
- Validate file types before upload

### HTTPS/TLS

- **Always use HTTPS in production**
- Obtain SSL/TLS certificates from a trusted Certificate Authority
- Configure your web server to redirect HTTP to HTTPS
- Enable HSTS (HTTP Strict Transport Security)

### Dependencies

- Regularly update dependencies to patch known vulnerabilities
- Use `pnpm audit` to check for security issues
- Review dependency changes before updating

### Email Security

- Use authenticated SMTP connections
- Implement SPF, DKIM, and DMARC records
- Validate email addresses before sending
- Rate limit email sending to prevent abuse

### Code Security

- Sanitize user input to prevent XSS attacks
- Use parameterized queries to prevent SQL injection
- Implement CSRF protection
- Validate and sanitize all data before rendering

### Monitoring & Logging

- Monitor application logs for suspicious activity
- Set up alerts for unusual patterns
- Log authentication attempts and failures
- Regularly review access logs

## Known Security Considerations

### Database Connection

The application requires a `DATABASE_URL` environment variable. Ensure this connection string:
- Uses a strong password
- Is not exposed in logs or error messages
- Uses SSL/TLS in production
- Has appropriate firewall rules

### S3 Bucket Access

Signature images and PDF files are stored in S3. Ensure:
- Bucket is not publicly accessible
- IAM credentials have minimal required permissions
- Objects use appropriate ACLs
- Versioning is enabled for audit trails

### Session Management

The application uses cookie-based sessions. Ensure:
- Cookies are marked as `HttpOnly` and `Secure` in production
- Session timeout is configured appropriately
- Sessions are invalidated on logout

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security fix versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request or open an issue.

## Attribution

This security policy is adapted from industry best practices and open source security guidelines.
