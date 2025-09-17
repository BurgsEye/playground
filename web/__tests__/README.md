# JIRA Integration Test Suite

This directory contains comprehensive tests for the JIRA integration functionality.

## 🧪 Test Types

### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and logic in isolation
- **Dependencies**: None (no external APIs)
- **Speed**: Fast (< 1 second)
- **Files**: `jira-logic.test.ts`

**Run**: `npm run test:unit`

### 2. Integration Tests (`tests/integration/`)
- **Purpose**: Test actual Edge Function endpoints with real JIRA API
- **Dependencies**: Real JIRA instance, Supabase Edge Function
- **Speed**: Slow (10-30 seconds)
- **Files**: `jira-edge-function-readonly.test.ts`

**Run**: `npm run test:integration-readonly`

### 3. Mock Tests (`tests/mock/`)
- **Purpose**: Test logic with mocked API responses
- **Dependencies**: None (mocked fetch)
- **Speed**: Fast (< 1 second)
- **Files**: `jira-mock.test.ts`

**Run**: `npm run test:mock`

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration-readonly

# Mock tests only
npm run test:mock
```

### Watch Mode
```bash
# Run tests in watch mode
npm run test:watch
```

### Coverage Report
```bash
# Generate coverage report
npm run test:coverage
```

### CI Mode
```bash
# Run tests for CI/CD
npm run test:ci
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the web directory:

```bash
# Test environment variables
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# JIRA Test Configuration
NEXT_PUBLIC_JIRA_URL=https://your-domain.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=your-email@domain.com
NEXT_PUBLIC_JIRA_API_TOKEN=your-api-token
NEXT_PUBLIC_JIRA_PROJECT_KEY=YOUR_PROJECT_KEY
NEXT_PUBLIC_JIRA_CLUSTERING_STATUS=Ready For Clustering
```

### Jest Configuration

The tests use the configuration in `jest.config.js`:

- **TypeScript support** with ts-jest
- **30-second timeout** for integration tests
- **Coverage collection** from src directory
- **Setup file** for environment configuration

## 📊 Test Coverage

The test suite covers:

### ✅ Unit Tests
- JQL query building
- URL construction
- Authentication header building
- Response processing
- Error handling
- Ticket creation payloads

### ✅ Integration Tests
- Connection testing
- Ticket retrieval
- Ticket search with JQL
- Error handling
- Performance testing

### ✅ Mock Tests
- Successful API responses
- Error responses
- Network failures
- Timeout handling
- Malformed JSON

## 🔧 Adding New Tests

### Unit Test Example
```typescript
describe('New Feature', () => {
  test('should do something', () => {
    const result = someFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example
```typescript
test('should call new endpoint', async () => {
  if (skipTests) {
    console.log('Skipping tests - credentials not provided');
    return;
  }
  const { response, data } = await makeRequest('new-endpoint', {
    // test data
  });

  expect(response.ok).toBe(true);
  expect(data.success).toBe(true);
});
```

### Mock Test Example
```typescript
test('should handle new API response', async () => {
  const mockResponse = {
    ok: true,
    json: async () => ({ result: 'success' })
  };

  (fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

  const response = await fetch('https://api.example.com/endpoint');
  const data = await response.json();

  expect(data.result).toBe('success');
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Integration tests failing**
   - Check JIRA credentials
   - Verify Edge Function is deployed
   - Check network connectivity

2. **Mock tests failing**
   - Verify fetch is properly mocked
   - Check mock response format
   - Ensure async/await is used correctly

3. **Unit tests failing**
   - Check function logic
   - Verify expected vs actual values
   - Check test data setup

### Debug Mode

Run tests with verbose output:
```bash
npm test -- --verbose
```

### Skip Integration Tests

To skip slow integration tests:
```bash
npm test -- --testPathIgnorePatterns=integration
```

## 📈 Best Practices

1. **Write unit tests first** - they're fast and reliable
2. **Use mocks for external dependencies** - keeps tests isolated
3. **Test error cases** - don't just test happy paths
4. **Keep integration tests minimal** - they're slow and brittle
5. **Use descriptive test names** - makes failures easier to debug
6. **Clean up after tests** - avoid test pollution
7. **Test edge cases** - empty results, invalid inputs, etc.

## 🔗 Related Files

- `jest.config.js` - Jest configuration
- `tests/setup.ts` - Test setup and environment
- `package.json` - Test scripts and dependencies
- `supabase/functions/jira-integration/index.ts` - Edge Function being tested
