# Security & Privacy

This document outlines the security architecture, privacy considerations, and compliance requirements for DocxForms AI.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Data Protection](#data-protection)
3. [Privacy & Compliance](#privacy--compliance)
4. [AI Safety & Governance](#ai-safety--governance)
5. [Incident Response](#incident-response)
6. [Security Best Practices](#security-best-practices)

---

## Security Architecture

### Defense in Depth

DocxForms AI implements multiple layers of security controls to protect user data and system integrity.

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                               │
│ - Cloudflare DDoS protection                           │
│ - WAF (Web Application Firewall)                       │
│ - TLS 1.3 encryption                                   │
│ - Rate limiting                                        │
└─────────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Application Security                          │
│ - Input validation and sanitization                    │
│ - CSRF protection                                      │
│ - XSS prevention                                       │
│ - SQL injection prevention (Prisma ORM)                │
│ - Secure session management                            │
└─────────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Authentication & Authorization                │
│ - Multi-factor authentication (MFA)                    │
│ - Role-based access control (RBAC)                     │
│ - JWT with secure signing                              │
│ - Session expiration and rotation                      │
└─────────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Data Security                                 │
│ - Encryption at rest (AES-256)                         │
│ - Encryption in transit (TLS 1.3)                      │
│ - Database access controls                             │
│ - Secure key management                                │
└─────────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Monitoring & Auditing                         │
│ - Security event logging                               │
│ - Intrusion detection                                  │
│ - Audit trails                                         │
│ - Automated alerts                                     │
└─────────────────────────────────────────────────────────┘
```

### Authentication & Authorization

#### Authentication Methods

```typescript
/**
 * Multi-layered authentication system
 */

// 1. Email/Password with bcrypt hashing
const hashedPassword = await bcrypt.hash(password, 12);

// 2. OAuth providers (Google, Microsoft, GitHub)
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  }),
  // ... other providers
];

// 3. Multi-factor authentication (TOTP)
interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

async function verifyMFA(userId: string, token: string): Promise<boolean> {
  const user = await getUserWithMFASecret(userId);
  return authenticator.verify({
    token,
    secret: user.mfaSecret
  });
}

// 4. Session management
const sessionConfig = {
  maxAge: 7 * 24 * 60 * 60, // 7 days
  rolling: true, // Extend on activity
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  httpOnly: true
};
```

#### Role-Based Access Control

```typescript
/**
 * Granular permission system
 */

enum Permission {
  // Document permissions
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',

  // Form permissions
  FORM_CREATE = 'form:create',
  FORM_READ = 'form:read',
  FORM_UPDATE = 'form:update',
  FORM_DELETE = 'form:delete',
  FORM_PUBLISH = 'form:publish',

  // AI permissions
  AI_FIELD_EXTRACTION = 'ai:field_extraction',
  AI_DOCUMENT_ANALYSIS = 'ai:document_analysis',
  AI_SUGGESTIONS = 'ai:suggestions',

  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_ORGANIZATION = 'admin:organization',
  ADMIN_BILLING = 'admin:billing',
  ADMIN_SETTINGS = 'admin:settings'
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    permissions: Object.values(Permission) // All permissions
  },
  {
    id: 'member',
    name: 'Member',
    permissions: [
      Permission.DOCUMENT_CREATE,
      Permission.DOCUMENT_READ,
      Permission.DOCUMENT_UPDATE,
      Permission.FORM_CREATE,
      Permission.FORM_READ,
      Permission.FORM_UPDATE,
      Permission.FORM_PUBLISH,
      Permission.AI_FIELD_EXTRACTION,
      Permission.AI_SUGGESTIONS
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    permissions: [
      Permission.DOCUMENT_READ,
      Permission.FORM_READ
    ]
  }
];

// Permission checking middleware
async function requirePermission(permission: Permission) {
  return async (req, res, next) => {
    const user = await getSessionUser(req);
    const hasPermission = await userHasPermission(user.id, permission);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Usage in API routes
app.post('/api/documents',
  requirePermission(Permission.DOCUMENT_CREATE),
  handleDocumentCreate
);
```

#### Resource-Level Access Control

```typescript
/**
 * Ensure users can only access their own resources
 */

async function canAccessDocument(
  userId: string,
  documentId: string
): Promise<boolean> {
  const document = await db.document.findUnique({
    where: { id: documentId },
    include: {
      user: true,
      organization: {
        include: { users: true }
      }
    }
  });

  if (!document) return false;

  // Check if user owns the document
  if (document.userId === userId) return true;

  // Check if user is in the same organization
  if (document.organization?.users.some(u => u.id === userId)) {
    return true;
  }

  return false;
}

// Apply to all resource access
app.get('/api/documents/:id', async (req, res) => {
  const { id } = req.params;
  const user = await getSessionUser(req);

  if (!await canAccessDocument(user.id, id)) {
    return res.status(404).json({ error: 'Not found' });
  }

  // ... return document
});
```

---

## Data Protection

### Encryption

#### Encryption at Rest

```typescript
/**
 * All sensitive data is encrypted at rest
 */

// 1. Database encryption
// - PostgreSQL with transparent data encryption (TDE)
// - Encrypted backups
// - Encrypted snapshots

// 2. File storage encryption
// - S3 server-side encryption (SSE-KMS)
// - Customer-managed keys
const s3Config = {
  ServerSideEncryption: 'aws:kms',
  SSEKMSKeyId: process.env.KMS_KEY_ID
};

// 3. Application-level encryption for PII
import { createCipheriv, createDecipheriv } from 'crypto';

class FieldEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(masterKey: string) {
    this.key = Buffer.from(masterKey, 'hex');
  }

  encrypt(plaintext: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encrypted: EncryptedData): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encrypted.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

    let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}

// Fields requiring encryption
const ENCRYPTED_FIELDS = [
  'ssn',
  'taxId',
  'bankAccount',
  'creditCard'
];
```

#### Encryption in Transit

```typescript
/**
 * All network communication is encrypted
 */

// 1. TLS 1.3 configuration
const tlsConfig = {
  minVersion: 'TLSv1.3',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256'
  ].join(':')
};

// 2. HSTS headers
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// 3. Secure WebSocket connections
const wss = new WebSocketServer({
  server: httpsServer,
  verifyClient: async (info, callback) => {
    const token = info.req.headers['sec-websocket-protocol'];
    const isValid = await verifyToken(token);
    callback(isValid);
  }
});
```

### Data Retention & Deletion

```typescript
/**
 * Configurable data retention policies
 */

interface RetentionPolicy {
  documentRetention: number; // days
  submissionRetention: number;
  aiAnalysisRetention: number;
  auditLogRetention: number;
  softDeleteGracePeriod: number;
}

const defaultRetentionPolicy: RetentionPolicy = {
  documentRetention: 365 * 2, // 2 years
  submissionRetention: 365 * 7, // 7 years (common legal requirement)
  aiAnalysisRetention: 365, // 1 year
  auditLogRetention: 365 * 7, // 7 years
  softDeleteGracePeriod: 30 // 30 days to recover
};

class DataRetentionService {
  async applyRetentionPolicies() {
    // Soft delete expired documents
    await this.softDeleteExpiredDocuments();

    // Permanently delete after grace period
    await this.hardDeleteSoftDeletedData();

    // Clean up orphaned files
    await this.cleanupOrphanedFiles();
  }

  private async softDeleteExpiredDocuments() {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - policy.documentRetention);

    await db.document.updateMany({
      where: {
        createdAt: { lt: expiryDate },
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });
  }

  private async hardDeleteSoftDeletedData() {
    const hardDeleteDate = new Date();
    hardDeleteDate.setDate(
      hardDeleteDate.getDate() - policy.softDeleteGracePeriod
    );

    // Delete from database
    const deleted = await db.document.deleteMany({
      where: {
        deletedAt: { lt: hardDeleteDate }
      }
    });

    // Delete from S3
    for (const doc of deleted) {
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: doc.fileKey
      });
    }
  }
}

