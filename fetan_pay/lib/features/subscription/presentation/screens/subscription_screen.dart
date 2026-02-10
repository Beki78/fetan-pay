import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../../core/di/injection_container.dart';
import '../../../auth/data/services/session_manager.dart';
import '../bloc/subscription_bloc.dart';
import '../bloc/subscription_event.dart';
import '../bloc/subscription_state.dart';
import '../../data/models/subscription_models.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  String? merchantId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final user = await getIt<SessionManager>().getUser();
    merchantId = user?.merchantId;

    if (merchantId != null && mounted) {
      context.read<SubscriptionBloc>()
        ..add(const LoadPublicPlansEvent())
        ..add(LoadMerchantSubscriptionEvent(merchantId: merchantId!))
        ..add(LoadBillingTransactionsEvent(merchantId: merchantId!));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Subscription'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black87,
      ),
      body: BlocConsumer<SubscriptionBloc, SubscriptionState>(
        listener: (context, state) {
          if (state is SubscriptionUpgradeSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
              ),
            );
            // Reload subscription data
            if (merchantId != null) {
              context.read<SubscriptionBloc>()
                ..add(
                  LoadMerchantSubscriptionEvent(
                    merchantId: merchantId!,
                    forceRefresh: true,
                  ),
                )
                ..add(LoadBillingTransactionsEvent(merchantId: merchantId!));
            }
          } else if (state is SubscriptionUpgradeError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is SubscriptionLoading || state is SubscriptionUpgrading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is SubscriptionError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 16, color: Colors.red),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _loadData,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          if (state is SubscriptionLoaded) {
            return RefreshIndicator(
              onRefresh: () async {
                if (merchantId != null) {
                  context.read<SubscriptionBloc>()
                    ..add(const LoadPublicPlansEvent(forceRefresh: true))
                    ..add(
                      LoadMerchantSubscriptionEvent(
                        merchantId: merchantId!,
                        forceRefresh: true,
                      ),
                    )
                    ..add(
                      LoadBillingTransactionsEvent(merchantId: merchantId!),
                    );
                }
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (state.subscription != null)
                      _buildCurrentPlanCard(state.subscription!)
                    else
                      _buildNoSubscriptionCard(),
                    const SizedBox(height: 24),
                    _buildPlansSection(state.plans, state.subscription),
                    if (state.transactions.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      _buildBillingHistory(state.transactions),
                    ],
                  ],
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildCurrentPlanCard(Subscription subscription) {
    final usageValue = subscription.getUsageValue('verifications_monthly');
    final limit =
        subscription.plan.verificationLimit ??
        subscription.plan.limits?['verifications_monthly'] as int? ??
        0;
    final usagePercentage = limit > 0
        ? (usageValue / limit * 100).clamp(0, 100)
        : 0.0;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        subscription.plan.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subscription.plan.description,
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(subscription.status),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    subscription.status.name.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Usage Stats
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'Verifications Used',
                    '$usageValue / ${limit > 0 ? limit : "Unlimited"}',
                    Icons.verified_user,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    subscription.isInTrial ? 'Trial Days' : 'Days Remaining',
                    '${subscription.daysRemaining ?? "∞"}',
                    Icons.calendar_today,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    'Monthly Price',
                    subscription.plan.name == 'Free'
                        ? 'Free'
                        : 'ETB ${subscription.monthlyPrice.toStringAsFixed(0)}',
                    Icons.attach_money,
                    Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    subscription.nextBillingDate != null
                        ? 'Next Billing'
                        : 'Started',
                    subscription.nextBillingDate != null
                        ? DateFormat(
                            'MMM dd',
                          ).format(subscription.nextBillingDate!)
                        : DateFormat('MMM dd').format(subscription.startDate),
                    Icons.event,
                    Colors.purple,
                  ),
                ),
              ],
            ),
            if (limit > 0) ...[
              const SizedBox(height: 16),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: usagePercentage / 100,
                  minHeight: 8,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    usagePercentage > 80 ? Colors.red : Colors.blue,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${limit - usageValue} verifications remaining',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoSubscriptionCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(Icons.info_outline, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text(
              'No Active Subscription',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Choose a plan below to start verifying payments',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlansSection(
    List<Plan> plans,
    Subscription? currentSubscription,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          currentSubscription != null
              ? 'Upgrade Your Plan'
              : 'Choose Your Plan',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Select the plan that best fits your business needs',
          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
        ),
        const SizedBox(height: 16),
        ...plans.map((plan) => _buildPlanCard(plan, currentSubscription)),
      ],
    );
  }

  Widget _buildPlanCard(Plan plan, Subscription? currentSubscription) {
    final isCurrentPlan = currentSubscription?.planId == plan.id;

    return Card(
      elevation: plan.isPopular ? 4 : 1,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: plan.isPopular
            ? const BorderSide(color: Colors.purple, width: 2)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    plan.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (plan.isPopular)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.purple,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'POPULAR',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                if (isCurrentPlan)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'CURRENT',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              plan.description,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  plan.price == 0 && plan.name != 'Free'
                      ? 'Custom'
                      : 'ETB ${plan.price.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (plan.price > 0 || plan.name == 'Free')
                  Text(
                    ' /${plan.billingCycle.name}',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            ...plan.features.map(
              (feature) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    const Icon(
                      Icons.check_circle,
                      size: 18,
                      color: Colors.green,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        feature,
                        style: const TextStyle(fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isCurrentPlan
                    ? null
                    : () {
                        // Show payment reference input dialog
                        _showUpgradeDialog(context, plan);
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: plan.isPopular ? Colors.purple : null,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  isCurrentPlan
                      ? 'Current Plan'
                      : plan.price == 0 && plan.name != 'Free'
                      ? 'Contact Sales'
                      : 'Upgrade Now',
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBillingHistory(List<BillingTransaction> transactions) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Billing History',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        ...transactions.map(
          (transaction) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: _getTransactionStatusColor(transaction.status),
                child: const Icon(Icons.receipt, color: Colors.white, size: 20),
              ),
              title: Text(
                transaction.plan.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                '${DateFormat('MMM dd, yyyy').format(transaction.billingPeriodStart)} - ${DateFormat('MMM dd, yyyy').format(transaction.billingPeriodEnd)}',
                style: const TextStyle(fontSize: 12),
              ),
              trailing: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${transaction.currency} ${transaction.amount.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: _getTransactionStatusColor(
                        transaction.status,
                      ).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      transaction.status,
                      style: TextStyle(
                        fontSize: 10,
                        color: _getTransactionStatusColor(transaction.status),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(SubscriptionStatus status) {
    switch (status) {
      case SubscriptionStatus.active:
        return Colors.green;
      case SubscriptionStatus.cancelled:
        return Colors.orange;
      case SubscriptionStatus.expired:
        return Colors.red;
      case SubscriptionStatus.suspended:
        return Colors.grey;
      case SubscriptionStatus.pending:
        return Colors.blue;
    }
  }

  Color _getTransactionStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'FAILED':
        return Colors.red;
      case 'EXPIRED':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  void _showUpgradeDialog(BuildContext context, Plan plan) {
    final paymentReferenceController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('Upgrade to ${plan.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Plan: ${plan.name}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Price: ETB ${plan.price.toStringAsFixed(0)}'),
            const SizedBox(height: 16),
            const Text(
              'Please make the payment and enter your transaction reference:',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: paymentReferenceController,
              decoration: const InputDecoration(
                labelText: 'Payment Reference',
                hintText: 'e.g., FT24123ABC456',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'After making the payment, enter the transaction reference from your receipt.',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final reference = paymentReferenceController.text.trim();
              if (reference.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please enter payment reference'),
                    backgroundColor: Colors.orange,
                  ),
                );
                return;
              }

              Navigator.of(dialogContext).pop();

              // Trigger upgrade
              if (merchantId != null) {
                context.read<SubscriptionBloc>().add(
                  UpgradeMerchantPlanEvent(
                    merchantId: merchantId!,
                    planId: plan.id,
                    paymentReference: reference,
                    paymentMethod: 'Manual Payment',
                  ),
                );
              }
            },
            child: const Text('Upgrade'),
          ),
        ],
      ),
    );
  }
}
