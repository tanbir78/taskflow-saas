
# Security Model

This document describes the security mechanisms currently implemented in the TaskFlow backend.

## 1. Identity and Authentication

- Firebase ID tokens are verified on the server side.
- User information and `platformRole` are loaded from MongoDB.
- Client-sent roles and IDs are ignored to prevent unauthorized access.

## 2. Workspace Isolation

- Every `/workspaces/:workspaceId/*` route runs the `loadWorkspace` middleware.
- Workspace membership is verified before allowing access.
- Non-members receive a `404 Not Found` response.

## 3. Authorization and Permissions

- The `requirePermission` middleware handles permission checks.
- Permissions are managed through a centralized role-permission matrix in `server/utilities/permissions.js`.
- The system follows a deny-by-default approach.

## 4. Data Validation and Protection

- Every task and project query includes `workspaceId` and `projectId` where applicable.
- Zod `.strict()` schemas reject unknown fields.
- Search input is regex-escaped to prevent regex injection.
- MongoDB ObjectIds are validated before use.

## 5. Socket Security

- Socket connections are authenticated using Firebase tokens.
- Workspace room joins are verified against database membership.
- Unauthorized users cannot join workspace rooms.

## 6. Known Security Gaps

The following features have not yet been implemented:

- **Invitations:** Workspace invitation functionality.
- **Upload Validation:** File type, size, and security validation.
- **Audit Log Viewing:** Interface or API for viewing audit logs.
- **Automated Isolation Tests:** Automated tests to verify workspace data isolation.

## 7. Security Status

The security mechanisms listed above reflect the current implementation. The known gaps should be addressed in future development to strengthen the overall security of TaskFlow.
