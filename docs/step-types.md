# Step Types Guide

This document provides detailed information about all step types supported by Runn GUI Builder and the underlying [runn](https://github.com/k1LoW/runn) tool.

## Overview

Runn supports multiple step types for different testing scenarios:

| Step Type | Status | Icon | Description |
|-----------|--------|------|-------------|
| HTTP Request | ✅ Implemented | 🌐 | Make HTTP API calls |
| Include | ✅ Implemented | 📁 | Reference external step files |
| Bind | ✅ Implemented | 🔗 | Extract or generate values |
| Database | 🚧 Coming Soon | 💾 | Execute SQL queries |
| gRPC | 🚧 Coming Soon | 📡 | Make gRPC calls |
| SSH | 🚧 Coming Soon | 🖥️ | Execute SSH commands |
| CDP | 🚧 Coming Soon | 🌍 | Browser automation |
| Exec | 🚧 Coming Soon | ⚙️ | Execute shell commands |

## HTTP Request Step (🌐)

### Purpose

Make HTTP API calls to test REST APIs, GraphQL endpoints, or any HTTP-based service.

### Fields

#### Basic Fields

- **Description** (`desc`): Human-readable description of the step
- **Runner** (`req`): Name of the HTTP runner to use (defined in Runners section)
- **Method**: HTTP method (GET, POST, PUT, DELETE, PATCH)
- **Path**: URL path (can include variables)

#### Request Configuration

- **Headers**: Key-value pairs for HTTP headers
- **Query Parameters**: URL query parameters
- **Body**: Request body (supports JSON, form-data, raw text)

#### Testing & Binding

- **Test**: JavaScript expression to validate response (e.g., `current.res.status == 200`)
- **Bind**: Extract values from response for use in later steps

### Example 1: Simple GET Request

```yaml
steps:
  - desc: Get user profile
    req: api
    get:
      path: /users/{{ vars.userId }}
    test: |
      current.res.status == 200
```

GUI:
1. Add HTTP Request step
2. Description: "Get user profile"
3. Runner: "api"
4. Method: GET
5. Path: `/users/{{ vars.userId }}`
6. Test: `current.res.status == 200`

### Example 2: POST with JSON Body

```yaml
steps:
  - desc: Create new user
    req: api
    post:
      path: /users
      body:
        application/json:
          name: John Doe
          email: john@example.com
    test: |
      current.res.status == 201
    bind:
      userId: current.res.body.id
```

GUI:
1. Add HTTP Request step
2. Description: "Create new user"
3. Runner: "api"
4. Method: POST
5. Path: `/users`
6. Body Type: JSON
7. Body:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
   ```
8. Test: `current.res.status == 201`
9. Bind: `userId` = `current.res.body.id`

### Example 3: Authenticated Request with Headers

```yaml
steps:
  - desc: Get protected resource
    req: api
    get:
      path: /protected
      headers:
        Authorization: Bearer {{ vars.token }}
    test: |
      current.res.status == 200
```

GUI:
1. Add HTTP Request step
2. Description: "Get protected resource"
3. Runner: "api"
4. Method: GET
5. Path: `/protected`
6. Headers:
   - Key: `Authorization`
   - Value: `Bearer {{ vars.token }}`
7. Test: `current.res.status == 200`

### Variable Interpolation

You can use variables in:
- **Path**: `{{ vars.variableName }}`
- **Headers**: `{{ vars.token }}`
- **Body**: `{{ vars.userId }}`
- **Query parameters**: `{{ vars.filter }}`

### Test Expressions

Common test patterns:

```javascript
// Status code
current.res.status == 200
current.res.status >= 200 && current.res.status < 300

// Response body
current.res.body.success == true
current.res.body.data.length > 0
current.res.body.id != null

// Headers
current.res.headers['Content-Type'].includes('application/json')
```

### Bind Expressions

Common bind patterns:

```javascript
// Extract from response body
token: current.res.body.token
userId: current.res.body.user.id
items: current.res.body.items

// Extract from headers
sessionId: current.res.headers['X-Session-Id']

// Computed values
fullName: current.res.body.firstName + ' ' + current.res.body.lastName
```

## Include Step (📁)

### Purpose

Reference external runbook files to reuse common test flows or organize complex scenarios into smaller, manageable pieces.

### Fields

- **Description** (`desc`): Human-readable description of the step
- **Path** (`include`): Relative path to the runbook file (e.g., `steps/auth.yml`)
- **Variables** (optional): Pass variables to the included runbook

### Format

Include steps can use two formats:

#### Simple Format (no variables)

```yaml
steps:
  - desc: Run authentication flow
    include: steps/auth.yml
```

#### Object Format (with variables)

```yaml
steps:
  - desc: Run authentication flow
    include:
      path: steps/auth.yml
      vars:
        userId: "{{ vars.testUserId }}"
        role: "admin"
```

### Example 1: Include Common Setup

**Main runbook** (`main.yml`):
```yaml
desc: User CRUD Tests
steps:
  - desc: Authenticate
    include: steps/auth.yml

  - desc: Create user
    req: api
    post:
      path: /users
      # ... uses token from auth.yml
```

**Included runbook** (`steps/auth.yml`):
```yaml
desc: Authentication flow
steps:
  - desc: Login
    req: api
    post:
      path: /login
      body:
        application/json:
          username: admin
          password: secret
    bind:
      token: current.res.body.token
```

### Example 2: Parameterized Include

**Main runbook**:
```yaml
steps:
  - desc: Create admin user
    include:
      path: steps/create-user.yml
      vars:
        role: "admin"
        email: "admin@example.com"

  - desc: Create regular user
    include:
      path: steps/create-user.yml
      vars:
        role: "user"
        email: "user@example.com"
```

**Included runbook** (`steps/create-user.yml`):
```yaml
desc: Create user with role
steps:
  - desc: Create user
    req: api
    post:
      path: /users
      body:
        application/json:
          email: "{{ vars.email }}"
          role: "{{ vars.role }}"
```

### GUI Usage

1. Click "Add Step"
2. Select "Include" (📁)
3. Fill in description
4. Enter path to included file
5. (Optional) Add variables:
   - Click "Add Variable"
   - Enter variable name and value
   - Click "Add" button
6. Click "Save"

### Best Practices

- **Organize by functionality**: `steps/auth.yml`, `steps/cleanup.yml`
- **Use variables for flexibility**: Pass user IDs, roles, etc.
- **Keep included files focused**: Each file should handle one logical flow
- **Document dependencies**: Note which variables the included file expects

## Bind Step (🔗)

### Purpose

Extract values from previous responses, generate dynamic values (UUIDs, timestamps), or set up variables for later steps.

### Fields

- **Description** (`desc`): Human-readable description of the step
- **Bindings** (`bind`): Key-value pairs where keys are variable names and values are expressions

### Example 1: Generate Dynamic Values

```yaml
steps:
  - desc: Generate test data
    bind:
      userId: faker.UUID()
      timestamp: faker.UnixTime()
      email: faker.Email()
```

GUI:
1. Add Bind step
2. Description: "Generate test data"
3. Bindings:
   - `userId` = `faker.UUID()`
   - `timestamp` = `faker.UnixTime()`
   - `email` = `faker.Email()`

### Example 2: Extract from Previous Response

```yaml
steps:
  - desc: Login
    req: api
    post:
      path: /login
      # ...

  - desc: Extract user info
    bind:
      token: steps[0].res.body.token
      userId: steps[0].res.body.user.id
      userName: steps[0].res.body.user.name
```

### Example 3: Computed Values

```yaml
steps:
  - desc: Compute derived values
    bind:
      fullUrl: vars.baseUrl + '/api/users/' + vars.userId
      expiresAt: Date.now() + 3600000  # 1 hour from now
      isAdmin: vars.role == 'admin'
```

### Faker Functions

Common faker functions available:

```javascript
faker.UUID()           // Generate UUID
faker.UnixTime()       // Current Unix timestamp
faker.Email()          // Random email
faker.Name()           // Random name
faker.Int(min, max)    // Random integer
faker.Float(min, max)  // Random float
faker.String(length)   // Random string
```

### Accessing Previous Steps

```javascript
// By index (0-based)
steps[0].res.body.token
steps[1].req.body.userId

// Current step
current.res.status

// Previous step
previous.res.body.data
```

### GUI Usage

1. Click "Add Step"
2. Select "Bind" (🔗)
3. Fill in description
4. Add bindings:
   - Enter variable name
   - Enter value expression (can be JSON)
   - Click "Add" button
5. For complex JSON values, use JSON textarea
6. Click "Save"

### Best Practices

- **Use for setup**: Generate IDs, timestamps before making requests
- **Extract important data**: Pull out tokens, IDs from responses
- **Compute derived values**: Combine variables for complex scenarios
- **Document faker usage**: Note which faker functions you're using

## Database Step (💾) - Coming Soon

### Purpose

Execute SQL queries against databases (PostgreSQL, MySQL, SQLite, etc.) to validate data or set up test fixtures.

### Planned Features

- Execute SELECT, INSERT, UPDATE, DELETE queries
- Bind query results to variables
- Support for multiple database types
- Transaction support

### Example (Planned)

```yaml
steps:
  - desc: Verify user in database
    db: postgres
    query: SELECT * FROM users WHERE id = $1
    params:
      - "{{ vars.userId }}"
    test: |
      current.rows.length == 1
    bind:
      userName: current.rows[0].name
```

## gRPC Step (📡) - Coming Soon

### Purpose

Make gRPC calls to test gRPC services.

### Planned Features

- Support for unary, client streaming, server streaming, bidirectional streaming
- Proto file loading
- Message serialization/deserialization

### Example (Planned)

```yaml
steps:
  - desc: Call gRPC GetUser
    grpc: user-service
    method: user.UserService/GetUser
    message:
      userId: "{{ vars.userId }}"
    test: |
      current.res.name != ""
```

## SSH Step (🖥️) - Coming Soon

### Purpose

Execute commands on remote servers via SSH.

### Planned Features

- Execute shell commands
- File transfers
- Multi-hop SSH

### Example (Planned)

```yaml
steps:
  - desc: Check service status
    ssh: production-server
    command: systemctl status myapp
    test: |
      current.stdout.includes('active (running)')
```

## CDP (Chrome DevTools Protocol) Step (🌍) - Coming Soon

### Purpose

Automate browser actions for end-to-end testing.

### Planned Features

- Navigate to URLs
- Click elements
- Fill forms
- Take screenshots
- Validate page content

### Example (Planned)

```yaml
steps:
  - desc: Login via browser
    cdp:
      navigate: https://example.com/login
      actions:
        - fill: '#username'
          value: 'testuser'
        - fill: '#password'
          value: 'secret'
        - click: '#login-button'
        - wait: '.dashboard'
      test: |
        current.url.includes('/dashboard')
```

## Exec Step (⚙️) - Coming Soon

### Purpose

Execute arbitrary shell commands or scripts.

### Planned Features

- Run shell commands
- Capture stdout/stderr
- Set environment variables

### Example (Planned)

```yaml
steps:
  - desc: Run cleanup script
    exec:
      command: ./scripts/cleanup.sh
      env:
        ENV: test
    test: |
      current.exitCode == 0
```

## Step Execution Order

Steps execute sequentially in the order they appear:

```yaml
steps:
  - desc: Step 1  # Executes first
  - desc: Step 2  # Executes second (can access step 1 data)
  - desc: Step 3  # Executes third (can access step 1 & 2 data)
```

## Variable Scope

Variables are accessible across steps:

```yaml
vars:
  baseUrl: https://api.example.com

steps:
  - desc: Login
    bind:
      token: "abc123"  # Available to later steps

  - desc: Get user
    req: api
    get:
      path: /user
      headers:
        Authorization: Bearer {{ vars.token }}  # Uses bound variable
```

---

For implementation details, see [architecture.md](architecture.md).
For component API reference, see [components.md](components.md).