// User-initiated data deletion (GDPR Right to Erasure)
async function deleteAllUserData(userId: string) {
  // 1. Delete documents and files
  const documents = await db.document.findMany({
    where: { userId }
  });

  for (const doc of documents) {
    await s3.deleteObject({ Key: doc.fileKey });
  }

  // 2. Delete database records
  await db.submission.deleteMany({ where: { userId } });
  await db.aiAnalysis.deleteMany({
    where: { document: { userId } }
  });
  await db.document.deleteMany({ where: { userId } });

  // 3. Anonymize audit logs (keep for compliance)
  await db.auditLog.updateMany({
    where: { userId },
    data: { userId: 'DELETED_USER' }
  });

  // 4. Delete user account
  await db.user.delete({ where: { id: userId } });
}
```

### Secrets Management

```typescript
/**
 * Secure handling of API keys and secrets
 */

// 1. Environment-based configuration
// Never commit secrets to git
// Use .env files locally, secret manager in production

// 2. AWS Secrets Manager integration
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

class SecretManager {
  private client: SecretsManager;
  private cache: Map<string, { value: string; expiry: number }>;

  async getSecret(secretName: string): Promise<string> {
    // Check cache first (TTL: 5 minutes)
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    // Fetch from Secrets Manager
    const response = await this.client.getSecretValue({
      SecretId: secretName
    });

    const secret = response.SecretString;

    // Cache with expiry
    this.cache.set(secretName, {
      value: secret,
      expiry: Date.now() + 5 * 60 * 1000
    });

    return secret;
  }
}

