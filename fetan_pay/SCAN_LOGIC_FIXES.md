# Flutter App Scan Logic Fixes

## Issues Identified

### 1. **Wrong API Endpoint**
- **Problem**: Flutter app was using `/payments/verify-merchant-payment` 
- **Solution**: Changed to `/payments/verify` to match merchant web app
- **File**: `fetan_pay/lib/core/config/api_config.dart`

### 2. **Poor Reference Extraction Logic**
- **Problem**: When QR code scanning failed to extract reference, app fell back to sending raw URL (e.g., "http://en.m.wikipedia.org") as transaction reference
- **Root Cause**: Weak regex patterns and fallback logic in `scan_bloc.dart`
- **Impact**: Backend API received invalid references, causing verification failures

## Solutions Implemented

### 1. **Fixed API Endpoint**
```dart
// OLD (incorrect)
static const String verifyMerchantPayment = '$apiBaseUrl/payments/verify-merchant-payment';

// NEW (correct - matches merchant web app)
static const String verifyMerchantPayment = '$apiBaseUrl/payments/verify';
```

### 2. **Created Robust Transaction Validation Utility**
- **File**: `fetan_pay/lib/core/utils/transaction_validation.dart`
- **Based on**: Merchant web app's validation logic (`merchant/src/lib/validation.ts`)
- **Features**:
  - Proper URL parsing with multiple regex patterns per bank
  - Bank detection from URL patterns
  - Transaction reference extraction and validation
  - Format validation for each bank's transaction ID patterns

### 3. **Updated Scan Logic**
- **File**: `fetan_pay/lib/features/scan/presentation/bloc/scan_bloc.dart`
- **Changes**:
  - Replaced weak helper methods with robust validation utility
  - Added proper error handling for invalid QR codes
  - Added validation for manual transaction reference entry
  - Improved logging for debugging

## Bank-Specific URL Patterns Supported

### CBE (Commercial Bank of Ethiopia)
- **URL Pattern**: `https://apps.cbe.com.et:100/?id=FT253423SGLG32348645`
- **Reference Format**: `FT` + 10+ alphanumeric characters
- **Extraction**: Looks for `id=` parameter in URL

### BOA (Bank of Abyssinia)
- **URL Pattern**: `https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858`
- **Reference Format**: `FT` + 10+ alphanumeric characters
- **Extraction**: Looks for `trx=` parameter in URL

### Awash Bank
- **URL Pattern**: `https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U`
- **Reference Format**: 8+ alphanumeric characters with optional dashes
- **Extraction**: Extracts from URL path after domain

### Telebirr
- **URL Pattern**: `https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL`
- **Reference Format**: 6+ alphanumeric characters
- **Extraction**: Extracts from `/receipt/` path

## Key Improvements

### 1. **Proper Error Handling**
- No more fallback to raw URLs
- Clear error messages for invalid QR codes
- Validation before sending to API

### 2. **Better Logging**
- Debug logs show extraction process
- Clear success/failure indicators
- Reference extraction details

### 3. **Validation for Manual Entry**
- Manual transaction references are also validated
- Same validation logic for both QR scan and manual entry
- Proper error messages for invalid formats

## Example Scenarios

### Before Fix (Problematic)
```
QR Code: "http://en.m.wikipedia.org"
Extraction: Failed (no pattern match)
Fallback: Send raw URL to API
API Request: { provider: "CBE", reference: "http://en.m.wikipedia.org" }
API Response: { status: "UNVERIFIED", checks: { referenceFound: false } }
```

### After Fix (Correct)
```
QR Code: "http://en.m.wikipedia.org"
Validation: Failed (no bank detected)
Result: Show error to user "Unable to detect bank from QR code"
API Request: Not sent (validation prevents invalid requests)
```

### Valid QR Code Example
```
QR Code: "https://apps.cbe.com.et:100/?id=FT253423SGLG32348645"
Bank Detection: CBE
Reference Extraction: "FT253423SGLG32348645"
Validation: Passed (valid CBE format)
API Request: { provider: "CBE", reference: "FT253423SGLG32348645" }
API Response: { status: "VERIFIED", ... }
```

## Testing

Created comprehensive unit tests in `test/core/utils/transaction_validation_test.dart`:
- Bank detection from URLs
- Reference extraction for all banks
- Validation of transaction formats
- Error handling for invalid inputs
- Utility method functionality

## Files Modified

1. `fetan_pay/lib/core/config/api_config.dart` - Fixed API endpoint
2. `fetan_pay/lib/core/utils/transaction_validation.dart` - New validation utility
3. `fetan_pay/lib/features/scan/presentation/bloc/scan_bloc.dart` - Updated scan logic
4. `fetan_pay/test/core/utils/transaction_validation_test.dart` - Added tests

## Impact

- ✅ No more invalid API requests with raw URLs
- ✅ Proper transaction reference extraction
- ✅ Better user experience with clear error messages
- ✅ Consistent validation logic with merchant web app
- ✅ Improved debugging with better logging
- ✅ Comprehensive test coverage

The Flutter app now properly extracts transaction references from QR codes and validates them before sending to the API, eliminating the issue where raw URLs like "http://en.m.wikipedia.org" were being sent as transaction references.