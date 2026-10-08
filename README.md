whereInVIT

Lost it? Find where it is in VIT.

whereInVIT is a privacy-first Lost & Found platform designed specifically for the VIT Vellore campus. It provides a structured alternative to scattered WhatsApp groups by allowing students and faculty to report lost and found items, search for listings, verify ownership privately, communicate securely, and coordinate safe item handoffs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Losing an item on a large campus can be frustrating. Traditional Lost & Found systems often depend on WhatsApp groups, personal contacts, and word of mouth, making it difficult to search through old posts, verify ownership, protect personal information, or track whether an item has actually been returned.

whereInVIT brings the complete Lost & Found process into one centralized platform.

The core workflow is:

Report → Discover → Claim → Verify → Approve → Message → Handoff → Resolve

The goal is simple:

Make Lost & Found on the VIT campus structured, searchable, private, and safer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VIT-Only Authentication

whereInVIT is designed specifically for the VIT community.

Authentication is restricted to verified VIT student accounts using the @vitstudent.ac.in email domain.

The authentication system uses Google authentication with server-side identity verification and secure HTTP-only sessions.

Users do not need to create or remember another password for the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lost & Found Discovery

whereInVIT provides separate sections for:

• Lost Items
• Found Items

Users can search and filter listings using:

• Keywords
• Categories
• Campus venues
• Item type
• Item status

Search filters can be combined to quickly narrow down relevant listings.

For example, a student can search for a wallet reported around SJT and filter the results to the Wallets & Card Holders category.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRUCTURED VIT LOCATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instead of relying on inconsistent free-text locations, whereInVIT uses structured campus venues.

Academic Blocks

• SJT
• TT
• PRP
• SMV
• MB
• GDN
• CDMM

Men's Hostels

• MH A
• MH B
• MH B Annex
• MH C
• MH D
• MH D Annex
• MH E
• MH F
• MH G
• MH H
• MH J
• MH K
• MH L
• MH M
• MH M Annex
• MH N
• MH N Annex
• MH P
• MH Q
• MH R
• MH S
• MH T

Ladies' Hostels

• LH A
• LH B
• LH C
• LH D
• LH E
• LH F
• LH G
• LH H
• LH J
• RGT H
• LH GH (Annex)

Food & Dining

• Gazebo
• Food Mall
• Darling Food Court (DC)
• One Food World

Sports & Fitness

• Outdoor Stadium
• Indoor Gym
• Outdoor Gym
• Fitty Gym
• Fitty Stag Gym
• VIT Men's Swimming Pools

Campus Spots

• Foodys
• Woodys

Library

• Central Library

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEM CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT supports structured categories covering common student and faculty belongings.

• ID & Access Cards
• Keys
• Wallets & Card Holders
• Smartphones
• Books
• Bags & Backpacks
• Earphones & Headphones
• Chargers & Cables
• Calculators
• Laptops & Tablets
• Water Bottles & Flasks
• Spectacles
• Stationery
• USB & Storage Devices
• Clothing
• Sports Equipment
• Lab Equipment
• Electronic Components
• Documents & Certificates
• Cash & Cards
• Laptop Accessories
• Mobile Accessories
• Smartwatches & Wearables
• Umbrellas
• Footwear
• Jewellery & Accessories
• Gym Equipment & Accessories
• Musical Instruments
• Hostel Items
• Personal Care Items
• Other

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEM REPORTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Users can report either a lost or found item.

Each listing can contain:

• Item title
• Category
• VIT campus location
• Description
• Item image
• Item type

Users can upload an image of the item, making listings easier to identify.

The platform is designed to prioritize actual uploaded item images while supporting appropriate fallback behavior when an image is unavailable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIVACY-FIRST DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Privacy is one of the core principles of whereInVIT.

Public listings expose only the information necessary to help identify an item.

Sensitive information is not publicly displayed, including:

• Registration numbers
• Personal email addresses
• Phone numbers
• Private verification information
• Private claim information
• Unnecessary personal identity information

The authenticated user's identity is derived from the server-side session rather than being trusted from client-submitted user IDs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OWNERSHIP VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A Lost & Found platform needs more than a simple "Claim" button.

whereInVIT introduces a private ownership verification process.

Finder Creates a Verification Challenge

The finder can create a question that only the genuine owner is likely to answer.

Example:

"What name or branch is written on the ID card?"

The verification information is kept private.

Claimant Submits an Answer

The claimant submits an answer privately.

The answer is normalized and securely hashed rather than stored as plain text.

Finder Reviews the Claim

The finder can either:

APPROVE THE CLAIM

or

REJECT THE CLAIM

This provides an additional layer of protection against false ownership claims.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLAIM LIFECYCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Claims follow a controlled lifecycle:

PENDING
   │
   ├── APPROVED
   │
   └── REJECTED

PENDING
   │
   └── CANCELLED

Only authenticated users can create claims.

Duplicate claims are prevented.

When a claim is approved, the item progresses through its ownership lifecycle and competing pending claims are rejected.

The item is not immediately considered resolved because the physical return still needs to take place.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIVATE MESSAGING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Messaging is available only after an ownership claim has been approved.

The conversation is strictly between:

Finder
   ↕
Approved Claimant

Users cannot privately message each other about an item before the claim is approved.

Messaging is unavailable for:

• Pending claims
• Rejected claims
• Cancelled claims
• Unauthorized users

Every conversation access request is authorized by the backend.

The sender identity is derived from the authenticated session, preventing users from impersonating another account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAFE HANDOFF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After a claim has been approved, the finder and claimant can coordinate the return privately.

whereInVIT provides designated campus handoff checkpoints:

• SJT Ground Floor Reception
• Central Library Security Desk

The intended return workflow is:

Claim Approved
      ↓
Private Messaging
      ↓
Handoff Scheduled
      ↓
Handoff Confirmed
      ↓
Item Returned
      ↓
Resolved

This reduces the need to exchange personal addresses or arrange meetings at arbitrary locations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEM LIFECYCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Items follow a structured lifecycle:

ACTIVE
  ↓
CLAIM_PENDING
  ↓
CLAIMED
  ↓
HANDOFF_PENDING
  ↓
RETURNED
  ↓
RESOLVED

This ensures that successfully returned items can eventually be removed from active Lost & Found listings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYSTEM ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT follows a modern full-stack architecture.

                    whereInVIT
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    FRONTEND                         BACKEND
        │                               │
  Next.js + React                Node.js + Express
  TypeScript                     TypeScript
  Tailwind CSS                   Authentication
  App Router                     Business Logic
                                 Authorization
        │                               │
        └───────────────┬───────────────┘
                        │
                        ▼
                  Prisma ORM
                        │
                        ▼
                  PostgreSQL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNOLOGY STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend

• Next.js
• React
• TypeScript
• Tailwind CSS
• Next.js App Router

Backend

• Node.js
• Express
• TypeScript

Database

• PostgreSQL

ORM

• Prisma

Authentication

• Google Identity Services
• Google OAuth
• HTTP-only session cookies

Security

• Helmet
• CORS
• SHA-256 session token hashing
• Secure verification-answer hashing
• Server-side authorization
• Session-derived user identity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATABASE MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The system uses PostgreSQL through Prisma.

Major entities include:

• Profile
• Session
• Venue
• Category
• Item
• Claim
• VerificationChallenge
• Conversation
• Message
• Handoff
• Notification

The relationships between these entities support the complete Lost & Found lifecycle from reporting an item to returning and resolving it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Authentication

Users must authenticate through Google and pass the VIT email-domain restriction.

Authorization

The server determines the authenticated user from the secure session.

Client-provided user IDs are not trusted for sensitive operations.

Sessions

Session tokens are randomly generated and stored securely as hashes in the database. The browser receives the session through an HTTP-only cookie.

Claims

Claim operations verify:

• Authentication
• Item ownership
• Claim ownership
• Claim state
• Item state

Messaging

Conversation access is restricted to:

• The original finder
• The approved claimant

This prevents unauthorized users from accessing private conversations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI / UX DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT follows a premium editorial design direction rather than the appearance of a traditional student portal.

The interface focuses on:

• Minimal layouts
• Strong typography
• Clear visual hierarchy
• Editorial spacing
• Large hero sections
• Premium black and off-white visual language
• Responsive layouts
• Strong calls to action
• Item-focused imagery
• Smooth transitions

The objective is to make the platform feel like a polished real-world product rather than a basic CRUD application.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The major user-facing sections include:

• Home
• Lost Items
• Found Items
• Report Item
• Item Details
• Edit Item
• Messages
• Private Conversation