// 3. API key rotation
async function rotateApiKey(organizationId: string) {
  const newKey = generateSecureApiKey();
  const hashedKey = await bcrypt.hash(newKey, 12);

  await db.apiKey.update({
    where: { organizationId },
    data: {
      keyHash: hashedKey,
      rotatedAt: new Date()
    }
  });

  // Notify admin of rotation
  await sendApiKeyRotationNotification(organizationId, newKey);

  return newKey;
}

function generateSecureApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('base64url')}`;
}
```

---

## Privacy & Compliance

### GDPR Compliance

#### Data Subject Rights

```typescript
/**
 * GDPR Article 15-22 implementation
 */

class GDPRService {
  // Right to Access (Article 15)
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        documents: true,
        submissions: true,
        aiAnalyses: true
      }
    });

    return {
      personalInfo: {
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      documents: user.documents,
      submissions: user.submissions,
      aiAnalyses: user.aiAnalyses
    };
  }

  // Right to Rectification (Article 16)
  async updateUserData(userId: string, updates: Partial<User>) {
    await db.user.update({
      where: { id: userId },
      data: updates
    });

    await this.logGDPRAction(userId, 'rectification', updates);
  }

  // Right to Erasure (Article 17)
  async eraseUserData(userId: string) {
    await deleteAllUserData(userId);
    await this.logGDPRAction(userId, 'erasure');
  }

  // Right to Data Portability (Article 20)
  async portUserData(userId: string): Promise<JSONData> {
    const data = await this.exportUserData(userId);
    return {
      format: 'JSON',
      data,
      exportedAt: new Date().toISOString()
    };
  }

  // Right to Restrict Processing (Article 18)
  async restrictProcessing(userId: string) {
    await db.user.update({
      where: { id: userId },
      data: { processingRestricted: true }
    });
  }

  // Right to Object (Article 21)
  async objectToProcessing(userId: string, purpose: string) {
    await db.processingObjection.create({
      data: {
        userId,
        purpose,
        objectedAt: new Date()
      }
    });
  }

  private async logGDPRAction(
    userId: string,
    action: string,
    details?: any
  ) {
    await db.gdprLog.create({
      data: {
        userId,
        action,
        details,
        timestamp: new Date()
      }
    });
  }
}
```

#### Consent Management

