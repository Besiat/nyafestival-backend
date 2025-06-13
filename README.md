# Nyaf Festival Backend

Backend API for the Nyaf Festival platform built with NestJS and TypeScript. Handles festival event management, user registration, and automated email notifications. The platform allows dynamic creation of festival nominations and accepts applications from participants.

**Live Deployments**: [coverfestufa.ru](https://coverfestufa.ru) | [nyafest.ru](https://nyafest.ru)

## Application System Architecture

The core functionality revolves around a flexible application management system with a three-tier structure:

### Dynamic Nomination System
- **Nominations**: Main categories (e.g., "Cosplay", "Video Editing", "Dance") 
- **Sub-nominations**: Specific subcategories within each nomination (e.g., "Photo Cosplay", "Pet Cosplay")
- **Custom Fields**: Dynamic form fields that can be assigned to nominations with custom ordering
- **Field Types**: Support for text, file uploads, dropdowns, and other input types

### Technical Implementation

#### Entity Structure
The system uses a flexible many-to-many relationship pattern:
- `Nomination` → `NominationField` → `Field` (many-to-many with ordering)
- `Nomination` → `SubNomination` (one-to-many)
- `SubNomination` → `Application` (one-to-many)
- `Application` → `ApplicationData` (one-to-many)

#### Dynamic Form Generation
1. **Field Assignment**: Admins can dynamically assign fields to nominations with custom ordering
2. **Form Rendering**: Frontend generates forms based on the nomination's assigned fields
3. **Data Validation**: Server validates submitted data against field requirements and types
4. **Flexible Storage**: Application data stored as key-value pairs mapped to field definitions

#### Application Lifecycle
1. **Registration**: Users submit applications for specific sub-nominations
2. **Data Mapping**: Application data maps field IDs to user-provided values
3. **State Management**: Applications progress through states (New → Pending → Accepted/Denied/Invalid)
4. **Admin Interface**: Complete CRUD operations for managing applications and reviewing submissions

### Key Features
- **Field Type Support**: Text, textarea, file upload, dropdown, checkbox, radio, number, email
- **Custom Ordering**: Fields can be ordered within nominations for consistent form layouts  
- **File Handling**: Integrated file upload system for images, videos, and documents
- **Voting System**: Public viewing of applications with configurable field visibility
- **State Tracking**: Full audit trail of application status changes with admin notes

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: TypeORM
- **Email**: Brevo API
- **HTTP Client**: Axios