The application provides shared navigation and authenticated user controls throughout the platform.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT is designed to handle complete application states rather than only successful requests.

Important states include:

• Loading
• Empty
• Error
• Success
• Unauthorized
• Forbidden
• Submitted
• Pending
• Approved
• Rejected
• Returned
• Resolved

This ensures users receive clear feedback throughout the entire workflow.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEVELOPMENT ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Module 0 — Project Setup

• Next.js project
• TypeScript
• Tailwind CSS
• Git repository
• GitHub repository
• Initial project structure

STATUS: COMPLETED

Module 1 — Backend & Database Foundation

• Express backend
• TypeScript
• Prisma
• PostgreSQL
• Database schema
• Seed data
• Venue management
• Category management

STATUS: COMPLETED

Module 2 — VIT Authentication

• Google authentication
• @vitstudent.ac.in restriction
• Server-side identity verification
• Secure sessions
• HTTP-only cookies
• Login and logout
• Authenticated user endpoint

STATUS: COMPLETED

Module 3 — Lost & Found

• Lost item reporting
• Found item reporting
• Item CRUD
• Category selection
• Venue selection
• Item images
• Ownership-based editing
• Ownership-based deletion
• Lost and Found feeds

STATUS: COMPLETED

Module 4 — Search & Discovery

• Keyword search
• Category filtering
• Venue filtering
• Item type filtering
• Status filtering
• Pagination
• URL-synchronized filters
• Debounced search

STATUS: COMPLETED

Module 5 — Claims & Ownership Verification

• Claim workflow
• Verification challenges
• Secure answer hashing
• Claim approval and rejection
• Duplicate claim prevention
• Claim lifecycle
• Ownership authorization

STATUS: COMPLETED

Module 6 — Private Messaging

• Private conversations
• Approved-claim-only messaging
• Conversation access control
• Message history
• Read status
• Message polling
• Finder and approved claimant communication

STATUS: COMPLETED

Module 7 — Handoff & Return Management

Planned features:

• Handoff scheduling
• Checkpoint selection
• Handoff confirmation
• Handoff completion
• Return status
• Resolved item lifecycle

STATUS: PLANNED

Module 8 — Notifications

Planned features:

• Claim notifications
• Claim approval notifications
• Rejection notifications
• New message notifications
• Handoff notifications
• Return notifications

STATUS: PLANNED

Module 9 — Administration

Planned features:

• Admin authentication and authorization
• Item moderation
• Category management
• Venue management
• Report handling
• User management
• Platform analytics

STATUS: PLANNED

Module 10 — Testing & Deployment

Planned features:

• Unit testing
• Integration testing
• API testing
• Authentication testing
• Authorization testing
• Security testing
• Production deployment
• Database deployment
• CI/CD

STATUS: PLANNED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FUTURE IMPROVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Future versions of whereInVIT may include:

• Realtime messaging
• Push notifications
• Email notifications
• Advanced Lost & Found matching
• AI-assisted item matching
• Image similarity search
• Improved moderation
• Administrative analytics
• Cloud-based image storage
• Automated testing
• CI/CD
• Progressive Web App support
• Mobile application support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIVACY PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT is built around the principle of exposing only the information necessary to return an item.

The platform follows these principles:

Minimum Necessary Information

Only information required for Lost & Found discovery is publicly displayed.

Private Ownership Verification

Verification challenges and claim information remain private.

Private Communication

Messaging is available only to authorized participants.

No Unnecessary Contact Exposure

Users do not need to publicly post phone numbers, email addresses, or personal contact information.

Server-Side Authorization

Sensitive operations are authorized by the backend rather than relying only on frontend restrictions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT VISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT is more than a Lost & Found board.

It is designed as a complete digital workflow for recovering lost belongings within a university campus.

From the moment an item is reported to the moment it is safely returned, every stage is structured:

Lost Item
     ↓
Discovery
     ↓
Ownership Verification
     ↓
Claim Approval
     ↓
Private Communication
     ↓
Safe Handoff
     ↓
Return
     ↓
Resolution

The long-term vision is to create a trusted campus ecosystem where finding a lost item is no longer dependent on scrolling through hundreds of messages or relying on chance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

whereInVIT

Lost it? Find where it is in VIT.

Built to make Lost & Found at VIT more structured, searchable, private, and safer.