```typescript
/**
 * Granular consent tracking
 */

enum ConsentType {
  ESSENTIAL = 'essential', // Required for service
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  AI_TRAINING = 'ai_training', // Use data for AI improvement
  DATA_SHARING = 'data_sharing'
}

interface Consent {
  userId: string;
  type: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  version: number; // Track consent version for changes
}

class ConsentManager {
  async grantConsent(
    userId: string,
    type: ConsentType,
    version: number
  ) {
    await db.consent.upsert({
      where: { userId_type: { userId, type } },
      create: {
        userId,
        type,
        granted: true,
        grantedAt: new Date(),
        version
      },
      update: {
        granted: true,
        grantedAt: new Date(),
        revokedAt: null,
        version
      }
    });
  }

  async revokeConsent(userId: string, type: ConsentType) {
    await db.consent.update({
      where: { userId_type: { userId, type } },
      data: {
        granted: false,
        revokedAt: new Date()
      }
    });

    // Take action based on revoked consent
    await this.handleConsentRevocation(userId, type);
  }

  private async handleConsentRevocation(
    userId: string,
    type: ConsentType
  ) {
    switch (type) {
      case ConsentType.AI_TRAINING:
        // Stop using user data for AI training
        await db.submission.updateMany({
          where: { userId },
          data: { excludeFromTraining: true }
        });
        break;

      case ConsentType.ANALYTICS:
        // Delete analytics data
        await analytics.deleteUserData(userId);
        break;

      // ... other cases
    }
  }

  async hasConsent(userId: string, type: ConsentType): Promise<boolean> {
    const consent = await db.consent.findUnique({
      where: { userId_type: { userId, type } }
    });

    return consent?.granted ?? (type === ConsentType.ESSENTIAL);
  }
}
```

### HIPAA Compliance (Healthcare)

```typescript
/**
 * HIPAA requirements for healthcare documents
 */

interface HIPAAControls {
  // Administrative safeguards
  securityOfficer: string;
  riskAssessment: Date;
  trainingCompleted: Date;

  // Technical safeguards
  accessControl: boolean;
  auditControls: boolean;
  integrityControls: boolean;
  transmissionSecurity: boolean;

  // Physical safeguards
  facilityAccess: boolean;
  workstationSecurity: boolean;
  deviceSecurity: boolean;
}

// BAA (Business Associate Agreement) tracking
interface BusinessAssociate {
  id: string;
  name: string;
  baaSignedDate: Date;
  baaExpiryDate: Date;
  services: string[];
  status: 'active' | 'expired' | 'terminated';
}

// PHI (Protected Health Information) handling
const PHI_FIELDS = [
  'patient_name',
  'medical_record_number',
  'ssn',
  'date_of_birth',
  'address',
  'phone',
  'email'
];

async function deidentifyPHI(document: Document): Promise<Document> {
  const deidentified = { ...document };

  for (const field of PHI_FIELDS) {
    if (deidentified.data[field]) {
      deidentified.data[field] = `[REDACTED_${field.toUpperCase()}]`;
    }
  }

  return deidentified;
}
```

### SOC 2 Compliance

```typescript
/**
 * SOC 2 Trust Service Criteria
 */

// CC6.1: Logical and Physical Access Controls
interface AccessControl {
  userId: string;
  resource: string;
  action: string;
  granted: boolean;
  justification?: string;
  approvedBy?: string;
  expiresAt?: Date;
}

// CC7.2: System Monitoring
class SecurityMonitoring {
  async logSecurityEvent(event: SecurityEvent) {
    await db.securityLog.create({
      data: {
        eventType: event.type,
        severity: event.severity,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        timestamp: new Date()
      }
    });

    // Alert on high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.sendSecurityAlert(event);
    }
  }

  async detectAnomalies() {
    // Detect unusual access patterns
    // Detect failed login attempts
    // Detect data exfiltration attempts
  }
}

// CC8.1: Change Management
interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  approvedBy?: string;
  implementedBy?: string;
  tested: boolean;
  rollbackPlan: string;
  status: 'pending' | 'approved' | 'implemented' | 'rolled_back';
}
```

---

## AI Safety & Governance

### AI Model Safety

