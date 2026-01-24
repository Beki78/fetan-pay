import 'package:flutter/material.dart';

enum BankId {
  cbe,
  boa,
  awash,
  telebirr,
}

class Bank {
  final BankId id;
  final String name;
  final String fullName;
  final Color color;
  final String imagePath;

  const Bank({
    required this.id,
    required this.name,
    required this.fullName,
    required this.color,
    required this.imagePath,
  });
}

const List<Bank> banks = [
  Bank(
    id: BankId.cbe,
    name: 'CBE',
    fullName: 'Commercial Bank of Ethiopia',
    color: Color(0xFF1E40AF),
    imagePath: 'assets/images/banks/CBE.png',
  ),
  Bank(
    id: BankId.boa,
    name: 'BOA',
    fullName: 'Bank of Abyssinia',
    color: Color(0xFF15803D),
    imagePath: 'assets/images/banks/BOA.png',
  ),
  Bank(
    id: BankId.awash,
    name: 'Awash',
    fullName: 'Awash International Bank',
    color: Color(0xFFEA580C),
    imagePath: 'assets/images/banks/Awash.png',
  ),
  Bank(
    id: BankId.telebirr,
    name: 'TeleBirr',
    fullName: 'TeleBirr',
    color: Color(0xFFDC2626),
    imagePath: 'assets/images/banks/Telebirr.png',
  ),
];

class BankSelection extends StatelessWidget {
  final BankId? selectedBank;
  final ValueChanged<BankId> onBankSelected;

  const BankSelection({
    super.key,
    this.selectedBank,
    required this.onBankSelected,
  });

  int _getResponsiveCrossAxisCount(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    if (screenWidth < 600) {
      return 2; // Mobile: 2 columns
    } else {
      return 3; // Tablet+: 3 columns
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Bank Account',
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Choose the bank account where you want to receive payments',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: _getResponsiveCrossAxisCount(context),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
          ),
          itemCount: banks.length,
          itemBuilder: (context, index) {
            final bank = banks[index];
            final isSelected = selectedBank == bank.id;

            return GestureDetector(
              onTap: () => onBankSelected(bank.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.cardTheme.color,
                  border: Border.all(
                    color: isSelected
                        ? bank.color
                        : theme.colorScheme.outline.withOpacity(0.3),
                    width: isSelected ? 2 : 1,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: bank.color.withOpacity(0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: bank.color.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: ClipOval(
                          child: Image.asset(
                            bank.imagePath,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              // Fallback to icon if image fails to load
                              return Icon(
                                Icons.account_balance,
                                color: bank.color,
                                size: 28,
                              );
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        bank.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                          color: isSelected
                              ? bank.color
                              : theme.colorScheme.onSurface,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      
                    ],
                  ),
                ),
                ),
              );
          },
        ),
      ],
    );
  }
}
