import 'package:flutter_test/flutter_test.dart';
import 'package:fetan_pay/features/history/data/models/history_models.dart';

void main() {
  group('VerificationHistoryItem', () {
    test('should parse API response correctly', () {
      // Arrange - Using the actual API response format
      final json = {
        'id': 'ca1a8de6-9064-42a4-8873-4a600fb6258e',
        'merchantId': 'seed_test_merchant',
        'orderId': 'f5e24cde-76b2-4c5f-b809-3bef2989292d',
        'transactionId': null,
        'provider': 'CBE',
        'reference': 'FT26008RB6TM',
        'claimedAmount': '10000',
        'tipAmount': '100',
        'receiverAccountId': '9ae2fd70-6521-4c4f-b9d0-9bb61c7eaa65',
        'status': 'VERIFIED',
        'verifiedAt': '2026-01-10T12:54:13.596Z',
        'verifiedById': 'seed_merchant_user_waiter',
        'mismatchReason': null,
        'verificationPayload': {
          'date': '2026-01-08T13:59:00.000Z',
          'payer': 'Ephrem Belayneh Hailu',
          'amount': 10000,
          'reason': 'pay done via Mobile',
          'success': true,
          'receiver': 'Bamlak Feleke Sugamo',
          'reference': 'FT26008RB6TM',
          'payerAccount': '1****5774',
          'receiverAccount': '1****0328',
        },
        'walletCharged': false,
        'walletChargeAmount': null,
        'walletTransactionId': null,
        'createdAt': '2026-01-10T11:53:15.730Z',
        'updatedAt': '2026-01-10T12:54:13.643Z',
        'receiverAccount': {
          'id': '9ae2fd70-6521-4c4f-b9d0-9bb61c7eaa65',
          'merchantId': 'seed_test_merchant',
          'provider': 'CBE',
          'status': 'ACTIVE',
          'receiverLabel': 'CBE Merchant Receiver',
          'receiverAccount': '1000473730328',
          'receiverName': 'BAMLAK FELEKE SUGAMO',
          'meta': null,
          'createdAt': '2026-01-10T11:36:05.905Z',
          'updatedAt': '2026-01-10T12:04:01.357Z',
        },
        'verifiedBy': {
          'id': 'seed_merchant_user_waiter',
          'name': 'Test Waiter',
          'email': 'waiter@test.com',
          'role': 'WAITER',
          'user': {
            'id': 'seed_waiter_1768044231649',
            'email': 'waiter@test.com',
            'name': 'Test Waiter',
          },
        },
      };

      // Act
      final historyItem = VerificationHistoryItem.fromJson(json);

      // Assert
      expect(historyItem.id, equals('ca1a8de6-9064-42a4-8873-4a600fb6258e'));
      expect(historyItem.provider, equals('CBE'));
      expect(historyItem.reference, equals('FT26008RB6TM'));
      expect(historyItem.claimedAmount, equals(10000.0));
      expect(historyItem.tipAmount, equals(100.0));
      expect(historyItem.status, equals('VERIFIED'));
      expect(historyItem.walletCharged, equals(false));
      expect(historyItem.receiverAccount, isNotNull);
      expect(historyItem.verifiedBy, isNotNull);
      expect(historyItem.verifiedBy!.name, equals('Test Waiter'));
    });

    test('should handle null tipAmount correctly', () {
      // Arrange
      final json = {
        'id': 'test-id',
        'merchantId': 'test-merchant',
        'orderId': 'test-order',
        'provider': 'CBE',
        'reference': 'TEST123',
        'claimedAmount': '5000',
        'tipAmount': null,
        'receiverAccountId': 'test-receiver',
        'status': 'UNVERIFIED',
        'walletCharged': false,
        'createdAt': '2026-01-10T11:53:15.730Z',
        'updatedAt': '2026-01-10T12:54:13.643Z',
      };

      // Act
      final historyItem = VerificationHistoryItem.fromJson(json);

      // Assert
      expect(historyItem.tipAmount, isNull);
      expect(historyItem.claimedAmount, equals(5000.0));
    });

    test('should handle numeric amounts correctly', () {
      // Arrange
      final json = {
        'id': 'test-id',
        'merchantId': 'test-merchant',
        'orderId': 'test-order',
        'provider': 'CBE',
        'reference': 'TEST123',
        'claimedAmount': 5000,
        'tipAmount': 250,
        'receiverAccountId': 'test-receiver',
        'status': 'VERIFIED',
        'walletCharged': false,
        'createdAt': '2026-01-10T11:53:15.730Z',
        'updatedAt': '2026-01-10T12:54:13.643Z',
      };

      // Act
      final historyItem = VerificationHistoryItem.fromJson(json);

      // Assert
      expect(historyItem.claimedAmount, equals(5000.0));
      expect(historyItem.tipAmount, equals(250.0));
    });
  });

  group('ListVerificationHistoryResponse', () {
    test('should parse list response correctly', () {
      // Arrange
      final json = {
        'page': 1,
        'pageSize': 20,
        'total': 2,
        'data': [
          {
            'id': 'item1',
            'merchantId': 'merchant1',
            'orderId': 'order1',
            'provider': 'CBE',
            'reference': 'REF1',
            'claimedAmount': '1000',
            'tipAmount': '50',
            'receiverAccountId': 'receiver1',
            'status': 'VERIFIED',
            'walletCharged': false,
            'createdAt': '2026-01-10T11:53:15.730Z',
            'updatedAt': '2026-01-10T12:54:13.643Z',
          },
          {
            'id': 'item2',
            'merchantId': 'merchant1',
            'orderId': 'order2',
            'provider': 'BOA',
            'reference': 'REF2',
            'claimedAmount': '2000',
            'tipAmount': null,
            'receiverAccountId': 'receiver2',
            'status': 'UNVERIFIED',
            'walletCharged': false,
            'createdAt': '2026-01-10T11:53:15.730Z',
            'updatedAt': '2026-01-10T12:54:13.643Z',
          },
        ],
      };

      // Act
      final response = ListVerificationHistoryResponse.fromJson(json);

      // Assert
      expect(response.page, equals(1));
      expect(response.pageSize, equals(20));
      expect(response.total, equals(2));
      expect(response.data.length, equals(2));
      expect(response.data[0].provider, equals('CBE'));
      expect(response.data[1].provider, equals('BOA'));
      expect(response.data[0].tipAmount, equals(50.0));
      expect(response.data[1].tipAmount, isNull);
    });
  });
}
