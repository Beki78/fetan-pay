import 'package:flutter_test/flutter_test.dart';
import 'package:fetan_pay/core/utils/transaction_validation.dart';

void main() {
  group('TransactionValidation', () {
    group('detectBankFromUrl', () {
      test('should detect CBE from URL', () {
        expect(
          TransactionValidation.detectBankFromUrl(
            'https://apps.cbe.com.et/?id=FT123',
          ),
          BankId.cbe,
        );
      });

      test('should detect Awash from URL', () {
        expect(
          TransactionValidation.detectBankFromUrl(
            'https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U',
          ),
          BankId.awash,
        );
      });

      test('should detect Telebirr from URL', () {
        expect(
          TransactionValidation.detectBankFromUrl(
            'https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL',
          ),
          BankId.telebirr,
        );
      });

      test('should detect BOA from URL', () {
        expect(
          TransactionValidation.detectBankFromUrl(
            'https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858',
          ),
          BankId.boa,
        );
      });

      test('should return null for unknown URL', () {
        expect(
          TransactionValidation.detectBankFromUrl('http://en.m.wikipedia.org'),
          null,
        );
      });
    });

    group('extractTransactionId', () {
      test('should extract CBE reference from URL', () {
        const url = 'https://apps.cbe.com.et:100/?id=FT253423SGLG32348645';
        const expected = 'FT253423SGLG32348645';

        final result = TransactionValidation.extractTransactionId(
          BankId.cbe,
          url,
        );
        expect(result, expected);
      });

      test('should extract Awash reference from URL', () {
        const url = 'https://awashpay.awashbank.com:8225/-2H1TUKXUG1-36WJ2U';
        const expected = '-2H1TUKXUG1-36WJ2U';

        final result = TransactionValidation.extractTransactionId(
          BankId.awash,
          url,
        );
        expect(result, expected);
      });

      test('should extract Telebirr reference from URL', () {
        const url =
            'https://transactioninfo.ethiotelecom.et/receipt/CL37MBRPQL';
        const expected = 'CL37MBRPQL';

        final result = TransactionValidation.extractTransactionId(
          BankId.telebirr,
          url,
        );
        expect(result, expected);
      });

      test('should extract BOA reference from URL', () {
        const url =
            'https://cs.bankofabyssinia.com/slip/?trx=FT250559L4W725858';
        const expected = 'FT250559L4W725858';

        final result = TransactionValidation.extractTransactionId(
          BankId.boa,
          url,
        );
        expect(result, expected);
      });

      test('should return input if already a valid reference', () {
        const reference = 'FT253423SGLG32348645';

        final result = TransactionValidation.extractTransactionId(
          BankId.cbe,
          reference,
        );
        expect(result, reference);
      });

      test('should return input as-is for invalid URL (like Wikipedia)', () {
        const url = 'http://en.m.wikipedia.org';

        final result = TransactionValidation.extractTransactionId(
          BankId.cbe,
          url,
        );
        expect(result, url);
      });
    });

    group('validateTransactionInput', () {
      test('should validate CBE reference successfully', () {
        const reference = 'FT253423SGLG32348645';

        final result = TransactionValidation.validateTransactionInput(
          BankId.cbe,
          reference,
        );
        expect(result.isValid, true);
        expect(result.transactionId, reference);
        expect(result.error, null);
      });

      test('should validate CBE URL successfully', () {
        const url = 'https://apps.cbe.com.et:100/?id=FT253423SGLG32348645';
        const expectedReference = 'FT253423SGLG32348645';

        final result = TransactionValidation.validateTransactionInput(
          BankId.cbe,
          url,
        );
        expect(result.isValid, true);
        expect(result.transactionId, expectedReference);
        expect(result.error, null);
      });

      test('should fail validation for invalid CBE reference format', () {
        const invalidReference = 'INVALID123';

        final result = TransactionValidation.validateTransactionInput(
          BankId.cbe,
          invalidReference,
        );
        expect(result.isValid, false);
        expect(result.error, contains('Invalid CBE transaction ID format'));
      });

      test('should fail validation for Wikipedia URL', () {
        const url = 'http://en.m.wikipedia.org';

        final result = TransactionValidation.validateTransactionInput(
          BankId.cbe,
          url,
        );
        expect(result.isValid, false);
        expect(result.error, contains('Invalid CBE transaction ID format'));
      });

      test('should detect bank from URL when bankId is null', () {
        const url = 'https://apps.cbe.com.et:100/?id=FT253423SGLG32348645';
        const expectedReference = 'FT253423SGLG32348645';

        final result = TransactionValidation.validateTransactionInput(
          null,
          url,
        );
        expect(result.isValid, true);
        expect(result.transactionId, expectedReference);
        expect(result.error, null);
      });

      test('should fail when no bank detected and bankId is null', () {
        const url = 'http://en.m.wikipedia.org';

        final result = TransactionValidation.validateTransactionInput(
          null,
          url,
        );
        expect(result.isValid, false);
        expect(result.error, contains('Unable to detect bank from URL'));
      });
    });

    group('utility methods', () {
      test('should convert BankId to string', () {
        expect(TransactionValidation.bankIdToString(BankId.cbe), 'cbe');
        expect(TransactionValidation.bankIdToString(BankId.boa), 'boa');
        expect(TransactionValidation.bankIdToString(BankId.awash), 'awash');
        expect(
          TransactionValidation.bankIdToString(BankId.telebirr),
          'telebirr',
        );
      });

      test('should convert string to BankId', () {
        expect(TransactionValidation.stringToBankId('cbe'), BankId.cbe);
        expect(TransactionValidation.stringToBankId('CBE'), BankId.cbe);
        expect(TransactionValidation.stringToBankId('boa'), BankId.boa);
        expect(TransactionValidation.stringToBankId('awash'), BankId.awash);
        expect(
          TransactionValidation.stringToBankId('telebirr'),
          BankId.telebirr,
        );
        expect(TransactionValidation.stringToBankId('invalid'), null);
      });

      test('should get provider from BankId', () {
        expect(TransactionValidation.getProviderFromBankId(BankId.cbe), 'CBE');
        expect(TransactionValidation.getProviderFromBankId(BankId.boa), 'BOA');
        expect(
          TransactionValidation.getProviderFromBankId(BankId.awash),
          'AWASH',
        );
        expect(
          TransactionValidation.getProviderFromBankId(BankId.telebirr),
          'TELEBIRR',
        );
      });
    });
  });
}