```typescript
/**
 * Safeguards for AI operations
 */

class AISafetyLayer {
  // 1. Input validation and sanitization
  async validateInput(input: string): Promise<ValidationResult> {
    // Check for prompt injection attempts
    if (this.detectPromptInjection(input)) {
      return {
        valid: false,
        reason: 'Potential prompt injection detected'
      };
    }

    // Check for PII in input
    const pii = this.detectPII(input);
    if (pii.length > 0 && !this.hasConsent()) {
      return {
        valid: false,
        reason: 'PII detected without consent',
        piiFound: pii
      };
    }

    // Rate limiting
    if (await this.isRateLimited()) {
      return {
        valid: false,
        reason: 'Rate limit exceeded'
      };
    }

    return { valid: true };
  }

  // 2. Output filtering
  async filterOutput(output: string): Promise<string> {
    // Remove any accidentally generated PII
    let filtered = this.redactPII(output);

    // Remove unsafe content
    filtered = await this.moderateContent(filtered);

    return filtered;
  }

  // 3. Audit trail
  async logAIOperation(operation: AIOperation) {
    await db.aiAuditLog.create({
      data: {
        userId: operation.userId,
        operationType: operation.type,
        input: this.sanitizeForLogging(operation.input),
        output: this.sanitizeForLogging(operation.output),
        modelUsed: operation.model,
        tokensUsed: operation.tokens,
        cost: operation.cost,
        timestamp: new Date()
      }
    });
  }

  // 4. Human-in-the-loop for critical decisions
  async requireHumanReview(
    analysis: DocumentAnalysis
  ): Promise<boolean> {
    // Require human review if:
    // - High risk detected
    // - Low confidence score
    // - Healthcare or legal domain
    // - First time user/organization

    return (
      analysis.riskLevel === 'high' ||
      analysis.confidence < 0.7 ||
      analysis.documentType === 'medical' ||
      analysis.documentType === 'legal'
    );
  }
}
```

### Data Usage in AI Training

```typescript
/**
 * Control over how user data is used for AI
 */

interface AIDataUsagePolicy {
  useForTraining: boolean; // Train custom models
  shareWithAIProviders: boolean; // Anthropic, OpenAI
  anonymizeBeforeUse: boolean;
  retentionPeriod: number; // days
}

class AIDataGovernance {
  async canUseForTraining(
    userId: string,
    documentId: string
  ): Promise<boolean> {
    // Check user consent
    const consent = await consentManager.hasConsent(
      userId,
      ConsentType.AI_TRAINING
    );

    if (!consent) return false;

    // Check organization policy
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    const orgPolicy = user.organization?.aiDataPolicy;
    return orgPolicy?.useForTraining ?? false;
  }

  async anonymizeForTraining(document: Document): Promise<Document> {
    // Remove all PII
    // Remove organization-specific information
    // Generalize specific details
    // Keep structure and patterns

    return anonymized;
  }

  // Opt-out mechanism
  async optOutOfAITraining(userId: string) {
    await consentManager.revokeConsent(userId, ConsentType.AI_TRAINING);

    // Mark all existing data as excluded
    await db.document.updateMany({
      where: { userId },
      data: { excludeFromTraining: true }
    });
  }
}
```

---

## Incident Response

### Security Incident Response Plan

```typescript
/**
 * Structured approach to security incidents
 */

enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface SecurityIncident {
  id: string;
  severity: IncidentSeverity;
  type: string;
  description: string;
  affectedUsers?: string[];
  affectedData?: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  actions: IncidentAction[];
}

interface IncidentAction {
  timestamp: Date;
  action: string;
  performedBy: string;
  result: string;
}

class IncidentResponseTeam {
  async handleIncident(incident: SecurityIncident) {
    // 1. Immediate containment
    await this.containIncident(incident);

    // 2. Assess impact
    const impact = await this.assessImpact(incident);

    // 3. Notify stakeholders
    await this.notifyStakeholders(incident, impact);

    // 4. Remediate
    await this.remediate(incident);

    // 5. Post-incident review
    await this.conductPostMortem(incident);
  }

  private async containIncident(incident: SecurityIncident) {
    switch (incident.type) {
      case 'data_breach':
        // Revoke access tokens
        // Disable affected accounts
        // Block suspicious IPs
        break;

      case 'unauthorized_access':
        // Force password reset
        // Enable MFA
        // Review access logs
        break;

      case 'ddos_attack':
        // Enable advanced DDoS protection
        // Scale infrastructure
        // Block attack sources
        break;
    }
  }

  private async notifyStakeholders(
    incident: SecurityIncident,
    impact: ImpactAssessment
  ) {
    // Notify affected users (GDPR requirement: within 72 hours)
    if (incident.severity === IncidentSeverity.HIGH ||
        incident.severity === IncidentSeverity.CRITICAL) {
      await this.notifyAffectedUsers(incident.affectedUsers);
    }

    // Notify regulators if required
    if (impact.requiresRegulatoryNotification) {
      await this.notifyRegulators(incident);
    }

    // Internal notification
    await this.notifySecurityTeam(incident);
  }
}
```

