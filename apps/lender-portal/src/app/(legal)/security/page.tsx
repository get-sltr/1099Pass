import { Metadata } from 'next';
import { Shield, Lock, Eye, Server, Users, FileCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security | 1099Pass',
  description: 'How 1099Pass protects your financial data and ensures platform security',
};

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Encryption',
      description:
        'All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Bank-grade encryption protects your sensitive financial information.',
    },
    {
      icon: Shield,
      title: 'SOC 2 Compliance',
      description:
        'We are pursuing SOC 2 Type II certification, demonstrating our commitment to security, availability, and confidentiality.',
    },
    {
      icon: Eye,
      title: '24/7 Monitoring',
      description:
        'Our security team monitors systems around the clock using advanced threat detection and real-time alerting.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description:
        'Hosted on AWS with multi-region redundancy, automated backups, and disaster recovery capabilities.',
    },
    {
      icon: Users,
      title: 'Access Control',
      description:
        'Role-based access control ensures users only access data they are authorized to view. All access is logged and audited.',
    },
    {
      icon: FileCheck,
      title: 'Regular Audits',
      description:
        'We conduct regular security audits, penetration testing, and vulnerability assessments by third-party firms.',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Security</h1>
        <p className="mb-12 text-xl text-muted-foreground">
          Your data security is our top priority. Learn how we protect your
          financial information.
        </p>

        {/* Security Features Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Data Protection Measures
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">Encryption</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Data at Rest:</strong> AES-256 encryption for all stored
                data using AWS KMS customer-managed keys
              </li>
              <li>
                <strong>Data in Transit:</strong> TLS 1.3 for all API
                communications with perfect forward secrecy
              </li>
              <li>
                <strong>Key Management:</strong> Automatic key rotation with
                hardware security modules (HSMs)
              </li>
              <li>
                <strong>Database Encryption:</strong> Transparent data encryption
                for PostgreSQL with encrypted backups
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              Authentication & Authorization
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Multi-Factor Authentication:</strong> Optional MFA via SMS
                or authenticator apps
              </li>
              <li>
                <strong>Strong Password Requirements:</strong> Minimum 12
                characters with complexity requirements
              </li>
              <li>
                <strong>Session Management:</strong> Short-lived tokens with
                automatic expiration
              </li>
              <li>
                <strong>Role-Based Access:</strong> Granular permissions based on
                user role and organization
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              Network Security
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Web Application Firewall:</strong> AWS WAF with managed
                rule sets for OWASP Top 10
              </li>
              <li>
                <strong>DDoS Protection:</strong> AWS Shield for volumetric attack
                mitigation
              </li>
              <li>
                <strong>Network Isolation:</strong> VPC with private subnets for
                database and internal services
              </li>
              <li>
                <strong>Rate Limiting:</strong> API rate limiting to prevent abuse
                and brute-force attacks
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Compliance & Certifications
            </h2>
            <p>We maintain compliance with industry standards and regulations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>SOC 2 Type II:</strong> In progress - demonstrating
                security, availability, and confidentiality controls
              </li>
              <li>
                <strong>App Store Compliance:</strong> In-app purchases processed
                through Apple App Store and Google Play with their built-in security
              </li>
              <li>
                <strong>CCPA:</strong> California Consumer Privacy Act compliance
                for California residents
              </li>
              <li>
                <strong>GLBA:</strong> Gramm-Leach-Bliley Act compliance for
                financial data protection
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Security Practices
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              Secure Development
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Security code reviews for all changes</li>
              <li>Static application security testing (SAST)</li>
              <li>Dynamic application security testing (DAST)</li>
              <li>Dependency vulnerability scanning</li>
              <li>Secrets management with AWS Secrets Manager</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              Incident Response
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Documented incident response procedures</li>
              <li>24/7 on-call security team</li>
              <li>Regular incident response drills</li>
              <li>Breach notification within 72 hours as required</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">
              Employee Security
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Background checks for all employees</li>
              <li>Security awareness training</li>
              <li>Principle of least privilege access</li>
              <li>Regular access reviews and revocation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Third-Party Security
            </h2>
            <p>We carefully vet all third-party providers:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Plaid:</strong> SOC 2 Type II certified, bank-level
                security for financial data
              </li>
              <li>
                <strong>Apple App Store:</strong> App Store payment processing
                with Apple&apos;s security infrastructure
              </li>
              <li>
                <strong>Google Play:</strong> Play Billing for Android with
                Google&apos;s security standards
              </li>
              <li>
                <strong>AWS:</strong> SOC 1/2/3, ISO 27001, FedRAMP certified
                cloud provider
              </li>
            </ul>
            <p className="mt-4">
              All vendors undergo security assessment before integration and
              ongoing monitoring thereafter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Vulnerability Disclosure
            </h2>
            <p>
              We appreciate security researchers who responsibly disclose
              vulnerabilities. If you discover a security issue:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email security@1099pass.com with details</li>
              <li>Allow us reasonable time to address the issue</li>
              <li>Do not access or modify user data</li>
              <li>Do not publicly disclose until resolved</li>
            </ul>
            <p className="mt-4">
              We commit to acknowledging reports within 48 hours and providing
              regular updates on remediation progress.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Security Team</h2>
            <p>For security questions, concerns, or to report an issue:</p>
            <p className="mt-4">
              <strong>Security Team</strong>
              <br />
              Email: security@1099pass.com
              <br />
              PGP Key: Available upon request
            </p>
            <p className="mt-4">
              For general privacy inquiries, contact privacy@1099pass.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
