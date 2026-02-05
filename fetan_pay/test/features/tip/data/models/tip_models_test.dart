import 'package:flutter_test/flutter_test.dart';
import 'package:fetan_pay/features/tip/data/models/tip_models.dart';

void main() {
  group('TipItem', () {
    test('should parse string amounts correctly', () {
      // Arrange
      final json = {
        'id': 'test-id',
        'tipAmount': '100',
        'claimedAmount': '10000',
        'reference': 'FT26008RB6TM',
        'provider': 'CBE',
        'status': 'VERIFIED',
        'createdAt': '2026-01-10T11:53:15.730Z',
        'verifiedAt': '2026-01-10T12:54:13.596Z',
        'verifiedBy': {
          'id': 'seed_merchant_user_waiter',
          'name': 'Test Waiter',
          'email': 'waiter@test.com',
          'role': 'WAITER',
        },
      };

      // Act
      final tipItem = TipItem.fromJson(json);

      // Assert
      expect(tipItem.tipAmount, equals(100.0));
      expect(tipItem.claimedAmount, equals(10000.0));
      expect(tipItem.reference, equals('FT26008RB6TM'));
      expect(tipItem.provider, equals('CBE'));
      expect(tipItem.status, equals('VERIFIED'));
    });

    test('should parse numeric amounts correctly', () {
      // Arrange
      final json = {
        'id': 'test-id',
        'tipAmount': 100,
        'claimedAmount': 10000,
        'reference': 'FT26008RB6TM',
        'provider': 'CBE',
        'status': 'VERIFIED',
        'createdAt': '2026-01-10T11:53:15.730Z',
      };

      // Act
      final tipItem = TipItem.fromJson(json);

      // Assert
      expect(tipItem.tipAmount, equals(100.0));
      expect(tipItem.claimedAmount, equals(10000.0));
    });

    test('should handle invalid amounts gracefully', () {
      // Arrange
      final json = {
        'id': 'test-id',
        'tipAmount': 'invalid',
        'claimedAmount': null,
        'reference': 'FT26008RB6TM',
        'provider': 'CBE',
        'status': 'VERIFIED',
        'createdAt': '2026-01-10T11:53:15.730Z',
      };

      // Act
      final tipItem = TipItem.fromJson(json);

      // Assert
      expect(tipItem.tipAmount, equals(0.0));
      expect(tipItem.claimedAmount, equals(0.0));
    });
  });

  group('TipsSummary', () {
    test('should parse string totalTipAmount correctly', () {
      // Arrange
      final json = {'count': 5, 'totalTipAmount': '500.50'};

      // Act
      final summary = TipsSummary.fromJson(json);

      // Assert
      expect(summary.count, equals(5));
      expect(summary.totalTipAmount, equals(500.50));
    });

    test('should parse numeric totalTipAmount correctly', () {
      // Arrange
      final json = {'count': 5, 'totalTipAmount': 500.50};

      // Act
      final summary = TipsSummary.fromJson(json);

      // Assert
      expect(summary.count, equals(5));
      expect(summary.totalTipAmount, equals(500.50));
    });
  });
}