### Breach Notification

```typescript
/**
 * GDPR Article 33-34: Breach notification
 */

interface BreachNotification {
  incidentId: string;
  nature: string;
  categories: string[];
  approximateNumberAffected: number;
  likelyConsequences: string;
  measuresProposed: string;
  contactPoint: string;
}

async function notifyDataBreach(incident: SecurityIncident) {
  const notification: BreachNotification = {
    incidentId: incident.id,
    nature: incident.description,
    categories: incident.affectedData,
    approximateNumberAffected: incident.affectedUsers?.length ?? 0,
    likelyConsequences: await assessConsequences(incident),
    measuresProposed: await proposeMeasures(incident),
    contactPoint: process.env.DPO_EMAIL
  };

  // Notify supervisory authority within 72 hours
  await notifySupervisoryAuthority(notification);

  // Notify affected individuals without undue delay
  await notifyAffectedIndividuals(incident.affectedUsers, notification);
}
```

---

## Security Best Practices

### Development Security

```typescript
/**
 * Secure coding practices
 */

// 1. Input validation
import { z } from 'zod';

const documentUploadSchema = z.object({
  file: z.custom<File>(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional()
}).refine(
  data => data.file.size <= 10 * 1024 * 1024,
  'File size must be less than 10MB'
);

// 2. SQL injection prevention (Prisma handles this)
// NEVER use raw SQL without parameterization
const users = await db.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`; // Prisma automatically parameterizes

// 3. XSS prevention
import DOMPurify from 'dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// 4. CSRF protection
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// 5. Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// 6. Secure headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.anthropic.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Dependency Management

```typescript
/**
 * Secure dependency management
 */

// 1. Regular dependency audits
// npm audit or yarn audit
// Automated with GitHub Dependabot

// 2. Pin dependency versions
// package.json - use exact versions for critical deps
{
  "dependencies": {
    "next": "13.5.6", // exact version
    "react": "^18.2.0" // allow patch updates
  }
}

// 3. Vulnerability scanning in CI/CD
// .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run test:security
```

### Penetration Testing

```typescript
/**
 * Regular security testing
 */

// Schedule:
// - Automated scanning: Daily
// - Vulnerability assessment: Monthly
// - Penetration testing: Quarterly
// - Bug bounty program: Ongoing

interface PenTestReport {
  date: Date;
  tester: string;
  scope: string[];
  findings: SecurityFinding[];
  remediation: RemediationPlan;
}

interface SecurityFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  reproduction: string;
  impact: string;
  recommendation: string;
}
```

---

## Compliance Checklist

### Pre-Launch Security Checklist

- [ ] Security audit completed
- [ ] Penetration testing completed
- [ ] All dependencies up to date
- [ ] Secrets properly managed
- [ ] Encryption at rest enabled
- [ ] TLS 1.3 configured
- [ ] Rate limiting implemented
- [ ] CSRF protection enabled
- [ ] XSS prevention in place
- [ ] SQL injection prevention verified
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Session management secure
- [ ] Password policy enforced
- [ ] MFA available
- [ ] Audit logging implemented
- [ ] Incident response plan documented
- [ ] Data retention policy defined
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified
- [ ] Data export functionality working
- [ ] Data deletion functionality working
- [ ] Backup and recovery tested
- [ ] Monitoring and alerting configured

---

**Regular Review**: This security documentation should be reviewed and updated quarterly and after any security incidents.

**Last Updated**: 2025-11-26
**Next Review**: 2026-02-26
