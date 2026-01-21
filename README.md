# Marriage Matchmaking Application – Full Specification

## 1. Purpose
This application is a **serious matrimonial platform**, not a dating app.  
Its goal is to help users find a **life partner for marriage** with strong emphasis on **trust, verification, compatibility, and family values**.

---

## 2. Core Principles
- Serious intent only
- Backend is the source of truth
- Clean Architecture enforced
- No UI-driven business rules
- Explainable, rule-based matching

---

## 3. Technology Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS / CSS Modules

### Backend
- Next.js API Routes or Server Actions
- Clean Architecture
- TypeScript

### Database
- PostgreSQL or MySQL
- Prisma ORM (infrastructure layer only)

### Authentication
- JWT (access + refresh tokens)
- HttpOnly cookies
- Role-based authorization

---

## 4. Architecture Rules (Mandatory)

### Clean Architecture Layers

UI (Next.js Pages / Components)
↓  
Controllers (API Routes / Server Actions)  
↓  
Use Cases (Application Logic)  
↓  
Entities (Domain Rules)  
↓  
Repository Interfaces  
↓  
Infrastructure (Prisma, Database, External Services)

### Rules
- Dependencies must point inward only
- Entities must not import frameworks
- Prisma models must not be used directly in use cases
- Business logic must never exist in the UI

---

## 5. Domain Entities

### User
- id
- email
- phone
- role (user | guardian | admin)
- verificationStatus

Rules:
- Unverified users cannot interact
- Guardians manage profiles but not matches

---

### Profile
- Personal details
- Lifestyle details
- Family details
- Partner preferences
- Completion percentage
- Visibility level

Rules:
- Must meet legal marriage age
- Must be at least 80% complete to send interests
- Visibility controls what others can see

---

### Interest
- fromUserId
- toUserId
- status (pending | accepted | rejected)

Rules:
- One interest per pair
- Daily interest limits
- Acceptance creates a match

---

### Match
- userA
- userB
- createdAt

Rules:
- Enables chat
- Immutable once created

---

### Message
- matchId
- senderId
- content
- type (text | limited media)

Rules:
- Only allowed between matched users
- Rate-limited

---

## 6. Use Cases

### Authentication
- RegisterUser
- VerifyEmail / Phone
- LoginUser
- RefreshSession

### Profile Management
- CreateProfile
- UpdateProfile
- CalculateCompletion
- SetVisibility

### Discovery & Matching
- SearchProfiles
- CalculateMatchScore
- RecommendProfiles

### Interaction
- SendInterest
- AcceptInterest
- RejectInterest
- WithdrawInterest
- BlockUser

### Communication
- SendMessage
- FetchMessages
- MarkAsRead

### Trust & Safety
- VerifyProfile
- ReportUser
- SuspendUser
- AuditActions

---

## 7. Matching Algorithm

- Deterministic, rule-based scoring (0–100)
- Weighted criteria:
  - Age compatibility
  - Religion / culture
  - Education
  - Location
  - Lifestyle
  - Family type
  - Profile completeness

Rules:
- Minimum score threshold to appear in results
- Daily discovery limits
- Sorted by highest compatibility

---

## 8. Database Design (Logical)

Core tables:
- users
- profiles
- preferences
- family_details
- interests
- matches
- messages
- blocks
- reports
- verifications

Constraints:
- Unique (fromUserId, toUserId) in interests
- Indexed search fields
- Soft deletes where applicable

---

## 9. API / Server Action Rules
- Authenticate request
- Validate input
- Call a single use case
- Return standardized responses

Controllers must not:
- Contain business logic
- Access Prisma directly

---

## 10. Security & Abuse Prevention
- Rate limiting
- Daily action caps
- Blocking
- Reporting
- Account suspension
- Audit logs

All enforced on backend only.

---

## 11. Notifications
Triggered by backend events:
- Interest received
- Interest accepted
- New message

Delivery:
- In-app notifications
- Optional email
- Optional web push

---

## 12. Monetization (Future-Safe)
- Paid interest boosts
- Contact unlocks
- Profile visibility boosts
- Family-managed profiles

Monetization must not bypass core rules.

---

## 13. Development Workflow

### Phase 1 (Mandatory First)
- Entities
- Use cases
- Repository interfaces
- Matching algorithm
- Unit tests

### Phase 2
- Prisma schema
- Repository implementations
- Authentication
- API routes

### Phase 3
- UI development
- Forms and UX polish

UI may be developed in parallel only after contracts are frozen.

---

## 14. Non-Goals
- No swipe-based dating
- No casual interactions
- No anonymous messaging
- No black-box AI matching (initial phase)

---

## 15. Final Instruction
This application must be built **domain-first**, strictly following **Clean Architecture**.  
Backend rules are authoritative.  
UI must adapt to the domain logic, never the opposite.

This is a **long-term, serious matrimonial platform**.
